# Slice 5: Dashboard Strip

> Gives the home page a sense of the collection at a glance.

## Labels
`slice` `backend` `frontend`

## Depends On
Slice 4

## Changes

### API (`app/api.php` + `app/index.js`)
- Add `GET /stats` — returns:
  ```json
  {
    "seriesCount": 12,
    "ownedIssueCount": 247,
    "recentlyAdded": [
      { "id": 1, "seriesName": "Daredevil Vol. 1", "number": "1", "cover_date": "1964-04-01" }
    ]
  }
  ```
  `recentlyAdded` is the 5 most recently marked-owned issues (ordered by `updated_at` desc)

### Frontend (`src/modules/ts/app/`)
- Create `Dashboard.tsx`:
  - Fetches `GET /stats`
  - Renders a strip at the top of the home page: **X series · Y issues owned**
  - Below the counts: a row of recently-added issue cards (series name + issue number + cover date)
- Update `App.tsx` to include `Dashboard` above `PublisherList`
- Test: Jest smoke test for `Dashboard`

## Done When
Home page loads showing live series and issue counts, plus the last 5 issues marked as owned.
