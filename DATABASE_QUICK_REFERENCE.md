# NYAYASETU Database - Quick Reference Guide

**For complete details, see:** `DATABASE_SCHEMA.md`

---

## Table Summary

### 📊 Total Tables: 13

| # | Table Name | Purpose | Layer | TTL |
|---|------------|---------|-------|-----|
| 1 | `sessions` | User sessions (anonymous) | Citizen | 24hr |
| 2 | `conversation_messages` | Chat history | Citizen | 24hr |
| 3 | `assessments` | Eligibility & support results | Citizen | 24hr |
| 4 | `extracted_facts` | Structured data from conversation | Citizen | 24hr |
| 5 | `documents` | File metadata (not content) | Citizen | 24hr |
| 6 | `assessment_resources` | Recommended providers | Citizen | 24hr |
| 7 | `action_items` | Next steps for citizen | Citizen | 24hr |
| 8 | `legal_issues` | Legal category taxonomy | Knowledge | Permanent |
| 9 | `legal_rules` | Legal provisions (info only) | Knowledge | Permanent |
| 10 | `eligibility_rules` | **SOURCE OF TRUTH** for eligibility | Knowledge | Permanent |
| 11 | `evidence_patterns` | Typical evidence per category | Knowledge | Permanent |
| 12 | `legal_resources` | Providers (LSA, NGOs) | Knowledge | Permanent |
| 13 | `admin_users` | System administrators | Admin | Permanent |
| 14 | `audit_logs` | All admin actions | Admin | Permanent |
| 15 | `analytics_snapshots` | Aggregated metrics (no PII) | Admin | Permanent |

---

## Critical Tables (Source of Truth)

### 1. `eligibility_rules` - THE DECISION MAKER
**This table determines eligibility. Rules are manually verified.**

```sql
SELECT * FROM eligibility_rules 
WHERE state = 'uttar_pradesh' AND is_active = true;
```

**Key Fields:**
- `income_threshold_annual` (Integer, Required) - Annual income limit in INR
- `special_categories` (JSONB, Required) - Auto-eligible groups
- `source_document` (Text, Required) - Official notification
- `last_verified_date` (Date, Required) - When last checked
- `verified_by` (UUID, Required) - Admin who verified

**Constraint:** Only ONE active rule per (state, legal_issue_id)

---

### 2. `legal_resources` - THE PROVIDER DATABASE
**All legal aid providers with verified contact info.**

```sql
SELECT * FROM legal_resources 
WHERE district = 'varanasi' 
  AND 'labor_dispute' = ANY(case_types_handled)
  AND is_active = true
ORDER BY last_verified_date DESC;
```

**Key Fields:**
- `district`, `state` (Text, Required) - For filtering
- `latitude`, `longitude` (Decimal, Optional) - For distance calc
- `case_types_handled` (JSONB, Required) - Array of categories
- `last_verified_date` (Date, Required) - Freshness check

---

### 3. `assessments` - THE RESULTS
**One per session. Contains eligibility + support assessment.**

```sql
SELECT * FROM assessments 
WHERE session_id = '...' 
LIMIT 1;
```

**Key Fields:**
- `eligibility_status` (Enum) - eligible | not_eligible | partial | insufficient_info
- `eligibility_reasoning` (JSONB) - Why this result + criteria met
- `support_level` (Enum) - strong | moderate | needs_strengthening
- `urgency_level` (Enum) - critical | high | medium | low

---

## Data Flow at a Glance

```
1. User creates session → sessions table (24hr TTL)
2. Conversation messages → conversation_messages (linked to session)
3. NLP extracts facts → extracted_facts (structured data)
4. When ready → assessment created
5. Assessment queries:
   - eligibility_rules (deterministic decision)
   - evidence_patterns (what's needed)
   - legal_resources (where to go)
6. Assessment generates:
   - assessment_resources (ranked providers)
   - action_items (next steps)
7. After 24 hours → CASCADE DELETE all session data
```

---

## Relationships Quick Map

### Citizen Layer (Temporary)
```
sessions (1) → (many) conversation_messages
sessions (1) → (1) assessments
sessions (1) → (many) extracted_facts
sessions (1) → (many) documents

assessments (1) → (many) assessment_resources
assessments (1) → (many) action_items
```

### Knowledge Layer (Permanent)
```
legal_issues (parent) → (many) legal_issues (children)
legal_issues (1) → (many) legal_rules
legal_issues (1) → (many) eligibility_rules
legal_issues (1) → (many) evidence_patterns

legal_resources → referenced by assessment_resources
```

