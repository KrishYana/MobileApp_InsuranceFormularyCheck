# PlanScanRx -- Frontend Architecture

## 1. Project Overview

| Attribute | Detail |
|-----------|--------|
| **App** | PlanScanRx |
| **Platform** | React Native 0.78.2 (TypeScript) -- iOS + Android |
| **Design System** | Neumorphic (Soft UI) -- `#E0E5EC` base surface, dual shadows, `#6C63FF` violet accent |
| **Fonts** | Plus Jakarta Sans (display/titles) + DM Sans (body) |
| **State** | TanStack React Query (server) + Zustand (client) + React Context (auth/theme/toast) |
| **Navigation** | React Navigation v7 -- AuthStack + MainTabNavigator (tab bar hidden) + HomeStack + SettingsStack |
| **API** | Axios client with typed service layer, real endpoints, no mock data |
| **Icons** | react-native-vector-icons (MaterialCommunityIcons + Ionicons) via `AppIcon` component |
| **Tests** | Jest + React Native Testing Library -- 17 suites, 224 tests |
| **Source** | `PlanScanRx/src/` -- 98+ TypeScript/TSX files |

---

## 2. Directory Structure

```
PlanScanRx/src/
├── api/
│   ├── client.ts                          # Axios instance, interceptors, auth headers
│   └── services/
│       └── formulary.service.ts           # All API methods (15 endpoints)
│
├── components/
│   ├── composites/ (13 files)             # Domain-specific components
│   │   ├── ArticleCard.tsx
│   │   ├── ComparisonRow.tsx
│   │   ├── CostDisplay.tsx
│   │   ├── DrugAutocompleteItem.tsx
│   │   ├── GuestGate.tsx
│   │   ├── InsurerCard.tsx
│   │   ├── PlanConfirmCard.tsx
│   │   ├── RestrictionBadgeRow.tsx
│   │   ├── SettingsRow.tsx
│   │   ├── StateSelectorBar.tsx
│   │   ├── TierDisplay.tsx
│   │   └── index.ts
│   │
│   └── primitives/ (19 files)             # Reusable base components
│       ├── AppIcon.tsx (Icon.tsx)
│       ├── Badge.tsx
│       ├── Breadcrumb.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── ExpandableSection.tsx
│       ├── FilterChips.tsx
│       ├── FreshnessIndicator.tsx
│       ├── LoadingState.tsx
│       ├── NeuIconWell.tsx
│       ├── NeuInset.tsx
│       ├── NeuSurface.tsx
│       ├── Picker.tsx
│       ├── ScreenErrorBoundary.tsx
│       ├── SearchBar.tsx
│       ├── Tabs.tsx
│       ├── TextInput.tsx
│       ├── Toggle.tsx
│       └── index.ts
│
├── constants/
│   └── states.ts                          # US state list (code + name)
│
├── context/
│   ├── AuthContext.tsx                     # Supabase auth state + Google/Apple sign-in
│   └── ToastContext.tsx                    # Toast notification system
│
├── errors/
│   ├── AppError.ts                        # Error class hierarchy (Network, Auth, API, Validation)
│   └── errorLogger.ts                     # Dev console + prod Sentry/Crashlytics hook
│
├── hooks/
│   ├── queries/ (10 hooks)                # React Query wrappers
│   │   ├── useAlternativeCoverage.ts
│   │   ├── useAlternatives.ts
│   │   ├── useArticles.ts
│   │   ├── useCoverage.ts
│   │   ├── useCoverageMulti.ts
│   │   ├── useDrugSearch.ts
│   │   ├── useInsurers.ts
│   │   ├── usePlanLookup.ts
│   │   ├── usePlans.ts
│   │   └── usePriorAuthCriteria.ts
│   └── useDebounce.ts
│
├── navigation/
│   ├── AuthStack.tsx                      # Splash -> AuthLanding
│   ├── HomeStack.tsx                      # Home + full search funnel (11 screens)
│   ├── MainTabNavigator.tsx               # 4 tabs (tab bar hidden via display:'none')
│   ├── RootNavigator.tsx                  # Entry: auth check -> AuthStack or MainTab
│   ├── SearchStack.tsx                    # Legacy type alias (SearchStackParamList)
│   ├── SettingsStack.tsx                  # 5 settings screens
│   └── types.ts                           # All navigation param types
│
├── screens/
│   ├── SplashScreen.tsx                   # Animated splash (1.8s, prefetches articles)
│   ├── AuthLandingScreen.tsx              # Google + Apple + Guest sign-in
│   ├── home/
│   │   └── HomeScreen.tsx                 # Scrollable dashboard
│   ├── discover/
│   │   └── DiscoverScreen.tsx             # Article feed with pull-to-refresh
│   ├── insights/
│   │   └── InsightsScreen.tsx             # Metrics, trends, rankings (auth-gated)
│   ├── search/ (10 screens)               # The lookup funnel
│   │   ├── InsurerSelectionScreen.tsx     # 4-tab plan search (Browse|GroupID|Medicare|HIOS)
│   │   ├── PlanSelectionScreen.tsx        # Plan list for an insurer
│   │   ├── DrugSearchScreen.tsx           # Drug search with plan basket chips
│   │   ├── CoverageResultScreen.tsx       # Single-plan coverage detail
│   │   ├── CoverageComparisonScreen.tsx   # Multi-plan comparison
│   │   ├── DrugAlternativesScreen.tsx     # Grouped alternatives with coverage
│   │   ├── PriorAuthDetailScreen.tsx      # PA criteria cards
│   │   ├── StepTherapyDetailScreen.tsx    # Step therapy prerequisite list
│   │   ├── QuantityLimitDetailScreen.tsx  # QL detail + exception info
│   │   └── DrugFirstSearchScreen.tsx      # Alt flow (drug-first, not active)
│   └── settings/ (5 screens)
│       ├── SettingsScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── NotificationsScreen.tsx
│       ├── DataRetentionScreen.tsx
│       └── AboutLegalScreen.tsx
│
├── services/
│   ├── auth.ts                            # Google/Apple sign-in config
│   ├── storage.ts                         # AsyncStorage helpers
│   └── supabase.ts                        # Supabase client init
│
├── stores/
│   ├── appStore.ts                        # Zustand: selectedState, planBasket, planFilters
│   ├── queryClient.ts                     # React Query config + all queryKeys
│   └── settingsStore.ts                   # Zustand: theme, notifications, retention
│
├── theme/ (10 files)
│   ├── ThemeProvider.tsx
│   ├── animation.ts
│   ├── index.ts
│   ├── palette.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   ├── tokens.ts
│   ├── touchTarget.ts
│   └── typography.ts
│
├── types/
│   ├── auth.ts
│   ├── domain.ts
│   └── env.d.ts
│
└── utils/
    ├── coverageStatusResolver.ts
    ├── formatters.ts
    └── freshnessCalculator.ts
```

