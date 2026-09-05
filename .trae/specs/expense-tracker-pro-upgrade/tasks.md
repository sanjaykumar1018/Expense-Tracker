# Expense Tracker - Professional Upgrade Implementation Plan

## Task 1: Toast Notifications System (Global Hook + Context)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Create `frontend/expense-tracker/src/context/ToastContext.jsx` wrapping `<Toaster>` config and exposing `success()`, `error()`, `info()`, `warning()`, `promise()` methods with unified signature: `(message, opts?)` where opts supports `{ description, duration, action: { label, onClick } }`.
  - Create `frontend/expense-tracker/src/hooks/useToast.js` re-exporting the context hook as a convenience.
  - Wrap `<App/>` tree in `ToastProvider` (alongside `UserProvider`) in `main.jsx`.
  - Remove all direct imports of `react-hot-toast` from every `pages/*.jsx` and replace calls with `useToast()`.
  - Ensure Undo button action pattern is supported (used by Task 4).
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: Grep of `frontend/src/pages` and `frontend/src/components` shows zero lines importing from `react-hot-toast`. Command: `cd frontend/expense-tracker && rg "from [\"']react-hot-toast[\"']" src/pages src/components` returns exit code 1 (no matches).
  - `rule` TR-1.2: Login failure triggers `toast.error` via hook; Income add success triggers `toast.success` via hook. Browser Network + Console confirms correct toast rendering.
  - `rubric` TR-1.3: Toast API ergonomics; scale 1-5; anchors 1=duplicated boilerplate on every call, 3=usable but missing description/action, 5=single hook call `const toast = useToast(); toast.success("Done", { description: "Income added", action: { label: "View", onClick: ... } })` works in all pages; threshold >= 4; evidence: screenshots of 3 distinct toast styles (success/error/action) on different pages.
- **Notes**: Toaster visual style (rounded-10px, Poppins font) must match current config in App.jsx; extract colors into theme tokens later in Task 8.

## Task 2: Animations & Micro-interactions (Tailwind + CSS only)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1 (toasts use animations; can be done in parallel but merge after)
- **Description**:
  - In `index.css`, add `@keyframes fade-in`, `fade-in-up`, `fade-in-down`, `scale-in`, `slide-in-right`, `skeleton-shimmer`.
  - Wrap route change in `App.jsx` with fade transition (e.g., CSS-based keyframes on `<Routes>` wrapper div using `useLocation` key + `animate-fade-in-up`).
  - `StatsInfoCard`: wrap in group, add `animate-fade-in-up` with `style={{ animationDelay: idx*60ms }}` staggered via wrapper component or map index prop in Home.
  - Income/Expense/Dashboard list items add `group-hover:translate-x-0.5`, `group-hover:shadow-md`, `transition-all duration-200`.
  - Buttons add `active:scale-[0.98]`, sidebar nav `transition-all duration-200`, inputs add `focus:ring-2 focus:ring-primary/30`.
  - Recharts components: `isAnimationActive={true}` + `animationDuration={700}`.
  - Replace every `animate-spin` loading spinner in pages with a skeleton component: create `frontend/expense-tracker/src/components/ui/Skeleton.jsx` (pulse bar) and `SkeletonCard.jsx`. Use in Home, Income, Expense while `loading=true`.
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-2.1: `Skeleton.jsx` exists and is imported in Home, Income, Expense pages' loading branches (no `animate-spin` loader remains except ProtectedRoute which is OK). Grep returns 0 matches of `animate-spin` in src/pages except ProtectedRoute.
  - `rule` TR-2.2: Route transition: navigating Dashboard → Income → Expense shows fade content swap (no blank flash). Verified visually.
  - `rubric` TR-2.3: Animation smoothness and coverage; scale 1-5; anchors 1=only skeletons added, 3=skeletons + card hover + Recharts animation, 5=staggered cards, route transitions, micro-interactions on every interactive element, modal transitions (coordinate with Task4 modal); threshold >= 4; evidence: screen recording of page navigation.

