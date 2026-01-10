# Deterministic Area Extraction from Construction Plans

## Overview
This skill covers extracting room areas from German CAD-generated PDFs with 100% traceability. All extracted values come directly from PDF text—zero hallucination. The engine auto-detects blueprint styles and extracts room numbers, names, areas, and metadata with full source citations.

## When to Use
- Extracting room schedules from architectural floor plans
- Processing German construction PDFs (Grundrisse, Raumbücher)
- Building takeoff quantities from plan data
- Validating stated quantities against plan extractions
- Creating audit trails for extracted measurements

## Core Principle: Deterministic Extraction

```
┌─────────────────────────────────────────────────────────────────┐
│  WHAT WE DO                        WHAT WE DON'T DO            │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Extract text that EXISTS        ✗ Guess missing values      │
│  ✓ Parse patterns we RECOGNIZE     ✗ Invent room numbers       │
│  ✓ Report confidence levels        ✗ Hallucinate areas         │
│  ✓ Cite source text + page         ✗ Approximate measurements  │
│  ✓ Fail gracefully with warnings   ✗ Hide extraction failures  │
└─────────────────────────────────────────────────────────────────┘
```

## Supported Blueprint Styles

| Style | Area Label | Room Number Pattern | Typical Use |
|-------|------------|---------------------|-------------|
| **Haardtring** | `F: 22,79 m²` | `R2.E5.3.5` | Residential |
| **LeiQ** | `NRF: 45,30 m²` | `B.00.2.002` | Office/Commercial |
| **Omniturm** | `NGF: 18,50 m²` | `33_b6.12` | Highrise |
| **Generic** | Various | Flexible | Unknown formats |

## Project Structure

```
├── services/
│   └── pdf-service/
│       ├── main.py                      # FastAPI application
│       ├── area_extraction.py           # Core extraction engine
│       ├── models/
│       │   ├── __init__.py
│       │   ├── enums.py                 # BlueprintStyle, RoomCategory
│       │   └── extraction_result.py     # Data classes
│       ├── extractors/
│       │   ├── __init__.py
│       │   ├── haardtring.py            # F: pattern extractor
│       │   ├── leiq.py                  # NRF: pattern extractor
│       │   ├── omniturm.py              # NGF: pattern extractor
│       │   └── generic.py               # Flexible fallback
│       ├── utils/
│       │   ├── german_numbers.py        # Number parsing
│       │   └── room_categories.py       # Room classification
│       ├── requirements.txt
│       └── Dockerfile
├── app/
│   └── api/
│       └── extract/
│           └── areas/
│               └── route.ts             # Next.js API proxy
```

## Installation

```bash
pip install PyMuPDF pdfplumber
```

## Core Implementation

### 1. Enums and Constants (`models/enums.py`)

```python
from enum import Enum

class BlueprintStyle(str, Enum):
    """Detected blueprint style."""
    HAARDTRING = "haardtring"  # Residential, F: pattern
    LEIQ = "leiq"              # Office, NRF: pattern
    OMNITURM = "omniturm"      # Highrise, NGF: pattern
    UNKNOWN = "unknown"


class RoomCategory(str, Enum):
    """Room category for grouping and pricing."""
    OFFICE = "office"
    RESIDENTIAL = "residential"
    CIRCULATION = "circulation"
    STAIRS = "stairs"
    ELEVATORS = "elevators"
    SHAFTS = "shafts"
    TECHNICAL = "technical"
    SANITARY = "sanitary"
    STORAGE = "storage"
    OUTDOOR = "outdoor"
    OTHER = "other"


# German room type keywords for categorization
ROOM_CATEGORIES = {
    RoomCategory.OFFICE: ["büro", "office", "nutzungseinheit", "back office"],
    RoomCategory.RESIDENTIAL: ["schlafen", "wohnen", "essen", "kochen", "zimmer", "küche"],
    RoomCategory.CIRCULATION: ["flur", "diele", "schleuse", "vorraum", "eingang", "lobby"],
    RoomCategory.STAIRS: ["treppe", "treppenhaus", "trh"],
    RoomCategory.ELEVATORS: ["aufzug", "lift", "aufzugsschacht", "aufzugsvorr"],
    RoomCategory.SHAFTS: ["schacht", "lüftung", "medien", "druckbelüftung"],
    RoomCategory.TECHNICAL: ["elektro", "technik", "hwr", "it verteiler", "elt", "glt", "fiz"],
    RoomCategory.SANITARY: ["wc", "bad", "dusche", "gästebad", "umkleide", "sanitär"],
    RoomCategory.STORAGE: ["lager", "abstellraum", "müll", "fahrrad"],
    RoomCategory.OUTDOOR: ["balkon", "terrasse", "loggia", "dachterrasse", "freisitz"],
}
```

