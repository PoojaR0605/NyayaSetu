# NYAYASETU - Architecture Diagrams Reference

This document contains all key architectural diagrams for quick reference during development and presentations.

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser<br/>Chrome, Firefox, Safari]
        Mobile[Mobile Browser<br/>iOS, Android]
    end
    
    subgraph "Frontend - React PWA"
        Landing[Landing Page]
        Chat[Chat Interface]
        Results[Results Display]
        Admin[Admin Dashboard]
        SW[Service Worker<br/>Offline Support]
    end
    
    subgraph "API Gateway - FastAPI"
        Router[API Router]
        Auth[Authentication]
        RateLimit[Rate Limiter]
        CORS[CORS Handler]
    end
    
    subgraph "Business Logic"
        Orchestrator[Conversation<br/>Orchestrator]
        
        subgraph "AI Services"
            NLP[NLP Service<br/>spaCy, IndicNLP]
            LLM[LLM Service<br/>OpenAI GPT-3.5]
        end
        
        subgraph "Deterministic Services"
            Rules[Eligibility<br/>Rule Engine]
            Assess[Case Support<br/>Assessor]
            Match[Resource<br/>Matcher]
        end
        
        Report[Report<br/>Generator]
    end
    
    subgraph "Data Layer"
        Redis[(Redis<br/>Session Cache<br/>24hr TTL)]
        Postgres[(PostgreSQL<br/>Legal Database)]
        Vector[(ChromaDB<br/>Vector Store<br/>Optional)]
    end
    
    subgraph "External Services"
        OpenAIAPI[OpenAI API]
        SMS[SMS Gateway<br/>Optional]
    end
    
    Browser --> Landing
    Mobile --> Landing
    Landing --> Chat
    Chat --> Router
    Results --> Router
    Admin --> Router
    
    Router --> Auth
    Router --> RateLimit
    Router --> CORS
    Router --> Orchestrator
    
    Orchestrator --> NLP
    Orchestrator --> LLM
    Orchestrator --> Rules
    Orchestrator --> Assess
    Orchestrator --> Match
    Orchestrator --> Report
    
    NLP --> Redis
    LLM --> OpenAIAPI
    LLM --> Vector
    Rules --> Postgres
    Assess --> Postgres
    Match --> Postgres
    Orchestrator --> Redis
    Report --> SMS
    
    SW -.Offline Support.-> Chat
    
    style Browser fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style NLP fill:#fff4e6
    style LLM fill:#fff4e6
    style Rules fill:#e8f5e9
    style Assess fill:#e8f5e9
    style Match fill:#e8f5e9
    style Redis fill:#ffebee
    style Postgres fill:#ffebee
```

**Legend:**
- 🔵 Blue: Client devices
- 🟡 Orange: AI/ML services (non-deterministic)
- 🟢 Green: Rule-based services (deterministic)
- 🔴 Red: Data stores

---

## 2. CONVERSATION FLOW DIAGRAM

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant O as Orchestrator
    participant N as NLP
    participant L as LLM
    participant R as Rules
    participant A as Assessor
    participant M as Matcher
    participant D as Database
    
    Note over U,D: Phase 1: Session Start
    U->>F: Select language (Hindi)
    F->>O: POST /conversation/start
    O->>D: Create session (Redis)
    D-->>O: session_id
    O-->>F: Welcome message
    F-->>U: "नमस्ते! अपनी समस्या बताएं"
    
    Note over U,D: Phase 2: Information Gathering
    U->>F: "मालिक ने तनख्वाह नहीं दी"
    F->>O: POST /conversation/message
    O->>N: process(text, language)
    N->>N: detect_language()<br/>classify_intent()<br/>extract_entities()
    N-->>O: {intent: labor_dispute, entities: [...]}
    
    O->>O: Check completeness<br/>(location missing)
    
    O->>L: generate_clarification()
    L-->>O: "आप किस जिले में रहते हैं?"
    O-->>F: Response + Stage
    F-->>U: Bot message
    
    Note over U,D: Phase 3: Analysis (after sufficient info)
    U->>F: "वाराणसी, ₹8000 monthly"
    F->>O: POST /conversation/message
    O->>N: process(text)
    N-->>O: {location: Varanasi, income: 8000}
    
    O->>O: Completeness >= 70%<br/>Trigger analysis
    
    par Parallel Analysis
        O->>R: check_eligibility()
        R->>D: get_criteria(UP)
        D-->>R: {threshold: 300000}
        R->>R: apply_rules()
        R-->>O: {eligible: true}
    and
        O->>A: assess_case_support()
        A->>D: get_evidence_patterns()
        D-->>A: patterns
        A->>A: calculate_score()
        A->>L: generate_explanation()
        L-->>A: explanation
        A-->>O: {support: moderate}
    and
        O->>M: find_providers()
        M->>D: query(Varanasi, labor)
        D-->>M: providers
        M->>M: rank_providers()
        M-->>O: ranked_list
    end
    
    O->>L: generate_summary()
    L-->>O: final_response
    O-->>F: Complete results
    F-->>U: Show eligibility, support, resources
```