---

## 3. Navigation Architecture

### Graph

```
RootNavigator
│
├─ AuthStack (mode === null)
│   ├── Splash             animated intro, 1.8s, prefetches articles
│   └── AuthLanding         Google + Apple + Guest sign-in
│
└─ MainTabNavigator (mode !== null) -- tab bar hidden via display:'none'
    │
    ├── HomeTab --> HomeStack
    │   ├── Home                scrollable dashboard
    │   ├── InsurerSelection    4-tab plan search (Browse | GroupID | Medicare | HIOS)
    │   ├── PlanSelection       plan list per insurer
    │   ├── DrugSearch          plan basket chips + drug autocomplete
    │   ├── CoverageResult      single-plan coverage detail
    │   ├── CoverageComparison  multi-plan comparison table
    │   ├── DrugAlternatives    grouped alternatives with coverage status
    │   ├── PriorAuthDetail     prior authorization criteria cards
    │   ├── StepTherapyDetail   step therapy prerequisite list
    │   ├── QuantityLimitDetail QL detail + exception info
    │   └── DrugFirstSearch     alternate drug-first flow (inactive)
    │
    ├── DiscoverTab --> DiscoverScreen
    │       article feed, pull-to-refresh, article cards
    │
    ├── InsightsTab --> InsightsScreen
    │       metrics, trends, rankings (GuestGate-protected)
    │
    └── SettingsTab --> SettingsStack
        ├── Settings            main settings screen
        ├── Profile             user profile management
        ├── Notifications       notification preferences
        ├── DataRetention       search history + saved lookup retention
        └── AboutLegal          CMS disclaimers, ToS, privacy policy
```

### Key Routing Decisions

- **Auth switching is declarative.** `RootNavigator` reads `authMode` from `AuthContext`. When `mode === null`, the auth stack renders; otherwise, the main tabs render. There is no imperative `navigation.navigate('Login')` anywhere.
- **Tab bar is hidden.** `MainTabNavigator` sets `tabBarStyle: { display: 'none' }`. Navigation between top-level sections happens through the scrollable Home dashboard, not through visible tabs.
- **HomeStack owns the search funnel.** All 11 screens of the drug-lookup workflow live inside `HomeStack`, not a separate search stack. `SearchStack.tsx` exists only as a legacy type alias re-exporting `SearchStackParamList`.
- **SettingsStack is a nested navigator.** Five dedicated screens, each pushed onto the settings sub-stack.
- **Typed params throughout.** All `ParamList` types live in `navigation/types.ts`. Every `route.params` access is typed.

---

## 4. State Management

### 4.1 Server State -- TanStack React Query

Configuration (`stores/queryClient.ts`):

