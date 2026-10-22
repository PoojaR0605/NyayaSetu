# 🏗️ NYAYASETU - Visual Architecture Guide

## 📐 Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                            USER LAYER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Browser  │  │  Mobile  │  │  Tablet  │  │  Desktop │              │
│  │ Chrome   │  │  Safari  │  │   Edge   │  │  Firefox │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────┼────────────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
                    HTTP/HTTPS
                          │
┌─────────────────────────┼─────────────────────────────────────────────┐
│                  FRONTEND (React SPA)                                  │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     Presentation Layer                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │  │
│  │  │  14 Pages   │  │  Components │  │  Layouts     │           │  │
│  │  │  - Landing  │  │  - ChatBox  │  │  - Header    │           │  │
│  │  │  - Assess   │  │  - Map      │  │  - Footer    │           │  │
│  │  │  - Resources│  │  - Forms    │  │  - Sidebar   │           │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘           │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    State Management                             │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Zustand Stores                                          │  │  │
│  │  │  • sessionStore    → Chat sessions & messages            │  │  │
│  │  │  • assessmentStore → Legal assessments & results         │  │  │
│  │  │  • userStore       → User authentication & profile       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                      API Client Layer                           │  │
│  │  ┌────────────────────────────────────────────────────────┐    │  │
│  │  │  Axios HTTP Client                                      │    │  │
│  │  │  • baseURL: http://localhost:8000                       │    │  │
│  │  │  • Authentication headers                               │    │  │
│  │  │  • Error handling                                       │    │  │
│  │  │  • Request/Response interceptors                        │    │  │
│  │  └────────────────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Technologies: React 18, TypeScript, Vite, Tailwind CSS, Leaflet      │
└─────────────────────────┬───────────────────────────────────────────── ┘
                          │
                  REST API (JSON)
                          │
┌─────────────────────────┼───────────────────────────────────────────── ┐
│                  BACKEND (FastAPI)                                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      API Endpoints                              │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  /api/v1/                                                 │  │   │
│  │  │  ├── sessions/                                            │  │   │
│  │  │  │   ├── POST   /start           → Create session        │  │   │
│  │  │  │   ├── POST   /{token}/messages → Send message         │  │   │
│  │  │  │   ├── GET    /{token}/conversation → Get history     │  │   │
│  │  │  │   └── POST   /{token}/close    → End session          │  │   │
│  │  │  │                                                        │  │   │
│  │  │  ├── legal-resources/                                    │  │   │
│  │  │  │   ├── POST   /search           → Find resources       │  │   │
│  │  │  │   ├── GET    /recommend/{token}→ Get recommendations │  │   │
│  │  │  │   └── GET    /{id}             → Resource details    │  │   │
│  │  │  │                                                        │  │   │
│  │  │  └── users/                                              │  │   │
│  │  │      ├── POST   /register         → Create account       │  │   │
│  │  │      ├── POST   /login            → Authenticate         │  │   │
│  │  │      └── GET    /profile          → Get user info        │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                     Business Logic Services                     │   │
│  │                                                                  │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │   │
│  │  │  AI Service      │  │ Session Service  │                   │   │
│  │  │  • OpenAI API    │  │ • Create session │                   │   │
│  │  │  • Demo mode     │  │ • Store messages │                   │   │
│  │  │  • Case analysis │  │ • Get history    │                   │   │
│  │  └──────────────────┘  └──────────────────┘                   │   │
│  │                                                                  │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │   │
│  │  │  Legal Service   │  │ Security Service │                   │   │
│  │  │  • Search aid    │  │ • Authentication │                   │   │
│  │  │  • Match needs   │  │ • Authorization  │                   │   │
│  │  │  • Calculate dist│  │ • JWT tokens     │                   │   │
│  │  └──────────────────┘  └──────────────────┘                   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      Data Access Layer                          │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │  SQLAlchemy ORM                                         │    │   │
│  │  │  • Models (User, Session, Message, Resource)           │    │   │
│  │  │  • Query builders                                       │    │   │
│  │  │  • Transactions                                         │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Technologies: Python 3.13, FastAPI, SQLAlchemy, Pydantic, OpenAI      │
└──────────────────────────┬───────────────────────────────────────────── ┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│   DATABASE    │  │  AI ENGINE   │  │ EXTERNAL API │
│   (SQLite)    │  │  (OpenAI)    │  │ (Maps, etc.) │
│               │  │              │  │              │
│ Tables:       │  │ GPT-3.5      │  │ OpenStreet   │
│ • sessions    │  │ turbo        │  │ Map tiles    │
│ • messages    │  │              │  │              │
│ • users       │  │ Cost:        │  │ Free         │
│ • resources   │  │ $0.003/msg   │  │              │
│               │  │              │  │              │
│ 13 Resources  │  │ Demo Mode:   │  │              │
│ Karnataka+MH  │  │ FREE         │  │              │
└───────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔄 Request Flow - User Asks Legal Question

