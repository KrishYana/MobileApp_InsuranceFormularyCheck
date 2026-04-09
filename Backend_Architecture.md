# PlanScanRx — Backend Architecture

## 1. Project Overview

- **Module**: `github.com/kyanaman/formularycheck`
- **Language**: Go 1.25 — compiled inside Docker (no local Go install)
- **ORM**: Ent (entgo.io/ent v0.14.6) — code-generated from schema definitions
- **Database**: PostgreSQL 16 (Alpine)
- **Router**: Chi v5 with middleware stack
- **Auth**: Supabase JWT validation (HS256)
- **Docker**: Multi-stage build producing 3 binaries (`/api`, `/ingest`, `/articles`)
- **External APIs**: RxNorm, OpenFDA, PubMed (NCBI), CMS Part D PUF, QHP MR-PUF, OpenAI
- **Source**: 34 Go files across `cmd/`, `internal/`, `api_integrations/`, `ent/schema/`

---

## 2. Binaries

| Binary | Source | Purpose |
|--------|--------|---------|
| `/api` | `cmd/api/main.go` | HTTP API server (port 8080), graceful shutdown |
| `/ingest` | `cmd/ingest/main.go` | Data ingestion: RxNorm → OpenFDA → CMS PUF → QHP |
| `/articles` | `cmd/articles/main.go` | Article curation: RSS + PubMed → GPT curation → summarization → retention |

---

## 3. Docker Composition

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| `postgres` | `postgres:16-alpine` | 5432 | Database |
| `minio` | `minio/minio:latest` | 9000, 9001 | S3-compatible object storage |
| `api` | Custom (Dockerfile) | 8080 | Go API + ingest + articles binaries |

### Dockerfile (multi-stage)
```
Stage 1 (golang:1.25-alpine):
  COPY . . → ent generate → go mod tidy → build 3 binaries

Stage 2 (alpine:3.20):
  ca-certificates + 3 binaries → CMD ["/api"]
```

---

## 4. Environment Variables

```
# Database
DATABASE_URL=postgres://formulary:formulary@postgres:5432/formularycheck?sslmode=disable

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=<jwt-secret>
SUPABASE_ANON_KEY=<anon-key>

# API Server
PORT=8080
APP_ENV=development

# Article Pipeline
OPENAI_API_KEY=<key>          # GPT for article curation + summarization
OPENAI_MODEL=gpt-4o-mini     # Model override
NCBI_API_KEY=<key>            # PubMed API (10 req/sec with key)

# Data Ingestion
CMS_PUF_URL=<zip-url>        # CMS Part D formulary data
QHP_MRPUF_URL=<csv-url>      # ACA marketplace issuer list
```

---

## 5. Database Schema (12 Entities)

### Entity Relationship Summary

```
Insurer 1 ←→ ∞ Plan
Plan    1 ←→ ∞ FormularyEntry
Drug    1 ←→ ∞ FormularyEntry
Drug    1 ←→ ∞ DrugNdcMap
Drug    1 ←→ ∞ DrugAlternative (self-referential)
FormularyEntry 1 ←→ ∞ PriorAuthCriteria
Physician 1 ←→ ∞ SavedLookup
Physician 1 ←→ ∞ SearchHistory
Article (standalone)
SyncMetadata (standalone)
```

### Drug
| Field | Type | Notes |
|-------|------|-------|
| rxcui | string | Unique, RxNorm identifier |
| drug_name | string | Indexed |
| generic_name | string? | |
| brand_names | []string | |
| dose_form, strength, route | string? | |
| drug_class | string? | Used for article personalization |
| is_specialty, is_controlled | bool | |
| dea_schedule | string? | |

### Plan
| Field | Type | Notes |
|-------|------|-------|
| contract_id + plan_id + segment_id | string | Unique composite key |
| plan_name, contract_name | string? | |
| formulary_id | string | Links to PUF formulary data |
| plan_type | string? | "QHP", "Part D", etc. |
| state_code | string? | 2-char state, nullable for national plans |
| market_type, metal_level | string? | QHP-specific |
| is_active | bool | Default true |
| insurer_plans | FK → Insurer | |

### Insurer
| Field | Type | Notes |
|-------|------|-------|
| insurer_name | string | Indexed |
| hios_issuer_id | string? | Unique, from CMS contract or QHP issuer |
| parent_company | string? | |

### FormularyEntry
| Field | Type | Notes |
|-------|------|-------|
| tier_level, tier_name | int?, string? | Drug tier |
| prior_auth_required, step_therapy, quantity_limit | bool | Restriction flags |
| copay_amount, coinsurance_pct, copay_mail_order | float? | Cost info |
| is_covered | bool | Default true |
| source_type | string | "CMS_PUF" or "QHP" |
| **Unique index** | (source_type, plan_id, drug_id) | Prevents duplicates |

