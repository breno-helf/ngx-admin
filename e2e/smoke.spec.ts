import { test, expect, Page } from '@playwright/test';

const routes: { path: string, name: string }[] = [
  { path: '/pages/dashboard', name: 'dashboard' },
  { path: '/pages/tables/smart-table', name: 'smart table' },
  { path: '/pages/charts/echarts', name: 'charts' },
  { path: '/pages/maps/leaflet', name: 'maps' },
  { path: '/pages/editors/tinymce', name: 'editors' },
  { path: '/pages/forms/inputs', name: 'forms' },
  { path: '/auth/login', name: 'auth login' },
];

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

for (const route of routes) {
  test(`renders ${route.name} (${route.path}) without console errors`, async ({ page }) => {
    const errors = await collectConsoleErrors(page);

    await page.goto(route.path, { waitUntil: 'networkidle' });

    await expect(page.locator('body')).toBeVisible();
    if (route.path.startsWith('/auth')) {
      await expect(page.locator('nb-auth')).toBeVisible();
    } else {
      await expect(page.locator('ngx-one-column-layout')).toBeVisible();
    }

    expect(errors, `Console errors on ${route.path}:\n${errors.join('\n')}`).toEqual([]);
  });
}
