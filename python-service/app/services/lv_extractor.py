"""
LV Extractor Service

Extracts structured positions from German Leistungsverzeichnis (tender documents).
Uses regex patterns and heuristics for German construction document formats.
"""

import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from app.services.pdf_parser import PDFParser

logger = logging.getLogger(__name__)


@dataclass
class ExtractedPosition:
    """Represents an extracted LV position."""
    position_number: str
    oz_number: Optional[str]
    title: str
    description: Optional[str]
    long_text: Optional[str]
    quantity: Optional[float]
    unit: Optional[str]
    page_number: int
    page_reference: str
    confidence: float


class LVExtractor:
    """
    Extracts structured positions from Leistungsverzeichnis PDFs.

    Handles common German LV formats:
    - GAEB-style position numbers (01.02.0030)
    - StLB-Bau position structures
    - Free-form tender documents
    """

    # Common German units in construction
    UNITS = {
        'm': ['m', 'lfm', 'lfdm', 'lm'],
        'm2': ['m²', 'm2', 'qm'],
        'm3': ['m³', 'm3', 'cbm'],
        'stk': ['stk', 'stck', 'st', 'stück'],
        'kg': ['kg', 'kilogramm'],
        'psch': ['psch', 'pauschal', 'psch.'],
        'h': ['h', 'std', 'stunde', 'stunden'],
        't': ['t', 'to', 'tonne', 'tonnen'],
        'l': ['l', 'ltr', 'liter'],
    }

    # Regex patterns for position numbers
    POSITION_PATTERNS = [
        # GAEB format: 01.02.0030 or 1.2.30
        r'(\d{1,2})[.\s](\d{1,2})[.\s](\d{1,4})',
        # Simple: 01.020 or 1.20
        r'(\d{1,2})[.\s](\d{2,4})',
        # OZ format with letters: A.01.020
        r'([A-Z])[.\s](\d{1,2})[.\s](\d{2,4})',
        # Numbered list: 1., 2., etc.
        r'^(\d{1,3})\.\s',
    ]

    # Quantity patterns
    QUANTITY_PATTERNS = [
        # Number with unit: 125,50 m²
        r'(\d{1,6}(?:[.,]\d{1,3})?)\s*(m²|m2|m³|m3|m|lfm|stk|stck|kg|psch|h|std|qm|cbm)',
        # Just number at end of line after colon or equals
        r'[=:]\s*(\d{1,6}(?:[.,]\d{1,3})?)\s*(m²|m2|m³|m3|m|lfm|stk|stck|kg|psch|h|std|qm|cbm)?',
        # Menge: pattern
        r'Menge[:\s]+(\d{1,6}(?:[.,]\d{1,3})?)\s*(m²|m2|m³|m3|m|lfm|stk|stck|kg|psch|h|std|qm|cbm)?',
    ]

    def __init__(self):
        self.pdf_parser = PDFParser()

    def extract_positions(self, pdf_content: bytes) -> Dict[str, Any]:
        """
        Extract all positions from an LV PDF.

        Args:
            pdf_content: PDF file content as bytes

        Returns:
            Dict containing positions, page_count, and summary
        """
        # First, extract raw text
        parsed = self.pdf_parser.extract_text(pdf_content)

        positions = []
        current_position = None

        for page_data in parsed['pages']:
            page_num = page_data['page_number']
            text = page_data['text']

            if not text:
                continue

            # Split into lines for processing
            lines = text.split('\n')

            for line_idx, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue

                # Try to detect position start
                pos_match = self._detect_position_start(line)

                if pos_match:
                    # Save previous position if exists
                    if current_position:
                        positions.append(self._finalize_position(current_position))

                    # Start new position
                    current_position = {
                        'position_number': pos_match['position_number'],
                        'oz_number': pos_match.get('oz_number'),
                        'title': pos_match.get('title', ''),
                        'description_lines': [],
                        'long_text_lines': [],
                        'quantity': None,
                        'unit': None,
                        'page_number': page_num,
                        'start_line': line_idx,
                        'confidence': pos_match.get('confidence', 0.7),
                    }

                    # Check if title is on same line
                    remaining = pos_match.get('remaining_text', '')
                    if remaining:
                        current_position['title'] = remaining

                elif current_position:
                    # Continue building current position
                    # Check for quantity
                    qty_match = self._extract_quantity(line)
                    if qty_match and not current_position['quantity']:
                        current_position['quantity'] = qty_match['quantity']
                        current_position['unit'] = qty_match['unit']
                        current_position['confidence'] = max(
                            current_position['confidence'],
                            qty_match.get('confidence', 0.6)
                        )

                    # Add to description or long text
                    if len(current_position['description_lines']) < 3:
                        current_position['description_lines'].append(line)
                    else:
                        current_position['long_text_lines'].append(line)

        # Don't forget last position
        if current_position:
            positions.append(self._finalize_position(current_position))

        # Generate summary
        summary = self._generate_summary(positions)

        return {
            'page_count': parsed['page_count'],
            'positions': [self._position_to_dict(p) for p in positions],
            'summary': summary,
            'tables_found': len(parsed.get('tables', [])),
        }

    def _detect_position_start(self, line: str) -> Optional[Dict[str, Any]]:
        """
        Detect if a line starts a new position.

        Returns position info if detected, None otherwise.
        """
        # Try each pattern
        for pattern in self.POSITION_PATTERNS:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                groups = match.groups()
                pos_num = '.'.join(g for g in groups if g)

                # Get remaining text after position number
                remaining = line[match.end():].strip()

                # Clean up common prefixes
                remaining = re.sub(r'^[:\-\s]+', '', remaining)

                return {
                    'position_number': pos_num,
                    'oz_number': self._format_oz_number(groups),
                    'remaining_text': remaining,
                    'confidence': 0.8 if len(groups) >= 2 else 0.6,
                }

        return None

    def _format_oz_number(self, groups: Tuple) -> Optional[str]:
        """Format OZ number from matched groups."""
        if len(groups) >= 3:
            return f"{groups[0]}.{groups[1]}.{groups[2]}"
        elif len(groups) == 2:
            return f"{groups[0]}.{groups[1]}"
        return None

    def _extract_quantity(self, line: str) -> Optional[Dict[str, Any]]:
        """
        Extract quantity and unit from a line.

        Returns dict with quantity, unit, confidence if found.
        """
        for pattern in self.QUANTITY_PATTERNS:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                groups = match.groups()
                qty_str = groups[0].replace(',', '.')

                try:
                    quantity = float(qty_str)
                except ValueError:
                    continue

                unit = None
                if len(groups) > 1 and groups[1]:
                    unit = self._normalize_unit(groups[1])

                return {
                    'quantity': quantity,
                    'unit': unit,
                    'confidence': 0.85 if unit else 0.6,
                }

        return None

    def _normalize_unit(self, unit: str) -> str:
        """Normalize unit to standard form."""
        unit_lower = unit.lower().strip()

        for standard, variants in self.UNITS.items():
            if unit_lower in variants:
                return standard

        return unit_lower

    def _finalize_position(self, pos_data: Dict) -> ExtractedPosition:
        """Convert raw position data to ExtractedPosition."""
        # Build description from lines
        description = ' '.join(pos_data['description_lines'][:3])

        # Build long text
        long_text = '\n'.join(pos_data['long_text_lines']) if pos_data['long_text_lines'] else None

        # If no title, use first description line
        title = pos_data['title']
        if not title and description:
            title = description[:100]

        return ExtractedPosition(
            position_number=pos_data['position_number'],
            oz_number=pos_data.get('oz_number'),
            title=title,
            description=description if description != title else None,
            long_text=long_text,
            quantity=pos_data.get('quantity'),
            unit=pos_data.get('unit'),
            page_number=pos_data['page_number'],
            page_reference=f"Seite {pos_data['page_number']}",
            confidence=pos_data.get('confidence', 0.5),
        )

    def _position_to_dict(self, pos: ExtractedPosition) -> Dict[str, Any]:
        """Convert ExtractedPosition to dictionary."""
        return {
            'position_number': pos.position_number,
            'oz_number': pos.oz_number,
            'title': pos.title,
            'description': pos.description,
            'long_text': pos.long_text,
            'quantity': pos.quantity,
            'unit': pos.unit,
            'page_number': pos.page_number,
            'page_reference': pos.page_reference,
            'confidence': pos.confidence,
        }

    def _generate_summary(self, positions: List[ExtractedPosition]) -> Dict[str, Any]:
        """Generate summary statistics for extracted positions."""
        total = len(positions)
        with_quantity = sum(1 for p in positions if p.quantity is not None)
        with_unit = sum(1 for p in positions if p.unit is not None)

        # Count by unit type
        unit_counts = {}
        for pos in positions:
            if pos.unit:
                unit_counts[pos.unit] = unit_counts.get(pos.unit, 0) + 1

        # Average confidence
        avg_confidence = (
            sum(p.confidence for p in positions) / total if total > 0 else 0
        )

        return {
            'total_positions': total,
            'positions_with_quantity': with_quantity,
            'positions_with_unit': with_unit,
            'unit_distribution': unit_counts,
            'average_confidence': round(avg_confidence, 2),
            'extraction_quality': self._assess_quality(total, with_quantity, avg_confidence),
        }

    def _assess_quality(
        self,
        total: int,
        with_quantity: int,
        avg_confidence: float
    ) -> str:
        """Assess overall extraction quality."""
        if total == 0:
            return 'keine_positionen'

        qty_ratio = with_quantity / total if total > 0 else 0

        if avg_confidence >= 0.8 and qty_ratio >= 0.8:
            return 'gut'
        elif avg_confidence >= 0.6 and qty_ratio >= 0.5:
            return 'mittel'
        else:
            return 'pruefung_erforderlich'


