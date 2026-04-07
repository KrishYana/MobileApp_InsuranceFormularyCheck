# PlanScanRx — Frontend Architecture

## 1. Project Overview

- **App**: PlanScanRx
- **Platform**: React Native (TypeScript) — iOS + Android
- **Design System**: Neumorphic (Soft UI) — `#E0E5EC` base, dual shadows, `#6C63FF` violet accent
- **Fonts**: Plus Jakarta Sans (display) + DM Sans (body)
- **State**: TanStack Query (server) + Zustand (client) + Context (auth)
- **Navigation**: React Navigation v7 — AuthStack + MainTabNavigator (5 tabs)
- **API**: Axios client with typed service layer, real endpoints, no mock data
- **Source**: `PlanScanRx/src/` — 76 files

---

## 2. Completed Work

### Theme System
- [x] Palette (`theme/palette.ts`) — neumorphic colors, #E0E5EC base, dark mode
- [x] Semantic tokens (`theme/tokens.ts`) — light + dark themes with full ThemeTokens type
- [x] Spacing scale (`theme/spacing.ts`) — 9 values (2/4/8/12/16/20/24/32/48)
- [x] Border radius (`theme/radius.ts`) — inner(12), base(16), container(32), full(9999)
- [x] Dual shadow system (`theme/shadows.ts`) — NeuShadows (extruded/extrudedSmall/lifted) + NeuInsets (inset/insetDeep/insetSmall)
- [x] Animation constants (`theme/animation.ts`) — spring configs, press scales, shimmer
- [x] Typography scale (`theme/typography.ts`) — 11 styles, Plus Jakarta Sans + DM Sans
- [x] Touch targets (`theme/touchTarget.ts`) — 44px min
- [x] ThemeProvider + `useTheme()` hook (`theme/ThemeProvider.tsx`)

### Neumorphic Primitives
- [x] `NeuSurface` — dual-View layering for extruded (raised) shadow effect
- [x] `NeuInset` — border overlay technique for carved-in effect + focus ring
- [x] `NeuIconWell` — deep inset circle for icons ("drilled into surface")

### UI Primitives (16)
- [x] `Button` — 4 variants (primary/secondary/tertiary/destructive), 3 sizes, NeuSurface wrapped, press scale
- [x] `Badge` — coverage/restriction/tier/count/info variants, NeuSurface for neutral
- [x] `Card` — default/elevated/status variants, NeuSurface, press animation
- [x] `TextInput` — NeuInset at rest, NeuInset deep on focus, violet focus ring
- [x] `SearchBar` — NeuInset, clear button, error state
- [x] `FilterChips` — horizontal scroll, NeuInset (active) / NeuSurface (inactive), press scale
- [x] `EmptyState` — NeuIconWell icon + headline + description + CTA
- [x] `ErrorState` — inline/card/fullscreen variants, NeuIconWell for fullscreen
- [x] `LoadingState` — skeleton (NeuSurface rows), spinner (NeuSurface circle), overlay
- [x] `Tabs` — pill style in NeuInset well, active tab extruded within
- [x] `Toggle` — NeuInset track + NeuSurface thumb, custom (not system Switch)
- [x] `Breadcrumb` — NeuSurface pill chips with separator
- [x] `ExpandableSection` — LayoutAnimation expand/collapse
- [x] `FreshnessIndicator` — dot/badge/banner variants, NeuInset banner
- [x] `Picker` — NeuSurface trigger + modal list with NeuInset selected / NeuSurface unselected
- [x] `ScreenErrorBoundary` — class component, catches render errors

### Error System
- [x] `AppError` hierarchy — NetworkError, AuthError, APIError, ValidationError
- [x] `errorLogger` — dev console + prod Sentry placeholder

### Toast System
- [x] `ToastContext` + `useToast()` — replaces all Alert.alert(), auto-dismiss, neumorphic card

### Auth
- [x] Google Sign-In + Apple Sign-In + Guest mode
- [x] `AuthContext` + `useAuth()` — persists to AsyncStorage, restores on launch
- [x] `GuestGate` composite — lock overlay (0.4 opacity + lock badge), sign-in bottom sheet

### State Selector
- [x] `StateSelectorBar` — persistent header, NeuInset bar, searchable modal, cached in AsyncStorage