### Step-by-Step Data Flow

```
1. USER TYPES MESSAGE
   └─> "My employer hasn't paid salary"
        │
        ▼
2. FRONTEND (React Component)
   ChatInput.tsx
   └─> Validates input
   └─> Calls sendMessage() from sessionStore
        │
        ▼
3. STATE MANAGEMENT (Zustand)
   sessionStore.ts
   └─> Updates loading state
   └─> Calls API client
        │
        ▼
4. API CLIENT (Axios)
   client.ts
   └─> POST http://localhost:8000/api/v1/sessions/{token}/messages
   └─> Headers: { "Content-Type": "application/json" }
   └─> Body: { "content": "My employer hasn't paid salary" }
        │
        ▼
5. BACKEND API ENDPOINT
   sessions.py → add_message()
   └─> Validates session token
   └─> Saves user message to database
        │
        ▼
6. SESSION SERVICE
   session_service.py
   └─> Creates Message record in DB
   └─> Sequence number assigned
        │
        ▼
7. AI PROCESSING
   ai_service.py
   
   IF DEMO_MODE = True:
   └─> Keyword detection
   └─> Match patterns: ['salary', 'employer'] → EMPLOYMENT
   └─> Return pre-crafted response with case strength
   
   IF DEMO_MODE = False:
   └─> Get conversation history from DB
   └─> Build OpenAI messages array
   └─> Call OpenAI API:
       {
         "model": "gpt-3.5-turbo",
         "messages": [
           {"role": "system", "content": "Senior Legal Advisor..."},
           {"role": "user", "content": "My employer hasn't paid..."}
         ]
       }
   └─> Receive AI response
   └─> Check if detailed case (30+ words)
   └─> If yes: Perform case strength analysis
        │
        ▼
8. RESPONSE FORMATTING
   ai_service.py
   └─> Structure response:
       📋 CASE SUMMARY
       ⚖️ LEGAL ANALYSIS  
       🎯 CASE STRENGTH: STRONG | Win: 75-85%
       📊 THRESHOLD FACTORS
       ⚡ RECOMMENDATIONS
       💰 COST-BENEFIT
       ✅ NEXT STEPS
        │
        ▼
9. SAVE AI RESPONSE
   session_service.py
   └─> Creates Message record (role='assistant')
   └─> Increments sequence number
   └─> Saves to database
        │
        ▼
10. RETURN TO FRONTEND
    FastAPI → JSON Response
    {
      "id": "msg-123",
      "role": "assistant",
      "content": "📋 CASE SUMMARY...",
      "created_at": "2026-09-23T..."
    }
        │
        ▼
11. UPDATE UI
    sessionStore.ts
    └─> Add message to messages array
    └─> Update loading state
    └─> Trigger re-render
        │
        ▼
12. DISPLAY TO USER
    ChatMessage.tsx
    └─> Render with court theme
    └─> Show Justice AI avatar
    └─> Format content with sections
    └─> Animate entry
```

---

## 🗺️ Map Feature - Architecture

```
USER CLICKS "MAP VIEW"
     │
     ▼
┌────────────────────────────────────────┐
│  FRONTEND: Resources.tsx               │
│  └─> setViewMode('map')                │
│  └─> Filter resources with coordinates │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  FRONTEND: ResourceMap.tsx             │
│                                         │
│  Uses: react-leaflet + leaflet.js      │
│                                         │
│  1. Initialize Map                     │
│     └─> Center: [12.9716, 77.5946]     │
│     └─> Zoom: 12                       │
│     └─> Tiles: OpenStreetMap (free)    │
│                                         │
│  2. Add User Location Marker (if GPS)  │
│     └─> Blue circle                    │
│     └─> Current position               │
│                                         │
│  3. Add Resource Markers               │
│     └─> For each resource:             │
│         • Create marker at [lat, lng]  │
│         • Custom icon (scales)         │
│         • Popup with details           │
│                                         │
│  4. Fit Bounds                         │
│     └─> Auto-zoom to show all markers  │
└─────────────────────────────────────────┘

MARKER CLICK
     │
     ▼
┌────────────────────────────────────────┐
│  POPUP DISPLAYS                         │
│  • Name: "KSLSA Bangalore"             │
│  • Address: "High Court, Bangalore"    │
│  • Phone: "+91-80-22172050"            │
│  • Type: Legal Aid Center              │
│  • Click phone → Make call             │
│  • Click address → Get directions      │
└─────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
USER REGISTERS
     │
     ▼
1. POST /api/v1/users/register
   {
     "email": "user@example.com",
     "password": "secure123",
     "name": "John Doe"
   }
     │
     ▼
2. BACKEND PROCESSING
   ├─> Validate input (Pydantic)
   ├─> Check if email exists
   ├─> Hash password (bcrypt)
   └─> Save to database
     │
     ▼
3. RETURN JWT TOKEN
   {
     "access_token": "eyJ0eXAiOiJKV1...",
     "token_type": "bearer"
   }
     │
     ▼
4. FRONTEND STORES TOKEN
   ├─> localStorage.setItem('token', token)
   ├─> Set Authorization header
   └─> Navigate to dashboard
     │
     ▼
5. SUBSEQUENT REQUESTS
   Headers: {
     "Authorization": "Bearer eyJ0eXAiOiJKV1..."
   }
     │
     ▼
6. BACKEND VALIDATES
   ├─> Decode JWT
   ├─> Check expiration
   ├─> Verify signature
   └─> Extract user_id
```

