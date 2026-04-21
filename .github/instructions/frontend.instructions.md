---
name: Frontend AngularJS Guidelines
description: "Use when editing AngularJS frontend code, controllers, modules, routing, or Sass styling in this repository. Covers legacy Angular 1.x patterns and source vs generated asset boundaries."
applyTo: "src/modules/js/**, src/sass/**"
---

# Frontend Guidelines

- Preserve legacy AngularJS 1.x module/controller patterns used in [src/modules/js/app.js](src/modules/js/app.js) and [src/modules/js/admin.js](src/modules/js/admin.js).
- Keep array-based dependency injection for controllers and services to remain minification-safe.
- Follow the existing `$scope` + `$http` style in touched files instead of introducing new frameworks or broad architectural rewrites.
- Edit source files only:
  - JavaScript in `src/modules/js/`
  - Sass in `src/sass/`
- Do not hand-edit generated files in `app/build/`; rebuild through webpack scripts.
- Keep edits surgical and consistent with surrounding legacy formatting and naming.
