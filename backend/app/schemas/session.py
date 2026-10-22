"""
Session and conversation schemas.
"""

from pydantic import BaseModel, Field, UUID4
from typing import Optional, List
from datetime import datetime


class SessionCreate(BaseModel):
    """Session creation request."""
    language: str = Field("hi", pattern="^(hi|en|mr|ta|te)$")
    user_type: str = Field("citizen", pattern="^(citizen|volunteer|admin)$")
    state: Optional[str] = None
    district: Optional[str] = None
    age_group: Optional[str] = None
    gender: Optional[str] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "language": "hi",
                "user_type": "citizen",
                "state": "Maharashtra",
                "district": "Mumbai"
            }
        }
    }


class SessionResponse(BaseModel):
    """Session response."""
    id: UUID4
    session_token: str
    language: str
    user_type: str
    state: Optional[str]
    district: Optional[str]
    is_active: str
    created_at: datetime
    expires_at: datetime
    
    model_config = {
        "from_attributes": True
    }


class MessageCreate(BaseModel):
    """Message creation request."""
    content: str = Field(..., min_length=1, max_length=5000)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "content": "मुझे घरेलू हिंसा के मामले में मदद चाहिए"
            }
        }
    }


class MessageResponse(BaseModel):
    """Message response."""
    id: UUID4
    role: str
    content: str
    content_translated: Optional[str]
    detected_language: Optional[str]
    sequence: int
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }


class ConversationResponse(BaseModel):
    """Full conversation response."""
    session_id: UUID4
    messages: List[MessageResponse]
    total_messages: int
