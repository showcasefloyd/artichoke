# Project Guidelines

## Code Style
- Follow existing style in touched files instead of reformatting broadly.
- **Frontend:** React + TypeScript. Follow hook and component patterns in [src/modules/ts/app/App.tsx](src/modules/ts/app/App.tsx) and [src/modules/ts/admin/AdminApp.tsx](src/modules/ts/admin/AdminApp.tsx). See [react.instructions.md](.github/instructions/react.instructions.md) for details.
- **PHP:** Uses `ComicDB_*` class naming with explicit getter/setter and persistence methods. Follow existing patterns in [app/lib/ComicDB/Object.php](app/lib/ComicDB/Object.php). See [comicdb.instructions.md](.github/instructions/comicdb.instructions.md).
- The `src/modules/js/` directory contains the old AngularJS code — do not edit it; it is no longer in the webpack build.
- Keep edits focused; do not rewrite old code to modern frameworks unless explicitly requested.

## Architecture
- Frontend TypeScript source lives in `src/modules/ts/` and is bundled by Webpack 5 into `app/build/`.
- Runtime flow:
  - React catalog (`app/index.html`) and admin (`app/admin.html`) clients → Express server in [app/index.js](app/index.js)
  - Express API routes bridge into PHP via `exec-php` and [app/api.php](app/api.php). See [bridge.instructions.md](.github/instructions/bridge.instructions.md).
  - PHP data layer is in `app/lib/ComicDB/`.
- Key boundary: treat `src/modules/ts/` and `app/lib/ComicDB/` as source-of-truth; treat `app/build/` as generated output.
- TypeScript interfaces shared between components are exported from [App.tsx](src/modules/ts/app/App.tsx).

## Build And Test
- Install dependencies:
  - `npm install`
  - `composer install`
- Package manager policy: use `npm`; maintain `package-lock.json`; do not use Yarn.
- Common development commands:
  - `npm run dev-server` — Express backend on port `3000`
  - `npm run dev-client` — webpack-dev-server on port `8093` (proxies to backend)
  - `npm run wp` — webpack watch mode
  - `npm run wpprod` — production build
- Testing:
  - `npm test` — Jest + React Testing Library (frontend unit tests in `src/**/__tests__/`)
  - `npm run test:php` — PHPUnit inside Docker backend container (tests in `tests/`)

## Docker Development
- Start full stack: `npm run stack:up` (runs `docker compose up -d --build`)
- Stop full stack: `npm run stack:down`
- Port map: backend `3000`, webpack-dev-server `8093`, MySQL `3307`, Adminer `8100`
- Database is auto-bootstrapped from [app/sql/bootstrap_mysql.sql](app/sql/bootstrap_mysql.sql) on first DB container start.
- DB connection via env vars: `ARTICHOKE_DB_HOST`, `ARTICHOKE_DB_USER`, `ARTICHOKE_DB_PASS`, `ARTICHOKE_DB_NAME` — set in [docker-compose.yml](docker-compose.yml) for Docker and [app/lib/config.inc](app/lib/config.inc) for local dev.
- The `node_modules` directory is a named Docker volume — do not delete without rebuilding. See [docker.instructions.md](.github/instructions/docker.instructions.md).

## Known Bugs
- Deleting an issue deletes the entire series (see [README.md](README.md) for details).
- Issue condition does not persist correctly.

## Conventions
- Edit source files, not generated assets:
  - TypeScript/React source: `src/modules/ts/`
  - SCSS source: `src/sass/`
  - Generated output: `app/build/` (do not hand-edit)
- Preserve the Node ↔ PHP bridge pattern in [app/index.js](app/index.js) when adding API endpoints.
- Respect local debugging behavior in [app/lib/global.inc](app/lib/global.inc): `ARTICHOKE_DEBUG=1` enables full PHP error display.
- Project history, setup notes, and known bugs are in [README.md](README.md). Upgrade plan and migration decisions are in [UPGRADE_PLAN.md](UPGRADE_PLAN.md).