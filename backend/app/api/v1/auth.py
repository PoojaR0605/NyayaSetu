"""
Authentication API endpoints for NYAYASETU.
Supports registration, JSON/form login, and logout.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.auth_service import AuthService
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


# ---------- Request schemas ----------

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)


class LoginJSONRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


# ---------- Shared helpers ----------

def _register_user(data: RegisterRequest, db: Session):
    email = str(data.email).lower()

    user = AuthService.create_admin_user(
        db=db,
        username=email,
        email=email,
        password=data.password,
        role="viewer",
        full_name=data.full_name,
    )

    token_data = AuthService.create_user_token(user)

    logger.info("New account registered: %s", email)

    return {
        **token_data,
        "message": "Account created successfully",
    }


def _login_user(username: str, password: str, db: Session):
    # The application uses the email address as the username.
    username = username.strip().lower()

    user = AuthService.authenticate_user(
        db=db,
        username=username,
        password=password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthService.create_user_token(user)


# ---------- Registration ----------

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return _register_user(data, db)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Registration failed")

        # Duplicate account errors should be handled by the service.
        if "already registered" in str(exc).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email or username is already registered.",
            ) from exc

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again.",
        ) from exc


# ---------- Login: JSON ----------

@router.post("/login")
async def login_json(
    credentials: LoginJSONRequest,
    db: Session = Depends(get_db),
):
    return _login_user(
        username=credentials.username,
        password=credentials.password,
        db=db,
    )


# ---------- Login: form data ----------

@router.post("/login", include_in_schema=False)
async def login_form(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return _login_user(
        username=credentials.username,
        password=credentials.password,
        db=db,
    )


# ---------- Logout ----------

@router.post("/logout")
async def logout():
    # JWTs are stateless; the frontend must clear its stored token.
    return {"message": "Successfully logged out"}
