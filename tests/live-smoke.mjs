import { chromium } from '@playwright/test';

const url = 'https://balanceahead.randomvibez.ai/';
const browser = await chromium.launch({
  headless: true,
  args: ['--host-resolver-rules=MAP balanceahead.randomvibez.ai 198.251.71.102'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const requests = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(String(error)));
page.on('request', request => requests.push(request.url()));
const response = await page.goto(url, { waitUntil: 'networkidle' });
if (!response || response.status() !== 200) throw new Error(`unexpected status ${response?.status()}`);
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
if (await page.title() !== 'BalanceAhead · private cash-flow planning') throw new Error('unexpected title');
await page.locator('#startingBalance').fill('100');
await page.locator('#safetyBuffer').fill('50');
await page.locator('#currency').selectOption('USD');
await page.getByRole('button', { name: 'Save starting point' }).click();
await page.getByRole('button', { name: '+ Add item' }).click();
await page.locator('#itemType').selectOption('income');
await page.locator('#itemName').fill('Live QA income');
await page.locator('#itemAmount').fill('1000');
await page.locator('#itemDay').fill('1');
await page.locator('#itemRecurrence').selectOption('monthly');
await page.getByRole('button', { name: 'Save item' }).click();
await page.getByRole('button', { name: '+ Add item' }).click();
await page.locator('#itemType').selectOption('bill');
await page.locator('#itemName').fill('Live QA bill');
await page.locator('#itemAmount').fill('125');
await page.locator('#itemDay').fill('31');
await page.locator('#itemRecurrence').selectOption('one-time');
await page.getByRole('button', { name: 'Save item' }).click();
if (!await page.locator('.item-name', { hasText: 'Live QA income' }).isVisible()) throw new Error('income not visible');
if (!await page.locator('.item-name', { hasText: 'Live QA bill' }).isVisible()) throw new Error('bill not visible');
if (await page.locator('#forecastTableBody tr').count() < 28) throw new Error('forecast table incomplete');
await page.screenshot({ path: 'docs/live-desktop.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
const geometry = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
if (geometry.scroll > geometry.client) throw new Error(`horizontal overflow ${JSON.stringify(geometry)}`);
await page.screenshot({ path: 'docs/live-mobile.png', fullPage: true });
for (const requestUrl of requests) {
  if (new URL(requestUrl).origin !== new URL(url).origin) throw new Error(`external request ${requestUrl}`);
}
if (errors.length) throw new Error(`browser errors: ${errors.join(' | ')}`);
const headers = await response.allHeaders();
const observedBrowserHeaders = Object.keys(headers).sort();
console.log(JSON.stringify({ status: response.status(), title: await page.title(), geometry, forecastRows: await page.locator('#forecastTableBody tr').count(), requests: requests.length, observedBrowserHeaders, errors }, null, 2));
await browser.close();
