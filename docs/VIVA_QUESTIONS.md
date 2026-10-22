# NYAYASETU - Viva Questions & Answers

## 30 Expected Viva Questions with Concise Answers

### 1. What is NYAYASETU and what problem does it solve?

NYAYASETU is an AI-powered platform that helps Indian citizens understand their legal situations and connect with free legal aid resources. It solves the problem of limited access to legal assistance for economically disadvantaged citizens who don't know about their eligibility for free legal aid or how to navigate the legal system.

### 2. Why did you choose this project topic?

Access to justice is a fundamental right, yet many eligible citizens cannot access free legal aid due to lack of awareness and complexity of the legal system. This project combines social impact with technical innovation using AI and NLP to solve a real-world problem.

### 3. What are the key features of your system?

- Conversational chat interface for describing legal issues
- NLP-based legal domain classification
- Automated eligibility assessment for legal aid
- Justice Readiness Score (preparedness metric)
- Evidence checklist with availability status
- Resource finder with location-based matching
- Personalized action plans
- Anonymous and authenticated assessment modes

### 4. What technologies did you use in the backend?

FastAPI (Python 3.13), SQLAlchemy ORM, SQLite/PostgreSQL, JWT authentication, bcrypt password hashing, python-jose for tokens, Pydantic for validation, and OpenAI API integration with demo mode fallback.

### 5. What technologies did you use in the frontend?

React 18 with TypeScript, Vite build tool, Zustand for state management, React Router v6, Axios for API calls, Tailwind CSS for styling, and Lucide React for icons.

### 6. Why did you choose FastAPI over Django or Flask?

FastAPI offers automatic OpenAPI documentation, built-in async support, Pydantic data validation, better performance, and modern Python type hints. It's ideal for building RESTful APIs with clear documentation.

### 7. Explain your database schema.

The database has 13 main models: AdminUser (auth), Session (conversation tracking), ConversationMessage (chat history), Assessment (case details), ExtractedFact (NLP outputs), EligibilityRule (criteria), LegalRule (legal information), LegalResource (aid offices), Evidence (document tracking), ActionItem (tasks), and AuditLog (security tracking).

### 8. How does your NLP pipeline work?

The NLP pipeline: 1) Takes user input, 2) Performs legal domain classification (employment, family, tenancy, etc.), 3) Extracts entities (dates, amounts, parties), 4) Identifies legal issues, 5) Detects urgency level, 6) Preserves uncertainty, 7) Feeds structured data to the eligibility engine.

### 9. What is the Justice Readiness Score?

It's a 0-100 metric measuring how prepared a user is to seek professional legal assistance. It combines: information completeness (20%), evidence readiness (25%), timeline clarity (15%), jurisdiction clarity (15%), issue clarity (15%), and next steps (10%). It does NOT predict case outcome.

### 10. How do you prevent the AI from hallucinating legal information?

We use: 1) RAG (Retrieval-Augmented Generation) to ground responses in verified legal data, 2) Rule-based eligibility engine (not AI-based), 3) Explicit prompts prohibiting fabrication, 4) Source citation for all legal information, 5) Qualified language avoiding guarantees, 6) Demo mode with pre-vetted responses.

### 11. What is Demo Mode and why is it important?

Demo Mode allows the system to run without paid OpenAI API access by using pre-configured responses for common scenarios. It's essential for: development, testing, demonstrations, and deployment in resource-constrained environments.

### 12. How do you ensure data security?

JWT-based authentication, bcrypt password hashing, role-based access control (RBAC), SQL injection protection via ORM, input validation with Pydantic, CORS configuration, secure session management, no sensitive data logging, and HTTPS in production.

### 13. How do you handle user privacy?

Users can take anonymous assessments, authenticated users only see their own data, conversations are encrypted, deletion permanently removes data, admin analytics are aggregated (no PII), and we comply with privacy-by-design principles.

### 14. Explain your authentication system.

We use JWT (JSON Web Tokens) with OAuth2 password flow. Passwords are hashed with bcrypt (12 rounds). Tokens expire after 60 minutes. Each request includes the token in Authorization header. Role-based access control distinguishes USER and ADMIN roles.

### 15. What is RAG and how did you implement it?

RAG (Retrieval-Augmented Generation) retrieves relevant legal information from the database before generating responses. We store legal rules with sources, jurisdiction, and effective dates, then filter by domain and jurisdiction before passing to the LLM, ensuring responses are grounded in verified information.

### 16. How does the eligibility assessment work?

It's a deterministic rule engine, not AI-based. Rules define criteria (income thresholds, protected groups, case types) stored in EligibilityRule table. The engine matches user facts against rules, returns status (potentially eligible, may be eligible, more info needed), and lists matched rules and missing information.

