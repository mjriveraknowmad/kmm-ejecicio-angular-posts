# Proyecto: Angular moderno con backend mock

## Objetivo

Construye una SPA con Angular moderno para gestionar `posts` y `comments` sobre un backend mock basado en `json-server`.

La idea es practicar Angular actual con algo pequeño pero completo. Importa más una solución bien pensada y mantenible que una lista larga de features.

Se proporciona un diseño en Figma como inspiración de lo que buscamos lograr con esta práctica:

- https://www.figma.com/design/7en10Y86YbN3QYZMmBy0AQ

## Backend mock

Usa `json-server` como base del backend, partiendo del archivo [`db.json`](./db.json).

- Repositorio oficial: https://github.com/typicode/json-server
- Documentación de uso: https://github.com/typicode/json-server#readme
- Ejemplo de arranque: `npx json-server db.json`
- Relación de datos:
  - `users`
  - `posts` con `userId`
  - `comments` con `postId` y `userId`

El login debe resolverse buscando coincidencia entre `name` y `password` dentro de `users`. Si el login es correcto, genera o simula un token estático y úsalo en las llamadas autenticadas mediante `Http Interceptor`.

Credenciales mock disponibles:

- `alice` / `alice123`
- `bruno` / `bruno123`
- `carla` / `carla123`

## Requisitos funcionales

- Pantalla de `login`.
- Protección de rutas con `guards` y redirección a `login` si no hay sesión.
- Persistencia de sesión tras recarga y acción de `logout`.
- CRUD completo de `posts`.
- CRUD completo de `comments` dentro del detalle de cada post.
- Listado de posts con:
  - paginación
  - búsqueda por texto sobre título y contenido
  - filtro por autor
  - filtro por etiqueta
- Detalle de post con autor y comentarios.
- Solo se puede editar o borrar contenido propio:
  - no deben mostrarse acciones de edición/borrado sobre recursos ajenos en la UI normal
  - si se fuerza navegación manual a una ruta no autorizada, debe resolverse con protección y estado o flujo adecuado
- Internacionalización obligatoria en `es` y `en`.
- La aplicación debe ser responsive.
- La implementación visual debe tomar el diseño proporcionado como inspiración.
- Manejo consistente y explícito de estados `loading`, `empty`, `error` y `forbidden` en las vistas principales.

Flujo mínimo esperado:

- `/login`
- `/posts`
- `/posts/new`
- `/posts/:id`
- `/posts/:id/edit`

## Requisitos técnicos

- Usar la versión estable más reciente de Angular disponible al comenzar el proyecto.
- La idea es practicar Angular moderno de verdad, aunque eso implique usar APIs oficiales que todavía estén en estado experimental.
- Obligatorio:
  - `standalone`
  - `signals`
  - `Signal Forms` en todos los formularios
  - `httpResource`
  - `zoneless`
  - `lazy loading` de rutas
  - `@defer` para comentarios
  - `ngx-translate` o `Transloco` para i18n runtime
  - `TailwindCSS` para maquetación
  - enfoque `mobile first`
  - `Screaming Architecture`: estructura guiada por dominio o feature, no por carpetas técnicas globales
  - separación clara entre componentes contenedores y presentacionales
  - librería de componentes libre de uso o componentes propios
- Calidad:
  - `ESLint`
  - `Prettier`
  - `Husky`
  - `lint-staged`
  - convención de commits consistente, preferiblemente `Conventional Commits`
  - flujo de trabajo de ramas razonado, ya sea `git flow` o una alternativa equivalente
- Testing:
  - `Vitest`
  - `Testing Library`
  - `Playwright` para al menos un flujo crítico end-to-end

## Criterios de aceptación

- La aplicación arranca con el backend mock basado en `db.json`.
- El login valida contra `users` y deja sesión persistida.
- Las llamadas protegidas usan interceptor con token.
- Las rutas privadas no son accesibles sin sesión.
- El listado permite paginar y filtrar por texto, autor y etiqueta.
- El detalle carga comentarios de forma lazy y no los solicita antes de que sean necesarios.
- No pueden editarse ni borrarse recursos ajenos desde la UI ni forzando rutas de edición.
- La aplicación permite cambiar entre `es` y `en` en runtime.
- La aplicación funciona correctamente en móvil y escritorio.
- La implementación mantiene una dirección visual alineada con el diseño compartido.
- La UI contempla estados `loading`, `empty`, `error` y `forbidden`.
- Existe cobertura automatizada sobre autenticación, guards, listado, detalle diferido, ownership y al menos un flujo CRUD.

## Entregable

Entrega un repositorio git con:

- código fuente
- `db.json`
- `README.md` breve con instrucciones de ejecución
- scripts operativos para desarrollo, lint, test y e2e

Incluye en el README final del proyecto una nota corta con decisiones técnicas o tradeoffs relevantes.

## Uso de IA

Se permite usar herramientas de IA durante el desarrollo. Se valorará que se usen bien: para acelerar trabajo mecánico, contrastar alternativas, mejorar testing o arquitectura y, sobre todo, para hacer buen `harness engineering`, es decir, dar a la IA contexto útil, documentación oficial, docs del proyecto, skills, subagentes o criterios de aceptación claros cuando de verdad ayuden.

Si has usado IA, deja una nota breve indicando qué herramientas usaste, para qué las usaste y qué decisiones revisaste o corregiste manualmente.

## Valorable

- `router state` con `query params` para filtros y paginación
- prefetch de datos al pasar por encima de un post
- optimistic updates
- virtual scrolling o paginación infinita donde tenga sentido
  - sugerencia: comentarios con scroll infinito en lugar de paginación
- state management avanzado
- accesibilidad
- animaciones

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
npm run e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