### Navigation
- [x] `RootNavigator` — declarative auth switching (AuthStack vs MainTabs)
- [x] `AuthStack` — Splash → AuthLanding
- [x] `MainTabNavigator` — 5 tabs: Discover | Search | **Home** (elevated center) | Key Insights | Settings. Raised NeuSurface circle on Home.
- [x] `SearchStack` — InsurerSelection → PlanSelection → DrugSearch → CoverageResult → CoverageComparison (5 screens registered)
- [x] Typed param lists for all stacks (`navigation/types.ts`)

### API Layer
- [x] `api/client.ts` — Axios with auth token injection, offline detection, error normalization
- [x] `formulary.service.ts` — getInsurers, getPlans, lookupPlanByMedicareId/Hios/GroupId, searchDrugs, getCoverage, getCoverageMulti, getAlternatives, getPriorAuthCriteria

### Stores
- [x] `appStore` (Zustand) — selectedState, planFilters, isOnline. Persists selectedState to AsyncStorage.
- [x] `queryClient` (TanStack Query) — 5min stale, 24h gc, offlineFirst. Typed queryKeys for all entities.

### Screens (8 built)
- [x] **Splash Screen** — mp4 video playback → AuthLanding
- [x] **Auth Landing Screen** — neumorphic logo card + Apple/Google/Guest buttons (declarative auth switch)
- [x] **Home Screen** — StateSelectorBar + hero CTA + Recent Searches section + Saved Lookups section
- [x] **Insurer Selection Screen** — multi-select (max 3), inline search, popularity-sorted, removable chips, sticky continue button
- [x] **Plan Selection Screen** — sequential per-insurer stepper, 4 tabs (Search/Medicare/HIOS/Group), PlanConfirmCard, skip insurer, confirmed plans list
- [x] **Drug Search Screen** — autocomplete (2 char min, 300ms debounce), tabs (Search/Recent), formulation selector modal, highlighted match text
- [x] **Coverage Results Screen** — all 21 permutations, status card with color border, tier circle, cost display, restriction badges, specialty info, freshness banner, share, detail links
- [x] **Coverage Comparison Screen** — summary bar (covered X of Y + progress bar), ComparisonRow cards, tap to single-plan detail

### Composites (9 built)
- [x] `GuestGate` — lock overlay for guest-restricted features
- [x] `StateSelectorBar` — persistent state picker header
- [x] `InsurerCard` — name + checkmark, NeuSurface/NeuInset toggle
- [x] `PlanConfirmCard` — plan details + badges + Confirm button
- [x] `DrugAutocompleteItem` — drug name with highlighted match text + subtitle + specialty/controlled badges
- [x] `RestrictionBadgeRow` — PA/ST/QL/Specialty/Controlled badge row from flags
- [x] `TierDisplay` — tier number circle (color-coded green/amber/red) + tier name, NeuInset well
- [x] `CostDisplay` — copay/coinsurance/mail order rows, handles null gracefully
- [x] `ComparisonRow` — plan row for comparison screen, coverage badge + tier + cost + restriction count

### Hooks (7 built)
- [x] `useDebounce` — generic debounce hook
- [x] `useInsurers` — TanStack Query for insurers by state
- [x] `usePlans` — TanStack Query for plans by insurer+state
- [x] `usePlanLookup` — 3 mutations for Medicare/HIOS/Group ID lookups
- [x] `useDrugSearch` — TanStack Query for drug autocomplete (30s stale)
- [x] `useCoverage` — TanStack Query for single plan+drug coverage
- [x] `useCoverageMulti` — TanStack Query for multi-plan coverage

### Utilities
- [x] `freshnessCalculator` — source_date → freshness tier (fresh/aging/stale/unknown)
- [x] `coverageStatusResolver` — FormularyEntry → coverage variant + restriction flags
- [x] `formatters` — currency, percentage, relative date, truncate

---

## 3. Remaining Screens

### Core Lookup Flow
- [x] **Drug Search Screen** — autocomplete (2 char min, 300ms debounce), tabs (Search/Recent), formulation selector modal, highlighted match text
- [x] **Coverage Results Screen (Single Plan)** — 21 result permutations, restriction badges, tier/cost display, freshness banner, share, detail links
- [x] **Coverage Comparison Screen (Multi-Plan)** — summary bar (covered X of Y), comparison rows, tap to detail

