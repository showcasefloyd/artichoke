# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install && composer install` |
| Start full dev stack | `npm run stack:up` (Docker) |
| Stop dev stack | `npm run stack:down` |
| Webpack watch (host) | `npm run wp:watch` |
| Webpack watch (Docker) | `docker compose run --rm frontend webpack --watch --progress` |
| Production build | `npm run wpprod` |
| Run PHP tests | `npm run test:php` |
| Dev server only | `npm run dev-server` (Express on port 3000) |
| Dev client only | `npm run dev-client` (webpack-dev-server on port 8093) |

## Architecture

**Artichoke** is a ComicBook catalog application combining modern frontend tooling with a legacy PHP data layer.

### Stack Layers

1. **Frontend**: React 19 + TypeScript in `src/modules/ts/` → bundled by Webpack 5 → served at `http://localhost:8093`
2. **Backend**: Express.js server in `app/index.js` (port 3000) → bridges API calls into PHP via `exec-php`
3. **Data Layer**: PHP classes in `app/lib/ComicDB/` → MySQL database (port 3307 in Docker)

### Key Directories

- **`src/modules/ts/`**: React application source (TypeScript/TSX) — two entry points:
  - `app/index.tsx`: main public catalog UI
  - `admin/index.tsx`: admin panel for data management
- **`src/sass/`**: SCSS stylesheets
- **`app/build/`**: Generated webpack output (do not hand-edit)
- **`app/lib/ComicDB/`**: PHP ORM-like classes (`Title.php`, `Series.php`, `Issue.php`, `Object.php` base class)
- **`app/sql/`**: Database schema and bootstrap scripts
- **`tests/`**: PHPUnit tests for PHP code

### Request Flow

1. Frontend makes HTTP request (API or page load)
2. Express `app/index.js` routes to `app/api.php` (for API) or serves static HTML
3. `app/api.php` executes PHP code and returns JSON
4. Frontend processes response and updates UI

## Build System

**Webpack 5** bundles TypeScript/React from `src/` into `app/build/`:

- **Entry points** (in `webpack.config.js`):
  - `app/index.tsx` → `app/build/js/app.js`
  - `admin/index.tsx` → `app/build/js/admin.js`
- **Loaders**: `ts-loader` for `.tsx`/`.ts`, `sass-loader` for SCSS, file loader for fonts
- **Plugins**: `CleanWebpackPlugin` clears old output; `MiniCssExtractPlugin` emits CSS separately
- **Dev server** (port 8093) serves from `app/` directory with source maps and proxy to Express backend
- **Production** mode tree-shakes and minifies via `npm run wpprod`

## Development Setup

### Docker (Recommended)

```bash
npm run stack:up
# Services on:
#   Frontend: http://localhost:8093
#   Backend: http://localhost:3000
#   MySQL: localhost:3307 (user: comicdb, pass: comicdb, db: comicdb)
#   Adminer: http://localhost:8100
```

Database is auto-bootstrapped from `app/sql/bootstrap_mysql.sql`. Data persists in Docker volume `db_data` across restarts.

### Local Development (Without Docker)

Requires local Node and PHP:

```bash
npm install
composer install
npm run dev-server   # starts Express on port 3000
npm run wp:watch     # in another terminal: watch Webpack changes
```

## Testing

- **PHP**: `npm run test:php` runs PHPUnit tests via Docker
  - Test files in `tests/ComicDB/` and `tests/Api/`
  - PHPUnit config in `phpunit.xml`
- **JavaScript**: Jest configured in `package.json` but not yet active (placeholder)

## Type Checking & Linting

- **TypeScript**: `tsconfig.json` enforces strict mode for `src/modules/ts/`
- **ESLint**: `.eslintrc` configured with ES6 + browser + node globals; legacy AngularJS globals included

To check types:
```bash
npx tsc --noEmit
```

## Environment & Configuration

- **Database**: Configured via environment variables (`ARTICHOKE_DB_HOST`, `ARTICHOKE_DB_USER`, `ARTICHOKE_DB_PASS`, `ARTICHOKE_DB_NAME`)
  - Docker values in `docker-compose.yml`
  - Local values in `app/lib/config.inc`
- **Debug mode**: Set `ARTICHOKE_DEBUG=1` in environment to enable full PHP error display in `app/lib/global.inc`

## Code Patterns

### Frontend (React + TypeScript)

- Entry files define routes and bootstrap React apps
- Components in `src/modules/ts/` use functional components with hooks
- Styles in `src/sass/` compiled to CSS

### Backend (Express + PHP Bridge)

- Routes in `app/index.js` map to `app/api.php`
- PHP uses `ComicDB_*` class naming with explicit getters/setters
- Base class `Object.php` provides persistence and query methods
- Output from `app/api.php` is JSON

## Source of Truth

Detailed development practices, code style conventions, and architectural rationale are in [.github/copilot-instructions.md](.github/copilot-instructions.md). Refer there for:
- JavaScript and PHP style guidance
- How to add new API endpoints
- Debugging and logging conventions
- Known bugs and fixes

## Database

**Bootstrap**: `app/sql/bootstrap_mysql.sql` creates tables for `titles`, `series`, `issues`, and import tracking.

**Backup/Reset**:
```bash
# Export data
docker compose exec db mysqldump -u root -proot comicdb > comicdb.sql

# Reset volume (wipes data)
docker compose down -v && docker compose up
```

## Files to Preserve

- `app/build/` — generated output; do not hand-edit
- `package-lock.json` — source of truth for JS dependencies; always commit
- `app/vendor/` — Composer dependencies; do not hand-edit
- `node_modules/` — mounted as Docker volume; do not delete without rebuilding
