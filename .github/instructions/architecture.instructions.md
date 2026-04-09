---
applyTo: "src/**"
description: "Architecture guide for the Angular Posts SPA. Use when creating components, services, routes, or organizing code under src/."
---

# Screaming Architecture — Angular Posts

## Folder Structure

```
src/app/
├── core/                          # Singleton services, guards, interceptors, layout
│   ├── auth/
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── guest.guard.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── models/
│   │       └── user.model.ts
│   ├── layout/
│   │   ├── header/
│   │   │   ├── header.ts
│   │   │   └── header.html
│   │   └── layout/
│   │       ├── layout.ts
│   │       └── layout.html
│   └── i18n/
│       └── transloco-loader.ts
├── features/                      # Feature modules, lazy loaded
│   ├── login/
│   │   ├── login-page/
│   │   │   ├── login-page.ts       # Container
│   │   │   └── login-page.html
│   │   └── login.routes.ts
│   ├── posts/
│   │   ├── models/
│   │   │   ├── post.model.ts
│   │   │   └── comment.model.ts
│   │   ├── services/
│   │   │   ├── posts.service.ts
│   │   │   └── comments.service.ts
│   │   ├── guards/
│   │   │   └── post-owner.guard.ts
│   │   ├── post-list/
│   │   │   ├── post-list-page.ts    # Container
│   │   │   ├── post-list-page.html
│   │   │   ├── post-card.ts         # Presentational
│   │   │   ├── post-card.html
│   │   │   ├── post-filters.ts      # Presentational
│   │   │   ├── post-filters.html
│   │   │   ├── pagination.ts        # Presentational
│   │   │   └── pagination.html
│   │   ├── post-detail/
│   │   │   ├── post-detail-page.ts  # Container
│   │   │   ├── post-detail-page.html
│   │   │   ├── comment-list.ts      # Presentational
│   │   │   ├── comment-list.html
│   │   │   ├── comment-item.ts      # Presentational
│   │   │   ├── comment-item.html
│   │   │   ├── comment-form.ts      # Presentational
│   │   │   └── comment-form.html
│   │   ├── post-editor/
│   │   │   ├── post-editor-page.ts  # Container (new + edit)
│   │   │   ├── post-editor-page.html
│   │   │   ├── post-form.ts         # Presentational
│   │   │   └── post-form.html
│   │   └── posts.routes.ts
│   └── forbidden/
│       ├── forbidden-page.ts
│       └── forbidden-page.html
└── shared/                        # Reusable dumb components, pipes, utils
    ├── components/
    │   ├── loading-spinner.ts
    │   ├── empty-state.ts
    │   ├── error-state.ts
    │   └── avatar.ts
    └── pipes/
        └── relative-time.pipe.ts
```

## Rules

### Core vs Features vs Shared

| Layer | Contains | Imported by |
|-------|----------|-------------|
| `core/` | Auth, layout, interceptors, i18n config. Singleton services. | `app.config.ts`, `app.routes.ts` |
| `features/` | Feature-specific pages, services, models, guards. Each feature is self-contained. | Only via lazy route loading. Features NEVER import each other. |
| `shared/` | Reusable presentational components, pipes, utilities. Zero business logic. | Any layer. |

### Container vs Presentational

**Container components** (suffixed `-page`):
- Inject services, manage state, call APIs
- Use `httpResource()` or service methods
- Handle routing, query params
- Pass data to presentational children via `input()`

**Presentational components** (no suffix or descriptive name):
- Receive data via `input()`, emit events via `output()`
- No injected services (except Transloco for i18n)
- No routing awareness
- Pure rendering + user interaction

### Routing

All feature routes lazy loaded in `app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: 'login', loadChildren: () => import('./features/login/login.routes') },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'posts', loadChildren: () => import('./features/posts/posts.routes') },
      { path: 'forbidden', loadComponent: () => import('./features/forbidden/forbidden-page') },
      { path: '', redirectTo: 'posts', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'posts' },
];
```

Feature routes files define sub-routes:

```typescript
// posts.routes.ts
export default [
  { path: '', component: PostListPageComponent },
  { path: 'new', component: PostEditorPageComponent },
  { path: ':id', component: PostDetailPageComponent },
  { path: ':id/edit', component: PostEditorPageComponent, canActivate: [postOwnerGuard] },
] as Routes;
```

### State Management

- **No external state library.** Use Angular signals.
- `signal()` for local mutable state
- `computed()` for derived state
- `httpResource()` for server data (includes loading/error states)
- `linkedSignal()` for state that resets when a dependency changes
- Query params as the source of truth for filters/pagination (read via `input()` with `withComponentInputBinding()`)

### Data Flow Pattern

```
URL query params → Container reads via input() → builds httpResource params → httpResource fetches
                 → passes data to Presentational via input()
                 → Presentational emits event via output()
                 → Container updates query params via Router.navigate()
                 → cycle repeats
```

### Comments: Deferred Loading

Use `@defer` in post detail template:

```html
@defer (on viewport) {
  <app-comment-list [comments]="comments()" />
} @placeholder {
  <p>{{ 'posts.detail.loadingComments' | transloco }}</p>
}
```

### Ownership Rules

- UI: Only show edit/delete buttons when `post.userId === currentUser().id`
- Route guard: `postOwnerGuard` on `/posts/:id/edit` fetches the post and compares userId
- If ownership fails → navigate to `/forbidden`
