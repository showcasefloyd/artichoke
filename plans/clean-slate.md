# Clean Slate — Artichoke MVP

## Problem

The app became a generic collection tracker — useful, but not what Artichoke was meant to be. The Title/Series hierarchy added overhead without value. The UI showed data without context. The core vision was lost.

## Vision

Artichoke is a **continuity map for comic book collectors**. Its purpose is to show what each issue means in the larger historical context of a Title — not just what you own, but where it sits in the full publishing history. The collection layer (marking what you own) is secondary to the map itself.

## New Data Model

```
Publisher
  ├── Series (replaces Title + Series hierarchy)
  │     └── Issue
  ├── Event (cross-series publisher crossover)
  └── Initiative (publisher-scoped era, e.g. New 52, Marvel Knights)

Arc (storyline within a single Series, groups Issues)
Era (universal: Golden/Silver/Bronze/Modern — derived from issue cover_date via date-range lookup, no FK on Series)
```

**Key changes from old model:**
- `titles` table is dropped — the Title/Series two-level hierarchy is gone
- `series` now has a `publisher_id` FK (was a free-text `publisher` string)
- New tables: `arc`, `event`, `era`, `initiative`
- `issues` gains an `owned` boolean (the collection marker) — most other financial/grading fields deprioritized
- CSV import tables (`import_runs`, `import_skipped_rows`) are kept but not surfaced in the new UI

## ComicVine Integration

- ComicVine API key stored in env/config (`app/lib/config.inc` + docker-compose.yml), never hardcoded
- A PHP service layer wraps ComicVine API calls and caches results in the local DB
- Admin uses ComicVine search to seed a Series (total issues, publisher, start/end dates)
- Clicking an owned issue in the grid triggers a ComicVine fetch for issue metadata, cached locally
- Local DB is the source of truth; ComicVine is used less over time

## Core UX — Stage 1

1. **Home / Browse**: List of Publishers → click to see their Series
2. **Dashboard strip**: Total series tracked, total issues owned, recently added
3. **Series Grid** (the key view): Two-mode toggle
   - *My Collection*: only owned issues displayed
   - *Full History*: all issues in the series (from ComicVine cache), with owned ones highlighted
4. **Click to own**: Clicking an unowned issue in Full History marks it owned and caches its metadata from ComicVine
5. **Admin**: Minimal — search ComicVine to add a Publisher or Series; basic Issue management

## Constraints

- Single-user, no authentication
- Tech stack unchanged: React + TypeScript + Express + PHP + MySQL
- Frontend components are rewritten from scratch
- Backend Express/PHP bridge pattern is preserved
- CSV import is deprioritized (code kept, not featured in new UI)
- Stage 1 is intentionally simple — build up over time

## Stages

### Stage 1 (MVP)
- New DB schema
- ComicVine API service (search series, fetch issue list, fetch issue detail)
- Minimal admin: add Publisher and Series via ComicVine search
- Series grid with two-mode toggle
- Mark issue as owned
- Dashboard with counts

### Stage 2 (later)
- Arc and Event management UI
- Era derivation displayed in grid (color bands)
- Completion percentage per series
- Initiative management

### Stage 3 (future)
- Cross-series Event grid
- Data visualizations (depth/breadth, Golden/Silver/Bronze banding)
- Multi-volume continuity view