class TenderSummaryExtractor:
    """
    Extracts project-level information from tender documents.

    Looks for:
    - Project name/title
    - Client (Auftraggeber/Bauherr)
    - Submission deadline (Abgabefrist)
    - Project location
    - Lot/section information (Los, Bauabschnitt)
    """

    PATTERNS = {
        'project_name': [
            r'Projekt[:\s]+(.+)',
            r'Bauvorhaben[:\s]+(.+)',
            r'Objekt[:\s]+(.+)',
        ],
        'client': [
            r'Auftraggeber[:\s]+(.+)',
            r'Bauherr[:\s]+(.+)',
            r'AG[:\s]+(.+)',
        ],
        'deadline': [
            r'Abgabe(?:frist|termin)?[:\s]+(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})',
            r'Submission[:\s]+(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})',
            r'bis(?:\s+zum)?[:\s]+(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})',
        ],
        'location': [
            r'Bauort[:\s]+(.+)',
            r'Standort[:\s]+(.+)',
            r'Adresse[:\s]+(.+)',
        ],
        'lot': [
            r'Los\s*(\d+)',
            r'Bauabschnitt\s*(\d+)',
            r'BA\s*(\d+)',
        ],
    }

    def __init__(self):
        self.pdf_parser = PDFParser()

    def extract_summary(self, pdf_content: bytes, max_pages: int = 5) -> Dict[str, Any]:
        """
        Extract project summary from first pages of tender document.

        Args:
            pdf_content: PDF file content as bytes
            max_pages: Number of pages to scan (default 5)

        Returns:
            Dict with extracted project information
        """
        parsed = self.pdf_parser.extract_text(pdf_content)

        result = {
            'project_name': None,
            'client': None,
            'deadline': None,
            'location': None,
            'lot': None,
            'confidence': 0.0,
        }

        # Scan first pages
        pages_to_scan = min(max_pages, len(parsed['pages']))
        text_to_scan = '\n'.join(
            p['text'] for p in parsed['pages'][:pages_to_scan]
            if p['text']
        )

        matches_found = 0

        for field, patterns in self.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text_to_scan, re.IGNORECASE | re.MULTILINE)
                if match:
                    value = match.group(1).strip()
                    # Clean up value
                    value = re.sub(r'\s+', ' ', value)
                    value = value[:200]  # Limit length

                    result[field] = value
                    matches_found += 1
                    break

        # Calculate confidence based on fields found
        result['confidence'] = min(matches_found / len(self.PATTERNS), 1.0)

        return result
