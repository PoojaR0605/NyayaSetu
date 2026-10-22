"""
Pydantic schemas package.
"""

from app.schemas.auth import LoginRequest, LoginResponse, TokenData
from app.schemas.session import (
    SessionCreate,
    SessionResponse,
    MessageCreate,
    MessageResponse,
    ConversationResponse
)
from app.schemas.assessment import (
    AssessmentResponse,
    ExtractedFactResponse,
    ActionItemResponse
)
from app.schemas.legal import (
    LegalResourceResponse,
    LegalResourceSearch
)

__all__ = [
    "LoginRequest",
    "LoginResponse",
    "TokenData",
    "SessionCreate",
    "SessionResponse",
    "MessageCreate",
    "MessageResponse",
    "ConversationResponse",
    "AssessmentResponse",
    "ExtractedFactResponse",
    "ActionItemResponse",
    "LegalResourceResponse",
    "LegalResourceSearch",
]
