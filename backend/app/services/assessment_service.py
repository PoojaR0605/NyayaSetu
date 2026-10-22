"""
Assessment service.
Business logic for creating and managing assessments.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import time

from app.models.assessment import (
    Assessment,
    ExtractedFact,
    ActionItem,
    AssessmentResource,
    EligibilityStatusEnum,
    UrgencyLevelEnum,
    SupportLevelEnum
)
from app.models.session import Session as SessionModel
from app.core.logging import get_logger

logger = get_logger(__name__)


class AssessmentService:
    """Assessment creation and management service."""
    
    @staticmethod
    def create_assessment(
        db: Session,
        session_id: str,
        eligibility_status: str,
        eligibility_explanation: Optional[str] = None,
        primary_legal_issue: Optional[str] = None,
        legal_category: Optional[str] = None,
        situation_summary: Optional[str] = None,
        urgency_level: str = "moderate",
        urgency_explanation: Optional[str] = None,
        support_level: Optional[str] = None,
        support_explanation: Optional[str] = None,
        llm_model_used: Optional[str] = None
    ) -> Assessment:
        """
        Create a new assessment for a session.
        
        Args:
            db: Database session
            session_id: Session ID
            eligibility_status: Eligibility determination
            eligibility_explanation: Explanation of eligibility
            primary_legal_issue: Main legal issue identified
            legal_category: Category of legal issue
            situation_summary: Summary of the situation
            urgency_level: Urgency level
            urgency_explanation: Explanation of urgency
            support_level: Preliminary support assessment
            support_explanation: Explanation of support level
            llm_model_used: LLM model used
            
        Returns:
            Created assessment
            
        Raises:
            HTTPException: If session not found or assessment already exists
        """
        # Check session exists
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # Check if assessment already exists
        existing = db.query(Assessment).filter(Assessment.session_id == session_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment already exists for this session"
            )
        
        # Create assessment
        assessment = Assessment(
            session_id=session_id,
            eligibility_status=eligibility_status,
            eligibility_explanation=eligibility_explanation,
            primary_legal_issue=primary_legal_issue,
            legal_category=legal_category,
            situation_summary=situation_summary,
            urgency_level=urgency_level,
            urgency_explanation=urgency_explanation,
            support_level=support_level,
            support_explanation=support_explanation,
            llm_model_used=llm_model_used
        )
        
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        logger.info(f"Created assessment for session {session_id}: status={eligibility_status}")
        
        return assessment
    
    @staticmethod
    def get_assessment_by_session(db: Session, session_id: str) -> Optional[Assessment]:
        """
        Get assessment for a session.
        
        Args:
            db: Database session
            session_id: Session ID
            
        Returns:
            Assessment if found
        """
        return db.query(Assessment).filter(Assessment.session_id == session_id).first()
    
    @staticmethod
    def add_extracted_fact(
        db: Session,
        assessment_id: str,
        fact_type: str,
        fact_key: str,
        fact_value: str,
        confidence: Optional[float] = None,
        normalized_value: Optional[str] = None,
        extraction_method: Optional[str] = None
    ) -> ExtractedFact:
        """
        Add an extracted fact to assessment.
        
        Args:
            db: Database session
            assessment_id: Assessment ID
            fact_type: Type of fact
            fact_key: Fact key
            fact_value: Fact value
            confidence: Confidence score
            normalized_value: Normalized value
            extraction_method: How it was extracted
            
        Returns:
            Created extracted fact
        """
        fact = ExtractedFact(
            assessment_id=assessment_id,
            fact_type=fact_type,
            fact_key=fact_key,
            fact_value=fact_value,
            confidence=confidence,
            normalized_value=normalized_value,
            extraction_method=extraction_method
        )
        
        db.add(fact)
        db.commit()
        db.refresh(fact)
        
        return fact
    
    @staticmethod
    def add_action_item(
        db: Session,
        assessment_id: str,
        title: str,
        description: str,
        action_type: str,
        priority: int = 1,
        is_time_sensitive: bool = False,
        deadline: Optional[Any] = None
    ) -> ActionItem:
        """
        Add an action item to assessment.
        
        Args:
            db: Database session
            assessment_id: Assessment ID
            title: Action title
            description: Action description
            action_type: Type of action
            priority: Priority (1=highest)
            is_time_sensitive: Is time sensitive
            deadline: Deadline if applicable
            
        Returns:
            Created action item
        """
        action = ActionItem(
            assessment_id=assessment_id,
            title=title,
            description=description,
            action_type=action_type,
            priority=priority,
            is_time_sensitive=is_time_sensitive,
            deadline=deadline
        )
        
        db.add(action)
        db.commit()
        db.refresh(action)
        
        return action
    
    @staticmethod
    def perform_eligibility_check(
        conversation_data: Dict[str, Any],
        legal_issue: str
    ) -> Dict[str, Any]:
        """
        Perform eligibility check based on conversation data.
        
        This is a placeholder for the actual rule engine.
        In production, this would use the EligibilityRule model and
        deterministic rule evaluation.
        
        Args:
            conversation_data: Extracted conversation data
            legal_issue: Identified legal issue
            
        Returns:
            Eligibility determination with explanation
        """
        # TODO: Implement actual rule engine
        # For now, return a placeholder
        
        logger.info(f"Performing eligibility check for issue: {legal_issue}")
        
        # Demo logic - replace with actual rules
        return {
            "status": EligibilityStatusEnum.POTENTIALLY_ELIGIBLE.value,
            "explanation": "Based on the information provided, you may be eligible for legal aid. " 
                          "Please contact a legal aid center for formal eligibility determination.",
            "confidence": 0.75
        }
    
    @staticmethod
    def assess_urgency(
        conversation_data: Dict[str, Any],
        legal_issue: str
    ) -> Dict[str, Any]:
        """
        Assess urgency level based on conversation.
        
        Args:
            conversation_data: Extracted conversation data
            legal_issue: Identified legal issue
            
        Returns:
            Urgency assessment
        """
        # TODO: Implement urgency detection logic
        # Check for keywords like "threat", "deadline", "court date", etc.
        
        logger.info(f"Assessing urgency for issue: {legal_issue}")
        
        # Demo logic
        urgent_keywords = ["threat", "violence", "immediate", "deadline", "court"]
        content = str(conversation_data).lower()
        
        if any(keyword in content for keyword in urgent_keywords):
            return {
                "level": UrgencyLevelEnum.HIGH.value,
                "explanation": "Your situation requires prompt attention. Please seek legal help soon.",
                "indicators": ["time_sensitive_matter"]
            }
        
        return {
            "level": UrgencyLevelEnum.MODERATE.value,
            "explanation": "We recommend seeking legal advice to understand your options.",
            "indicators": []
        }
    
    @staticmethod
    def assess_preliminary_support(
        conversation_data: Dict[str, Any],
        legal_issue: str
    ) -> Dict[str, Any]:
        """
        Provide preliminary support/readiness assessment.
        
        Args:
            conversation_data: Extracted conversation data
            legal_issue: Identified legal issue
            
        Returns:
            Support assessment
        """
        # TODO: Implement support assessment logic
        
        logger.info(f"Assessing support level for issue: {legal_issue}")
        
        return {
            "level": SupportLevelEnum.MODERATE.value,
            "explanation": "You have provided some relevant information. "
                          "Additional evidence and documentation would strengthen your case.",
            "factors": {
                "positive": ["Clear description of issue", "Timeline provided"],
                "negative": ["Limited documentation"],
                "neutral": ["Initial assessment only"]
            }
        }
