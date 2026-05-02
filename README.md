# Artichoke Comic Book Catalog

A React + TypeScript comic book collection manager with an Express/PHP backend, served via a Docker dev stack.
See [hist/HISTORY.md](hist/HISTORY.md) for background, requirements, and legacy notes.

## Docker Stack

| Service | Port |
|---|---|
| Frontend (webpack-dev-server) | `8093` |
| Backend (Express + PHP) | `3000` |
| MySQL | `3307` |
| Adminer | `8100` |

### Start

```bash
npm run stack:up
```

- App: `http://localhost:8093`
- Adminer: `http://localhost:8100` (user/pass/db: `comicdb`)

### Stop

```bash
npm run stack:down
```

### Backend only (skip webpack)

```bash
docker compose up -d db backend
```

### Reset DB (wipes all data)

```bash
docker compose down -v && docker compose up
```

MySQL data persists in the `db_data` named volume across restarts. Use `-v` only when you want a clean slate.

### Backup DB

```bash
docker compose exec db mysqldump -u root -proot comicdb > comicdb.sql
```

## Dev Commands

| Task | Command |
|---|---|
| Webpack watch (host) | `npm run wp` |
| Production build | `npm run wpprod` |
| PHP tests | `npm run test:php` |

## Tech Stack
- React 18
- TypeScript
- SCSS
- Webpack
- Node.js / Express
- PHP
- MySQL