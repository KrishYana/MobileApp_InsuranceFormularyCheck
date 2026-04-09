# PlanScanRx — Implementation Plan

> **Repos**: Frontend (`MobileApp_InsuranceFormularyCheck/PlanScanRx`), Backend (`Backend_InsuranceFormularyCheck`)
> **Architecture docs**: `Frontend_Architecture.md`, `Backend_Architecture.md`

---

## Current State (as of 2026-04-08)

### Completed
- [x] Neumorphic design system (theme, shadows, typography, 16 primitives)
- [x] Auth (Google + Apple + Guest via Supabase)
- [x] Data ingestion: RxNorm (27K drugs), OpenFDA (159K NDCs), CMS Part D (17.7M entries, 5.5K plans), QHP partial (109K entries, 1.8K plans)
- [x] Core lookup flow: Insurer → Plan → Drug → Coverage (6 screens)
- [x] Brand→generic auto-resolution in GetCoverage
- [x] Discover feed: GPT-curated articles (3-5/day), personalized by drug class
- [x] Settings section: 5 screens + preferences store + theme persistence
- [x] Splash: native animated, prefetches articles
- [x] Home dashboard: scrollable with lookup CTA + discover preview + insights button
- [x] Insights backend: top drugs/insurers/plans, coverage success rate, weekly trends
- [x] UI polish: NeuInset soft shadows, dark mode fix, press feedback, letter-spacing

### Data Volumes
| Table | Records | Source |
|-------|---------|--------|
| drugs | 27,390 | RxNorm |
| drug_ndc_maps | 159,312 | OpenFDA |
| insurers | 724 (542 unique names) | CMS PUF + QHP |
| plans | 7,827 (5,528 national + 2,299 state-specific) | CMS PUF + QHP |
| formulary_entries | ~17.8M | CMS PUF + QHP |
| articles | 3-5/day | RSS + PubMed (GPT curated) |

---

## Workstream 1: Search & Plan Identification (Critical Path)

These tasks are sequential — each builds on the previous.

### 1.1 Backend: Deduplicate insurer display
> **Problem**: 724 insurer records but only 542 unique names. "UNITEDHEALTHCARE INSURANCE COMPANY" appears 5x (different CMS contract IDs). Physicians see duplicates.
> **Files**: `internal/handler/plan.go`

- [ ] Modify `GetInsurers` to `GROUP BY insurer_name` and aggregate plan counts across all contract IDs sharing the same name
- [ ] Return a single insurer entry per unique name with `planCount` as the sum across all matching insurer IDs
- [ ] When physician selects an insurer, the plan query should fetch plans from ALL insurer records with that name (not just one ID)
- [ ] Modify `GetPlans` to accept `insurer_name` as an alternative to `insurer_id` for the grouped flow

### 1.2 Backend: State-sectioned insurer results
> **Problem**: National Part D plans (state_code=NULL) show alongside state-specific QHP plans with no distinction. 5,528 national plans flood every state's results.
> **Files**: `internal/handler/plan.go`, `internal/dto/plan.go`

- [ ] Add a `section` field to the insurer response: `"state_specific"` or `"national"`
- [ ] Return state-specific insurers first (QHP with matching state_code), then national (Part D with NULL state_code) as a separate group
- [ ] Frontend: render two sections with headers "Plans in {State}" and "National Plans (Medicare Part D)"

### 1.3 Backend: Implement Group ID plan lookup
> **Problem**: `GET /plans/lookup/group` returns 404 (not implemented). Physicians with commercial insurance need to look up by group ID from the patient's insurance card.
> **Files**: `internal/handler/plan.go`, `ent/schema/plan.go`

- [ ] Add `group_id` field to Plan schema (string, optional, indexed)
- [ ] Populate group_id during QHP ingestion if available in plan JSON
- [ ] Implement `LookupGroupPlan` handler: query by group_id, return matching plan(s)
- [ ] If group_id not in QHP data, consider adding a manual mapping table or fuzzy search by plan name

