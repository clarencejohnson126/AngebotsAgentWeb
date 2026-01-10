"""
PDF Parser Service

Extracts text and tables from PDF documents using pdfplumber.
"""

import io
import logging
from typing import List, Dict, Any, Optional
import pdfplumber

logger = logging.getLogger(__name__)


class PDFParser:
    """
    PDF parsing service for text and table extraction.
    """

    def extract_text(self, pdf_content: bytes) -> Dict[str, Any]:
        """
        Extract text from all pages of a PDF.

        Args:
            pdf_content: PDF file content as bytes

        Returns:
            Dict containing page_count, pages (list of page texts), full_text, and tables
        """
        result = {
            'page_count': 0,
            'pages': [],
            'full_text': '',
            'tables': [],
        }

        try:
            with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                result['page_count'] = len(pdf.pages)

                for page_num, page in enumerate(pdf.pages, start=1):
                    # Extract text
                    text = page.extract_text() or ''
                    result['pages'].append({
                        'page_number': page_num,
                        'text': text,
                        'width': page.width,
                        'height': page.height,
                    })

                    # Extract tables
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if table:
                            result['tables'].append({
                                'page_number': page_num,
                                'table_index': table_idx,
                                'data': table,
                            })

                # Combine all text
                result['full_text'] = '\n\n'.join(
                    p['text'] for p in result['pages'] if p['text']
                )

        except Exception as e:
            logger.error(f"PDF parsing error: {e}")
            raise

        return result

    def extract_page(self, pdf_content: bytes, page_number: int) -> Dict[str, Any]:
        """
        Extract content from a specific page.

        Args:
            pdf_content: PDF file content as bytes
            page_number: Page number (1-indexed)

        Returns:
            Dict containing page text and tables
        """
        try:
            with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                if page_number < 1 or page_number > len(pdf.pages):
                    raise ValueError(f"Page {page_number} not found. PDF has {len(pdf.pages)} pages.")

                page = pdf.pages[page_number - 1]

                return {
                    'page_number': page_number,
                    'text': page.extract_text() or '',
                    'tables': page.extract_tables(),
                    'width': page.width,
                    'height': page.height,
                }

        except Exception as e:
            logger.error(f"Page extraction error: {e}")
            raise

    def find_text_positions(
        self,
        pdf_content: bytes,
        search_term: str,
        case_sensitive: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Find positions of text occurrences in the PDF.

        Args:
            pdf_content: PDF file content as bytes
            search_term: Text to search for
            case_sensitive: Whether search is case-sensitive

        Returns:
            List of dicts with page_number, text, and bounding box
        """
        results = []

        try:
            with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text() or ''

                    if not case_sensitive:
                        search_in = text.lower()
                        search_for = search_term.lower()
                    else:
                        search_in = text
                        search_for = search_term

                    if search_for in search_in:
                        # Found on this page
                        # Note: pdfplumber doesn't provide exact character positions easily
                        # For MVP, we just note the page number
                        results.append({
                            'page_number': page_num,
                            'found': True,
                            'context': text[:500],  # First 500 chars as context
                        })

        except Exception as e:
            logger.error(f"Text search error: {e}")
            raise

        return results

    def get_metadata(self, pdf_content: bytes) -> Dict[str, Any]:
        """
        Extract PDF metadata.

        Args:
            pdf_content: PDF file content as bytes

        Returns:
            Dict containing PDF metadata
        """
        try:
            with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                return {
                    'page_count': len(pdf.pages),
                    'metadata': pdf.metadata or {},
                }
        except Exception as e:
            logger.error(f"Metadata extraction error: {e}")
            raise
