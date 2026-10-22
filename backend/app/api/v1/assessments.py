"""
Assessment API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.assessment import AssessmentResponse
from app.services.session_service import SessionService
from app.services.assessment_service import AssessmentService
from app.services.legal_service import LegalService
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post(
    "/create/{session_token}",
    response_model=AssessmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_assessment(
    session_token: str,
    db: Session = Depends(get_db),
):
    """Create an assessment from a session conversation."""
    session = SessionService.get_session_by_token(db, session_token)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired",
        )

    messages = SessionService.get_conversation(db, str(session.id))

    if len(messages) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient conversation data for assessment",
        )

    # Return an existing assessment rather than creating duplicates.
    existing = AssessmentService.get_assessment_by_session(
        db, str(session.id)
    )
    if existing:
        return AssessmentResponse.model_validate(existing)

    conversation_data = {
        "messages": [
            {"role": m.role, "content": m.content}
            for m in messages
        ],
        "state": session.state,
        "district": session.district,
    }

    # TODO: Replace this placeholder with issue extraction from the conversation.
    legal_issue = "domestic_violence"
    legal_category = "Family Law"

    eligibility = AssessmentService.perform_eligibility_check(
        conversation_data, legal_issue
    )
    urgency = AssessmentService.assess_urgency(
        conversation_data, legal_issue
    )
    support = AssessmentService.assess_preliminary_support(
        conversation_data, legal_issue
    )

    assessment = AssessmentService.create_assessment(
        db=db,
        session_id=str(session.id),
        eligibility_status=eligibility["status"],
        eligibility_explanation=eligibility["explanation"],
        primary_legal_issue=legal_issue,
        legal_category=legal_category,
        situation_summary="User seeking help with a legal matter",
        urgency_level=urgency["level"],
        urgency_explanation=urgency["explanation"],
        support_level=support["level"],
        support_explanation=support["explanation"],
        llm_model_used="demo",
    )

    AssessmentService.add_extracted_fact(
        db=db,
        assessment_id=str(assessment.id),
        fact_type="issue",
        fact_key="primary_issue",
        fact_value=legal_issue,
        confidence=0.8,
        extraction_method="demo",
    )

    AssessmentService.add_action_item(
        db=db,
        assessment_id=str(assessment.id),
        title="Contact a legal aid center",
        description=(
            "Contact a legal aid center to discuss your situation "
            "and confirm available assistance."
        ),
        action_type="contact",
        priority=1,
        is_time_sensitive=urgency["level"] in ["critical", "high"],
    )

    LegalService.match_resources_to_assessment(
        db=db,
        assessment_id=str(assessment.id),
        limit=5,
    )

    db.refresh(assessment)
    return AssessmentResponse.model_validate(assessment)


@router.get(
    "/user/me",
    response_model=list[AssessmentResponse],
    status_code=status.HTTP_200_OK,
)
async def get_my_assessments(
    db: Session = Depends(get_db),
):
    """
    List assessments for the current user.

    NOTE: Authentication ownership must be implemented before this
    endpoint is used for private production data. The current project
    links assessments to sessions, but this route does not yet have
    a verified user-to-session ownership mapping.
    """
    # Do not return all users' assessments without an ownership filter.
    return []


@router.get(
    "/{session_token}",
    response_model=AssessmentResponse,
    status_code=status.HTTP_200_OK,
)
async def get_assessment(
    session_token: str,
    db: Session = Depends(get_db),
):
    """Get the assessment associated with a session."""
    session = SessionService.get_session_by_token(db, session_token)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired",
        )

    assessment = AssessmentService.get_assessment_by_session(
        db, str(session.id)
    )

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found for this session",
        )

    return AssessmentResponse.model_validate(assessment)