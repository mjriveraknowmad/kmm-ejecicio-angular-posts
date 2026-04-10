import { test, expect, type Page } from '@playwright/test';

// ─── Helper ──────────────────────────────────────────────────────────────────

async function login(page: Page, username = 'alice', password = 'alice123') {
  await page.goto('/login');
  await page.getByPlaceholder('usuario').fill(username);
  await page.getByPlaceholder('contraseña').fill(password);
  await page.getByRole('button', { name: 'Acceder' }).click();
  await expect(page).toHaveURL('/posts');
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test('Login redirects to posts list', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: /posts/i })).toBeVisible();
});

test('Create post and view detail', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Nuevo' }).click();
  await expect(page).toHaveURL('/posts/new');

  const postTitle = `E2E Post ${Date.now()}`;
  await page.getByPlaceholder('Título del post...').fill(postTitle);
  await page
    .getByPlaceholder('Contenido del post...')
    .fill('Cuerpo del post creado por el test E2E de Playwright.');
  await page.getByPlaceholder('Tags, separados por coma').fill('e2e, playwright');
  await page.getByRole('button', { name: 'Publicar' }).click();

  await expect(page).toHaveURL(/\/posts\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(postTitle);
});

test('Add comment to post', async ({ page }) => {
  await login(page);

  await page.goto('/posts/1');
  await expect(page.locator('app-loading-spinner')).toHaveCount(0, { timeout: 5000 });

  const commentBox = page.getByPlaceholder('Escribe tu comentario...');
  await commentBox.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await commentBox.fill('Comentario del test E2E.');
  await page.getByRole('button', { name: 'Publicar comentario' }).click();

  await expect(page.getByText('Comentario del test E2E.').first()).toBeVisible({ timeout: 5000 });
});

test('Delete own post', async ({ page, isMobile }) => {
  test.setTimeout(10000);
  await login(page);

  // Create a post to delete
  await page.getByRole('link', { name: 'Nuevo' }).click();
  const postTitle = `E2E Delete Test ${Date.now()}`;
  await page.getByPlaceholder('Título del post...').fill(postTitle);
  await page.getByPlaceholder('Contenido del post...').fill('Post para eliminar.');
  await page.getByPlaceholder('Tags, separados por coma').fill('e2e');
  await page.getByRole('button', { name: 'Publicar' }).click();

  await expect(page).toHaveURL(/\/posts\/\d+$/);

  const deleteBtn = page.locator('[data-cy="post-delete-btn"]');
  await deleteBtn.waitFor({ state: 'visible' });
  if (isMobile) {
    await deleteBtn.click({ force: true });
  } else {
    await deleteBtn.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await deleteBtn.click();
  }

  const confirmBtn = page.locator('[data-cy="confirm-post-delete-btn"]');
  await confirmBtn.waitFor({ state: 'visible' });
  if (isMobile) {
    await confirmBtn.click({ force: true });
  } else {
    await confirmBtn.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await confirmBtn.click();
  }

  await expect(page).toHaveURL('/posts');
  await expect(page.getByText(postTitle)).not.toBeVisible();
});

test('Logout redirects to login', async ({ page }) => {
  await login(page);
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
  await expect(page.locator('app-loading-spinner')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // ─── 3. Click Edit ───────────────────────────────────────────────────────
  const editLink = page.getByRole('link', { name: 'Editar' });
  await editLink.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await editLink.click();
  await expect(page).toHaveURL('/posts/1/edit');
  await expect(page.getByRole('heading', { name: 'Editar post' })).toBeVisible();

  // ─── 4. Verify form is prefilled with existing values ────────────────────
  // Wait for the httpResource to load and patch the form
  await expect(page.locator('#title')).not.toHaveValue('', { timeout: 10000 });
  await expect(page.getByPlaceholder('Contenido del post...')).not.toHaveValue('');

  // ─── 5. Update the title ─────────────────────────────────────────────────
  const updatedTitle = `Post 1 editado ahora`;
  await page.getByPlaceholder('Título del post...').fill(updatedTitle);
  await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar' }).click();

  // ─── 6. Redirected to detail with updated title ───────────────────────────
  await expect(page).toHaveURL('/posts/1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    new RegExp(`\\s*${updatedTitle}\\s*`),
  );

  // ─── 7. Restore original title ───────────────────────────────────────────
  const editLink2 = page.getByRole('link', { name: 'Editar' });
  await editLink2.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await editLink2.click();
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
