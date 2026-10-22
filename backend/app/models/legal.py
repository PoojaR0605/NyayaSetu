"""
Legal domain models - issues, rules, resources.
"""

from sqlalchemy import Column, String, DateTime, Text, Boolean, Float, Integer, JSON
from sqlalchemy.sql import func
import uuid
import enum

from app.db.session import Base


class ResourceTypeEnum(str, enum.Enum):
    """Types of legal aid resources."""
    LEGAL_AID_CENTER = "legal_aid_center"
    NGO = "ngo"
    PRO_BONO_LAWYER = "pro_bono_lawyer"
    GOVERNMENT_SCHEME = "government_scheme"
    COURT = "court"
    HELPLINE = "helpline"


class VerificationStatusEnum(str, enum.Enum):
    """Verification status for legal information."""
    VERIFIED = "verified"
    PENDING = "pending"
    UNVERIFIED = "unverified"


class LegalIssue(Base):
    """Legal issue categories and subcategories."""
    
    __tablename__ = "legal_issues"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Issue details
    name = Column(String(200), nullable=False, unique=True)
    name_hi = Column(String(200), nullable=True)  # Hindi translation
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    
    # Description
    description = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    
    # Classification
    keywords = Column(JSON, nullable=True)
    keywords_hi = Column(JSON, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<LegalIssue(name='{self.name}', category='{self.category}')>"


class LegalRule(Base):
    """Legal rules, acts, and provisions."""
    
    __tablename__ = "legal_rules"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Rule identification
    title = Column(String(500), nullable=False)
    title_hi = Column(String(500), nullable=True)
    act_name = Column(String(200), nullable=False, index=True)
    section = Column(String(100), nullable=True)
    
    # Content
    content = Column(Text, nullable=False)
    content_hi = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Classification
    legal_area = Column(String(100), nullable=True, index=True)
    applicable_states = Column(JSON, nullable=True)
    
    # Verification
    verification_status = Column(String(20), nullable=False, default=VerificationStatusEnum.PENDING)
    verified_by = Column(String(200), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    source_url = Column(String(1000), nullable=True)
    
    # Timestamps
    effective_from = Column(DateTime(timezone=True), nullable=True)
    effective_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<LegalRule(act='{self.act_name}', section='{self.section}')>"


class EligibilityRule(Base):
    """Eligibility rules for legal aid programs."""
    
    __tablename__ = "eligibility_rules"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Rule identification
    program_name = Column(String(200), nullable=False, index=True)
    program_name_hi = Column(String(200), nullable=True)
    
    # Criteria
    rule_type = Column(String(50), nullable=False)  # "income", "category", "issue_type", "location"
    condition = Column(String(100), nullable=False)  # "less_than", "equals", "in_list", etc.
    threshold_value = Column(String(200), nullable=True)
    
    # Description
    description = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    
    # Applicability
    applicable_states = Column(JSON, nullable=True)
    applicable_districts = Column(JSON, nullable=True)
    applicable_legal_issues = Column(JSON, nullable=True)
    
    # Priority and weight
    priority = Column(Integer, nullable=False, default=0)
    weight = Column(Float, nullable=False, default=1.0)
    
    # Metadata
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Verification
    verification_status = Column(String(20), nullable=False, default=VerificationStatusEnum.PENDING)
    source_url = Column(String(1000), nullable=True)
    
    # Timestamps
    effective_from = Column(DateTime(timezone=True), nullable=True)
    effective_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<EligibilityRule(program='{self.program_name}', type='{self.rule_type}')>"


class EvidencePattern(Base):
    """Evidence patterns for different legal issues."""
    
    __tablename__ = "evidence_patterns"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Pattern details
    legal_issue = Column(String(200), nullable=False, index=True)
    evidence_type = Column(String(100), nullable=False)
    evidence_name = Column(String(200), nullable=False)
    evidence_name_hi = Column(String(200), nullable=True)
    
    # Description
    description = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    
    # Importance
    importance = Column(String(20), nullable=False)  # "critical", "important", "helpful"
    weight = Column(Float, nullable=False, default=1.0)
    
    # Examples
    examples = Column(JSON, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<EvidencePattern(issue='{self.legal_issue}', type='{self.evidence_type}')>"


class LegalResource(Base):
    """Legal aid resources - NGOs, legal aid centers, lawyers, etc."""
    
    __tablename__ = "legal_resources"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic information
    name = Column(String(300), nullable=False)
    name_hi = Column(String(300), nullable=True)
    resource_type = Column(String(50), nullable=False, index=True)
    
    # Description
    description = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    services_offered = Column(JSON, nullable=True)
    
    # Location
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Contact information
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Specialization
    specializations = Column(JSON, nullable=True)  # Legal issue types
    languages_supported = Column(JSON, nullable=True)
    
    # Eligibility criteria
    income_threshold = Column(Float, nullable=True)
    eligible_categories = Column(JSON, nullable=True)
    
    # Operational details
    operating_hours = Column(String(500), nullable=True)
    appointment_required = Column(Boolean, nullable=True)
    provides_free_service = Column(Boolean, nullable=False, default=True)
    
    # Verification
    verification_status = Column(String(20), nullable=False, default=VerificationStatusEnum.PENDING)
    verified_by = Column(String(200), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    is_active = Column(Boolean, nullable=False, default=True)
    last_updated_by = Column(String(200), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<LegalResource(name='{self.name}', type='{self.resource_type}', location='{self.district}')>"
