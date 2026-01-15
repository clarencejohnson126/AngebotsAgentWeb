#!/usr/bin/env python3
"""
Universal Area Extractor - FINAL Production Version

Extracts room areas from ANY German CAD-generated PDF regardless of
what area label is used (NGF, NRF, F, Fläche, GF, etc.)

Key design principles:
1. Find m² values with area-type labels (not perimeter, height, etc.)
2. Associate with proper room identifiers (not shaft codes, legends, etc.)
3. Work with any blueprint style automatically

Author: SnapPlan Team
"""

import re
import fitz  # PyMuPDF
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
from pathlib import Path


@dataclass
class Room:
    """Extracted room with area."""
    room_id: str
    room_name: str
    area_m2: float
    counted_m2: float
    factor: float
    page: int
    source_text: str
    category: str = "other"
    extraction_pattern: str = "universal"

    def to_dict(self) -> Dict:
        return {
            "room_number": self.room_id,
            "room_name": self.room_name,
            "area_m2": self.area_m2,
            "counted_m2": self.counted_m2,
            "factor": self.factor,
            "page": self.page,
            "source_text": self.source_text,
            "category": self.category,
            "extraction_pattern": self.extraction_pattern,
        }


def parse_german_number(s: str) -> float:
    """Parse German number format: 1.234,56 or 1234,56 or 1234.56"""
    s = s.strip()
    if ',' in s and '.' in s:
        s = s.replace('.', '').replace(',', '.')
    elif ',' in s:
        s = s.replace(',', '.')
    return float(s)


def categorize_room(name: str) -> Tuple[str, float]:
    """Categorize room by name and determine counting factor."""
    name_lower = name.lower()

    # Outdoor areas get 50% factor
    outdoor_keywords = ["balkon", "terrasse", "loggia", "dachterrasse", "freisitz", "außen"]
    for kw in outdoor_keywords:
        if kw in name_lower:
            return "outdoor", 0.5

    categories = {
        "office": ["büro", "office", "nutzungseinheit", "back office", "besprechung", "konferenz"],
        "residential": ["schlafen", "wohnen", "essen", "kochen", "zimmer", "küche", "wohnung"],
        "circulation": ["flur", "diele", "schleuse", "vorraum", "eingang", "lobby", "foyer", "gang"],
        "stairs": ["treppe", "treppenhaus", "trh"],
        "elevators": ["aufzug", "lift", "aufzugsschacht", "fahrstuhl"],
        "shafts": ["schacht", "lüftung", "medien", "druckbelüftung", "installationsschacht"],
        "technical": ["elektro", "technik", "hwr", "it verteiler", "elt", "glt", "fiz", "server", "trafo"],
        "sanitary": ["wc", "bad", "dusche", "gästebad", "umkleide", "sanitär", "toilette"],
        "storage": ["lager", "abstellraum", "müll", "fahrrad", "keller", "archiv"],
    }

    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in name_lower:
                return cat, 1.0

    return "other", 1.0


