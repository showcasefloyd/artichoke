---
name: add-api-endpoint
description: 'Add a new API endpoint to this project. Generates the full 3-layer change: PHP function in api.php, Express route in index.js, and React fetch call in the appropriate component. Use for adding CRUD operations on titles, series, issues, or any new entity.'
argument-hint: '<method> <path> — e.g. "GET /publisher/:id" or "POST /publisher"'
---

# Add API Endpoint

## What This Skill Produces

A complete, working endpoint across all three layers:

1. **PHP function** in [app/api.php](../../../app/api.php) — data access via ComicDB classes
2. **Express route** in [app/index.js](../../../app/index.js) — exec-php bridge call
3. **React fetch call** in `src/modules/ts/` — typed fetch with loading/error state

## When to Use

- Adding CRUD operations for any resource (title, series, issue, or new entity)
- Extending existing resources with new read/write operations
- Any time [UPGRADE_PLAN.md](../../../UPGRADE_PLAN.md) calls for a new endpoint

---

## Procedure

### 0. Identify the endpoint

Determine: HTTP method (`GET` / `POST` / `PUT` / `DELETE`), resource path, request payload (if any), and response shape.

If the argument was provided (e.g. `GET /publisher/:id`), parse it directly.

### 1. Add the PHP function to `app/api.php`

See [PHP function templates](./references/php-templates.md) for boilerplate by method type.

Rules:
- Function must be **file-scope** (not in a class). `exec-php` calls by name.
- Name in `camelCase`, stable and explicit (e.g. `grabPublisher`, `createPublisher`).
- Accept complex input as a JSON string argument (`$dataJson`); decode with `json_decode($dataJson, true)`.
- Always return `json_encode(...)` — never `echo` raw output.
- Use `isset()` guards for optional fields before calling setters.
- Use the appropriate `ComicDB_*` class. Follow patterns in [app/lib/ComicDB/Object.php](../../../app/lib/ComicDB/Object.php).
- After adding, verify the function is reachable: no syntax errors, no shadowed names.

### 2. Add the Express route to `app/index.js`

See [Express route templates](./references/express-templates.md) for boilerplate by method type.

Rules:
- Match the route style already used for the same resource (check existing `/title`, `/series`, `/issue` routes).
- For `POST` / `PUT`, pass `JSON.stringify(req.body)` as the PHP argument.
- For `DELETE`, pass `req.params.id`.
- Call `res.send(result)` — do not transform the PHP response.
- Add the route **near related routes** for the same resource (keep routes grouped by resource).

### 3. Add the React fetch call

Decide which component owns the call:
- **Read data needed on load** → add to the container component (`App.tsx` or `AdminApp.tsx`) inside a `useEffect`.
- **Action triggered by user** → add a handler function in the container and pass it as a prop.
- **Self-contained form** (create/edit/delete) → add fetch inside the editor/creator component (e.g. `TitleEditor.tsx`).

Rules:
- Use `fetch()` directly. No external data-fetching libraries.
- `POST`/`PUT` must include `Content-Type: application/json` header and `JSON.stringify(body)`.
- Track `loading` and `error` with local `useState`.
- Type the response using interfaces exported from [App.tsx](../../../src/modules/ts/app/App.tsx). Add new interfaces there if needed.
- See [react.instructions.md](../../instructions/react.instructions.md) for full conventions.

### 4. Verify end-to-end

- Run `npm run dev-server` (or use the Docker stack: `npm run stack:up`).
- Exercise the endpoint manually via browser or curl.
- If a PHP error occurs, check `ARTICHOKE_DEBUG=1` output in [app/lib/global.inc](../../../app/lib/global.inc).
- Run `npm test` to confirm no existing frontend tests regressed.
- If adding a write endpoint, add or update a PHPUnit test in `tests/Api/ApiTest.php` and verify with `npm run test:php`.