### 2. Data Models (`models/extraction_result.py`)

```python
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from .enums import BlueprintStyle, RoomCategory


@dataclass
class BoundingBox:
    """PDF bounding box coordinates for visual reference."""
    x0: float
    y0: float
    x1: float
    y1: float

    def to_dict(self) -> Dict[str, float]:
        return {"x0": self.x0, "y0": self.y0, "x1": self.x1, "y1": self.y1}

    def center(self) -> Tuple[float, float]:
        return ((self.x0 + self.x1) / 2, (self.y0 + self.y1) / 2)


@dataclass
class ExtractedRoom:
    """
    A single extracted room with FULL TRACEABILITY.
    
    Every field that comes from the PDF has a corresponding source_text
    showing exactly what was parsed.
    """
    # Identification
    room_number: str              # e.g., "R2.E5.3.5", "B.00.2.002"
    room_name: str                # e.g., "Büro", "Flur", "WC"
    
    # Area values
    area_m2: float                # Raw extracted area
    counted_m2: float             # After applying factor (e.g., 50% for balcony)
    factor: float                 # 1.0 = full, 0.5 = balcony/terrace
    
    # Traceability (CRITICAL)
    page: int                     # 0-indexed page number
    source_text: str              # Exact text parsed, e.g., "F: 22,79"
    extraction_pattern: str       # Which pattern matched: "F:", "NRF:", "NGF:"
    
    # Optional metadata
    bbox: Optional[BoundingBox] = None
    category: RoomCategory = RoomCategory.OTHER
    perimeter_m: Optional[float] = None    # U: value (LeiQ style)
    height_m: Optional[float] = None       # LH: value (LeiQ style)
    factor_source: Optional[str] = None    # How factor was determined

    def to_dict(self) -> Dict:
        result = {
            "room_number": self.room_number,
            "room_name": self.room_name,
            "area_m2": self.area_m2,
            "counted_m2": self.counted_m2,
            "factor": self.factor,
            "page": self.page,
            "source_text": self.source_text,
            "category": self.category.value,
            "extraction_pattern": self.extraction_pattern,
        }
        if self.bbox:
            result["bbox"] = self.bbox.to_dict()
        if self.perimeter_m:
            result["perimeter_m"] = self.perimeter_m
        if self.height_m:
            result["height_m"] = self.height_m
        if self.factor_source:
            result["factor_source"] = self.factor_source
        return result


@dataclass
class ExtractionResult:
    """Complete extraction result with statistics."""
    rooms: List[ExtractedRoom]
    total_area_m2: float
    total_counted_m2: float       # After factors applied
    room_count: int
    page_count: int
    blueprint_style: BlueprintStyle
    extraction_method: str = "unified_extraction"
    warnings: List[str] = field(default_factory=list)
    totals_by_category: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict:
        return {
            "rooms": [r.to_dict() for r in self.rooms],
            "total_area_m2": self.total_area_m2,
            "total_counted_m2": self.total_counted_m2,
            "room_count": self.room_count,
            "page_count": self.page_count,
            "blueprint_style": self.blueprint_style.value,
            "extraction_method": self.extraction_method,
            "warnings": self.warnings,
            "totals_by_category": self.totals_by_category,
        }
```

### 3. German Number Parser (`utils/german_numbers.py`)

```python
def parse_german_number(s: str) -> float:
    """
    Parse German number format to float.
    
    German format uses:
    - Comma as decimal separator: "22,79" → 22.79
    - Period as thousands separator: "1.070,55" → 1070.55
    
    Examples:
        >>> parse_german_number("22,79")
        22.79
        >>> parse_german_number("1.070,55")
        1070.55
        >>> parse_german_number("5")
        5.0
    """
    s = s.strip()
    
    if '.' in s and ',' in s:
        # German thousands separator format: 1.070,55
        s = s.replace('.', '').replace(',', '.')
    else:
        # Simple comma decimal: 22,79
        s = s.replace(',', '.')
    
    return float(s)


def format_german_number(n: float, decimals: int = 2) -> str:
    """
    Format float to German number string.
    
    Examples:
        >>> format_german_number(22.79)
        "22,79"
        >>> format_german_number(1070.55)
        "1.070,55"
    """
    # Format with period as decimal
    formatted = f"{n:,.{decimals}f}"
    # Swap separators for German format
    formatted = formatted.replace(',', 'X').replace('.', ',').replace('X', '.')
    return formatted
```

### 4. Pattern Definitions