class UniversalAreaExtractor:
    """
    Production-ready universal area extractor.

    Works with any blueprint style by:
    1. Finding ALL area-type m² measurements
    2. Finding ALL valid room identifiers
    3. Smart association of areas to rooms
    """

    # Area labels (these indicate ROOM AREA, not perimeter/height/etc.)
    AREA_LABELS = {
        'ngf', 'nrf', 'bgf', 'gf', 'nf', 'wf', 'hf', 'kf', 'rgf',
        'f', 'fläche', 'fl', 'flaeche', 'nutzfläche', 'wohnfläche',
        'grundfläche', 'raumfläche', 'nettofl', 'bruttof',
    }

    # Non-area labels to EXCLUDE
    NON_AREA_LABELS = {
        'u', 'um', 'umfang',  # Perimeter
        'lh', 'lrh', 'h', 'höhe', 'hoehe', 'rh', 'raumhöhe',  # Height
        'ok', 'uk', 'okff', 'ukrd', 'ukfd', 'okrf', 'okrfb',  # Elevation
        'l', 'länge', 'laenge',  # Length
        'breite',  # Width
        'd', 'dicke', 'stärke',  # Thickness
        'brh',  # Brüstungshöhe
    }

    # Valid room identifier patterns (order matters - most specific first)
    ROOM_ID_PATTERNS = [
        # B.04.1.001, B.U1.1.005, B.00.2.002-A, B.04.0.T01 (German floor plan standard)
        (re.compile(r'^(B\.[A-Z0-9]+\.[0-9]+\.[A-Z0-9]+(?:-[A-Z])?)\b'), "b_format"),
        # R2.E5.3.5 (Haardtring residential)
        (re.compile(r'^(R\d+\.E\d+\.\d+\.\d+)\b'), "r_format"),
        # R1A, R1B (simple residential)
        (re.compile(r'^(R\d+[A-Z])\b'), "r_simple"),
        # E.E0.2.1 (apartment format)
        (re.compile(r'^(E\.[A-Z0-9]+(?:\.\d+)+)\b'), "e_format"),
        # 03_b6.12 (Omniturm grid format)
        (re.compile(r'^(\d{2}_[a-z]\d+\.\d+)\b'), "grid_format"),
        # BT1.A.001 (Bauteil format)
        (re.compile(r'^(BT\d+\.[A-Z]+\.\d+)\b'), "bt_format"),
    ]

    # Patterns that look like room IDs but aren't (shafts, legends, etc.)
    EXCLUDE_ID_PATTERNS = [
        re.compile(r'^S-\d+'),  # S-22-H-K shaft codes
        re.compile(r'^[A-Z]-\d+-'),  # X-00- legend codes
        re.compile(r'^\d+$'),  # Pure numbers
        re.compile(r'^[A-Z]{4,}'),  # All-caps abbreviations (OKFF, etc.)
    ]

    def __init__(self):
        self.warnings: List[str] = []

    def _is_area_label(self, label: str) -> Optional[bool]:
        """Check if label indicates an area measurement."""
        label_clean = label.lower().strip().rstrip(':=')

        if label_clean in self.NON_AREA_LABELS:
            return False
        if label_clean in self.AREA_LABELS:
            return True
        # Check suffixes
        for suffix in ['f', 'fl', 'fläche']:
            if label_clean.endswith(suffix) and len(label_clean) > len(suffix):
                return True
        return None  # Unknown

    def _is_valid_room_id(self, candidate: str) -> bool:
        """Check if candidate looks like a valid room identifier."""
        # Must match one of our room patterns
        for pattern, _ in self.ROOM_ID_PATTERNS:
            if pattern.match(candidate):
                # Check it's not in exclusion list
                for exclude in self.EXCLUDE_ID_PATTERNS:
                    if exclude.match(candidate):
                        return False
                return True
        return False

    def _extract_areas(self, lines: List[str]) -> List[Dict]:
        """Extract all area measurements from lines."""
        areas = []

        # Main pattern: LABEL: VALUE m² or LABEL= VALUE m²
        labeled_re = re.compile(
            r'([A-Za-zäöüÄÖÜß]+)\s*[=:]\s*(\d+(?:[.,]\d+)?)\s*m[²2]',
            re.IGNORECASE
        )

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            for match in labeled_re.finditer(line):
                label = match.group(1)
                value_str = match.group(2)

                is_area = self._is_area_label(label)
                if is_area is False:
                    continue  # Definitely not area

                try:
                    area = parse_german_number(value_str)
                    if 0.1 <= area <= 100000:  # Reasonable range
                        areas.append({
                            "line_idx": i,
                            "area": area,
                            "label": label,
                            "source": line[:100],
                            "confirmed": is_area is True,
                        })
                except ValueError:
                    pass

            # Handle split format: "NRF:" on one line, value on next
            if line.upper().rstrip(':') in [l.upper() for l in self.AREA_LABELS]:
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    value_match = re.match(r'^(\d+[.,]\d+)\s*m[²2]?', next_line)
                    if value_match:
                        try:
                            area = parse_german_number(value_match.group(1))
                            if 0.1 <= area <= 100000:
                                areas.append({
                                    "line_idx": i,
                                    "area": area,
                                    "label": line.rstrip(':'),
                                    "source": f"{line} {next_line}",
                                    "confirmed": True,
                                })
                        except ValueError:
                            pass

        return areas

    def _extract_room_ids(self, lines: List[str], areas: List[Dict]) -> List[Dict]:
        """Extract all valid room identifiers, preferring those near area values."""
        # First pass: find ALL occurrences of each room ID
        all_occurrences = []

        for i, line in enumerate(lines):
            line = line.strip()
            if not line or len(line) < 3:
                continue

            for pattern, format_type in self.ROOM_ID_PATTERNS:
                match = pattern.match(line)
                if match:
                    room_id = match.group(1)
                    if self._is_valid_room_id(room_id):
                        room_name = self._find_room_name(lines, i + 1)
                        all_occurrences.append({
                            "line_idx": i,
                            "room_id": room_id,
                            "room_name": room_name,
                            "format": format_type,
                        })
                    break

        # Group by room_id
        from collections import defaultdict
        by_id = defaultdict(list)
        for occ in all_occurrences:
            by_id[occ["room_id"]].append(occ)

        # For each unique room ID, pick the occurrence closest to an area value
        rooms = []
        area_lines = {a["line_idx"] for a in areas}

        for room_id, occurrences in by_id.items():
            best_occ = None
            best_distance = float('inf')

            for occ in occurrences:
                # Find minimum distance to any area
                for area in areas:
                    dist = abs(occ["line_idx"] - area["line_idx"])
                    if dist < best_distance:
                        best_distance = dist
                        best_occ = occ

            if best_occ:
                rooms.append(best_occ)

        return rooms

    def _find_room_name(self, lines: List[str], start_idx: int) -> str:
        """Find room name starting from given index."""
        for j in range(start_idx, min(start_idx + 4, len(lines))):
            candidate = lines[j].strip()
            if not candidate or len(candidate) < 2:
                continue

            # Skip if it looks like another room ID
            for pattern, _ in self.ROOM_ID_PATTERNS:
                if pattern.match(candidate):
                    return "Unknown"

            # Skip if it's a measurement label
            if re.match(r'^[A-Z]{1,4}[=:]\s*\d', candidate, re.IGNORECASE):
                continue

            # Skip if it's just a number
            if re.match(r'^\d+[.,]?\d*\s*m?[²2]?$', candidate):
                continue

            # This looks like a name
            return candidate

        return "Unknown"

    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract all room areas from PDF."""
        path = Path(pdf_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF not found: {path}")

        doc = fitz.open(str(path))
        all_rooms: List[Room] = []
        self.warnings = []

        for page_idx, page in enumerate(doc):
            text = page.get_text()
            lines = text.split('\n')

            # Extract areas and room IDs (pass areas to find rooms near them)
            areas = self._extract_areas(lines)
            room_ids = self._extract_room_ids(lines, areas)

            # Associate areas with rooms
            used_areas = set()

            for room in room_ids:
                room_line = room["line_idx"]
                best_area = None
                best_score = float('inf')
                best_idx = None

                for idx, area in enumerate(areas):
                    if idx in used_areas:
                        continue

                    area_line = area["line_idx"]

                    # Calculate score (lower is better)
                    distance = abs(area_line - room_line)

                    # Prefer areas that come AFTER room ID (typical CAD layout)
                    if area_line > room_line:
                        distance -= 2

                    # Prefer confirmed area labels
                    if area.get("confirmed"):
                        distance -= 3

                    # Max distance threshold
                    if distance < best_score and abs(area_line - room_line) < 20:
                        best_score = distance
                        best_area = area
                        best_idx = idx

                if best_area:
                    used_areas.add(best_idx)
                    room_name = room["room_name"]
                    category, factor = categorize_room(room_name)

                    all_rooms.append(Room(
                        room_id=room["room_id"],
                        room_name=room_name,
                        area_m2=best_area["area"],
                        counted_m2=round(best_area["area"] * factor, 2),
                        factor=factor,
                        page=page_idx,
                        source_text=best_area["source"],
                        category=category,
                        extraction_pattern=f"{best_area['label']}:",
                    ))

            # Report unmatched areas
            unmatched = len(areas) - len(used_areas)
            if unmatched > 0 and len(room_ids) > 0:
                self.warnings.append(
                    f"Page {page_idx}: {unmatched} areas could not be matched to room IDs"
                )

        page_count = len(doc)
        doc.close()

        # Calculate totals
        total_area = round(sum(r.area_m2 for r in all_rooms), 2)
        total_counted = round(sum(r.counted_m2 for r in all_rooms), 2)

        # Group by category
        by_category = defaultdict(lambda: {"area_m2": 0, "counted_m2": 0, "room_count": 0})
        for room in all_rooms:
            by_category[room.category]["area_m2"] += room.area_m2
            by_category[room.category]["counted_m2"] += room.counted_m2
            by_category[room.category]["room_count"] += 1

        return {
            "summary": {
                "total_rooms": len(all_rooms),
                "total_area_m2": total_area,
                "total_counted_m2": total_counted,
                "page_count": page_count,
                "blueprint_style": "auto-detected",
                "by_category": [
                    {
                        "category": cat,
                        "area_m2": round(data["area_m2"], 2),
                        "counted_m2": round(data["counted_m2"], 2),
                        "room_count": data["room_count"]
                    }
                    for cat, data in sorted(by_category.items(), key=lambda x: -x[1]["area_m2"])
                ]
            },
            "rooms": [r.to_dict() for r in all_rooms],
            "warnings": self.warnings,
        }


def test_all(pdf_dir: str):
    """Test extraction on all PDFs in directory."""
    extractor = UniversalAreaExtractor()

    print("=" * 80)
    print("UNIVERSAL AREA EXTRACTOR - FINAL VERSION")
    print("Pattern-agnostic: Works with NGF, NRF, F, Fläche, or any area label")
    print("=" * 80)

    import os
    pdf_files = sorted([f for f in os.listdir(pdf_dir) if f.endswith('.pdf')])

    results = []

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)

        # Shorten name for display
        short_name = pdf_file
        if "Erdgeschoss" in short_name:
            short_name = "EG (Ground)"
        elif "Untergeschoss" in short_name:
            short_name = "UG (Basement)"
        elif "Dachgeschoss" in short_name:
            short_name = "DG (Attic)"
        elif "Dachaufsicht" in short_name:
            short_name = "Roof"
        else:
            match = re.search(r'(\d+)\.\s*Obergeschoss', short_name)
            if match:
                short_name = f"{match.group(1)}. OG"

        print(f"\n>>> {short_name}...")

        try:
            result = extractor.extract_from_pdf(pdf_path)
            summary = result["summary"]

            print(f"    Rooms: {summary['total_rooms']:>3}  |  Area: {summary['total_area_m2']:>10.2f} m²  |  Counted: {summary['total_counted_m2']:>10.2f} m²")

            if result['warnings']:
                for w in result['warnings']:
                    print(f"    ⚠ {w}")

            results.append({
                "file": short_name,
                "rooms": summary["total_rooms"],
                "area": summary["total_area_m2"],
                "counted": summary["total_counted_m2"],
            })

        except Exception as e:
            print(f"    ERROR: {e}")

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"\n{'Floor':<20} {'Rooms':>8} {'Area m²':>12} {'Counted m²':>12}")
    print("-" * 55)

    total_rooms = 0
    total_area = 0
    total_counted = 0

    for r in results:
        print(f"{r['file']:<20} {r['rooms']:>8} {r['area']:>12.2f} {r['counted']:>12.2f}")
        total_rooms += r['rooms']
        total_area += r['area']
        total_counted += r['counted']

    print("-" * 55)
    print(f"{'TOTAL':<20} {total_rooms:>8} {total_area:>12.2f} {total_counted:>12.2f}")


if __name__ == "__main__":
    import sys
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else "/Users/clarence/Desktop/AngebotsAgent/GRUNDRISSE BTB 2"
    test_all(pdf_dir)