### Cross-Layer
```
assessments (many) → (1) legal_issues (categorization)
assessment_resources (many) → (1) legal_resources (recommendation)
extracted_facts (many) → (1) legal_issues (optional link)
```

---

## Critical Indexes (Performance)

### Most Important for Query Speed

```sql
-- Eligibility lookup (used every assessment)
CREATE INDEX idx_eligibility_state_active 
ON eligibility_rules (state, is_active) WHERE is_active = true;

-- Resource search (used every assessment)
CREATE INDEX idx_resources_location_active 
ON legal_resources (district, state, is_active) WHERE is_active = true;

-- Cleanup job (runs every hour)
CREATE INDEX idx_sessions_expires_at 
ON sessions (expires_at) WHERE is_deleted = false;

-- Geospatial distance (optional but helpful)
CREATE INDEX idx_resources_location_gist 
ON legal_resources USING GIST (ll_to_earth(latitude, longitude));
```

---

## Privacy & Security Rules

### ❌ NEVER Store:
- Full names (use "Person A", "Employer")
- Phone numbers (strip from messages)
- Exact addresses (district level only)
- Aadhaar/PAN numbers
- Email addresses (except admin)

### ✅ What We Store (Anonymized):
- District/State (for resource matching)
- Income bracket (not exact amount)
- Case category
- Evidence types mentioned (not content)
- Conversation (PII-stripped)

### 🕐 Auto-Delete After 24 Hours:
- sessions
- conversation_messages
- assessments
- extracted_facts
- documents (metadata)
- assessment_resources
- action_items

**Implementation:** Cleanup job OR Redis TTL

---

## Common Queries

### 1. Get Active Eligibility Criteria for a State
```sql
SELECT * FROM eligibility_rules
WHERE state = 'uttar_pradesh'
  AND is_active = true
  AND (effective_to IS NULL OR effective_to > CURRENT_DATE)
ORDER BY effective_from DESC
LIMIT 1;
```

### 2. Find Legal Resources by Location & Category
```sql
SELECT 
    lr.*,
    earth_distance(
        ll_to_earth(lr.latitude, lr.longitude),
        ll_to_earth(25.3176, 82.9739)  -- User location
    ) / 1000.0 as distance_km
FROM legal_resources lr
WHERE lr.district = 'varanasi'
  AND lr.state = 'uttar_pradesh'
  AND 'labor_dispute' = ANY(lr.case_types_handled)
  AND lr.is_active = true
ORDER BY distance_km
LIMIT 5;
```

### 3. Get Session with Full Context
```sql
-- Get session
SELECT * FROM sessions WHERE id = '...';

-- Get conversation
SELECT * FROM conversation_messages 
WHERE session_id = '...' 
ORDER BY created_at;

-- Get extracted facts
SELECT * FROM extracted_facts 
WHERE session_id = '...';

-- Get assessment (if exists)
SELECT * FROM assessments 
WHERE session_id = '...' 
LIMIT 1;

-- Get recommended resources (if assessed)
SELECT lr.*, ar.relevance_score, ar.distance_km
FROM assessment_resources ar
JOIN legal_resources lr ON ar.legal_resource_id = lr.id
WHERE ar.assessment_id = (SELECT id FROM assessments WHERE session_id = '...')
ORDER BY ar.rank_position;
```

### 4. Cleanup Expired Sessions
```sql
-- Find expired sessions
SELECT id FROM sessions 
WHERE expires_at < NOW() 
  AND is_deleted = false;

-- Soft delete (or hard delete with CASCADE)
UPDATE sessions 
SET is_deleted = true 
WHERE expires_at < NOW() 
  AND is_deleted = false;

-- Or hard delete (CASCADE handles related records)
DELETE FROM sessions 
WHERE expires_at < NOW();
```

### 5. Admin: Get Stale Legal Resources
```sql
SELECT id, name, last_verified_date,
       (CURRENT_DATE - last_verified_date) as days_since_verified
FROM legal_resources
WHERE is_active = true
  AND last_verified_date < CURRENT_DATE - INTERVAL '90 days'
ORDER BY last_verified_date;
```

---

## Seed Data Overview

### Legal Issues Hierarchy (5 parent + subcategories)
1. **labor_dispute** (parent)
   - wage_theft
   - wrongful_termination
   - workplace_harassment
   
2. **family_law** (parent)
   - divorce
   - child_custody
   - domestic_violence
   
3. **property_dispute** (parent)
   - landlord_tenant
   - inheritance
   - boundary_disputes
   
4. **criminal_law** (parent)
   - victim_rights
   - bail_application
   - fir_related
   
5. **consumer_dispute** (parent)
   - defective_product
   - service_deficiency
   - refund_issues

