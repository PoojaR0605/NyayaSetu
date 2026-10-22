
"""
NYAYASETU document upload and preliminary AI review endpoint.

Extracts text from supported files and sends readable text to the existing
AI service. It does not save uploaded files or verify their authenticity.
"""

import io
import os
from typing import Any, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.ai_service import get_ai_service

router = APIRouter(
    prefix="/documents",
    tags=["Document Analysis"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_ANALYSIS_TEXT = 30_000

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
    next_steps: List[str]


def extract_pdf_text(data: bytes) -> str:
    """Extract selectable PDF text. Scanned PDFs may require OCR."""
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))

        if len(reader.pages) > 50:
            raise HTTPException(
                status_code=400,
                detail="PDFs must contain no more than 50 pages.",
            )

        parts = []

        for page in reader.pages:
            parts.append(page.extract_text() or "")

        return "\n".join(parts).strip()

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF. Please upload a valid PDF.",
        ) from exc


@router.post("/analyze", response_model=DocumentReview)
async def analyze_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Any:
    """
    Extract readable text and generate a preliminary AI review.

    This endpoint does not persist the file or associate it with an account.
    """
    # Preserve the existing dependency without implying that the file
    # is stored in the database.
    del db

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a file.",
        )

    content_type = (file.content_type or "").lower()
    filename = os.path.basename(file.filename)

    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Upload a PDF, TXT, JPG, PNG, or WEBP file.",
        )

    data = await file.read(MAX_FILE_SIZE + 1)

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="The file exceeds the 10 MB limit.",
        )

    if not data:
        raise HTTPException(
            status_code=400,
            detail="The file is empty.",
        )

    extracted_text = ""

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
        # Image OCR has not been implemented in this endpoint.
        extracted_text = ""

    # Avoid sending excessively large documents to the AI service.
    if len(extracted_text) > 100_000:
        extracted_text = extracted_text[:100_000]

    if not extracted_text:
        if content_type.startswith("image/") or content_type == "application/pdf":
            return DocumentReview(
                filename=filename,
                content_type=content_type,
                size_bytes=len(data),
                extracted_text="",
                review_status="ocr_required",
                message=(
                    "The file was received, but no readable text was extracted. "
                    "Image OCR is not configured in this endpoint. Scanned PDFs "
                    "may also require OCR. No AI evidence assessment was performed."
                ),
                next_steps=[
                    "Upload a searchable PDF or UTF-8 text copy if available.",
                    "Check that the document is readable and complete.",
                    "Keep the original file unchanged.",
                    "Ask a qualified lawyer to review important evidence.",
                ],
            )

        return DocumentReview(
            filename=filename,
            content_type=content_type,
            size_bytes=len(data),
            extracted_text="",
            review_status="no_text",
            message="No readable text was found in the file.",
            next_steps=[
                "Check that the file contains readable text.",
                "Try a searchable PDF or UTF-8 text file.",
            ],
        )

    # Use the actual text extracted from this upload.
    # A filename alone is not enough to determine legal relevance.
    try:
        ai_service = get_ai_service()

        review = ai_service.analyze_document(
            extracted_text=extracted_text[:MAX_ANALYSIS_TEXT],
            case_context=None,
        )

        analysis = str(review.get("analysis") or "").strip()

        if not analysis:
            raise RuntimeError("The AI service returned an empty review.")

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
                "Check all names, dates, amounts, and quotations for accuracy.",
                "Provide the related legal issue and relevant context for a more "
                "focused assessment.",
                "Preserve the original document and seek qualified legal review "
                "where appropriate.",
            ],
        )

    except Exception:
        # Keep successful text extraction available even if the AI provider
        # is unavailable. Do not pretend that an AI assessment occurred.
        from app.core.logging import get_logger

        logger = get_logger(__name__)
        logger.exception("AI document review failed for %s", filename)

        return DocumentReview(
            filename=filename,
            content_type=content_type,
            size_bytes=len(data),
            extracted_text=extracted_text,
            review_status="text_extracted",
            message=(
                "The document text was extracted, but AI review could not be "
                "completed. No document-specific legal assessment was produced. "
                "Check the backend logs and AI configuration, then try again."
            ),
            next_steps=[
                "Check that the OpenAI API key and model configuration are valid.",
                "Check the backend terminal for the AI service error.",
                "Review the extracted text for accuracy.",
                "Do not treat text extraction alone as an evidence assessment.",
            ],
        )
