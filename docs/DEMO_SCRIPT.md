# NYAYASETU - 10-Minute Demo Script

## Preparation (Before Demo)

### 1. Start Services
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Verify Running
- Backend: http://localhost:8000/health (should show "healthy")
- Frontend: http://localhost:5174 (should load landing page)
- API Docs: http://localhost:8000/api/docs

### 3. Have Ready
- Browser with frontend open
- Second tab with API docs open
- Terminal visible for showing live logs (optional)

---

## Demo Script (10 Minutes)

### Part 1: Introduction & Problem Statement (1 min)

**Say:**
> "NYAYASETU - which means 'Bridge to Justice' - is an AI-powered platform that helps Indian citizens access free legal aid. The problem we're solving is that many eligible citizens don't know about free legal aid or how to access it. Our solution uses conversational AI to make legal assistance accessible, understandable, and actionable."

**Show:** Landing page
- Point to hero message: "Tell us what happened"
- Mention: No legal knowledge required
- Highlight: 3-step journey visual

---

### Part 2: Assessment Flow (4 mins)

**Say:**
> "Let me demonstrate with a common scenario - unpaid wages. Notice we don't use complex forms; it's just a conversation."

#### Step 1: Start Assessment (30s)
- Click "Start Assessment"
- Point out: Chat interface, not a form
- Show: Privacy indicator
- Explain: Can use anonymously or with account

#### Step 2: Describe Issue (1 min)
**Type:**
> "My employer has not paid me for three months. I have my employment agreement and bank statements."

**Point out while typing:**
- Clean chat interface
- User can describe in own words
- System shows "typing" indicator

**After system responds:**
- Show: Progress bar detecting "Employment" domain
- Explain: NLP extracts key information automatically
- Point out: Adaptive follow-up questions

#### Step 3: Continue Conversation (1 min)
**When system asks follow-ups, answer:**
- About timeline: "Started in June, still ongoing"
- About amount: "₹45,000 per month, total ₹1,35,000"
- About attempts: "Sent emails, no response"

**Highlight:**
- System extracts: dates, amounts, evidence
- Urgency assessment happening in background
- Domain classification: Employment Law

#### Step 4: View Results (1.5 mins)
**Click "View Results"**

**Point out on Results page:**
1. **Justice Readiness Score**: "67/100"
   - Explain: "This measures preparedness, NOT chance of winning"
   - Show breakdown: Information, Evidence, Timeline
   
2. **Legal Domain**: "Employment"
   - Detected automatically from conversation

3. **Eligibility**: "Potentially Eligible"
   - Based on income criteria (demo rule)

4. **Urgency**: "Important"
   - Not emergency, but time-sensitive

5. **Supporting Indicators**: 
   - "Clear timeline provided"
   - "Evidence available"
   - "Documented communication attempts"

6. **Missing Information**:
   - "Employer registration details"
   - "Employment contract specifics"

**Say:**
> "Notice the careful language - 'Potentially Eligible', not 'Guaranteed'. This is a preliminary assessment, not legal advice."

---

### Part 3: Detail Pages (2 mins)

#### Evidence Checklist (40s)
**Click "Evidence" from results**

**Show:**
- ✅ AVAILABLE: Employment Agreement
- ✅ AVAILABLE: Bank Statements  
- ❌ MISSING: Employer Registration
- ❓ UNKNOWN: Wage Receipts

**Point out:**
- Color-coded status (green/red/amber)
- Importance levels (Critical/Important/Helpful)
- Practical tips for gathering evidence

**Say:**
> "The system generates a domain-specific evidence checklist showing what documents strengthen your case."

#### Resources (40s)
**Click "Resources"**

**Show:**
- Filtered by legal domain (Employment)
- Location-based ranking
- Contact details (phone, email, address)
- "Why recommended" explanations
- Verification status badges

**Point out:**
- Distance calculated (if location provided)
- Languages supported
- Resource types (Legal Aid Office, NGO, Pro Bono)

**Say:**
> "Resources are matched by legal domain, jurisdiction, and proximity. All are verified."

#### Action Plan (40s)
**Click "Action Plan"**

**Show:**
- Prioritized tasks
- Status tracking (Pending/In Progress/Complete)
- Deadlines where applicable
- Progress percentage

**Point out:**
- Tasks organized by priority
- User can mark progress
- Clear next steps

---

### Part 4: Technical Features (2 mins)

#### API Documentation (30s)
**Switch to API docs tab:** http://localhost:8000/api/docs

**Scroll through:**
- Authentication endpoints
- Session/Assessment APIs
- Resource search endpoint
- Admin endpoints

