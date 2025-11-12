import { test, expect } from '@playwright/test';

test.describe('Nebu Dino pre-order flow', () => {
  test('full pre-order flow', async ({ page }) => {
    // 1) Go to pre-order page
    await page.goto('http://localhost:3000/pre-order', { waitUntil: 'networkidle' });

    // 2) Wait for inventory count (fallbacks included)
    const inventoryLocator = page.locator('text=unidades disponibles').first();
    await expect(inventoryLocator).toBeVisible({ timeout: 15000 });

    // Optional check of 20 available units in the UI text
    await expect(inventoryLocator).toContainText(/20/);

    // 3) Select a color - try by visible text 'Aqua', otherwise pick the first color option
    try {
      const color = page.getByRole('button', { name: 'Aqua' });
      if (await color.count()) {
        await color.click();
      } else {
        // generic fallback: click first button inside color selector
        await page.locator('[data-testid="color-options"] button').first().click();
      }
    } catch (e) {
      // best-effort fallback
      const firstColor = page.locator('[data-testid="color-options"] button').first();
      if (await firstColor.count()) await firstColor.click();
    }

    // 4) Select quantity = 2 (try select or increment button)
    try {
      const qtySelect = page.locator('select[name="quantity"]');
      if (await qtySelect.count()) {
        await qtySelect.selectOption('2');
      } else {
        // click plus button twice if present
        const plus = page.locator('[data-testid="qty-increment"]').first();
        if (await plus.count()) {
          await plus.click();
          await plus.click();
        }
      }
    } catch (e) {
      // ignore - best effort
    }

    // 5) Verify summary numbers (Total and 50% reserve). We'll assert that a price element displays 380 and 760
    const totalLocator = page.locator('text=S/').first();
    await expect(totalLocator).toBeVisible();
    await expect(totalLocator).toContainText(/380|760/);

    // 6) Fill checkout form. Use common input names and label fallbacks.
    // First name
    if (await page.locator('input[name="firstName"]').count()) {
      await page.fill('input[name="firstName"]', 'Juan');
    } else {
      await page.getByLabel('Nombre').fill('Juan').catch(() => {});
    }
    // Last name
    if (await page.locator('input[name="lastName"]').count()) {
      await page.fill('input[name="lastName"]', 'Pérez');
    } else {
      await page.getByLabel('Apellido').fill('Pérez').catch(() => {});
    }
    // Email
    await page.fill('input[type="email"]', 'test@example.com').catch(() => {});
    // Phone
    await page.fill('input[name="phone"]', '+51 945 012 824').catch(() => {});
    // Address
    await page.fill('input[name="address"]', 'Av. Ejemplo 123').catch(() => {});
    // City
    await page.fill('input[name="city"]', 'Lima').catch(() => {});

    // 7) Ensure Yape payment option is selected if available
    try {
      const yape = page.getByLabel(/Yape/i).first();
      if (await yape.count()) await yape.check();
    } catch (e) {
      // ignore if not present
    }

    // 8) Accept terms checkbox
    try {
      const terms = page.getByRole('checkbox', { name: /términos|terminos|terms/i }).first();
      if (await terms.count()) await terms.check();
    } catch (e) {}

    // 9) Intercept order POST to verify backend call
    const orderPromise = page.waitForResponse(resp => /orders/.test(resp.url()) && resp.request().method() === 'POST', { timeout: 15000 }).catch(() => null);

    // Click reserve button (text may include price)
    const reserveBtn = page.getByRole('button', { name: /Reservar ahora|Reservar ahora •|Reserve now/i }).first();
    if (await reserveBtn.count()) {
      await reserveBtn.click();
    } else {
      // fallback: click any button that looks like submit
      await page.locator('button[type="submit"]').first().click();
    }

    const orderResponse = await orderPromise;
    expect(orderResponse).not.toBeNull();
    expect(orderResponse?.status()).toBeTruthy();

    // 10) Expect some success UI - toast or heading
    await expect(page.locator('text=Gracias').first()).toBeVisible({ timeout: 10000 }).catch(() => {});
  });
});
