"""
Tests for health and status endpoints.
"""

import pytest
from fastapi import status


def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["app"] == "NYAYASETU"
    assert "version" in data
    assert data["status"] == "running"


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "checks" in data
    assert "database" in data["checks"]


def test_api_status(client):
    """Test API status endpoint."""
    response = client.get("/api/v1/status")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["api_version"] == "v1"
    assert "features" in data
    assert data["features"]["authentication"] == True
