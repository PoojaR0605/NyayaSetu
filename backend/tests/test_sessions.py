"""
Tests for session endpoints.
"""

import pytest
from fastapi import status


def test_start_session(client):
    """Test starting a new session."""
    response = client.post(
        "/api/v1/sessions/start",
        json={
            "language": "hi",
            "user_type": "citizen",
            "state": "Maharashtra",
            "district": "Mumbai"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "id" in data
    assert "session_token" in data
    assert data["language"] == "hi"
    assert data["user_type"] == "citizen"
    assert data["state"] == "Maharashtra"


def test_get_session(client, test_session):
    """Test retrieving a session."""
    response = client.get(f"/api/v1/sessions/{test_session.session_token}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["session_token"] == test_session.session_token


def test_get_nonexistent_session(client):
    """Test retrieving non-existent session."""
    response = client.get("/api/v1/sessions/invalid_token")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_add_message(client, test_session):
    """Test adding a message to conversation."""
    response = client.post(
        f"/api/v1/sessions/{test_session.session_token}/messages",
        json={"content": "मुझे कानूनी सहायता चाहिए"}
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["role"] == "assistant"  # Returns assistant response
    assert "content" in data


def test_get_conversation(client, test_session, db):
    """Test retrieving full conversation."""
    from app.services.session_service import SessionService
    
    # Add some messages
    SessionService.add_message(
        db, str(test_session.id), "user", "Hello"
    )
    SessionService.add_message(
        db, str(test_session.id), "assistant", "Hi there"
    )
    
    response = client.get(f"/api/v1/sessions/{test_session.session_token}/conversation")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_messages"] == 2
    assert len(data["messages"]) == 2


def test_close_session(client, test_session):
    """Test closing a session."""
    response = client.post(f"/api/v1/sessions/{test_session.session_token}/close")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Session closed successfully"


def test_case_strength_no_messages(client, test_session):
    """Case-strength returns 400 when session has no user messages."""
    response = client.get(
        f"/api/v1/sessions/{test_session.session_token}/case-strength"
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_case_strength_with_messages(client, test_session, db):
    """Case-strength returns 200 with analysis when user messages exist."""
    from app.services.session_service import SessionService
    from app.core.config import get_settings

    # Add a user message so the endpoint has content to assess.
    SessionService.add_message(
        db, str(test_session.id), "user",
        "My landlord refuses to return my security deposit."
    )

    settings = get_settings()
    original_demo = settings.DEMO_MODE
    # Force demo mode so the test does not require Ollama.
    settings.DEMO_MODE = True

    try:
        response = client.get(
            f"/api/v1/sessions/{test_session.session_token}/case-strength"
        )
    finally:
        settings.DEMO_MODE = original_demo

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "analysis" in data
    assert "recommendation" in data
    assert "disclaimer" in data
    assert len(data["analysis"]) > 0


def test_delete_session(client, test_session):
    """Deleting a session returns 200 and the session is then gone."""
    # Delete it.
    response = client.delete(
        f"/api/v1/sessions/{test_session.session_token}"
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["deleted"] is True

    # Confirm it is gone.
    response = client.get(
        f"/api/v1/sessions/{test_session.session_token}"
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
