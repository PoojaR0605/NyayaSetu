"""
Security utilities for authentication and authorization.
Handles password hashing, JWT tokens, and role-based access control.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import get_settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token security
security = HTTPBearer()

settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    # Bcrypt has a 72-byte limit
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]
    
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password for storage.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    # Bcrypt has a 72-byte limit
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    
    return pwd_context.hash(password)


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
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
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
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise credentials_exception


async def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Extract and validate JWT token from request.
    
    Dependency for routes that require authentication.
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    username: Optional[str] = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    return payload


def require_role(required_role: str):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @router.get("/admin/users", dependencies=[Depends(require_role("admin"))])
        
    Args:
        required_role: Role required to access the endpoint
        
    Returns:
        Dependency function that checks user role
    """
    async def check_role(
        token_payload: Dict[str, Any] = Depends(get_current_user_token)
    ):
        user_role = token_payload.get("role")
        
        # Super admin can access everything
        if user_role == "super_admin":
            return token_payload
        
        # Check if user has required role
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        
        return token_payload
    
    return check_role


def require_any_role(*allowed_roles: str):
    """
    Dependency factory for allowing multiple roles.
    
    Usage:
        @router.get("/data", dependencies=[Depends(require_any_role("admin", "viewer"))])
        
    Args:
        allowed_roles: Any of these roles can access the endpoint
        
    Returns:
        Dependency function that checks user role
    """
    async def check_any_role(
        token_payload: Dict[str, Any] = Depends(get_current_user_token)
    ):
        user_role = token_payload.get("role")
        
        # Super admin can access everything
        if user_role == "super_admin":
            return token_payload
        
        # Check if user has any of the allowed roles
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Allowed roles: {', '.join(allowed_roles)}"
            )
        
        return token_payload
    
    return check_any_role
