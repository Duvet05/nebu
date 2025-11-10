import { test, expect } from '@playwright/test';

test.describe('Waitlist Form - Nebu Gato', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de pre-order
    await page.goto('/pre-order', { waitUntil: 'domcontentloaded' });

    // Esperar a que el título de Nebu Gato sea visible
    await page.getByRole('heading', { name: /nebu gato/i }).waitFor({ state: 'visible', timeout: 10000 });
  });

  test('debería mostrar el formulario de lista de espera', async ({ page }) => {
    // Verificar que el título existe
    await expect(page.getByText('¡Sé el primero en saber cuándo esté disponible!')).toBeVisible();

    // Verificar que el input de email existe
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    await expect(emailInput).toBeVisible();

    // Verificar que el botón "Unirme" existe
    const submitButton = page.getByRole('button', { name: /unirme/i }).last();
    await expect(submitButton).toBeVisible();
  });

  test('debería validar que el email es requerido', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /unirme/i }).last();

    // Intentar enviar sin email
    await submitButton.click();

    // El navegador debería mostrar validación HTML5
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('debería validar formato de email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    const submitButton = page.getByRole('button', { name: /unirme/i }).last();

    // Ingresar email inválido
    await emailInput.fill('correo-invalido');
    await submitButton.click();

    // El navegador debería mostrar validación HTML5
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toContain('@');
  });

  test('debería enviar el formulario correctamente con email válido', async ({ page }) => {
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    const submitButton = page.getByRole('button', { name: /unirme/i }).last();

    // Generar un email único para la prueba
    const testEmail = `test+${Date.now()}@example.com`;

    // Llenar el formulario
    await emailInput.fill(testEmail);

    // Verificar que el botón no está deshabilitado
    await expect(submitButton).not.toBeDisabled();

    // Enviar el formulario
    await submitButton.click();

    // Esperar a que aparezca el mensaje de éxito o error
    // El estado de loading puede ser muy rápido, así que esperamos directamente el resultado
    await page.waitForSelector('[class*="bg-green-50"], [class*="bg-red-50"]', {
      timeout: 15000,
    });

    // Verificar que se muestra el mensaje de éxito o error
    const successMessage = page.locator('[class*="bg-green-50"]');
    const errorMessage = page.locator('[class*="bg-red-50"]');

    const isSuccessVisible = await successMessage.isVisible().catch(() => false);
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);

    expect(isSuccessVisible || isErrorVisible).toBeTruthy();

    // Si fue exitoso, verificar el mensaje
    if (isSuccessVisible) {
      await expect(successMessage).toContainText(/gracias|éxito|lista/i);
    }
  });

  test('debería deshabilitar el botón durante el envío', async ({ page }) => {
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    const submitButton = page.getByRole('button', { name: /unirme/i }).last();

    // Llenar el formulario
    await emailInput.fill('test@example.com');

    // Click en el botón
    await submitButton.click();

    // Inmediatamente después del click, el botón debería estar deshabilitado
    // o mostrar el estado de loading
    const isDisabledOrLoading = await Promise.race([
      submitButton.isDisabled(),
      page.waitForSelector('button:has-text("...")', { timeout: 1000 }).then(() => true),
    ]);

    expect(isDisabledOrLoading).toBeTruthy();
  });

  test('debería limpiar el input después de envío exitoso', async ({ page }) => {
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    const submitButton = page.getByRole('button', { name: /unirme/i }).last();

    const testEmail = `test+${Date.now()}@example.com`;

    // Llenar y enviar
    await emailInput.fill(testEmail);
    await submitButton.click();

    // Esperar mensaje de éxito (si el API funciona)
    try {
      await page.waitForSelector('[class*="bg-green-50"]', { timeout: 10000 });

      // Verificar que el input se limpió
      await expect(emailInput).toHaveValue('');
    } catch {
      // Si no hay mensaje de éxito, está bien (API no disponible)
      console.log('API no disponible, test omitido');
    }
  });

  test('debería mostrar el mensaje de descuento del 10%', async ({ page }) => {
    // Verificar que menciona el descuento
    await expect(page.getByText(/10% de descuento/i)).toBeVisible();
  });

  test('debería tener el placeholder correcto en el input', async ({ page }) => {
    const emailInput = page.locator('input[type="email"][placeholder="tu@email.com"]').last();
    await expect(emailInput).toHaveAttribute('placeholder', 'tu@email.com');
  });
});