## Task 3: Search & Filters (Backend + Frontend)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Backend: Refactor `GET /api/income` and `GET /api/expense` in `server.js` to consume `req.query`: `search` (regex title||description, case-insensitive), `category` (exact match), `dateFrom`, `dateTo` (Date gte/lte), `minAmount`, `maxAmount`, `sortBy` (date|amount|title default date), `sortOrder` (asc|desc default desc). Build a `buildQuery` helper to reduce duplication between income and expense routes.
  - Add Dashboard `GET /api/dashboard/recent-transactions` support for `search` query to filter recent.
  - Frontend: Create shared `frontend/expense-tracker/src/components/ui/SearchBar.jsx` and `FilterPanel.jsx` (category chips, date range pickers via 2 `<input type="date">`, amount min/max, sort select).
  - Income.jsx and Expense.jsx: mount SearchBar + FilterPanel above the list. Store filter state in `useState`; debounce search input (300ms) via a small custom `useDebounce` hook; trigger `fetchIncomes/fetchExpenses` with query params via `apiPaths` helpers (add new URL builder).
  - Extend `apiPaths.js` with `LIST_INCOME(params)` and `LIST_EXPENSE(params)` that build query strings using `URLSearchParams`.
  - Dashboard Home recent transactions section adds a compact SearchBar.
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-3.1: API endpoint returns correct filtered array. Thunder/Postman: `GET /api/income?category=Salary` → response contains only Salary entries. `?minAmount=1000&maxAmount=5000` respects bounds. Evidence: API response JSON.
  - `rule` TR-3.2: Frontend typing "mobile" in Expense page search filters the list to only entries matching title/description. Evidence: 2 screenshots (before/after typing).
  - `rubric` TR-3.3: Filter UX; scale 1-5; anchors 1=basic search box only, 3=search + category + sort, 5=search + category chips + date range + amount range + sort, debounced, clear-all button; threshold >= 4; evidence: screenshot of filter panel.

## Task 4: Edit & Delete (Soft) + Undo for Income; Edit for Expense
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (uses `useToast` action button for Undo), Task 3 (no conflict but merge-safe)
- **Description**:
  - Backend:
    - Income model: add `isDeleted: { type: Boolean, default: false }`, `deletedAt: { type: Date }`.
    - Add `PUT /api/income/:id` and `PUT /api/expense/:id` endpoints with ownership check (same pattern as delete); validate fields; return updated doc.
    - Modify `DELETE /api/income/:id` to set `isDeleted=true, deletedAt=now` (NOT `findByIdAndDelete`). Add `POST /api/income/:id/restore` that sets both back.
    - Every Income find call (list, dashboard, download) must add `{ isDeleted: { $ne: true } }` to queries so soft-deleted items remain invisible by default.
  - Frontend:
    - Create `frontend/expense-tracker/src/components/ui/Modal.jsx` reusable (backdrop, close on ESC, focus trap basic, animation classes).
    - Create `TransactionEditModal.jsx` shared for income & expense with dynamic theme (emerald/rose). Pre-populate fields on open.
    - Income/Expense rows: add click handler opening modal; add edit icon button visible on group hover (sibling of delete).
    - Income delete: call soft-delete endpoint; show toast with `{ action: { label: "Undo", onClick: async () => await restore(id) }, duration: 30_000 }`. After 30s (or if user dismisses), keep soft-deleted (server-side). Optimistically remove entry from local list on soft-delete, re-add on restore.
    - Expense delete stays hard-delete (no Undo) per spec.
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `rule` TR-4.1: Edit income → title updated in DB + UI without page reload. PUT /api/income/:id returns updated doc. Evidence: PATCH response + UI screenshot.
  - `rule` TR-4.2: Edit expense → same.
  - `rule` TR-4.3: Delete income → DB shows `isDeleted=true`; Undo clicked within 30s → `isDeleted=false`; item reappears in list. Evidence: 3 DB states + 3 UI states.
  - `rubric` TR-4.4: Edit modal UX; scale 1-5; anchors 1=bare inputs, 3=styled modal with validation, 5=modals with transitions, form validation inline messages, loading spinner on submit, cancel button works; threshold >= 4; evidence: screenshot of edit modal mid-edit.