```python
import re

# =============================================================================
# PATTERN DEFINITIONS BY STYLE
# =============================================================================

PATTERNS = {
    "haardtring": {
        # Area patterns
        "area_labels": [
            re.compile(r'^F:\s*([\d,]+)\s*m[²2]?$', re.IGNORECASE),
            re.compile(r'^F:$'),  # Split across lines
        ],
        # Room number patterns
        "room_numbers": [
            re.compile(r'^(R\d+\.E\d+\.\d+\.\d+)$'),  # R2.E5.3.5
        ],
        # Balcony factor pattern
        "balcony_factor": re.compile(r'^50%:\s*([\d,]+)\s*m[²2]?$', re.IGNORECASE),
    },
    
    "leiq": {
        "area_labels": [
            re.compile(r'^NRF:\s*([\d,]+)\s*m[²2]?$', re.IGNORECASE),
            re.compile(r'^NRF[=:]\s*([\d.,]+)\s*m[²2]?$', re.IGNORECASE),
            re.compile(r'^NRF:$'),  # Split across lines
        ],
        "room_numbers": [
            re.compile(r'^(B\.\d+\.[0-9A-Z]+\.[A-Z]?\d+)$'),  # B.00.2.002
        ],
        # Additional metadata
        "perimeter": re.compile(r'^U:\s*([\d,]+)\s*m$', re.IGNORECASE),
        "height": re.compile(r'^LH:\s*([\d,]+)\s*m$', re.IGNORECASE),
    },
    
    "omniturm": {
        "area_labels": [
            re.compile(r'^NGF:\s*([\d.,]+)\s*m[²2]?$', re.IGNORECASE),
            re.compile(r'^NGF:$'),  # Split across lines
        ],
        "room_numbers": [
            re.compile(r'^(\d+_[a-z]\d+\.\d+)$'),     # 33_b6.12
            re.compile(r'^(BT\d+\.[A-Z]+\.\d+)$'),    # BT1.ABC.001
        ],
        "schacht_name": re.compile(r'^(Schacht \d+)$'),
    },
}

# =============================================================================
# FLEXIBLE PATTERNS FOR UNKNOWN FORMATS
# =============================================================================

FLEXIBLE_AREA_PATTERNS = [
    # Standard German area labels
    re.compile(r'(?:NRF|NGF|BGF|Fläche|Fl|FL|GF|WF|NF)\s*[=:]\s*([\d.,]+)\s*m[²2]?', re.IGNORECASE),
    re.compile(r'^F\s*[=:]\s*([\d.,]+)\s*m[²2]?$', re.IGNORECASE),
    re.compile(r'(?:NRF|NGF|Fläche)\s*[=:]\s*([\d.,]+)\s*qm\b', re.IGNORECASE),
]

FLEXIBLE_ROOM_PATTERNS = [
    # Multi-segment patterns
    re.compile(r'^([A-Z]+\d*[\._][A-Z0-9]+[\._][A-Z0-9]+[\._][A-Z0-9]+)$', re.IGNORECASE),
    re.compile(r'^(\d+_[a-z]\d+\.\d+)$'),
    # Floor-based patterns
    re.compile(r'^([EOU]G\d*[\._]\d{3})$', re.IGNORECASE),  # EG.001, OG1.002
    re.compile(r'^([A-Z][\._]\d{3})$', re.IGNORECASE),      # A.001
]
```

### 5. Style Detection

```python
def detect_blueprint_style(text: str) -> BlueprintStyle:
    """
    Auto-detect blueprint style from PDF text content.
    
    Detection logic:
    1. Look for area label patterns (F:, NRF:, NGF:)
    2. Look for room number patterns
    3. Combine evidence to determine style
    
    Returns:
        BlueprintStyle enum value
    """
    # Check for area label patterns
    has_f = bool(re.search(r'\bF:\s*\d', text))
    has_nrf = bool(re.search(r'\bNRF:\s*\d', text, re.IGNORECASE))
    has_ngf = bool(re.search(r'\bNGF:\s*\d', text, re.IGNORECASE))

    # Check for room number patterns
    has_r_pattern = bool(re.search(r'\bR\d+\.E\d+\.\d+\.\d+\b', text))      # Haardtring
    has_b_pattern = bool(re.search(r'\bB\.\d+\.\d+\.\d+\b', text))          # LeiQ
    has_grid_pattern = bool(re.search(r'\b\d+_[a-z]\d+\.\d+\b', text))      # Omniturm

    # Determine style based on combined evidence
    if has_f and has_r_pattern:
        return BlueprintStyle.HAARDTRING
    elif has_nrf and has_b_pattern:
        return BlueprintStyle.LEIQ
    elif has_ngf and (has_grid_pattern or has_b_pattern):
        return BlueprintStyle.OMNITURM
    elif has_ngf:
        return BlueprintStyle.OMNITURM
    elif has_nrf:
        return BlueprintStyle.LEIQ
    elif has_f:
        return BlueprintStyle.HAARDTRING
    else:
        return BlueprintStyle.UNKNOWN
```

