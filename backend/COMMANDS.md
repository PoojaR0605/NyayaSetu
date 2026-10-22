# NYAYASETU Backend - Command Reference

Complete list of commands to setup, run, and test the backend.

## 📦 Initial Setup

### Option 1: Automated Setup (Recommended)

```powershell
cd c:\Users\preet\trustchain\nyaysetu\backend
python setup.py
```

### Option 2: Manual Setup

```powershell
# 1. Navigate to backend directory
cd c:\Users\preet\trustchain\nyaysetu\backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
.\venv\Scripts\activate

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install dependencies
pip install -r requirements.txt

# 6. Create .env file
copy .env.example .env

# 7. Edit .env (change DATABASE_URL and SECRET_KEY)
notepad .env

# 8. Create logs directory
New-Item -ItemType Directory -Path logs -Force

# 9. Initialize database
python -m app.db.init_db
```

## 🚀 Running the Server

### Development Mode (with auto-reload)

```powershell
# Activate venv first
.\venv\Scripts\activate

# Method 1: Direct
python -m app.main

# Method 2: Uvicorn (recommended)
uvicorn app.main:app --reload

# Method 3: Custom port
uvicorn app.main:app --reload --port 8080

# Method 4: Custom host and port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```powershell
# With multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# With specific log level
uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info
```

## 🧪 Testing

### Run Tests

```powershell
# Activate venv
.\venv\Scripts\activate

# All tests
pytest

# Verbose output
pytest -v

# Very verbose (show print statements)
pytest -vv -s

# Specific test file
pytest tests/test_auth.py

# Specific test function
pytest tests/test_auth.py::test_login_success

# Tests matching pattern
pytest -k "session"

# Stop on first failure
pytest -x

# Run last failed tests
pytest --lf
```

### Coverage

```powershell
# Coverage with terminal report
pytest --cov=app

# Coverage with missing lines
pytest --cov=app --cov-report=term-missing

# HTML coverage report
pytest --cov=app --cov-report=html
# Then open: htmlcov\index.html

# XML coverage (for CI/CD)
pytest --cov=app --cov-report=xml
```

## 🗄️ Database Commands

### Initialize/Reset Database

```powershell
# Initialize with sample data
python -m app.db.init_db

# Or using Python directly
python -c "from app.db.init_db import main; main()"
```

### Database Migrations (Alembic)

```powershell
# Initialize Alembic (one-time)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

### SQLite Database (Development)

```powershell
# View database (requires sqlite3)
sqlite3 nyayasetu.db

# Common SQLite commands:
# .tables          - List tables
# .schema          - Show schema
# SELECT * FROM sessions; - Query data
# .exit            - Exit
```

## 🛠️ Development Commands

### Code Formatting

```powershell
# Format code with Black
black app/ tests/

# Check what would be formatted
black --check app/ tests/

# Format specific file
black app/main.py
```

### Linting

```powershell
# Run flake8
flake8 app/ tests/

# With specific config
flake8 app/ --max-line-length=100 --ignore=E501
```

### Type Checking

```powershell
# Run mypy
mypy app/

# Specific module
mypy app/services/
```

## 📝 Logging

### View Logs

```powershell
# View latest logs
Get-Content logs\nyayasetu.log -Tail 50

# Follow logs (real-time)
Get-Content logs\nyayasetu.log -Wait

# Search logs
Select-String -Path logs\nyayasetu.log -Pattern "ERROR"
```

## 🌐 API Testing

### Using curl

```powershell
# Health check
curl http://localhost:8000/health

# Start session
curl -X POST http://localhost:8000/api/v1/sessions/start `
  -H "Content-Type: application/json" `
  -d '{\"language\":\"hi\",\"user_type\":\"citizen\"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'

# Search resources
curl -X POST http://localhost:8000/api/v1/legal-resources/search `
  -H "Content-Type: application/json" `
  -d '{\"state\":\"Maharashtra\",\"limit\":5}'
```

### Using Python requests

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())

