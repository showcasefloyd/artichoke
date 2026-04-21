# Plan: js-artichoke Full-Stack Upgrade

## TL;DR
Upgrade the app in 5 phases: (1) fix the broken REST API, (2) add PHPUnit testing, (3) migrate frontend to React + TypeScript + Bootstrap 5, (4) add frontend testing with Jest + RTL, (5) add debugging infrastructure. Keep the exec-php bridge. Work step-by-step with approval at each milestone.

---

## Key Facts (from codebase research)
- PHP ComicDB models have FULL CRUD already (insert/update/delete in each model class)
- Express previously had ONLY GET routes — no POST/PUT/DELETE at all (fixed in Phase 1)
- Admin forms partially bypass API and POST directly to `app/admin/actions.php` (legacy PHP)
- Angular admin controller `saveTitle()` was never actually implemented
- 7 existing GET routes work correctly
- No tests of any kind exist yet
- Stack decisions: TypeScript React, keep PHP bridge, Jest+RTL+PHPUnit, backend first

---

## ✅ Phase 1: Complete the REST API (Backend CRUD) — DONE

### Goal: titles, series, and issues can be created, updated, and deleted via API

**Changes made:**
- Added 9 PHP functions to `app/api.php`: `createTitle`, `updateTitle`, `deleteTitle`, `createSeries`, `updateSeries`, `deleteSeries`, `createIssue`, `updateIssue`, `deleteIssue`
- Added matching `POST`/`PUT`/`DELETE` Express routes to `app/index.js`
- Added `bodyParser.json()` middleware for JSON request bodies
- Fixed `Title::insert()` running INSERT query twice (duplicate key bug)
- Defined `DB_OK` constant in `DB.php` (leftover from PEAR DB migration)
- Replaced deprecated `strftime()` with `date()` in `Issue.php` and `api.php`

**Verify:** All 9 endpoints tested via curl — ✅ M1 complete.

---

## Phase 2: PHP Testing (PHPUnit)

### Goal: PHPUnit test suite covering all ComicDB model CRUD

**Steps:**
1. Add `phpunit/phpunit` to `composer.json` (require-dev)
2. Add `phpunit.xml` config pointing to a `tests/` directory
3. Create test database bootstrap (separate test DB using existing MySQL schema)
4. Write unit tests for `ComicDB_Title` (create, read, update, delete)
5. Write unit tests for `ComicDB_Series`
6. Write unit tests for `ComicDB_Issue` (including condition persistence)
7. Write integration tests for `api.php` functions
8. Add `"test:php": "vendor/bin/phpunit"` to `package.json` scripts

**Files:** `composer.json`, `phpunit.xml` (new), `tests/ComicDB/TitleTest.php` (new), `tests/ComicDB/SeriesTest.php` (new), `tests/ComicDB/IssueTest.php` (new), `tests/api/ApiTest.php` (new)

**Verify:** `composer test` runs and passes — M2.

---

## Phase 3: React + TypeScript Frontend Migration

### Goal: Replace Angular 1.x with React + TypeScript; replace Bootstrap 3 with Bootstrap 5

#### 3a. Tooling Setup
1. Install: `react`, `react-dom`, `@types/react`, `@types/react-dom`, `typescript`, `ts-loader`
2. Uninstall: `angular`, `angular-resource`, `angular-route`
3. Add `tsconfig.json` with JSX support
4. Update `webpack.config.js` to handle `.tsx`/`.ts` entry points
5. Replace `bootstrap` + `bootstrap-sass` (v3) with `bootstrap` v5
6. Update `src/sass/main.scss` imports for Bootstrap 5 (different variable/mixin names)

#### 3b. Catalog App (read-only, `app/index.html`)
7. Create `src/modules/ts/app/` with React components:
   - `App.tsx` — root component, state for selected title/series/issue
   - `TitleList.tsx` — left sidebar list of titles
   - `SeriesList.tsx` — series under a title
   - `IssueGrid.tsx` — grid of issue numbers (owned/missing)
   - `IssueDetail.tsx` — right panel issue metadata
8. Replace Angular bootstrap in `app/index.html` with React root mount
9. Update webpack entry point for the catalog bundle

#### 3c. Admin App (CRUD, `app/admin.html`)
10. Create `src/modules/ts/admin/` with React components:
    - `AdminApp.tsx` — root component with routing/state
    - `TitleEditor.tsx` — load/edit/delete a title
    - `TitleCreator.tsx` — create new title
    - `SeriesEditor.tsx` — edit series
    - `IssueEditor.tsx` — edit issue
11. Wire all forms to Phase 1 API endpoints (POST/PUT/DELETE)
12. Replace Angular bootstrap in `app/admin.html` with React root mount
13. Remove legacy `app/views/*.html` ng-include templates (replaced by React components)
14. Remove legacy `app/admin/actions.php` form handling (API handles all writes now)

**Files:** `webpack.config.js`, `tsconfig.json` (new), `package.json`, `src/modules/ts/**` (new), `src/sass/main.scss`, `src/sass/_admin.scss`, `app/index.html`, `app/admin.html`

**Verify:**
- Catalog page loads, title/series/issue drill-down works — M3b
- Admin page can create, edit, delete a title, series, and issue — M3c
- Bootstrap 5 styles rendering correctly

---

## Phase 4: Frontend Testing (Jest + RTL)

### Goal: Unit and integration tests for all React components

**Steps:**
1. Install: `jest`, `ts-jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-environment-jsdom`
2. Add `jest.config.ts`
3. Update `package.json` `"test"` script to run Jest
4. Write tests for each component:
   - `TitleList` — renders titles, click propagates
   - `IssueGrid` — renders grid correctly
   - `TitleEditor` — form submit calls PUT API
   - `TitleCreator` — form submit calls POST API
5. Mock fetch calls with `jest.fn()` or `msw`

**Files:** `jest.config.ts` (new), `package.json`, `src/modules/ts/**/__tests__/*.test.tsx` (new)

**Verify:** `npm test` runs and passes — M4.

---

## Phase 5: Debugging Infrastructure

### Goal: Structured error handling throughout the stack

**Steps:**
1. Add Express error-handling middleware to `app/index.js` (catch exec-php errors, return structured JSON with status codes)
2. Add React `ErrorBoundary.tsx` component wrapping catalog and admin roots
3. Add user-friendly error messages in React components on API call failure
4. Verify `ARTICHOKE_DEBUG=1` env var still surfaces PHP errors in Docker as documented

**Files:** `app/index.js`, `src/modules/ts/ErrorBoundary.tsx` (new)

**Verify:** Error boundaries catch and display API failures gracefully — M5.

---

## Scope Boundaries

**Included:**
- Complete REST API (titles, series, issues)
- React + TypeScript frontend (catalog + admin)
- Bootstrap 5 migration
- PHPUnit + Jest testing
- Basic error handling and boundaries

**Excluded (for now):**
- Image/cover photo upload
- User authentication / login
- Pagination or search
- Mobile-responsive redesign beyond Bootstrap 5 defaults
- CI/CD pipeline
- Deployment to production server
- Legacy PHP admin pages in `app/admin/` — left as-is unless they break

---

## Milestone Checkpoints

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | All 9 new API routes respond correctly to curl | ✅ Done |
| M2 | `composer test` passes for all ComicDB models | ⬜ |
| M3a | webpack builds TypeScript React bundles without errors | ⬜ |
| M3b | Catalog page fully functional in React | ⬜ |
| M3c | Admin CRUD fully functional in React | ⬜ |
| M4 | `npm test` passes for all React components | ⬜ |
| M5 | Error boundaries catch and display API failures gracefully | ⬜ |
