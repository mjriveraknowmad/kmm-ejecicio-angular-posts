# AGENTS.md — Angular Posts SPA

AI agent instructions for working on this codebase. Compatible with GitHub Copilot, Claude Code, and other AI coding agents.

---

## Project Purpose

SPA for managing posts and comments on a json-server mock backend. Goal: practice idiomatic Angular 21 with modern APIs. Correctness and maintainability over feature count.

---

## Stack

| Concern | Tool |
|---------|------|
| Framework | Angular 21 — standalone, signals, zoneless, `httpResource` |
| Forms | Signal Forms (`FormSignal`, `formGroup`, `formControl`) |
| Styles | TailwindCSS v4 — mobile-first, no component CSS files |
| i18n | Transloco — runtime, `es` and `en`, keys in `public/i18n/` |
| Backend | json-server 0.17 on port 3000, proxied by Angular dev server |
| Unit tests | Vitest + `@testing-library/angular` |
| E2E | Playwright — config in `playwright.config.ts`, tests in `e2e/` |
| Linting | ESLint flat config (`eslint.config.js`) + Prettier |
| Git hooks | Husky (pre-commit: lint-staged, commit-msg: commitlint) |
| Commits | Conventional Commits — enforced via commitlint (`@commitlint/config-conventional`) |

---

## Commands

```bash
npm run api        # Start json-server on port 3000
npm start          # Start Angular dev server (proxied to json-server)
npm run dev        # Start both concurrently
npm run build      # Production build
npm test           # Vitest unit tests
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix
npm run format     # Prettier write
npm run e2e        # Playwright e2e tests
```

**Always run `npm run build` or `npm start` after structural changes to verify compilation.**

---

## Commit Message Convention

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/). commitlint enforces this on every `git commit`.

### Format

```
<type>(<scope>): <short summary in imperative mood, lowercase, no period>

[optional body — wrap at 72 chars]

[optional footer: BREAKING CHANGE or issue refs]
```

### Allowed types

| Type | When to use |
|------|-------------|
| `feat` | New feature visible to the user |
| `fix` | Bug fix |
| `refactor` | Code change that is neither a feature nor a fix |
| `style` | Formatting, whitespace — no logic change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build tooling, deps, config — no production code |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

### Scopes (use the feature or layer name)

`auth` · `posts` · `comments` · `login` · `layout` · `i18n` · `routing` · `shared` · `config` · `deps`

### Examples

```
feat(auth): add jwt token persistence to localStorage
fix(posts): prevent edit button appearing for non-owners
feat(posts): implement pagination with query param sync
refactor(login): replace template-driven form with Signal Forms
test(auth): add unit tests for authGuard redirect
chore(deps): upgrade @jsverse/transloco to v8
docs: update AGENTS.md with commit convention
```

### Rules

- **Always propose commits in this format** — never use free-form messages.
- Summary line ≤ 72 characters, imperative mood, lowercase, no trailing period.
- Use a body when the change needs context that the summary can't convey.
- Mark breaking changes with `BREAKING CHANGE:` in the footer.
- When suggesting multiple logical changes, split them into separate commits.

---

## Architecture

Full details: `.github/instructions/architecture.instructions.md`

### Folder layout

```
src/app/
├── core/            # Auth (service, interceptor, guards), layout, i18n loader
├── features/        # login/, posts/, forbidden/ — lazy loaded, self-contained
└── shared/          # Presentational-only components, pipes — no business logic
```

### Rules (non-negotiable)

1. **Standalone only** — no NgModules, ever.
2. **Screaming Architecture** — code lives in `features/<domain>/`, not in `services/` or `components/` at root.
3. **Container / Presentational split** — `-page` suffix = container (injects services, owns state). Others = presentational (inputs + outputs only).
4. **Features never import each other** — shared logic goes to `shared/` or `core/`.
5. **Lazy loading always** — all feature routes use `loadComponent` or `loadChildren`.
6. **Signal Forms exclusively** — no `ReactiveFormsModule`, no `FormsModule`.
7. **`httpResource()` for reads, `HttpClient` for mutations** (POST, PUT, DELETE).
8. **Every UI string uses Transloco** — no hardcoded strings in templates. Key pattern: `feature.section.label`.
9. **`@defer (on viewport)`** for the comments section in post detail.

---

## API Conventions (json-server 0.17)

Base URL: `http://localhost:3000` (transparent via Angular proxy)

| Operation | Example |
|-----------|---------|
| Paginate | `GET /posts?_page=1&_limit=10` — responds with `X-Total-Count` header |
| Search | `GET /posts?q=angular` — full-text on all fields |
| Filter | `GET /posts?userId=1`, `GET /posts?tags_like=angular` |
| Expand | `GET /posts?_expand=user` — embeds related user |
| Get one | `GET /posts/1` |
| Create | `POST /posts` |
| Update | `PUT /posts/1` |
| Delete | `DELETE /posts/1` |

