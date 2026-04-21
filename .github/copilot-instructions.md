# Project Guidelines

## Code Style
- Follow existing legacy style in touched files instead of reformatting broadly.
- JavaScript is AngularJS 1.x style with module/controller patterns and array-based DI. Use existing patterns in [src/modules/js/app.js](src/modules/js/app.js) and [src/modules/js/admin.js](src/modules/js/admin.js).
- PHP uses `ComicDB_*` class naming with explicit getter/setter and persistence methods. Follow existing patterns in [app/lib/ComicDB/Object.php](app/lib/ComicDB/Object.php).
- Keep edits focused; do not rewrite old code to modern frameworks unless explicitly requested.

## Architecture
- Frontend source lives in `src/` and is bundled by Webpack into `app/build/`.
- Runtime flow:
  - AngularJS app/admin clients -> Express server in [app/index.js](app/index.js)
  - Express API routes bridge into PHP via `exec-php` and [app/api.php](app/api.php)
  - PHP data layer is in `app/lib/ComicDB/`.
- Key boundary: treat `src/` and `app/lib/ComicDB/` as source-of-truth; treat `app/build/` as generated output.

## Build And Test
- Install dependencies:
  - `npm install`
  - `composer install`
- Package manager policy:
  - Use `npm` for all JavaScript dependency changes and scripts.
  - Commit and maintain `package-lock.json` as the source of truth for JS dependencies.
  - Do not use Yarn or recreate `yarn.lock`.
- Common development commands:
  - `npm run dev-server` starts Express backend on port `3000`
  - `npm run dev-client` starts webpack-dev-server on port `8093` (proxy to backend)
  - `npm run wp` runs webpack in watch mode
  - `npm run wpprod` builds production bundles
- Tests are not currently configured (`npm test` exits with error placeholder).

## Docker Development
- Start full stack: `npm run stack:up` (runs `docker compose up -d --build`)
- Stop full stack: `npm run stack:down`
- Port map: backend `3000`, webpack-dev-server `8093`, MySQL `3307`, Adminer `8100`
- Database is auto-bootstrapped from [app/sql/bootstrap_mysql.sql](app/sql/bootstrap_mysql.sql) on first DB container start.
- DB connection is configured via environment variables: `ARTICHOKE_DB_HOST`, `ARTICHOKE_DB_USER`, `ARTICHOKE_DB_PASS`, `ARTICHOKE_DB_NAME`; these are set in [docker-compose.yml](docker-compose.yml) for Docker and in [app/lib/config.inc](app/lib/config.inc) for local dev.
- The `node_modules` directory is mounted as a named Docker volume to avoid host/container permission conflicts — do not delete this volume without rebuilding.

## Known Bugs
- Deleting an issue deletes the entire series (see [README.md](README.md) for details).
- Issue condition does not persist correctly.

## Conventions
- Edit source files, not generated assets:
  - JavaScript source: `src/modules/js/`
  - SCSS source: `src/sass/`
  - Generated output: `app/build/` (do not hand-edit)
- Preserve the Node <-> PHP bridge pattern in [app/index.js](app/index.js) when adding API endpoints.
- Respect local debugging behavior in [app/lib/global.inc](app/lib/global.inc): `ARTICHOKE_DEBUG=1` enables full PHP error display.
- Prefer linking to existing docs instead of duplicating:
  - Project history, setup notes, and known bugs are in [README.md](README.md).