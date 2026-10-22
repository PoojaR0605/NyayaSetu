# NYAYASETU - नयासेतु

**Bridging People to Justice**

AI-Powered Legal Aid Discovery and Case Triage Platform for India

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://typescriptlang.org)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Security](#security)
- [License](#license)

---

## 🎯 Overview

NYAYASETU is a comprehensive legal aid platform that helps Indian citizens:

1. **Describe** their legal situation in plain language
2. **Understand** possible legal issues and eligibility for legal aid
3. **Connect** with verified legal resources and services
4. **Plan** actionable next steps

The platform uses Natural Language Processing and AI to bridge the gap between citizens and justice, especially for those who may not afford private legal services.

---

## ✨ Features

### For Citizens
- 🗣️ **Conversational Assessment** - Chat-based interface (no complex forms)
- 📊 **Justice Readiness Score** - Preparedness metric (not outcome prediction)
- ✅ **Eligibility Check** - Legal aid qualification assessment
- 📋 **Evidence Checklist** - Required documents with availability status
- 🗺️ **Resource Finder** - Verified legal aid offices, NGOs, lawyers
- 📝 **Action Plan** - Step-by-step guidance with priorities
- 🔒 **Privacy First** - Anonymous assessments supported
- 🌐 **Accessible** - Mobile-responsive, WCAG compliant

### For Administrators
- 📈 **Analytics Dashboard** - Platform usage statistics
- 👥 **User Management** - View and manage user accounts
- 📚 **Resource Management** - Maintain legal resource database
- 🔍 **Assessment Monitoring** - Track assessments and outcomes

### Technical Features
- 🤖 **NLP Pipeline** - Legal domain classification, entity extraction
- 🧠 **LLM Integration** - GPT/demo mode for conversational AI
- 📖 **RAG System** - Grounded legal information retrieval
- ⚖️ **Rule Engine** - Deterministic eligibility evaluation
- 🔐 **JWT Authentication** - Secure session management
- 📱 **RESTful API** - Complete backend API with OpenAPI docs

---

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT with bcrypt
- **AI**: OpenAI API / Demo Mode

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite 8
- **State**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP**: Axios

### Key Components
```
┌─────────────┐
│   React     │  Chat Interface, Dashboards
│  Frontend   │
└──────┬──────┘
       │ REST API
┌──────▼──────┐
│   FastAPI   │  Session, Assessment, Resources
│   Backend   │
└──────┬──────┘
       │
┌──────▼──────┐
│  SQLAlchemy │  Users, Assessments, Evidence
│  Database   │
└─────────────┘
```

---

## 📋 Prerequisites

### Required
- **Python**: 3.11+ (developed on 3.13)
- **Node.js**: 18+ 
- **npm**: 9+
- **Git**: Latest version

### Optional
- **PostgreSQL**: 15+ (for production)
- **Docker**: Latest (for containerized deployment)
- **OpenAI API Key**: For production AI features

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd nyaysetu
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
python -m app.db.init_db

# Run server
uvicorn app.main:app --reload
```

Backend will be available at: **http://localhost:8000**
API Docs: **http://localhost:8000/api/docs**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env if needed

# Run development server
npm run dev
```

Frontend will be available at: **http://localhost:5174**

### 4. Default Credentials
```
Username: admin
Password: admin123
```
⚠️ **Change this immediately in production!**

---

## 📁 Project Structure

```
nyaysetu/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routes
│   │   ├── core/            # Config, security, logging
│   │   ├── db/              # Database models, session
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app
│   ├── tests/               # Backend tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app
│   ├── package.json
│   └── .env.example
├── docs/                    # Documentation
├── README.md
└── docker-compose.yml       # Docker setup
```

---

## ⚙️ Configuration

### Backend (.env)
```env
# Security - CHANGE IN PRODUCTION
SECRET_KEY=your-secret-key-min-32-chars
DATABASE_URL=sqlite:///./nyayasetu.db

# AI Services
DEMO_MODE=True              # Set False for production
OPENAI_API_KEY=sk-...       # Required if DEMO_MODE=False

# CORS
ALLOWED_ORIGINS=http://localhost:5174
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v

# With coverage
python -m pytest tests/ --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm run build  # Verify build succeeds
```

### Manual Testing Scenarios
1. **Employment**: "My employer hasn't paid me for 3 months"
2. **Tenancy**: "Landlord won't return my security deposit"
3. **Consumer**: "Product I bought online is defective"
4. **Family**: "Need help with divorce proceedings"
5. **Government**: "Ration card application rejected"

---

## 🚢 Deployment

### Production Checklist
- [ ] Change `SECRET_KEY` in backend `.env`
- [ ] Change admin password from default
- [ ] Set `DEBUG=False` in backend
- [ ] Set `DEMO_MODE=False` and add OpenAI API key
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up backup strategy
- [ ] Configure logging to file/service
- [ ] Set up monitoring

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Deployment
See `docs/DEPLOYMENT.md` for detailed instructions.

---

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and components
- **[API Reference](http://localhost:8000/api/docs)** - Interactive API docs
- **[Database Schema](docs/DATABASE.md)** - Database design
- **[Security](docs/SECURITY.md)** - Security measures and guidelines
- **[Testing](docs/TESTING.md)** - Test strategy and execution
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment guide

---

## 🔒 Security

### Implemented Measures
✅ JWT token-based authentication
✅ Bcrypt password hashing
✅ Role-based access control (USER/ADMIN)
✅ SQL injection protection (SQLAlchemy ORM)
✅ CORS configuration
✅ Input validation (Pydantic)
✅ File upload size limits
✅ Secure session management
✅ No sensitive data logging

### Security Best Practices
- Never commit `.env` files
- Use strong, unique `SECRET_KEY`
- Change default admin credentials
- Keep dependencies updated
- Use HTTPS in production
- Regular security audits
- Monitor access logs

### Reporting Security Issues
Please report security vulnerabilities to: security@nyayasetu.gov.in

---

## 🎓 Academic Use

This project was developed as a Final Year Computer Science/Engineering project.

**Project Topic**: AI-Powered Legal Aid Discovery and Case Triage Platform

**Key Learning Areas**:
- Full-stack web development
- Natural Language Processing
- Machine Learning integration
- Database design and optimization
- REST API development
- Security implementation
- User experience design

See `docs/PROJECT_REPORT.md` for detailed academic documentation.

---

## 📝 License

This project is developed for educational and non-commercial purposes.

© 2026 NYAYASETU. All rights reserved.

---

## 🤝 Acknowledgments

- Legal domain experts for requirements
- Open-source community for tools and libraries
- Test users for feedback

---

## 📧 Contact

- **Email**: support@nyayasetu.gov.in
- **Website**: [https://nyayasetu.gov.in](https://nyayasetu.gov.in)
- **Documentation**: [https://docs.nyayasetu.gov.in](https://docs.nyayasetu.gov.in)

---

## 🔗 Quick Links

- [📖 User Guide](docs/USER_GUIDE.md)
- [💻 Developer Guide](docs/DEVELOPER_GUIDE.md)
- [🐛 Report Bug](issues/new)
- [💡 Request Feature](issues/new)
- [❓ FAQ](docs/FAQ.md)

---

**Made with ❤️ for access to justice in India**
