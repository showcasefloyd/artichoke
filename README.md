# Artichoke ComicBook Catalog




## Docker Development (Recommended)

This repository now includes a Docker Compose setup that runs:



* MySQL on port `3307`
* Adminer on port `8100`
* Backend (Express + PHP bridge) on port `3000`
* Frontend (webpack-dev-server) on port `8093`

### One-time setup

```bash
docker compose build
```

### Start all services

```bash
npm run stack:up
```

### App URLs

* Frontend dev server: `http://localhost:8093`
* Backend app endpoint: `http://localhost:3000`
* MySQL: `localhost:3307` (`comicdb` / `comicdb`, DB `comicdb`)

### Stop services

```bash
npm run stack:down
```

These scripts wrap Docker Compose:

* `npm run stack:up` -> `docker compose up -d --build`
* `npm run stack:down` -> `docker compose down`

### MySQL data persistence (important)

MySQL data is persisted in the named Docker volume `db_data` mounted at `/var/lib/mysql` inside the DB container. This means data survives container restarts and `docker compose down`, as long as the same Compose project name is used.

This repo pins the Compose project name in `docker-compose.yml` (`name: js-artichoke`) so Docker reuses the same volume consistently.

Data is removed only if you explicitly remove volumes (for example `docker compose down -v`).

To export a backup:

```bash
docker compose exec db mysqldump -u root -proot comicdb > comicdb.sql
```

### Reset DB volume (fresh bootstrap)

```bash
docker compose down -v
docker compose up
```

### To only serve the application you just need to serve the db and backend

```bash
docker compose up -d db backend
```

### Frontend watch mode

The `frontend` service in Docker Compose runs webpack-dev-server automatically when you do `npm run stack:up`. It watches for file changes and proxies API calls to the backend.

If you want a plain webpack watch (rebuilds bundles without a dev-server) inside Docker:

```bash
docker compose run --rm frontend webpack --watch --progress
```

To run webpack watch directly on the host (requires local `node_modules`):

```bash
npm run wp
```

> **Note:** Do not use `docker compose exec backend npm run wp`. The `backend` container runs the Express server, not webpack. The `frontend` container is the correct target for all webpack work.

###

The schema/bootstrap script is loaded from `app/sql/bootstrap_mysql.sql`.

## Install Instructions

* This project is managed with NPM and Composer.
* Install JavaScript dependencies with `npm install`.
* Install PHP dependencies with `composer install`.

* __Note__ This application still relies heavily on PHP and PEAR Packages. The quickest way to satisfy these requirements is to user Composer (the
PHP Package manager).

* Development uses Webpack + webpack-dev-server (`npm run dev-client`) and the backend Node/PHP bridge (`npm run dev-server`).

## Update: May 30, 2019

This branch is way ahead of the Master branch and at this point `DOES NOT REQUIRE GULP`. It is using Webpack and Webpack-Dev-Server. Webpack is basically running an Express Server which then calls out api.php script.

Webpack also handles bundling of SASS and JavaScript files.

__Note__ `src` is where Angular modules are before compiling

## Development Workflow

The stack uses **webpack 5** with a React + TypeScript frontend. Source files live in `src/`; generated output goes to `app/build/` (do not hand-edit).

| What you want | Command |
|---|---|
| Full stack with hot reload | `npm run stack:up` (then open `http://localhost:8093`) |
| Backend only (no webpack) | `docker compose up -d db backend` |
| Webpack watch on host | `npm run wp` |
| Webpack watch in Docker | `docker compose run --rm frontend webpack --watch --progress` |
| Production build | `npm run wpprod` |
| Run PHP tests | `npm run test:php` |

`nodemon` watches `app/index.js` and restarts the Express server on changes automatically.

## Updates: To Do April 2026
- Convert home page into Miller Columns


## Update: July 2017

`npm run dev-client` and then `npm run wp`

## Update: June 2017

Webpack-Dev-Server working. To run use NPM scripts.

`npm run dev-client` and `npm run dev-server`

## Update: May 2017

The project now requires Webpack to compile the JavaScript. All configurations can be found in the `webpack.config.js`in the project's root.

### Bugs
~~1. Delete issue, delete the entire series~~ (fixed)
~~2. When updating a Comic issue condition does not stay~~ (fixed)

## Requirements
1. A user can browse all titles, series and issues in a collection
2. A user can see meta data about the any issue
3. A user can see a photo of the cover with the metadata
4. An admin can add and remove titles, series and issue
5. An admin needs to be authenticated

## Upgrades
1. Refactor old SQL - remove EOF lines
2. Implement new Grid Class
3. Add autoload function spl_autoloaf
4. Add photos
5. Add multiple issues at once

### Dependencies
**Node, NPM, Webpack 5, TypeScript, React, Bootstrap 5, SASS, Express, PHP (ComicDB)**