### Result Details
- [ ] **Prior Auth Detail Screen** — criteria by type (AGE, DIAGNOSIS, PRIOR_MEDICATION, LAB_RESULT, PROVIDER_TYPE, QUANTITY)
- [ ] **Step Therapy Detail Screen** — prerequisite drug list with inline coverage status per drug
- [ ] **Quantity Limit Detail Screen** — structured breakdown (max_quantity, period_days, computed monthly rate)
- [ ] **Drug Alternatives Screen** — grouped by GENERIC_EQUIVALENT / THERAPEUTIC_ALTERNATIVE / BIOSIMILAR with coverage status

### Secondary Features
- [ ] **Search History Screen** — reverse-chronological list, swipe delete, date/state/insurer filters
- [ ] **Saved Lookups Screen** — CRUD management, pull-to-refresh coverage status, stale indicators, swipe delete/edit nickname
- [ ] **Saved Lookup Detail Screen** — Coverage Results + change history + management actions
- [ ] **Plan Comparison Builder Screen** — cross-insurer drug comparison (add plans from different insurers)

### New Feature Tabs (placeholders exist)
- [ ] **Discover Screen** — medical news tailored to physician's most prescribed drugs
- [ ] **Key Insights Screen** — prescription tendencies + insurer-level alternative recommendations

### Settings & Profile
- [ ] **Settings Screen** — toggles (biometrics, notifications), pickers (freshness threshold), destructive actions (clear history, delete account)
- [ ] **Profile Screen** — NPI verification, edit display name/specialty/state, change password, logout
- [ ] **About/Legal Screen** — CMS disclaimers, data sources, ToS, privacy policy

### Remaining Composites
- [ ] `CoverageResultCard` — reusable card for Saved Lookup Detail (wraps CoverageResult logic)
- [ ] `SavedLookupCard` — nickname, drug, coverage badge, freshness dot, swipe actions
- [ ] `HistoryItem` — drug + plan + state + timestamp + coverage badge

### Remaining Composites
- [ ] `CoverageResultCard` — renders correct variant from 21+ permutations
- [ ] `RestrictionBadgeRow` — PA/ST/QL/Specialty/Controlled badge row
- [ ] `DrugAutocompleteItem` — drug name + generic + strength with matching text bolded
- [ ] `SavedLookupCard` — nickname, drug, coverage badge, freshness dot, swipe actions
- [ ] `HistoryItem` — drug + plan + state + timestamp + coverage badge
- [ ] `TierDisplay` — tier number + name + color-coded cost
- [ ] `CostDisplay` — copay / coinsurance / mail order logic
- [ ] `ComparisonRow` — single plan row in multi-plan comparison

---

## 4. Design Decisions Log

| Decision | Detail | Date |
|----------|--------|------|
| Auth | OAuth only (Google + Apple). No email/password. Guest mode with lock overlay. | 2026-04-06 |
| State selector | Persistent top bar, not a funnel step. Physicians rarely change state. Cached in AsyncStorage. | 2026-04-06 |
| Insurer selection | Multi-select max 3. Backend popularity-sorted. Name-only minimal cards. Client-side search. | 2026-04-06 |
| Plan identification | 4 methods: search by name, Medicare (Contract+Plan+Segment 3 fields), HIOS (14-char), Group ID. | 2026-04-06 |
| Plan flow | Sequential per insurer with confirm card. Skip removes insurer. Auto-advance after last. | 2026-04-06 |
| No mock data | Real API calls always. Graceful fallback for loading/error/empty/offline states. | 2026-04-06 |
| Search filtering | Client-side on already-fetched lists. Debounced 200ms. | 2026-04-06 |
| Cache strategy | TanStack Query: 5min stale, 24h gc, offlineFirst. Background refetch. | 2026-04-06 |
| Design system | Neumorphic (Soft UI). Pivot from flat/maroon to cool grey + dual shadows + violet accent. | 2026-04-06 |
| Typography | Custom fonts: Plus Jakarta Sans (display) + DM Sans (body). Not system fonts. | 2026-04-06 |
| Tab bar restructure | 5 tabs: Discover \| Search \| Home (elevated center) \| Key Insights \| Settings. Saved/History moved into Home screen sections. | 2026-04-06 |
| Discover tab | Medical news tailored to physician's most prescribed drugs. New feature, placeholder built. | 2026-04-06 |
| Key Insights tab | Prescription tendencies + insurer-level alternative recommendations to reduce single inquiries. New feature, placeholder built. | 2026-04-06 |

