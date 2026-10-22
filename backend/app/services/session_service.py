"""
Session service.
Business logic for session and conversation management.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import secrets

from app.models.session import Session as SessionModel, ConversationMessage, MessageRoleEnum
from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class SessionService:
    """Session management service."""
    
    @staticmethod
    def create_session(
        db: Session,
        language: str,
        user_type: str,
        state: Optional[str] = None,
        district: Optional[str] = None,
        age_group: Optional[str] = None,
        gender: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> SessionModel:
        """
        Create a new user session.
        
        Args:
            db: Database session
            language: User's preferred language
            user_type: Type of user
            state: User's state
            district: User's district
            age_group: Age group
            gender: Gender
            ip_address: IP address
            user_agent: User agent string
            
        Returns:
            Created session
        """
        # Generate unique session token
        session_token = secrets.token_urlsafe(32)
        
        # Calculate expiration
        expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.SESSION_TTL_HOURS)
        
        # Create session
        new_session = SessionModel(
            session_token=session_token,
            language=language,
            user_type=user_type,
            state=state,
            district=district,
            age_group=age_group,
            gender=gender,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        logger.info(f"Created new session: {new_session.id} (token: {session_token[:8]}...)")
        
        return new_session
    
    @staticmethod
    def get_session_by_token(db: Session, session_token: str) -> Optional[SessionModel]:
        """
        Get session by token.
        
        Args:
            db: Database session
            session_token: Session token
            
        Returns:
            Session if found and valid, None otherwise
        """
        session = db.query(SessionModel).filter(
            SessionModel.session_token == session_token
        ).first()
        
        if not session:
            return None
        
        # Check if expired
        if session.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            logger.warning(f"Expired session accessed: {session.id}")
            return None
        
        return session
    
    @staticmethod
    def add_message(
        db: Session,
        session_id: str,
        role: str,
        content: str,
        content_translated: Optional[str] = None,
        detected_language: Optional[str] = None,
        detected_intent: Optional[str] = None,
        extracted_entities: Optional[dict] = None
    ) -> ConversationMessage:
        """
        Add a message to conversation.
        
        Args:
            db: Database session
            session_id: Session ID
            role: Message role (user/assistant)
            content: Message content
            content_translated: Translated content
            detected_language: Detected language
            detected_intent: Detected intent
            extracted_entities: Extracted entities
            
        Returns:
            Created message
            
        Raises:
            HTTPException: If session not found
        """
        # Get session
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # Get next sequence number
        last_message = db.query(ConversationMessage).filter(
            ConversationMessage.session_id == session_id
        ).order_by(ConversationMessage.sequence.desc()).first()
        
        next_sequence = (last_message.sequence + 1) if last_message else 1
        
        # Create message
        new_message = ConversationMessage(
            session_id=session_id,
            role=role,
            content=content,
            content_translated=content_translated,
            detected_language=detected_language,
            detected_intent=detected_intent,
            extracted_entities=extracted_entities,
            sequence=next_sequence
        )
        
        db.add(new_message)
        
        # Update session timestamp
        session.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(new_message)
        
        logger.info(f"Added message to session {session_id}: role={role}, seq={next_sequence}")
        
        return new_message
    
    @staticmethod
    def get_conversation(db: Session, session_id: str) -> List[ConversationMessage]:
        """
        Get all messages in a conversation.
        
        Args:
            db: Database session
            session_id: Session ID
            
        Returns:
            List of messages ordered by sequence
        """
        messages = db.query(ConversationMessage).filter(
            ConversationMessage.session_id == session_id
        ).order_by(ConversationMessage.sequence).all()
        
        return messages
    
    @staticmethod
    def close_session(db: Session, session_id: str):
        """
        Close/complete a session.
        
        Args:
            db: Database session
            session_id: Session ID
        """
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if session:
            session.is_active = "completed"
            session.completed_at = datetime.now(timezone.utc)
            db.commit()
            logger.info(f"Closed session: {session_id}")