---

## 💾 Database Schema Visual

```
┌──────────────────────────────────────────────────────────────┐
│                        SESSIONS                               │
├──────────────┬────────────────────┬──────────────────────────┤
│ id (PK)      │ VARCHAR(36)        │ UUID                     │
│ session_token│ VARCHAR(255) UNIQUE│ JWT-like token           │
│ language     │ VARCHAR(10)        │ 'en', 'hi', 'kn'         │
│ user_type    │ VARCHAR(50)        │ 'citizen', 'lawyer'      │
│ state        │ VARCHAR(100)       │ 'Karnataka'              │
│ district     │ VARCHAR(100)       │ 'Bangalore Urban'        │
│ is_active    │ VARCHAR(20)        │ 'active', 'completed'    │
│ created_at   │ DATETIME           │ Session start time       │
│ expires_at   │ DATETIME           │ Session expiry (24h)     │
└──────────────┴────────────────────┴──────────────────────────┘
                        │
                        │ 1:Many
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                  CONVERSATION_MESSAGES                        │
├──────────────┬────────────────────┬──────────────────────────┤
│ id (PK)      │ VARCHAR(36)        │ UUID                     │
│ session_id(FK)│VARCHAR(36)        │ → sessions.id            │
│ role         │ ENUM               │ 'user','assistant'       │
│ content      │ TEXT               │ Message text             │
│ sequence     │ INTEGER            │ Message order            │
│ created_at   │ DATETIME           │ Message timestamp        │
└──────────────┴────────────────────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    LEGAL_RESOURCES                            │
├──────────────┬────────────────────┬──────────────────────────┤
│ id (PK)      │ VARCHAR(36)        │ UUID                     │
│ name         │ VARCHAR(300)       │ Resource name            │
│ name_hi      │ VARCHAR(300)       │ Hindi name               │
│ resource_type│ VARCHAR(50)        │ 'legal_aid_center','ngo' │
│ state        │ VARCHAR(100)       │ 'Karnataka'              │
│ city         │ VARCHAR(100)       │ 'Bangalore'              │
│ latitude     │ FLOAT              │ 12.9716                  │
│ longitude    │ FLOAT              │ 77.5946                  │
│ phone        │ VARCHAR(50)        │ '+91-80-22172050'        │
│ email        │ VARCHAR(255)       │ 'contact@kslsa.gov.in'   │
│ specializations│ JSON             │ ['all','employment']     │
│ provides_free│ BOOLEAN            │ true                     │
└──────────────┴────────────────────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         USERS                                 │
├──────────────┬────────────────────┬──────────────────────────┤
│ id (PK)      │ VARCHAR(36)        │ UUID                     │
│ email        │ VARCHAR(255) UNIQUE│ user@example.com         │
│ password_hash│ VARCHAR(255)       │ Bcrypt hash              │
│ name         │ VARCHAR(200)       │ Full name                │
│ role         │ VARCHAR(20)        │ 'citizen','admin'        │
│ created_at   │ DATETIME           │ Registration date        │
└──────────────┴────────────────────┴──────────────────────────┘
```

---

## 📦 Deployment Architecture (Production Ready)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUD (AWS/Azure)                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FRONTEND (Static Hosting)                  │ │
│  │  • Vercel / Netlify / S3 + CloudFront                  │ │
│  │  • CDN for fast global delivery                        │ │
│  │  • HTTPS with SSL certificate                          │ │
│  └─────────────────┬──────────────────────────────────────┘ │
│                    │ HTTPS                                   │
│                    ▼                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              BACKEND API (Container)                    │ │
│  │  • AWS EC2 / DigitalOcean Droplet / Heroku            │ │
│  │  • Docker container with FastAPI                       │ │
│  │  • Uvicorn ASGI server                                │ │
│  │  • Environment variables from secrets                  │ │
│  └─────────────────┬──────────────────────────────────────┘ │
│                    │                                         │
│        ┌───────────┼───────────┐                            │
│        │           │           │                             │
│        ▼           ▼           ▼                             │
│  ┌─────────┐  ┌────────┐  ┌────────┐                       │
│  │Database │  │ Redis  │  │OpenAI  │                       │
│  │(Postgres│  │(Cache) │  │  API   │                       │
│  │ or RDS) │  │        │  │        │                       │
│  └─────────┘  └────────┘  └────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

**This comprehensive visual guide shows exactly how every part works together!** 🎯
