
"""
NyayaSetu document upload and preliminary AI review endpoint.

Supported uploads: searchable PDF and UTF-8 TXT.
Images and scanned PDFs require OCR, which is not implemented here.
Uploaded files are processed in memory and are not persisted.
"""

import io
import logging
import os
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/documents", tags=["Document Analysis"])

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_ANALYSIS_TEXT = 30_000
MAX_EXTRACTED_TEXT = 100_000
MAX_PDF_PAGES = 50

ALLOWED_TYPES = {
    "application/pdf",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
}


class DocumentReview(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    extracted_text: str
    review_status: str
    message: str
    next_steps: list[str]


def extract_pdf_text(data: bytes) -> str:
    """Extract selectable text from a PDF."""
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))

        if len(reader.pages) > MAX_PDF_PAGES:
            raise HTTPException(
                status_code=400,
                detail=f"PDFs must contain no more than {MAX_PDF_PAGES} pages.",
            )

        if reader.is_encrypted:
            try:
                if reader.decrypt("") == 0:
                    raise HTTPException(
                        status_code=400,
                        detail="This PDF is password-protected. Upload an accessible copy.",
                    )
            except HTTPException:
                raise
            except Exception as exc:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to open the protected PDF.",
                ) from exc

        parts = []

        for page in reader.pages:
            parts.append(page.extract_text() or "")

        return "\n".join(parts).strip()

    except HTTPException:
        raise
    except ImportError as exc:
        logger.exception("pypdf is not installed")
        raise HTTPException(
            status_code=500,
            detail="PDF processing is unavailable. Install the pypdf dependency.",
        ) from exc
    except Exception as exc:
        logger.exception("PDF text extraction failed")
        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF. Upload a valid, accessible PDF.",
        ) from exc


def get_ai_review_text(result: Any) -> str:
    """Accept common AI service return formats safely."""
    if isinstance(result, str):
        return result.strip()

    if isinstance(result, dict):
        for key in ("analysis", "response", "content", "text"):
            value = result.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    return ""


@router.post("/analyze", response_model=DocumentReview)
async def analyze_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> DocumentReview:
    """Extract text and request a preliminary AI review."""
    del db  # This endpoint does not store files in the database.

    try:
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Please select a file.",
            )

        filename = os.path.basename(file.filename).strip()
        content_type = (file.content_type or "").split(";")[0].strip().lower()

        if content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=415,
                detail="Supported file types are PDF, TXT, JPG, PNG, and WEBP.",
            )

        # Read at most 1 byte beyond the limit to detect oversized uploads.
        data = await file.read(MAX_FILE_SIZE + 1)

        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="The file exceeds the 10 MB upload limit.",
            )

        if not data:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        # Basic signature checks help reject files whose contents do not
        # match their declared PDF or image type.
        if content_type == "application/pdf" and not data.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="The file does not appear to be a valid PDF.",
            )

        image_signatures = {
            "image/jpeg": lambda b: b.startswith(b"\xff\xd8\xff"),
            "image/png": lambda b: b.startswith(b"\x89PNG\r\n\x1a\n"),
            "image/webp": lambda b: (
                len(b) >= 12
                and b.startswith(b"RIFF")
                and b[8:12] == b"WEBP"
            ),
        }

        if content_type in image_signatures:
            if not image_signatures[content_type](data):
                raise HTTPException(
                    status_code=400,
                    detail="The file contents do not match the selected image type.",
                )

        if content_type == "application/pdf":
            extracted_text = extract_pdf_text(data)

        elif content_type == "text/plain":
            try:
                extracted_text = data.decode("utf-8-sig").strip()
            except UnicodeDecodeError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="The text file must use UTF-8 encoding.",
                ) from exc

        else:
            # Image OCR is not implemented in this endpoint.
            extracted_text = ""

        extracted_text = extracted_text[:MAX_EXTRACTED_TEXT]

        if not extracted_text:
            is_image = content_type.startswith("image/")
            return DocumentReview(
                filename=filename,
                content_type=content_type,
                size_bytes=len(data),
                extracted_text="",
                review_status="ocr_required" if is_image or content_type == "application/pdf" else "no_text",
                message=(
                    "No readable text could be extracted. This may be a scanned "
                    "PDF or image. OCR is not configured in this endpoint, so "
                    "no AI document review was performed."
                ),
                next_steps=[
                    "Try a searchable PDF or UTF-8 text file.",
                    "Check that the document is clear and readable.",
                    "Compare extracted text against the original before relying on it.",
                    "Ask a qualified lawyer to review important evidence.",
                ],
            )

        # Generate a review from the actual extracted document text.
        try:
            ai_service = get_ai_service()
            result = ai_service.analyze_document(
                extracted_text=extracted_text[:MAX_ANALYSIS_TEXT],
                case_context=None,
            )
            analysis = get_ai_review_text(result)

            if not analysis:
                raise RuntimeError("The AI service returned no usable review.")

        except Exception as exc:
            logger.exception("AI document review failed")

            return DocumentReview(
                filename=filename,
                content_type=content_type,
                size_bytes=len(data),
                extracted_text=extracted_text,
                review_status="text_extracted",
                message=(
                    "Text extraction succeeded, but the AI review failed. "
                    "Check the backend terminal for the underlying error and "
                    "retry after the AI service is available."
                ),
                next_steps=[
                    "Check that Ollama and the configured model are running.",
                    "Check the backend terminal for the AI service error.",
                    "Verify the extracted text against the original document.",
                ],
            )

        return DocumentReview(
            filename=filename,
            content_type=content_type,
            size_bytes=len(data),
            extracted_text=extracted_text,
            review_status="ai_review_completed",
            message=(
                "PRELIMINARY AI DOCUMENT REVIEW\n\n"
                f"{analysis}\n\n"
                "LIMITATION: This review is based on extracted text only. "
                "The original document's authenticity, completeness, signatures, "
                "and legal admissibility have not been verified. This is not a "
                "legal opinion or a prediction of case outcome."
            ),
            next_steps=[
                "Compare the extracted text with the original document.",
                "Check names, dates, amounts, and quotations for accuracy.",
                "Discuss relevant facts and missing evidence with a qualified lawyer.",
                "Preserve the original document.",
            ],
        )

    finally:
        await file.close()
