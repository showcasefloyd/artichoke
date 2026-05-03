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

## ✅ Phase 2: PHP Testing (PHPUnit) — DONE

### Goal: PHPUnit test suite covering all ComicDB model CRUD

**Changes made:**
- Dropped PEAR repository from `composer.json` (unsupported in Composer 2) and added `phpunit/phpunit ^10` as `require-dev`; set `vendor-dir: app/vendor` to match existing install location
- Added `phpunit.xml` config with two test suites (ComicDB, Api) bootstrapped from `tests/bootstrap.php`
- Added `tests/bootstrap.php`: sets PHP include path, defines DB constants pointing at `comicdb_test`, runs schema setup
- Added `tests/db_bootstrap.php`: creates/resets `comicdb_test` using root credentials before each run; rebuilds schema from `app/sql/bootstrap_mysql.sql`
- Added `tests/ComicDBTestCase.php`: base class with per-test table truncation and `assertRowDeleted()` helper
- Added `tests/ComicDB/TitleTest.php`: 5 tests (insert, restore, update, delete, lifecycle flags)
- Added `tests/ComicDB/SeriesTest.php`: 6 tests (insert, restore, update, optional fields, delete, flags)
- Added `tests/ComicDB/IssueTest.php`: 7 tests including two for condition persistence (documents known bug)
- Added `tests/Api/ApiTest.php`: 9 integration tests calling all `api.php` CRUD functions directly
- Updated `docker/app/Dockerfile`: added `php-mbstring` and `php-xml` required by PHPUnit
- Updated `app/lib/config.inc`: guarded `define()` calls with `if (!defined(...))` to prevent redefinition warnings when test bootstrap runs first
- Added `"test:php"` npm script: runs `phpunit` inside Docker backend container
- Updated `.gitignore`: added `.vscode/` and `.phpunit.result.cache`

**Verify:** 28 tests, 47 assertions — all pass (`npm run test:php`) — ✅ M2 complete.

---

## Phase 3: React + TypeScript Frontend Migration

### Goal: Replace Angular 1.x with React + TypeScript; replace Bootstrap 3 with Bootstrap 5

#### 3a. Tooling Setup — DONE

**Changes made:**
- Installed `react`, `react-dom`, `bootstrap@^5` as runtime dependencies
- Installed `typescript`, `ts-loader`, `@types/react`, `@types/react-dom`, `mini-css-extract-plugin`, `webpack@^5`, `webpack-cli@^5`, `webpack-dev-server@^5`, `css-loader@^6`, `sass-loader@^14`, `ajv@^8` as dev dependencies
- Removed `angular`, `angular-resource`, `angular-route`, `bootstrap-sass` (v3), `extract-text-webpack-plugin`, `file-loader`, `url-loader`, `style-loader`
- Added `tsconfig.json` with `react-jsx` and `moduleResolution: bundler`
- Rewrote `webpack.config.js` for webpack 5: `MiniCssExtractPlugin`, `.tsx`/`.ts` rule via `ts-loader`, asset modules for fonts
- Updated `package.json` scripts: `webpack serve` for dev-client, `--mode production` for wpprod
- Added `src/modules/ts/declarations.d.ts` to declare `*.scss`/`*.css` module types for TypeScript
- Added stub entry points `src/modules/ts/app/index.tsx` and `src/modules/ts/admin/index.tsx`
- Updated `src/sass/main.scss`: replaced deprecated `@import` with `@use` for Dart Sass 3 compatibility

**Verify:** `npx webpack --mode development` compiles cleanly — ✅ M3a complete.

#### 3b. Catalog App (read-only, `app/index.html`) — DONE

