# PlanScanRx — Backend Architecture

## 1. Project Overview

- **Module**: `github.com/kyanaman/formularycheck`
- **Language**: Go 1.25 — compiled inside Docker (no local Go install)
- **ORM**: Ent (entgo.io/ent v0.14.6) — 12 schemas, code-generated
- **Database**: PostgreSQL 16 (Alpine)
- **Router**: Chi v5 with middleware stack
- **Auth**: Supabase JWT validation (HS256)
- **Logging**: `log/slog` structured JSON logging
- **LLM**: OpenAI gpt-4o-mini (article summarization + curation)
- **Docker**: Multi-stage build producing 3 static binaries (`/api`, `/ingest`, `/articles`)
- **External APIs**: RxNorm, OpenFDA, PubMed (NCBI), CMS Part D PUF, QHP MR-PUF, OpenAI
- **Source**: ~45 Go files across `cmd/`, `internal/`, `api_integrations/`, `ent/schema/`
- **Tests**: 8 test files (DTOs, handlers, RSS functions, response helpers)

## 2. Binaries

| Binary | Source | Purpose |
|--------|--------|---------|
| `/api` | `cmd/api/main.go` | HTTP API server (port 8080), slog JSON logging, graceful shutdown (10s), article scheduler background goroutine |
| `/ingest` | `cmd/ingest/main.go` | Data ingestion pipeline: RxNorm → OpenFDA → CMS PUF → QHP (batched, rate-limited) |
| `/articles` | `cmd/articles/main.go` | Article pipeline: RSS + PubMed → GPT curation (top 3-5) → summarization → retention cleanup. Also deactivates paywalled articles. |

## 3. Docker Composition

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| postgres | postgres:16-alpine | 5432 | Primary database, volume: pgdata |
| minio | minio:latest | 9000/9001 | S3-compatible object storage, volume: miniodata |
| api | Built from Dockerfile | 8080 | API server + background scheduler |

Environment variables: DATABASE_URL, SUPABASE_URL, SUPABASE_JWT_SECRET, SUPABASE_ANON_KEY, OPENAI_API_KEY, OPENAI_MODEL, NCBI_API_KEY, QHP_MRPUF_URL, QHP_CONCURRENCY, APP_ENV

## 4. Middleware Chain

```
Request → RequestID → Logging (slog JSON) → CORS → Recoverer → Timeout (30s) → Auth → Handler
```

- **Auth (OptionalAuth)**: Extracts JWT if present, allows guest. Stores Physician in context.
- **Auth (RequireAuth)**: Rejects without valid JWT (401).
- **CORS**: Methods: GET/POST/PATCH/DELETE/OPTIONS. Headers: Authorization, Content-Type, X-Guest-Mode. Credentials: true.

## 5. API Routes

### Public Routes (OptionalAuth)

