import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:4173';

async function addItem(page, { type = 'bill', name, amount, day, recurrence = 'monthly' }) {
  await page.getByRole('button', { name: '+ Add item' }).click();
  await page.locator('#itemType').selectOption(type);
  await page.locator('#itemName').fill(name);
  await page.locator('#itemAmount').fill(String(amount));
  await page.locator('#itemDay').fill(String(day));
  await page.locator('#itemRecurrence').selectOption(recurrence);
  await page.getByRole('button', { name: 'Save item' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('complete monthly planning flow is truthful across months', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await expect(page.locator('#warningBanner')).toBeHidden();
  await page.locator('#startingBalance').fill('-25.50');
  await page.locator('#safetyBuffer').fill('500');
  await page.locator('#currency').selectOption('EUR');
  await page.getByRole('button', { name: 'Save starting point' }).click();
  await expect(page.locator('#statusRegion')).toContainText('Starting point saved');
  await expect(page.locator('#bufferValue')).toContainText('€');

  await page.getByRole('button', { name: '+ Add item' }).click();
  await page.locator('#itemName').fill('Must not save');
  await page.locator('#itemAmount').fill('10');
  await page.locator('#itemDay').fill('2');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Must not save')).toHaveCount(0);

  await addItem(page, { type: 'income', name: 'Monthly pay', amount: 2000, day: 1 });
  await addItem(page, { name: 'Month-end bill', amount: 100, day: 31 });
  await addItem(page, { name: 'Only this month', amount: 40, day: 15, recurrence: 'one-time' });
  await expect(page.getByText('Monthly pay')).toBeVisible();
  await expect(page.locator('#forecastTableBody tr')).toHaveCount(30);
  await expect(page.locator('#forecastChart .forecast-bar span')).toHaveCount(30);

  await page.getByRole('button', { name: /Mark paid: Month-end bill/ }).click();
  await expect(page.locator('.status-pill', { hasText: 'Paid' })).toBeVisible();
  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.getByText('Monthly pay')).toBeVisible();
  await expect(page.getByText('Only this month')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Mark paid: Month-end bill/ })).toBeVisible();
  await expect(page.locator('.status-pill', { hasText: 'Paid' })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'docs/qa-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('safe warning stays hidden and sample action becomes honest after adding an item', async ({ page }) => {
  await expect(page.locator('#warningBanner')).toBeHidden();
  await expect(page.locator('#sampleButton')).toBeEnabled();
  await addItem(page, { type: 'income', name: 'Existing plan item', amount: 25, day: 5 });
  await expect(page.locator('#sampleButton')).toBeDisabled();
  await expect(page.locator('#sampleButton')).toHaveText('Example plan already added');
  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.locator('#warningBanner')).toBeHidden();
});

test('validation and malformed import are visible and preserve data', async ({ page }) => {
  await page.locator('#startingBalance').fill('1e30');
  await page.getByRole('button', { name: 'Save starting point' }).click();
  await expect(page.locator('#statusRegion')).toHaveClass(/is-error/);
  await expect(page.locator('#statusRegion')).toContainText('Enter a starting balance');

  await addItem(page, { name: 'Keep me', amount: 25, day: 5 });
  await page.locator('#importFile').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.locator('#statusRegion')).toHaveClass(/is-error/);
  await expect(page.getByText('Keep me')).toBeVisible();
});

test('responsive, privacy, accessible forecast, and print boundaries', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'See an example plan' }).click();
  const geometry = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client);
  await expect(page.locator('#forecastTableBody tr')).toHaveCount(30);
  await page.getByRole('button', { name: 'Privacy & data' }).click();
  await expect(page.getByRole('dialog', { name: 'Private on this device' })).toBeVisible();
  await page.getByRole('button', { name: 'I understand' }).click();
  await page.screenshot({ path: 'docs/qa-mobile.png', fullPage: true });
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#sampleButton')).toBeHidden();
  await expect(page.locator('#itemDialog')).toBeHidden();
});

test('runtime uses only same-origin static requests', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.reload();
  expect(requests.length).toBeGreaterThan(0);
  for (const url of requests) expect(new URL(url).origin).toBe(BASE);
});