### 6. Haardtring Extractor (Residential)

```python
def extract_haardtring(lines: List[str], page_idx: int) -> List[ExtractedRoom]:
    """
    Extract rooms from Haardtring-style blueprints.
    
    Pattern sequence:
        R2.E5.3.5           ← Room number
        Schlafen            ← Room name
        F: 22,79 m²         ← Area
        50%: 11,40 m²       ← Optional balcony factor
    
    Special handling:
    - Outdoor rooms (Balkon, Terrasse) get 50% factor automatically
    - Explicit "50%:" pattern overrides default factor
    """
    rooms = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Look for room number pattern: R2.E5.3.5
        room_match = re.match(r'^(R\d+\.E\d+\.\d+\.\d+)$', line)
        if room_match:
            room_num = room_match.group(1)
            room_name = None
            area = None
            balcony_area = None

            # Next line is usually room name (if not a measurement)
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not re.match(r'^(F:|BA:|B:|W:|D:|[\d,]+)', next_line):
                    room_name = next_line

            # Search ahead for area value (within 15 lines)
            for j in range(i + 1, min(len(lines), i + 15)):
                curr = lines[j].strip()

                # Pattern: F: 22,79 m²
                f_match = re.match(r'^F:\s*([\d,]+)\s*m[²2]?$', curr, re.IGNORECASE)
                if f_match:
                    area = parse_german_number(f_match.group(1))
                    
                    # Check for balcony factor on next line
                    if j + 1 < len(lines):
                        b_match = re.match(r'^50%:\s*([\d,]+)\s*m[²2]?$', lines[j + 1].strip())
                        if b_match:
                            balcony_area = parse_german_number(b_match.group(1))
                    break

                # Pattern: F: (split across lines)
                if curr == 'F:' and j + 1 < len(lines):
                    area_match = re.match(r'^([\d,]+)\s*m[²2]?$', lines[j + 1].strip())
                    if area_match:
                        area = parse_german_number(area_match.group(1))
                        break

                # Stop if we hit another room number
                if re.match(r'^R\d+\.E\d+\.\d+\.\d+$', curr):
                    break

            # Create room if we found an area
            if area:
                # Determine factor
                if balcony_area:
                    factor = 0.5
                    counted = balcony_area
                    factor_source = "explicit_50%"
                elif room_name and is_outdoor_room(room_name):
                    factor = 0.5
                    counted = round(area * 0.5, 2)
                    factor_source = "default_outdoor"
                else:
                    factor = 1.0
                    counted = area
                    factor_source = None

                rooms.append(ExtractedRoom(
                    room_number=room_num,
                    room_name=room_name or "Unknown",
                    area_m2=area,
                    counted_m2=counted,
                    factor=factor,
                    page=page_idx,
                    source_text=f"F: {area}",
                    category=categorize_room(room_name or ""),
                    factor_source=factor_source,
                    extraction_pattern="F:",
                ))
        i += 1

    return rooms
```

### 7. LeiQ Extractor (Office/Commercial)

```python
def extract_leiq(lines: List[str], page_idx: int) -> List[ExtractedRoom]:
    """
    Extract rooms from LeiQ-style blueprints.
    
    Pattern sequence:
        B.00.2.002          ← Room number
        Büro                ← Room name
        NRF: 45,30 m²       ← Net room floor area
        U: 28,50 m          ← Perimeter (optional)
        LH: 3,00 m          ← Room height (optional)
    
    NRF = Netto-Raumfläche (Net Room Floor Area)
    """
    rooms = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Look for room number pattern: B.00.2.002
        room_match = re.match(r'^(B\.\d+\.[0-9A-Z]+\.[A-Z]?\d+)$', line)
        if room_match:
            room_num = room_match.group(1)
            room_name = None
            area = None
            perimeter = None
            height = None

            # Next line is usually room name
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not re.match(
                    r'^(NRF|F[=:]|U[=:]|LH[=:]|LRH[=:]|B\.|[\d,]+)', next_line
                ):
                    room_name = next_line

            # Search ahead for values
            for j in range(i + 1, min(len(lines), i + 15)):
                curr = lines[j].strip()

                # Area: NRF: 45,30 m² or NRF= 45,30 m²
                nrf_match = re.match(r'^NRF[=:]\s*([\d.,]+)\s*m[²2]?$', curr, re.IGNORECASE)
                if nrf_match and area is None:
                    area = parse_german_number(nrf_match.group(1))
                    continue

                # Alternative: F: pattern
                f_match = re.match(r'^F[=:]\s*([\d.,]+)\s*m[²2]?$', curr, re.IGNORECASE)
                if f_match and area is None:
                    area = parse_german_number(f_match.group(1))
                    continue

                # Split pattern: NRF: (next line has value)
                if curr in ('NRF:', 'NRF=') and j + 1 < len(lines):
                    area_match = re.match(r'^([\d.,]+)\s*m[²2]?$', lines[j + 1].strip())
                    if area_match and area is None:
                        area = parse_german_number(area_match.group(1))
                        continue

                # Perimeter: U: 28,50 m
                u_match = re.match(r'^U[=:]\s*([\d.,]+)\s*m$', curr, re.IGNORECASE)
                if u_match:
                    perimeter = parse_german_number(u_match.group(1))
                    continue

                # Height: LH: 3,00 m or LRH: 3,00 m
                lh_match = re.match(r'^L(?:R)?H[=:]\s*([\d.,]+)\s*m$', curr, re.IGNORECASE)
                if lh_match:
                    height = parse_german_number(lh_match.group(1))
                    continue

                # Stop if we hit another room number
                if re.match(r'^B\.\d+\.[0-9A-Z]+\.[A-Z]?\d+$', curr):
                    break

            if area:
                rooms.append(ExtractedRoom(
                    room_number=room_num,
                    room_name=room_name or "Unknown",
                    area_m2=area,
                    counted_m2=area,  # No factor for office spaces
                    factor=1.0,
                    page=page_idx,
                    source_text=f"NRF: {area}",
                    category=categorize_room(room_name or ""),
                    perimeter_m=perimeter,
                    height_m=height,
                    extraction_pattern="NRF:",
                ))
        i += 1

    return rooms
```