**Changes made:**
- Replaced `app/index.html`: stripped all Angular attributes and markup, updated CSS link to new `app.css` webpack output, added `<div id="root">` React mount point, removed `vendor.js` reference
- Created `src/modules/ts/app/App.tsx`: root component with all state (`titles`, `openTitleId`, `seriesData`, `issues`, `issue`) and API fetch handlers (`grabSeries`, `grabIssues`, `grabIssue`); exports all shared TypeScript interfaces
- Created `src/modules/ts/app/TitleList.tsx`: sidebar with expand/collapse chevron toggle and inline nested series list
- Created `src/modules/ts/app/IssueGrid.tsx`: issue number grid, owned issues as clickable links, unowned as plain text
- Created `src/modules/ts/app/IssueDetail.tsx`: metadata table for a selected issue (all 15 fields)
- Fixed webpack-dev-server overlay: set `mode` dynamically via `NODE_ENV`, disabled overlay for warnings (errors only)

**Verify:** Catalog page loads at port 8093; title/series/issue drill-down works — ✅ M3b complete.

#### 3c. Admin App (CRUD, `app/admin.html`) — DONE

**Changes made:**
- Created `src/modules/ts/admin/AdminApp.tsx`: root component with sidebar (title dropdown, series list, issue list), discriminated union `AdminView` state, all panel routing
- Created `src/modules/ts/admin/TitleEditor.tsx`: load/edit/delete title via GET+PUT+DELETE `/title/:id`; stays open after save with success banner
- Created `src/modules/ts/admin/TitleCreator.tsx`: create title via POST `/title`; on create refreshes list and navigates to editTitle
- Created `src/modules/ts/admin/SeriesEditor.tsx`: edit/delete series via GET+PUT+DELETE `/series/:id` (added `GET /series/:id` route and `grabSerieById()` PHP function)
- Created `src/modules/ts/admin/SeriesCreator.tsx`: create series via POST `/series`
- Created `src/modules/ts/admin/IssueEditor.tsx`: edit/delete issue via GET raw+PUT+DELETE; uses `GET /issue/:id/raw` for unformatted field values
- Created `src/modules/ts/admin/IssueCreator.tsx`: create issue via POST `/issue`
- Added `GET /series/:id` and `GET /issue/:id/raw` Express routes and `grabSerieById()`/`grabIssueRaw()` PHP functions
- Fixed stale title dropdown: moved top-level `echo json_encode()` in `api.php` into `grabList()` function so `/list` route calls PHP at request time (not cached stdout)
- Replaced Angular bootstrap in `app/admin.html` with React root mount

**Verify:** Admin page can create, edit, delete a title, series, and issue — ✅ M3c complete.

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

## ✅ Phase 5: Debugging Infrastructure — DONE

### Goal: Structured error handling throughout the stack

**Changes made:**
- Added `sendPhpResult(res, err, result)` helper to `app/index.js`: returns `500 { error, detail }` JSON on PHP bridge error or empty result instead of sending empty body
- Replaced all `res.send(result)` calls in exec-php callbacks with `sendPhpResult()`
- Added Express 4-param error-handling middleware at the bottom of `app/index.js` as a catch-all
- Created `src/modules/ts/ErrorBoundary.tsx`: React class component that catches render errors and displays a Bootstrap danger alert
- Wrapped both `<App />` and `<AdminApp />` in `<ErrorBoundary>` in their respective `index.tsx` entry points
- Added `error` state + `res.ok` checks to all `fetch()` calls in `App.tsx`; displays a danger alert banner when any API call fails
- Updated `AdminApp.tsx` fetch calls (`loadTitles`, `loadSeries`, `loadIssues`) to check `res.ok` and call `setError()` on failure (banner was already wired)
- Verified `ARTICHOKE_DEBUG=1` env var still enables PHP `display_errors` in Docker via `global.inc`

**Verify:** Error boundaries catch and display API failures gracefully — ✅ M5 complete.

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
| M2 | `composer test` passes for all ComicDB models | ✅ Done |
| M3a | webpack builds TypeScript React bundles without errors | ✅ Done |
| M3b | Catalog page fully functional in React | ✅ Done |
| M3c | Admin CRUD fully functional in React | ✅ Done |
| M4 | `npm test` passes for all React components | ✅ Done |
| M5 | Error boundaries catch and display API failures gracefully | ✅ Done |
