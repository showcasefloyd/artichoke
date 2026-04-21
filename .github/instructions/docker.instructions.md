---
name: Docker Development Guidelines
description: "Use when editing Dockerfile, docker-compose.yml, container configuration, or troubleshooting the Docker dev stack."
applyTo: "docker-compose.yml, docker/**"
---

# Docker Development Guidelines

- Start full stack: `npm run stack:up` (`docker compose up -d --build`); stop with `npm run stack:down`.
- Port map: backend `3000`, webpack-dev-server `8093`, MySQL `3307`, Adminer `8100`.
- DB env vars passed to the backend container: `ARTICHOKE_DB_HOST`, `ARTICHOKE_DB_USER`, `ARTICHOKE_DB_PASS`, `ARTICHOKE_DB_NAME`. For local dev these live in [app/lib/config.inc](app/lib/config.inc).
- Database is auto-bootstrapped from [app/sql/bootstrap_mysql.sql](app/sql/bootstrap_mysql.sql) on first DB container start. Re-seeding requires removing the DB volume.
- `node_modules` is a named Docker volume (`node_modules:/workspace/node_modules`). Do not delete this volume without rebuilding — it prevents host/container permission conflicts.
- The app container uses Node 22 (bookworm) with `php-cli` and `php-mysql` installed for the exec-php bridge.
- Frontend hot-reload inside Docker requires `CHOKIDAR_USEPOLLING=1` and `WATCHPACK_POLLING=true` (already set in [docker-compose.yml](docker-compose.yml)).
- `WEBPACK_PROXY_TARGET` overrides the backend proxy target for the webpack-dev-server (defaults to `http://localhost:3000/`; set to `http://backend:3000/` in Docker).
- `ARTICHOKE_DEBUG=1` is set in the Docker stack by default; PHP errors are fully displayed (see [app/lib/global.inc](app/lib/global.inc)).
