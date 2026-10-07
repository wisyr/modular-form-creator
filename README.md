# Modular Form Creator – Frontend

A Resources Management app: create resources, fill in two modules (Basic Info
and Project Details), provision them to `completed`, and review them in a
summary view. The frontend follows the backend contract in
[`backend/README.md`](backend/README.md) exactly; neither `backend/` nor
`src/design-system/` was modified.

## Running it

### Everything with Docker (backend + Mongo + frontend)

```bash
docker compose up -d --build
```

- App: <http://localhost:5173>
- API: <http://localhost:5001> (Swagger UI at `/docs`)

The frontend container serves the production build with nginx. Port 5173 is
the origin the backend allows through `CORS_ORIGIN`, so keep it. The API URL is
called by the **browser**, so it is a build argument
(`VITE_API_URL`, default `http://localhost:5001`) rather than a Docker service
name.

### Local development

```bash
docker compose up -d backend mongo   # backend + database only
npm install
npm run dev                          # http://localhost:5173
```

Requires Node >= 22.13 (`.nvmrc` pins 22). Don't run the Docker frontend and
`npm run dev` at the same time: both use port 5173.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run lint` | ESLint |
| `npm test` | Unit and component tests (Vitest, jsdom) |
| `npm run e2e` | Playwright end-to-end test against the running stack (see below) |
| `npm run e2e:typecheck` | Type-check the e2e sources |
| `npm run gen:api` | Re-export the backend OpenAPI spec and regenerate `src/api/schema.d.ts` |
| `npm run storybook` | Design system stories |

## Routes

| Route | Page |
| --- | --- |
| `/resources` | List: search, status filter, sort and pagination (all backend-driven, kept in the URL); create (drawer) and delete (confirmation) |
| `/resources/:resourceId` | Overview: module progress, provisioning, and submit/discard of unsaved edits |
| `/resources/:resourceId/basic-info` | Basic Info form |
| `/resources/:resourceId/project-details` | Project Details form (locked until Basic Info is complete, for drafts) |
| `/resources/:resourceId/details` | Read-only summary of both modules |

## Business rules and where they live

- **Complete** is derived from the data, exactly like the backend: Basic Info is
  complete when all five fields are filled in; Project Details when all fields
  are filled in and at least one team member is selected
  (`src/features/resources/rules.ts`).
- **Draft → completed** only through `PATCH /provisioning`, enabled only when
  both modules are complete. A completed resource cannot be provisioned again.
  The frontend never sends a status.
- **Project Details** unlocks only after Basic Info is complete (drafts).
- **Resource name** is locked after creation and always sent unchanged.
- **Draft resources**: saving a module sends `PATCH /basic-info` or
  `PATCH /project-details`.
- **Completed resources**: saving a module form only writes to a local buffer.
  Nothing is sent until the user presses **Submit changes** on the overview,
  which sends one full `PUT /api/resources/:id`. **Discard** drops the buffer.
  The buffer is in memory only, so a refresh or closing the tab loses it by
  design (the browser warns before leaving while unsaved edits exist).

## Architecture

```
src/
  api/                 typed client, ApiError, generated schema, app-level types
  app/router.tsx       routes
  components/          layout primitives, status badge, loading/error states
  features/resources/  rules, Zod schemas, query hooks, edit buffer, module forms
  pages/<Page>/        one folder per route:
                         <Page>.tsx             the page component only
                         <Page>.components.tsx  helper components
                         <Page>.hooks.ts / .constants.ts  when needed
                         <Page>.tests.tsx       component tests
  tests/               shared fixtures, render helper, test setup
                       (feature tests live in features/resources/tests/*.tests.ts)
scripts/               OpenAPI export script
openapi/               exported backend spec (committed)
```

### State: three kinds, three tools

| State | Tool | Why |
| --- | --- | --- |
| Server data (list, resource, mutations) | TanStack Query | Caching, loading/error states, and invalidation after each mutation |
| Form fields and validation | React Hook Form + Zod | Field-level errors that mirror the backend rules |
| Completed-resource edit buffer | Zustand | Small, client-only state shared across routes; no provider or reducer, fine-grained selectors, in-memory only |

### Decisions worth knowing

- **Details shows unsaved edits.** For a completed resource with buffered edits,
  `/details` shows the saved data merged with the buffer, marked "Unsaved
  changes". The assignment does not specify this; the reasoning is that users
  check the summary before submitting. After a refresh the buffer is gone and
  the page shows the saved data again.
- **Generated API types.** The backend only exposes its OpenAPI spec through
  Swagger UI, so `scripts/export-openapi.ts` imports the backend's spec (read
  only) and writes `openapi/openapi.json`; `openapi-typescript` generates
  `src/api/schema.d.ts` from it. Both are committed, so the app builds without
  running the generator. The generator runs through `npx` with a pinned version
  because its peer dependency (TypeScript 5) conflicts with the project's
  TypeScript 6.
- **The spec marks every field optional**, but the backend always returns the
  full shape, so `src/api/types.ts` narrows the types in one place.
- **Validation lives twice on purpose**: the backend is the source of truth, and
  the Zod schemas mirror its rules so the forms reject the same input up front.

## Tests

`npm test` runs unit tests for the business rules, validation schemas and edit
buffer, and component tests (API mocked) for the list, overview, Details and both
module forms. Test files are named `*.tests.ts(x)`. They cover: Project Details locked until Basic Info is complete,
provisioning disabled until both modules are complete, completed-resource edits
never triggering `PATCH`, a single full `PUT` on submit, and the resource name
staying locked.

### End-to-end test

`e2e/resource-lifecycle.spec.ts` drives the real app and backend through one
journey: unknown route (404), create (with validation), Project Details locked,
complete both modules, provision, edit a completed resource (no request is
sent), then submit and assert exactly one `PUT`. It deletes the resource it
created.

```bash
# 1. start the stack (frontend :5173, backend :5001)
docker compose up -d --build

# 2. first time only: download the browser
npx playwright install chromium

# 3. run the test (set E2E_BASE_URL to target another URL)
npm run e2e
```

### CI

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:
lint, type-check + build, unit tests, then the Playwright test against
`docker compose up`. The Playwright report is uploaded when the e2e job fails.

## Accessibility and error handling

- **Keyboard / screen readers:** a skip link, focus moved to the page content
  after each route change, a descriptive document title per route, a visible
  `:focus-visible` ring, reduced-motion support, and row actions whose
  accessible names include the resource (for example "Delete Alpha").
- **Dialogs:** the delete confirmation focuses its safe action (Cancel) and
  both drawers return focus to the control that opened them.
- **Forms:** labels, `aria-invalid` and `aria-describedby` come from the design
  system inputs; error banners use `role="alert"`, loading uses `role="status"`.
- **Errors:** every route sits under a React Router `errorElement`
  (`RouteErrorPage`), so a render error shows a recovery page instead of a blank
  screen, while unknown URLs get the 404 page.
- Not changed because the design system is off limits: the drawer has no focus
  trap, its close button has no accessible name, and checkbox groups are not
  wrapped in a `fieldset`.

## Known limits

- `npm audit` reports vulnerabilities (17 at the last install) that have not
  been triaged yet. Dependency versions follow the starter template, so an
  audit and upgrade pass (reviewing each advisory rather than running
  `npm audit fix --force`) is worth doing before production use.
- The production bundle is a single ~511 kB chunk (Vite warns above 500 kB).
  Route-level code splitting would remove the warning.
- The Docker frontend is a production build; there is no hot reload inside the
  container (use `npm run dev` for development).
