## Veredicto
- Apta con reservas.
- La entrega cubre bien el flujo principal y tiene una base funcional razonable, pero deja incumplimientos claros en comments, en Angular moderno exigido y en la fiabilidad real de la suite de tests.
## Hallazgos
- Alta: el CRUD de comentarios está incompleto; no existe edición de comments.
  Evidencia: `src/app/features/posts/services/comments.service.ts:12-44` solo implementa `getPage`, `create` y `delete`. `src/app/features/posts/post-detail/components/comment-section/comment-section.html:29-37` solo renderiza acción de borrar para comentarios propios. La búsqueda `updateComment|comments.update|Editar comentario` no devuelve ninguna implementación en el repo.
- Alta: la suite unitaria no está verde aunque el repositorio la declara como parte del entregable.
  Evidencia: `npm test -- --watch=false` falla con 9 tests rotos en `src/app/features/posts/services/users.service.spec.ts` y `src/app/features/posts/services/posts.service.spec.ts`, ambos esperando requests que no llegan al usar `httpResource`.
- Media: la entrega usa Angular moderno solo de forma parcial; varios GET siguen fuera de `httpResource` y el listado principal usa `resource()` + `HttpClient` en vez de `httpResource`.
  Evidencia: `src/app/features/posts/post-list/post-list-page.ts:53-82` usa `resource()` con `HttpClient.get` para el listado; `src/app/features/posts/services/comments.service.ts:12-31` usa `HttpClient.get` para comentarios; `src/app/core/auth/services/auth.service.ts:20-32` usa `HttpClient.get` para login. El requisito técnico pedía `httpResource` como API de lectura obligatoria.
- Media: se persiste en `localStorage` el usuario completo, incluida la contraseña mock.
  Evidencia: `src/app/core/auth/services/auth.service.ts:26-31` guarda `authUser` completo. Verificado en ejecución con `agent-browser eval localStorage.getItem('auth_user')`, que devolvió `{"id":1,"name":"alice","password":"alice123",...}`.
- Media: el `db.json` versionado está contaminado con artefactos e2e.
  Evidencia: `db.json:473-560` contiene varios posts `E2E Post ...` con tags `e2e` y `playwright` en `HEAD`.
- Media: el filtro de tags no sale del dataset real sino de una lista fija, así que puede quedarse desalineado respecto a los datos.
  Evidencia: `src/app/features/posts/post-list/components/post-filters/post-filters.ts:10-21` define `ALL_TAGS` hardcodeado, mientras el `db.json` real ya contiene tags adicionales como `e2e` y `playwright` en `db.json:476-478`, `487-489`, etc., que no aparecen en la UI.
- Baja: sigue habiendo uso de APIs clásicas y atajos no seguros que rebajan la nota de “Angular moderno”.
  Evidencia: `src/app/app.ts:1-18` usa `OnInit`; `src/app/features/posts/services/posts.service.ts:14`, `src/app/features/posts/services/comments.service.ts:36` y `src/app/features/posts/post-detail/components/comment-section/comment-section.ts:96` usan non-null assertions sobre `currentUser()`.
- Baja: hay una clave de traducción usada pero no definida.
  Evidencia: `src/app/features/posts/post-detail/post-detail-page.html:19` usa `posts.detail.title`, pero no existe en `public/i18n/es.json` ni en `public/i18n/en.json`. En ejecución se vio el atributo accesible como texto literal `posts.detail.title`.
## Cobertura de requisitos
- `Cumple`: login, persistencia de sesión, interceptor, `authGuard`, `guestGuard` y protección de edición con `postOwnerGuard`.
- `Cumple`: CRUD de posts.
- `Parcial`: CRUD de comments.
  Crear y borrar sí; editar no.
- `Cumple`: detalle con autor y comentarios.
- `Cumple`: filtros por texto, autor y etiqueta; paginación con `query params`; prefetch de post al hover.
- `Cumple`: i18n runtime `es/en` y UI responsive en términos generales.
- `Cumple`: `standalone`, `signals`, Signal Forms, `zoneless`, lazy loading, Tailwind, Transloco, Husky, lint-staged y commits consistentes.
- `Parcial`: `httpResource`.
  Está presente, pero no se usa en todos los GET relevantes.
- `Cumple`: `@defer` real para comments.
  Evidencia: en móvil, el HAR inicial de `/posts/2` no incluyó requests a `/comments`; solo se mostró el placeholder `Cargando comentarios...`.
- `Parcial`: testing.
  Hay unit tests y e2e, pero la suite unitaria no pasa y la cobertura no toca edición de comentarios ni contenedores críticos del flujo completo.
- `Checks ejecutados`:
  `npm run lint` pasó.
  `npm run build` pasó.
  `npm test -- --watch=false` falló.
  `npm run e2e` falló por timeout del `webServer`, pero `npx ng e2e` sí pasó con 6 tests.
## Riesgos abiertos
- `npm run e2e` no es fiable tal como está documentado en `package.json`, porque Playwright espera el servidor en `60864` y el script `dev` arranca Angular en `4200`. El target `ng e2e` sí resuelve ese arranque.
- El detalle en viewport muy bajo depende mucho del layout con `h-screen overflow-hidden`; en móvil estrecho se ve primero el placeholder y puede quedar ajustado al alto visible. No lo vi romper en escritorio, pero conviene revisarlo en dispositivos pequeños reales.
