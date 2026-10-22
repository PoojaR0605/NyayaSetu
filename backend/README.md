# NYAYASETU Backend

FastAPI backend for the NYAYASETU Legal Aid Discovery Platform.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL 14+ (or SQLite for development)
- Redis (optional, for session caching)

### Automated Setup (Recommended)

```powershell
# Navigate to backend directory
cd backend

# Run automated setup
python setup.py
```

This will:
- Create virtual environment
- Install all dependencies
- Create .env from template
- Initialize database with sample data
- Create default admin user

### Manual Setup

#### 1. Environment Setup

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Configuration

```powershell
# Copy example environment file
copy .env.example .env

# Edit .env with your values
notepad .env
```

**Minimum required settings:**
```env
DATABASE_URL=sqlite:///./nyayasetu.db
SECRET_KEY=your-secret-key-min-32-characters-long-change-this
```

#### 3. Database Initialization

```powershell
# Initialize database with tables and sample data
python -m app.db.init_db
```

This creates:
- All database tables
- Default admin user (username: `admin`, password: `admin123`)
- Sample legal resources
- Sample legal issues

⚠️ **IMPORTANT:** Change default admin password in production!

#### 4. Run Server

```powershell
# Method 1: Direct Python
python -m app.main

# Method 2: Using uvicorn (recommended for development)
uvicorn app.main:app --reload

# Method 3: Custom host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Method 4: Production (no reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### 5. Access Application

- **API Root**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs (Interactive Swagger UI)
- **ReDoc**: http://localhost:8000/api/redoc (Alternative documentation)
- **Health Check**: http://localhost:8000/health
- **API Status**: http://localhost:8000/api/v1/status

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/              # API version 1 routes
│   │       ├── auth.py      # Authentication endpoints
│   │       ├── sessions.py  # Session management
│   │       ├── assessments.py
│   │       └── ...
│   ├── core/
│   │   ├── config.py        # Configuration management
│   │   ├── security.py      # Auth & JWT
│   │   └── logging.py       # Logging setup
│   ├── db/
│   │   └── session.py       # Database connection
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── admin.py
│   │   ├── session.py
│   │   ├── assessment.py
│   │   └── legal.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── auth.py
│   │   ├── session.py
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── auth_service.py
│   │   ├── nlp_service.py
│   │   ├── llm_service.py
│   │   └── ...
│   ├── utils/               # Utilities
│   │   ├── validators.py
│   │   └── ...
│   └── main.py              # Application entry point
├── tests/                   # Test suite
│   ├── conftest.py
│   ├── test_auth.py
│   └── ...
├── alembic/                 # Database migrations
├── logs/                    # Log files
├── requirements.txt         # Dependencies
├── .env.example             # Example environment
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection string | - | Yes |
| `SECRET_KEY` | JWT secret key (32+ chars) | - | Yes |
| `OPENAI_API_KEY` | OpenAI API key | - | No |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` | No |
| `DEBUG` | Enable debug mode | `False` | No |
| `LOG_LEVEL` | Logging level | `INFO` | No |

### Database Setup

**Option 1: SQLite (Development)**
```env
DATABASE_URL=sqlite:///./nyayasetu.db
```

**Option 2: PostgreSQL (Production)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nyayasetu
```

**Create PostgreSQL database:**
```powershell
# Using psql
createdb nyayasetu

# Or in PostgreSQL shell
CREATE DATABASE nyayasetu;
```

## 🧪 Testing

### Run All Tests

```powershell
# Activate virtual environment first
.\venv\Scripts\activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test function
pytest tests/test_auth.py::test_login_success

# Run tests matching pattern
pytest -k "test_session"
```

### Test Coverage

```powershell
# Generate coverage report
pytest --cov=app --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Current Test Coverage

- ✅ Authentication (login, logout)
- ✅ Session management (create, retrieve, messages)
- ✅ Assessment creation and retrieval
- ✅ Legal resource search
- ✅ Health endpoints
- ✅ API status endpoints

### Writing New Tests

```python
# tests/test_new_feature.py
import pytest
from fastapi import status

def test_new_feature(client, db):
    """Test description."""
    response = client.post("/api/v1/endpoint", json={...})
    assert response.status_code == status.HTTP_200_OK
```

## 📚 API Documentation

### Authentication

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Create Session

```http
POST /api/v1/sessions/start
Content-Type: application/json

{
  "language": "hi",
  "user_type": "citizen"
}
```

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": "connected",
    "api": "operational"
  }
}
```

## 🔐 Security

### JWT Authentication

- Tokens expire in 60 minutes (configurable)
- Algorithm: HS256
- Passwords hashed with bcrypt

### Role-Based Access Control

- **super_admin**: Full access
- **admin**: Manage resources
- **viewer**: Read-only access

### Usage in Routes

```python
from app.core.security import require_role

@router.get("/admin/users", dependencies=[Depends(require_role("admin"))])
async def get_users(db: Session = Depends(get_db)):
    return {"users": [...]}
```

## 📊 Logging

Logs are written to:
- **Console**: Human-readable format
- **File**: JSON format at `logs/nyayasetu.log`

Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

```python
from app.core.logging import get_logger

logger = get_logger(__name__)
logger.info("Message", extra={"user_id": "123"})
```

## 🗄️ Database Models

### Current Models

- [x] AdminUser - System administrators
- [ ] Session - User sessions (24hr TTL)
- [ ] ConversationMessage - Chat history
- [ ] Assessment - Eligibility results
- [ ] ExtractedFact - Structured data
- [ ] LegalIssue - Legal categories
- [ ] EligibilityRule - Eligibility criteria
- [ ] LegalResource - Providers

## 🛠️ Development

### Create Migration

```powershell
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
```

### Code Formatting

```powershell
# Format code
black app/ tests/

# Check style
flake8 app/ tests/

# Type checking
mypy app/
```

### Hot Reload

When running with `--reload`, the server automatically restarts on code changes.

## 🐛 Troubleshooting

### Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution:** Check DATABASE_URL in .env, ensure database server is running.

### Import Error

```
ModuleNotFoundError: No module named 'app'
```

**Solution:** Run from backend directory:
```powershell
cd backend
python -m app.main
```

### JWT Decode Error

```
jose.exceptions.JWTError: Signature verification failed
```

**Solution:** SECRET_KEY in .env must be the same as when token was created.

## 📦 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```powershell
docker build -t nyayasetu-backend .
docker run -p 8000:8000 --env-file .env nyayasetu-backend
```

### Production Settings

```env
APP_ENV=production
DEBUG=False
DATABASE_URL=postgresql://user:pass@prod-db:5432/nyayasetu
ALLOWED_ORIGINS=https://nyayasetu.org
```

## 📝 TODO

### Phase 1: Core Foundation (Current)
- [x] Configuration management
- [x] Security & JWT
- [x] Database session
- [x] Logging
- [x] Health endpoints
- [ ] Admin user CRUD
- [ ] Auth endpoints

### Phase 2: Core Features
- [ ] Session management
- [ ] Conversation API
- [ ] NLP service integration
- [ ] LLM service integration
- [ ] Eligibility rule engine
- [ ] Case support assessment
- [ ] Resource matching

### Phase 3: Advanced Features
- [ ] Document upload
- [ ] Admin dashboard APIs
- [ ] Analytics endpoints
- [ ] Demo mode
- [ ] Rate limiting
- [ ] Caching (Redis)

## 📞 Support

For issues or questions:
- Check logs in `logs/nyayasetu.log`
- Review API docs at `/api/docs`
- See main project README

## 📄 License

See main project LICENSE file.
