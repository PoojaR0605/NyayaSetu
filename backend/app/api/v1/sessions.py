
"""
Session and conversation API endpoints for NYAYASETU.

Includes session management, saved conversations, normal AI chat,
and a preliminary case evidence-readiness score out of 100.
"""

import re
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.session import (
    SessionCreate,
    SessionResponse,
    MessageCreate,
    MessageResponse,
    ConversationResponse,
)
from app.services.session_service import SessionService
from app.services.ai_service import get_ai_service
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.assessment import Assessment

router = APIRouter()
logger = get_logger(__name__)
settings = get_settings()


def _demo_response(message: str) -> str:
    """Provide a simple response when demo mode is enabled."""
    text = (message or "").strip().lower()
    words = set(
        text.replace("?", " ")
        .replace("!", " ")
        .replace(".", " ")
        .replace(",", " ")
        .split()
    )

    greetings = {
        "hi", "hello", "hey", "namaste",
        "goodmorning", "goodafternoon", "goodevening",
    }

    legal_terms = {
        "law", "legal", "case", "court", "police", "fir", "notice",
        "salary", "wage", "employer", "employment", "job", "work",
        "rent", "tenant", "landlord", "eviction", "property", "land",
        "inheritance", "consumer", "refund", "defect", "divorce",
        "custody", "maintenance", "marriage", "family", "violence",
        "abuse", "harassment", "fraud", "contract", "agreement",
        "rights", "lawyer", "advocate", "evidence", "document",
        "unpaid", "termination", "dismissed", "compensation",
        "deposit", "receipt", "payment", "dispute", "rental",
    }

    if words and words.issubset(greetings | {"how", "are", "you"}):
        return (
            "Hello! I'm NyayaSetu. I can help you understand legal issues "
            "and explore possible next steps. What would you like help with?"
        )

    if not words.intersection(legal_terms):
        return (
            "I'm here to help with legal questions and practical next steps. "
            "Tell me a little about the situation you're dealing with."
        )

    if words.intersection({
        "salary", "wage", "employer", "employment",
        "unpaid", "termination", "dismissed",
    }):
        return (
            "I can help you understand your employment issue. Could you tell "
            "me what happened, how much salary is unpaid (if applicable), "
            "and whether you have a contract, payslips, or written messages "
            "from your employer? The options available depend on the facts "
            "and the applicable law."
        )

    if words.intersection({
        "rent", "tenant", "landlord", "eviction", "deposit", "rental",
    }):
        return (
            "I can help you understand the rental dispute. What happened, "
            "which state is the property in, and do you have a written rental "
            "agreement? If this concerns a deposit, please also share the "
            "amount, when you moved out, and what the landlord said about "
            "returning it."
        )

    if words.intersection({"consumer", "refund", "defect"}):
        return (
            "I can help you explore your consumer-dispute options. What did "
            "you purchase, when did you purchase it, what went wrong, and "
            "have you already contacted the seller? Keep your invoice and "
            "payment records if you have them."
        )

    return (
        "Please tell me what happened, when it happened, where the issue "
        "occurred, and what outcome you are hoping for. Mention any relevant "
        "documents or evidence you have, and I'll help you consider possible "
        "next steps."
    )


def _get_session_or_404(db: Session, session_token: str):
    """Return the session or raise HTTP 404."""
    session = SessionService.get_session_by_token(db, session_token)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired.",
        )

    return session


def _get_ai_service():
    """Get the configured AI service."""
    return get_ai_service()


def _contains_any(text: str, phrases: List[str]) -> bool:
    """Check for phrase mentions in normalized conversation text."""
    normalized = text.lower()
    return any(phrase in normalized for phrase in phrases)


