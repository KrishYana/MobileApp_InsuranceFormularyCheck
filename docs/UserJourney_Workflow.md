# PlanScanRx — User Journey & Click-Branch Tree

## Entry Point

The app launches at `RootNavigator` which checks authentication state:
- Loading → spinner
- Not authenticated → AuthStack
- Authenticated (or guest) → MainTabNavigator

## Complete Click-Branch Tree

```
APP LAUNCH
├── Loading → Spinner
├── Not Authenticated → AuthStack
│   ├── SplashScreen (1.8s animated)
│   │   └── Auto-navigate → AuthLanding
│   └── AuthLandingScreen
│       ├── "Sign in with Apple" (iOS only) → Supabase auth → MainTabNavigator
│       ├── "Continue with Google" → Supabase auth → MainTabNavigator
│       ├── "Continue as Guest →" → Guest mode → MainTabNavigator
│       ├── Terms of Service (stub)
│       └── Privacy Policy (stub)
│
└── Authenticated → MainTabNavigator (tab bar hidden)
    │
    ├── HomeTab → HomeStack
    │   │
    │   ├── HomeScreen (scrollable dashboard)
    │   │   ├── [State Selector bar] → Opens state picker modal → saves to appStore
    │   │   ├── [Settings gear icon] → SettingsTab
    │   │   ├── [New Formulary Lookup CTA] → InsurerSelection
    │   │   ├── [Discover article cards] (up to 3 previews)
    │   │   ├── [See All →] → DiscoverTab
    │   │   ├── [View Insights CTA] → InsightsTab
    │   │   └── [Saved Lookups section] (expandable, placeholder)
    │   │
    │   ├── InsurerSelectionScreen — "Find Your Plan"
    │   │   │  Header: State bar + "Find Your Plan" title
    │   │   │  Tabs: [Browse] [Group ID] [Medicare] [HIOS]
    │   │   │
    │   │   ├── Tab: Browse
    │   │   │   ├── [Search bar] — filter insurers (debounced 200ms)
    │   │   │   ├── Section: "Plans in {State}" — local insurers
    │   │   │   │   └── [Insurer card] → PlanSelection { insurer }
    │   │   │   ├── [Show/Hide national plans] toggle button
    │   │   │   └── Section: "National Plans (Medicare Part D)" — national insurers
    │   │   │       └── [Insurer card] → PlanSelection { insurer }
    │   │   │
    │   │   ├── Tab: Group ID
    │   │   │   ├── [Group ID input] (required)
    │   │   │   ├── [Plan ID input] (optional)
    │   │   │   │   Helper: "If provided, skips plan selection"
    │   │   │   ├── [Find Plan button]
    │   │   │   │   ├── With Plan ID → add to basket → DrugSearch
    │   │   │   │   └── Without Plan ID → PlanSelection
    │   │   │   └── Error: "Plan not found" card with retry
    │   │   │
    │   │   ├── Tab: Medicare
    │   │   │   ├── [Contract ID input] (required, e.g. H1234)
    │   │   │   ├── [Plan ID input] (required, e.g. 001)
    │   │   │   ├── [Segment ID input] (required, e.g. 000)
    │   │   │   ├── [Find Plan button] → add to basket → DrugSearch
    │   │   │   └── Error: "Plan not found" card
    │   │   │
    │   │   └── Tab: HIOS
    │   │       ├── [HIOS Plan ID input] (14 chars max)
    │   │       ├── [Find Plan button] → add to basket → DrugSearch
    │   │       └── Error: "Plan not found" card
    │   │
    │   ├── PlanSelectionScreen — "Select Plan"
    │   │   ├── Header: insurer name + plan count
    │   │   ├── [Search bar] — filter plans (debounced 200ms)
    │   │   └── [Plan card] (name, type, market, year)
    │   │       └── Tap → add to basket → DrugSearch { planId, planName }
    │   │
    │   ├── DrugSearchScreen — "Search Drug"
    │   │   ├── Header: "Search Drug" + [New Session] button (red, top-right)
    │   │   │   └── New Session → clearBasket() + popToTop() → Home
    │   │   ├── [Plan basket chips] (horizontal scroll, removable with X)
    │   │   │   └── Each chip: plan name + [X remove] button
    │   │   ├── [+ Add more plans] link (blue text) → InsurerSelection
    │   │   ├── [Drug search bar] (min 2 chars, debounced 300ms, auto-focused)
    │   │   ├── [Drug result item]
    │   │   │   ├── Single formulation → navigate based on basket:
    │   │   │   │   ├── 1 plan → CoverageResult { planId, drugId }
    │   │   │   │   └── 2+ plans → CoverageComparison { planIds, drugId }
    │   │   │   └── Multiple formulations → open Formulation Picker modal
    │   │   │       └── [Formulation item] → navigate (same logic)
    │   │   └── Empty states: "Start typing", "No drugs matching", error with retry
    │   │
    │   ├── CoverageComparisonScreen — "Coverage Comparison"
    │   │   ├── Summary: "Covered by X of Y plans" + progress bar
    │   │   └── [Comparison row] per plan (status badge, tier, copay)
    │   │       └── Tap → CoverageResult { planId, drugId }
    │   │
    │   ├── CoverageResultScreen
    │   │   ├── Status card: COVERED (green) or NOT COVERED (red)
    │   │   ├── Tier display (level + name)
    │   │   ├── Cost display (copay, coinsurance, mail order)
    │   │   ├── Restriction badges (PA, ST, QL, Specialty)
    │   │   ├── [Prior Auth Detail] button (if required)
    │   │   │   └── → PriorAuthDetail { entryId, drugName, planName }
    │   │   ├── [Step Therapy Detail] button (if required)
    │   │   │   └── → StepTherapyDetail { entryId, drugName, planName }
    │   │   ├── [Quantity Limit Detail] button (if applicable)
    │   │   │   └── → QuantityLimitDetail { entryId, drugName, planName, detail }
    │   │   ├── [View Alternatives] button (always)
    │   │   │   └── → DrugAlternatives { drugId, planId, drugName }
    │   │   └── [Share Results] button → native Share sheet
    │   │
    │   ├── PriorAuthDetailScreen
    │   │   ├── [← Back] → CoverageResult
    │   │   ├── Summary banner
    │   │   ├── Criteria cards by type (Age, Gender, Diagnosis, Prior Med, Lab, Provider, Quantity)
    │   │   └── [View Source Document] → Linking.openURL()
    │   │
    │   ├── StepTherapyDetailScreen
    │   │   ├── [← Back] → CoverageResult
    │   │   ├── Prerequisite drug list (cards with pill icons)
    │   │   ├── Additional info section
    │   │   └── [View Source Document] → Linking.openURL()
    │   │
    │   ├── QuantityLimitDetailScreen
    │   │   ├── [← Back] → CoverageResult
    │   │   ├── Limit card (timer icon + detail text)
    │   │   └── Exception callout (how to request higher qty)
    │   │
    │   └── DrugAlternativesScreen
    │       ├── [← Back] → CoverageResult
    │       ├── Grouped sections (expandable):
    │       │   ├── Generic Equivalents
    │       │   ├── Therapeutic Alternatives
    │       │   └── Biosimilars
    │       └── Each alternative:
    │           ├── Drug name + details + coverage badge
    │           └── [View Full Coverage] → CoverageResult { planId, altDrugId }
    │
    ├── DiscoverTab → DiscoverScreen
    │   ├── Header: "Discover" + "Latest medical news tailored to your practice"
    │   ├── [Article card] list (pull-to-refresh)
    │   └── Empty/Error/Loading states
    │
    ├── InsightsTab → InsightsScreen (wrapped in GuestGate)
    │   ├── Guest → "Sign in to see your insights" prompt
    │   └── Authenticated:
    │       ├── Hero: Total Lookups (accent) + Coverage Success Rate % (green)
    │       ├── Weekly Trends bar chart (last 12 weeks)
    │       ├── Top 5 Drugs (ranked list with count)
    │       ├── Top 5 Insurers (ranked list)
    │       ├── Top 5 Plans (ranked list)
    │       └── Pull-to-refresh
    │
    └── SettingsTab → SettingsStack
        ├── SettingsScreen
        │   ├── Account section (if authenticated):
        │   │   └── [Profile row] → ProfileScreen
        │   ├── Preferences:
        │   │   ├── [Light|Dark|System] appearance selector
        │   │   ├── [Notifications row] → NotificationsScreen
        │   │   └── [Data & Storage row] → DataRetentionScreen
        │   ├── About:
        │   │   └── [About & Legal row] → AboutLegalScreen
        │   └── Actions:
        │       ├── [Sign Out] (auth) → AuthStack
        │       ├── [Delete Account] (auth) → confirmation alert (stub)
        │       └── [Sign In] (guest) → AuthStack
        │
        ├── ProfileScreen (auth only)
        │   ├── [← Back] → Settings
        │   ├── Avatar + display name + email + auth provider
        │   └── [Edit Profile] button (stub)
        │
        ├── NotificationsScreen
        │   ├── [← Back] → Settings
        │   ├── [Push Notifications] toggle (master)
        │   ├── [Formulary Changes] toggle (disabled if master off)
        │   └── [Price Change Alerts] toggle (disabled if master off)
        │
        ├── DataRetentionScreen
        │   ├── [← Back] → Settings
        │   ├── Search History:
        │   │   ├── Retention picker (Forever|90D|30D|Off)
        │   │   └── [Clear Search History] → confirmation alert (stub)
        │   └── Saved Lookups:
        │       ├── Retention picker (Forever|90D|30D|Off)
        │       └── [Clear Saved Lookups] → confirmation alert (stub)
        │
        └── AboutLegalScreen
            ├── [← Back] → Settings
            ├── App info card (PlanScanRx v0.1.0)
            ├── [Terms of Service] (stub)
            ├── [Privacy Policy] (stub)
            └── [Open Source Licenses] (stub)
```