### 8. Omniturm Extractor (Highrise)

```python
def extract_omniturm(lines: List[str], page_idx: int) -> List[ExtractedRoom]:
    """
    Extract rooms from Omniturm-style blueprints.
    
    Pattern sequence:
        33_b6.12            ← Room number (floor_grid.room)
        Büro                ← Room name
        NGF: 18,50 m²       ← Net floor area
    
    Also handles shaft rooms:
        Schacht 1
        Lüftung
        4,50 m²
    
    NGF = Netto-Grundfläche (Net Floor Area)
    """
    rooms = []
    processed = set()  # Avoid duplicates
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Look for room number patterns
        room_match = re.match(r'^(\d+_[a-z]\d+\.\d+|BT\d+\.[A-Z]+\.\d+)$', line)
        if room_match and line not in processed:
            room_num = line
            room_name = None
            area = None

            for j in range(i + 1, min(len(lines), i + 15)):
                curr = lines[j].strip()

                # Stop at next room number
                if re.match(r'^(\d+_[a-z]\d+\.\d+|BT\d+\.[A-Z]+\.\d+)$', curr):
                    break

                # Room name (not a measurement label)
                if room_name is None and curr and not re.match(
                    r'^(NGF|UKRD|UKFD|OKFF|OKRF|LRH|[\d,]+\s*m|Schacht)', curr
                ):
                    room_name = curr

                # Area: NGF: 18,50 m²
                ngf_match = re.match(r'^NGF:\s*([\d.,]+)\s*m[²2]?$', curr, re.IGNORECASE)
                if ngf_match:
                    area = parse_german_number(ngf_match.group(1))
                    break

                # Split pattern
                if curr == 'NGF:' and j + 1 < len(lines):
                    area_match = re.match(r'^([\d.,]+)\s*m[²2]?$', lines[j + 1].strip())
                    if area_match:
                        area = parse_german_number(area_match.group(1))
                        break

                # Shaft rooms: "Schacht 1" followed by type and area
                schacht_match = re.match(r'^(Schacht \d+)$', curr)
                if schacht_match:
                    room_name = schacht_match.group(1)
                    if j + 2 < len(lines):
                        type_line = lines[j + 1].strip()
                        area_line = lines[j + 2].strip()
                        if not re.match(r'^[\d,]', type_line):
                            room_name = f"{schacht_match.group(1)} ({type_line})"
                        area_match = re.match(r'^([\d,]+)\s*m[²2]?$', area_line)
                        if area_match:
                            area = parse_german_number(area_match.group(1))
                            break

            if area:
                rooms.append(ExtractedRoom(
                    room_number=room_num,
                    room_name=room_name or "Unknown",
                    area_m2=area,
                    counted_m2=area,
                    factor=1.0,
                    page=page_idx,
                    source_text=f"NGF: {area}",
                    category=categorize_room(room_name or ""),
                    extraction_pattern="NGF:",
                ))
                processed.add(room_num)

        i += 1

    return rooms
```

### 9. Generic Fallback Extractor