## Task 5: Dark Mode Toggle (ThemeContext + Tokens)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None (file boundaries: index.css, new ThemeContext, sidebar, main.jsx — no conflict with Tasks 1/2/3/4)
- **Description**:
  - `index.css`: Add full token palette in `@theme` block: `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-surface-hover`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-accent-primary` (=primary), `--color-accent-secondary`, `--color-success`, `--color-error`, `--color-warning`, `--color-info`. Define both `:root` (light) and `.dark` (dark) overrides via `@custom-variant dark (&:where(.dark, .dark *))` or Tailwind v4 class strategy.
  - Replace hardcoded colors in CSS (e.g., body `#fcfbfc`, text `text-slate-900`, `bg-white`, `bg-emerald-100`, `bg-rose-100`, charts) with theme token-based semantic utility classes.
  - Update Recharts colors in dashboard (Home.jsx) via a helper `useChartColors()` that reads theme and returns token-derived palette.
  - Create `frontend/expense-tracker/src/context/ThemeContext.jsx` with `{ mode, setMode, resolvedTheme }` where mode ∈ {light, dark, system}. Persist to localStorage. On mount, read user preference from backend if authenticated (after Task 6: also PUT preferences when changed).
  - Wrap app in `ThemeProvider` in `main.jsx` (after UserProvider).
  - Sidebar header: add moon/sun toggle button; coordinate with Task 6 Settings page so both sources of truth are unified.
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rule` TR-5.1: Toggling dark mode in sidebar sets `document.documentElement.classList` to include `dark`; localStorage `theme` is updated. Reload preserves. Evidence: localStorage + DevTools classList screenshot.
  - `rule` TR-5.2: Dashboard chart colors adapt — pie slices, bars, and tooltip backgrounds readable in dark mode without washed-out contrast. Evidence: dark-mode dashboard screenshot.
  - `rubric` TR-5.3: Dark mode completeness; scale 1-5; anchors 1=sidebar/dashboard only partial, 3=main pages OK but Login/SignUp/modals broken, 5=every page (auth + dashboard + future settings/budgets/recurring) and every component fully themed, skeleton loaders adapt; threshold >= 4; evidence: full screenshots of Login, SignUp, Dashboard, Income in dark mode.

## Task 6: Profile Settings Page + New Auth Endpoints
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5 (ThemeContext preferences sync), Task 1 (toasts)
- **Description**:
  - Backend:
    - User model add `preferences` subdoc: `{ currency: { type: String, default: 'USD' }, theme: { type: String, enum: ['light','dark','system'], default: 'system' }, defaultIncomeCategory: { type: String, default: 'Salary' }, defaultExpenseCategory: { type: String, default: 'Food & Dining' } }`.
    - Add `PUT /api/auth/profile` (accepts fullName, email — validate email uniqueness excluding self).
    - Add `POST /api/auth/change-password` (accepts `oldPassword`, `newPassword` → verify old with `matchPassword`, validate new >= 8 chars).
    - Add `GET /api/auth/preferences` and `PUT /api/auth/preferences`. On signup, set preferences defaults.
    - Update `GET /api/auth/me` and `/api/auth/profile-image` to return `preferences` subdoc so UserContext has it.
  - Frontend:
    - Extend UserContext to expose `updateProfile`, `changePassword`, `updatePreferences` actions and store merged `preferences` object.
    - Create `frontend/expense-tracker/src/pages/Dashboard/Settings.jsx` with 3 tab sections using `<button>` tab switches: Profile (avatar upload, name, email), Security (old/new/confirm password), Preferences (currency select, theme select/mode, default category selects).
    - Add nav item in `DashboardSidebar` `navItems`: label "Settings", icon `LuSettings`, to `/settings`.
    - In `App.jsx` add protected route `/settings`.
    - ThemeContext: on authenticated user load, if `user.preferences.theme` differs from localStorage, reconcile (user's saved preference wins — or sync on change via UserContext).
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-6.1: PUT /api/auth/profile updates name/email. GET /me after returns new values. Evidence: API response.
  - `rule` TR-6.2: POST /api/auth/change-password with wrong oldPassword → 401; with correct → 200 and new password works on next login. Evidence: 2 API calls.
  - `rule` TR-6.3: Settings page accessible via `/settings` and sidebar menu; all 3 tabs render. Evidence: 3 tab screenshots.
  - `rubric` TR-6.4: Settings page organization; scale 1-5; anchors 1=single flat form, 3=separate sections, 5=well-spaced tabs, save buttons per section, inline validation, success toasts, currency display actually uses formatCurrency locale switch; threshold >= 4.

## Task 7: Budget Goals & Alerts (Model + Routes + UI)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3 (query patterns), Task 5 (theme for status colors), Task 6 (preferences pattern)
- **Description**:
  - Backend:
    - Create `backend/models/BudgetGoal.js` schema: `{ user, category, month: String (YYYY-MM), targetAmount: Number, alertsEnabled: { type: Boolean, default: true }, timestamps }`. Compound unique index on `{ user, category, month }`.
    - Add CRUD: `GET /api/budgets?month=YYYY-MM`, `POST /api/budgets`, `PUT /api/budgets/:id`, `DELETE /api/budgets/:id`.
    - Add `GET /api/budgets/summary?month=YYYY-MM` that for the user and month joins Expense aggregates and returns `[{ category, targetAmount, spent, percentUsed, alert: percentUsed >= 80 }]`.
  - Frontend:
    - Create `frontend/expense-tracker/src/pages/Dashboard/Budgets.jsx`: grid of budget cards with progress bar (`<div class="h-2">`) colored by percentUsed (under 60=success, 60-79=warning, 80+=error). Add "Add Budget" modal.
    - Dashboard `Home.jsx`: add top-right alert banner component if any budget in summary is alert=true; add "Budget Status" stats card section (or small grid below recent) showing top 3 closest to limit.
    - Add nav item in sidebar "Budgets" icon `LuTarget` to `/budgets`.
    - Add route in App.jsx.
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rule` TR-7.1: Create budget via API POST; /budgets/summary returns correct spent aggregation (matching actual expense records for that month/category). Evidence: summary JSON.
  - `rule` TR-7.2: Dashboard banner appears only when a budget has percentUsed >= 80; disappears when budget is increased or expenses reduced. Evidence: banner on/off screenshots.
  - `rubric` TR-7.3: Budget visual clarity; scale 1-5; anchors 1=plain numbers, 3=progress bars, 5=color-coded progress, remaining amount badge, month selector, add/edit/delete inline, sortable by remaining %; threshold >= 4.

