"""
Security utilities: password hashing, JWT token generation and validation, RBAC.
Uses bcrypt directly instead of passlib for better compatibility.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from functools import wraps

from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash using bcrypt.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password for storage using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password as string
    """
    try:
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload data to encode (should include 'sub' for user identifier)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"Token decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_token(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency to get current user from JWT token.
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        Token payload containing user information
        
    Raises:
        HTTPException: If token is invalid
    """
    payload = decode_access_token(token)
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    return payload


def require_role(required_role: str) -> Callable:
    """
    Decorator to require a specific role for an endpoint.
    
    Args:
        required_role: Role required to access the endpoint
        
    Returns:
        Decorated function that checks role
        
    Example:
        @router.get("/admin/users")
        @require_role("admin")
        async def get_users(token_data: dict = Depends(get_current_user_token)):
            pass
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            token_data = kwargs.get("token_data") or kwargs.get("current_user")
            
            if not token_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            user_role = token_data.get("role")
            
            # Super admin has access to everything
            if user_role == "super_admin":
                return await func(*args, **kwargs)
            
            if user_role != required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role '{required_role}' required"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator


def require_any_role(required_roles: List[str]) -> Callable:
    """
    Decorator to require any of the specified roles for an endpoint.
    
    Args:
        required_roles: List of roles, any of which grants access
        
    Returns:
        Decorated function that checks roles
        
    Example:
        @router.get("/reports")
        @require_any_role(["admin", "analyst"])
        async def get_reports(token_data: dict = Depends(get_current_user_token)):
            pass
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            token_data = kwargs.get("token_data") or kwargs.get("current_user")
            
            if not token_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            user_role = token_data.get("role")
            
            # Super admin has access to everything
            if user_role == "super_admin":
                return await func(*args, **kwargs)
            
            if user_role not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"One of roles {required_roles} required"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator
