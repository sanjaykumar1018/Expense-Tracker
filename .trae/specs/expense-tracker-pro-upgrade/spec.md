# Expense Tracker - Professional Upgrade Product Requirements Document

## Overview
- **Summary**: Upgrade the existing MERN Expense Tracker application with 10 professional-grade features: Toast Notifications System, Search & Filters, Edit & Delete (soft) with Undo, Profile Settings Page, Budget Goals & Alerts, CSV/PDF Exports, Animations & Micro-interactions, Dark Mode Toggle, Recurring Transactions, and End-to-End Verification.
- **Purpose**: Transform a basic CRUD expense tracker into a polished, production-ready financial management application with modern UX/UI standards and enterprise-grade features.
- **Target Users**: Individual users managing personal finances, students, and junior developers learning full-stack best practices.

## Goals
1. Replace ad-hoc toast calls with a centralized, extensible Toast Notification system (Context + Hook).
2. Add server-side search/query filtering for income and expense lists, plus UI controls.
3. Implement Edit operations for both Income and Expense; add soft-delete with Undo capability for Income.
4. Deliver a full Profile Settings page with editable user data, password change, and preferences.
5. Build Budget Goals (per category/month) with visual progress bars and in-app alerts.
6. Offer combined report exports: CSV + PDF for both income and expense data, plus a combined option.
7. Layer Tailwind-based animations and micro-interactions across all pages and interactions.
8. Provide a persistent Dark/Light mode toggle with a ThemeContext and CSS token system.
9. Implement Recurring Transactions with a scheduler, model, routes, and dedicated UI page.
10. Verify end-to-end with a smoke test pass and clean up documentation/notes.

## Non-Goals
- Mobile native app (PWA-only considerations are out of scope).
- Multi-user collaboration or shared budgets.
- Integration with third-party bank feeds or payment gateways.
- Internationalization (i18n) beyond the current English locale.
- Email notifications beyond in-app alerts (no SMTP setup).

## Background & Context
The current app is based on the MERN stack tutorial (YouTube "Time To Program", video ID PQnbtnsYUho).
- **Stack**: Node.js + Express 4.x, Mongoose 9.x, MongoDB Atlas, React 19, Vite, Tailwind CSS v4, Recharts, Axios, react-hot-toast.
- **Backend**: 17 endpoints in `server.js` covering Auth, Income, Expense, and Dashboard. Models: User, Income, Expense. Middleware: JWT auth (`protect`). Excel export via `xlsx`. Profile upload via Multer.
- **Frontend**: 3 dashboard pages (Home/Dashboard, Income, Expense) + 2 auth pages (Login, SignUp). Context: `UserContext`. Shared: `DashboardSidebar`, `AuthLayout`, `StatsInfoCard`, `Input`, `PasswordInput`, `ProfilePhotoSelector`.
- **Hard Constraint (Mongoose 9)**: async `pre("save")` hooks must NOT call `next()`; simply return.
- **Hard Constraint (Env)**: Backend runs on `localhost:5000`; Frontend on Vite (current observed `localhost:5174`). Network access is 0.0.0.0/0 for Atlas.

## Functional Requirements

### FR-1: Toast Notifications System (Global Hook + Context)
A centralized `ToastContext` with a `useToast` hook exposing `success()`, `error()`, `info()`, `warning()` methods. All existing `react-hot-toast` direct calls in Login, SignUp, Home, Income, Expense pages must route through this hook. Each toast must support title, description, duration, and action buttons (for undo).

### FR-2: Search & Filtering (Backend + Frontend)
- Backend: `GET /api/income` and `GET /api/expense` accept query parameters: `search` (title/description), `category`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`, `sortBy` (date/amount), `sortOrder` (asc/desc).
- Frontend: Income and Expense pages show a search bar plus filter chips/panel for category, date range, amount range, and sort. Dashboard Recent Transactions also gets a search box.

### FR-3: Edit & Soft-Delete + Undo
- Add `PUT /api/income/:id` and `PUT /api/expense/:id` endpoints with ownership checks.
- Income model adds `isDeleted` (soft-delete) and `deletedAt` fields; `DELETE /api/income/:id` sets these instead of removing. A new `POST /api/income/:id/restore` undoes within 30 seconds via frontend toast action. Expense keeps hard delete for now.
- Frontend: Clicking an Income/Expense row opens a modal pre-filled with editable fields. Income delete toast shows "Undo" button for 30s.

### FR-4: Profile Settings Page + New Auth Endpoints
- New page: `/settings` (sidebar entry "Settings"). Tabs: Profile (name, email, image upload), Security (change old password → new password + confirm), Preferences (currency, default category, dark mode — syncs with ThemeContext).
- New endpoints: `PUT /api/auth/profile` (update name/email), `POST /api/auth/change-password`, `GET /api/auth/preferences`, `PUT /api/auth/preferences`.
- User model adds `preferences` subdoc: `currency` (default "USD"), `theme` (default "system"), `defaultIncomeCategory`, `defaultExpenseCategory`.

### FR-5: Budget Goals & Alerts
- New model: `BudgetGoal` (user, category, month (YYYY-MM), targetAmount, alertsEnabled).
- Endpoints: full CRUD `GET/POST/PUT/DELETE /api/budgets` + `GET /api/budgets/summary` (returns spent vs target per category with percentUsed and alert status).
- New page: `/budgets` (sidebar) with per-category budget cards, progress bars, and a top alert banner when any category >= 80%. Dashboard adds "Budget Status" summary card.

### FR-6: CSV / PDF Exports (Backend + Frontend Menu)
- Backend: Keep existing Excel download; add:
  - `GET /api/income/download/csv` → CSV file
  - `GET /api/expense/download/csv` → CSV file
  - `GET /api/transactions/download/pdf?type=all|income|expense&period=month|year|all` → PDF (generated server-side with a lightweight lib such as `pdfkit` or a React-rendered PDF approach).
- Frontend: Income/Expense header buttons open a dropdown menu: Excel, CSV, PDF (period selector). Dashboard adds an "Export" top-right menu for combined reports.

### FR-7: Animations & Micro-interactions (Tailwind + CSS only)
- Page route transitions (fade/slide).
- Stat cards animate in with staggered opacity + translateY.
- Hover and focus states for buttons, inputs, sidebar items, table rows (lift + shadow).
- Chart data mounts with animation; Recharts `isAnimationActive` enabled.
- Modal open/close transitions (scale + backdrop fade).
- Skeleton loaders replace spinners on all async data pages.

### FR-8: Dark Mode Toggle (ThemeContext + tokens)
- `ThemeContext` with `mode`: "light" | "dark" | "system"; persists in `localStorage` and `User.preferences.theme`.
- Tailwind dark mode via class strategy (`dark:` variant). All colors migrated to CSS tokens in `@theme` blocks (surface, surface-alt, text-primary, text-secondary, border, accent-primary/secondary, success/error/warning/info).
- Toggle button in sidebar header and on Settings → Preferences. Charts and Recharts components adapt colors.

### FR-9: Recurring Transactions (Model, Scheduler, UI)
- New model: `RecurringTransaction` (user, type: income|expense, title, amount, category, description, frequency: daily|weekly|biweekly|monthly|yearly, startDate, nextRunDate, lastRunDate, endDate (optional), isActive).
- Scheduler: Node.js `setInterval` loop (every 1 hour) checking `nextRunDate <= now` and creating corresponding Income/Expense records, then advancing `nextRunDate` by frequency.
- Endpoints: CRUD `GET/POST/PUT/DELETE /api/recurring` + `POST /api/recurring/:id/pause`, `POST /api/recurring/:id/resume`.
- New page: `/recurring` (sidebar) with list, create/edit modal, and status badges (active/paused). Dashboard adds "Upcoming Recurring" card showing next 5 scheduled.

### FR-10: End-to-End Verification + Docs Cleanup
- Full smoke test walkthrough: signup → login → add/edit/delete income & expense → search/filters → profile settings → budgets → dark mode → recurring → exports.
- Verify no console errors or 4xx/5xx responses in browser Network tab during walkthrough.
- Clean up any unused imports, commented-out code, and `TODO` notes across the repo. Verify build passes (`npm run build` frontend, ESLint clean).

## Non-Functional Requirements
- **NFR-1 (Performance)**: All list endpoints with filters respond in < 500 ms for < 1000 records per user.
- **NFR-2 (Accessibility)**: All new interactive elements (toasts, modals, toggles, menus) are keyboard accessible and include ARIA labels; color contrast >= 4.5:1 in both themes.
- **NFR-3 (Security)**: All new endpoints are protected with `protect` middleware. Passwords re-hash on change. No tokens/credentials logged or leaked to client.
- **NFR-4 (Maintainability)**: New code follows existing patterns (file structure, naming, async patterns, error shape `{ message: string }`). No duplicate logic across pages — extract shared hooks/components.
- **NFR-5 (Compatibility)**: Works on Chrome, Firefox, Edge latest 2 versions. Responsive down to 375px width.
- **NFR-6 (Persistence)**: Theme, preferences, and toast behavior persist across sessions.

## Constraints
- **Technical**: Must continue using Mongoose 9.x, Express 4.x, React 19, Tailwind CSS v4, Recharts 3.x. Mongoose async pre-save hooks MUST NOT call `next()`.
- **Business**: Minimal new external dependencies. Prefer native APIs or libraries already used. If PDF lib is added, keep it < 1 MB unpacked.
- **Dependencies**: Tasks 3, 4, 5, 6, 9 depend on backend model changes first then frontend; tasks 1, 2, 7, 8 can overlap but must not conflict on shared files (App.jsx contexts, index.css theme, sidebar).

## Assumptions
- Users will grant localStorage access for theme/preferences persistence.
- MongoDB Atlas remains reachable (0.0.0.0/0) during development.
- PDF generation is acceptable as a simple table + summary report (no advanced layout).
- Recurring transaction scheduler runs within the single Node process (no distributed worker required).

## Acceptance Criteria

### AC-1: Centralized Toast Hook Wires All Notifications
- **Type**: `rule`
- **Given**: User is logged in and performs actions (add, edit, delete, login, signup, download)
- **When**: Any success/error/info event occurs
- **Then**: The toast is rendered via the `useToast` hook (no direct `toast.xxx` calls remain in page files)
- **Pass Condition**: Grep of `frontend/src` finds zero direct imports of `react-hot-toast` in `pages/` or `components/`; all calls go through `hooks/useToast` or `ToastContext`
- **Evidence**: `Grep` for `from "react-hot-toast"` in frontend/src/pages and frontend/src/components returns empty; spot-check Login/Income/Expense flows show styled toasts

### AC-2: Income and Expense Support Server-Side Filter Query Params
- **Type**: `rule`
- **Given**: A user has multiple income/expense records with mixed categories, dates, and amounts
- **When**: Client calls `GET /api/income?search=Salary&category=Salary&dateFrom=2026-08-01&dateTo=2026-09-01&minAmount=1000&maxAmount=100000&sortBy=amount&sortOrder=desc`
- **Then**: Server returns only matching records, correctly sorted, with 200 OK
- **Pass Condition**: Postman/Thunder Client request with the above query returns a filtered array; response is a JSON array with length > 0 and every entry matches the filter constraints
- **Evidence**: curl or Thunder Client screenshot/response showing filtered results for both income and expense

### AC-3: Frontend Search + Filter UI Appears and Filters Data
- **Type**: `rule`
- **Given**: User is on Income or Expense page with records
- **When**: User types in search bar, selects category chip, adjusts date range, or changes sort
- **Then**: The list re-renders with matching items without page reload, and URL query string reflects state (optional but preferred)
- **Pass Condition**: Typing a title substring reduces the list; category filter shows 0 items when no entries match; sort by amount desc reorders list correctly
- **Evidence**: Recorded browser interaction showing search + filter + sort produce correct list states

### AC-4: Edit Modal Works for Both Income and Expense
- **Type**: `rule`
- **Given**: User has at least one income and one expense entry
- **When**: User clicks an entry row → modal opens → edits fields → saves
- **Then**: PUT call succeeds, list reflects updated values, success toast appears
- **Pass Condition**: Database document is updated (verified with Atlas data browser); frontend list shows updated title/amount/category
- **Evidence**: Updated MongoDB document + updated UI list entry

### AC-5: Income Soft-Delete + Undo within 30 Seconds
- **Type**: `rule`
- **Given**: An income entry exists
- **When**: User deletes the income → undo toast appears → user clicks "Undo" within 30s
- **Then**: Entry is restored (isDeleted=false, deletedAt=null) and reappears in the list
- **Pass Condition**: After delete, `isDeleted=true`; after Undo, `isDeleted=false`; if no Undo in 30s the entry remains soft-deleted (can be added back later separately)
- **Evidence**: Two MongoDB states (after delete, after Undo) + UI toast with working Undo button

### AC-6: Profile Settings Page with Tabs Saves Correctly
- **Type**: `rule`
- **Given**: Authenticated user
- **When**: User edits name/email, changes password, updates preferences (currency), and saves each
- **Then**: Each PUT returns 200; user object in UserContext reflects changes; preferences persist after reload
- **Pass Condition**: Reloading the settings page shows saved values; wrong old-password attempt returns 401 with descriptive message
- **Evidence**: Settings page screenshots after save + reload; failed change-password returns correct error shape

### AC-7: Budget Goals Produce Dashboard Summary + Alerts at 80%
- **Type**: `rule`
- **Given**: User sets a $1000 Shopping budget for the current month and has $850 in Shopping expenses
- **When**: Dashboard loads and Budgets page loads
- **Then**: Budget progress bar shows >= 80% with warning color; alert banner appears on dashboard and budgets page
- **Pass Condition**: `/api/budgets/summary` returns `{ category: "Shopping", targetAmount: 1000, spent: 850, percentUsed: 85, alert: true }`; UI banner renders with "At risk" styling
- **Evidence**: Budget summary API response + alert banner screenshot

### AC-8: CSV and PDF Exports Download Readable Files
- **Type**: `rule`
- **Given**: User has at least 2 income and 2 expense entries
- **When**: User clicks Export → CSV on Income page and Export → PDF (All) on Dashboard
- **Then**: Downloads initiate automatically; CSV opens in Excel with correct headers; PDF renders transactions table + totals
- **Pass Condition**: CSV contains columns Title, Category, Amount, Description, Date; PDF contains same data + summary rows and opens without corruption
- **Evidence**: Saved CSV + PDF files showing correct content (open and screenshot)

### AC-9: Animations Present and Non-blocking Across Pages
- **Type**: `rubric`
- **Dimension**: Animation coverage and smoothness
- **Scale**: 1-5
- **Anchors**: 1 = no animations beyond baseline; 3 = some hover/load animations but missing staggered cards/skeleton/modal; 5 = every page has staggered card mount, skeleton loaders before data, hover/focus micro-interactions, modal transitions, route transitions, Recharts animations smooth
- **Pass Threshold**: >= 4
- **Evidence**: Visual walkthrough of Home → Income → Expense → Settings → Budgets → Recurring with video or screenshots showing animated states

### AC-10: Dark Mode Persists and All UI Adapts
- **Type**: `rule`
- **Given**: User toggles dark mode on Settings or sidebar
- **When**: Theme switch occurs, then page is refreshed or user re-logs in
- **Then**: Sidebar, stat cards, modals, toasts, charts, all pages re-render in dark palette; localStorage and User.preferences.theme both record the choice
- **Pass Condition**: Page refresh preserves theme; dashboard charts use dark-compatible colors; text contrast >= 4.5:1 in both themes (verified via DevTools color picker)
- **Evidence**: Screenshots of Dashboard + Income/Expense in dark mode; localStorage + user.preferences.theme values

### AC-11: Recurring Transactions Scheduler Creates Entries at Next Run
- **Type**: `rule`
- **Given**: User creates an active monthly recurring expense "Rent $500" with startDate = today
- **When**: Scheduler tick runs (can be simulated by manually setting nextRunDate to the past and triggering a POST /api/recurring/trigger for testing)
- **Then**: A new Expense record is inserted with the recurring's fields; lastRunDate = now; nextRunDate advanced by 1 month
- **Pass Condition**: After trigger, Expense collection contains +1 matching entry; RecurringTransaction lastRunDate/nextRunDate advanced
- **Evidence**: MongoDB documents before and after trigger + API response from trigger endpoint

### AC-12: Recurring Transactions Page Manages CRUD + Pause/Resume
- **Type**: `rule`
- **Given**: Authenticated user
- **When**: User creates, edits, pauses, resumes, and deletes a recurring transaction via /recurring page
- **Then**: Each action returns 200; list updates; status badge (active/paused) reflects state
- **Pass Condition**: After pause, `isActive=false`; after resume, `isActive=true` and nextRunDate set appropriately; delete removes document
- **Evidence**: UI screenshots + MongoDB docs for each state

### AC-13: Full Smoke Walkthrough Completes with Zero Console Errors
- **Type**: `rule`
- **Given**: Clean browser session
- **When**: Manual walkthrough: SignUp → Login → Add Income → Edit Income → Soft Delete + Undo → Search/Filter → Add Expense → Edit Expense → Delete Expense → Update Profile → Change Password → Toggle Dark Mode → Create Budget → Create Recurring → Download CSV → Download PDF → Logout
- **Then**: Every action succeeds; browser console has 0 JS errors; Network tab shows 0 4xx/5xx except expected 401s from invalid test attempts
- **Pass Condition**: DevTools Console empty (no errors); Network tab filtered by 4xx/5xx is empty during successful path
- **Evidence**: Console screenshot (empty) + Network tab screenshot (no 4xx/5xx in success path)

### AC-14: Build + Lint Pass Cleanly
- **Type**: `rule`
- **Given**: Final implementation state
- **When**: `cd frontend/expense-tracker && npm run build` and `npm run lint` are executed
- **Then**: Both commands exit with code 0; no warnings or errors block output
- **Pass Condition**: Exit code 0 for both commands; dist folder generated without TS/JS errors
- **Evidence**: Terminal output showing clean build and lint

### AC-15: Professional Visual & UX Polish
- **Type**: `rubric`
- **Dimension**: Overall professional appearance, layout balance, and interaction delight
- **Scale**: 1-5
- **Anchors**: 1 = basic tutorial UI with gaps and inconsistency; 3 = consistent but utilitarian, missing hover states and visual hierarchy; 5 = SaaS-grade polish: consistent spacing, iconography, shadows, rounded corners, color tokens, coherent empty states, proper badges, balanced typography, responsive breakpoints feel intentional
- **Pass Threshold**: >= 4
- **Evidence**: Full-page screenshots of all routes in both light and dark themes, reviewed for uniformity

## Open Questions
- [ ] Should soft-deleted Income records be permanently purged after N days (e.g., 30 days cron)? If yes, define N. If no, keep indefinitely.
- [ ] Recurring Transaction scheduler: keep in-process setInterval or prefer a separate worker file? (Default: in-process for simplicity.)
- [ ] PDF library choice: `pdfkit` (Node-only, ~700 KB) vs client-side `@react-pdf/renderer` (~2 MB). (Default: pdfkit server-side.)
- [ ] Currency support in preferences: should formatCurrency actually switch locale/currency symbol, or is the preference stored but display stays USD for v1?
