# NYAYASETU: AI-Powered Legal Aid Discovery and Case Triage Platform

## Abstract

Access to justice remains a significant challenge in India, particularly for economically disadvantaged citizens who may not afford private legal services. The Legal Services Authorities Act, 1987 provides for free legal aid, yet many eligible citizens are unaware of their rights or unable to navigate the complex legal system.

NYAYASETU (नयासेतु - "Bridge to Justice") is an intelligent web-based platform that bridges this gap by leveraging Artificial Intelligence and Natural Language Processing to make legal aid accessible, understandable, and actionable for common citizens.

### Key Objectives

1. **Simplify Legal Assessment**: Enable citizens to describe legal issues in plain language without requiring knowledge of legal terminology
2. **Automate Eligibility Determination**: Use rule-based systems to assess eligibility for free legal aid based on Indian legal aid criteria
3. **Provide Preliminary Guidance**: Offer evidence checklists, urgency assessment, and preparedness metrics
4. **Connect to Resources**: Match users with verified legal aid offices, pro bono lawyers, and relevant government schemes based on jurisdiction and case type
5. **Ensure Privacy and Security**: Protect sensitive legal conversations while supporting anonymous assessments

### System Architecture

The platform employs a modern full-stack architecture:

**Frontend**: React 18 with TypeScript, providing a conversational chat interface optimized for mobile and desktop

**Backend**: FastAPI (Python 3.13) implementing:
- NLP pipeline for legal domain classification and entity extraction
- LLM integration for adaptive conversation (with fallback demo mode)
- RAG (Retrieval-Augmented Generation) for grounded legal information
- Deterministic rule engine for eligibility assessment
- Resource recommendation algorithm considering jurisdiction, relevance, and proximity

**Database**: SQLAlchemy ORM with support for both SQLite (development) and PostgreSQL (production)

### Innovation

Unlike traditional legal aid websites that require form-filling and legal knowledge, NYAYASETU:

1. Uses conversational AI to extract facts naturally
2. Provides a "Justice Readiness Score" measuring preparedness (not outcome prediction)
3. Implements AI safety measures to prevent hallucination and guarantee of outcomes
4. Operates in demo mode without requiring paid AI APIs for deployment
5. Supports both authenticated and anonymous assessments for user privacy

### Implementation

The system was developed following software engineering best practices:
- Test-driven development with 21 automated tests
- Role-based access control with JWT authentication
- RESTful API design with OpenAPI documentation
- Responsive UI with WCAG accessibility compliance
- Docker containerization for easy deployment

### Results

The implemented platform successfully:
- Handles multiple legal domains (employment, tenancy, family, consumer, etc.)
- Processes conversational inputs and extracts relevant legal facts
- Evaluates eligibility based on configurable rule sets
- Generates personalized action plans with prioritized tasks
- Recommends verified legal resources with distance calculation
- Maintains user privacy with secure data handling

### Future Scope

Potential enhancements include:
- Multi-language support (Hindi, Kannada, regional languages)
- Voice input for accessibility
- Document analysis and summarization
- Integration with actual Legal Services Authority systems
- Mobile applications (Android/iOS)
- SMS-based assessment for feature phone users

### Conclusion

NYAYASETU demonstrates how modern AI and web technologies can be leveraged to improve access to justice in India. By simplifying the legal aid discovery process and providing preliminary guidance, the platform empowers citizens to take informed steps toward resolving their legal issues, while connecting them with appropriate professional help.

---

**Keywords**: Legal Aid, Artificial Intelligence, Natural Language Processing, Access to Justice, Web Application, RAG System, Legal Technology

**Technologies**: Python, FastAPI, React, TypeScript, NLP, LLM, SQLAlchemy, Zustand, Tailwind CSS

**Domain**: Legal Technology, Social Impact, Government Services

---

*Developed as Final Year Project, 2025-2026*
