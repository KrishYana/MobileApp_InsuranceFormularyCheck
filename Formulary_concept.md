# PlanScanRx: Frontend Implementation Tracker

> **Full backend architecture**: See git history for original `Formulary_concept.md` with DB schema, ingestion pipelines, and data volumes.
> **Frontend architecture**: See `Frontend_Architecture.md` for design system, file structure, and decisions.
> **User journey workflow**: See `docs/UserJourney_Workflow.md` for all screen specs and state permutations.

---

## Data Sources (what the frontend consumes)

All API endpoints are defined in `src/api/services/formulary.service.ts`:

- [x] **States** — 50 states + DC, hardcoded in `constants/states.ts`
- [x] **Insurers** — `GET /states/{code}/insurers`, sorted by popularity. Hook: `useInsurers`
- [x] **Plans** — `GET /insurers/{id}/plans?state={code}`. Hook: `usePlans`
- [x] **Plan Lookup** — `GET /plans/lookup/medicare`, `/hios`, `/group`. Hooks: `usePlanLookup` (3 mutations)
- [x] **Drugs** — `GET /drugs/search?q={query}`, autocomplete. Hook: `useDrugSearch`
- [x] **Coverage (single)** — `GET /plans/{id}/drugs/{id}/coverage`. Hook: `useCoverage`
- [x] **Coverage (multi)** — `GET /drugs/{id}/coverage?plan_ids=`. Hook: `useCoverageMulti`
- [x] **Prior Auth Criteria** — `GET /coverage/{entryId}/prior-auth`. Hook: not yet created
- [x] **Drug Alternatives** — `GET /drugs/{id}/alternatives`. Hook: not yet created
- [ ] **RxNorm** — drug name search, NDC resolution (via backend proxy). Not yet integrated.

---

## Domain Types (frontend models)

All defined in `src/types/domain.ts` — 8 types:

- [x] `Drug`, `Insurer`, `Plan`, `FormularyEntry`, `PriorAuthCriteria`, `DrugAlternative`, `SavedLookup`, `SearchHistoryEntry`

---

## Screens — Implementation Status

### Auth & Onboarding
- [x] Splash Screen — mp4 video → auth routing
- [x] Auth Landing — Google + Apple + Guest (neumorphic, declarative auth switch)
- [x] Guest Lock Overlay (`GuestGate` composite)

### Core Lookup Flow (complete end-to-end)
- [x] State Selection — persistent `StateSelectorBar` header (not a separate screen)
- [x] Insurer Selection — multi-select max 3, inline search, popularity-sorted, removable chips
- [x] Plan Selection — 4-tab identification (Search/Medicare/HIOS/Group), sequential stepper, confirm cards, skip insurer
- [x] Drug Search — autocomplete (2 char min, 300ms debounce), tabs (Search/Recent), formulation selector modal, highlighted match text
- [x] Coverage Results (Single Plan) — all 21 permutations (A1-A8 + specialty, B1-B2, C1-C3), restriction badges, tier display, cost display, freshness banner, share, detail links
- [x] Coverage Comparison (Multi-Plan) — summary bar (covered X of Y + progress bar), comparison rows with status/tier/cost, tap to single-plan detail

### Result Detail Screens (NOT YET BUILT)
- [ ] Prior Auth Detail — criteria cards by type (AGE, DIAGNOSIS, PRIOR_MEDICATION, LAB_RESULT, PROVIDER_TYPE, QUANTITY)
- [ ] Step Therapy Detail — prerequisite drug list with inline coverage status per drug
- [ ] Quantity Limit Detail — structured breakdown (max_quantity, period_days, monthly rate)
- [ ] Drug Alternatives — grouped by GENERIC_EQUIVALENT / THERAPEUTIC_ALTERNATIVE / BIOSIMILAR

### New Features (NOT YET BUILT — placeholders exist)
- [ ] Discover Screen — medical news tailored to physician's most prescribed drugs
- [ ] Key Insights Screen — prescription tendencies + insurer-level alternative recommendations

### Secondary Features (NOT YET BUILT)
- [ ] Search History — lives as section on Home screen (reverse-chronological, swipe delete)
- [ ] Saved Lookups — lives as section on Home screen (CRUD, pull-to-refresh, stale indicators)
- [ ] Saved Lookup Detail — coverage results + change history + management
- [ ] Plan Comparison Builder — cross-insurer drug comparison

### Settings & Profile (NOT YET BUILT)
- [ ] Settings — toggles, pickers, destructive actions
- [ ] Profile — NPI verification, edit fields
- [ ] About/Legal — CMS disclaimers

---

## Navigation Structure

```
RootNavigator (declarative auth switch)
  AuthStack
    SplashScreen → AuthLandingScreen
  MainTabNavigator (5 tabs)
    DiscoverTab → DiscoverScreen (placeholder)
    SearchTab → SearchStack
      InsurerSelectionScreen
      PlanSelectionScreen
      DrugSearchScreen
      CoverageResultScreen
      CoverageComparisonScreen
      (PA/ST/QL/Alternatives detail screens — not yet registered)
    HomeTab (elevated center) → HomeScreen (Recent Searches + Saved Lookups sections)
    InsightsTab → InsightsScreen (placeholder)
    SettingsTab → SettingsScreen (placeholder)
```

---

## MVP Phasing (frontend implications)

### Phase 1: Medicare Part D (current)
- [x] Core lookup flow screens (all 6 built)
- [x] Drug search + coverage results
- [ ] Market type filter: only "Medicare" enabled, others show "Coming Soon"
- [ ] Result detail screens (PA, ST, QL, Alternatives)
- [ ] Saved Lookups + Search History (Home screen sections)

### Phase 2-5: See `Frontend_Architecture.md` for full phasing.

---

## Key Technical Risks (frontend)

- **Data freshness**: FreshnessIndicator (dot/badge/banner) built and used on Coverage Results. Push notifications not yet implemented.
- **Drug name ambiguity**: Rich autocomplete with highlighted match text built. RxNorm fallback not yet integrated.
- **Plan identification**: 4 lookup methods built (search, Medicare 3-field, HIOS, Group ID).
- **Offline support**: TanStack Query offlineFirst configured. Offline banner not yet built.
- **Guest mode**: GuestGate lock overlay built. Upgrade path (guest → auth without data loss) not yet implemented.
