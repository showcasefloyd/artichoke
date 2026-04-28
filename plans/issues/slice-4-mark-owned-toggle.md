# Slice 4: Mark as Owned + My Collection Toggle

> The interaction that makes Artichoke a personal catalog, not just a reference.

## Labels
`slice` `backend` `frontend`

## Depends On
Slice 3

## Changes

### PHP (`app/lib/ComicVine.php`)
- Add `getIssueDetail(int $issueId): array` — fetches `GET /issue/{id}` from ComicVine, caches result; extracts `cover_date`, `story_title`, `cover_image_url`

### API (`app/api.php` + `app/index.js`)
- Add `PUT /issues/:id/owned` — toggles `owned` boolean on the issue row; on first mark-owned (`owned` was 0), triggers `ComicVine::getIssueDetail` and updates `cover_date`, `story_title`, and a `cover_image_url` column on the issue

### Frontend (`src/modules/ts/app/SeriesGrid.tsx`)
- Clicking an unowned cell calls `PUT /issues/:id/owned` (optimistic update — highlight immediately, revert on error)
- Clicking an owned cell calls `PUT /issues/:id/owned` to unmark it
- Add toggle button: **Full History** ↔ **My Collection**
  - Full History: all issue cells shown, owned ones highlighted
  - My Collection: only owned cells shown, same grid layout (gaps preserved so position is meaningful)
- Tests: update Jest smoke test to cover both toggle modes

## Done When
Click issues in Full History to mark them owned (they highlight); click the toggle to switch to My Collection and see only your books in the same grid layout.
