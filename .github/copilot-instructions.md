# Angular Posts — Project Instructions

## Project Overview

SPA for managing posts and comments, built with Angular 21 on a json-server mock backend.
Design reference: minimal, clean, blue accents on white — see Figma link in README.

## Tech Stack

- Angular 21 (standalone components, signals, zoneless, httpResource, Signal Forms)
- TailwindCSS v4 (mobile first)
- Transloco (runtime i18n: es/en)
- json-server 0.17 (mock REST API on port 3000)
- Vitest + Testing Library (unit tests)
- Playwright (e2e)

## Coding Conventions

- **Language**: TypeScript strict mode. All code in English, UI strings via Transloco keys only.
- **Components**: Standalone only. No NgModules. Use `signal()`, `computed()`, `effect()` — never `ngOnInit` for data that can be derived.
- **Forms**: Signal Forms API exclusively (`FormSignal`, `formGroup`, `formControl`). No Reactive Forms or Template-driven Forms.
- **HTTP**: `httpResource()` for data fetching. `HttpClient` only for mutations (POST, PUT, DELETE).
- **Styling**: TailwindCSS utility classes. No component CSS files unless strictly necessary. Mobile-first breakpoints: default → `md:` → `lg:`.
- **i18n**: Every user-facing string must use `transloco` pipe or directive. Keys follow `feature.section.label` pattern (e.g., `posts.list.title`, `login.form.submit`).
- **File naming**: kebab-case. Components: `post-card.ts`, `post-card.html`. Services: `posts.service.ts`. Models: `post.model.ts`.
- **One component per file**: Component class in `.ts`, template in `.html`. No inline templates unless < 3 lines.
- **Conventional Commits** — enforced via commitlint (`@commitlint/config-conventional`)

## Architecture

See `.github/instructions/architecture.instructions.md` for full details.

Key rules:
- Screaming Architecture: organize by feature/domain, not by technical role.
- Container components fetch data and manage state. Presentational components receive inputs and emit outputs.
- All feature routes are lazy loaded via `loadChildren` or `loadComponent`.

## API Conventions (json-server 0.17)

- Base URL: `http://localhost:3000` (proxied via Angular dev server)
- Pagination: `_page=1&_limit=10` → response includes `X-Total-Count` header
- Full-text search: `q=term`
- Filter: `userId=1`, `tags_like=angular`
- Relations: `_expand=user` to embed related user in response

## Testing

- Unit tests next to source files: `post-list-page.spec.ts` beside `post-list-page.ts`
- Use `@testing-library/angular` `render()` for component tests
- Use `vi.fn()` for mocks, `vi.spyOn()` for spying
- E2e tests in `e2e/` folder at project root

## Build & Run

- `npm run api` — start json-server on port 3000
- `npm start` — start Angular dev server (proxied to json-server)
- `npm run dev` — start both concurrently
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run e2e` — Playwright e2e tests
