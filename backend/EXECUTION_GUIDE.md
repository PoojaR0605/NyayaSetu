# NYAYASETU Backend - Execution Guide

## 📋 Exact Commands to Run and Test

This document provides the exact sequence of commands to setup, run, and test the NYAYASETU backend.

---

## 🎯 Complete Execution Flow

### Part 1: Initial Setup (One-Time Only)

```powershell
# 1. Navigate to backend directory
cd c:\Users\preet\trustchain\nyaysetu\backend

# 2. Run automated setup (installs everything)
python setup.py
```

**When prompted "Initialize database with sample data? (y/n):"** → Type `y` and press Enter

**Expected Output:**
```
✅ SETUP COMPLETED!
Created default admin user (username: admin, password: admin123)
```

---

### Part 2: Run the Backend

```powershell
# 1. Activate virtual environment
.\venv\Scripts\activate

# Your prompt should now show (venv) at the beginning

# 2. Start the server
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Backend is now running!**

Keep this terminal window open. Open a new terminal for testing.

---

### Part 3: Test the Backend

Open a **new PowerShell window** and run these commands:

#### Test 1: Health Check

```powershell
curl http://localhost:8000/health
```

**Expected Response:**
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

#### Test 2: View API Documentation

Open in browser:
```
http://localhost:8000/api/docs
```

You should see the interactive Swagger UI with all endpoints.

#### Test 3: Admin Login

```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@nyayasetu.org",
    "role": "super_admin"
  }
}
```

#### Test 4: Start Session

```powershell
curl -X POST http://localhost:8000/api/v1/sessions/start `
  -H "Content-Type: application/json" `
  -d '{\"language\":\"hi\",\"user_type\":\"citizen\",\"state\":\"Maharashtra\",\"district\":\"Mumbai\"}'
```

**Expected Response:**
```json
{
  "id": "...",
  "session_token": "A_LONG_TOKEN_STRING",
  "language": "hi",
  "user_type": "citizen",
  "state": "Maharashtra",
  "district": "Mumbai",
  ...
}
```

**Copy the `session_token` value** - you'll need it for next steps!

#### Test 5: Send Message

Replace `YOUR_SESSION_TOKEN` with the token from previous step:

```powershell
curl -X POST http://localhost:8000/api/v1/sessions/YOUR_SESSION_TOKEN/messages `
  -H "Content-Type: application/json" `
  -d '{\"content\":\"मुझे घरेलू हिंसा के मामले में मदद चाहिए\"}'
```

#### Test 6: Create Assessment

```powershell
curl -X POST http://localhost:8000/api/v1/assessments/create/YOUR_SESSION_TOKEN
```

**Expected Response:**
Full assessment with eligibility status, urgency level, resources, etc.

#### Test 7: Search Legal Resources

```powershell
curl -X POST http://localhost:8000/api/v1/legal-resources/search `
  -H "Content-Type: application/json" `
  -d '{\"state\":\"Maharashtra\",\"district\":\"Mumbai\",\"limit\":5}'
```

**Expected Response:**
List of legal aid centers in Mumbai.

---

### Part 4: Run Automated Tests

In a **new terminal** (backend server should still be running):

```powershell
# 1. Navigate to backend
cd c:\Users\preet\trustchain\nyaysetu\backend

# 2. Activate venv
.\venv\Scripts\activate

# 3. Run all tests
pytest

# 4. Run with verbose output
pytest -v

# 5. Run with coverage report
pytest --cov=app --cov-report=term-missing
```

**Expected Output:**
```
============== test session starts ==============
collected 21 items

tests/test_auth.py ....                    [ 19%]
tests/test_sessions.py ......              [ 47%]
tests/test_assessments.py ....             [ 66%]
tests/test_legal_resources.py ....         [ 85%]
tests/test_health.py ...                   [100%]

============== 21 passed in 2.50s ==============
```

**✅ All tests should pass!**

---

## 📊 Verification Checklist

After running the above commands, verify:

- [ ] Health endpoint returns "healthy"
- [ ] API docs accessible at /api/docs
- [ ] Admin login returns JWT token
- [ ] Session creation returns session_token
- [ ] Message posting returns assistant response
- [ ] Assessment creation returns full assessment
- [ ] Resource search returns legal aid centers
- [ ] All 21 tests pass
- [ ] No errors in server logs

---

## 🎯 For Demonstration/Viva

### Demo Script (Exact Steps)