### 1.4 Frontend: Tabbed plan search (Browse | Group ID | Medicare | HIOS)
> **Problem**: Current flow only supports browsing by insurer name. No UI for Group ID or Medicare-specific lookups.
> **Files**: `src/screens/search/InsurerSelectionScreen.tsx`, `src/screens/search/PlanSelectionScreen.tsx`

- [ ] Replace single insurer browse with tabbed interface: `Browse | Group ID | Medicare | HIOS`
- [ ] **Browse tab**: current insurer search + plan selection flow (with dedup + sections from 1.1/1.2)
- [ ] **Group ID tab**: single text input + "Find Plan" button, calls `GET /plans/lookup/group`
- [ ] **Medicare tab**: 3 fields (Contract ID, Plan ID, Segment ID) + "Find Plan", calls `GET /plans/lookup/medicare`
- [ ] **HIOS tab**: single text input (14-char HIOS ID) + "Find Plan", calls `GET /plans/lookup/hios`
- [ ] All tabs: on plan found, navigate to plan confirmation then add to basket

### 1.5 Frontend: Multi-plan comparison basket
> **Problem**: Current flow locks into one insurer → one plan → one drug. Physicians need to compare coverage across 2-5 plans from different insurers for the same drug.
> **Files**: `src/stores/appStore.ts`, `src/screens/home/HomeScreen.tsx`, `src/screens/search/*`, `src/navigation/types.ts`

- [ ] Add `planBasket: Plan[]` to appStore (session state, max 5 plans)
- [ ] Add `addToBasket`, `removeFromBasket`, `clearBasket` actions
- [ ] Home screen: show basket chips above CTA when plans are added (e.g., `[UHC PPO ×] [BCBS Gold ×]`)
- [ ] After plan selection (any tab), add plan to basket instead of navigating directly to drug search
- [ ] Show "[+ Add Another Plan]" button + "[Search Drug →]" button when basket has ≥1 plan
- [ ] Drug search: when basket has multiple plans, use `GetCoverageMulti` with all plan IDs
- [ ] Coverage comparison screen: show side-by-side coverage for all plans in basket

### 1.6 Frontend: Insurer display with sections
> **Problem**: Frontend insurer list doesn't distinguish state-specific from national plans.
> **Files**: `src/screens/search/InsurerSelectionScreen.tsx`

- [ ] Parse `section` field from backend response
- [ ] Render SectionList with "Plans in {state}" header and "National Plans" header
- [ ] State-specific section at top, national section below
- [ ] Show plan count badge per insurer (from grouped/deduplicated response)

---

## Workstream 2: Discover Feed Fixes (Independent)

These tasks are independent of Workstream 1.

### 2.1 Backend: Replace STAT News with free sources
> **Problem**: STAT News articles show "STAT+:" paywalled content. FiercePharma returns 0 articles. Healio fails to parse.
> **Files**: `api_integrations/articles/rss.go`

- [ ] Remove STAT News from `DefaultFeeds()`
- [ ] Add Medpage Today RSS: `https://www.medpagetoday.com/rss/headlines.xml`
- [ ] Add Reuters Health / Pharmacy Times or similar free medical news RSS
- [ ] Test each new feed: verify articles parse correctly and aren't paywalled
- [ ] Fix FDA Safety RSS URL (currently returns 404 — URL may have changed)
- [ ] Add filter in `CollectCandidates`: skip articles where title starts with known paywall prefixes (e.g., "STAT+:")

### 2.2 Backend: Clear existing paywalled articles
> **Files**: `cmd/articles/main.go` or one-time SQL

- [ ] Delete existing STAT News articles from DB: `DELETE FROM articles WHERE source_name = 'STAT News'`
- [ ] Re-run `/articles` to ingest from new free sources

---

## Workstream 3: QHP Data Expansion (Independent)

