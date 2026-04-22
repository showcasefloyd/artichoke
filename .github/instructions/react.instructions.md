---
name: React + TypeScript Frontend Guidelines
description: "Use when adding or editing React components, TypeScript interfaces, or frontend tests in src/modules/ts/. Covers component patterns, state management, API fetch conventions, and testing."
applyTo: "src/modules/ts/**"
---

# React + TypeScript Frontend Guidelines

## Component Conventions
- Use React functional components with hooks only (`useState`, `useEffect`). No class components.
- API calls belong in container components (`App.tsx`, `AdminApp.tsx`). Presentational components receive data and callbacks as props only — no fetch calls inside them.
- `AdminApp.tsx` uses a discriminated union (`AdminView`) as the routing/view state machine. Follow this pattern when adding new admin panels.
- All TypeScript interfaces shared across components are exported from [App.tsx](../../src/modules/ts/app/App.tsx). Do not duplicate interface definitions.

## State and Data Fetching
- Use `fetch()` directly for API calls — no Redux, no Context, no external data-fetching library.
- Always handle loading and error states explicitly (local state variables `loading` / `error`).
- Use `useEffect` with correct dependency arrays; avoid infinite re-render loops from missing or over-specified deps.

## API Conventions
- All API calls target Express routes in [app/index.js](../../app/index.js). Do not call PHP directly.
- Pass JSON bodies with `Content-Type: application/json` and `JSON.stringify()` for POST/PUT.
- For raw (unformatted) issue data use `GET /issue/:id/raw`; for display-formatted data use `GET /issue/:id`.
- Status enum values: `0` = Collected, `1` = For Sale, `2` = Wish List (defined in [app/api.php](../../app/api.php)).

## TypeScript
- Strict mode is enabled in [tsconfig.json](../../tsconfig.json). Do not use `any` or `as unknown as T` casts without a comment explaining why.
- CSS/SCSS modules are declared in [src/modules/ts/declarations.d.ts](../../src/modules/ts/declarations.d.ts) — import stylesheet files as `import styles from './foo.scss'`.

## Testing
- Test files live in `src/modules/ts/**/__tests__/*.test.tsx` (picked up by [jest.config.ts](../../jest.config.ts)).
- Use React Testing Library (`@testing-library/react`) and `@testing-library/user-event`. Do not use `enzyme`.
- Mock `fetch` with `jest.fn()`. Assert on callbacks passed as props rather than on internal state.
- See existing tests in [src/modules/ts/app/__tests__/](../../src/modules/ts/app/__tests__/) and [src/modules/ts/admin/__tests__/](../../src/modules/ts/admin/__tests__/) for patterns.
- Run frontend tests with `npm test`.