### Physician
| Field | Type | Notes |
|-------|------|-------|
| supabase_user_id | string | Unique, from JWT `sub` claim |
| email, display_name | string | |
| npi | string? | 10-digit, validated regex |
| specialty, primary_state | string? | |

### Article
| Field | Type | Notes |
|-------|------|-------|
| title, summary | string | Summary from GPT |
| source_name | string | "FDA", "PubMed", "STAT News", etc. |
| source_url | string | Unique, for dedup |
| drug_classes | []string | Extracted by GPT, used for personalization |
| is_active | bool | False when past retention window |

### SyncMetadata
| Field | Type | Notes |
|-------|------|-------|
| source_name | string | Unique: "rxnorm", "openfda", "cms_puf", "qhp:\<id\>" |
| last_sync_at | time | |
| last_etag | string? | HTTP ETag/Last-Modified for change detection |
| records_processed | int | |

---

## 6. API Routes

### Public (OptionalAuth — guests allowed)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/v1/states/{code}/insurers` | GetInsurers | Insurers with active plans in state |
| GET | `/v1/insurers/{id}/plans` | GetPlans | Plans by insurer, optional state filter |
| GET | `/v1/plans/lookup/medicare` | LookupMedicarePlan | By contract_id + plan_id + segment_id |
| GET | `/v1/plans/lookup/hios` | LookupHiosPlan | By HIOS plan ID |
| GET | `/v1/drugs/search?q=` | SearchDrugs | Name/generic/class search (≥2 chars) |
| GET | `/v1/plans/{id}/drugs/{drugId}/coverage` | GetCoverage | Single plan+drug coverage |
| GET | `/v1/drugs/{id}/coverage?plan_ids=` | GetCoverageMulti | Multi-plan coverage |
| GET | `/v1/drugs/{id}/alternatives` | GetAlternatives | Generic/therapeutic/biosimilar |
| GET | `/v1/coverage/{entryId}/prior-auth` | GetPriorAuthCriteria | PA requirements |
| GET | `/v1/discover/articles` | GetArticles | Personalized article feed (30 max) |

### Protected (RequireAuth — valid Supabase JWT)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/v1/auth/callback` | AuthCallback | JWT handshake, auto-creates physician |
| GET | `/v1/physicians/me` | GetProfile | Current physician profile |
| PATCH | `/v1/physicians/me` | UpdateProfile | Update name/npi/specialty/state |
| GET | `/v1/saved-lookups` | ListSavedLookups | Physician's bookmarks with current coverage |
| POST | `/v1/saved-lookups` | CreateSavedLookup | Save plan+drug pair |
| PATCH | `/v1/saved-lookups/{id}` | UpdateSavedLookup | Update nickname |
| DELETE | `/v1/saved-lookups/{id}` | DeleteSavedLookup | Remove bookmark |
| GET | `/v1/search-history` | ListSearchHistory | Last 100 searches |
| DELETE | `/v1/search-history/{id}` | DeleteSearchHistoryEntry | Delete one entry |
| DELETE | `/v1/search-history` | ClearSearchHistory | Delete all |
| GET | `/v1/insights/summary` | GetInsightsSummary | Analytics: top drugs/insurers/plans, coverage rate |
| GET | `/v1/insights/trends` | GetInsightsTrends | Weekly lookup counts (12 weeks) |

---

## 7. Middleware Stack

Order: RequestID → Logging → CORS → Recoverer → Timeout (30s)

### Auth Middleware
- **OptionalAuth**: extracts physician if JWT present, allows guests
- **RequireAuth**: rejects without valid JWT (401)
- JWT validation: HS256, issuer = `{SUPABASE_URL}/auth/v1`
- Auto-creates Physician on first login
- Context: `PhysicianFromCtx(ctx) → (*ent.Physician, bool)`

### CORS
- Origins: `*` (configurable)
- Methods: GET, POST, PATCH, DELETE, OPTIONS
- Headers: Authorization, Content-Type, X-Guest-Mode
- Max age: 24h

---

## 8. Data Ingestion Pipeline (`/ingest`)

Sequential pipeline, each step is diff-aware:

### Step 1: RxNorm → `drugs` table
- Fetches SCD+SBD concepts from RxNorm API
- First run: full load (~27,000 drugs)
- Subsequent: `getNewConcepts` API + refresh stale records (>30 days)
- Populates: rxcui, drug_name, generic_name, brand_names, dose_form, strength, route, drug_class