| Setting | Value |
|---------|-------|
| `staleTime` | 5 minutes |
| `gcTime` | 24 hours |
| `retry` | 2 (exponential backoff) |
| `networkMode` | `offlineFirst` |

Query key registry (also in `queryClient.ts`):

| Key | Used by |
|-----|---------|
| `insurers` | `useInsurers` |
| `plans` | `usePlans` |
| `drugs` | `useDrugSearch` |
| `coverage` | `useCoverage` |
| `coverageMulti` | `useCoverageMulti` |
| `alternatives` | `useAlternatives` |
| `alternativeCoverage` | `useAlternativeCoverage` |
| `priorAuth` | `usePriorAuthCriteria` |
| `articles` | `useArticles` |
| `insights` | `useInsightsSummary` / `useInsightsTrends` |
| `savedLookups` | (reserved) |
| `searchHistory` | (reserved) |

### 4.2 Client State -- Zustand

#### appStore (`stores/appStore.ts`)

```typescript
// Persisted to AsyncStorage:
selectedState: USState | null       // physician's primary licensing state

// Session-only (in-memory):
planBasket: Plan[]                  // plans for the current patient encounter (max 3)
planFilters: PlanFilters            // { planType, marketType, metalLevel, planYear }
isOnline: boolean                   // network reachability flag

// Actions:
setSelectedState(state)
setPlanFilters(filters)
clearPlanFilters()
addToBasket(plan)
removeFromBasket(planId)
clearBasket()
setIsOnline(flag)
```

#### settingsStore (`stores/settingsStore.ts`)

```typescript
// All persisted to AsyncStorage:
themeMode: 'light' | 'dark' | 'system'
notificationsEnabled: boolean
formularyAlerts: boolean
priceChangeAlerts: boolean
searchHistoryRetention: 'forever' | '90days' | '30days' | 'off'
savedLookupsRetention: 'forever' | '90days' | '30days' | 'off'

// Actions:
setThemeMode(mode)
setNotificationsEnabled(flag)
setFormularyAlerts(flag)
setPriceChangeAlerts(flag)
setSearchHistoryRetention(policy)
setSavedLookupsRetention(policy)
resetSettings()
```

### 4.3 Context Providers

| Context | Location | Purpose |
|---------|----------|---------|
| `AuthContext` | `context/AuthContext.tsx` | Supabase session, Google/Apple sign-in methods, guest mode, `useAuth()` hook |
| `ToastContext` | `context/ToastContext.tsx` | Toast notifications (replaces `Alert.alert()`), auto-dismiss, neumorphic card rendering, `useToast()` hook |
| `ThemeProvider` | `theme/ThemeProvider.tsx` | Resolved theme tokens (light/dark/system), `useTheme()` hook |

### 4.4 Provider Stack (App.tsx)

```
<QueryClientProvider>
  <AuthProvider>
    <ThemeProvider>
      <ToastProvider>
        <RootNavigator />
      </ToastProvider>
    </ThemeProvider>
  </AuthProvider>
</QueryClientProvider>
```

---

## 5. API Service Layer

### Client Configuration (`api/client.ts`)

| Setting | Value |
|---------|-------|
| Base URL (Android) | `http://10.0.2.2:8080/v1` |
| Base URL (iOS) | `http://localhost:8080/v1` |
| Base URL (prod) | `https://api.planscanrx.com/v1` |
| Timeout | 15 seconds |
| Auth (authenticated) | `Authorization: Bearer <JWT>` |
| Auth (guest) | `X-Guest-Mode: true` header |
| Response unwrap | `response.data?.data ?? response.data` |

Interceptors:
- **Request**: Injects auth token or guest header. Attaches `X-State-Code` when `selectedState` is set.
- **Response error**: Normalizes errors into `AppError` subclasses. Detects offline state.

### Endpoints (`api/services/formulary.service.ts`)

| Method | Signature | Returns |
|--------|-----------|---------|
| `getInsurers` | `(stateCode: string)` | `StateSectionedInsurers` |
| `getPlans` | `(insurerId: string, stateCode: string)` | `Plan[]` |
| `lookupPlanByMedicareId` | `(contractId, planId, segmentId)` | `Plan` |
| `lookupPlanByHiosId` | `(hiosId: string)` | `Plan` |
| `lookupPlanByGroupId` | `(groupId: string, planId?: string)` | `Plan` |
| `searchDrugs` | `(query: string)` | `Drug[]` |
| `getCoverage` | `(planId: string, drugId: string)` | `FormularyEntry` |
| `getCoverageMulti` | `(planIds: string[], drugId: string)` | `FormularyEntry[]` |
| `getAlternatives` | `(drugId: string, planId?: string)` | `DrugAlternative[]` |
| `getAlternativeCoverage` | `(alternativeId: string, planId: string)` | `FormularyEntry` |
| `getPriorAuthCriteria` | `(entryId: string)` | `PriorAuthCriteria[]` |
| `getArticles` | `()` | `Article[]` |
| `getInsightsSummary` | `()` | `InsightsSummary` |
| `getInsightsTrends` | `()` | `InsightsTrends` |

