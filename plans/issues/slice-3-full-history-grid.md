# Slice 3: Full History Grid

> The core view — every issue ever published in a series, laid out as a navigable grid.

## Labels
`slice` `backend` `frontend`

## Depends On
Slice 2

## Changes

### API (`app/api.php` + `app/index.js`)
- Add `GET /series` — returns all series (with publisher name) for the publisher list drill-down
- Add `GET /publishers/:id/series` — returns series belonging to a publisher
- Add `GET /series/:id/issues` — returns all issue stubs for a series (number, sort, cover_date, owned)

### Frontend (`src/modules/ts/app/`)
- Update `PublisherList.tsx` — clicking a publisher expands/navigates to its series list (fetch from `GET /publishers/:id/series`)
- Create `SeriesGrid.tsx`:
  - Fetches issues from `GET /series/:id/issues`
  - Renders a CSS grid: cells ordered by `sort`, each showing the issue number
  - **Full History mode** (default): all issues displayed
  - Owned issues visually distinguished (highlighted) — toggle added in Slice 4
- Create `SeriesGrid.scss` for grid layout and cell styles
- Update `App.tsx` routing: `/series/:id` renders `SeriesGrid`
- Tests: Jest smoke tests for `SeriesGrid` and updated `PublisherList`

## Done When
Click a publisher → see its series list → click a series → see a grid of every issue ever published for that series.
