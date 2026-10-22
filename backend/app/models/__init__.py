"""
Database models package.
Imports all models for easy access.
"""

from app.db.session import Base
from app.models.admin import AdminUser
from app.models.session import Session, ConversationMessage
from app.models.assessment import Assessment, ExtractedFact, AssessmentResource, ActionItem
from app.models.legal import (
    LegalIssue,
    LegalRule,
    EligibilityRule,
    EvidencePattern,
    LegalResource
)
from app.models.audit import AuditLog

__all__ = [
    "Base",
    "AdminUser",
    "Session",
    "ConversationMessage",
    "Assessment",
    "ExtractedFact",
    "AssessmentResource",
    "ActionItem",
    "LegalIssue",
    "LegalRule",
    "EligibilityRule",
    "EvidencePattern",
    "LegalResource",
    "AuditLog",
]