---

## 6. Hooks

### Query Hooks (`hooks/queries/`)

| Hook | Query Key | Stale Time | Notes |
|------|-----------|------------|-------|
| `useInsurers(stateCode)` | `['insurers', stateCode]` | 5 min | Enabled when stateCode is truthy |
| `usePlans(insurerId, stateCode)` | `['plans', insurerId, stateCode]` | 5 min | Enabled when both params set |
| `usePlanLookup()` | Mutations (3) | -- | `lookupMedicare`, `lookupHios`, `lookupGroup` |
| `useDrugSearch(query)` | `['drugs', query]` | 30 sec | Enabled when query.length >= 2 |
| `useCoverage(planId, drugId)` | `['coverage', planId, drugId]` | 5 min | Single plan+drug |
| `useCoverageMulti(planIds, drugId)` | `['coverageMulti', planIds, drugId]` | 5 min | Multi-plan comparison |
| `useAlternatives(drugId, planId?)` | `['alternatives', drugId, planId]` | 5 min | Grouped by category |
| `useAlternativeCoverage(altId, planId)` | `['alternativeCoverage', altId, planId]` | 5 min | Per-alternative detail |
| `usePriorAuthCriteria(entryId)` | `['priorAuth', entryId]` | 5 min | PA criteria cards |
| `useArticles()` | `['articles']` | 5 min | Discover feed |

### Utility Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useDebounce(value, delay)` | `hooks/useDebounce.ts` | Generic debounce for search inputs |

---

## 7. Screens

### Auth Flow

| Screen | File | Description |
|--------|------|-------------|
| Splash | `screens/SplashScreen.tsx` | Animated intro (1.8 seconds). Prefetches articles via `queryClient.prefetchQuery`. Auto-advances to AuthLanding. |
| AuthLanding | `screens/AuthLandingScreen.tsx` | Neumorphic logo card + three sign-in options: Google, Apple, Guest. On success, `AuthContext` sets `authMode`, triggering declarative switch to `MainTabNavigator`. |

### Home

| Screen | File | Description |
|--------|------|-------------|
| Home | `screens/home/HomeScreen.tsx` | Scrollable dashboard. `StateSelectorBar` at top. Hero CTA to start lookup. Recent searches section. Saved lookups section. Entry point to the full search funnel. |

### Search Funnel (10 screens in HomeStack)

| Screen | File | Description |
|--------|------|-------------|
| InsurerSelection | `screens/search/InsurerSelectionScreen.tsx` | 4-tab plan search: Browse (popularity-sorted list, multi-select max 3), GroupID (group ID input), Medicare (contract+plan+segment fields), HIOS (14-char ID). Removable chips for selected insurers. Sticky continue button. |
| PlanSelection | `screens/search/PlanSelectionScreen.tsx` | Sequential per-insurer stepper. Shows plans for each selected insurer. `PlanConfirmCard` for each plan. Skip removes that insurer. Auto-advances after last insurer confirmed. |
| DrugSearch | `screens/search/DrugSearchScreen.tsx` | Plan basket chips at top (selected plans). Drug autocomplete with 2-char min, 300ms debounce. Formulation selector modal. Highlighted match text in results. |
| CoverageResult | `screens/search/CoverageResultScreen.tsx` | Single-plan coverage detail. Handles all 21 result permutations. Status card with color-coded border. Tier circle display. Cost breakdown. Restriction badges (PA/ST/QL). Specialty info. Freshness banner. Share action. Links to PA/ST/QL detail screens and alternatives. |
| CoverageComparison | `screens/search/CoverageComparisonScreen.tsx` | Multi-plan comparison view. Summary bar (covered X of Y + progress bar). `ComparisonRow` cards for each plan. Tap any row to navigate to single-plan `CoverageResult`. |
| DrugAlternatives | `screens/search/DrugAlternativesScreen.tsx` | Alternatives grouped by category: GENERIC_EQUIVALENT, THERAPEUTIC_ALTERNATIVE, BIOSIMILAR. Each alternative shows inline coverage status. |
| PriorAuthDetail | `screens/search/PriorAuthDetailScreen.tsx` | Prior authorization criteria cards. Criteria organized by type: AGE, DIAGNOSIS, PRIOR_MEDICATION, LAB_RESULT, PROVIDER_TYPE, QUANTITY. |
| StepTherapyDetail | `screens/search/StepTherapyDetailScreen.tsx` | Step therapy prerequisite drug list. Each prerequisite shows inline coverage status. |
| QuantityLimitDetail | `screens/search/QuantityLimitDetailScreen.tsx` | Structured quantity limit breakdown: max_quantity, period_days, computed monthly rate. Exception request information. |
| DrugFirstSearch | `screens/search/DrugFirstSearchScreen.tsx` | Alternate entry flow starting with drug search before plan selection. Not currently active in main navigation. |

