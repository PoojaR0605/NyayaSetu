"""
Tests for authentication endpoints.
"""

import pytest
from fastapi import status


def test_login_success(client, test_admin_user):
    """Test successful login."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "testpassword"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testadmin"
    assert data["user"]["role"] == "admin"


def test_login_wrong_password(client, test_admin_user):
    """Test login with wrong password."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "wrongpassword"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "password": "password"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout(client):
    """Test logout endpoint."""
    response = client.post("/api/v1/auth/logout")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Successfully logged out"