### Step 2: OpenFDA → `drug_ndc_maps` table
- HEAD request to check `Last-Modified` — skips if unchanged
- Bulk download of NDC partitions (~133K records)
- Maps NDC codes to drugs by rxcui
- Updates existing records (status, manufacturer, end date)

### Step 3: CMS Part D PUF → `plans` + `formulary_entries` (if `CMS_PUF_URL` set)
- HEAD request fingerprint check — skips 2.3GB download if unchanged
- Parses pipe-delimited Plan Information + Basic Drugs Formulary files
- Creates Insurer per unique contract_id, links Plans
- Creates FormularyEntry per plan+drug+source (with existence check)
- ~5,500 plans, ~17.7M formulary entries

### Step 4: QHP → `plans` + `formulary_entries` (if `QHP_MRPUF_URL` set)
- Downloads MR-PUF CSV (flexible header parsing)
- Discovers ~346 issuers with JSON endpoint URLs
- Filters to stale issuers (not synced in 7 days)
- Crawls 10 concurrent: index.json → plans.json → drugs.json
- Creates Insurer per issuer (name from plan marketing_name), sets state_code
- Creates FormularyEntry with existence check

### Sync Tracking
- `SyncMetadata` table stores per-source: last_sync_at, last_etag, records_processed
- `synctracker.Tracker` provides `GetLastSync()` / `RecordSync()`

---

## 9. Article Pipeline (`/articles`)

### Step 1: Collect Candidates
- **RSS feeds**: STAT News, FiercePharma, Healio Pharmacy, FDA Safety
- **PubMed**: 5 search queries (formulary, prior auth, FDA approval, guidelines, safety)
- Deduplicates by source_url against existing articles

### Step 2: GPT Curation (if `OPENAI_API_KEY` set)
- Sends numbered candidate list to GPT
- GPT selects top 3-5 most clinically relevant articles
- Falls back to first 5 if LLM unavailable

### Step 3: Summarization
- Each selected article → GPT: returns JSON with `summary`, `drug_classes[]`, `category`
- Categories: fda_approval, safety_alert, formulary_change, clinical_guideline, drug_research, industry_news

### Step 4: Retention Cleanup
- **Standard sources** (news): 7-day retention
- **Premium sources** (PubMed journals, FDA): 90-day retention
- Premium list: FDA, PubMed, NEJM, JAMA, Lancet, BMJ, Ann Intern Med

### Summarizer (`internal/summarizer/`)
- OpenAI chat completions API client
- `Curate(candidates)` → selects top N indices
- `Summarize(title, text)` → {summary, drug_classes, category}
- `response_format: json_object` for structured output
- Temperature: 0.2 (curation), 0.3 (summarization)

---

## 10. Key Architecture Patterns

### Search History (Async Side-Effect)
```go
// Recorded in background goroutine — non-blocking, best-effort
go func() {
    h.db.SearchHistory.Create().
        SetPhysician(phys).SetDrug(drug).SetPlan(plan).Save(ctx)
}()
```
- Captured on: SearchDrugs, GetCoverage, GetCoverageMulti
- Used for: Insights analytics, Discover personalization
- Only for authenticated users (guests skipped)

### Article Personalization
1. Fetch physician's last 200 search history entries with Drug edges
2. Count drug_class occurrences (frequency = weight)
3. Score articles by `drug_classes ∩ physician_classes` overlap
4. Sort: highest score first, then newest first
5. Return top 30

### Insights Computation
- **Top Drugs**: count drug occurrences in search history, take top 5
- **Top Insurers**: follow SearchHistory → Plan → Insurer edge, count, top 5
- **Top Plans**: count plan occurrences in search history, top 5
- **Coverage Success Rate**: for each (plan, drug) pair in history, check if FormularyEntry exists with is_covered=true

### Coverage Lookup
- Query FormularyEntry where plan_id + drug_id + is_current=true
- If found: return actual entry with tier, copay, restrictions
- If not found: return synthetic `{isCovered: false}` response

---

## 11. File Structure