### Discover

| Screen | File | Description |
|--------|------|-------------|
| Discover | `screens/discover/DiscoverScreen.tsx` | Article feed with pull-to-refresh. `ArticleCard` composites. Content sourced from backend article aggregation (PubMed, FDA, RSS). |

### Insights

| Screen | File | Description |
|--------|------|-------------|
| Insights | `screens/insights/InsightsScreen.tsx` | Metrics, trends, and rankings. Protected by `GuestGate` (requires authentication). Prescription tendencies and insurer-level alternative recommendations. |

### Settings (5 screens in SettingsStack)

| Screen | File | Description |
|--------|------|-------------|
| Settings | `screens/settings/SettingsScreen.tsx` | Main settings hub. `SettingsRow` items for each category. Theme picker, notification toggles, data management, about/legal. |
| Profile | `screens/settings/ProfileScreen.tsx` | User profile management. Display name, specialty, licensing state. Logout action. |
| Notifications | `screens/settings/NotificationsScreen.tsx` | Notification preferences. Toggles for formulary alerts, price change alerts, general notifications. |
| DataRetention | `screens/settings/DataRetentionScreen.tsx` | Data retention policies. Pickers for search history and saved lookup retention periods. Clear data actions. |
| AboutLegal | `screens/settings/AboutLegalScreen.tsx` | CMS disclaimers, data source attributions, Terms of Service, privacy policy. App version info. |

---

## 8. Component Library

### 8.1 Neumorphic Primitives

| Component | File | Purpose |
|-----------|------|---------|
| `NeuSurface` | `primitives/NeuSurface.tsx` | Raised surface with dual-View layering. Light shadow top-left, dark shadow bottom-right. Used as the foundation for cards, buttons, and any element that "extrudes" from the surface. |
| `NeuInset` | `primitives/NeuInset.tsx` | Recessed surface via border overlay technique. Focus ring support (violet). Used for text inputs, active chips, toggle tracks, and any element "pressed into" the surface. |
| `NeuIconWell` | `primitives/NeuIconWell.tsx` | Deep inset circle container for icons. The "drilled into surface" look. Used in empty states, error states, and feature icons. |

### 8.2 UI Primitives (19 total)

| Component | Variants / Details |
|-----------|--------------------|
| `AppIcon` | Maps 35+ semantic icon names to MaterialCommunityIcons and Ionicons. Abstracts icon library from consumers. |
| `Badge` | Variants: coverage, restriction, tier, count, info. Neutral badges wrapped in `NeuSurface`. |
| `Breadcrumb` | `NeuSurface` pill chips with chevron separators. Used in multi-step flows. |
| `Button` | 4 variants (primary / secondary / tertiary / destructive), 3 sizes (sm / md / lg). `NeuSurface` wrapped. Animated press scale. Haptic feedback. |
| `Card` | Variants: default, elevated, status. `NeuSurface` base. Press animation. Optional color-coded status border. |
| `EmptyState` | `NeuIconWell` icon + headline + description + optional CTA button. |
| `ErrorState` | Variants: inline, card, fullscreen. Fullscreen uses `NeuIconWell`. Retry button included. |
| `ExpandableSection` | `LayoutAnimation`-based expand/collapse. Chevron rotation. |
| `FilterChips` | Horizontal `ScrollView`. Active chips use `NeuInset`, inactive use `NeuSurface`. Animated press scale. |
| `FreshnessIndicator` | Variants: dot, badge, banner. Banner uses `NeuInset`. Color-coded: green (fresh), amber (aging), red (stale), grey (unknown). |
| `LoadingState` | Variants: skeleton (`NeuSurface` rows with shimmer), spinner (`NeuSurface` circle), overlay. |
| `Picker` | `NeuSurface` trigger button + modal list. Selected items use `NeuInset`, unselected use `NeuSurface`. |
| `ScreenErrorBoundary` | Class component error boundary. Catches render errors in navigation stacks. Renders fullscreen `ErrorState`. |
| `SearchBar` | `NeuInset` container. Clear button. Error state styling. Debounced `onChangeText`. |
| `Tabs` | Pill-style tabs inside a `NeuInset` well. Active tab is extruded (`NeuSurface`) within the well. |
| `TextInput` | `NeuInset` at rest, `NeuInset` deep on focus. Violet focus ring. Label and error message support. |
| `Toggle` | Custom toggle (not system `Switch`). `NeuInset` track + `NeuSurface` thumb. Animated slide. |