### Eligibility Rules (2-3 states)
- **Uttar Pradesh**: ₹3 lakh threshold
- **Maharashtra**: ₹5 lakh threshold
- **Tamil Nadu**: ₹2 lakh threshold (example)

### Legal Resources (20-30 providers)
- State LSAs (1 per state)
- District LSAs (1-2 per major district)
- NGOs (5-10 major organizations)
- Pro-bono panels (optional)

### Evidence Patterns (3-5 per category)
- appointment_letter (critical)
- salary_slips (critical)
- whatsapp_messages (important)
- bank_statements (important)
- witness_statements (helpful)

---

## Migration Strategy

### Step 1: Create Database
```bash
createdb nyayasetu
```

### Step 2: Run Schema
```bash
psql nyayasetu < schema.sql
```

### Step 3: Seed Data
```bash
psql nyayasetu < seed_data.sql
```

### Step 4: Verify
```sql
SELECT 'legal_issues' as table_name, count(*) from legal_issues
UNION ALL
SELECT 'eligibility_rules', count(*) from eligibility_rules
UNION ALL
SELECT 'legal_resources', count(*) from legal_resources;
```

Expected counts:
- legal_issues: 15-20 (5 parents + subcategories)
- eligibility_rules: 2-3 (states)
- legal_resources: 20-30 (providers)

---

## ORM Usage (SQLAlchemy Example)

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from models import LegalIssue, EligibilityRule, LegalResource

# Connect
engine = create_engine('postgresql://user:pass@localhost/nyayasetu')

# Query
with Session(engine) as session:
    # Get labor dispute category
    issue = session.query(LegalIssue).filter_by(name='labor_dispute').first()
    
    # Get UP eligibility criteria
    rule = session.query(EligibilityRule).filter_by(
        state='uttar_pradesh',
        is_active=True
    ).first()
    
    # Get Varanasi resources
    resources = session.query(LegalResource).filter(
        LegalResource.district == 'varanasi',
        LegalResource.is_active == True
    ).all()
```

---

## Development vs Production

### Development (SQLite)
- Simpler setup, no server
- JSON as TEXT (not JSONB)
- No advanced indexes (GIN, GIST)
- CHECK constraints instead of ENUMs
- Use `gen_random_uuid()` equivalent in app

### Production (PostgreSQL)
- Full JSONB support
- GIN indexes for JSON queries
- GIST indexes for geospatial
- Native ENUM types
- Extensions: uuid-ossp, earthdistance

**Recommendation:** Develop on SQLite, deploy to PostgreSQL. Use SQLAlchemy ORM for compatibility.

---

## Monitoring & Maintenance

### Daily Tasks
- Check session cleanup job ran
- Monitor disk space (sessions table)

### Weekly Tasks
- Review audit logs
- Check for failed assessments
- Monitor API error rates

### Monthly Tasks
- Verify legal resources (call providers)
- Update stale data
- Review analytics snapshots
- Check eligibility rule changes

### Quarterly Tasks
- Full data verification audit
- Update all legal resources
- Review and update eligibility rules
- Clean up deprecated legal issues

---

## Troubleshooting

### Issue: Sessions not deleting after 24 hours
**Check:**
```sql
SELECT count(*), min(expires_at), max(expires_at)
FROM sessions 
WHERE expires_at < NOW();
```
**Fix:** Run cleanup job manually or check cron schedule

### Issue: Slow eligibility queries
**Check:**
```sql
EXPLAIN ANALYZE
SELECT * FROM eligibility_rules
WHERE state = 'uttar_pradesh' AND is_active = true;
```
**Fix:** Ensure index exists on (state, is_active)

### Issue: No resources found for district
**Check:**
```sql
SELECT district, count(*) 
FROM legal_resources 
WHERE is_active = true 
GROUP BY district;
```
**Fix:** Add resources for missing districts or use state-level fallback

---

## Next Steps

1. **Review Full Schema**: See `DATABASE_SCHEMA.md` for complete table definitions
2. **Set Up Development DB**: Use SQLite or PostgreSQL locally
3. **Seed Test Data**: Run seed scripts
4. **Test Queries**: Verify common query patterns
5. **Build Backend**: Create SQLAlchemy models
6. **Implement Cleanup**: Schedule 24hr deletion job

---

**For complete details including:**
- Full SQL schema (PostgreSQL + SQLite)
- Complete SQLAlchemy ORM models
- All seed data SQL
- Detailed constraints and triggers
- Privacy implementation details

**See:** `DATABASE_SCHEMA.md`

---

*Database designed for NYAYASETU - AI-Powered Legal Aid Discovery Platform*
