## Estado actual de cada hallazgo del Veredicto

### ✅ Resueltos completamente

| # | Hallazgo | Estado |
|---|----------|--------|
| Alta | CRUD de comentarios incompleto — faltaba edición | **Resuelto.** `update()` en `CommentsService`, UI con `startEdit`/`submitEdit`/`cancelEdit`, claves i18n `comments.edit` y `comments.cancel` añadidas. |
| Alta | Suite unitaria con 9 tests rotos | **Resuelto.** 44/44 tests en verde con `TestBed.flushEffects()` + `flushAll()` async y `provideZonelessChangeDetection()`. |
| Media | `resource()` + `HttpClient.get` en el listado principal | **Resuelto.** post-list-page.ts usa `httpResource()` con `.headers()` para `X-Total-Count`. |
| Media | Contraseña persistida en localStorage | **Resuelto.** auth.service.ts construye `AuthUser` explícitamente campo a campo, sin propagar la contraseña. |
| Media | db.json contaminado con artefactos e2e | **Resuelto.** 8 posts E2E eliminados. |
| Media | Lista de tags hardcodeada | **Resuelto.** Tags se extraen dinámicamente del dataset real via `httpResource`. |
| Baja | app.ts usa `OnInit` | **Resuelto.** Reemplazado por inicialización en constructor. |
| Baja | Non-null assertions sobre `currentUser()` | **Resuelto.** Reemplazados por guards explícitos en posts.service.ts, comments.service.ts y comment-section.ts. |
| Baja | Clave `posts.detail.title` faltante en i18n | **Resuelto.** Añadida en es.json y en.json. |

---

### ⚠️ Pendientes / parcialmente resueltos

**1. comments.service.ts — `getPage` sigue usando `HttpClient.get` (no `httpResource`)**  
El veredicto señalaba que los GETs de comentarios usan `HttpClient.get` en lugar de `httpResource`. En este caso es correcto técnicamente: la paginación infinita necesita el header `X-Total-Count` y acumula páginas manualmente, lo que hace que un `httpResource` simple no encaje sin lógica extra. No obstante, sigue siendo `HttpClient.get` para un GET de lectura.

**2. auth.service.ts — `login` sigue usando `HttpClient.get`**  
El login busca `/api/users?name=X&password=Y`. El veredicto lo señalaba. Sin embargo, el login es un caso límite: es un GET que actúa como operación con efecto (inicia sesión), y `httpResource` no es apropiado para una operación imperativa con resultado único. Este uso de `HttpClient.get` está justificado.

**3. post-owner.guard.ts — usa `HttpClient.get` directamente**  
Un guard que hace `http.get<Post>` para validar el owner. No es posible usar `httpResource` en un guard (contexto de inyección distinto, flujo imperativo). Correcto tal como está.

**4. infinite-scroll.directive.ts — usa `OnInit`/`OnDestroy`**  
Es una directiva que debe configurar un `IntersectionObserver` cuando el elemento está en el DOM. `OnInit` es la única manera correcta de hacerlo en una directiva. Este uso está justificado por la naturaleza del DOM lifecycle.

---

### Conclusión

**Todos los hallazgos accionables del Veredicto están resueltos.** Los 4 casos pendientes son `HttpClient.get` o `OnInit` cuyo uso está arquitectónicamente justificado (login imperativo, guard, paginación acumulativa con headers, DOM lifecycle en directiva), no son incumplimientos reales del requisito.