### 8.3 Composites (13 total)

| Component | File | Purpose |
|-----------|------|---------|
| `ArticleCard` | `composites/ArticleCard.tsx` | Article card for the Discover feed. Source badge, title, summary, timestamp. |
| `ComparisonRow` | `composites/ComparisonRow.tsx` | Single plan row in the multi-plan comparison screen. Coverage badge + tier circle + cost summary + restriction count. Pressable to navigate to full detail. |
| `CostDisplay` | `composites/CostDisplay.tsx` | Copay, coinsurance, and mail-order cost rows. Handles null/missing values gracefully. |
| `DrugAutocompleteItem` | `composites/DrugAutocompleteItem.tsx` | Drug name with highlighted match text + subtitle (generic name, strength, form) + specialty/controlled substance badges. |
| `GuestGate` | `composites/GuestGate.tsx` | Lock overlay for guest-restricted features. Semi-transparent overlay (0.4 opacity) with lock badge. Triggers sign-in bottom sheet on tap. |
| `InsurerCard` | `composites/InsurerCard.tsx` | Insurer name + checkmark. Toggles between `NeuSurface` (unselected) and `NeuInset` (selected). |
| `PlanConfirmCard` | `composites/PlanConfirmCard.tsx` | Plan details (name, type, metal level) + badges + Confirm button. Used in sequential plan selection. |
| `RestrictionBadgeRow` | `composites/RestrictionBadgeRow.tsx` | Horizontal row of restriction badges (PA, ST, QL, Specialty, Controlled) generated from formulary entry flags. |
| `SettingsRow` | `composites/SettingsRow.tsx` | Settings list item. Icon + label + value/chevron/toggle. Pressable navigation row. |
| `StateSelectorBar` | `composites/StateSelectorBar.tsx` | Persistent header bar for state selection. `NeuInset` display. Opens searchable modal with all 50 states + DC. Selection cached in AsyncStorage via `appStore`. |
| `TierDisplay` | `composites/TierDisplay.tsx` | Tier number in a color-coded circle (green = low tier, amber = mid, red = high) + tier name label. `NeuInset` well container. |

---

## 9. Design System

### 9.1 Philosophy

Neumorphism creates physical depth through dual opposing shadows (light top-left, dark bottom-right) on monochromatic `#E0E5EC` backgrounds. Elements extrude from or are pressed into the same continuous surface. The result is tactile, calm, and physically grounded -- designed to reduce cognitive load for physicians during clinical workflows.

### 9.2 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | `#E0E5EC` | `#1E2530` | Base surface. All backgrounds. |
| `foreground` | `#3D4852` | `#E8EDF4` | Primary text. 7.5:1 WCAG AAA. |
| `muted` | `#6B7280` | -- | Secondary text. 4.6:1 WCAG AA. |
| `accent` | `#6C63FF` | `#6C63FF` | Violet. CTAs, focus rings, active states. |
| `accentLight` | `#8B84FF` | `#8B84FF` | Lighter violet for gradients/highlights. |
| `teal` | `#38B2AC` | `#38B2AC` | Success states, positive coverage indicators. |
| `shadowLight` | `rgba(255,255,255, 0.55)` | `rgba(42, 52, 70, 0.8)` | Top-left highlight shadow. |
| `shadowDark` | `rgba(163,177,198, 0.65)` | `rgba(10, 14, 20, 0.9)` | Bottom-right depth shadow. |

### 9.3 Shadow Depth Levels

| Level | Light Offset | Dark Offset | Blur | Use Case |
|-------|-------------|-------------|------|----------|
| Extruded | -9, -9 | +9, +9 | 16 | Default resting state for cards, buttons |
| Extruded Small | -5, -5 | +5, +5 | 10 | Smaller elements, list items, chips |
| Lifted | -12, -12 | +12, +12 | 20 | Hover / highlighted / pressed-up elements |
| Inset | -6, -6 | +6, +6 | 10 | Pressed state, shallow wells, active chips |
| Inset Deep | -10, -10 | +10, +10 | 20 | Text fields, icon wells, deep recesses |
| Inset Small | -3, -3 | +3, +3 | 6 | Toggle tracks, subtle depressions |

### 9.4 Spacing Scale

8-point base scale:

| Token | Value |
|-------|-------|
| `xxs` | 2 |
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `xxl` | 24 |
| `xxxl` | 32 |
| `huge` | 48 |

### 9.5 Corner Radii

| Token | Value | Usage |
|-------|-------|-------|
| `inner` | 12pt | Badges, chips, inner elements |
| `base` | 16pt | Buttons, inputs, medium components |
| `container` | 32pt | Cards, modals, large panels |
| `full` | 9999 | Pills, avatars, toggle tracks, circles |

Anti-pattern: Never use less than 12pt radii. Breaks the soft material illusion.