def _score_case_evidence(user_messages: List[str]) -> Dict[str, Any]:
    """
    Calculate a transparent preliminary evidence-readiness score.

    This is a rules-based checklist, not a prediction of winning.
    It uses user messages only. It cannot confirm a document is genuine
    or that an attachment was actually uploaded or reviewed.
    """
    text = "\n".join(user_messages)
    normalized = text.lower()

    # Documentation support: maximum 40 points.
    document_checks = [
        (
            "Written agreement or contract",
            10,
            [
                "signed agreement", "rental agreement", "written agreement",
                "lease agreement", "contract", "offer letter",
            ],
        ),
        (
            "Payment or transaction record",
            10,
            [
                "payment receipt", "bank statement", "bank transfer",
                "transaction receipt", "payment proof", "upi receipt",
                "deposit receipt", "invoice",
            ],
        ),
        (
            "Written communication",
            8,
            [
                "email", "text message", "whatsapp", "written reply",
                "written response", "message from", "chat screenshot",
            ],
        ),
        (
            "Timeline or handover evidence",
            6,
            [
                "key return", "returned the keys", "handover receipt",
                "move-out photos", "handover proof", "delivery receipt",
            ],
        ),
        (
            "Other supporting records",
            6,
            [
                "photographs", "photos", "witness statement",
                "official notice", "complaint copy", "payslip",
                "medical report", "police report",
            ],
        ),
    ]

    documentation_score = 0
    evidence_found = []
    evidence_gaps = []

    for label, points, phrases in document_checks:
        if _contains_any(normalized, phrases):
            documentation_score += points
            evidence_found.append(
                {
                    "item": label,
                    "points": points,
                    "basis": (
                        "Mentioned in the user's conversation; the actual "
                        "document has not necessarily been inspected."
                    ),
                }
            )
        else:
            evidence_gaps.append(label)

    # Completeness: maximum 20 points.
    completeness_checks = [
        (
            "Dates or timeline",
            5,
            r"\b(20\d{2}|january|february|march|april|may|june|"
            r"july|august|september|october|november|december)\b",
        ),
        (
            "Amount or financial value",
            5,
            r"(₹|rs\.?|inr)\s*[\d,]+|\b\d[\d,]*\s*(rupees|rs)\b",
        ),
        (
            "Location or jurisdiction",
            5,
            r"\b(karnataka|bengaluru|bangalore|mumbai|delhi|"
            r"chennai|hyderabad|pune|kolkata|district|state)\b",
        ),
        (
            "Parties or responsible person",
            5,
            r"\b(landlord|tenant|employer|employee|seller|buyer|"
            r"company|owner|customer|police|opposite party)\b",
        ),
    ]

    completeness_score = 0
    completeness_gaps = []

    for label, points, pattern in completeness_checks:
        if re.search(pattern, normalized, flags=re.IGNORECASE):
            completeness_score += points
        else:
            completeness_gaps.append(label)

    # Consistency and corroboration: maximum 20 points.
    # This measures whether the account contains useful cross-checkable
    # details, not whether the facts have been independently verified.
    consistency_checks = [
        (
            "More than one dated event",
            7,
            r"\b(20\d{2}|january|february|march|april|may|june|"
            r"july|august|september|october|november|december)\b",
            2,
        ),
        (
            "An action or response by the other party",
            7,
            r"\b(refused|rejected|replied|responded|requested|"
            r"contacted|sent|received|denied|promised)\b",
            1,
        ),
        (
            "Evidence can be compared with the account",
            6,
            r"\b(agreement|receipt|invoice|email|message|"
            r"statement|notice|photo|photograph|payslip)\b",
            1,
        ),
    ]

    consistency_score = 0
    consistency_gaps = []

    for label, points, pattern, minimum_matches in consistency_checks:
        matches = re.findall(pattern, normalized, flags=re.IGNORECASE)
        if len(matches) >= minimum_matches:
            consistency_score += points
        else:
            consistency_gaps.append(label)

    # Legal-issue relevance: maximum 20 points.
    relevance_checks = [
        (
            "A recognizable legal issue",
            8,
            [
                "dispute", "refused", "unpaid", "deposit", "salary",
                "eviction", "refund", "harassment", "termination",
                "damage", "fraud", "agreement", "claim",
            ],
        ),
        (
            "The user's requested outcome is apparent",
            6,
            [
                "return my", "refund", "recover", "get back",
                "compensation", "pay me", "return the deposit",
                "resolve this", "what can i do", "legal action",
                "want to recover", "want the money",
            ],
        ),
        (
            "A relevant action or unresolved issue is described",
            6,
            [
                "not returned", "not paid", "refused", "rejected",
                "no response", "still waiting", "dispute",
                "complaint", "notice", "asked for",
            ],
        ),
    ]

    relevance_score = 0
    relevance_gaps = []

    for label, points, phrases in relevance_checks:
        if _contains_any(normalized, phrases):
            relevance_score += points
        else:
            relevance_gaps.append(label)

    total = (
        documentation_score
        + completeness_score
        + consistency_score
        + relevance_score
    )
    total = max(0, min(100, total))

    if total >= 65:
        band = "DOCUMENTATION_MORE_READY"
        interpretation = (
            "The information described appears relatively well documented "
            "for an initial legal consultation. This does not establish "
            "legal merit or guarantee that the case can proceed."
        )
    elif total >= 36:
        band = "PARTIALLY_DOCUMENTED"
        interpretation = (
            "Some useful case information is available, but important "
            "supporting records or details may still be missing."
        )
    else:
        band = "LIMITED_DOCUMENTATION"
        interpretation = (
            "The current conversation provides limited evidence-readiness "
            "information. Obtain and preserve relevant records where "
            "possible. A low score does not mean the claim has no merit."
        )

    return {
        "score": total,
        "maximum_score": 100,
        "category": band,
        "interpretation": interpretation,
        "breakdown": {
            "documentation": {
                "score": documentation_score,
                "maximum": 40,
            },
            "completeness": {
                "score": completeness_score,
                "maximum": 20,
            },
            "consistency_and_corroboration": {
                "score": consistency_score,
                "maximum": 20,
            },
            "legal_issue_relevance": {
                "score": relevance_score,
                "maximum": 20,
            },
        },
        "evidence_mentioned": evidence_found,
        "evidence_gaps": evidence_gaps,
        "information_gaps": (
            completeness_gaps + consistency_gaps + relevance_gaps
        ),
        "scoring_note": (
            "This is a preliminary, rules-based evidence-readiness indicator "
            "derived from the user's messages. It is not a legal opinion, "
            "a measure of the probability of winning, or verification of "
            "uploaded documents."
        ),
    }


