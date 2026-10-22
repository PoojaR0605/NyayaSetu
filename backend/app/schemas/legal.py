"""
Legal resource schemas.
"""

from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime


class LegalResourceSearch(BaseModel):
    """Legal resource search request."""
    state: str
    district: Optional[str] = None
    legal_issue: Optional[str] = None
    resource_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance_km: Optional[float] = 50.0
    limit: int = 10
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "state": "Maharashtra",
                "district": "Mumbai",
                "legal_issue": "domestic_violence",
                "resource_type": "legal_aid_center",
                "limit": 5
            }
        }
    }


class LegalResourceResponse(BaseModel):
    """Legal resource response."""
    id: UUID4
    name: str
    name_hi: Optional[str]
    resource_type: str
    description: Optional[str]
    services_offered: Optional[List[str]]
    
    # Location
    state: str
    district: Optional[str]
    city: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    
    # Contact
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    
    # Details
    specializations: Optional[List[str]]
    languages_supported: Optional[List[str]]
    provides_free_service: bool
    appointment_required: Optional[bool]
    operating_hours: Optional[str]
    
    # Match info (when from search)
    match_score: Optional[float] = None
    distance_km: Optional[float] = None
    
    model_config = {
        "from_attributes": True
    }