---

## 5. Neumorphic Design Pattern Reference

### Philosophy
Neumorphism creates physical depth through dual opposing shadows (light top-left, dark bottom-right) on monochromatic `#E0E5EC` backgrounds. Elements extrude from or are pressed into the same continuous surface. Tactile, calm, physically grounded.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#E0E5EC` | Base surface. ALL backgrounds. |
| `foreground` | `#3D4852` | Primary text. 7.5:1 WCAG AAA. |
| `muted` | `#6B7280` | Secondary text. 4.6:1 WCAG AA. |
| `accent` | `#6C63FF` | Violet. CTAs, focus rings. |
| `accentLight` | `#8B84FF` | Lighter violet for gradients. |
| `teal` | `#38B2AC` | Success states. |
| `shadowLight` | `rgba(255,255,255, 0.55)` | Top-left shadow. |
| `shadowDark` | `rgba(163,177,198, 0.65)` | Bottom-right shadow. |

### Shadow Depth Levels

| Level | Light offset | Dark offset | Blur | Use |
|-------|-------------|-------------|------|-----|
| Extruded | -9, -9 | +9, +9 | 16 | Default resting state |
| Extruded Small | -5, -5 | +5, +5 | 10 | Smaller elements, list items |
| Lifted | -12, -12 | +12, +12 | 20 | Hover/highlighted |
| Inset | -6, -6 | +6, +6 | 10 | Pressed state, shallow wells |
| Inset Deep | -10, -10 | +10, +10 | 20 | Text fields, icon wells |
| Inset Small | -3, -3 | +3, +3 | 6 | Toggle tracks, subtle depressions |

### Corner Radii

| Token | Value | Usage |
|-------|-------|-------|
| `container` | 32pt | Cards, modals, large panels |
| `base` | 16pt | Buttons, inputs, medium components |
| `inner` | 12pt | Badges, chips, inner elements |
| `full` | 9999 | Pills, avatars, toggle tracks |

> Anti-pattern: Never use <12pt radii. Breaks the soft material illusion.

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| display | Plus Jakarta Sans ExtraBold | 40 | 800 |
| title1 | Plus Jakarta Sans Bold | 28 | 700 |
| title2 | Plus Jakarta Sans Bold | 22 | 700 |
| title3 | Plus Jakarta Sans SemiBold | 18 | 600 |
| body | DM Sans Regular | 16 | 400 |
| bodyMedium | DM Sans Medium | 16 | 500 |
| bodyBold | DM Sans Bold | 16 | 700 |
| label | DM Sans Medium | 14 | 500 |
| caption | DM Sans Regular | 13 | 400 |
| badge | DM Sans Bold | 11 | 700 |
| button | DM Sans Medium | 16 | 500 |

### Animation

| Context | Spring Config | Press Scale |
|---------|--------------|-------------|
| Button | damping: 12, stiffness: 200 | 0.97 |
| Card | damping: 15, stiffness: 150 | 0.99 |
| Chip | — | 0.95 |
| Modal | damping: 20, stiffness: 120 | — |

### Accessibility
- WCAG AA minimum. Primary text 7.5:1, muted 4.6:1.
- 44px minimum touch targets.
- `accessibilityLabel` on all interactive elements.
- Reduce motion: skip spring animations + shimmer when enabled.
- Dynamic Type supported, clamped on neumorphic-sensitive components.

### Anti-Patterns
- Never use opaque shadow colors (always use opacity).
- Never use white card backgrounds (always `#E0E5EC`).
- Never use flat buttons without depth.
- Never use <12pt corner radii.
- Never skip haptic feedback on buttons.
- Never skip reduce motion guards.