# Start session
response = requests.post(
    "http://localhost:8000/api/v1/sessions/start",
    json={"language": "hi", "user_type": "citizen"}
)
print(response.json())
```

## 🔐 Admin User Management

### Create Admin User (Python)

```python
from app.db.session import SessionLocal
from app.services.auth_service import AuthService

db = SessionLocal()
AuthService.create_admin_user(
    db=db,
    username="newadmin",
    email="newadmin@example.com",
    password="securepassword",
    role="admin",
    full_name="New Administrator"
)
db.close()
```

### Change Admin Password (Python)

```python
from app.db.session import SessionLocal
from app.models.admin import AdminUser
from app.core.security import get_password_hash

db = SessionLocal()
user = db.query(AdminUser).filter(AdminUser.username == "admin").first()
user.password_hash = get_password_hash("newpassword")
db.commit()
db.close()
```

## 📊 Monitoring

### Check Server Status

```powershell
# Check if server is running
Test-NetConnection -ComputerName localhost -Port 8000

# Or using curl
curl http://localhost:8000/health
```

### Monitor Processes

```powershell
# Find Python processes
Get-Process python

# Kill specific process by PID
Stop-Process -Id <PID>

# Kill all Python processes (careful!)
Get-Process python | Stop-Process
```

## 🧹 Cleanup

### Remove Virtual Environment

```powershell
# Deactivate first
deactivate

# Remove directory
Remove-Item -Recurse -Force venv
```

### Clean Test Files

```powershell
# Remove pytest cache
Remove-Item -Recurse -Force .pytest_cache

# Remove coverage files
Remove-Item -Recurse -Force htmlcov
Remove-Item .coverage
```

### Clean Logs

```powershell
# Clear log file
Clear-Content logs\nyayasetu.log

# Or remove all logs
Remove-Item -Force logs\*.log
```

## 🐳 Docker Commands (Optional)

### Build and Run with Docker

```powershell
# Build image
docker build -t nyayasetu-backend .

# Run container
docker run -p 8000:8000 --env-file .env nyayasetu-backend

# Run with volume for logs
docker run -p 8000:8000 --env-file .env `
  -v ${PWD}\logs:/app/logs `
  nyayasetu-backend

# Run in background
docker run -d -p 8000:8000 --env-file .env `
  --name nyayasetu-backend `
  nyayasetu-backend

# View logs
docker logs nyayasetu-backend

# Stop container
docker stop nyayasetu-backend

# Remove container
docker rm nyayasetu-backend
```

## 📦 Package Management

### Update Dependencies

```powershell
# Upgrade all packages
pip install --upgrade -r requirements.txt

# Check outdated packages
pip list --outdated

# Update specific package
pip install --upgrade fastapi
```

### Freeze Dependencies

```powershell
# Export current environment
pip freeze > requirements.txt

# Or with specific packages
pip list --format=freeze > requirements-full.txt
```

## 🎯 Quick Reference

### Most Common Commands

```powershell
# Setup
python setup.py

# Run server
.\venv\Scripts\activate
uvicorn app.main:app --reload

# Run tests
pytest

# View logs
Get-Content logs\nyayasetu.log -Tail 50 -Wait

# Health check
curl http://localhost:8000/health

# API docs
# Open: http://localhost:8000/api/docs
```

### Default Credentials

```
Username: admin
Password: admin123
⚠️ Change in production!
```

### Key Endpoints

```
GET    /                           - API info
GET    /health                     - Health check
GET    /api/v1/status             - API status
POST   /api/v1/auth/login         - Login
POST   /api/v1/sessions/start     - Start session
POST   /api/v1/assessments/create/:token - Create assessment
POST   /api/v1/legal-resources/search - Search resources
```

## 🆘 Troubleshooting

### Common Issues

**Issue: ModuleNotFoundError**
```powershell
# Solution: Activate venv and reinstall
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Issue: Database locked (SQLite)**
```powershell
# Solution: Close all connections, restart server
```

**Issue: Port already in use**
```powershell
# Solution: Use different port
uvicorn app.main:app --reload --port 8001
```

**Issue: Permission denied on venv**
```powershell
# Solution: Run as administrator or change execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

For more information, see README.md or visit http://localhost:8000/api/docs