## Key User Flows

### Flow 1: Browse Insurer → Plan → Drug → Coverage
Home → InsurerSelection (Browse tab) → search/select insurer → PlanSelection → select plan (adds to basket) → DrugSearch → search drug → CoverageResult

### Flow 2: Medicare Lookup → Drug → Coverage
Home → InsurerSelection (Medicare tab) → enter Contract+Plan+Segment IDs → Find Plan (adds to basket, auto-nav) → DrugSearch → search drug → CoverageResult

### Flow 3: Group ID with Plan ID → Drug → Coverage
Home → InsurerSelection (Group ID tab) → enter Group ID + Plan ID → Find Plan (adds to basket, auto-nav) → DrugSearch → search drug → CoverageResult

### Flow 4: Multi-Plan Comparison
1. Start any flow above to add first plan to basket
2. On DrugSearch, tap "+ Add more plans"
3. Returns to InsurerSelection, add second plan
4. Back on DrugSearch with 2 plan chips
5. Search drug → CoverageComparison (side-by-side)
6. Tap any row → CoverageResult for that plan

### Flow 5: New Session (Patient Reset)
DrugSearch → tap "New Session" (red, top-right) → clears plan basket → popToTop → Home

## State Persistence

| State | Scope | Storage | Cleared |
|-------|-------|---------|---------|
| selectedState | Global | AsyncStorage | Never (user changes) |
| planBasket | Session | In-memory (Zustand) | "New Session" button or app restart |
| planFilters | Session | In-memory | clearPlanFilters() |
| themeMode | Global | AsyncStorage | resetSettings() |
| notifications | Global | AsyncStorage | resetSettings() |
| retention prefs | Global | AsyncStorage | resetSettings() |

## Guest vs Authenticated

| Feature | Guest | Authenticated |
|---------|-------|---------------|
| Browse/search insurers | Yes | Yes |
| Plan lookups (Medicare/HIOS/Group) | Yes | Yes |
| Drug search + coverage | Yes | Yes |
| Discover articles | Yes (chronological) | Yes (personalized) |
| Insights | No (GuestGate) | Yes |
| Search history | No | Yes (auto-recorded) |
| Saved lookups | No | Yes |
| Profile | No | Yes |
| Settings | Yes (no account section) | Yes (full) |
