---
name: ComicDB Data Layer Guidelines
description: "Use when editing ComicDB PHP classes, entity persistence methods, collection classes, database access, or model behavior in app/lib/ComicDB. Covers legacy ComicDB naming and state-tracking conventions."
applyTo: "app/lib/ComicDB/**"
---

# ComicDB PHP Guidelines

- Follow existing ComicDB class naming patterns such as ComicDB_Object, ComicDB_Title, and ComicDB_Titles.
- Keep the legacy getter and setter style used across entity classes, including isDirty flag updates when state changes.
- Preserve object lifecycle flags and behavior: isNew, isDirty, and isDeleted.
- Match existing persistence flow in object and entity classes: select, insert, update, delete, restore, save, remove.
- Keep edits narrow and consistent with surrounding legacy formatting and method structure.
- Prefer extending existing model patterns instead of introducing new ORM layers or framework rewrites.
- Reuse the existing database access style through ComicDB_DB and current query patterns unless a task explicitly requires broader modernization.
- Coordinate API-facing behavior changes with bridge logic in [app/index.js](app/index.js) and [app/api.php](app/api.php).
