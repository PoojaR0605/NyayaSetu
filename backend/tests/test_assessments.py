"""
Tests for assessment endpoints.
"""

import pytest
from fastapi import status


def test_create_assessment(client, test_session, db):
    """Test creating an assessment."""
    from app.services.session_service import SessionService
    
    # Add some conversation messages
    SessionService.add_message(
        db, str(test_session.id), "user", "मुझे घरेलू हिंसा के मामले में मदद चाहिए"
    )
    SessionService.add_message(
        db, str(test_session.id), "assistant", "I understand. Tell me more."
    )
    
    response = client.post(f"/api/v1/assessments/create/{test_session.session_token}")
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "id" in data
    assert "eligibility_status" in data
    assert "urgency_level" in data
    assert len(data["extracted_facts"]) > 0
    assert len(data["action_items"]) > 0


def test_create_assessment_insufficient_data(client, test_session):
    """Test creating assessment with insufficient conversation."""
    response = client.post(f"/api/v1/assessments/create/{test_session.session_token}")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_get_assessment(client, test_session, db):
    """Test retrieving an assessment."""
    from app.services.session_service import SessionService
    from app.services.assessment_service import AssessmentService
    
    # Add messages and create assessment
    SessionService.add_message(db, str(test_session.id), "user", "Help needed")
    SessionService.add_message(db, str(test_session.id), "assistant", "Sure")
    
    assessment = AssessmentService.create_assessment(
        db=db,
        session_id=str(test_session.id),
        eligibility_status="eligible",
        urgency_level="moderate"
    )
    
    response = client.get(f"/api/v1/assessments/{test_session.session_token}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["eligibility_status"] == "eligible"


def test_get_nonexistent_assessment(client, test_session):
    """Test retrieving non-existent assessment."""
    response = client.get(f"/api/v1/assessments/{test_session.session_token}")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
