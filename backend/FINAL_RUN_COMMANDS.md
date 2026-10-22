# NYAYASETU Backend - Final Run Commands

## ✅ Setup Complete! Backend is Ready to Run

All dependencies are installed and models are fixed for SQLite compatibility.

---

## 🚀 Quick Start (3 Commands)

### 1. Initialize Database
```powershell
cd c:\Users\preet\trustchain\nyaysetu\backend
python -m app.db.init_db
```

**Expected Output:**
```
INFO: Creating database tables...
INFO: Database tables created successfully
INFO: Created default admin user (username: admin, password: admin123)
INFO: Created 3 sample legal resources
INFO: Created 3 sample legal issues
============================================================
DEFAULT ADMIN CREDENTIALS:
Username: admin
Password: admin123
⚠️  CHANGE THIS PASSWORD IN PRODUCTION!
============================================================
```

### 2. Run Server
```powershell
python -m uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 3. Test Backend
Open browser to: **http://localhost:8000/api/docs**

OR test with curl:
```powershell
curl http://localhost:8000/health
```

---

## 📋 Complete Step-by-Step Guide

### Step 1: Verify Installation
```powershell
# Check Python
python --version
# Should show Python 3.10+

# Check dependencies
python -c "import fastapi, sqlalchemy, pydantic_settings; print('✓ All packages installed')"
```

### Step 2: Initialize Database
```powershell
python -m app.db.init_db
```

This creates:
- ✅ All database tables
- ✅ Default admin user
- ✅ 3 sample legal resources (Maharashtra State Legal Services, Majlis Legal Centre, Pune DLSA)
- ✅ 3 sample legal issues (Domestic Violence, Property Dispute, Consumer Rights)

### Step 3: Start Server
```powershell
# Development mode (with auto-reload)
python -m uvicorn app.main:app --reload

# OR using Python directly
python -m app.main

# Custom port
python -m uvicorn app.main:app --reload --port 8080

# Production mode (no reload, multiple workers)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Step 4: Verify Server is Running
```powershell
# Health check
curl http://localhost:8000/health

# Root endpoint
curl http://localhost:8000/

# API status
curl http://localhost:8000/api/v1/status
```

---

## 🧪 Testing Commands

### Run All Tests
```powershell
# Install pytest if not installed
python -m pip install pytest pytest-cov

# Run all tests
pytest

# Verbose output
pytest -v

# With coverage
pytest --cov=app --cov-report=html
```

### Test Individual Components
```powershell
# Auth tests
pytest tests/test_auth.py -v

# Session tests
pytest tests/test_sessions.py -v

# Assessment tests
pytest tests/test_assessments.py -v

# Resource tests
pytest tests/test_legal_resources.py -v
```

---

## 🌐 API Testing

### Using Browser
1. **Interactive API Docs**: http://localhost:8000/api/docs
2. **Alternative Docs**: http://localhost:8000/api/redoc

### Using PowerShell (curl)

#### 1. Start a Session
```powershell
$response = curl -X POST http://localhost:8000/api/v1/sessions/start `
  -H "Content-Type: application/json" `
  -d '{\"language\":\"hi\",\"user_type\":\"citizen\",\"state\":\"Maharashtra\",\"district\":\"Mumbai\"}'

# Extract token (manual - parse JSON)
echo $response
```

#### 2. Login as Admin
```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

#### 3. Send Message
```powershell
curl -X POST http://localhost:8000/api/v1/sessions/YOUR_SESSION_TOKEN/messages `
  -H "Content-Type: application/json" `
  -d '{\"content\":\"मुझे घरेलू हिंसा के मामले में मदद चाहिए\"}'
```

#### 4. Create Assessment
```powershell
curl -X POST http://localhost:8000/api/v1/assessments/create/YOUR_SESSION_TOKEN
```

#### 5. Search Legal Resources
```powershell
curl -X POST http://localhost:8000/api/v1/legal-resources/search `
  -H "Content-Type: application/json" `
  -d '{\"state\":\"Maharashtra\",\"district\":\"Mumbai\",\"limit\":5}'
```

---

## 📊 Monitoring

### View Logs
```powershell
# View latest logs
Get-Content logs\nyayasetu.log -Tail 50

# Follow logs in real-time
Get-Content logs\nyayasetu.log -Wait

# Search for errors
Select-String -Path logs\nyayasetu.log -Pattern "ERROR"
```

### Check Database
```powershell
# For SQLite, you can inspect the database file
sqlite3 nyayasetu.db ".tables"
```

---

## 🛑 Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

---

## 🔧 Troubleshooting

### Problem: "Module not found"
```powershell
# Solution: Reinstall dependencies
python -m pip install -r requirements.txt
```

### Problem: "Database connection failed"
```powershell
# Solution: Reinitialize database
Remove-Item nyayasetu.db -ErrorAction SilentlyContinue
python -m app.db.init_db
```

### Problem: "Port 8000 already in use"
```powershell
# Solution: Use different port
python -m uvicorn app.main:app --reload --port 8001
```

### Problem: Import errors
```powershell
# Solution: Make sure you're in the backend directory
cd c:\Users\preet\trustchain\nyaysetu\backend
python -c "from app.main import app; print('OK')"
```

---

## 📝 Default Credentials

**Admin Login:**
```
Username: admin
Password: admin123
```

⚠️ **Change this in production!**

To change password:
```python
from app.db.session import SessionLocal
from app.models.admin import AdminUser
from app.core.security import get_password_hash

db = SessionLocal()
user = db.query(AdminUser).filter(AdminUser.username == "admin").first()
user.password_hash = get_password_hash("NEW_PASSWORD")
db.commit()
```

---

## 🎯 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/api/docs` | Interactive API documentation |
| GET | `/api/v1/status` | API status |
| POST | `/api/v1/auth/login` | Admin login |
| POST | `/api/v1/sessions/start` | Start user session |
| POST | `/api/v1/sessions/{token}/messages` | Send message |
| GET | `/api/v1/sessions/{token}/conversation` | Get conversation |
| POST | `/api/v1/assessments/create/{token}` | Create assessment |
| GET | `/api/v1/assessments/{token}` | Get assessment |
| POST | `/api/v1/legal-resources/search` | Search resources |
| GET | `/api/v1/legal-resources/{id}` | Get resource details |

---

## 🎉 Success Indicators

You know the backend is working correctly when:

✅ Health endpoint returns `{"status":"healthy"}`
✅ API docs load at http://localhost:8000/api/docs
✅ Admin login returns JWT token
✅ Session creation returns session_token
✅ Assessment creation returns full assessment object
✅ Resource search returns legal aid centers
✅ All tests pass with `pytest`

---

## 📞 Quick Command Reference

```powershell
# Setup
cd c:\Users\preet\trustchain\nyaysetu\backend
python -m app.db.init_db

# Run
python -m uvicorn app.main:app --reload

# Test
pytest

# Health
curl http://localhost:8000/health

# Docs
start http://localhost:8000/api/docs
```

---

**✅ Backend is ready! Open http://localhost:8000/api/docs to start testing.**