**Auth:** The login flow GETs `/users?name=X&password=Y`. On match, a static token is generated (`btoa(id:name:timestamp)`) and stored in `localStorage`. All subsequent requests include `Authorization: Bearer <token>` via `authInterceptor`.

**Mock credentials:** `alice/alice123`, `bruno/bruno123`, `carla/carla123`

---

## Key Patterns

### Reading data with httpResource

```typescript
// In a container component
readonly posts = httpResource(() => ({
  url: '/posts',
  params: { _page: this.page(), _limit: 10, q: this.search() },
}));
// posts.value() | posts.isLoading() | posts.error()
```

### Writing data with HttpClient

```typescript
// Mutation via HttpClient (not httpResource)
createPost(data: Partial<Post>) {
  return this.http.post<Post>('/posts', { ...data, userId: this.auth.currentUser()!.id, createdAt: new Date().toISOString() });
}
```

### Signal Forms

```typescript
import { formGroup, formControl } from '@angular/forms';

readonly form = formGroup({
  title: formControl('', { validators: [Validators.required] }),
  body:  formControl('', { validators: [Validators.required] }),
  tags:  formControl(''),
});
```

### Query params as state

```typescript
// In container: read query params via @Input() (withComponentInputBinding)
page = input<number>(1);
search = input<string>('');

// Update URL when user changes filter
updateFilter(author: number) {
  this.router.navigate([], { queryParams: { userId: author, page: 1 }, queryParamsHandling: 'merge' });
}
```

### Ownership check in UI

```html
@if (post().userId === currentUser()?.id) {
  <button>{{ 'posts.detail.edit' | transloco }}</button>
}
```

### Deferred comments

```html
@defer (on viewport) {
  <app-comment-list [comments]="comments()" />
} @placeholder {
  <p class="text-sm text-gray-400">{{ 'posts.detail.loadingComments' | transloco }}</p>
}
```

---

## State: loading / empty / error / forbidden

Every container page must handle all four states explicitly:

```html
@if (resource.isLoading()) { <app-loading-spinner /> }
@else if (resource.error()) { <app-error-state /> }
@else if (!resource.value()?.length) { <app-empty-state /> }
@else { <!-- actual content --> }
```

Components are in `shared/components/`: `LoadingSpinnerComponent`, `EmptyStateComponent`, `ErrorStateComponent`.

---

## i18n

- All user-facing strings use `| transloco` pipe or `[transloco]` directive.
- Translation files: `public/i18n/es.json` and `public/i18n/en.json`.
- Key pattern: `feature.section.label` — e.g., `posts.list.title`, `login.form.submit`.
- Language toggle in header persists to `localStorage` under key `lang`.
- Do NOT add keys to one file without adding them to the other.

---

## Testing

### Unit (Vitest + Testing Library)

- Test file alongside source: `post-list-page.spec.ts` next to `post-list-page.ts`
- Use `render()` from `@testing-library/angular` for component tests
- Use `vi.fn()` for mocks, `vi.spyOn()` for spies
- Cover: auth service login/logout, auth guard redirect, post owner guard, form validation

### E2E (Playwright)

- Tests in `e2e/` at project root
- Critical flow: Login → View posts list → Create post → View detail → Add comment → Delete post → Logout
- `playwright.config.ts` starts `npm run dev` automatically for CI

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Component class | kebab-case `.ts` | `post-card.ts` |
| Component template | same name `.html` | `post-card.html` |
| Service | `<name>.service.ts` | `posts.service.ts` |
| Guard | `<name>.guard.ts` | `auth.guard.ts` |
| Model | `<name>.model.ts` | `post.model.ts` |
| Routes | `<feature>.routes.ts` | `posts.routes.ts` |
| Spec | alongside source `.spec.ts` | `post-list-page.spec.ts` |

---

## Acceptance Criteria (definition of done)

Before considering any feature complete, verify:

- [ ] `npm run build` passes with no errors or warnings
- [ ] `npm run lint` passes
- [ ] All UI strings use Transloco (no hardcoded text in templates)
- [ ] Both `es.json` and `en.json` have the new keys
- [ ] Loading, empty, and error states are handled in every container
- [ ] Only own resources show edit/delete buttons
- [ ] `/posts/:id/edit` redirects to `/forbidden` for non-owners
- [ ] Routes are lazy loaded (verify chunks in build output)
- [ ] Unit test added or updated for changed logic
- [ ] Mobile layout works at 375px width

---

## What NOT to do

- Do not use `NgModule`, `FormsModule`, or `ReactiveFormsModule`
- Do not use `ngOnInit` for data that can be a `computed()` or `httpResource()`
- Do not hardcode strings — always use Transloco
- Do not import one feature module from another
- Do not use `any` type — use proper interfaces from `models/`
- Do not write CSS in component files — use Tailwind utility classes
- Do not call `HttpClient` for GET requests — use `httpResource()` instead
- Do not add dark mode — out of scope
