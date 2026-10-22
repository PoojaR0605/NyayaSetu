"""
Authentication schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "admin",
                "password": "securepassword"
            }
        }
    }


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: dict
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "username": "admin",
                    "email": "admin@nyayasetu.org",
                    "role": "admin"
                }
            }
        }
    }


class TokenData(BaseModel):
    """JWT token payload schema."""
    sub: str  # subject (username)
    role: str
    user_id: str
    exp: Optional[int] = None