### 3.1 Backend: Batch QHP issuer crawl
> **Problem**: Full 346-issuer crawl times out. Only ~36 issuers successfully ingested.
> **Files**: `api_integrations/qhp/ingest.go`, `cmd/ingest/main.go`

- [ ] Implement batched crawl: process issuers in groups of 20-30 with a pause between batches
- [ ] Add per-issuer timeout (60s) to prevent one slow issuer from blocking the batch
- [ ] Log and skip issuers whose JSON files are >50MB (dental plans with huge provider networks)
- [ ] Add a `--qhp-batch-size` flag to the ingest command
- [ ] Run batches incrementally: first batch (issuers 1-30), second (31-60), etc.

### 3.2 Backend: Set QHP_MRPUF_URL permanently
> **Problem**: Currently served via local HTTP. Needs to be a stable URL.
> **Files**: `.env`, `docker-compose.yml`

- [ ] Convert the xlsx→csv conversion into a script that runs before ingestion
- [ ] Or: host the converted CSV on the MinIO instance and point QHP_MRPUF_URL there
- [ ] Or: add xlsx parsing support to the Go discovery code (excelize library)

---

## Workstream 4: Coverage Results Enhancement (Independent)

### 4.1 Frontend: Show "Covered as generic" banner
> **Problem**: Backend now returns `resolvedViaGeneric: true` + `genericDrugName` but frontend doesn't display it.
> **Files**: `src/screens/search/CoverageResultScreen.tsx`

- [ ] When `entry.resolvedViaGeneric === true`, show info banner below status card:
  "Covered as generic {genericDrugName}. Branded formulation is not on the formulary."
- [ ] Use NeuInset with accent/info color for the banner
- [ ] Update the "View Alternatives" button label to "View Generic & Alternatives"

### 4.2 Frontend: Build Drug Alternatives screen
> **Problem**: Alternatives screen exists as a route but has no real implementation.
> **Files**: `src/screens/search/DrugAlternativesScreen.tsx`

- [ ] Call `GET /drugs/{id}/alternatives?plan_id={planId}`
- [ ] Group results by `relationshipType`: GENERIC_EQUIVALENT first, then THERAPEUTIC_ALTERNATIVE, then BIOSIMILAR
- [ ] Show coverage status badge (covered/not_covered) and tier name for each alternative
- [ ] Tap an alternative to check full coverage on the same plan

### 4.3 Frontend: Build Prior Auth / Step Therapy / Quantity Limit detail screens
> **Files**: `src/screens/search/PriorAuthDetailScreen.tsx`, `StepTherapyDetailScreen.tsx`, `QuantityLimitDetailScreen.tsx`

- [ ] Prior Auth: display criteria cards grouped by type (DIAGNOSIS, AGE, PRIOR_MEDICATION, etc.)
- [ ] Step Therapy: show prerequisite drug list with inline coverage status
- [ ] Quantity Limit: structured breakdown (max_quantity, period_days, computed monthly rate)

---

## Workstream 5: Insights Tab (Independent)

### 5.1 Frontend: Build Insights screen
> **Problem**: Backend endpoints are ready (`/insights/summary`, `/insights/trends`). Frontend is a placeholder.
> **Files**: `src/screens/insights/InsightsScreen.tsx` (new)

- [ ] Top section: total lookups count + coverage success rate percentage
- [ ] Top drugs: list of 5 most-searched drugs with search count
- [ ] Top insurers: list of 5 most-searched insurers with count
- [ ] Top plans: list of 5 most-searched plans with count
- [ ] Trends chart: weekly lookup counts (last 12 weeks) — simple bar chart or sparkline
- [ ] Requires authentication — show GuestGate for unauthenticated users

---

## Workstream 6: Polish & Infrastructure (Independent)

### 6.1 Frontend: Replace emoji icons with vector icons
> **Problem**: Emoji render inconsistently across Android devices.
> **Files**: Multiple screens + `MainTabNavigator.tsx`

