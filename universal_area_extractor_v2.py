#!/usr/bin/env python3
"""
Universal Area Extractor v2 - Pattern Agnostic with Smart Filtering

Extracts room areas from ANY German CAD-generated PDF regardless of
what label is used. Filters out non-area measurements (perimeter, height, etc.)

Core principle: Find m² values that represent ROOM AREAS (not perimeter, height, etc.)
"""

import re
import fitz  # PyMuPDF
from dataclasses import dataclass
from typing import List, Dict, Any
from collections import defaultdict


@dataclass
class Room:
    """Extracted room with area."""
    room_id: str
    room_name: str
    area_m2: float
    page: int
    source_text: str
    line_index: int
    category: str = "other"

    def to_dict(self) -> Dict:
        return {
            "room_number": self.room_id,
            "room_name": self.room_name,
            "area_m2": self.area_m2,
            "counted_m2": self.area_m2,
            "factor": 1.0,
            "page": self.page,
            "source_text": self.source_text,
            "category": self.category,
            "extraction_pattern": "universal_v2",
        }


def parse_german_number(s: str) -> float:
    """Parse German number format."""
    s = s.strip()
    if ',' in s and '.' in s:
        s = s.replace('.', '').replace(',', '.')
    elif ',' in s:
        s = s.replace(',', '.')
    return float(s)


def categorize_room(name: str) -> str:
    """Categorize room by name."""
    name_lower = name.lower()
    categories = {
        "office": ["büro", "office", "nutzungseinheit", "back office", "besprechung", "konferenz"],
        "residential": ["schlafen", "wohnen", "essen", "kochen", "zimmer", "küche", "wohnung"],
        "circulation": ["flur", "diele", "schleuse", "vorraum", "eingang", "lobby", "foyer", "gang"],
        "stairs": ["treppe", "treppenhaus", "trh", "staircase"],
        "elevators": ["aufzug", "lift", "aufzugsschacht", "fahrstuhl"],
        "shafts": ["schacht", "lüftung", "medien", "druckbelüftung", "installationsschacht"],
        "technical": ["elektro", "technik", "hwr", "it verteiler", "elt", "glt", "fiz", "server"],
        "sanitary": ["wc", "bad", "dusche", "gästebad", "umkleide", "sanitär", "toilette"],
        "storage": ["lager", "abstellraum", "müll", "fahrrad", "keller", "archiv"],
        "outdoor": ["balkon", "terrasse", "loggia", "dachterrasse", "freisitz", "außen"],
    }
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in name_lower:
                return cat
    return "other"


