"""
Tests for legal resource endpoints.
"""

import pytest
from fastapi import status


def test_search_resources(client, test_legal_resource):
    """Test searching for legal resources by state only (no JSON specialisation filter)."""
    response = client.post(
        "/api/v1/legal-resources/search",
        json={
            "state": "Maharashtra",
            "limit": 10
        }
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["name"] == "Test Legal Aid Center"
    assert data[0]["state"] == "Maharashtra"


def test_search_resources_no_results(client):
    """Test search with no matching resources."""
    response = client.post(
        "/api/v1/legal-resources/search",
        json={
            "state": "Kerala",
            "limit": 10
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 0


def test_get_resource(client, test_legal_resource):
    """Test retrieving a specific resource."""
    response = client.get(f"/api/v1/legal-resources/{test_legal_resource.id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test Legal Aid Center"
    assert data["resource_type"] == "legal_aid_center"


def test_get_nonexistent_resource(client):
    """Test retrieving non-existent resource."""
    import uuid
    fake_id = str(uuid.uuid4())
    
    response = client.get(f"/api/v1/legal-resources/{fake_id}")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