---

## 3. NLP PIPELINE

```mermaid
graph LR
    Input[User Text<br/>'मालिक ने तनख्वाह नहीं दी']
    
    subgraph "NLP Pipeline"
        Lang[Language Detection<br/>fastText]
        Prep[Preprocessing<br/>Normalize, Tokenize]
        Intent[Intent Classification<br/>BERT/IndicBERT]
        NER[Named Entity Recognition<br/>spaCy]
        Urgency[Urgency Detection<br/>Keyword + Sentiment]
    end
    
    Output[NLP Result<br/>{language, intent, entities, urgency}]
    
    Input --> Lang
    Lang --> Prep
    Prep --> Intent
    Prep --> NER
    Prep --> Urgency
    
    Intent --> Output
    NER --> Output
    Urgency --> Output
    
    style Lang fill:#fff4e6
    style Intent fill:#fff4e6
    style NER fill:#fff4e6
    style Urgency fill:#fff4e6
```

**Processing Steps:**
1. **Language Detection**: Identify Hindi/English/Tamil (95% confidence)
2. **Preprocessing**: Unicode normalization, transliteration if needed
3. **Intent Classification**: Map to 5 categories (labor, property, family, criminal, consumer)
4. **Entity Extraction**: Extract persons, locations, money, dates
5. **Urgency Detection**: Check for critical keywords (violence, today, threat)

---

## 4. LLM PIPELINE

```mermaid
graph TB
    SessionData[Session Data<br/>{history, extracted_data}]
    
    subgraph "Prompt Construction"
        SystemPrompt[System Prompt<br/>'You are a legal aid assistant']
        UserContext[User Context<br/>Conversation history]
        Task[Task Instruction<br/>'Generate clarification']
        Constraints[Constraints<br/>'No legal advice']
    end
    
    Prompt[Complete Prompt]
    
    subgraph "Safety Layer"
        InputCheck[Input Sanitization<br/>Prevent injection]
        Anonymize[PII Anonymization<br/>Remove names, phone]
    end
    
    subgraph "LLM API"
        OpenAI[OpenAI GPT-3.5-turbo<br/>or Llama 3]
        Generation[Text Generation]
    end
    
    subgraph "Validation"
        OutputCheck[Output Validation<br/>Check prohibited content]
        Fallback{Valid?}
    end
    
    Response[LLM Response<br/>or Template Fallback]
    
    SessionData --> SystemPrompt
    SessionData --> UserContext
    UserContext --> Task
    Task --> Constraints
    Constraints --> Prompt
    
    Prompt --> InputCheck
    InputCheck --> Anonymize
    Anonymize --> OpenAI
    OpenAI --> Generation
    Generation --> OutputCheck
    OutputCheck --> Fallback
    
    Fallback -->|Yes| Response
    Fallback -->|No| TemplateFallback[Template Response]
    TemplateFallback --> Response
    
    style OpenAI fill:#fff4e6
    style InputCheck fill:#ffebee
    style OutputCheck fill:#ffebee
```

---

## 5. ELIGIBILITY RULE ENGINE

```mermaid
graph TD
    Start[Session Data]
    
    Validate{Complete<br/>Info?}
    Start --> Validate
    
    Validate -->|No| Incomplete[Return<br/>INSUFFICIENT_INFO]
    
    Validate -->|Yes| GetCriteria[Get State Criteria<br/>from Database]
    
    GetCriteria --> Checks[Run Checks]
    
    subgraph "Eligibility Checks"
        IncomeCheck[Income Check<br/>User bracket vs threshold]
        CaseTypeCheck[Case Type Check<br/>Category in covered types?]
        SpecialCheck[Special Category<br/>SC/ST, women, disabled?]
        JurisdictionCheck[Jurisdiction Check<br/>Valid district/state?]
    end
    
    Checks --> IncomeCheck
    Checks --> CaseTypeCheck
    Checks --> SpecialCheck
    Checks --> JurisdictionCheck
    
    IncomeCheck --> Logic
    CaseTypeCheck --> Logic
    SpecialCheck --> Logic
    JurisdictionCheck --> Logic
    
    Logic[Evaluation Logic<br/>Income OR Special<br/>AND Case Type<br/>AND Jurisdiction]
    
    Logic --> Decision{Eligible?}
    
    Decision -->|Yes| Eligible[ELIGIBLE<br/>Build explanation]
    Decision -->|No| NotEligible[NOT_ELIGIBLE<br/>Build explanation]
    
    Eligible --> Explain[Generate Explanation<br/>Why eligible + next steps]
    NotEligible --> Explain
    
    Explain --> Return[Return Decision]
    
    style IncomeCheck fill:#e8f5e9
    style CaseTypeCheck fill:#e8f5e9
    style SpecialCheck fill:#e8f5e9
    style JurisdictionCheck fill:#e8f5e9
    style Logic fill:#e8f5e9
```