- [ ] Install `react-native-vector-icons`
- [ ] Replace emoji in: tab bar, settings rows, home CTA, empty states, article source badges
- [ ] Update `NeuIconWell` to accept both string (emoji) and ReactNode (icon component) children

### 6.2 Frontend: Fix NeuIconWell visibility
> **Problem**: NeuIconWell renders same-color-on-same-color (invisible on the neumorphic surface).
> **Files**: `src/components/primitives/NeuIconWell.tsx`

- [ ] Add a subtle inner shadow or border to make the well visible against the surface
- [ ] Or use a slightly darker background color (2-3% darker than surface)

### 6.3 Security: Rotate exposed API keys
> **Problem**: OpenAI API key and Supabase credentials were exposed in conversation.

- [ ] Rotate OpenAI API key at platform.openai.com/api-keys
- [ ] Update `.env` in backend repo with new key
- [ ] Consider rotating Supabase anon key (lower risk — it's RLS-scoped)

### 6.4 Backend: Schedule article ingestion
> **Problem**: `/articles` runs manually. Should be periodic.
> **Files**: `cmd/api/main.go` or Docker cron

- [ ] Add a background goroutine in the API server that runs article ingestion every 6 hours
- [ ] Or: add a cron container in docker-compose that runs `/articles` on schedule
- [ ] Ensure only one instance runs at a time (use sync_metadata as a lock)

---

## Dependency Graph

```
Workstream 1 (Search & Plan ID) — SEQUENTIAL:
  1.1 Dedup insurers
    → 1.2 State sections
      → 1.6 Insurer display sections (depends on 1.2)
  1.3 Group ID lookup (independent of 1.1/1.2)
  1.4 Tabbed plan search (depends on 1.1 + 1.2 + 1.3)
    → 1.5 Multi-plan basket (depends on 1.4)

Workstream 2 (Discover fixes) — INDEPENDENT of all others
  2.1 Replace RSS sources
    → 2.2 Clear old articles

Workstream 3 (QHP expansion) — INDEPENDENT of all others
  3.1 Batch crawl
  3.2 Stable QHP URL

Workstream 4 (Coverage enhancement) — INDEPENDENT of all others
  4.1 Generic banner
  4.2 Alternatives screen
  4.3 PA/ST/QL detail screens

Workstream 5 (Insights) — INDEPENDENT of all others
  5.1 Insights screen

Workstream 6 (Polish) — INDEPENDENT of all others
  6.1 Vector icons
  6.2 NeuIconWell fix
  6.3 Key rotation
  6.4 Article scheduling
```

---

## Suggested Execution Order

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| **P0** | 2.1 Replace paywalled RSS sources | 30min | Visible to all users |
| **P0** | 1.1 Dedup insurer display | 1hr | Fixes broken insurer search |
| **P0** | 1.2 State-sectioned results | 1hr | Fixes state filter confusion |
| **P1** | 1.3 Group ID lookup | 2hr | Unlocks commercial plan search |
| **P1** | 1.4 Tabbed plan search UI | 4hr | Core UX improvement |
| **P1** | 4.1 Generic resolution banner | 1hr | Explains coverage to physician |
| **P1** | 1.5 Multi-plan basket | 6hr | Key differentiating feature |
| **P2** | 4.2 Alternatives screen | 3hr | Completes coverage flow |
| **P2** | 5.1 Insights screen | 4hr | Backend ready, needs frontend |
| **P2** | 4.3 PA/ST/QL detail screens | 4hr | Completes detail views |
| **P2** | 6.3 Rotate API keys | 15min | Security hygiene |
| **P3** | 3.1 Batch QHP crawl | 3hr | More plan data |
| **P3** | 6.1 Vector icons | 2hr | Visual consistency |
| **P3** | 6.2 NeuIconWell fix | 30min | Design system fix |
| **P3** | 6.4 Article scheduling | 1hr | Ops automation |
| **P3** | 3.2 Stable QHP URL | 1hr | Ops reliability |
