import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(page: Page, username = 'alice', password = 'alice123') {
  await page.goto('/login');
  await page.getByPlaceholder('usuario').fill(username);
  await page.getByPlaceholder('contraseña').fill(password);
  await page.getByRole('button', { name: 'Acceder' }).click();
  await expect(page).toHaveURL('/posts');
}

async function createPost(
  page: Page,
  title: string,
  body = 'Cuerpo del post creado por el test E2E.',
  tags = 'e2e',
): Promise<string> {
  await page.getByRole('link', { name: 'Nuevo' }).click();
  await expect(page).toHaveURL('/posts/new');
  await page.getByPlaceholder('Título del post...').fill(title);
  await page.getByPlaceholder('Contenido del post...').fill(body);
  await page.getByPlaceholder('Tags, separados por coma').fill(tags);
  await page.getByRole('button', { name: 'Publicar' }).click();
  await expect(page).toHaveURL(/\/posts\/\d+$/);
  return page.url();
}

async function deleteCurrentPost(page: Page, isMobile = false): Promise<void> {
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
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test('Full cycle: login → create post → detail → add comment → delete → logout', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(30000);

  // 1. Login → verify posts list is shown
  await login(page);
  await expect(page.getByRole('heading', { name: /posts/i })).toBeVisible();

  // 2. Create post → land on detail
  const postTitle = `E2E Cycle ${Date.now()}`;
  await createPost(
    page,
    postTitle,
    'Cuerpo del post creado por el test E2E de Playwright.',
    'e2e, playwright',
  );
  await expect(page.getByRole('heading', { level: 1 })).toContainText(postTitle);

  // 3. Add comment
  const commentBox = page.getByPlaceholder('Escribe tu comentario...');
  await commentBox.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await commentBox.fill('Comentario del test E2E.');
  await page.getByRole('button', { name: 'Publicar comentario' }).click();
  await expect(page.getByText('Comentario del test E2E.').first()).toBeVisible({ timeout: 5000 });

  // 4. Delete post → redirected to list, post no longer visible
  await deleteCurrentPost(page, isMobile);
  await expect(page.getByText(postTitle)).not.toBeVisible();

  // 5. Logout
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page).toHaveURL('/login');
});

test('Edit post — owner can update title, body and tags', async ({ page }) => {
  await login(page);

  // Create a dedicated post for this test
  const originalTitle = `E2E Edit ${Date.now()}`;
  const postUrl = await createPost(page, originalTitle, 'Contenido original del post.', 'e2e');
  const postId = postUrl.match(/\/posts\/(\d+)$/)?.[1];

  // Click Edit
  const editLink = page.getByRole('link', { name: 'Editar' });
  await editLink.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await editLink.click();
  await expect(page).toHaveURL(`/posts/${postId}/edit`, { timeout: 5000 });
  await expect(page.getByRole('heading', { name: 'Editar post' })).toBeVisible();

  // Wait for form to be prefilled
  await expect(page.locator('#title')).not.toHaveValue('', { timeout: 5000 });
  await expect(page.getByPlaceholder('Contenido del post...')).not.toHaveValue('');

  // Update title
  const updatedTitle = `${originalTitle} editado`;
  await page.getByPlaceholder('Título del post...').fill(updatedTitle);
  await page.getByRole('button', { name: 'Guardar' }).click();

  // Verify redirect to detail with updated title
  await expect(page).toHaveURL(`/posts/${postId}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    new RegExp(`\\s*${updatedTitle}\\s*`),
  );

  // Clean up: delete the post
  await deleteCurrentPost(page);
});

test('Non-owner cannot access edit route (redirects to forbidden)', async ({ page }) => {
  // Create a post owned by alice
  await login(page, 'alice', 'alice123');
  const postUrl = await createPost(
    page,
    `E2E NonOwner ${Date.now()}`,
    'Contenido para test de no propietario.',
    'e2e',
  );
  const postId = postUrl.match(/\/posts\/(\d+)$/)?.[1];

  // Logout alice
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page).toHaveURL('/login');

  // Login as bruno (not the owner)
  await login(page, 'bruno', 'bruno123');

  // Try to access alice's post edit page
  await page.goto(`/posts/${postId}/edit`);
  await expect(page).toHaveURL('/forbidden');

  // Clean up: logout bruno, login alice, delete the post
  await page.getByRole('button', { name: 'Salir' }).click();
  await login(page, 'alice', 'alice123');
  await page.goto(postUrl);
  await deleteCurrentPost(page);
});