**Key Principle**: 100% deterministic. Same input → Same output. Always explainable.

---

## 6. CASE SUPPORT ASSESSMENT

```mermaid
graph LR
    Session[Session Data]
    
    subgraph "Factor Extraction"
        Evidence[Evidence Present?<br/>WhatsApp, docs, witnesses]
        Timeline[Timeline Clear?<br/>Dates, duration specific]
        Documentation[Written Docs?<br/>Letters, emails, contracts]
        Parties[Parties Identified?<br/>All parties named]
        Amounts[Amounts Clear?<br/>Money specified]
    end
    
    Session --> Evidence
    Session --> Timeline
    Session --> Documentation
    Session --> Parties
    Session --> Amounts
    
    Evidence --> Score[Calculate Score<br/>Weighted by importance]
    Timeline --> Score
    Documentation --> Score
    Parties --> Score
    Amounts --> Score
    
    Score --> Level{Support<br/>Level}
    
    Level -->|>= 0.75| Strong[STRONG_INDICATORS<br/>Evidence + Timeline + Docs]
    Level -->|0.5-0.74| Moderate[MODERATE_INDICATORS<br/>Some evidence, some gaps]
    Level -->|< 0.5| Weak[NEEDS_STRENGTHENING<br/>Missing key elements]
    
    Strong --> Explain[LLM: Generate Explanation<br/>List strengths + suggestions]
    Moderate --> Explain
    Weak --> Explain
    
    Explain --> Output[Support Assessment<br/>+ Disclaimer]
    
    style Evidence fill:#e3f2fd
    style Timeline fill:#e3f2fd
    style Documentation fill:#e3f2fd
    style Score fill:#e8f5e9
```

**Important**: This is NOT a prediction. It's a readiness checklist.

---

## 7. RESOURCE MATCHING & RANKING

```mermaid
graph TB
    Input[User Request<br/>District: Varanasi<br/>Case: labor_dispute]
    
    Query[Database Query<br/>WHERE state = 'UP'<br/>AND case_type = 'labor']
    
    Input --> Query
    
    Query --> Providers[Provider List<br/>10 results]
    
    subgraph "Ranking Algorithm"
        CaseMatch[Case Type Match<br/>50 points]
        Distance[Geographic Distance<br/>30 points max]
        SpecialFocus[Special Focus Match<br/>10 points]
        ProviderType[Provider Type<br/>5 points]
        Freshness[Last Verified<br/>5 points]
    end
    
    Providers --> CaseMatch
    Providers --> Distance
    Providers --> SpecialFocus
    Providers --> ProviderType
    Providers --> Freshness
    
    CaseMatch --> Total[Total Score<br/>0-100]
    Distance --> Total
    SpecialFocus --> Total
    ProviderType --> Total
    Freshness --> Total
    
    Total --> Sort[Sort by Score<br/>Descending]
    
    Sort --> TopK[Return Top 3-5<br/>with contact info]
    
    TopK --> Format[Format Response<br/>Name, address, phone, distance]
    
    Format --> Output[Ranked Providers]
    
    style CaseMatch fill:#e8f5e9
    style Distance fill:#e8f5e9
    style Total fill:#e8f5e9
```

---

## 8. ERROR HANDLING & FALLBACK HIERARCHY

```mermaid
graph TD
    Request[User Request]
    
    Request --> Primary[Primary Service<br/>AI/ML Model]
    
    Primary --> Success1{Success?}
    
    Success1 -->|Yes| Return[Return Result]
    
    Success1 -->|No| Retry{Retry<br/>Possible?}
    
    Retry -->|Yes| Backoff[Exponential Backoff<br/>Wait 2s, 4s, 8s]
    
    Backoff --> Primary
    
    Retry -->|No| Fallback1[Fallback Level 1<br/>Simpler AI]
    
    Fallback1 --> Success2{Success?}
    
    Success2 -->|Yes| Return
    
    Success2 -->|No| Fallback2[Fallback Level 2<br/>Rule-Based]
    
    Fallback2 --> Success3{Success?}
    
    Success3 -->|Yes| Return
    
    Success3 -->|No| Fallback3[Fallback Level 3<br/>Static Template]
    
    Fallback3 --> Return
    
    Return --> Log[Log Error<br/>+ Alert Admin]
    
    style Primary fill:#fff4e6
    style Fallback1 fill:#fff9c4
    style Fallback2 fill:#e8f5e9
    style Fallback3 fill:#f3e5f5
```

