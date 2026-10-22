"""
Database initialization script.
Creates initial admin user and sample data.
"""

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models import *  # Import all models
from app.core.security import get_password_hash
from app.core.logging import get_logger

logger = get_logger(__name__)


def init_database():
    """Initialize database with tables."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def create_admin_user(db: Session):
    """Create default admin user if not exists."""
    from app.models.admin import AdminUser
    
    existing_admin = db.query(AdminUser).filter(
        AdminUser.username == "admin"
    ).first()
    
    if existing_admin:
        logger.info("Admin user already exists")
        return
    
    admin = AdminUser(
        username="admin",
        email="admin@nyayasetu.org",
        password_hash=get_password_hash("admin123"),  # Change in production!
        role="super_admin",
        full_name="System Administrator",
        is_active=True
    )
    
    db.add(admin)
    db.commit()
    
    logger.info("Created default admin user (username: admin, password: admin123)")


def create_sample_legal_resources(db: Session):
    """Create sample legal resources."""
    from app.models.legal import LegalResource
    
    # Check if resources exist
    existing = db.query(LegalResource).first()
    if existing:
        logger.info("Sample legal resources already exist")
        return
    
    resources = [
        LegalResource(
            name="Maharashtra State Legal Services Authority",
            name_hi="महाराष्ट्र राज्य कानूनी सेवा प्राधिकरण",
            resource_type="legal_aid_center",
            description="State-level legal aid authority providing free legal services",
            description_hi="मुफ्त कानूनी सेवाएं प्रदान करने वाला राज्य स्तरीय कानूनी सहायता प्राधिकरण",
            state="Maharashtra",
            district="Mumbai",
            city="Mumbai",
            address="High Court Building, Mumbai",
            phone="+91-22-22620181",
            email="mslsa@maharashtra.gov.in",
            website="https://mslsa.maharashtra.gov.in",
            specializations=["all"],
            languages_supported=["hi", "en", "mr"],
            provides_free_service=True,
            is_active=True,
            verification_status="verified"
        ),
        LegalResource(
            name="Majlis Legal Centre",
            name_hi="मजलिस कानूनी केंद्र",
            resource_type="ngo",
            description="NGO providing legal aid for women and marginalized communities",
            description_hi="महिलाओं और हाशिए के समुदायों के लिए कानूनी सहायता प्रदान करने वाली एनजीओ",
            state="Maharashtra",
            district="Mumbai",
            city="Mumbai",
            address="Majlis Office, Mumbai",
            phone="+91-22-26671789",
            email="info@majlislaw.com",
            website="https://www.majlislaw.com",
            specializations=["domestic_violence", "family_law", "property"],
            languages_supported=["hi", "en", "mr", "ur"],
            provides_free_service=True,
            is_active=True,
            verification_status="verified"
        ),
        LegalResource(
            name="District Legal Services Authority - Pune",
            name_hi="जिला कानूनी सेवा प्राधिकरण - पुणे",
            resource_type="legal_aid_center",
            description="District-level legal aid services in Pune",
            state="Maharashtra",
            district="Pune",
            city="Pune",
            phone="+91-20-26123456",
            specializations=["all"],
            languages_supported=["hi", "en", "mr"],
            provides_free_service=True,
            is_active=True,
            verification_status="verified"
        )
    ]
    
    for resource in resources:
        db.add(resource)
    
    db.commit()
    logger.info(f"Created {len(resources)} sample legal resources")


def create_sample_legal_issues(db: Session):
    """Create sample legal issues."""
    from app.models.legal import LegalIssue
    
    existing = db.query(LegalIssue).first()
    if existing:
        logger.info("Sample legal issues already exist")
        return
    
    issues = [
        LegalIssue(
            name="Domestic Violence",
            name_hi="घरेलू हिंसा",
            category="Family Law",
            description="Issues related to domestic violence and protection",
            description_hi="घरेलू हिंसा और सुरक्षा से संबंधित मुद्दे",
            keywords=["violence", "abuse", "protection", "dvact"],
            keywords_hi=["हिंसा", "दुर्व्यवहार", "सुरक्षा"],
            is_active=True
        ),
        LegalIssue(
            name="Property Dispute",
            name_hi="संपत्ति विवाद",
            category="Property Law",
            description="Issues related to property rights and disputes",
            description_hi="संपत्ति अधिकार और विवाद से संबंधित मुद्दे",
            keywords=["property", "land", "inheritance", "dispute"],
            keywords_hi=["संपत्ति", "भूमि", "विरासत", "विवाद"],
            is_active=True
        ),
        LegalIssue(
            name="Consumer Rights",
            name_hi="उपभोक्ता अधिकार",
            category="Consumer Law",
            description="Issues related to consumer rights and protection",
            description_hi="उपभोक्ता अधिकार और संरक्षण से संबंधित मुद्दे",
            keywords=["consumer", "refund", "defective", "service"],
            keywords_hi=["उपभोक्ता", "रिफंड", "दोषपूर्ण", "सेवा"],
            is_active=True
        )
    ]
    
    for issue in issues:
        db.add(issue)
    
    db.commit()
    logger.info(f"Created {len(issues)} sample legal issues")


def main():
    """Main initialization function."""
    logger.info("Starting database initialization...")
    
    # Create tables
    init_database()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Create initial data
        create_admin_user(db)
        create_sample_legal_resources(db)
        create_sample_legal_issues(db)
        
        logger.info("Database initialization completed successfully!")
        logger.info("\n" + "="*60)
        logger.info("DEFAULT ADMIN CREDENTIALS:")
        logger.info("Username: admin")
        logger.info("Password: admin123")
        logger.info("⚠️  CHANGE THIS PASSWORD IN PRODUCTION!")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