### 9.6 Typography

| Style | Font Family | Size | Weight |
|-------|-------------|------|--------|
| `display` | Plus Jakarta Sans | 40 | 800 (ExtraBold) |
| `title1` | Plus Jakarta Sans | 28 | 700 (Bold) |
| `title2` | Plus Jakarta Sans | 22 | 700 (Bold) |
| `title3` | Plus Jakarta Sans | 18 | 600 (SemiBold) |
| `body` | DM Sans | 16 | 400 (Regular) |
| `bodyMedium` | DM Sans | 16 | 500 (Medium) |
| `bodyBold` | DM Sans | 16 | 700 (Bold) |
| `label` | DM Sans | 14 | 500 (Medium) |
| `caption` | DM Sans | 13 | 400 (Regular) |
| `badge` | DM Sans | 11 | 700 (Bold) |
| `button` | DM Sans | 16 | 500 (Medium) |

### 9.7 Icon System

The `AppIcon` component (`primitives/AppIcon.tsx`) provides a unified icon interface mapping 35+ semantic names to icons from two underlying libraries:

- **MaterialCommunityIcons** -- used for most domain icons (pill, hospital, shield, etc.)
- **Ionicons** -- used for UI chrome icons (chevrons, search, settings, etc.)

Consumers reference icons by semantic name (e.g., `"coverage"`, `"insurer"`, `"prior-auth"`) rather than library-specific identifiers.

### 9.8 Animation

| Context | Spring Config | Press Scale |
|---------|---------------|-------------|
| Button | `damping: 12, stiffness: 200` | 0.97 |
| Card | `damping: 15, stiffness: 150` | 0.99 |
| Chip | -- | 0.95 |
| Modal | `damping: 20, stiffness: 120` | -- |

Shimmer animation is used for skeleton loading states. Reduce-motion is respected: when the system accessibility setting is enabled, spring animations and shimmer are skipped.

### 9.9 Accessibility

- WCAG AA minimum contrast. Primary text achieves 7.5:1 (AAA). Muted text achieves 4.6:1 (AA).
- 44px minimum touch targets on all interactive elements (`theme/touchTarget.ts`).
- `accessibilityLabel` on all interactive elements.
- Reduce motion: spring animations and shimmer disabled when system preference is set.
- Dynamic Type supported, with clamping on neumorphic-sensitive components where shadow scaling would break.

### 9.10 Anti-Patterns

- Never use opaque shadow colors (always use rgba with opacity).
- Never use white card backgrounds (always match the `#E0E5EC` surface).
- Never use flat buttons without depth.
- Never use corner radii below 12pt.
- Never skip haptic feedback on pressable elements.
- Never skip reduce-motion guards on animations.

---

## 10. Error Handling

### Error Hierarchy (`errors/AppError.ts`)

```
AppError (base)
├── NetworkError        retryable = true     Offline, timeout, DNS failure
├── AuthError           retryable = false    401/403, triggers logout flow
├── APIError            retryable = true*    Server errors (5xx retryable, 4xx not)
└── ValidationError     retryable = false    Field-level validation failures
```

### Error Logger (`errors/errorLogger.ts`)

- **Development**: `console.error` with structured output (error type, message, context).
- **Production**: Hook for Sentry / Crashlytics (currently commented, ready to enable).

### Screen-Level Error Handling

Every screen implements a consistent three-state pattern:

| State | Component | Behavior |
|-------|-----------|----------|
| Loading | `LoadingState` | Skeleton shimmer matching the screen's layout |
| Error | `ErrorState` | Card with error message + retry button (calls `refetch()`) |
| Empty | `EmptyState` | Icon + headline + description + CTA to guide next action |

`ScreenErrorBoundary` wraps navigation stacks to catch unexpected render errors and display a recovery UI rather than crashing the app.

---

## 11. Auth Architecture

### Flow

```
App Launch
  |
  v
AuthContext restores session from AsyncStorage
  |
  +--> session found --> validate with Supabase --> MainTabNavigator
  |
  +--> no session --> AuthStack --> SplashScreen --> AuthLandingScreen
                                                        |
                                                 +------+------+
                                                 |      |      |
                                              Google  Apple   Guest
                                                 |      |      |
                                                 v      v      v
                                            Supabase auth    Set guest mode
                                                 |               |
                                                 v               v
                                            MainTabNavigator (full)
                                            MainTabNavigator (limited)
```

### Auth Modes

| Mode | Provider | Capabilities |
|------|----------|-------------|
| `google` | Google Sign-In via `@react-native-google-signin/google-signin` + Supabase | Full access. JWT-authenticated API calls. |
| `apple` | Apple Sign-In via `@invertase/react-native-apple-authentication` + Supabase | Full access. JWT-authenticated API calls. |
| `guest` | No authentication | Limited access. `X-Guest-Mode: true` header. `GuestGate` blocks Insights and profile features. |

