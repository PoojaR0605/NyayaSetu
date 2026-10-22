"""
Legal resources API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.legal import LegalResourceSearch, LegalResourceResponse
from app.services.legal_service import LegalService
from app.core.security import require_any_role
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/search", response_model=List[LegalResourceResponse], status_code=status.HTTP_200_OK)
async def search_resources(
    search_params: LegalResourceSearch,
    db: Session = Depends(get_db)
):
    """
    Search for legal resources based on criteria.
    
    Args:
        search_params: Search parameters
        db: Database session
        
    Returns:
        List of matching legal resources
    """
    results = LegalService.search_resources(
        db=db,
        state=search_params.state,
        district=search_params.district,
        legal_issue=search_params.legal_issue,
        resource_type=search_params.resource_type,
        latitude=search_params.latitude,
        longitude=search_params.longitude,
        max_distance_km=search_params.max_distance_km,
        limit=search_params.limit
    )
    
    # Convert to response format
    response_list = []
    for resource, distance, match_score in results:
        resource_dict = LegalResourceResponse.model_validate(resource).model_dump()
        resource_dict["distance_km"] = distance
        resource_dict["match_score"] = match_score
        response_list.append(LegalResourceResponse(**resource_dict))
    
    return response_list


@router.get("/recommend/{session_token}", response_model=List[LegalResourceResponse], status_code=status.HTTP_200_OK)
async def get_recommendations(
    session_token: str,
    db: Session = Depends(get_db)
):
    """
    Get recommended legal resources for a session (demo mode returns all resources).
    
    Args:
        session_token: Session token
        db: Database session
        
    Returns:
        List of recommended legal resources
    """
    from app.models.legal import LegalResource
    
    # In demo mode, return all active resources with coordinates
    resources = db.query(LegalResource).filter(
        LegalResource.is_active == True,
        LegalResource.latitude.isnot(None),
        LegalResource.longitude.isnot(None)
    ).limit(10).all()
    
    return [LegalResourceResponse.model_validate(r) for r in resources]


@router.get("/{resource_id}", response_model=LegalResourceResponse, status_code=status.HTTP_200_OK)
async def get_resource(
    resource_id: str,
    db: Session = Depends(get_db)
):
    """
    Get details of a specific legal resource.
    
    Args:
        resource_id: Resource ID
        db: Database session
        
    Returns:
        Resource details
        
    Raises:
        HTTPException: If resource not found
    """
    from app.models.legal import LegalResource
    
    resource = db.query(LegalResource).filter(LegalResource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal resource not found"
        )
    
    return LegalResourceResponse.model_validate(resource)