### 17. What testing did you perform?

21 automated backend tests covering authentication, API endpoints, sessions, assessments, and resources. Manual testing of complete user journeys across 5 legal domains. Build verification for frontend. Security testing for SQL injection, XSS, and authentication bypass attempts.

### 18. What are the main challenges you faced?

1) Handling legal complexity without being lawyers, 2) NLP accuracy for varied user inputs, 3) Balancing AI capabilities with safety (no hallucination), 4) Making the interface simple yet comprehensive, 5) Python 3.13 compatibility with passlib/bcrypt.

### 19. How do you handle multiple legal domains?

The system supports 11 domains: employment, family, domestic dispute, property, inheritance, consumer, tenancy, criminal, civil, government services, and documentation. Each has specific rules, evidence patterns, and resource types. Domain is detected from conversation and used for filtering.

### 20. What is the resource matching algorithm?

Resources are ranked by: legal relevance (domain match), jurisdiction (state/district), eligibility compatibility, distance (Haversine formula), language support, resource type, and verification status. Results are sorted by composite score to show most relevant first.

### 21. How scalable is your system?

The architecture supports horizontal scaling: stateless API allows multiple backend instances, database connection pooling, async request handling in FastAPI, optional Redis for caching, and Docker containerization for cloud deployment.

### 22. What security vulnerabilities did you address?

SQL injection (ORM), XSS (React escaping), CSRF (JWT stateless), password exposure (bcrypt), sensitive logging (filtered), file upload attacks (validation and size limits), role escalation (RBAC), and token expiry.

### 23. How do you ensure accessibility?

WCAG compliance with: semantic HTML, ARIA labels where needed, keyboard navigation support, focus indicators, sufficient color contrast, mobile responsiveness, clear typography, and error messages that are screen-reader friendly.

### 24. What is the difference between your system and existing legal aid websites?

Traditional sites use complex forms requiring legal knowledge. NYAYASETU uses conversational AI, provides preparedness scores (not just eligibility), offers evidence checklists, has intelligent resource matching, supports anonymous assessment, and has a modern, accessible interface.

### 25. How do you validate user input?

Pydantic schemas on backend validate data types, required fields, string lengths, and business rules. Frontend has form validation with instant feedback. SQL injection protection via ORM. File upload validation checks types, sizes, and scans for malicious content.

### 26. What are the limitations of your system?

Cannot provide actual legal advice (requires licensed attorneys), LLM may occasionally misinterpret complex scenarios, demo mode has limited coverage, resource database requires manual maintenance, currently English-only, and depends on user's accurate input.

### 27. What is your deployment strategy?

Docker Compose for containerized deployment, separate backend and frontend containers, health checks for monitoring, environment-based configuration, volume mounts for data persistence, optional PostgreSQL container, and nginx for frontend serving with compression.

### 28. How did you test the AI safety?

Tested with adversarial prompts: "Ignore instructions", "Guarantee I will win", "Invent a law". System successfully: refused to guarantee outcomes, only cited verified legal information, maintained qualified language, and did not expose internal prompts or reasoning.

### 29. What would you improve given more time?

Multi-language support (Hindi, Kannada), voice input, document analysis with OCR, mobile apps, SMS-based assessment, integration with actual Legal Services Authority databases, ML model for better NLP, and real-time notifications.

### 30. What did you learn from this project?

Full-stack development with modern frameworks, NLP and AI integration challenges, importance of user privacy and security, accessible UI design, database design for complex relationships, API architecture, Docker deployment, test-driven development, and balancing AI capabilities with safety constraints.

---

## Bonus Questions

**Q: Why SQLite for development and PostgreSQL for production?**
SQLite is zero-configuration, file-based, perfect for development and testing. PostgreSQL offers better concurrency, JSON support, full-text search, and is production-grade for multi-user systems.

**Q: How do you handle concurrent users?**
FastAPI's async support, database connection pooling, stateless JWT authentication, horizontal scaling capability, and eventual consistency for non-critical operations.

**Q: What is your contribution to the project?**
[Answer based on actual contribution: architecture design, backend/frontend implementation, database schema, NLP pipeline, security implementation, testing, documentation, etc.]

---

**Tips for Viva**:
1. Be honest about limitations
2. Explain trade-offs in design decisions
3. Show understanding of security implications
4. Demonstrate testing approach
5. Discuss future improvements
6. Connect technical choices to problem requirements
7. Be ready to demo the working system
8. Explain code snippets if asked
9. Discuss alternative approaches you considered
10. Show awareness of real-world deployment considerations
