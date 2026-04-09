import { test, expect } from '@playwright/test';

test('Login → list → create post → detail → add comment → delete post → logout', async ({
  page,
}) => {
  // ─── 1. Login ────────────────────────────────────────────────────────────
  await page.goto('/login');

  await page.getByPlaceholder('usuario').fill('alice');
  await page.getByPlaceholder('contraseña').fill('alice123');
  await page.getByRole('button', { name: 'Acceder' }).click();

  await expect(page).toHaveURL('/posts');

  // ─── 2. Posts list visible ───────────────────────────────────────────────
  await expect(page.getByRole('heading', { name: /posts/i })).toBeVisible();

  // ─── 3. Navigate to new post editor ──────────────────────────────────────
  await page.getByRole('link', { name: 'Nuevo' }).click();
  await expect(page).toHaveURL('/posts/new');

  // ─── 4. Fill and submit the form ─────────────────────────────────────────
  const postTitle = `E2E Post ${Date.now()}`;

  await page.getByPlaceholder('Título del post...').fill(postTitle);
  await page
    .getByPlaceholder('Contenido del post...')
    .fill('Cuerpo del post creado por el test E2E de Playwright.');
  await page.getByPlaceholder('Tags, separados por coma').fill('e2e, playwright');
  await page.getByRole('button', { name: 'Publicar' }).click();

  // ─── 5. Redirected to post detail ────────────────────────────────────────
  await expect(page).toHaveURL(/\/posts\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(postTitle);

  // ─── 6. Add a comment (defer on viewport — scroll first) ─────────────────
  await page.getByPlaceholder('Escribe tu comentario...').scrollIntoViewIfNeeded();
  await page.getByPlaceholder('Escribe tu comentario...').fill('Comentario del test E2E.');
  await page.getByRole('button', { name: 'Publicar comentario' }).click();

  await expect(page.getByText('Comentario del test E2E.')).toBeVisible();

  // ─── 7. Delete the post ──────────────────────────────────────────────────
  await page.getByRole('article').getByRole('button', { name: 'Eliminar' }).click();
  await page.getByRole('button', { name: '¿Eliminar este post?' }).click();

  // ─── 8. Redirected back to list ──────────────────────────────────────────
  await expect(page).toHaveURL('/posts');
  await expect(page.getByText(postTitle)).not.toBeVisible();

  // ─── 9. Logout ───────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page).toHaveURL('/login');
});

test('Edit post — owner can update title, body and tags', async ({ page }) => {
  // ─── 1. Login as alice (owner of post id=1) ──────────────────────────────
  await page.goto('/login');
  await page.getByPlaceholder('usuario').fill('alice');
  await page.getByPlaceholder('contraseña').fill('alice123');
  await page.getByRole('button', { name: 'Acceder' }).click();
  await expect(page).toHaveURL('/posts');

  // ─── 2. Navigate to post detail ──────────────────────────────────────────
  await page.goto('/posts/1');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // ─── 3. Click Edit ───────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Editar' }).click();
  await expect(page).toHaveURL('/posts/1/edit');
  await expect(page.getByRole('heading', { name: 'Editar post' })).toBeVisible();

  // ─── 4. Verify form is prefilled with existing values ────────────────────
  // Wait for the httpResource to load and patch the form
  await expect(page.getByPlaceholder('Título del post...')).not.toHaveValue('', { timeout: 10000 });
  await expect(page.getByPlaceholder('Contenido del post...')).not.toHaveValue('');

  // ─── 5. Update the title ─────────────────────────────────────────────────
  const updatedTitle = `Post 1 editado ${Date.now()}`;
  await page.getByPlaceholder('Título del post...').fill(updatedTitle);
  await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar' }).click();

  // ─── 6. Redirected to detail with updated title ───────────────────────────
  await expect(page).toHaveURL('/posts/1');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(updatedTitle);

  // ─── 7. Restore original title ───────────────────────────────────────────
  await page.getByRole('link', { name: 'Editar' }).click();
  await expect(page.getByPlaceholder('Título del post...')).not.toHaveValue('', { timeout: 10000 });
  await page.getByPlaceholder('Título del post...').fill('Post 1: practical Angular topic 1');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Post 1: practical Angular topic 1',
  );
});

test('Non-owner cannot access edit route (redirects to forbidden)', async ({ page }) => {
  // ─── Login as bruno (does NOT own post id=1) ─────────────────────────────
  await page.goto('/login');
  await page.getByPlaceholder('usuario').fill('bruno');
  await page.getByPlaceholder('contraseña').fill('bruno123');
  await page.getByRole('button', { name: 'Acceder' }).click();
  await expect(page).toHaveURL('/posts');

  // ─── Try to navigate to post 1's edit page ───────────────────────────────
  await page.goto('/posts/1/edit');
  await expect(page).toHaveURL('/forbidden');
});