**Say:**
> "The backend exposes a complete RESTful API with auto-generated OpenAPI documentation. Any frontend or mobile app can integrate with this."

#### Admin Dashboard (40s)
**Back to frontend, go to:** Login page

**Login as admin:**
- Username: `admin`
- Password: `admin123`

**Navigate to:** `/admin`

**Show:**
- Total assessments count
- Potentially eligible count
- Urgent cases
- Common legal domains chart
- Assessment status breakdown

**Say:**
> "Admins get aggregated analytics without access to individual conversations - privacy by design."

#### Architecture Highlight (50s)
**Open a code editor or diagram (optional)**

**Show/Explain:**
- **Frontend**: React + TypeScript, conversational UI
- **Backend**: FastAPI + Python, NLP pipeline
- **Database**: SQLAlchemy ORM (SQLite dev, PostgreSQL prod)
- **AI**: GPT integration with DEMO MODE fallback
- **Security**: JWT auth, bcrypt, role-based access

**Key technical features:**
1. **NLP Pipeline**: Extracts entities, classifies domains
2. **RAG System**: Retrieves verified legal info before generating responses
3. **Rule Engine**: Deterministic eligibility (not AI-based for reliability)
4. **Demo Mode**: Works without paid AI APIs

---

### Part 5: Differentiators & Conclusion (1 min)

**Say:**
> "What makes NYAYASETU different from existing legal aid websites?"

**Highlight:**
1. **Conversational, not forms** - Natural language, no legal knowledge needed
2. **Justice Readiness Score** - Novel preparedness metric, not outcome prediction
3. **AI Safety** - Grounded in verified data, no hallucination, qualified language only
4. **Privacy First** - Anonymous assessments, secure data handling
5. **Accessible** - Mobile-responsive, WCAG compliant, clean UI
6. **Demo Mode** - Can run without expensive AI APIs

**Say:**
> "The platform combines modern AI with practical legal workflows to genuinely improve access to justice for underserved communities in India."

**Final screen:** Show landing page or results

---

## Handling Questions

### Common Questions & Quick Answers

**Q: Can it provide legal advice?**
A: No, it provides preliminary information and connects users to licensed professionals. Clear disclaimers throughout.

**Q: How accurate is the AI?**
A: We use RAG (retrieval from verified database) and a deterministic rule engine for eligibility. LLM is constrained to avoid hallucination.

**Q: What about languages other than English?**
A: Currently English-only. Multi-language support (Hindi, Kannada) is planned for future versions.

**Q: How is data privacy ensured?**
A: Anonymous assessments supported, JWT authentication, encrypted data, users only see their own data, admins see only aggregated stats.

**Q: What if someone can't afford internet?**
A: Future scope includes SMS-based assessment and kiosk deployments at legal aid offices.

**Q: How do you verify legal resources?**
A: Database includes verification_status field. In production, resources would be verified by Legal Services Authorities.

**Q: Can it work offline?**
A: Backend requires internet. Frontend is a PWA that could cache some functionality. Fully offline mode is future scope.

**Q: What legal domains are covered?**
A: Employment, Family, Tenancy, Consumer, Property, Inheritance, Criminal, Civil, Government Services, Domestic Disputes, Documentation.

---

## Demo Variations

### Quick Demo (5 minutes)
1. Landing page (30s)
2. Start assessment, one scenario (2min)
3. Results page only (1min)
4. Show one detail page (30s)
5. Highlight key tech (1min)

### Extended Demo (15 minutes)
Add:
- Second scenario (different domain)
- Show saved assessments feature
- Demonstrate mobile responsiveness
- Walk through test results
- Show Docker deployment setup

### Technical Deep-Dive (30 minutes)
Add:
- Code walkthrough
- Database schema explanation
- NLP pipeline details
- Security measures
- Test coverage
- Deployment architecture

---

## Troubleshooting During Demo

**If backend not responding:**
- Check terminal for errors
- Verify port 8000 not in use: `netstat -an | findstr 8000`
- Restart: `uvicorn app.main:app --reload`

**If frontend not loading:**
- Check port 5174 available
- Clear browser cache
- Restart: `npm run dev`

**If database error:**
- Reinitialize: `python -m app.db.init_db`

**If demo mode responses slow:**
- Normal in first run (model loading)
- Subsequent responses faster

---

## Post-Demo

**Leave them with:**
1. GitHub repository link (if public)
2. README.md for setup instructions
3. API documentation URL
4. Contact information

**Follow-up materials:**
- Project report PDF
- Architecture diagrams
- Demo video recording (if made)

---

**Practice this demo 2-3 times before actual presentation!**

Good luck! 🎓