```python
def extract_generic(lines: List[str], page_idx: int) -> List[ExtractedRoom]:
    """
    Flexible extractor for unknown blueprint formats.
    
    Strategy:
    1. First pass: Find all area values using flexible patterns
    2. Second pass: Find all room identifiers
    3. Third pass: Associate areas with nearest room IDs
    
    This is less accurate than style-specific extractors but provides
    some extraction for unsupported formats.
    """
    rooms = []
    found_areas = []
    found_room_ids = {}

    # First pass: find all area values
    for i, line in enumerate(lines):
        line = line.strip()

        for pattern in FLEXIBLE_AREA_PATTERNS:
            match = pattern.search(line)
            if match:
                try:
                    area = parse_german_number(match.group(1))
                    # Sanity check: area should be reasonable (0.5 to 10000 m²)
                    if 0.5 <= area <= 10000:
                        found_areas.append({
                            'line_idx': i,
                            'area': area,
                            'source_line': line,
                            'pattern': pattern.pattern[:30],
                        })
                except (ValueError, IndexError):
                    pass
                break

    # Second pass: find all room identifiers
    for i, line in enumerate(lines):
        line = line.strip()

        for pattern in FLEXIBLE_ROOM_PATTERNS:
            match = pattern.match(line)
            if match:
                room_id = match.group(1)
                if room_id not in found_room_ids:
                    found_room_ids[room_id] = i
                break

    # Third pass: associate areas with nearest room IDs
    used_areas = set()

    for room_id, room_line_idx in found_room_ids.items():
        best_area = None
        best_distance = float('inf')
        best_area_idx = None

        for area_idx, area_info in enumerate(found_areas):
            if area_idx in used_areas:
                continue

            # Calculate distance (prefer areas AFTER room number)
            distance = abs(area_info['line_idx'] - room_line_idx)
            if area_info['line_idx'] > room_line_idx:
                distance -= 0.5  # Slight preference for areas after room number

            if distance < best_distance and distance < 15:
                best_distance = distance
                best_area = area_info
                best_area_idx = area_idx

        if best_area:
            used_areas.add(best_area_idx)

            # Try to find room name between room number and area
            room_name = None
            start_search = room_line_idx + 1
            end_search = best_area['line_idx']

            for j in range(start_search, min(end_search, start_search + 5)):
                if j < len(lines):
                    candidate = lines[j].strip()
                    # Room name: not empty, not just numbers, not a label
                    if (candidate and
                        len(candidate) > 1 and
                        not re.match(r'^[\d,.\s]+$', candidate) and
                        not re.match(r'^(NRF|NGF|F|U|LH|BA|B|W|D|OK|UK)[\s:=]', candidate, re.IGNORECASE) and
                        not re.match(r'^[\d.,]+\s*m[²2]?$', candidate)):
                        room_name = candidate
                        break

            rooms.append(ExtractedRoom(
                room_number=room_id,
                room_name=room_name or "Unknown",
                area_m2=best_area['area'],
                counted_m2=best_area['area'],
                factor=1.0,
                page=page_idx,
                source_text=best_area['source_line'],
                category=categorize_room(room_name or ""),
                extraction_pattern="generic",
            ))

    return rooms
```

### 10. Main Extraction Function