## Task 8: Recurring Transactions (Model, Scheduler, UI Page)
- **Status**: `pending`
- **Priority**: medium-high
- **Depends On**: Task 4 (modal component reuse), Task 3 (list patterns)
- **Description**:
  - Backend:
    - Create `backend/models/RecurringTransaction.js`: `{ user, type: { enum: ['income','expense'] }, title, amount, category, description, frequency: { enum: ['daily','weekly','biweekly','monthly','yearly'] }, startDate, nextRunDate, lastRunDate, endDate?, isActive: { default: true }, timestamps }`.
    - Add CRUD endpoints `/api/recurring` (GET, POST, PUT, DELETE). Add `POST /api/recurring/:id/pause` (sets `isActive=false`), `POST /api/recurring/:id/resume` (sets isActive=true and ensures nextRunDate >= now or today).
    - Add dev/test `POST /api/recurring/trigger` (optionally `protect`-only admin or allow same user: processes all due recurring NOW for testing).
    - In `server.js`, write a function `runRecurringScheduler()` that every hour (`setInterval`) finds docs where `isActive && nextRunDate <= now`, creates the matching Income or Expense doc via `Income.create / Expense.create`, updates `lastRunDate = now` and `nextRunDate = advance(...)`. Helper `advanceByFrequency(date, frequency)` returns new Date correctly incremented (monthly uses day clamped to last day of target month).
    - Register on server start: call once at boot (in case of missed runs while off — but don't duplicate; only advance once).
  - Frontend:
    - Create `frontend/expense-tracker/src/pages/Dashboard/Recurring.jsx` with list, "Add Recurring" modal (reusing Modal + form pattern with type toggle, frequency enum dropdown, start/end dates, active switch). List shows pause/resume toggle and edit/delete actions.
    - Dashboard Home.jsx: add "Upcoming Recurring" card below stats or in empty column, shows next 5 entries (by nextRunDate ASC).
    - Add sidebar nav "Recurring" icon `LuRepeat` to `/recurring`.
    - Add route in App.jsx.
- **Acceptance Criteria Addressed**: AC-11, AC-12
- **Test Requirements**:
  - `rule` TR-8.1: POST /api/recurring/trigger creates N Income/Expense docs and updates lastRunDate/nextRunDate correctly. Evidence: before/after MongoDB counts and Recurring doc dates.
  - `rule` TR-8.2: Pause endpoint → `isActive=false`; trigger does not create. Resume → gets picked up again. Evidence: DB flags.
  - `rubric` TR-8.3: Recurring page UX; scale 1-5; anchors 1=list only, 3=CRUD, 5=CRUD + pause/resume visual badges, frequency preview text ("Every 1st of month"), upcoming run date shown, search/filter (reuse Task3 SearchBar if possible); threshold >= 4.

## Task 9: CSV / PDF Exports (Backend + Frontend Menu)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3 (respects filters when downloading?), Task 7 (summary info available)
- **Description**:
  - Backend:
    - Add `backend/package.json` dep `"pdfkit": "^0.15.0"` (or latest stable).
    - Add `GET /api/income/download/csv` and `GET /api/expense/download/csv`: same filter query support as list endpoints, stream rows as CSV (headers: Title, Category, Amount, Description, Date). Use native `res.type('csv')` + manual stringify or a tiny function — no new dep for CSV.
    - Add `GET /api/transactions/download/pdf?type=all|income|expense&period=month|year|all`. Inside: query relevant records (with same filter support + dashboard totals summary). Render using PDFKit: title "Expense Tracker Report", date range subtitle, summary table (Total Income, Total Expense, Balance), then detailed transaction table (alternating row shading). Pipe to `res`.
    - Update existing Excel downloads to also accept filter query params for consistency.
  - Frontend:
    - Replace the single "Download Excel" button on Income/Expense header with a split dropdown menu: Export ▾ → Excel, CSV, PDF (Month / Year / All). Create `frontend/expense-tracker/src/components/ui/DropdownMenu.jsx`.
    - Dashboard Home: add top-right "Export Report" menu with: Combined PDF, Income CSV, Expense CSV.
    - Respect current active filters when exporting (pass URLSearchParams used for the list).
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `rule` TR-9.1: Income CSV download opens in Excel/Sheets correctly with header row and matching rows count equal to DB count for user. Evidence: file content.
  - `rule` TR-9.2: Combined PDF download shows >= 2 sections (summary + transaction list) and renders in browser PDF viewer without corruption. Evidence: PDF viewer screenshot.
  - `rubric` TR-9.3: Export menu & discoverability; scale 1-5; anchors 1=single button, 3=dropdown menu, 5=menu with icons, keyboard nav, period submenu, loading state on click, filter-aware label ("Export Filtered 5 items"); threshold >= 4.

## Task 10: End-to-End Verification + Docs/Notes Cleanup
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1–9
- **Description**:
  - Manual smoke walkthrough per spec AC-13 (list of actions). Document results verbally.
  - Cleanup sweep:
    - Remove unused imports/variables in every file touched; run `npm run lint` (frontend).
    - Remove any TODO/FIXME/commented-out dead code found during tasks.
    - Ensure backend server.js `console.error` calls remain (useful) but no stray `console.log` debug statements.
    - Verify `hepler.js` filename rename is NOT done (avoid breaking changes); but if an alias is desired just add `helper.js` re-export to avoid import drift — or keep filename as-is.
    - Confirm index.css @import order (Tailwind v4 import semantics).
  - Ensure consistent API error shape `{ message: string }` on all new endpoints (400/401/404/500).
  - Final build: `cd frontend/expense-tracker && npm run build` → passes.
- **Acceptance Criteria Addressed**: AC-13, AC-14, AC-15
- **Test Requirements**:
  - `rule` TR-10.1: `npm run build` exit code 0; `npm run lint` exit code 0 (no errors, warnings acceptable only if pre-existing). Evidence: terminal log.
  - `rule` TR-10.2: Full smoke walkthrough documented (console empty, no 4xx/5xx on happy path). Evidence: DevTools Console + Network tab screenshots.
  - `rubric` TR-10.3: Overall polish and uniformity; scale 1-5; anchors 1=features work but inconsistent, 3=mostly uniform, 5=SaaS-grade uniformity of spacing, icons, shadows, rounded corners, empty states, badging, token usage, no remaining hardcoded hex in component JSX where a semantic token exists; threshold >= 4.

---

## Dependency Graph (for information)
```
Task 1 (Toast) ─┐
Task 2 (Anim)  ─┼─► Task 4 (Edit/Undo) ─┬─► Task 10 (Verify)
Task 5 (Theme) ─┤                       │
Task 3 (Search)─┼─► Task 7 (Budgets) ───┤
                ├─► Task 8 (Recurring) ──┤
                └─► Task 9 (Export) ─────┘
Task 6 (Settings) ◄──► Task 5 (Theme sync)
```
Tasks 1, 2, 3, 5 are independent foundations and can be implemented first (serial is safer to avoid merge conflicts on shared files: main.jsx, index.css, DashboardSidebar, App.jsx). Implement in listed order above.
