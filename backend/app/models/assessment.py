"""
Assessment and related models.
"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Float, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base


class UrgencyLevelEnum(str, enum.Enum):
    """Urgency levels for legal situations."""
    CRITICAL = "critical"      # Immediate action needed
    HIGH = "high"             # Action needed soon
    MODERATE = "moderate"     # Action recommended
    LOW = "low"              # Can wait


class EligibilityStatusEnum(str, enum.Enum):
    """Eligibility determination status."""
    ELIGIBLE = "eligible"
    POTENTIALLY_ELIGIBLE = "potentially_eligible"
    INELIGIBLE = "ineligible"
    INSUFFICIENT_INFO = "insufficient_info"


class SupportLevelEnum(str, enum.Enum):
    """Preliminary support assessment levels."""
    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"
    INSUFFICIENT_INFO = "insufficient_info"


class Assessment(Base):
    """Assessment model - stores results of legal aid eligibility assessment."""
    
    __tablename__ = "assessments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), 
                       nullable=False, unique=True, index=True)
    
    # Assessment summary
    primary_legal_issue = Column(String(200), nullable=True)
    legal_category = Column(String(100), nullable=True)
    situation_summary = Column(Text, nullable=True)
    
    # Eligibility determination
    eligibility_status = Column(String(50), nullable=False)
    eligibility_explanation = Column(Text, nullable=True)
    eligibility_confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # Preliminary support assessment
    support_level = Column(String(50), nullable=True)
    support_explanation = Column(Text, nullable=True)
    support_factors = Column(JSON, nullable=True)  # {"positive": [...], "negative": [...], "neutral": [...]}
    
    # Urgency detection
    urgency_level = Column(String(50), nullable=False, default="moderate")
    urgency_explanation = Column(Text, nullable=True)
    urgency_indicators = Column(JSON, nullable=True)
    
    # Evidence readiness
    evidence_score = Column(Float, nullable=True)  # 0.0 to 1.0
    available_evidence = Column(JSON, nullable=True)
    missing_evidence = Column(JSON, nullable=True)
    
    # Justice readiness score
    justice_readiness_score = Column(Float, nullable=True)  # 0.0 to 100.0
    
    # Income/financial eligibility
    income_eligible = Column(Boolean, nullable=True)
    income_threshold = Column(Float, nullable=True)
    
    # AI processing metadata
    llm_model_used = Column(String(50), nullable=True)
    processing_time_seconds = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="assessment")
    extracted_facts = relationship("ExtractedFact", back_populates="assessment", cascade="all, delete-orphan")
    resources = relationship("AssessmentResource", back_populates="assessment", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="assessment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Assessment(id='{self.id}', status='{self.eligibility_status}', urgency='{self.urgency_level}')>"


class ExtractedFact(Base):
    """Structured facts extracted from conversation."""
    
    __tablename__ = "extracted_facts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), 
                          nullable=False, index=True)
    
    # Fact details
    fact_type = Column(String(100), nullable=False)  # e.g., "date", "location", "person", "event"
    fact_key = Column(String(100), nullable=False)   # e.g., "incident_date", "opposing_party"
    fact_value = Column(Text, nullable=False)
    normalized_value = Column(String(500), nullable=True)  # Standardized/parsed value
    
    # Confidence and verification
    confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    is_verified = Column(Boolean, nullable=False, default=False)
    verification_source = Column(String(200), nullable=True)
    
    # Metadata
    extracted_from_message_id = Column(String(36), nullable=True)
    extraction_method = Column(String(50), nullable=True)  # "nlp", "llm", "user_input"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="extracted_facts")
    
    def __repr__(self):
        return f"<ExtractedFact(type='{self.fact_type}', key='{self.fact_key}')>"


class AssessmentResource(Base):
    """Legal resources matched to an assessment."""
    
    __tablename__ = "assessment_resources"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), 
                          nullable=False, index=True)
    legal_resource_id = Column(String(36), ForeignKey("legal_resources.id"), 
                              nullable=False, index=True)
    
    # Matching details
    match_score = Column(Float, nullable=False)  # 0.0 to 1.0
    match_reason = Column(Text, nullable=True)
    distance_km = Column(Float, nullable=True)
    
    # Display order
    rank = Column(Integer, nullable=False)
    
    # Status tracking
    is_contacted = Column(Boolean, nullable=False, default=False)
    contacted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="resources")
    legal_resource = relationship("LegalResource")
    
    def __repr__(self):
        return f"<AssessmentResource(assessment='{self.assessment_id}', score={self.match_score})>"


class ActionItem(Base):
    """Recommended actions for the user."""
    
    __tablename__ = "action_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), 
                          nullable=False, index=True)
    
    # Status tracking
    status = Column(String(20), nullable=False, default="pending")  # pending, in_progress, completed
    
    # Action details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    action_type = Column(String(50), nullable=False)  # "document", "contact", "deadline", "evidence"
    priority = Column(Integer, nullable=False)  # 1 = highest
    
    # Timing
    is_time_sensitive = Column(Boolean, nullable=False, default=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="action_items")
    
    def __repr__(self):
        return f"<ActionItem(title='{self.title}', priority={self.priority})>"