**Step 1: Show it's running**
```powershell
curl http://localhost:8000/health
```
→ Explain: "Health endpoint confirms database connected and API operational"

**Step 2: Show API documentation**
- Open: http://localhost:8000/api/docs
→ Explain: "Auto-generated from code, interactive testing available"

**Step 3: Demo complete user flow**

1. **Start session**
```powershell
curl -X POST http://localhost:8000/api/v1/sessions/start `
  -H "Content-Type: application/json" `
  -d '{\"language\":\"hi\",\"user_type\":\"citizen\",\"state\":\"Maharashtra\"}'
```
→ Explain: "Session created with 24-hour expiry, supports Hindi"

2. **Send message** (use token from step 1)
```powershell
curl -X POST http://localhost:8000/api/v1/sessions/TOKEN/messages `
  -H "Content-Type: application/json" `
  -d '{\"content\":\"मुझे घरेलू हिंसा के मामले में मदद चाहिए\"}'
```
→ Explain: "User describes issue in Hindi, system responds"

3. **Create assessment**
```powershell
curl -X POST http://localhost:8000/api/v1/assessments/create/TOKEN
```
→ Explain: "System analyzes conversation, determines:
- Eligibility status (potentially_eligible)
- Urgency level (based on keywords)
- Preliminary support assessment
- Recommended actions
- Matched legal resources"

4. **Show matched resources**
→ Point to the `resources` array in assessment response
→ Explain: "Resources matched by location, specialization, and distance"

**Step 4: Show test coverage**
```powershell
pytest -v
```
→ Explain: "21 tests covering all endpoints, 100% pass rate"

**Step 5: Show code structure**
→ Open VSCode/editor
→ Show:
  - `app/main.py` - Application entry
  - `app/models/` - Database models
  - `app/services/` - Business logic (separated from routes)
  - `app/api/v1/` - API endpoints
  - `tests/` - Test suite

---

## 🐛 Troubleshooting

### Problem: "python not recognized"
**Solution:**
```powershell
# Add Python to PATH or use full path
C:\Python311\python.exe setup.py
```

### Problem: "Module not found"
**Solution:**
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Problem: "Port 8000 already in use"
**Solution:**
```powershell
# Use different port
uvicorn app.main:app --reload --port 8001
```

### Problem: "Database locked" (SQLite)
**Solution:**
```powershell
# Stop server (Ctrl+C)
# Delete database file
Remove-Item nyayasetu.db
# Reinitialize
python -m app.db.init_db
# Restart server
```

### Problem: Tests failing
**Solution:**
```powershell
# Clear cache
Remove-Item -Recurse -Force .pytest_cache
# Rerun
pytest
```

### Problem: "Cannot activate venv"
**Solution:**
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then activate
.\venv\Scripts\activate
```

---

## 📁 File Locations

- **Server logs**: `backend/logs/nyayasetu.log`
- **Database** (SQLite): `backend/nyayasetu.db`
- **Config**: `backend/.env`
- **Virtual env**: `backend/venv/`

---

## 🎓 Key Points for Viva

1. **Architecture**: 3-tier (API → Service → Database)
2. **Security**: JWT + bcrypt + RBAC
3. **Validation**: Pydantic schemas at every endpoint
4. **Testing**: Isolated tests with in-memory DB
5. **Logging**: Structured JSON logging to file
6. **Documentation**: Auto-generated from code
7. **Eligibility**: Deterministic rule-based (not AI guessing)
8. **Resource Matching**: Location + specialization + distance
9. **Scalability**: Stateless API, ready for horizontal scaling
10. **Production-Ready**: Proper error handling, logging, security

---

## 📞 Quick Reference

### Most Used Commands

```powershell
# Setup (once)
python setup.py

# Run server
.\venv\Scripts\activate
uvicorn app.main:app --reload

# Run tests
pytest

# Health check
curl http://localhost:8000/health

# View logs
Get-Content logs\nyayasetu.log -Tail 50
```

### Default Credentials
```
Username: admin
Password: admin123
```

### Key URLs
- API: http://localhost:8000
- Docs: http://localhost:8000/api/docs
- Health: http://localhost:8000/health

---

**✅ Follow this guide exactly and your backend will work perfectly!**

For more details, see:
- `QUICKSTART.md` - Quick 5-minute setup
- `COMMANDS.md` - All commands reference
- `README.md` - Complete documentation
- `IMPLEMENTATION_STATUS.md` - What's implemented