### Dark Mode
- Background: `#1E2530`
- Shadow light: `rgba(42, 52, 70, 0.8)`
- Shadow dark: `rgba(10, 14, 20, 0.9)`
- Foreground: `#E8EDF4`

---

## 6. File Structure Map

```
PlanScanRx/
  App.tsx                                    # Root: providers stack
  package.json
  tsconfig.json
  src/
    api/
      client.ts                              # Axios + interceptors
      services/
        formulary.service.ts                 # All formulary endpoints
    components/
      primitives/
        NeuSurface.tsx                       # Dual shadow raised effect
        NeuInset.tsx                         # Carved-in inset effect
        NeuIconWell.tsx                      # Deep inset icon container
        Button.tsx                           # 4 variants, 3 sizes
        Badge.tsx                            # coverage/restriction/tier/count/info
        Card.tsx                             # default/elevated/status
        TextInput.tsx                        # NeuInset, focus ring
        SearchBar.tsx                        # NeuInset, clear button
        FilterChips.tsx                      # Horizontal scroll, toggle
        EmptyState.tsx                       # Icon + headline + CTA
        ErrorState.tsx                       # inline/card/fullscreen
        LoadingState.tsx                     # skeleton/spinner/overlay
        Tabs.tsx                             # Pill style in inset well
        Toggle.tsx                           # Custom NeuInset track + NeuSurface thumb
        Breadcrumb.tsx                       # NeuSurface pill chips
        ExpandableSection.tsx                # Animated collapse
        FreshnessIndicator.tsx               # dot/badge/banner
        Picker.tsx                           # NeuSurface trigger + modal
        ScreenErrorBoundary.tsx              # Error boundary
        index.ts                             # Barrel export
      composites/
        GuestGate.tsx                        # Lock overlay for guests
        StateSelectorBar.tsx                 # Persistent state picker
        InsurerCard.tsx                      # Name + checkmark toggle
        PlanConfirmCard.tsx                  # Plan details + confirm
        index.ts
    constants/
      states.ts                              # 50 states + DC
    context/
      AuthContext.tsx                         # Google/Apple/Guest auth
      ToastContext.tsx                        # Toast notifications
    errors/
      AppError.ts                            # Error class hierarchy
      errorLogger.ts                         # Logging service
    hooks/
      queries/
        useInsurers.ts                       # Insurers by state
        usePlans.ts                          # Plans by insurer+state
        usePlanLookup.ts                     # Medicare/HIOS/Group mutations
      useDebounce.ts                         # Generic debounce
    navigation/
      RootNavigator.tsx                      # Auth check → stack switch
      AuthStack.tsx                          # Splash → AuthLanding
      MainTabNavigator.tsx                   # 5-tab bar
      SearchStack.tsx                        # Lookup funnel
      types.ts                               # All ParamList types
    screens/
      SplashScreen.tsx                       # Mp4 video → auth
      AuthLandingScreen.tsx                  # Logo + sign-in buttons
      home/
        HomeScreen.tsx                       # Dashboard + CTA
      search/
        InsurerSelectionScreen.tsx            # Multi-select insurers
        PlanSelectionScreen.tsx               # 4-tab plan identification
    services/
      auth.ts                                # Google/Apple sign-in
      storage.ts                             # AsyncStorage helpers
    stores/
      appStore.ts                            # Zustand client state
      queryClient.ts                         # TanStack Query config
    theme/
      palette.ts                             # Raw neumorphic colors
      tokens.ts                              # Semantic tokens (light/dark)
      ThemeProvider.tsx                       # useTheme() hook
      spacing.ts                             # 9-value scale
      radius.ts                              # 4 neumorphic radii
      shadows.ts                             # Dual shadow + inset configs
      animation.ts                           # Spring + shimmer configs
      typography.ts                          # 11 styles, custom fonts
      touchTarget.ts                         # 44px minimum
      index.ts                               # Barrel export
    types/
      auth.ts                                # AuthUser, AuthMode, USState
      domain.ts                              # Drug, Plan, Insurer, FormularyEntry, etc.
    utils/
      freshnessCalculator.ts                 # source_date → tier
      coverageStatusResolver.ts              # Entry → variant
      formatters.ts                          # Currency, date, truncate
    assets/
      splash-video.mp4
      logo.png
```