```
Backend_InsuranceFormularyCheck/
  Dockerfile                              # Multi-stage: build 3 binaries
  docker-compose.yml                      # postgres + minio + api
  go.mod / go.sum
  .env                                    # Secrets (gitignored)
  .gitignore

  cmd/
    api/main.go                           # HTTP server entry point
    ingest/main.go                        # Data ingestion orchestrator
    articles/main.go                      # Article curation pipeline

  internal/
    server/
      server.go                           # Chi router + route definitions
      config.go                           # Env-based config loading
    handler/
      handler.go                          # Handler struct (holds *ent.Client)
      discover.go                         # GET /discover/articles (personalized)
      formulary.go                        # Drug search + coverage + alternatives
      insights.go                         # GET /insights/summary + trends
      physician.go                        # Profile CRUD + auth callback
      plan.go                             # Insurers + plans + lookups
      saved_lookup.go                     # Bookmark CRUD
      search_history.go                   # History list + delete
    middleware/
      auth.go                             # Supabase JWT validation
      cors.go                             # CORS config
      logging.go                          # Request logging
    response/
      response.go                         # JSON/Error response helpers
    dto/
      article.go                          # ArticleDTO + ArticleFromEnt
      drug.go                             # DrugDTO + helpers
      formulary.go                        # FormularyEntryDTO, PriorAuthDTO
      insights.go                         # Summary/Trends/TopDrug/TopInsurer/TopPlan DTOs
      physician.go                        # PhysicianDTO
      plan.go                             # PlanDTO, InsurerDTO + converters
      saved_lookup.go                     # SavedLookupDTO
      search_history.go                   # SearchHistoryDTO
    summarizer/
      summarizer.go                       # OpenAI client (Curate + Summarize)
    synctracker/
      tracker.go                          # GetLastSync / RecordSync

  api_integrations/
    rxnorm/
      client.go                           # RxNorm REST API client
      ingest.go                           # Full + incremental drug ingestion
      types.go                            # MinConcept, ConceptGroup types
    openfda/
      client.go                           # Not used (bulk download instead)
      bulk.go                             # Bulk NDC download + CheckLastModified
      ingest.go                           # NDC-to-drug mapping with updates
      types.go                            # NDCRecord, OpenFDA response types
    cmspuf/
      download.go                         # ZIP download + CheckFingerprint
      parser.go                           # Pipe-delimited PUF file parser
      ingest.go                           # Plan + FormularyEntry creation with Insurer
      types.go                            # PlanRow, FormularyRow, BeneficiaryCostRow
    qhp/
      discovery.go                        # MR-PUF CSV → Issuer list (flexible headers)
      crawler.go                          # Concurrent JSON crawler (index/plans/drugs)
      ingest.go                           # Plan + FormularyEntry creation with Insurer
      types.go                            # Issuer, PlanJSON, DrugJSON, DrugPlan
    articles/
      fda_safety.go                       # FDA RSS ingestor (legacy, superseded by rss.go)
      pubmed.go                           # PubMed E-utilities + summarization
      rss.go                              # Generic RSS ingestor + CollectCandidates

  ent/
    schema/                               # 12 Ent schema definitions
      article.go
      drug.go
      drugalternative.go
      drugndcmap.go
      formularyentry.go
      insurer.go
      physician.go
      plan.go
      priorauthcriteria.go
      savedlookup.go
      searchhistory.go
      syncmetadata.go
    [generated/]                          # Auto-generated by `ent generate`
```

---

## 12. Current Data Volumes

| Table | Records | Source |
|-------|---------|--------|
| drugs | 27,390 | RxNorm |
| drug_ndc_maps | 159,312 | OpenFDA |
| insurers | 699+ | CMS PUF contracts + QHP issuers |
| plans | 7,362+ | CMS PUF (5,528) + QHP (1,834) |
| formulary_entries | 17.8M+ | CMS PUF (17.7M) + QHP (109K) |
| articles | 3-5/day | RSS + PubMed (GPT curated) |
| sync_metadata | ~350+ | Per-source + per-QHP-issuer tracking |

---

## 13. Design Decisions

| Decision | Detail | Date |
|----------|--------|------|
| ORM | Ent over GORM — code-generated, type-safe, schema-as-code | 2026-03 |
| Router | Chi v5 over Gin — lighter, idiomatic, composable middleware | 2026-03 |
| Auth | Supabase JWT validation in Go middleware, not a proxy | 2026-04 |
| Ingestion | Sequential pipeline, diff-aware with HEAD/ETag checks | 2026-04 |
| Dedup | Unique composite index (source_type, plan_id, drug_id) + existence checks | 2026-04 |
| Articles | GPT-4o-mini for curation (picks top 3-5) + summarization — $9-45/month | 2026-04 |
| Retention | Tiered: 7d news, 90d premium (journals/FDA) | 2026-04 |
| QHP headers | Flexible CSV parsing (space/underscore variants) for CMS format changes | 2026-04 |
| Insurer creation | Auto-created during ingestion from contract names (PUF) and issuer IDs (QHP) | 2026-04 |
| No mock data | Real API calls always. Synthetic "not covered" only when no formulary entry exists. | 2026-04 |
