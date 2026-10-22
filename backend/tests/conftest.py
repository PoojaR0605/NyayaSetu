"""
Test configuration and fixtures.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import Base, get_db
from app.models import *  # Import all models
from app.core.security import get_password_hash

# Test database URL (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database for each test.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Create a test client with database override.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_admin_user(db):
    """
    Create a test admin user.
    """
    from app.models.admin import AdminUser
    
    user = AdminUser(
        username="testadmin",
        email="test@nyayasetu.org",
        password_hash=get_password_hash("testpassword"),
        role="admin",
        full_name="Test Admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@pytest.fixture(scope="function")
def auth_headers(client, test_admin_user):
    """
    Get authentication headers for API calls.
    """
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "testpassword"}
    )
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def test_session(db):
    """
    Create a test session.
    """
    from app.models.session import Session
    from datetime import datetime, timedelta, timezone
    
    session = Session(
        session_token="test_token_123",
        language="hi",
        user_type="citizen",
        state="Maharashtra",
        district="Mumbai",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return session


@pytest.fixture(scope="function")
def test_legal_resource(db):
    """
    Create a test legal resource.
    """
    from app.models.legal import LegalResource
    
    resource = LegalResource(
        name="Test Legal Aid Center",
        name_hi="टेस्ट कानूनी सहायता केंद्र",
        resource_type="legal_aid_center",
        description="A test legal aid center",
        state="Maharashtra",
        district="Mumbai",
        city="Mumbai",
        phone="+91-22-12345678",
        email="test@legalaid.org",
        provides_free_service=True,
        is_active=True,
        specializations=["domestic_violence", "property"],
        languages_supported=["hi", "en", "mr"]
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    return resource
