"""
Audit logging model.
"""

from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class AuditLog(Base):
    """Audit log for tracking system actions."""
    
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Action details
    action = Column(String(100), nullable=False, index=True)  # "login", "create_assessment", "update_resource"
    entity_type = Column(String(100), nullable=True, index=True)  # "AdminUser", "Assessment", etc.
    entity_id = Column(String(36), nullable=True, index=True)
    
    # Actor information
    actor_type = Column(String(50), nullable=False)  # "admin", "system", "user"
    actor_id = Column(String(36), nullable=True)
    actor_username = Column(String(100), nullable=True)
    
    # Request context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    request_method = Column(String(10), nullable=True)
    request_path = Column(String(500), nullable=True)
    
    # Changes
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    
    # Outcome
    status = Column(String(20), nullable=False)  # "success", "failure", "error"
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog(action='{self.action}', entity='{self.entity_type}', status='{self.status}')>"
