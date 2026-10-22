# NYAYASETU Backend - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Setup (2 minutes)

```powershell
# Navigate to backend
cd c:\Users\preet\trustchain\nyaysetu\backend

# Run automated setup
python setup.py

# Answer 'y' when asked about database initialization
```

This will:
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Create .env file
- ✅ Initialize database
- ✅ Create sample data

### Step 2: Configure (1 minute)

The setup script created `.env` for you. For a quick start with SQLite, the defaults work fine!

**Optional**: Edit `.env` if you want to use PostgreSQL:

```powershell
notepad .env
```

Change:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nyayasetu
```

### Step 3: Run (30 seconds)

```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Run server
uvicorn app.main:app --reload
```

### Step 4: Test (1 minute)

Open your browser to:
- **API Docs**: http://localhost:8000/api/docs
- **Health**: http://localhost:8000/health

Or test with PowerShell:

```powershell
# Health check
curl http://localhost:8000/health

# Start a session
curl -X POST http://localhost:8000/api/v1/sessions/start `
  -H "Content-Type: application/json" `
  -d '{\"language\":\"hi\",\"user_type\":\"citizen\",\"state\":\"Maharashtra\"}'
```

## 🎯 Quick API Test Flow

### 1. Start a Session

```http
POST http://localhost:8000/api/v1/sessions/start
Content-Type: application/json

{
  "language": "hi",
  "user_type": "citizen",
  "state": "Maharashtra",
  "district": "Mumbai"
}
```

**Response**: You'll get a `session_token`

### 2. Send a Message

```http
POST http://localhost:8000/api/v1/sessions/{session_token}/messages
Content-Type: application/json

{
  "content": "मुझे घरेलू हिंसा के मामले में मदद चाहिए"
}
```

### 3. Create Assessment

```http
POST http://localhost:8000/api/v1/assessments/create/{session_token}
```

**Response**: Full assessment with eligibility, urgency, resources

### 4. Search Legal Resources

```http
POST http://localhost:8000/api/v1/legal-resources/search
Content-Type: application/json

{
  "state": "Maharashtra",
  "district": "Mumbai",
  "legal_issue": "domestic_violence",
  "limit": 5
}
```

### 5. Admin Login

```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response**: JWT token for authenticated requests

## 🧪 Run Tests

```powershell
# Make sure venv is activated
.\venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app
```

Expected output: All tests passing ✅

## 📊 What's Included

### ✅ Working Features

1. **Authentication System**
   - JWT-based auth
   - Role-based access control
   - Password hashing with bcrypt

2. **Session Management**
   - Create sessions with 24hr expiry
   - Multi-language support (hi, en, mr, ta, te)
   - Track user demographics

3. **Conversation System**
   - Add messages to session
   - Retrieve conversation history
   - Sequence tracking

4. **Assessment Engine**
   - Eligibility determination
   - Urgency detection
   - Preliminary support assessment
   - Extract facts from conversation
   - Generate action items

5. **Legal Resource Matching**
   - Location-based search
   - Specialization matching
   - Distance calculation
   - Match scoring

6. **Complete Test Suite**
   - 21+ tests covering all endpoints
   - In-memory SQLite for isolation
   - Fixtures for common test data

### 📁 Project Structure

```
backend/
├── app/
│   ├── api/v1/              # API routes
│   ├── core/                # Config, security, logging
│   ├── db/                  # Database setup
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   ├── utils/               # Utilities
│   └── main.py              # FastAPI app
├── tests/                   # Test suite
├── logs/                    # Log files
├── requirements.txt         # Dependencies
├── .env                     # Configuration
└── setup.py                 # Setup script
```

## 🔐 Default Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change this in production!

## 🌐 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/api/docs` | Interactive API docs |
| POST | `/api/v1/auth/login` | Admin login |
| POST | `/api/v1/sessions/start` | Start session |
| POST | `/api/v1/sessions/{token}/messages` | Send message |
| GET | `/api/v1/sessions/{token}/conversation` | Get conversation |
| POST | `/api/v1/assessments/create/{token}` | Create assessment |
| GET | `/api/v1/assessments/{token}` | Get assessment |
| POST | `/api/v1/legal-resources/search` | Search resources |

## 📚 Documentation

- **README.md** - Full documentation
- **COMMANDS.md** - All commands reference
- **IMPLEMENTATION_STATUS.md** - What's implemented
- **API Docs** - http://localhost:8000/api/docs (interactive)

## 🆘 Troubleshooting

### Issue: ModuleNotFoundError

```powershell
# Activate venv and reinstall
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Port 8000 already in use

```powershell
# Use different port
uvicorn app.main:app --reload --port 8001
```

### Issue: Database error

```powershell
# Reinitialize database
python -m app.db.init_db
```

### Issue: Tests failing

```powershell
# Clear cache and rerun
Remove-Item -Recurse -Force .pytest_cache
pytest
```

## 🎓 For Demonstration

### Demo Flow (5-10 minutes)

1. **Show health check** (30 sec)
   - Open http://localhost:8000/health
   - Explain monitoring

2. **Show API docs** (1 min)
   - Open http://localhost:8000/api/docs
   - Explain auto-generated docs

3. **Demo session creation** (1 min)
   - Create session via API
   - Show response with token

4. **Demo conversation** (2 min)
   - Send user message
   - Show assistant response
   - Retrieve full conversation

5. **Demo assessment** (2 min)
   - Create assessment
   - Show eligibility determination
   - Show urgency detection
   - Show matched resources

6. **Demo resource search** (1 min)
   - Search by state/district
   - Show location-based results

7. **Show database** (1 min)
   - Show SQLite file
   - Explain schema

8. **Show tests** (1 min)
   - Run pytest
   - Show coverage

9. **Show code structure** (1 min)
   - Explain separation of concerns
   - Show service layer pattern

### Viva Questions Preparation

**Q: Why FastAPI?**
A: Type safety, auto documentation, async support, modern Python features

**Q: Why separate service layer?**
A: Clean architecture, testability, reusability, separation of concerns

**Q: How is security handled?**
A: JWT tokens, bcrypt password hashing, RBAC with decorators

**Q: How is eligibility determined?**
A: Deterministic rule engine (placeholder now, can be enhanced with actual rules)

**Q: What about NLP/LLM?**
A: Architecture supports it - service methods ready for integration

**Q: Is it production-ready?**
A: Core infrastructure yes - needs LLM integration and more legal data

**Q: How do you handle errors?**
A: Global exception handlers, proper HTTP status codes, structured logging

**Q: What about scalability?**
A: Stateless API, database pooling, ready for horizontal scaling

**Q: Testing strategy?**
A: Unit tests with fixtures, in-memory DB for isolation, good coverage

**Q: Data privacy?**
A: Session-based (no personal data storage), no PII in logs, secure tokens

## ✨ Next Steps

1. ✅ Backend is ready
2. → Connect frontend
3. → Add LLM integration
4. → Enhance rule engine
5. → Add more legal resources
6. → Deploy to server

## 📞 Need Help?

- Check `COMMANDS.md` for all commands
- Check `README.md` for detailed docs
- Check `IMPLEMENTATION_STATUS.md` for what's implemented
- Check logs in `logs/nyayasetu.log`

---

**🎉 You're ready to demo your NYAYASETU backend!**

Start the server and open http://localhost:8000/api/docs to explore.