```python
import fitz  # PyMuPDF
from pathlib import Path
from typing import Union, Optional, List

def extract_room_areas(
    pdf_path: Union[str, Path],
    style: Optional[BlueprintStyle] = None,
    pages: Optional[List[int]] = None,
) -> ExtractionResult:
    """
    Extract room areas from PDF with automatic style detection.

    Args:
        pdf_path: Path to PDF file
        style: Optional blueprint style (auto-detected if None)
        pages: Optional list of page indices (all pages if None)

    Returns:
        ExtractionResult with rooms, totals, and full traceability

    Example:
        >>> result = extract_room_areas("floorplan.pdf")
        >>> print(f"Found {result.room_count} rooms")
        >>> print(f"Total area: {result.total_area_m2} m²")
        >>> for room in result.rooms:
        ...     print(f"  {room.room_number}: {room.area_m2} m² (source: {room.source_text})")
    """
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")

    try:
        doc = fitz.open(str(path))
    except Exception as e:
        raise ValueError(f"Failed to open PDF: {e}")

    # Get full text for style detection
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    # Detect or use provided style
    detected_style = style or detect_blueprint_style(full_text)

    # Select extraction function
    extract_fn = {
        BlueprintStyle.HAARDTRING: extract_haardtring,
        BlueprintStyle.LEIQ: extract_leiq,
        BlueprintStyle.OMNITURM: extract_omniturm,
    }.get(detected_style)

    rooms: List[ExtractedRoom] = []
    warnings: List[str] = []

    if not extract_fn:
        warnings.append(f"Unknown blueprint style, using flexible extraction")
        extract_fn = extract_generic

    # Process pages
    page_indices = pages if pages is not None else range(len(doc))

    for page_idx in page_indices:
        if page_idx >= len(doc):
            warnings.append(f"Page {page_idx} does not exist")
            continue

        page = doc[page_idx]
        text = page.get_text()
        lines = text.split('\n')

        page_rooms = extract_fn(lines, page_idx)
        rooms.extend(page_rooms)

        # If no rooms found, try fallback extractors
        if not page_rooms:
            for alt_style, alt_fn in [
                (BlueprintStyle.HAARDTRING, extract_haardtring),
                (BlueprintStyle.LEIQ, extract_leiq),
                (BlueprintStyle.OMNITURM, extract_omniturm),
            ]:
                if alt_fn != extract_fn:
                    alt_rooms = alt_fn(lines, page_idx)
                    if alt_rooms:
                        rooms.extend(alt_rooms)
                        warnings.append(f"Page {page_idx}: Used {alt_style.value} as fallback")
                        break

            # Last resort: generic extraction
            if not page_rooms and extract_fn != extract_generic:
                generic_rooms = extract_generic(lines, page_idx)
                if generic_rooms:
                    rooms.extend(generic_rooms)
                    warnings.append(f"Page {page_idx}: Used generic extraction")

    page_count = len(doc)
    doc.close()

    # Calculate totals
    total_area = round(sum(r.area_m2 for r in rooms), 2)
    total_counted = round(sum(r.counted_m2 for r in rooms), 2)

    # Calculate totals by category
    totals_by_category = {}
    for room in rooms:
        cat = room.category.value
        totals_by_category[cat] = totals_by_category.get(cat, 0) + room.counted_m2
    totals_by_category = {k: round(v, 2) for k, v in totals_by_category.items()}

    return ExtractionResult(
        rooms=rooms,
        total_area_m2=total_area,
        total_counted_m2=total_counted,
        room_count=len(rooms),
        page_count=page_count,
        blueprint_style=detected_style,
        extraction_method="unified_extraction",
        warnings=warnings,
        totals_by_category=totals_by_category,
    )
```

### 11. FastAPI Service (`main.py`)

```python
import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from area_extraction import extract_room_areas, BlueprintStyle

app = FastAPI(
    title="Area Extraction Service",
    description="Extract room areas from German CAD PDFs with full traceability",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "area-extraction"}


@app.post("/extract")
async def extract_areas(
    file: UploadFile = File(...),
    style: Optional[str] = Query(None, description="Blueprint style: haardtring, leiq, omniturm"),
    pages: Optional[str] = Query(None, description="Comma-separated page indices (0-based)"),
):
    """
    Extract room areas from a PDF floor plan.
    
    Returns:
    - List of rooms with areas, names, and source references
    - Total area statistics
    - Detected blueprint style
    - Any warnings or fallbacks used
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are supported")

    # Parse optional parameters
    style_enum = BlueprintStyle(style) if style else None
    page_list = [int(p.strip()) for p in pages.split(',')] if pages else None

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = extract_room_areas(tmp_path, style_enum, page_list)
        return result.to_dict()

    except Exception as e:
        raise HTTPException(500, f"Extraction failed: {str(e)}")

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/extract/summary")
async def extract_summary(file: UploadFile = File(...)):
    """
    Quick summary extraction - just totals and room count.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = extract_room_areas(tmp_path)
        return {
            "total_rooms": result.room_count,
            "total_area_m2": result.total_area_m2,
            "total_counted_m2": result.total_counted_m2,
            "blueprint_style": result.blueprint_style.value,
            "categories": result.totals_by_category,
            "has_warnings": len(result.warnings) > 0,
            "page_count": result.page_count,
        }

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### 12. Next.js API Proxy (`app/api/extract/areas/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:8001';

export interface ExtractedRoom {
  room_number: string;
  room_name: string;
  area_m2: number;
  counted_m2: number;
  factor: number;
  page: number;
  source_text: string;
  category: string;
  extraction_pattern: string;
  perimeter_m?: number;
  height_m?: number;
}

export interface ExtractionResult {
  rooms: ExtractedRoom[];
  total_area_m2: number;
  total_counted_m2: number;
  room_count: number;
  page_count: number;
  blueprint_style: string;
  warnings: string[];
  totals_by_category: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const style = formData.get('style') as string | null;
    const pages = formData.get('pages') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Build query string
    const params = new URLSearchParams();
    if (style) params.set('style', style);
    if (pages) params.set('pages', pages);

    const queryString = params.toString();
    const url = `${PDF_SERVICE_URL}/extract${queryString ? `?${queryString}` : ''}`;