| Method | Path | Handler | Response |
|--------|------|---------|----------|
| GET | `/v1/states/{code}/insurers` | GetInsurers | StateSectionedInsurersDTO (localInsurers + nationalInsurers, deduplicated by name) |
| GET | `/v1/insurers/{id}/plans` | GetPlans | []PlanDTO. Also accepts `?insurer_name=X&state=Y` |
| GET | `/v1/plans/lookup/medicare` | LookupMedicarePlan | PlanDTO. Params: contract_id, plan_id, segment_id |
| GET | `/v1/plans/lookup/hios` | LookupHiosPlan | PlanDTO. Param: hios_plan_id |
| GET | `/v1/plans/lookup/group` | LookupGroupPlan | PlanDTO. Params: group_id (required), plan_id (optional) |
| GET | `/v1/drugs/search` | SearchDrugs | []DrugDTO (max 30). Param: q (min 2 chars) |
| GET | `/v1/plans/{id}/drugs/{drugId}/coverage` | GetCoverage | FormularyEntryDTO. Brand→generic fallback with resolvedViaGeneric flag |
| GET | `/v1/drugs/{id}/coverage` | GetCoverageMulti | []FormularyEntryDTO. Param: plan_ids (comma-separated) |
| GET | `/v1/drugs/{id}/alternatives` | GetAlternatives | []DrugAlternativeDTO. Optional: plan_id for coverage status |
| GET | `/v1/coverage/{entryId}/prior-auth` | GetPriorAuthCriteria | []PriorAuthCriteriaDTO |
| GET | `/v1/discover/articles` | GetArticles | []ArticleDTO (max 30, personalized by physician's drug class history) |

### Protected Routes (RequireAuth)

| Method | Path | Handler | Response |
|--------|------|---------|----------|
| POST | `/v1/auth/callback` | AuthCallback | PhysicianDTO |
| GET | `/v1/physicians/me` | GetProfile | PhysicianDTO |
| PATCH | `/v1/physicians/me` | UpdateProfile | PhysicianDTO |
| GET | `/v1/saved-lookups` | ListSavedLookups | []SavedLookupDTO (with current coverage) |
| POST | `/v1/saved-lookups` | CreateSavedLookup | SavedLookupDTO (201) |
| PATCH | `/v1/saved-lookups/{id}` | UpdateSavedLookup | SavedLookupDTO |
| DELETE | `/v1/saved-lookups/{id}` | DeleteSavedLookup | 204 |
| GET | `/v1/search-history` | ListSearchHistory | []SearchHistoryDTO (last 100) |
| DELETE | `/v1/search-history/{id}` | DeleteSearchHistoryEntry | 204 |
| DELETE | `/v1/search-history` | ClearSearchHistory | 204 |
| GET | `/v1/insights/summary` | GetInsightsSummary | InsightsSummaryDTO |
| GET | `/v1/insights/trends` | GetInsightsTrends | InsightsTrendsDTO |

## 6. Response Envelope

All success responses wrapped in: `{ "data": <payload>, "meta": { "count": N, "page": N } }`
Error responses: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`
Codes: NOT_FOUND (404), BAD_REQUEST (400), UNAUTHORIZED (401), INTERNAL_ERROR (500)

## 7. Handler Details

### GetInsurers — Deduplication + State Sectioning
- Groups insurers by lowercase `insurer_name`, picks representative with most plans, aggregates all plans
- Sections: plans with `state_code=requested` → localInsurers, plans with `state_code IS NULL` → nationalInsurers

### GetCoverage — Brand→Generic Fallback
- If branded drug not found on plan, resolves via `generic_name` match
- Returns `resolvedViaGeneric: true` + `genericDrugName` when fallback used

### GetAlternatives — Dynamic Generic Generation
- Returns pre-populated alternatives from DB (THERAPEUTIC_ALTERNATIVE, BIOSIMILAR)
- Dynamically generates GENERIC_EQUIVALENT entries by matching `generic_name`
- If `plan_id` provided, includes coverage status for each alternative

### GetArticles — Personalized Discovery
- For authenticated physicians: extracts top drug classes from last 200 searches
- Scores articles by drug_class overlap, newer articles break ties
- Falls back to chronological for guests

### GetInsightsSummary — Usage Analytics
- Total lookups, coverage success rate (% of unique plan+drug pairs that are covered)
- Top 5 drugs/insurers/plans by search frequency
- Computed from last 500 search history entries

## 8. Database Schemas (Ent)

### Entity Relationship Diagram
```
Insurer (1) ──── (N) Plan ──── (N) FormularyEntry ──── (1) Drug
                       │                    │
                       │                    └── (N) PriorAuthCriteria
                       │
                       └── (N) SavedLookup ←── Physician
                       └── (N) SearchHistory ←── Physician

Drug (1) ──── (N) DrugAlternative ──── Drug (alternative)
     │
     └── (N) DrugNdcMap

Article (standalone)
SyncMetadata (standalone)
```

### Schema Fields

**Drug**: id, rxcui (unique), drug_name, generic_name, brand_names[], dose_form, strength, route, drug_class, is_specialty, is_controlled, dea_schedule, last_rxnorm_sync, created_at, updated_at

**Plan**: id, contract_id, plan_id, segment_id (unique triple), contract_name, plan_name, formulary_id, plan_type, snp_type, state_code (max 2), market_type, metal_level, group_id, plan_year, is_active, created_at, updated_at

**Insurer**: id, insurer_name, parent_company, hios_issuer_id (unique), fhir_endpoint_url, website_url, created_at, updated_at

**FormularyEntry**: id, tier_level, tier_name, prior_auth_required, step_therapy, quantity_limit, quantity_limit_amount, quantity_limit_days, copay_amount, coinsurance_pct, copay_mail_order, is_covered, specialty_drug, quantity_limit_detail, source_type, source_date, is_current, created_at. Unique index: (source_type, plan_id, drug_id)

**PriorAuthCriteria**: id, criteria_type, criteria_description, required_diagnoses[], age_min, age_max, gender_restriction, step_therapy_drugs[], step_therapy_description, max_quantity, quantity_period_days, source_document_url, created_at

**DrugAlternative**: id, relationship_type (enum: GENERIC_EQUIVALENT/THERAPEUTIC_ALTERNATIVE/BIOSIMILAR), source, notes, created_at. Edges: drug, alternative_drug

**Physician**: id, supabase_user_id (unique), email, display_name, npi (10-digit regex), specialty, primary_state (max 2), is_npi_verified, created_at, updated_at

**SearchHistory**: id, state_code, search_text, results_count, searched_at (immutable). Edges: physician (required), plan (optional), drug (optional)

**SavedLookup**: id, nickname, created_at, updated_at. Edges: physician, plan, drug (all required)

**Article**: id, title, summary, source_name, source_url, published_at, drug_classes[], image_url, is_active, created_at

**DrugNdcMap**: id, ndc (unique), ndc_status, manufacturer, package_description, start_date, end_date, created_at

**SyncMetadata**: id, source_name (unique), last_sync_at, last_etag, last_url, records_processed

## 9. Data Integrations

### RSS Feeds (DefaultFeeds)
1. FDA Safety — drug-safety-communications/rss.xml
2. FDA Drug Approvals — drugs-approvals-and-alerts/rss.xml
3. Medpage Today — medpagetoday.com/rss/headlines.xml
4. CMS Newsroom — cms.gov/newsroom/rss
5. Healio Pharmacy — healio.com/rss/pharmacy

Paywall filter: skips titles with "STAT+:", "[Subscribers only]", "[Premium]", "[Exclusive]"

### PubMed (NCBI eSummary API)
Queries: drug formulary coverage, prior authorization, new drug approval, clinical practice guideline, drug safety update

### LLM Pipeline (OpenAI gpt-4o-mini)
- **Curate**: Selects top 3-5 articles from candidates. Temp: 0.2, max_tokens: 100. Priority: FDA > clinical guidelines > formulary changes > trials > research
- **Summarize**: 2-sentence physician summary + drug_classes extraction + category. Temp: 0.3, max_tokens: 300

### Article Scheduler
- Background goroutine in API server (6-hour interval)
- Pipeline: Collect → Curate → Summarize → Store → Retention cleanup
- Retention: 7 days standard, 90 days premium (FDA, PubMed, NEJM, JAMA, Lancet, BMJ)

### Data Ingestion Pipeline (cmd/ingest)
1. RxNorm → 27K drugs (rxcui, names, classes, DEA schedules)
2. OpenFDA → 159K NDC mappings
3. CMS PUF → 17.7M formulary entries, 5.5K plans (Medicare Part D)
4. QHP → ACA marketplace plans (batched crawl, 5 concurrent, 500ms rate limit per host, 60s timeout per issuer)

## 10. Database Volumes

| Table | Records | Source |
|-------|---------|--------|
| drugs | 27,390 | RxNorm |
| drug_ndc_maps | 159,312 | OpenFDA |
| insurers | 724 (542 unique names) | CMS PUF + QHP |
| plans | 7,827 (5,528 national + 2,299 state-specific) | CMS PUF + QHP |
| formulary_entries | ~17.8M | CMS PUF + QHP |
| articles | 3-5/day | RSS + PubMed (GPT curated) |

## 11. Test Coverage
- 8 test files: dto/drug_test.go, dto/plan_test.go, dto/formulary_test.go, dto/article_test.go, dto/insights_test.go, handler/insights_test.go, articles/rss_test.go, response/response_test.go
- Table-driven tests with edge cases
- Run via Docker: `docker compose build api` (Ent generate + go test in builder stage)

## 12. Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| SUPABASE_URL | Yes | — | Supabase project URL |
| SUPABASE_JWT_SECRET | Yes | — | JWT signing key |
| SUPABASE_ANON_KEY | No | — | Public anon key |
| OPENAI_API_KEY | No | — | Article summarization/curation |
| OPENAI_MODEL | No | gpt-4o-mini | LLM model |
| NCBI_API_KEY | No | — | PubMed API |
| PORT | No | 8080 | API server port |
| APP_ENV | No | development | Environment mode |
| QHP_MRPUF_URL | No | — | QHP data source URL |
| QHP_CONCURRENCY | No | 5 | QHP crawl concurrency |