### Implementation Files

| File | Role |
|------|------|
| `context/AuthContext.tsx` | Provider + `useAuth()` hook. Manages session, sign-in/out methods, mode state. |
| `services/auth.ts` | Google and Apple sign-in configuration. |
| `services/supabase.ts` | Supabase client initialization (URL + anon key). |

---

## 12. Services Layer

| Service | File | Purpose |
|---------|------|---------|
| Auth | `services/auth.ts` | Google Sign-In and Apple Sign-In configuration constants. |
| Storage | `services/storage.ts` | Typed `AsyncStorage` helpers for persisting auth session, selected state, and settings. |
| Supabase | `services/supabase.ts` | `createClient()` initialization with project URL and anonymous key. |
| API Client | `api/client.ts` | Axios instance with request/response interceptors. |
| Formulary API | `api/services/formulary.service.ts` | All 15 typed API methods. |

---

## 13. Utilities

| Utility | File | Purpose |
|---------|------|---------|
| `coverageStatusResolver` | `utils/coverageStatusResolver.ts` | Takes a `FormularyEntry` and resolves it to a coverage variant (covered, not-covered, restricted, etc.) plus restriction flags (PA, ST, QL, specialty, controlled). Drives the `CoverageResult` screen's 21 permutations. |
| `formatters` | `utils/formatters.ts` | Currency formatting, percentage formatting, relative date strings ("2 days ago"), text truncation. |
| `freshnessCalculator` | `utils/freshnessCalculator.ts` | Converts a `source_date` timestamp into a freshness tier: `fresh` (< 30 days), `aging` (30-90 days), `stale` (> 90 days), `unknown` (null/missing). Drives `FreshnessIndicator` color coding. |

---

## 14. Test Coverage

### Framework

- **Runner**: Jest
- **Component testing**: `@testing-library/react-native`
- **Total**: 17 suites, 224 tests, all passing

### Tested Modules

| Category | Modules |
|----------|---------|
| **Utilities** | `formatters`, `coverageStatusResolver`, `freshnessCalculator` |
| **Stores** | `appStore`, `settingsStore`, `queryClient` |
| **Errors** | `AppError` hierarchy |
| **API** | `client.ts` (interceptors, error normalization) |
| **Query hooks** | `useInsurers`, `useCoverage`, `useDrugSearch`, `usePlans` |
| **Composites** | `ArticleCard`, `InsurerCard`, `StateSelectorBar` |
| **Screens** | `HomeScreen`, `CoverageResultScreen` |

---

## 15. Design Decisions Log

| Decision | Detail | Date |
|----------|--------|------|
| OAuth only | Google + Apple sign-in only. No email/password. Guest mode with `GuestGate` lock overlay. | 2026-04-06 |
| State selector | Persistent top bar, not a funnel step. Physicians rarely change state. Cached in AsyncStorage. | 2026-04-06 |
| Insurer selection | Multi-select max 3. Backend popularity-sorted. Name-only minimal cards. Client-side search. | 2026-04-06 |
| Plan identification | 4 methods: browse by name, Medicare (Contract+Plan+Segment), HIOS (14-char), Group ID. | 2026-04-06 |
| Plan flow | Sequential per insurer with confirm card. Skip removes insurer. Auto-advance after last. | 2026-04-06 |
| No mock data | Real API calls always. Graceful fallback for loading/error/empty/offline states. | 2026-04-06 |
| Search filtering | Client-side on already-fetched lists. Debounced 200ms. | 2026-04-06 |
| Cache strategy | TanStack Query: 5min stale, 24h gc, offlineFirst. Background refetch. | 2026-04-06 |
| Design system | Neumorphic (Soft UI). Cool grey `#E0E5EC` surface + dual shadows + violet `#6C63FF` accent. | 2026-04-06 |
| Typography | Custom fonts: Plus Jakarta Sans (display/titles) + DM Sans (body). Not system fonts. | 2026-04-06 |
| Tab bar hidden | Tab bar rendered but hidden (`display:'none'`). Navigation through dashboard, not tab icons. | 2026-04-07 |
| HomeStack owns funnel | All 11 search screens nested in HomeStack instead of a separate SearchStack. | 2026-04-07 |
| Toast over Alert | `ToastContext` replaces all `Alert.alert()` calls. Neumorphic card with auto-dismiss. | 2026-04-06 |
| Supabase auth | Supabase Auth over Firebase. Standard JWTs. Go-native validation on backend. | 2026-04-06 |
| Discover feed | Medical news via Claude Haiku summarization of PubMed + FDA + RSS sources. Backend Article schema. | 2026-04-07 |
| Insights tab | Prescription tendencies + insurer-level alternative recommendations. Auth-gated via GuestGate. | 2026-04-07 |
