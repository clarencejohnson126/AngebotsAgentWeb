#!/usr/bin/env python3
"""
Universal Area Extractor - Pattern Agnostic

Extracts room areas from ANY German CAD-generated PDF regardless of
what label is used (NGF, NRF, F, Fläche, GF, WF, or no label at all).

Core principle: Find m² values and associate them with the nearest room identifier.

Author: SnapPlan Team
"""

import re
import fitz  # PyMuPDF
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any
from pathlib import Path
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
            "extraction_pattern": "universal",
        }


def parse_german_number(s: str) -> float:
    """Parse German number format: 1.234,56 or 1234,56 or 1234.56"""
    s = s.strip()
    # Handle German thousands separator: 1.234,56 -> 1234.56
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
    Pattern-agnostic area extractor.

    Strategy:
    1. Find ALL m² values in the document (regardless of label)
    2. Find ALL potential room identifiers
    3. Associate each m² value with the nearest room identifier
    """

    # Universal pattern to find ANY m² value with optional label
    # Matches: "NGF: 12,34 m²", "NRF: 12.34m2", "F: 12,34", "Fläche: 12,34 m²", "12,34 m²"
    M2_PATTERNS = [
        # With label (any label before the number)
        re.compile(r'([A-Za-zäöüÄÖÜß\-]+)[:\s=]+(\d+(?:[.,]\d+)?)\s*m[²2]', re.IGNORECASE),
        # Just number + m²
        re.compile(r'(\d+(?:[.,]\d+)?)\s*m[²2]', re.IGNORECASE),
        # Number + qm (German abbreviation)
        re.compile(r'(\d+(?:[.,]\d+)?)\s*qm\b', re.IGNORECASE),
    ]

    # Universal room identifier patterns (covers many formats)
    ROOM_ID_PATTERNS = [
        # B.00.2.002, B.04.1.001 format (LeiQ style)
        re.compile(r'^(B\.\d+\.[0-9A-Z]+\.[A-Z]?\d+(?:-[A-Z])?)\b'),
        # R2.E5.3.5 format (Haardtring)
        re.compile(r'^(R\d+\.E\d+\.\d+\.\d+)\b'),
        # R1A, R1B format
        re.compile(r'^(R\d+[A-Z])\b'),
        # E.E0.2.1 format
        re.compile(r'^(E\.[A-Z0-9]+(?:\.\d+)+)\b'),
        # 03_b6.12 format (Omniturm)
        re.compile(r'^(\d+_[a-z]\d+\.\d+)\b'),
        # Generic: Letter(s) + dots/numbers pattern
        re.compile(r'^([A-Z]{1,3}[\.\-]\d+[\.\-]\d+[\.\-]?\d*)\b', re.IGNORECASE),
        # Simple room numbers: 001, 1.01, 01.001
        re.compile(r'^(\d{1,2}[\.\-]\d{2,3})\b'),
        # Room with prefix: Raum 001, Zimmer 1.01
        re.compile(r'^(?:Raum|Zimmer|Room)\s*(\d+[\.\-]?\d*)\b', re.IGNORECASE),
    ]

    def __init__(self):
        self.warnings: List[str] = []

    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract all room areas from PDF."""
        doc = fitz.open(pdf_path)

        all_rooms: List[Room] = []

        for page_idx, page in enumerate(doc):
            text = page.get_text()
            lines = text.split('\n')

            # Extract from this page
            page_rooms = self._extract_from_lines(lines, page_idx)
            all_rooms.extend(page_rooms)

        page_count = len(doc)
        doc.close()

        # Calculate totals
        total_area = round(sum(r.area_m2 for r in all_rooms), 2)

        # Group by category
        by_category = defaultdict(lambda: {"area_m2": 0, "room_count": 0})
        for room in all_rooms:
            by_category[room.category]["area_m2"] += room.area_m2
            by_category[room.category]["room_count"] += 1

        return {
            "summary": {
                "total_rooms": len(all_rooms),
                "total_area_m2": total_area,
                "total_counted_m2": total_area,
                "page_count": page_count,
                "blueprint_style": "universal",
                "by_category": [
                    {"category": cat, "area_m2": round(data["area_m2"], 2), "room_count": data["room_count"]}
                    for cat, data in sorted(by_category.items(), key=lambda x: -x[1]["area_m2"])
                ]
            },
            "rooms": [r.to_dict() for r in all_rooms],
            "warnings": self.warnings,
        }

    def _extract_from_lines(self, lines: List[str], page_idx: int) -> List[Room]:
        """Extract rooms from page lines using universal approach."""

        # Step 1: Find all m² values
        m2_entries = []
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Try labeled patterns first
            for pattern in self.M2_PATTERNS:
                matches = pattern.findall(line)
                for match in matches:
                    try:
                        if isinstance(match, tuple):
                            # Labeled: (label, value) or just (value,)
                            if len(match) == 2:
                                label, value = match
                            else:
                                label, value = "", match[0]
                        else:
                            label, value = "", match

                        area = parse_german_number(value)

                        # Filter reasonable areas (0.5 to 50000 m²)
                        if 0.5 <= area <= 50000:
                            m2_entries.append({
                                "line_idx": i,
                                "area": area,
                                "label": label,
                                "source": line[:100],
                            })
                    except (ValueError, IndexError):
                        pass

        # Step 2: Find all room identifiers
        room_entries = []
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            for pattern in self.ROOM_ID_PATTERNS:
                match = pattern.match(line)
                if match:
                    room_id = match.group(1)
                    # Get room name from next line if available
                    room_name = ""
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        # Check if next line looks like a name (not a number or pattern)
                        if next_line and not re.match(r'^[\d,.\s]+$', next_line):
                            if not any(p.match(next_line) for p in self.ROOM_ID_PATTERNS):
                                if not re.match(r'^[A-Z]{2,}[:\s=]', next_line):  # Not a label
                                    room_name = next_line

                    room_entries.append({
                        "line_idx": i,
                        "room_id": room_id,
                        "room_name": room_name,
                    })
                    break  # Only match first pattern

        # Step 3: Associate m² values with nearest room identifier
        rooms = []
        used_m2 = set()

        for room_entry in room_entries:
            room_line = room_entry["line_idx"]
            best_m2 = None
            best_distance = float('inf')
            best_idx = None

            for idx, m2_entry in enumerate(m2_entries):
                if idx in used_m2:
                    continue

                m2_line = m2_entry["line_idx"]
                distance = abs(m2_line - room_line)

                # Prefer m² values that come AFTER room identifier
                if m2_line > room_line:
                    distance -= 0.5

                # Max distance of 20 lines
                if distance < best_distance and distance < 20:
                    best_distance = distance
                    best_m2 = m2_entry
                    best_idx = idx

            if best_m2:
                used_m2.add(best_idx)
                room_name = room_entry["room_name"] or "Unknown"

                rooms.append(Room(
                    room_id=room_entry["room_id"],
                    room_name=room_name,
                    area_m2=best_m2["area"],
                    page=page_idx,
                    source_text=best_m2["source"],
                    line_index=best_m2["line_idx"],
                    category=categorize_room(room_name),
                ))

        # Step 4: Handle orphaned m² values (no room identifier found)
        # These might be rooms where we couldn't find the identifier
        orphaned_count = 0
        for idx, m2_entry in enumerate(m2_entries):
            if idx not in used_m2:
                orphaned_count += 1
                # Try to find name from nearby lines
                room_name = self._find_nearby_name(lines, m2_entry["line_idx"])

                rooms.append(Room(
                    room_id=f"area_{page_idx}_{orphaned_count:03d}",
                    room_name=room_name,
                    area_m2=m2_entry["area"],
                    page=page_idx,
                    source_text=m2_entry["source"],
                    line_index=m2_entry["line_idx"],
                    category=categorize_room(room_name),
                ))

        if orphaned_count > 0:
            self.warnings.append(f"Page {page_idx}: {orphaned_count} areas without room identifiers")

        return rooms

    def _find_nearby_name(self, lines: List[str], line_idx: int) -> str:
        """Try to find a room name near an m² value."""
        # Look backwards up to 5 lines
        for i in range(line_idx - 1, max(0, line_idx - 6), -1):
            line = lines[i].strip()
            if line and len(line) > 2:
                # Skip if it's a number, label pattern, or too short
                if not re.match(r'^[\d,.\s]+$', line):
                    if not re.match(r'^[A-Z]{2,}[:\s=]', line):
                        if not any(p.match(line) for p in self.ROOM_ID_PATTERNS):
                            return line
        return "Unknown"


def test_extraction(pdf_dir: str):
    """Test extraction on all PDFs in directory."""
    extractor = UniversalAreaExtractor()

    print("=" * 80)
    print("UNIVERSAL AREA EXTRACTOR TEST")
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

    # Summary table
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"\n{'File':<55} {'Rooms':>8} {'Area m²':>12}")
    print("-" * 80)

    for r in results:
        # Shorten filename for display
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

    if len(sys.argv) > 1:
        pdf_dir = sys.argv[1]
    else:
        pdf_dir = "/Users/clarence/Desktop/AngebotsAgent/GRUNDRISSE BTB 2"

    test_extraction(pdf_dir)
