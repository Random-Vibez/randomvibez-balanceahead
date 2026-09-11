import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('static app has privacy, safety, and no-network contracts', () => {
  assert.match(html, /local storage/i);
  assert.match(html, /Exported files are unencrypted/i);
  assert.match(html, /not financial advice/i);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test('static app exposes the core accessible workflow controls', () => {
  for (const label of ['startingBalance', 'safetyBuffer', 'addItemButton', 'previousMonth', 'nextMonth', 'exportButton', 'importFile', 'clearButton', 'privacyButton']) assert.match(html, new RegExp(`id="${label}"`));
  assert.match(html, /aria-live="polite"/);
  assert.match(js, /Mark paid/);
  assert.match(js, /Mark received/);
});

test('responsive stylesheet includes reduced motion and narrow layout support', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-contrast/);
  assert.match(css, /max-width:500px/);
});

test('v2 UI contracts preserve CSP, accessible forecast, safe dialog controls, and bounded chart classes', () => {
  assert.match(html, /id="forecastTableBody"/);
  assert.match(html, /id="itemRecurrence"/);
  assert.match(html, /id="statusRegion"[^>]+aria-live="polite"/);
  assert.match(html, /id="closeItem"[^>]+type="button"/);
  assert.match(html, /id="cancelItem"[^>]+type="button"/);
  assert.doesNotMatch(js, /style\.(height|width)|setAttribute\(['"]style|style=/);
  assert.match(js, /heightClass/);
  assert.match(css, /\.height-100/);
  assert.match(css, /@media print/);
  assert.match(fs.readFileSync(new URL('../.htaccess', import.meta.url), 'utf8'), /unset X-Powered-By/);
});

test('visual and responsive contracts preserve hidden content, accessible import, and containment', () => {
  assert.match(css, /\[hidden\]\{display:none!important\}/);
  assert.match(css, /\.file-button input\{[^}]*position:absolute/);
  assert.match(css, /\.content-grid\{[^}]*align-items:start/);
  assert.doesNotMatch(css, /body\{[^}]*overflow-x:hidden/);
  assert.match(css, /min-width:0/);
  assert.match(css, /@media\(max-width:500px\)[^}]*.*\.mini-button\{[^}]*min-height:44px/);
  assert.match(js, /sampleButton'\)\.disabled/);
  assert.match(js, /Day 1/);
  assert.match(js, /Month end/);
});
