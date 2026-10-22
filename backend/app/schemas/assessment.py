"""
Assessment schemas.
"""

from pydantic import BaseModel, UUID4
from typing import Optional, List, Dict
from datetime import datetime


class ExtractedFactResponse(BaseModel):
    """Extracted fact response."""
    id: UUID4
    fact_type: str
    fact_key: str
    fact_value: str
    confidence: Optional[float]
    is_verified: bool
    
    model_config = {
        "from_attributes": True
    }


class ActionItemResponse(BaseModel):
    """Action item response."""
    id: UUID4
    title: str
    description: str
    action_type: str
    priority: int
    is_time_sensitive: bool
    deadline: Optional[datetime]
    is_completed: bool
    
    model_config = {
        "from_attributes": True
    }


class AssessmentResponse(BaseModel):
    """Assessment response."""
    id: UUID4
    session_id: UUID4
    
    # Assessment summary
    primary_legal_issue: Optional[str]
    legal_category: Optional[str]
    situation_summary: Optional[str]
    
    # Eligibility
    eligibility_status: str
    eligibility_explanation: Optional[str]
    eligibility_confidence: Optional[float]
    
    # Support assessment
    support_level: Optional[str]
    support_explanation: Optional[str]
    support_factors: Optional[Dict]
    
    # Urgency
    urgency_level: str
    urgency_explanation: Optional[str]
    urgency_indicators: Optional[List[str]]
    
    # Evidence
    evidence_score: Optional[float]
    available_evidence: Optional[List[str]]
    missing_evidence: Optional[List[str]]
    
    # Income eligibility
    income_eligible: Optional[bool]
    
    # Related data
    extracted_facts: List[ExtractedFactResponse]
    action_items: List[ActionItemResponse]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True
    }
