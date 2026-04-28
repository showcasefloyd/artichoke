# Slice 1: New Schema + Publisher List

> Establishes the new data model and proves the stack is live with the simplest possible visible result.

## Labels
`slice` `backend` `frontend` `database`

## Changes

### Database
- Write new `bootstrap_mysql.sql`:
  - Remove `titles` table
  - Remove `title` FK column from `series`; add `publisher_id` FK referencing `publisher(id)`
  - Add `owned TINYINT(1) NOT NULL DEFAULT 0` to `issues`
  - Add `arc` table (`id`, `series_id`, `name`, `start_issue`, `end_issue`)
  - Add `event` table (`id`, `publisher_id`, `name`, `start_date`, `end_date`)
  - Add `era` table (`id`, `name`, `start_year`, `end_year`) — universal eras used for date-range derivation
  - Add `initiative` table (`id`, `publisher_id`, `name`, `start_year`, `end_year`) — publisher-scoped eras
  - Add `comicvine_cache` table (`resource_type`, `resource_id`, `payload` JSON, `fetched_at`) — for caching ComicVine API responses
  - Keep `import_runs` and `import_skipped_rows` unchanged

### PHP (`app/lib/ComicDB/`)
- Update `Publisher.php` / `Publishers.php` to match any schema changes
- Update `Series.php` / `Serieses.php` to use `publisher_id` FK instead of free-text `publisher` string
- Retire `Title.php` and `Titles.php` from active use (keep files, remove from include paths)

### API (`app/api.php` + `app/index.js`)
- Add `GET /publishers` — returns all publisher rows

### Frontend (`src/modules/ts/`)
- Delete: `app/TitleList.tsx`, `app/CollectorDashboard.tsx`, `app/InventoryNavigation.tsx`, `app/IssueGrid.tsx`, `app/IssueDetail.tsx`, `app/CollectorDashboard.scss`, `app/InventoryColumn.scss`
- Create: `app/PublisherList.tsx` — simple list of publishers fetched from `GET /publishers`
- Update: `app/App.tsx` — render `PublisherList` as the home view
- Test: add a Jest smoke test for `PublisherList`

## Done When
Open the app and see a list of publishers (Marvel, DC, Image, etc.).
