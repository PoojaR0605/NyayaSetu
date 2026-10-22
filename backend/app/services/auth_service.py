"""
Authentication service.
Business logic for user authentication.
"""

from datetime import timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.admin import AdminUser
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class AuthService:
    """Authentication service."""
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[AdminUser]:
        """
        Authenticate a user by username and password.
        
        Args:
            db: Database session
            username: Username
            password: Plain text password
            
        Returns:
            AdminUser if authentication successful, None otherwise
        """
        user = db.query(AdminUser).filter(AdminUser.username == username).first()
        
        if not user:
            logger.warning(f"Login attempt for non-existent user: {username}")
            return None
        
        if not user.is_active:
            logger.warning(f"Login attempt for inactive user: {username}")
            return None
        
        if not verify_password(password, user.password_hash):
            logger.warning(f"Failed login attempt for user: {username}")
            return None
        
        logger.info(f"Successful login for user: {username}")
        return user
    
    @staticmethod
    def create_user_token(user: AdminUser) -> Dict[str, Any]:
        """
        Create JWT token for authenticated user.
        
        Args:
            user: Authenticated user
            
        Returns:
            Token data with access_token and user info
        """
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        token_data = {
            "sub": user.username,
            "role": user.role,
            "user_id": str(user.id)
        }
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name
            }
        }
    
    @staticmethod
    def create_admin_user(
        db: Session,
        username: str,
        email: str,
        password: str,
        role: str = "viewer",
        full_name: Optional[str] = None
    ) -> AdminUser:
        """
        Create a new admin user.
        
        Args:
            db: Database session
            username: Username
            email: Email
            password: Plain text password
            role: User role
            full_name: Full name
            
        Returns:
            Created admin user
            
        Raises:
            HTTPException: If username or email already exists
        """
        # Check if user exists
        existing_user = db.query(AdminUser).filter(
            (AdminUser.username == username) | (AdminUser.email == email)
        ).first()
        
        if existing_user:
            if existing_user.username == username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Create new user
        hashed_password = get_password_hash(password)
        
        new_user = AdminUser(
            username=username,
            email=email,
            password_hash=hashed_password,
            role=role,
            full_name=full_name
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Created new admin user: {username} with role: {role}")
        
        return new_user
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[AdminUser]:
        """
        Get user by username.
        
        Args:
            db: Database session
            username: Username
            
        Returns:
            AdminUser if found, None otherwise
        """
        return db.query(AdminUser).filter(AdminUser.username == username).first()
