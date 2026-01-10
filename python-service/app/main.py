"""
AngebotsAgent Python Extraction Service

FastAPI microservice for PDF processing and document extraction.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging

from app.services.pdf_parser import PDFParser
from app.services.lv_extractor import LVExtractor
from app.services.area_extractor import (
    extract_room_areas,
    extract_room_areas_pdfplumber,
    extract_to_dict,
    BlueprintStyle,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AngebotsAgent Extraction Service",
    description="PDF processing and document extraction for construction tender documents",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class ExtractionResult(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


class ExtractedPosition(BaseModel):
    position_number: Optional[str] = None
    oz_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    long_text: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    page_number: Optional[int] = None
    page_reference: Optional[str] = None
    confidence: Optional[float] = None


class LVExtractionResponse(BaseModel):
    success: bool
    document_type: str
    page_count: int
    positions: List[ExtractedPosition]
    summary: dict


class ExtractedRoom(BaseModel):
    """A single extracted room with full traceability."""
    room_number: str
    room_name: str
    area_m2: float
    counted_m2: float
    factor: float
    page: int
    source_text: str
    category: str
    extraction_pattern: str
    bbox: Optional[dict] = None
    perimeter_m: Optional[float] = None
    height_m: Optional[float] = None
    factor_source: Optional[str] = None


class AreaExtractionResponse(BaseModel):
    """Response for area extraction endpoint."""
    success: bool
    rooms: List[ExtractedRoom]
    total_area_m2: float
    total_counted_m2: float
    room_count: int
    page_count: int
    blueprint_style: str
    extraction_method: str
    warnings: List[str]
    totals_by_category: dict


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "extraction-service"}


# Extract text from PDF
@app.post("/extract/text", response_model=ExtractionResult)
async def extract_text(file: UploadFile = File(...)):
    """
    Extract raw text from a PDF file.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        parser = PDFParser()
        result = parser.extract_text(content)

        return ExtractionResult(
            success=True,
            message=f"Extracted text from {result['page_count']} pages",
            data=result
        )
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Extract LV positions
@app.post("/extract/lv", response_model=LVExtractionResponse)
async def extract_lv(file: UploadFile = File(...)):
    """
    Extract structured positions from a Leistungsverzeichnis (LV) PDF.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        extractor = LVExtractor()
        result = extractor.extract_positions(content)

        positions = [
            ExtractedPosition(**pos) for pos in result.get('positions', [])
        ]

        return LVExtractionResponse(
            success=True,
            document_type="leistungsverzeichnis",
            page_count=result.get('page_count', 0),
            positions=positions,
            summary=result.get('summary', {})
        )
    except Exception as e:
        logger.error(f"LV extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Extract room areas from blueprint PDFs
@app.post("/extract/areas", response_model=AreaExtractionResponse)
async def extract_areas(
    file: UploadFile = File(...),
    style: Optional[str] = None
):
    """
    Extract room areas from German CAD-generated PDFs.

    Supported styles (auto-detected if not specified):
    - haardtring: Residential (F: pattern, R2.E5.3.5 room numbers)
    - leiq: Office (NRF: pattern, B.00.2.002 room numbers)
    - omniturm: Highrise (NGF: pattern, 33_b6.12 room numbers)

    Returns fully traceable extraction results with source text references.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()

        # Parse style if provided
        style_enum = None
        if style:
            try:
                style_enum = BlueprintStyle(style.lower())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid style. Use: haardtring, leiq, omniturm, or leave empty for auto-detect"
                )

        # Try PyMuPDF first, fall back to pdfplumber
        try:
            result = extract_room_areas(pdf_content=content, style=style_enum)
        except ImportError:
            logger.warning("PyMuPDF not available, using pdfplumber fallback")
            result = extract_room_areas_pdfplumber(pdf_content=content)

        # Convert rooms to response format
        rooms = [
            ExtractedRoom(
                room_number=r.room_number,
                room_name=r.room_name,
                area_m2=r.area_m2,
                counted_m2=r.counted_m2,
                factor=r.factor,
                page=r.page,
                source_text=r.source_text,
                category=r.category.value,
                extraction_pattern=r.extraction_pattern,
                bbox=r.bbox.to_dict() if r.bbox else None,
                perimeter_m=r.perimeter_m,
                height_m=r.height_m,
                factor_source=r.factor_source,
            )
            for r in result.rooms
        ]

        return AreaExtractionResponse(
            success=True,
            rooms=rooms,
            total_area_m2=result.total_area_m2,
            total_counted_m2=result.total_counted_m2,
            room_count=result.room_count,
            page_count=result.page_count,
            blueprint_style=result.blueprint_style.value,
            extraction_method=result.extraction_method,
            warnings=result.warnings,
            totals_by_category=result.totals_by_category,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Area extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Legacy endpoint - redirects to /extract/areas
@app.post("/extract/plan", response_model=ExtractionResult)
async def extract_plan(file: UploadFile = File(...)):
    """
    Extract room schedules and area tables from plan PDFs.

    Note: For full area extraction with traceability, use /extract/areas instead.
    This endpoint returns a simplified summary.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()

        # Use the deterministic area extractor
        try:
            result = extract_room_areas(pdf_content=content)
        except ImportError:
            result = extract_room_areas_pdfplumber(pdf_content=content)

        return ExtractionResult(
            success=True,
            message=f"Extracted {result.room_count} rooms, total {result.total_area_m2} m²",
            data={
                "page_count": result.page_count,
                "room_count": result.room_count,
                "total_area_m2": result.total_area_m2,
                "total_counted_m2": result.total_counted_m2,
                "blueprint_style": result.blueprint_style.value,
                "totals_by_category": result.totals_by_category,
                "rooms_preview": [
                    {
                        "room_number": r.room_number,
                        "room_name": r.room_name,
                        "area_m2": r.area_m2,
                        "source_text": r.source_text,
                    }
                    for r in result.rooms[:20]  # First 20 rooms
                ],
                "warnings": result.warnings,
            }
        )
    except Exception as e:
        logger.error(f"Plan extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Analyze for risk flags (stub for MVP)
@app.post("/analyze/risks", response_model=ExtractionResult)
async def analyze_risks(
    lv_data: dict,
    takeoff_data: Optional[dict] = None
):
    """
    Analyze extracted data for potential change orders (Nachtragspotenziale).
    MVP: Rule-based analysis. AI-enhanced analysis to be added.
    """
    try:
        risks = []

        # Example rule: Quantity mismatch
        if takeoff_data:
            for lv_pos in lv_data.get('positions', []):
                pos_num = lv_pos.get('position_number')
                lv_qty = lv_pos.get('quantity', 0)

                for takeoff in takeoff_data.get('results', []):
                    if takeoff.get('position_number') == pos_num:
                        takeoff_qty = takeoff.get('quantity', 0)
                        if lv_qty and takeoff_qty:
                            diff_percent = abs(takeoff_qty - lv_qty) / lv_qty * 100
                            if diff_percent > 10:
                                risks.append({
                                    'title': f'Mengenabweichung Position {pos_num}',
                                    'description': f'LV: {lv_qty}, Messung: {takeoff_qty} (Abweichung: {diff_percent:.1f}%)',
                                    'category': 'mengenabweichung',
                                    'severity': 'high' if diff_percent > 20 else 'medium',
                                    'source_reference': f'LV Position {pos_num}',
                                })

        return ExtractionResult(
            success=True,
            message=f"Found {len(risks)} potential risks",
            data={'risks': risks}
        )
    except Exception as e:
        logger.error(f"Risk analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
