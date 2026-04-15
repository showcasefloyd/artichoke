---
name: Backend Bridge Guidelines
description: "Use when adding or changing backend API routes, Express handlers, Node-to-PHP bridge calls, or app/api.php integration. Covers the established exec-php bridge pattern and response handling conventions."
applyTo: "app/index.js, app/api.php"
---

# Node to PHP Bridge Guidelines

- Preserve the existing bridge flow in [app/index.js](app/index.js): Express route -> `execPhp(__dirname + '/api.php', ...)` -> PHP function callback -> `res.send(...)`.
- Match route and callback style already used by `/list`, `/list/:id`, `/issues/:id`, `/issue/:id`, and `/title/:id` in [app/index.js](app/index.js).
- When adding bridge endpoints, keep response shapes compatible with existing AngularJS callers in [src/modules/js/app.js](src/modules/js/app.js) and [src/modules/js/admin.js](src/modules/js/admin.js).
- Put PHP callable logic in [app/api.php](app/api.php) and keep function names stable and explicit.
- Avoid unrelated refactors to server bootstrap and middleware in [app/index.js](app/index.js); keep changes scoped to the new endpoint behavior.
- If debugging is needed, use `ARTICHOKE_DEBUG=1` behavior defined in [app/lib/global.inc](app/lib/global.inc) instead of changing global error policy.
