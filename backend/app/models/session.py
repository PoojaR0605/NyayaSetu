"""
Session and conversation models.
"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base


class LanguageEnum(str, enum.Enum):
    """Supported languages."""
    HINDI = "hi"
    ENGLISH = "en"
    MARATHI = "mr"
    TAMIL = "ta"
    TELUGU = "te"


class UserTypeEnum(str, enum.Enum):
    """User types."""
    CITIZEN = "citizen"
    VOLUNTEER = "volunteer"
    ADMIN = "admin"


class MessageRoleEnum(str, enum.Enum):
    """Message roles in conversation."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Session(Base):
    """User session model."""
    
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    language = Column(String(10), nullable=False, default="hi")
    user_type = Column(String(20), nullable=False, default="citizen")
    
    # Demographics (optional, for analytics)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    age_group = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    
    # Session tracking
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(String(20), nullable=False, default="active")
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    messages = relationship("ConversationMessage", back_populates="session", cascade="all, delete-orphan")
    assessment = relationship("Assessment", back_populates="session", uselist=False)
    
    def __repr__(self):
        return f"<Session(id='{self.id}', language='{self.language}', status='{self.is_active}')>"


class ConversationMessage(Base):
    """Conversation message model."""
    
    __tablename__ = "conversation_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Message content
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    content_translated = Column(Text, nullable=True)  # English translation if original is Hindi
    
    # Processing metadata
    detected_language = Column(String(10), nullable=True)
    detected_intent = Column(String(100), nullable=True)
    extracted_entities = Column(JSON, nullable=True)  # JSON of entities extracted by NLP
    
    # Token usage (for LLM calls)
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    
    # Ordering
    sequence = Column(Integer, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="messages")
    
    def __repr__(self):
        return f"<ConversationMessage(id='{self.id}', role='{self.role}', sequence={self.sequence})>"