class UniversalAreaExtractor:
    """
    Pattern-agnostic area extractor with smart filtering.

    Key insight: AREA labels typically contain:
    - NGF, NRF, BGF, GF, NF, WF (German area abbreviations)
    - F, Fläche, Fl, FL (German "area")
    - A, Area (English)

    NON-AREA labels to EXCLUDE:
    - U, Um, Umfang (perimeter)
    - LH, LRH, H, Höhe (height)
    - OK, UK, OKFF, UKRD (elevation markers)
    - L, Länge (length)
    - B, Breite (width) - careful, B.xx.xx is room ID
    """

    # Labels that indicate AREA measurements
    AREA_LABELS = {
        'ngf', 'nrf', 'bgf', 'gf', 'nf', 'wf', 'hf', 'kf',  # German area types
        'f', 'fläche', 'fl', 'flaeche',  # German "area"
        'a', 'area',  # English
        'nutzfläche', 'wohnfläche', 'grundfläche', 'raumfläche',
    }

    # Labels that are NOT area (exclude these)
    NON_AREA_LABELS = {
        'u', 'um', 'umfang',  # Perimeter
        'lh', 'lrh', 'h', 'höhe', 'hoehe', 'rh',  # Height
        'ok', 'uk', 'okff', 'ukrd', 'ukfd', 'okrf',  # Elevation markers
        'l', 'länge', 'laenge',  # Length
        'b', 'breite',  # Width (but B.xx is room ID)
        'd', 'dicke', 'stärke',  # Thickness
    }

    # Room identifier patterns - flexible to handle many formats
    ROOM_ID_PATTERNS = [
        # B.04.1.001, B.U1.1.005, B.00.2.002-A format (handles UG, EG, OG)
        re.compile(r'^(B\.[A-Z0-9]+\.[0-9A-Z]+\.[A-Z]?\d+(?:-[A-Z])?)\b'),
        # R2.E5.3.5 format (Haardtring)
        re.compile(r'^(R\d+\.E\d+\.\d+\.\d+)\b'),
        # R1A, R1B format
        re.compile(r'^(R\d+[A-Z])\b'),
        # E.E0.2.1 format
        re.compile(r'^(E\.[A-Z0-9]+(?:\.\d+)+)\b'),
        # 03_b6.12 format (Omniturm)
        re.compile(r'^(\d+_[a-z]\d+\.\d+)\b'),
        # Generic: Letter(s).something.something pattern
        re.compile(r'^([A-Z]{1,3}[\.\-][A-Z0-9]+[\.\-][A-Z0-9]+[\.\-]?[A-Z0-9]*)\b', re.IGNORECASE),
        # Simple room numbers: 001, 1.01, 01.001
        re.compile(r'^(\d{1,2}[\.\-]\d{2,3})\b'),
    ]

    def __init__(self):
        self.warnings: List[str] = []

    def _is_area_label(self, label: str) -> bool:
        """Check if label indicates an area measurement."""
        label_lower = label.lower().strip()

        # Explicit non-area labels
        if label_lower in self.NON_AREA_LABELS:
            return False

        # Explicit area labels
        if label_lower in self.AREA_LABELS:
            return True

        # Check if label ends with area suffix
        for area_suffix in ['f', 'fläche', 'fl', 'area']:
            if label_lower.endswith(area_suffix):
                return True

        # Unknown label - could be area, need context
        return None  # Undetermined

    def _extract_m2_values(self, lines: List[str]) -> List[Dict]:
        """Extract all m² values with labels and context."""
        m2_entries = []

        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if not line_stripped:
                continue

            # Pattern: LABEL: VALUE m² or LABEL= VALUE m²
            labeled_pattern = re.compile(
                r'([A-Za-zäöüÄÖÜß]+)\s*[=:]\s*(\d+(?:[.,]\d+)?)\s*m[²2]?',
                re.IGNORECASE
            )

            for match in labeled_pattern.finditer(line_stripped):
                label = match.group(1)
                value_str = match.group(2)

                is_area = self._is_area_label(label)

                # Skip if definitely not area
                if is_area is False:
                    continue

                try:
                    area = parse_german_number(value_str)
                    # Reasonable area range
                    if 0.5 <= area <= 50000:
                        m2_entries.append({
                            "line_idx": i,
                            "area": area,
                            "label": label,
                            "source": line_stripped[:100],
                            "is_confirmed_area": is_area is True,
                        })
                except ValueError:
                    pass

            # Also look for standalone m² without clear label
            # Only if line looks like it could be a room data block
            standalone_pattern = re.compile(r'^(\d+(?:[.,]\d+)?)\s*m[²2]$', re.IGNORECASE)
            standalone_match = standalone_pattern.match(line_stripped)
            if standalone_match:
                try:
                    area = parse_german_number(standalone_match.group(1))
                    if 0.5 <= area <= 50000:
                        # Check if previous line has a label hint
                        prev_line = lines[i-1].strip() if i > 0 else ""
                        if prev_line.lower() in ['nrf:', 'ngf:', 'f:', 'fläche:']:
                            m2_entries.append({
                                "line_idx": i,
                                "area": area,
                                "label": prev_line.replace(':', ''),
                                "source": f"{prev_line} {line_stripped}",
                                "is_confirmed_area": True,
                            })
                except ValueError:
                    pass

        return m2_entries

    def _extract_room_ids(self, lines: List[str]) -> List[Dict]:
        """Extract all room identifiers."""
        room_entries = []

        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if not line_stripped:
                continue

            for pattern in self.ROOM_ID_PATTERNS:
                match = pattern.match(line_stripped)
                if match:
                    room_id = match.group(1)

                    # Get room name from next lines
                    room_name = ""
                    for j in range(i + 1, min(i + 4, len(lines))):
                        next_line = lines[j].strip()
                        if next_line and len(next_line) > 2:
                            # Skip if it's another room ID or a measurement
                            if any(p.match(next_line) for p in self.ROOM_ID_PATTERNS):
                                break
                            if re.match(r'^[A-Z]{1,4}[=:]\s*\d', next_line, re.IGNORECASE):
                                break
                            if re.match(r'^\d+[.,]\d+\s*m', next_line):
                                break
                            # This looks like a name
                            room_name = next_line
                            break

                    room_entries.append({
                        "line_idx": i,
                        "room_id": room_id,
                        "room_name": room_name,
                    })
                    break

        return room_entries

    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract all room areas from PDF."""
        doc = fitz.open(pdf_path)
        all_rooms: List[Room] = []

        for page_idx, page in enumerate(doc):
            text = page.get_text()
            lines = text.split('\n')

            # Extract m² values and room IDs
            m2_entries = self._extract_m2_values(lines)
            room_entries = self._extract_room_ids(lines)

            # Associate m² with rooms
            used_m2 = set()

            for room in room_entries:
                room_line = room["line_idx"]
                best_m2 = None
                best_distance = float('inf')
                best_idx = None

                for idx, m2 in enumerate(m2_entries):
                    if idx in used_m2:
                        continue

                    m2_line = m2["line_idx"]
                    distance = abs(m2_line - room_line)

                    # Prefer m² values after room ID
                    if m2_line > room_line:
                        distance -= 0.5

                    # Prefer confirmed area labels
                    if m2.get("is_confirmed_area"):
                        distance -= 1

                    if distance < best_distance and distance < 15:
                        best_distance = distance
                        best_m2 = m2
                        best_idx = idx

                if best_m2:
                    used_m2.add(best_idx)
                    room_name = room["room_name"] or "Unknown"

                    all_rooms.append(Room(
                        room_id=room["room_id"],
                        room_name=room_name,
                        area_m2=best_m2["area"],
                        page=page_idx,
                        source_text=best_m2["source"],
                        line_index=best_m2["line_idx"],
                        category=categorize_room(room_name),
                    ))

        doc.close()

        # Calculate totals
        total_area = round(sum(r.area_m2 for r in all_rooms), 2)

        by_category = defaultdict(lambda: {"area_m2": 0, "room_count": 0})
        for room in all_rooms:
            by_category[room.category]["area_m2"] += room.area_m2
            by_category[room.category]["room_count"] += 1

        return {
            "summary": {
                "total_rooms": len(all_rooms),
                "total_area_m2": total_area,
                "total_counted_m2": total_area,
                "page_count": len(fitz.open(pdf_path)),
                "blueprint_style": "universal",
                "by_category": [
                    {"category": cat, "area_m2": round(data["area_m2"], 2), "room_count": data["room_count"]}
                    for cat, data in sorted(by_category.items(), key=lambda x: -x[1]["area_m2"])
                ]
            },
            "rooms": [r.to_dict() for r in all_rooms],
            "warnings": self.warnings,
        }


def test_extraction(pdf_dir: str):
    """Test extraction on all PDFs in directory."""
    extractor = UniversalAreaExtractor()

    print("=" * 80)
    print("UNIVERSAL AREA EXTRACTOR v2 - SMART FILTERING")
    print("=" * 80)

    import os
    pdf_files = sorted([f for f in os.listdir(pdf_dir) if f.endswith('.pdf')])

    results = []

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        print(f"\n>>> {pdf_file[:60]}...")

        try:
            result = extractor.extract_from_pdf(pdf_path)
            summary = result["summary"]

            print(f"    Rooms: {summary['total_rooms']}")
            print(f"    Total: {summary['total_area_m2']:.2f} m²")

            results.append({
                "file": pdf_file,
                "rooms": summary["total_rooms"],
                "area": summary["total_area_m2"],
            })

        except Exception as e:
            print(f"    ERROR: {e}")
            import traceback
            traceback.print_exc()

    # Summary table
    print("\n" + "=" * 80)
    print("SUMMARY - v2 with smart filtering")
    print("=" * 80)
    print(f"\n{'File':<55} {'Rooms':>8} {'Area m²':>12}")
    print("-" * 80)

    for r in results:
        short_name = r["file"]
        if "Erdgeschoss" in short_name:
            short_name = "EG (Ground Floor)"
        elif "Untergeschoss" in short_name:
            short_name = "UG (Basement)"
        elif "Dachgeschoss" in short_name:
            short_name = "DG (Attic)"
        elif "Dachaufsicht" in short_name:
            short_name = "Roof"
        else:
            match = re.search(r'(\d+)\.\s*Obergeschoss', short_name)
            if match:
                short_name = f"{match.group(1)}. OG (Floor {match.group(1)})"

        print(f"{short_name:<55} {r['rooms']:>8} {r['area']:>12.2f}")


if __name__ == "__main__":
    import sys
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else "/Users/clarence/Desktop/AngebotsAgent/GRUNDRISSE BTB 2"
    test_extraction(pdf_dir)