    // Forward to Python service
    const serviceFormData = new FormData();
    serviceFormData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      body: serviceFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Extraction failed: ${error}` },
        { status: response.status }
      );
    }

    const result: ExtractionResult = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Area extraction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Integration with AngebotsAgent

### Using Extracted Areas for Takeoff

```typescript
// lib/takeoff/from-extraction.ts
import { ExtractedRoom, ExtractionResult } from '@/types/extraction';
import { TakeoffResult } from '@/types/takeoff';

export function convertToTakeoffResults(
  extraction: ExtractionResult,
  documentId: string,
  documentName: string
): TakeoffResult[] {
  return extraction.rooms.map(room => ({
    id: crypto.randomUUID(),
    projectId: '', // Set by caller
    documentId,
    label: `${room.room_number} - ${room.room_name}`,
    measurementType: 'area',
    value: room.counted_m2,
    unit: 'm²',
    sourceType: 'extracted',
    pageReference: `${documentName}, Page ${room.page + 1}`,
    confidence: room.extraction_pattern === 'generic' ? 0.7 : 0.95,
    notes: room.factor < 1.0 
      ? `Factor ${room.factor} applied (${room.factor_source})`
      : undefined,
    createdAt: new Date(),
  }));
}

// Group by category for pricing
export function groupByCategory(
  extraction: ExtractionResult
): Map<string, { rooms: ExtractedRoom[]; totalArea: number }> {
  const groups = new Map();
  
  for (const room of extraction.rooms) {
    const existing = groups.get(room.category) || { rooms: [], totalArea: 0 };
    existing.rooms.push(room);
    existing.totalArea += room.counted_m2;
    groups.set(room.category, existing);
  }
  
  return groups;
}
```

### Comparing Extracted vs. Stated Quantities

```typescript
// lib/change-orders/quantity-comparison.ts
import { ExtractionResult } from '@/types/extraction';
import { QuantityItem } from '@/types/tender';

export interface QuantityComparison {
  description: string;
  statedValue: number;
  extractedValue: number;
  difference: number;
  differencePercent: number;
  significant: boolean;
  extractedRooms: string[];
}

export function compareQuantities(
  extraction: ExtractionResult,
  statedQuantities: QuantityItem[]
): QuantityComparison[] {
  const comparisons: QuantityComparison[] = [];
  
  // Compare total area
  const statedTotal = statedQuantities
    .filter(q => q.unit === 'm²')
    .reduce((sum, q) => sum + q.value, 0);
  
  if (statedTotal > 0) {
    const diff = extraction.total_counted_m2 - statedTotal;
    const diffPercent = (diff / statedTotal) * 100;
    
    comparisons.push({
      description: 'Gesamtfläche',
      statedValue: statedTotal,
      extractedValue: extraction.total_counted_m2,
      difference: diff,
      differencePercent: diffPercent,
      significant: Math.abs(diffPercent) > 5,
      extractedRooms: extraction.rooms.map(r => r.room_number),
    });
  }
  
  // Compare by category
  for (const [category, total] of Object.entries(extraction.totals_by_category)) {
    const statedCategory = statedQuantities.find(q => 
      q.description.toLowerCase().includes(category)
    );
    
    if (statedCategory) {
      const diff = total - statedCategory.value;
      const diffPercent = (diff / statedCategory.value) * 100;
      
      comparisons.push({
        description: `${category} Fläche`,
        statedValue: statedCategory.value,
        extractedValue: total,
        difference: diff,
        differencePercent: diffPercent,
        significant: Math.abs(diffPercent) > 5,
        extractedRooms: extraction.rooms
          .filter(r => r.category === category)
          .map(r => r.room_number),
      });
    }
  }
  
  return comparisons;
}
```

## Best Practices

1. **Never invent data**: If extraction fails, return "Not found" with warning
2. **Always cite source**: Every value must have `source_text` showing what was parsed
3. **Use confidence scores**: Generic extraction = lower confidence than style-specific
4. **Preserve original values**: Store raw `area_m2` before applying factors
5. **Document factors**: When applying 50% for balconies, record `factor_source`
6. **Handle German numbers**: Always use `parse_german_number()` for area values
7. **Fallback gracefully**: Try style-specific → other styles → generic → warn user

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| No rooms extracted | Check if PDF is image-based (needs OCR) |
| Wrong style detected | Allow manual style override via parameter |
| Area values wrong | Check German number format (comma vs. period) |
| Room names missing | Adjust search window between room number and area |
| Duplicate rooms | Use `processed` set to track extracted room numbers |
| Balconies full-counted | Check for "50%:" pattern or outdoor category |

## Checklist

- [ ] Install PyMuPDF and pdfplumber
- [ ] Implement style detection from PDF text
- [ ] Create extractors for each blueprint style
- [ ] Add generic fallback extractor
- [ ] Implement German number parsing
- [ ] Add room categorization
- [ ] Create FastAPI service
- [ ] Build Next.js API proxy
- [ ] Add integration with takeoff system
- [ ] Add integration with change order detection
- [ ] Test with real German floor plans
- [ ] Verify traceability (source_text populated)
