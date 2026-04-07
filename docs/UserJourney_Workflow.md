# PlanScanRx: Complete User Journey & Workflow

> **Platform:** React Native (TypeScript) — iOS + Android
> **Last updated:** 2026-04-06
> **Source:** Derived from `Formulary_concept.md`
> **Auth:** Google Sign-In + Apple Sign-In + Guest mode (no email/password)
> **State selector:** Persistent top-of-app header, locally cached via AsyncStorage

This document defines every screen, state, transition, and branching path in the FormularyCheck mobile app. It is the canonical reference for frontend engineering, QA test case generation, and design work. Every permutation of the core lookup flow is enumerated, and every edge case and error state is catalogued.

---

## Table of Contents

1. [Screen Inventory](#1-screen-inventory)
2. [Authentication & Onboarding Flows](#2-authentication--onboarding-flows)
3. [Core Lookup Flow](#3-core-lookup-flow)
4. [Coverage Result Permutation Matrix](#4-coverage-result-permutation-matrix)
5. [Result Detail Screens](#5-result-detail-screens)
6. [Secondary Feature Screens](#6-secondary-feature-screens)
7. [Edge Cases & Error States](#7-edge-cases--error-states)
8. [Notifications & Alerts](#8-notifications--alerts)
9. [Navigation Architecture](#9-navigation-architecture)
10. [Complete Flow Diagrams](#10-complete-flow-diagrams)
11. [Data Requirements Per Screen](#11-data-requirements-per-screen)
12. [QA State Matrix](#12-qa-state-matrix)
13. [Implementation Priority](#13-implementation-priority)

---

## 1. Screen Inventory

**29 screens** across 5 domains:

### Authentication & Onboarding (2 screens)

| # | Screen | Purpose |
|---|--------|---------|
| 1 | Splash / Launch | Full-screen mp4 video playback → token check → route to Auth or Home |
| 2 | Auth Landing | Google Sign-In + Apple Sign-In + Continue as Guest |

> **Removed:** Sign Up, Login, Password Reset, NPI Verification, Profile Setup, Onboarding Carousel, Biometric Opt-In — replaced by OAuth-only flow (no email/password)
>
> **Guest mode:** All features visible but disabled (lock icon + 0.4 opacity). Tapping shows sign-in bottom sheet.
>
> **State selector:** Not a screen — persistent header bar across the entire app, cached in AsyncStorage. Auto-opens on first launch.

### Core Lookup Flow (7 screens)

| # | Screen | Purpose |
|---|--------|---------|
| 9 | Home / Dashboard | Central hub, recent searches, saved lookups |
| ~~10~~ | ~~State Selection~~ | **Replaced by persistent StateSelector header component** |
| 11 | Insurer Selection | Pick insurance company in that state |
| 12 | Plan Selection | Pick specific plan OR enter comparison mode |
| 13 | Drug Search | Search medication by name/class/recent |
| 14 | Coverage Results (Single Plan) | **Primary value screen** — coverage status + restrictions |
| 15 | Coverage Comparison (Multi-Plan) | Drug coverage across all plans from an insurer |

### Result Detail Screens (4 screens)

| # | Screen | Purpose |
|---|--------|---------|
| 16 | Prior Authorization Detail | PA criteria (age, diagnosis, prior meds, lab results) |
| 17 | Step Therapy Detail | Required prerequisite drugs + their coverage status |
| 18 | Quantity Limit Detail | Quantity restrictions and period details |
| 19 | Drug Alternatives | Generic equivalents, therapeutic alternatives, biosimilars |

### Secondary Features (6 screens)

| # | Screen | Purpose |
|---|--------|---------|
| 20 | Search History | Full search log, re-run past searches |
| 21 | Saved Lookups | Bookmarked plan+drug combos, CRUD management |
| 22 | Saved Lookup Detail | Coverage Results + change history + management |
| 23 | Plan Comparison Builder | Compare a drug across plans from different insurers |
| 24 | Settings | Preferences, data, privacy, legal |
| 25 | Profile / Account | Edit physician profile, change password, logout |

### Utility Screens (4 screens)

| # | Screen | Purpose |
|---|--------|---------|
| 26 | Network Error | Full-screen offline/error overlay |
| 27 | Empty State | Reusable template for empty lists |
| 28 | Data Freshness Warning | Modal for stale data alerts |
| 29 | About / Legal / Disclaimers | CMS disclaimers, data sources, ToS, privacy |

---

## 2. Authentication & Onboarding Flows

### Screen 1: Splash / Launch

**Purpose:** App initialization, token validation, routing decision.

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S1a | Cold launch (first install) | Splash animation (2s) → Welcome |
| S1b | Returning user, valid session | Splash (1s) → Home Dashboard |
| S1c | Returning user, expired token | Splash (1s) → Login |
| S1d | Biometrics enabled, valid refresh token | Splash (1s) → biometric prompt |
| S1e | No network + cached data | Splash → Home Dashboard (offline banner) |
| S1f | No network + no cache | Splash → Network Error (Screen 26) |

**Transitions:**

```
S1a ──→ Screen 2 (Welcome)
S1b ──→ Screen 9 (Home)
S1c ──→ Screen 6 (Login)
S1d ──→ biometric success ──→ Screen 9 (Home)
     ──→ biometric fail x3 ──→ Screen 6 (Login)
S1e ──→ Screen 9 (Home, offline mode)
S1f ──→ Screen 26 (Network Error)
```

---

### Screen 2: Welcome / Onboarding Carousel

**Purpose:** First-run-only introduction. Shown once.

**Cards:**
1. "Check formulary coverage instantly"
2. "Search by state, plan, and drug"
3. "Save lookups for patients you see often"
4. "Medicare Part D coverage available now" *(Phase 1 scope)*

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S2a | Pages 1-3 | "Next" button active |
| S2b | Final page | "Get Started" button active |
| S2c | Any page | "Skip" link visible |

**Transitions:**
- "Get Started" or "Skip" → Screen 3 (Sign Up)
- "Already have an account?" link → Screen 6 (Login)

---

### Screen 3: Sign Up

**Fields:** Full Name, Email, Password, Confirm Password, ToS checkbox

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S3a | Empty form | All fields blank |
| S3b | Partial fill, validation errors | Inline red text under invalid fields |
| S3c | All valid | "Create Account" button enabled |
| S3d | Submitting | Spinner on button, fields disabled |
| S3e | Success | Navigate to NPI Verification |
| S3f | Email exists | Inline: "Account exists. Log in?" with link |
| S3g | Network error | Toast: "Unable to create account" |
| S3h | Server error | Toast: "Something went wrong" |

**Transitions:**
- S3e → Screen 4 (NPI Verification)
- "Already have an account?" → Screen 6 (Login)
- S3f email link → Screen 6 (Login, email pre-filled)

---

### Screen 4: NPI Verification

**Purpose:** Optional but encouraged. Verify physician identity via NPI lookup to enable specialty-aware features.

**Fields:** NPI Number (10-digit, Luhn check client-side) OR "Skip for now" link

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S4a | Empty | Prompt: "Enter your 10-digit NPI" |
| S4b | Invalid format | Inline: "NPI must be 10 digits" |
| S4c | Valid format | "Verify" button enabled |
| S4d | Verifying | Spinner, calling NPI Registry API |
| S4e | Verified | Confirmation card: name, specialty, state, address from NPPES. "Is this you?" |
| S4f | NPI not found | "Couldn't find this NPI. Check the number or skip." |
| S4g | NPI linked to another account | "This NPI is associated with another account." |
| S4h | Network error | Toast + retry |
| S4i | User skipped | Proceed without NPI, profile marked unverified |

**Transitions:**
- S4e "Confirm" → Screen 5 (Profile Setup, pre-filled from NPI)
- S4i "Skip" → Screen 5 (Profile Setup, empty)
- "Not me, try again" → S4a (reset)

---

### Screen 5: Profile Setup

**Fields:** Display Name (pre-filled), Specialty (pre-filled from NPI or dropdown), Primary State (pre-filled or picker), Notification toggle

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S5a | Pre-filled from NPI | Ready to confirm |
| S5b | Empty (NPI skipped) | All fields editable |
| S5c | Saving | Spinner |
| S5d | Saved | Navigate forward |

**Transitions:**
- "Complete Setup" → Screen 8 (Biometric Opt-In) if device supports biometrics, else Screen 9 (Home)

---

### Screen 6: Login

**Fields:** Email, Password, "Remember me" toggle, "Forgot password?" link

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S6a | Empty form | Fields blank |
| S6b | Fields filled | "Log In" enabled |
| S6c | Submitting | Spinner |
| S6d | Success | Navigate to Home |
| S6e | Invalid credentials | Inline: "Invalid email or password" |
| S6f | Account locked (5 fails) | "Account locked. Reset password." |
| S6g | Network error | Toast |
| S6h | Biometric prompt (if opted in) | Overlaid on login screen |

**Transitions:**
- S6d → Screen 9 (Home)
- "Forgot password?" → Screen 7
- "Sign up" → Screen 3
- S6h biometric success → Screen 9
- S6h biometric fail → S6a (manual login fallback)

---

### Screen 7: Password Reset

**Sub-screens:**

| Sub | Purpose | Fields |
|-----|---------|--------|
| 7a | Email entry | Email input |
| 7b | Confirmation | "Reset link sent to {email}" + Resend + Open email app |
| 7c | New password (deep linked) | Password + Confirm Password |
| 7d | Success | "Password updated. Log in." |

**Error states:** Email not found, rate limit on resend (60s), reset link expired, network error

**Transitions:** 7d → Screen 6 (Login)

---

### Screen 8: Biometric Opt-In

**Purpose:** One-time prompt to enable Face ID / Touch ID / fingerprint.

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S8a | Prompt shown | Device-appropriate icon |
| S8b | User accepts | System biometric prompt → success → Home |
| S8c | User declines | "Not now" → Home |
| S8d | No biometrics on device | Skip silently → Home |

**Transitions:** All paths → Screen 9 (Home)

---

## 3. Core Lookup Flow

### Screen 9: Home / Dashboard

**Layout sections:**
1. **Top bar:** App logo, notification bell (badge count), profile avatar
2. **Quick Lookup Card:** Large "New Formulary Lookup" CTA
3. **Recent Searches:** Horizontal scroll of last 5 searches (state + plan + drug chips)
4. **Saved Lookups Summary:** Count + first 3 with coverage status badges (green ✓ / red ✗ / yellow !)
5. **Data Freshness Banner** (conditional): Amber banner if any saved lookup > 45 days stale

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S9a | First-time user | Empty states: "Your recent searches will appear here" |
| S9b | Returning user | Fully populated sections |
| S9c | Offline mode | Cached data + "Offline" banner, lookup still works if cached |
| S9d | Stale data | Amber banner: "Some coverage data may be outdated" |

**Transitions:**
- "New Formulary Lookup" → Screen 10
- Tap recent search chip → Screen 14 (re-execute search)
- Tap saved lookup → Screen 22
- "See all" saved → Screen 21
- Notification bell → notification list (sheet)
- Profile avatar → Screen 25
- Stale data banner → Screen 21 (filtered to stale)

---

### Screen 10: State Selection

**Layout:**
1. **Search bar:** "Search states..."
2. **Default state** (if set): Prominent card "{State} (Your default)"
3. **Location suggestion** (if permission granted): "Based on your location: {State}"
4. **Recently used states:** Up to 3 chips from search history
5. **Full list:** 50 states + DC, alphabetical

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S10a | Default + recents available | Show default card + recents + full list |
| S10b | No default, no recents | Show location suggestion (if permission) + full list |
| S10c | Search active | Filter list in real time |
| S10d | Search, no match | "No states matching '{query}'" |
| S10e | Offline | Show cached state list (always cached, small table) |

**Transitions:**
- Tap state → Screen 11 (Insurer Selection) with `state_code`
- Back → Screen 9

---

### Screen 11: Insurer Selection

**Layout:**
1. **Context bar:** Selected state as breadcrumb chip (tappable to go back)
2. **Search bar:** "Search insurers in {State}..."
3. **Recently used insurers** (filtered to this state): Up to 3 chips
4. **Insurer list:** insurer_name + parent_company + plan count. Sort: Name | # of Plans

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S11a | Insurers loaded | List populated |
| S11b | Loading | Skeleton list |
| S11c | No insurers for state | Empty: "We don't have insurer data for {State} yet. We currently cover Medicare Part D plans." + "Try another state" |
| S11d | Search active, results | Filtered list |
| S11e | Search, no match | "No insurers matching '{query}' in {State}" |
| S11f | Network error | Error card + retry button |
| S11g | Offline | Cached insurer list or "You're offline" |

**Transitions:**
- Tap insurer → Screen 12 (Plan Selection) with `insurer_id`
- State chip → Screen 10 (go back)
- Back → Screen 10

---

### Screen 12: Plan Selection

**Layout:**
1. **Context bar:** State chip + Insurer chip (tappable)
2. **Filter bar** (horizontal scroll chips):
   - Plan Type: All | HMO | PPO | EPO | POS | PDP | MA-PD
   - Market Type: All | Individual | Small Group | Large Group | Medicare | Medicaid
   - Metal Level (ACA only): All | Bronze | Silver | Gold | Platinum | Catastrophic
   - Plan Year: Current (default) | Previous
3. **Search bar:** "Search plans..."
4. **Plan list:** plan_name + type/market/metal badges + plan_year
5. **"Compare All Plans" button:** "Don't know the exact plan? Compare all {Insurer} plans for a drug"

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S12a | Plans loaded, no filters | Full list |
| S12b | Filters applied | Filtered list + active filter count badge |
| S12c | Loading | Skeleton |
| S12d | Filters eliminate all plans | "No plans match your filters" + "Clear Filters" |
| S12e | Only 1 plan exists | Auto-display, still let user confirm |
| S12f | Search active | Text-filtered results |
| S12g | Network error | Error card + retry |
| S12h | Offline | Cached plans or "You're offline" |

**Critical branch point — 3 paths forward:**

| Path | Trigger | Mode |
|------|---------|------|
| A | Tap a specific plan | Single-plan mode → Screen 13 with `plan_id` |
| B | Tap "Compare All Plans" | Multi-plan mode → Screen 13 with `insurer_id + state_code`, no `plan_id` |
| C | Apply filters, then "Compare Filtered Plans" | Multi-plan mode → Screen 13 with filtered plan set |

**Transitions:**
- Path A → Screen 13 (single-plan mode)
- Path B/C → Screen 13 (multi-plan mode)
- State chip → Screen 10
- Insurer chip → Screen 11
- Back → Screen 11

---

### Screen 13: Drug Search

**Layout:**
1. **Context bar:** State + Insurer + Plan (or "All {Insurer} Plans" / "X Filtered Plans")
2. **Search bar** (auto-focused): "Search by drug name, generic, or class..."
3. **Tabs:** Brand Name | Generic Name | Drug Class | Recent
4. **Autocomplete results** (min 2 chars, 300ms debounce): Up to 10 suggestions with drug_name, generic_name, strength, dose_form, route. Matching text bolded.
5. **Recent drugs tab:** Last 10 unique drugs
6. **Drug class tab:** Expandable ATC classification tree

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S13a | Empty, Recent tab (if history) | "Start typing a drug name..." |
| S13b | Typing, autocomplete loading | Skeleton suggestions |
| S13c | Autocomplete results | 1-10 results shown |
| S13d | No autocomplete results | "No drugs matching '{query}'" + "Search RxNorm" fallback |
| S13e | Drug class tab | Expandable tree |
| S13f | Recent tab | List of recent drugs |
| S13g | Network error | "Search unavailable. Check your connection." |
| S13h | Offline | Search local cache only + "Searching cached drugs only" |

**Sub-flow — multiple strengths/forms:**
When a drug has multiple formulations:
- Bottom sheet: "Select dose form and strength for {drug_name}"
- List all formulations (e.g., "Atorvastatin 10mg Tablet", "Atorvastatin 20mg Tablet")
- Tap specific → proceed to results

**Transitions:**
- Tap drug (single formulation) → Screen 14 (single-plan) or Screen 15 (multi-plan)
- Tap drug (multiple formulations) → bottom sheet → tap specific → Screen 14 or 15
- "Search RxNorm" fallback → API call → results in autocomplete
- Recent drug tap → Screen 14 or 15
- Drug class browse → drill in → tap drug → same flow
- Back → Screen 12

---

## 4. Coverage Result Permutation Matrix

### Screen 14: Coverage Results (Single Plan)

**THE PRIMARY VALUE SCREEN.**

**Header:** State > Insurer > Plan Name > Drug Name (strength, dose form)

**Data freshness indicator:**
- Green: `source_date` within 30 days
- Amber: 31-90 days old
- Red: >90 days old + "This data may be outdated"

---

### Category A: Drug IS COVERED (`is_covered = true`)

#### Base restriction combinations (8):

| ID | PA | ST | QL | Header | UI Treatment |
|----|----|----|----|----|-----|
| A1 | ✗ | ✗ | ✗ | COVERED | Green ✓. Tier + cost. Clean result. |
| A2 | ✓ | ✗ | ✗ | COVERED — Prior Authorization Required | Green ✓ + yellow PA badge. PA detail card. |
| A3 | ✗ | ✓ | ✗ | COVERED — Step Therapy Required | Green ✓ + blue ST badge. ST detail card. |
| A4 | ✗ | ✗ | ✓ | COVERED — Quantity Limit Applies | Green ✓ + gray QL badge. QL detail card. |
| A5 | ✓ | ✓ | ✗ | COVERED — Multiple Restrictions | Green ✓ + PA + ST badges. Two detail cards. |
| A6 | ✓ | ✗ | ✓ | COVERED — Multiple Restrictions | Green ✓ + PA + QL badges. Two detail cards. |
| A7 | ✗ | ✓ | ✓ | COVERED — Multiple Restrictions | Green ✓ + ST + QL badges. Two detail cards. |
| A8 | ✓ | ✓ | ✓ | COVERED — Multiple Restrictions | Green ✓ + all badges. Three detail cards. Most complex state. |

#### Specialty drug multiplier (×2):

Each of A1-A8 can occur with `specialty_drug = true`, creating **A1s through A8s**:
- Additional purple "SPECIALTY" badge
- Card: "Specialty medication. May require dispensing through a specialty pharmacy."
- **Total covered variants: 16**

#### Tier-level display variants (per result):

| Tier | Name | Cost Indicator |
|------|------|----------------|
| 1 | Preferred Generic | Green (lowest cost) |
| 2 | Generic | Green (low cost) |
| 3 | Preferred Brand | Amber (moderate) |
| 4 | Non-Preferred Brand | Amber (higher) |
| 5 | Specialty | Red (highest) |
| 6 | Ultra-Specialty | Red (rare) |

**Cost display logic:**
- `copay_amount` set → "Estimated copay: ${copay_amount}"
- `copay_mail_order` set → also show "Mail order: ${copay_mail_order}"
- `coinsurance_pct` set → "Estimated coinsurance: {coinsurance_pct}%"
- Both set → show both
- Neither set → "Cost sharing details not available. Contact the plan."

---

### Category B: Drug IS NOT COVERED

| ID | Condition | UI Treatment |
|----|-----------|------|
| B1 | `is_covered = false` (entry exists) | Red ✗. "NOT COVERED — not on the formulary for {plan_name}." Prominent "View Covered Alternatives" button. If alternatives exist: preview card "X alternatives may be covered" with top 3. |
| B2 | No `formulary_entry` exists | Gray ?. "NOT FOUND ON FORMULARY — we don't have data for {drug_name} on {plan_name}." Show source info. "Report Missing Data" feedback link. |

---

### Category C: Data Unavailability

| ID | Condition | UI Treatment |
|----|-----------|------|
| C1 | Plan has no formulary data at all | Gray empty state. "Formulary data not available for {plan_name}." Show plan contact if available. |
| C2 | Lookup fails (API/network error) | Error state. "Unable to retrieve coverage info." Retry button. |
| C3 | Stale data overlay (any result) | Amber banner over result: "Based on data from {source_date}. Verify with the plan." Shown when `source_date > 90 days`. |

---

### Post-result actions (contextual):

| Action | Available When | Target |
|--------|---------------|--------|
| Save Lookup | Any result | Creates `saved_lookup`, button → "Saved ✓" |
| Unsave Lookup | Already saved | Removes `saved_lookup` |
| Edit Nickname | Already saved | Inline text field or bottom sheet |
| View PA Details | `prior_auth = true` | Screen 16 |
| View ST Details | `step_therapy = true` | Screen 17 |
| View QL Details | `quantity_limit = true` | Screen 18 |
| View Alternatives | Always | Screen 19 |
| Check Different Plan | Always | Screen 12 (same state + insurer) |
| Check Different Drug | Always | Screen 13 (same state + insurer + plan) |
| New Lookup | Always | Screen 10 (fresh start) |
| Share | Always | System share sheet (text summary) |
| Report Issue | Always | Feedback bottom sheet |

---

### Controlled Substance Overlay

When `is_controlled = true` and `dea_schedule` is set (applies to any result state):
- Badge: "Schedule {dea_schedule} Controlled Substance"
- Info card: "DEA Schedule {dea_schedule} controlled substance. Additional prescribing requirements may apply."

---

## 5. Result Detail Screens

### Screen 16: Prior Authorization Detail

**Layout:**
1. Header: "Prior Authorization Requirements" + drug + plan
2. Summary: "PA must be approved before {drug_name} can be dispensed."
3. Criteria sections (one card per `criteria_type`):

| Criteria Type | Display |
|---------------|---------|
| AGE | "Patient must be between {age_min} and {age_max} years old" |
| GENDER | "Restricted to {gender_restriction} patients" |
| DIAGNOSIS | "Approved for:" + ICD-10 code list with descriptions |
| PRIOR_MEDICATION | "Must have tried and failed:" + drug list (resolved from RxCUIs) |
| LAB_RESULT | `criteria_description` text |
| PROVIDER_TYPE | "Must be prescribed by: {criteria_description}" |
| QUANTITY (embedded) | "Maximum {max_quantity} units per {quantity_period_days} days" |

4. Source document link (if `source_document_url` set): "View full PA criteria document"
5. Missing data state: "PA required, but detailed criteria not available. Contact {plan_name}."

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S16a | Full criteria available | All sections shown |
| S16b | Partial criteria | Show available, hide null |
| S16c | No criteria records | Missing data message |
| S16d | Network error | Error + retry |

**Transitions:**
- Back → Screen 14
- Source doc link → in-app browser
- Tap step therapy drug → Screen 14 (that drug, same plan)

---

### Screen 17: Step Therapy Detail

**Layout:**
1. Header: "Step Therapy Requirements" + drug + plan
2. Explanation: "Patient must first try and fail on these medications:"
3. Step therapy drug list (each entry):
   - Drug name (resolved from RxCUI) + generic name + dose form + strength
   - **Coverage status on THIS plan** (inline lookup): green "Covered" / red "Not Covered" / gray "Unknown"
   - "Check Coverage Details" link → Screen 14 for that drug
4. `step_therapy_description` (free text callout if available)
5. Missing data: "Step therapy required, but specific medications not identified. Contact {plan_name}."

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S17a | Drugs listed + coverage resolved | Full display |
| S17b | Drugs listed, coverage loading | Loading indicator per drug |
| S17c | No drugs, only description text | Show description only |
| S17d | No details at all | Missing data message |

**Transitions:**
- "Check Coverage Details" on listed drug → Screen 14 (that drug, same plan)
- Back → Screen 14

---

### Screen 18: Quantity Limit Detail

**Layout:**
1. Header: "Quantity Limit Details" + drug + plan
2. Limit card: `quantity_limit_detail` in large text (e.g., "Maximum 30 tablets per 30 days")
3. Structured breakdown (if available): max_quantity, quantity_period_days, computed monthly rate
4. Context: "If higher quantity needed, a quantity limit exception may be requested through the plan's PA process."
5. Missing data: "Quantity limit applies, but specific limits not available. Contact {plan_name}."

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S18a | Full detail | Structured + text |
| S18b | Only `quantity_limit_detail` text | Text only |
| S18c | No detail | Missing data message |

**Transitions:** Back → Screen 14

---

### Screen 19: Drug Alternatives

**Layout:**
1. Header: "Alternatives for {drug_name}" + plan (or "across {Insurer} plans")
2. Sections by `relationship_type`:

| Section | Label | Extra Info |
|---------|-------|------------|
| GENERIC_EQUIVALENT | Generic Equivalents | Cost comparison if both have cost data |
| THERAPEUTIC_ALTERNATIVE | Therapeutic Alternatives | "Different drug in same therapeutic class" + notes |
| BIOSIMILAR | Biosimilars | "Biosimilar to {original drug}" |

Each alternative shows: drug_name, strength, dose_form, coverage status on current plan (Covered tier+cost / Not Covered / Unknown), "View Full Coverage" link.

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S19a | Alternatives found, coverage resolved | Grouped list |
| S19b | Alternatives found, coverage loading | Loading per row |
| S19c | No alternatives found | "No known alternatives in our database" |
| S19d | Alternatives found, none covered | "None of the alternatives are covered either" |
| S19e | Network error resolving coverage | Show alternatives without coverage status |

**Transitions:**
- "View Full Coverage" on any alternative → Screen 14 (that drug, same plan)
- Back → Screen 14

---

## 6. Secondary Feature Screens

### Screen 20: Search History

**Layout:** Search/filter bar (date, state, insurer) + reverse-chronological list (drug + plan + state + timestamp + coverage badge). Swipe left to delete. "Clear All" at bottom.

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S20a | History populated | Full list |
| S20b | Empty | "No search history yet" |
| S20c | Filtered, no results | "No searches match your filter" |

**Transitions:**
- Tap item → Screen 14 (re-execute search)
- Back → Screen 9

---

### Screen 21: Saved Lookups

**Layout:** Sort/filter bar (Name | Date | Drug | Plan; Covered | Not Covered | Restrictions | Stale). Saved lookup cards: nickname, drug+strength, plan+insurer+state, coverage badge, freshness indicator. Swipe left = delete, swipe right = edit nickname. Pull to refresh re-checks coverage.

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S21a | Lookups present, all fresh | Normal list |
| S21b | Some with stale data | Amber dots on stale items |
| S21c | Empty | "No saved lookups. Tap 'Save' during coverage checks." |
| S21d | Refreshing | Loading overlay per card |
| S21e | Post-refresh, coverage changed | "UPDATED" badge + change description |

**Transitions:**
- Tap lookup → Screen 22
- Pull refresh → API calls → update cards
- "+" FAB → Screen 10 (new lookup)
- Back → Screen 9

---

### Screen 22: Saved Lookup Detail

Same as Screen 14 (Coverage Results) plus:
- Nickname (editable inline)
- "Saved on {date}" metadata
- Change history: "Coverage changed on {date}: {description}"
- Management: Edit Nickname, Delete, Refresh Now

**Transitions:** Same as Screen 14 + Delete → Screen 21

---

### Screen 23: Plan Comparison Builder

**Layout:**
1. Drug selector (choose drug first)
2. Plan basket (add up to 5 plans from any insurer/state)
3. "Add Plan" → mini State > Insurer > Plan flow in modal
4. "Compare" button (enabled with drug + 2+ plans)

**States:**

| ID | Condition | Behavior |
|----|-----------|----------|
| S23a | Empty basket | Prompt to add drug + plans |
| S23b | Drug + 1 plan | "Add at least 2 plans to compare" |
| S23c | Drug + 2+ plans | "Compare" enabled |

**Transitions:**
- "Add Plan" → modal plan selection
- "Compare" → Screen 15 (custom plan set)
- Back → Screen 9

---

### Screen 24: Settings

**Sections:**
1. **Default State:** Picker
2. **Biometrics:** Toggle
3. **Notifications:**
   - Coverage changes on saved lookups (toggle)
   - Formulary data refreshed (toggle)
   - Freshness warning threshold picker (30 / 45 / 60 / 90 days)
4. **Data & Privacy:**
   - Clear search history (confirmation)
   - Clear cached data (confirmation + warning)
   - Export my data (future)
   - Delete my account (multi-step confirmation)
5. **About:** Version, ToS, Privacy Policy, Data Sources → Screen 29, Contact Support
6. **Legal disclaimer:** "FormularyCheck provides reference information only. Always verify with the plan."

**Transitions:** Back → Screen 9. Delete account → Splash.

---

### Screen 25: Profile / Account

**Sections:** Avatar, Display Name (editable), Email (change via re-verification), NPI (display or "Verify NPI"), Specialty (editable), Primary State (editable), "NPI Verified" badge or "Unverified" prompt, Change Password, Log Out.

**Transitions:**
- "Verify NPI" → Screen 4
- "Change Password" → sub-screen
- "Log Out" → Screen 6
- Back → Screen 9

---

## 7. Edge Cases & Error States

### 7.1 Network Error States

| Scenario | Behavior |
|----------|----------|
| Full offline + cache | App works with cached data. "Offline — cached results" banner. |
| Full offline + no cache | Screen 26: "No connection. FormularyCheck requires internet for first use." |
| Intermittent (timeout >10s) | Inline error + retry on the failed component. Don't block full screen. |
| Partial load | Show loaded data + error card on failed section. |
| Server error (5xx) | "Our servers are experiencing issues. Try again in a few minutes." + Retry |
| Maintenance mode | "FormularyCheck is undergoing scheduled maintenance." |

### 7.2 Empty States Per Screen

| Screen | Empty Condition | Message |
|--------|----------------|---------|
| 11 (Insurer) | No insurers in state | "We don't have insurer data for {State} yet. Medicare Part D plans available." |
| 12 (Plan) | No plans for insurer | "No plans found for {Insurer} in {State}." |
| 12 (Plan) | Filters eliminate all | "No plans match filters." + "Clear Filters" |
| 13 (Drug) | Drug not in DB | "Drug not found. Try generic name." + "Search RxNorm" |
| 14 (Results) | No formulary entry | B2 state (see Section 4) |
| 15 (Comparison) | All plans lack data | "Formulary data not available for any plans." |
| 19 (Alternatives) | No alternatives | "No known alternatives." |
| 20 (History) | No searches | "Your search history will appear here." |
| 21 (Saved) | No saved lookups | "Save drug+plan combos for quick access." |

### 7.3 Data Freshness Tiers

| Tier | source_date | Indicator | Treatment |
|------|-------------|-----------|-----------|
| FRESH | ≤ 30 days | Green | No warning |
| AGING | 31-90 days | Amber | Subtle: "Data updated {N} days ago" |
| STALE | > 90 days | Red | Prominent: "This data may be outdated. Verify with the plan." |
| UNKNOWN | No date | Gray | "Data freshness unknown" |

**Where shown:** Coverage Results (Screen 14) always, Saved Lookups (Screen 21) badge + filter, Home (Screen 9) banner if any saved is stale, Push notification if saved lookup stale.

### 7.4 Phase-Dependent Feature Gating

| Phase | Gated Features |
|-------|----------------|
| Phase 1 (Medicare Part D) | Market type filter: only "Medicare" enabled. Others show "Coming Soon" badge. |
| Phase 2 (adds ACA) | Enable "Individual", "Small Group". Metal level filter active. |
| Phase 3+ (FHIR) | Enable "Large Group". FHIR-sourced plans get "Real-time" freshness badge. |

### 7.5 Controlled Substance Handling

When `is_controlled = true` + `dea_schedule` set:
- Badge: "Schedule {dea_schedule} Controlled Substance"
- Info card: "DEA Schedule {dea_schedule}. Additional prescribing requirements may apply."
- Informational only — app does not enforce prescribing rules.

### 7.6 Specialty Drug Handling

When `specialty_drug = true` or `is_specialty = true`:
- Purple "SPECIALTY" badge on all result screens
- Info card: "May require specialty pharmacy, clinical management, temperature-controlled shipping, PA."
- Cost note: "Specialty costs may be significantly higher. Patient-specific costs depend on benefit phase."

---

## 8. Notifications & Alerts

### 8.1 Push Notifications

| Type | Trigger | Content | Taps To |
|------|---------|---------|---------|
| Coverage Changed | Data ingestion updates a saved lookup's formulary entry | "{Drug} coverage on {Plan} has changed." | Screen 22 |
| Coverage Removed | Drug removed from formulary | "{Drug} is no longer covered by {Plan}." | Screen 22 → Screen 19 |
| New Restriction | PA/ST/QL added to previously unrestricted entry | "New restriction on {Drug} under {Plan}: {type}." | Screen 22 |
| Data Refresh | Bulk ingestion completes | "Formulary data updated for {source}." | Screen 9 |
| Stale Data | Saved lookup exceeds freshness threshold | "Coverage data for {Drug} on {Plan} hasn't been updated in {N} days." | Screen 22 |
| Account Security | Password change, new device | "Your password was changed" / "New login from {device}" | Screen 25 |

### 8.2 In-App Alerts

| Alert | Condition | Behavior |
|-------|-----------|----------|
| Data freshness banner | Any saved lookup stale | Amber banner on Home (Screen 9) |
| CMS disclaimer | First use of result screen per session | Bottom sheet, dismissible, shown once |
| Rate limit | >100 searches/hour | "You're searching quickly. Please slow down." |
| Maintenance window | Scheduled downtime | Banner 24h before: "Maintenance on {date} {time}-{time}" |

---

## 9. Navigation Architecture

### Tab Bar (persistent bottom)

| Tab | Icon | Screen | Badge |
|-----|------|--------|-------|
| Home | House | Screen 9 | Notification count |
| Search | Magnifying glass | Screen 10 | None |
| Saved | Bookmark | Screen 21 | Stale item count |
| History | Clock | Screen 20 | None |
| Settings | Gear | Screen 24 | None |

### Back Navigation Rules

| From | Back Goes To |
|------|-------------|
| Lookup funnel (10-14) | Previous step in funnel |
| Result screens (14-19) | Previous result or drug search |
| Saved Lookup Detail (22) | Saved Lookups list (21) |
| Tab switch | Each tab maintains its own nav stack |
| Deep link (notification) | Pushes onto appropriate tab's stack |

### Deep Link Scheme

```
formularycheck://lookup?state={code}&insurer={id}&plan={id}&drug={id}
  → Can omit later params to land at that funnel step

formularycheck://saved/{lookup_id}
  → Screen 22

formularycheck://history
  → Screen 20
```

---

## 10. Complete Flow Diagrams

### 10.1 Happy Path (Single Plan Lookup)

```
Splash → Home → [New Lookup] → State → Insurer → Plan
→ Drug Search → Coverage Results (Covered, Tier 1, No Restrictions) → [Save] → Home
```

### 10.2 "Don't Know Exact Plan" Path

```
Home → State → Insurer → Plan → [Compare All Plans]
→ Drug Search → Coverage Comparison (multi-plan)
→ [Tap specific plan] → Coverage Results
```

### 10.3 Not Covered → Alternative Discovery

```
Home → State → Insurer → Plan → Drug Search
→ Coverage Results (NOT COVERED)
→ [View Alternatives] → Drug Alternatives
→ [Tap covered alternative] → Coverage Results (COVERED, Tier 2)
```

### 10.4 Full Restrictions Deep-Dive

```
Home → ... → Coverage Results (Covered + PA + ST + QL)
→ [View PA Details] → PA Detail → [Back]
→ [View ST Details] → ST Detail → [Tap prerequisite drug]
  → Coverage Results (prereq drug, same plan, Covered Tier 1) → [Back] → [Back]
→ [View QL Details] → QL Detail → [Back]
→ [Save Lookup] → Toast "Saved"
```

### 10.5 Stale Data Discovery

```
Home (stale banner) → [Tap] → Saved Lookups (filtered: stale)
→ [Pull refresh] → Lookups refreshed, "UPDATED" badge
→ [Tap updated] → Saved Lookup Detail (change history: "Was Tier 2, now Tier 3")
```

### 10.6 First-Time User

```
Splash (cold) → Welcome Carousel → Sign Up → NPI Verification → [Enter NPI]
→ Verified (confirm) → Profile Setup (pre-filled) → [Complete]
→ Biometric Opt-In → [Enable] → Home (empty state) → [New Lookup] → ...
```

### 10.7 Error Recovery

```
Home → State → Insurer → Plan → Drug Search → [Search]
→ Network Error inline → [Retry] → Autocomplete results → [Tap drug]
→ Coverage Results → [Network error loading] → Error + [Retry]
→ [Retry] → Coverage Results loaded
```

### 10.8 Offline Mode

```
Splash (offline, has cache) → Home (offline banner) → [New Lookup]
→ State (cached) → Insurer (cached) → Plan (cached)
→ Drug Search (cached drugs only) → Coverage Results (cached, stale warning)
→ [Save offline] → Queued for sync when online
```

---

## 11. Data Requirements Per Screen

| Screen | Reads | Writes |
|--------|-------|--------|
| Home (9) | `search_history` (last 5), `saved_lookups` (count + top 3), `formulary_entries` (freshness) | — |
| State (10) | `states` (all), `physicians.primary_state`, `search_history` (recent states) | — |
| Insurer (11) | `insurers` (by state via `insurer_states`), `search_history` (recent insurers for state) | — |
| Plan (12) | `plans` (by insurer + state, filterable: plan_type, market_type, metal_level, plan_year) | — |
| Drug Search (13) | `drugs` (autocomplete: drug_name, generic_name, brand_names[], drug_class), `search_history` (recent drugs) | `search_history` |
| Results (14) | `formulary_entries` (plan_id + drug_id, is_current=true), `drugs`, `plans`, `prior_auth_criteria` | `search_history` |
| Comparison (15) | `formulary_entries` (multiple plan_ids + drug_id), `plans` | `search_history` |
| PA Detail (16) | `prior_auth_criteria` (by entry_id), `drugs` (resolve step_therapy_drugs) | — |
| ST Detail (17) | `prior_auth_criteria` (step_therapy fields), `drugs`, `formulary_entries` (coverage for prereq drugs) | — |
| QL Detail (18) | `prior_auth_criteria` (quantity fields), `formulary_entries.quantity_limit_detail` | — |
| Alternatives (19) | `drug_alternatives` (by drug_id), `drugs`, `formulary_entries` (coverage per alternative) | — |
| History (20) | `search_history` (paginated, filtered) | `search_history` (delete) |
| Saved (21) | `saved_lookups`, `formulary_entries` (status), `drugs`, `plans` | `saved_lookups` (delete, nickname) |
| Saved Detail (22) | `saved_lookups`, `formulary_entries`, `drugs`, `plans`, `prior_auth_criteria` | `saved_lookups` (nickname, delete) |
| Profile (25) | `physicians` | `physicians` (update) |
| Settings (24) | `physicians` (prefs) | `physicians`, `search_history` (clear), `saved_lookups` (bulk) |

---

## 12. QA State Matrix

| Screen | States | Count |
|--------|--------|-------|
| Splash (1) | S1a-S1f | 6 |
| Welcome (2) | S2a-S2c | 3 |
| Sign Up (3) | S3a-S3h | 8 |
| NPI Verify (4) | S4a-S4i | 9 |
| Profile Setup (5) | S5a-S5d | 4 |
| Login (6) | S6a-S6h | 8 |
| Password Reset (7) | 4 sub-screens + errors | 7 |
| Biometric (8) | S8a-S8d | 4 |
| Home (9) | S9a-S9d | 4 |
| State (10) | S10a-S10e | 5 |
| Insurer (11) | S11a-S11g | 7 |
| Plan (12) | S12a-S12h + 3 paths | 11 |
| Drug Search (13) | S13a-S13h + sub-flow | 9 |
| Coverage Results (14) | A1-A8, A1s-A8s, B1-B2, C1-C3 | 21 |
| Comparison (15) | S15a-S15f | 6 |
| PA Detail (16) | S16a-S16d | 4 |
| ST Detail (17) | S17a-S17d | 4 |
| QL Detail (18) | S18a-S18c | 3 |
| Alternatives (19) | S19a-S19e | 5 |
| History (20) | S20a-S20c | 3 |
| Saved (21) | S21a-S21e | 5 |
| Saved Detail (22) | Screen 14 states + extras | 23 |
| Comparison Builder (23) | S23a-S23c | 3 |
| Settings (24) | Base state | 1 |
| Profile (25) | Base state | 1 |
| **Total** | | **~164 distinct UI states** |

---

## 13. Implementation Priority

### Sprint 1-2: Auth + Navigation Shell
- Screens 1, 2, 3, 6, 7, 5, 8 (auth flow)
- Tab bar navigation scaffold (React Navigation)
- Screen 9 (Home) with empty states

### Sprint 3-4: Core Lookup (Happy Path)
- Screens 10, 11, 12, 13, 14 (the funnel)
- Result states A1 (covered, no restrictions) and B1 (not covered) only
- Search history writes

### Sprint 5-6: Full Result Permutations
- All result states A1-A8, A1s-A8s, B1, B2, C1-C3
- Screens 16, 17, 18 (detail screens)
- Data freshness indicators

### Sprint 7-8: Multi-Plan Comparison + Alternatives
- Screen 15 (Coverage Comparison)
- Screen 19 (Drug Alternatives)
- "Compare All Plans" flow from Screen 12

### Sprint 9-10: Secondary Features
- Screens 20, 21, 22, 23 (History, Saved, Comparison Builder)
- Save/unsave/nickname CRUD
- Pull-to-refresh on saved lookups

### Sprint 11-12: Polish, Edge Cases, NPI
- Screen 4 (NPI Verification)
- All error states, offline mode, stale data handling
- Push notifications infrastructure
- Screen 29 (legal/disclaimers)
- Settings refinements
