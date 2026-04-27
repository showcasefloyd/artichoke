# MVP: Comic Publication Grid Explorer

> **Last Updated**: April 27, 2026

## Vision

**Core experience**: "I have Batman Vol 3 #90 — show me where this fits in the 950-issue history of Batman."

When you hold a physical comic, you want to understand:
- Which volume is this?
- Where does it sit in the full publication history?
- What's the legacy number? (Vol 3 #90 = Legacy #858)

**MVP in one sentence**: Enter title + issue number + cover date → see a grid of ALL issues for that title, color-coded by volume, with your issue highlighted and legacy number displayed.

---

## User Flow

1. **Add Issue**: Enter "Batman #90, December 2020"
2. **Disambiguate**: System matches to ComicVine volume via cover date → Vol 3 (DC Rebirth)
3. **Show Grid**: Grid of ALL Batman issues (950 squares), color-coded by volume
4. **Highlight**: Your #90 (Vol 3) is highlighted at position ~858 out of 950
5. **Legacy Number**: Display "Legacy #858"

---

## The Grid

```
[■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■]...  ← Vol 1 (blue)
...713 squares...
[■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■]...  ← Vol 2 (green)
...55 squares...
[■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][■][★][■][■]...  ← Vol 3 (purple)
                                                 ↑
                                          YOUR ISSUE
                                     #90 (Legacy #858)
[□][□][□][□][□][□][□]...                                        ← Vol 4 (orange)
```

### Grid Specs
| Property | Value |
|----------|-------|
| Layout | Left-to-right, top-to-bottom |
| Density | ~30-50 squares per row |
| Square size | ~10-15px |
| Volume colors | Distinct color per volume |
| Highlighted issue | Glow/border effect |
| Owned issues | Bright fill or checkmark |
| Hover | Tooltip: issue #, volume, cover date, legacy # |

---

## Implementation Phases

### Phase 1: ComicVine Integration (2-3 weeks)

**Goal**: Match user input to ComicVine data and fetch full title history.

| Step | Description | Dependencies |
|------|-------------|--------------|
| 1.1 | Add `cv_volume_id` to `series`, `cv_issue_id` to `issues` | None |
| 1.2 | Build `ComicVine.php` API client | None |
| 1.3 | Build `POST /api/comicvine/resolve` endpoint | 1.2 |
| 1.4 | Build `GET /api/comicvine/title-history` endpoint | 1.2 |

**Done when**: Enter "Batman #90, Dec 2020" → returns Vol 3 + all 4 volumes with issue counts.

### Phase 2: Grid Visualization (2-3 weeks)

**Goal**: Render the issue grid with volume colors and highlighting.

| Step | Description | Dependencies |
|------|-------------|--------------|
| 2.1 | Design grid API response structure | Phase 1 |
| 2.2 | Implement legacy number calculation | Phase 1 |
| 2.3 | Build `IssueGrid.tsx` component | None (parallel) |
| 2.4 | Build `AddIssue.tsx` form | 2.1, 2.3 |
| 2.5 | Add `/explore` route | 2.4 |

**Done when**: Grid renders 950 squares, color-coded, #90 highlighted at position 858.

### Phase 3: Polish & Collection (1-2 weeks)

**Goal**: Connect to collection and add visual polish.

| Step | Description | Dependencies |
|------|-------------|--------------|
| 3.1 | "Add to My Collection" button | Phase 2 |
| 3.2 | Show owned issues in grid | 3.1 |
| 3.3 | Volume legend, cover thumbnails, transitions | Phase 2 |

**Done when**: Can add issue to collection, grid shows owned vs. not owned.

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| ComicVine API | Free, comprehensive, community-maintained |
| Cover date for disambiguation | Reliable, printed on every comic |
| CSS Grid (no D3) | Simple, no dependencies, sufficient for dense grid |
| Legacy numbers calculated | Sum issue counts from earlier volumes |
| Existing stack (PHP/React/Express) | No rewrites, just extensions |

---

## ComicVine API

- **Registration**: Free at comicvine.gamespot.com/api
- **Rate limit**: 200 requests/hour → cache aggressively
- **Key endpoints**:
  - `/volumes?filter=name:Batman` — find volumes by name
  - `/volume/{id}` — volume with issue list
  - `/issue/{id}` — issue details, cover image
- **Terminology**: ComicVine "volume" = our "series"

---

## Out of Scope (Future)

- Character connections / story arcs
- Creator credits
- Reading order generation
- Animated zoom/pan timeline
- Value/condition tracking
- Variant cover handling

---

## Key Files

### Backend
- `app/lib/ComicDB/ComicVine.php` — new API client
- `app/api.php` — new endpoints
- `app/index.js` — Express routes

### Frontend
- `src/modules/ts/app/IssueGrid.tsx` — grid component
- `src/modules/ts/app/AddIssue.tsx` — entry form
- `src/modules/ts/app/App.tsx` — routing

### Database
- `series.cv_volume_id` — ComicVine volume ID
- `issues.cv_issue_id` — ComicVine issue ID
- `cv_cache` — API response cache table
