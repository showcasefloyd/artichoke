# Slice 2: Seed a Series via ComicVine

> First end-to-end data entry: admin searches ComicVine, picks a series, it lands in the DB and appears on the home page.

## Labels
`slice` `backend` `admin` `comicvine`

## Depends On
Slice 1

## Changes

### Config
- Add `COMICVINE_API_KEY` to `app/lib/config.inc` (local dev)
- Add `COMICVINE_API_KEY` env var to `docker-compose.yml` backend service

### PHP (`app/lib/`)
- Create `ComicVine.php` service:
  - `searchVolumes(string $query): array` — calls ComicVine `GET /search?type=volume&query=...`, caches result in `comicvine_cache`
  - `getVolumeIssues(int $volumeId): array` — calls ComicVine `GET /volume/{id}`, caches result
  - All responses cached in `comicvine_cache` by `(resource_type, resource_id)`; stale after 7 days

### API (`app/api.php` + `app/index.js`)
- Add `GET /comicvine/search?q=` — proxy to `ComicVine::searchVolumes`, returns name/publisher/issue count/start year per result
- Add `POST /series` — accepts a ComicVine volume id + publisher id; seeds a `series` row and stub `issues` rows (one per issue number, `owned = 0`)

### Admin Frontend (`src/modules/ts/admin/`)
- Add `SeriesCreator.tsx` (replace old one): search field → calls `GET /comicvine/search?q=` → result list → select one → calls `POST /series`
- Show success confirmation with link to the new series
- Test: Jest smoke test for the new `SeriesCreator`

## Done When
Search "Daredevil" in admin, select the result, and see the series appear under Marvel on the home publisher list.
