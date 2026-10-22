"""
Legal service.
Business logic for legal resources and matching.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import math

from app.models.legal import LegalResource, ResourceTypeEnum
from app.models.assessment import Assessment, AssessmentResource
from app.core.logging import get_logger

logger = get_logger(__name__)


class LegalService:
    """Legal resource management and matching service."""
    
    @staticmethod
    def search_resources(
        db: Session,
        state: str,
        district: Optional[str] = None,
        legal_issue: Optional[str] = None,
        resource_type: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        max_distance_km: float = 50.0,
        limit: int = 10
    ) -> List[Tuple[LegalResource, Optional[float], Optional[float]]]:
        """
        Search for legal resources based on criteria.
        
        Args:
            db: Database session
            state: State to search in
            district: District to filter by
            legal_issue: Legal issue to match
            resource_type: Type of resource
            latitude: User latitude for distance calculation
            longitude: User longitude for distance calculation
            max_distance_km: Maximum distance in km
            limit: Maximum results
            
        Returns:
            List of tuples (resource, distance_km, match_score)
        """
        query = db.query(LegalResource).filter(
            LegalResource.is_active == True,
            LegalResource.state == state
        )
        
        # Filter by district if provided
        if district:
            query = query.filter(LegalResource.district == district)
        
        # Filter by resource type
        if resource_type:
            query = query.filter(LegalResource.resource_type == resource_type)
        
        # Filter by specialization if legal issue provided
        if legal_issue:
            query = query.filter(
                or_(
                    LegalResource.specializations.contains([legal_issue]),
                    LegalResource.specializations == None
                )
            )
        
        resources = query.all()
        
        # Calculate distances and match scores
        results = []
        for resource in resources:
            distance = None
            if latitude and longitude and resource.latitude and resource.longitude:
                distance = LegalService._calculate_distance(
                    latitude, longitude,
                    resource.latitude, resource.longitude
                )
                
                # Skip if too far
                if distance > max_distance_km:
                    continue
            
            # Calculate match score
            match_score = LegalService._calculate_match_score(
                resource, legal_issue, district, distance
            )
            
            results.append((resource, distance, match_score))
        
        # Sort by match score (descending) and distance (ascending)
        results.sort(key=lambda x: (-x[2], x[1] if x[1] else float('inf')))
        
        # Limit results
        results = results[:limit]
        
        logger.info(f"Found {len(results)} resources for state={state}, district={district}")
        
        return results
    
    @staticmethod
    def match_resources_to_assessment(
        db: Session,
        assessment_id: str,
        limit: int = 5
    ) -> List[AssessmentResource]:
        """
        Match legal resources to an assessment and save matches.
        
        Args:
            db: Database session
            assessment_id: Assessment ID
            limit: Maximum resources to match
            
        Returns:
            List of matched assessment resources
        """
        # Get assessment
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            logger.error(f"Assessment not found: {assessment_id}")
            return []
        
        # Get session for location info
        session = assessment.session
        
        # Search for resources
        results = LegalService.search_resources(
            db=db,
            state=session.state or "Maharashtra",  # Default for demo
            district=session.district,
            legal_issue=assessment.primary_legal_issue,
            limit=limit
        )
        
        # Create assessment resource entries
        matched_resources = []
        for rank, (resource, distance, match_score) in enumerate(results, 1):
            ar = AssessmentResource(
                assessment_id=assessment_id,
                legal_resource_id=resource.id,
                match_score=match_score,
                distance_km=distance,
                rank=rank,
                match_reason=f"Matched based on location and legal issue"
            )
            db.add(ar)
            matched_resources.append(ar)
        
        db.commit()
        
        logger.info(f"Matched {len(matched_resources)} resources to assessment {assessment_id}")
        
        return matched_resources
    
    @staticmethod
    def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula.
        
        Args:
            lat1, lon1: First coordinate
            lat2, lon2: Second coordinate
            
        Returns:
            Distance in kilometers
        """
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    @staticmethod
    def _calculate_match_score(
        resource: LegalResource,
        legal_issue: Optional[str],
        district: Optional[str],
        distance: Optional[float]
    ) -> float:
        """
        Calculate match score for a resource.
        
        Args:
            resource: Legal resource
            legal_issue: User's legal issue
            district: User's district
            distance: Distance to resource
            
        Returns:
            Match score (0.0 to 1.0)
        """
        score = 0.5  # Base score
        
        # Specialization match
        if legal_issue and resource.specializations:
            if legal_issue in resource.specializations:
                score += 0.3
        
        # District match
        if district and resource.district == district:
            score += 0.1
        
        # Distance bonus (closer is better)
        if distance is not None:
            if distance < 5:
                score += 0.1
            elif distance < 10:
                score += 0.05
        
        # Free service bonus
        if resource.provides_free_service:
            score += 0.05
        
        return min(score, 1.0)