**Example: LLM Failure**
1. **Primary**: OpenAI API call (timeout 30s)
2. **Retry**: Try again after 2s, 4s
3. **Fallback 1**: Use simpler prompt or local model
4. **Fallback 2**: Keyword-based response
5. **Fallback 3**: Predefined template ("Can you provide more details?")

---

## 9. PRIVACY & DATA FLOW

```mermaid
graph LR
    User[User Input<br/>'राम कुमार ने मुझे मारा']
    
    subgraph "Privacy Layer"
        Anonymize[Anonymize PII<br/>'Person A hit me']
        Strip[Strip Sensitive Data<br/>Remove phone, address]
    end
    
    Session[Session Storage<br/>Redis - 24hr TTL]
    
    subgraph "Processing"
        NLP[NLP Processing<br/>with anonymized text]
        LLM[LLM API Call<br/>with anonymized text]
    end
    
    Response[Response<br/>to User]
    
    TTL[Auto-Delete<br/>After 24 hours]
    
    User --> Anonymize
    Anonymize --> Strip
    Strip --> Session
    Session --> NLP
    Session --> LLM
    NLP --> Response
    LLM --> Response
    Response --> User
    
    Session -.24hr timer.-> TTL
    
    style Anonymize fill:#ffebee
    style Strip fill:#ffebee
    style Session fill:#ffebee
    style TTL fill:#ffcdd2
```

**Privacy Guarantees:**
1. No names stored (replaced with roles)
2. No phone/address/Aadhaar (stripped before processing)
3. IP addresses hashed (not stored in full)
4. Data deleted after 24 hours (Redis TTL)
5. No tracking cookies

---

## 10. DEMO MODE ARCHITECTURE

```mermaid
graph TB
    Start[Application Start]
    
    Config{DEMO_MODE<br/>enabled?}
    
    Start --> Config
    
    Config -->|No| Production[Production Mode<br/>Real AI services]
    
    Config -->|Yes| Demo[Demo Mode<br/>Canned responses]
    
    Production --> RealNLP[Real NLP Service<br/>ML inference]
    Production --> RealLLM[Real LLM API<br/>OpenAI call]
    Production --> RealDB[Real Database<br/>PostgreSQL query]
    
    Demo --> FakeNLP[Fake NLP<br/>Predefined results]
    Demo --> FakeLLM[Fake LLM<br/>Scripted responses]
    Demo --> FakeDB[Fake DB<br/>Static JSON data]
    
    RealNLP --> Result
    RealLLM --> Result
    RealDB --> Result
    
    FakeNLP --> Result
    FakeLLM --> Result
    FakeDB --> Result
    
    Result[Response to User]
    
    style Demo fill:#e1f5fe
    style FakeNLP fill:#e1f5fe
    style FakeLLM fill:#e1f5fe
    style FakeDB fill:#e1f5fe
```

**Demo Flow Example:**
```
1. User: "मालिक ने तनख्वाह नहीं दी"
   → Pre-scripted NLP: {intent: labor_dispute}
   → Pre-scripted Bot: "आप किस जिले में रहते हैं?"

2. User: "वाराणसी"
   → Pre-scripted Bot: "आपकी मासिक आय कितनी है?"

3. User: "₹8000"
   → Show pre-generated results: Eligible, Moderate support, 3 providers

Result: Full demo in 2-3 minutes with zero external dependencies.
```

---

## DIAGRAM USAGE GUIDE

### For Development:
- **Diagram 1-2**: Overall system understanding
- **Diagram 3-7**: Component implementation reference
- **Diagram 8**: Error handling implementation

### For Presentation:
- **Diagram 1**: High-level overview (first slide)
- **Diagram 2**: Flow walkthrough (live demo)
- **Diagram 5**: "Why rules, not AI?" explanation
- **Diagram 9**: Privacy architecture

### For Viva:
- **Diagram 5 vs 6**: LLM for conversation, Rules for decisions
- **Diagram 8**: Fallback strategy ("What if AI fails?")
- **Diagram 10**: Demo mode explanation

---

**All diagrams are in Mermaid format and can be rendered in:**
- GitHub/GitLab markdown
- VS Code (with Mermaid preview extension)
- draw.io (import mermaid)
- Online: mermaid.live