@router.post(
    "/start",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_session(
    session_data: SessionCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Create a new conversation session."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    new_session = SessionService.create_session(
        db=db,
        language=session_data.language,
        user_type=session_data.user_type,
        state=session_data.state,
        district=session_data.district,
        age_group=session_data.age_group,
        gender=session_data.gender,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    return SessionResponse.model_validate(new_session)


@router.get(
    "/{session_token}",
    response_model=SessionResponse,
    status_code=status.HTTP_200_OK,
)
async def get_session(
    session_token: str,
    db: Session = Depends(get_db),
):
    """Retrieve a conversation session."""
    session = _get_session_or_404(db, session_token)
    return SessionResponse.model_validate(session)


@router.post(
    "/{session_token}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_message(
    session_token: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
):
    """Save a user message, generate a normal chat response, and save it."""
    session = _get_session_or_404(db, session_token)
    content = (message_data.content or "").strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty.",
        )

    SessionService.add_message(
        db=db,
        session_id=str(session.id),
        role="user",
        content=content,
        detected_language=session.language,
    )

    try:
        if settings.DEMO_MODE:
            ai_response = _demo_response(content)
        else:
            conversation = SessionService.get_conversation(
                db, str(session.id)
            )
            previous_messages = conversation[:-1]

            history = [
                {"role": item.role, "content": item.content}
                for item in previous_messages
                if item.role in ("user", "assistant")
            ]

            ai_response = _get_ai_service().generate_response(
                user_message=content,
                conversation_history=history,
                user_context={
                    "state": session.state or "",
                    "district": session.district or "",
                    "language": session.language or "English",
                },
            )

            if not isinstance(ai_response, str):
                ai_response = str(ai_response)

            ai_response = ai_response.strip()

            if not ai_response:
                raise RuntimeError(
                    "The AI service returned an empty response."
                )

    except Exception:
        logger.exception(
            "Failed to generate response for session %s",
            session.id,
        )
        ai_response = (
            "Your message has been saved, but I couldn't generate a response "
            "right now. Please check that Ollama is running and the configured "
            "model is available, then try again."
        )

    saved_response = SessionService.add_message(
        db=db,
        session_id=str(session.id),
        role="assistant",
        content=ai_response,
        detected_language=session.language,
    )

    return MessageResponse.model_validate(saved_response)


@router.get(
    "/{session_token}/conversation",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
)
async def get_conversation(
    session_token: str,
    db: Session = Depends(get_db),
):
    """Return the messages saved for a conversation."""
    session = _get_session_or_404(db, session_token)
    messages = SessionService.get_conversation(db, str(session.id))

    return ConversationResponse(
        session_id=session.id,
        messages=[
            MessageResponse.model_validate(item)
            for item in messages
        ],
        total_messages=len(messages),
    )


@router.post(
    "/{session_token}/close",
    status_code=status.HTTP_200_OK,
)
async def close_session(
    session_token: str,
    db: Session = Depends(get_db),
):
    """Close a conversation session."""
    session = _get_session_or_404(db, session_token)
    SessionService.close_session(db, str(session.id))

    return {"message": "Session closed successfully."}


@router.delete(
    "/{session_token}",
    status_code=status.HTTP_200_OK,
)
async def delete_session(
    session_token: str,
    db: Session = Depends(get_db),
):
    """Delete a conversation and its linked assessment data."""
    session = _get_session_or_404(db, session_token)

    try:
        assessment = (
            db.query(Assessment)
            .filter(Assessment.session_id == session.id)
            .first()
        )

        if assessment is not None:
            for item in list(assessment.resources):
                db.delete(item)

            for item in list(assessment.action_items):
                db.delete(item)

            for item in list(assessment.extracted_facts):
                db.delete(item)

            db.delete(assessment)

        db.delete(session)
        db.commit()

        return {
            "deleted": True,
            "message": "Conversation deleted successfully.",
        }

    except Exception:
        db.rollback()
        logger.exception(
            "Could not delete conversation for session %s",
            session.id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete this conversation safely.",
        )


@router.get(
    "/{session_token}/case-strength",
    status_code=status.HTTP_200_OK,
)
async def get_case_strength(
    session_token: str,
    db: Session = Depends(get_db),
):
    """
    Calculate a preliminary evidence-readiness score from the saved chat.

    The numerical score uses an explicit checklist. Ollama supplies the
    case-specific narrative, but does not choose the numerical score.
    """
    session = _get_session_or_404(db, session_token)
    messages = SessionService.get_conversation(db, str(session.id))

    user_messages = [
        str(item.content).strip()
        for item in messages
        if str(item.role).lower() == "user"
        and item.content
        and str(item.content).strip()
    ]

    if not user_messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Please describe your legal issue in the chat before "
                "reviewing case strength."
            ),
        )

    case_description = "\n\n".join(user_messages[-30:])
    score_result = _score_case_evidence(user_messages)

    context = {
        "state": session.state or "",
        "district": session.district or "",
        "language": session.language or "English",
    }

    try:
        if settings.DEMO_MODE:
            analysis = (
                "Demo mode is enabled, so no AI-generated case narrative "
                "was produced. The displayed score is a preliminary checklist "
                "based on information in the saved user messages."
            )
        else:
            score_context = (
                "\n\nPRELIMINARY EVIDENCE-READINESS SCORE\n"
                f"Score: {score_result['score']}/100\n"
                f"Interpretation: {score_result['interpretation']}\n"
                f"Breakdown: {score_result['breakdown']}\n"
                f"Evidence mentioned: {score_result['evidence_mentioned']}\n"
                f"Evidence gaps: {score_result['evidence_gaps']}\n"
                f"Information gaps: {score_result['information_gaps']}\n\n"
                "Explain this checklist in plain language. Do not change the "
                "numerical score. Do not claim that documents were inspected "
                "or verified unless their contents are actually supplied. "
                "Discuss the reported facts, limitations, and practical next "
                "steps. Do not estimate a chance of winning."
            )

            result = _get_ai_service().analyze_case_strength(
                case_description=case_description + score_context,
                evidence_available=[
                    str(item["item"])
                    for item in score_result["evidence_mentioned"]
                ],
                user_context=context,
            )

            if isinstance(result, dict):
                analysis = (
                    result.get("analysis")
                    or result.get("message")
                    or str(result)
                )
            else:
                analysis = str(result)

            analysis = analysis.strip()

            if not analysis:
                raise RuntimeError(
                    "The AI service returned an empty case-strength analysis."
                )

        return {
            **score_result,
            "analysis": analysis,
            "recommendation": (
                "Preserve relevant original agreements, payment records, "
                "messages, notices, photographs, and a dated timeline. The "
                "score is an evidence-readiness indicator, not a legal "
                "opinion or prediction of a court outcome."
            ),
            "disclaimer": (
                "This preliminary score is calculated from details mentioned "
                "in the saved conversation. It does not verify uploaded files, "
                "establish legal admissibility, determine eligibility to file "
                "a case, or predict success. A qualified lawyer can assess "
                "the actual documents and applicable law."
            ),
        }

    except Exception:
        logger.exception(
            "Case-strength review failed for session %s",
            session.id,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "The evidence score could not be fully generated. Check the "
                "backend logs and confirm that Ollama is running. Try again "
                "after the service is available."
            ),
        )
