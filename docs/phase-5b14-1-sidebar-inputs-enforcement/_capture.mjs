import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;

async function measureShell(shell) {
  return shell.evaluate((el) => {
    const cs = getComputedStyle(el);
    const before = getComputedStyle(el, '::before');
    const r = el.getBoundingClientRect();
    return {
      width: +r.width.toFixed(3),
      height: +r.height.toFixed(3),
      borderTopWidth: cs.borderTopWidth,
      backgroundColor: cs.backgroundColor,
      boxShadow: cs.boxShadow,
      useMask: cs.getPropertyValue('--tdm-field-use-mask-border').trim(),
      stageRgb: cs.getPropertyValue('--tdm-stage-field-rgb').trim(),
      hairline: cs.getPropertyValue('--tdm-field-hairline').trim(),
      borderGradient: cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0, 160),
      beforeOpacity: before.opacity,
      beforeBg: before.backgroundImage.slice(0, 160),
      beforePaddingTop: before.paddingTop
    };
  });
}

async function findShell(input) {
  return input.evaluateHandle((el) => {
    let n = el.parentElement;
    while (n) {
      const hairline = getComputedStyle(n).getPropertyValue('--tdm-field-hairline').trim();
      if (hairline) return n;
      n = n.parentElement;
    }
    return el.parentElement;
  });
}

async function statesFor(page, input, label) {
  await input.waitFor({ state: 'visible', timeout: 10000 });
  const shellHandle = await findShell(input);
  const shell = shellHandle.asElement();
  if (!shell) throw new Error(`no shell for ${label}`);

  await page.mouse.move(0, 0);
  await input.evaluate((el) => el.blur());
  await page.waitForTimeout(200);
  const rest = await measureShell(shell);

  const box = await shell.boundingBox();
  if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(220);
  const hover = await measureShell(shell);

  await input.focus();
  await page.waitForTimeout(220);
  const focus = await measureShell(shell);

  await input.evaluate((el) => el.blur());
  await page.mouse.move(0, 0);

  return { label, rest, hover, focus };
}

async function openCreate(page, name) {
  const btn = page.getByRole('button', { name });
  if (!(await btn.count())) return null;
  const expanded = await btn.first().getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await btn.first().click();
    await page.waitForTimeout(400);
  }
  return btn.first().getAttribute('aria-controls');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await page.goto('http://localhost:3000/canvas', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const openBtn = page.getByRole('button', { name: /Abrir sidebar/i });
if (await openBtn.count()) {
  await openBtn.click();
  await page.waitForTimeout(400);
}

const measures = {};

const nameInput = page.getByLabel('Nome da teoria da mudança');
await nameInput.scrollIntoViewIfNeeded();
measures.generic = await statesFor(page, nameInput, 'generic-name');

const hero = page.locator('[class*="heroFormShell"]').first();
await page.mouse.move(0, 0);
await nameInput.evaluate((el) => el.blur());
await page.waitForTimeout(150);
await hero.screenshot({ path: path.join(out, 'generic-rest.png') });
await nameInput.focus();
await page.waitForTimeout(200);
await hero.screenshot({ path: path.join(out, 'generic-focus.png') });
await nameInput.blur();

const inputPanelId = await openCreate(page, 'Criar novo insumo');
const inputPanel = page.locator(`#${inputPanelId}`);
const inputTitle = inputPanel.getByPlaceholder('Nome do bloco').first();
await inputTitle.scrollIntoViewIfNeeded();
measures.input = await statesFor(page, inputTitle, 'input-stage');
await inputTitle.blur();
await page.mouse.move(0, 0);
await page.waitForTimeout(150);
await inputPanel.screenshot({ path: path.join(out, 'input-stage-rest.png') });
await inputTitle.focus();
await page.waitForTimeout(200);
await inputPanel.screenshot({ path: path.join(out, 'input-stage-focus.png') });
await inputTitle.blur();

const activityPanelId = await openCreate(page, 'Criar nova atividade');
const activityPanel = page.locator(`#${activityPanelId}`);
const activityTitle = activityPanel.getByPlaceholder('Nome do bloco').first();
await activityTitle.scrollIntoViewIfNeeded();
measures.activity = await statesFor(page, activityTitle, 'activity-stage');
await activityTitle.blur();
await page.mouse.move(0, 0);
await page.waitForTimeout(150);
await activityPanel.screenshot({ path: path.join(out, 'activity-stage-rest.png') });

const productPanelId = await openCreate(page, 'Criar novo produto');
const productPanel = page.locator(`#${productPanelId}`);
const productTitle = productPanel.getByPlaceholder('Nome do bloco').first();
await productTitle.scrollIntoViewIfNeeded();
measures.product = await statesFor(page, productTitle, 'product-stage');
await productTitle.blur();
await page.mouse.move(0, 0);
await page.waitForTimeout(150);
await productPanel.screenshot({ path: path.join(out, 'product-stage-rest.png') });

const resultPanelId = await openCreate(page, 'Criar novo resultado');
const resultPanel = page.locator(`#${resultPanelId}`);
const resultTitle = resultPanel.getByPlaceholder('Nome do bloco').first();
await resultTitle.scrollIntoViewIfNeeded();
measures.result = await statesFor(page, resultTitle, 'result-stage');
await resultTitle.blur();
await page.mouse.move(0, 0);
await page.waitForTimeout(150);
await resultPanel.screenshot({ path: path.join(out, 'result-stage-rest.png') });

// Invariance checks
const report = { measures, invariant: {} };
for (const [key, m] of Object.entries(measures)) {
  report.invariant[key] = {
    widthStable: m.rest.width === m.hover.width && m.hover.width === m.focus.width,
    heightStable: m.rest.height === m.hover.height && m.hover.height === m.focus.height,
    hairlineStable:
      m.rest.beforePaddingTop === m.hover.beforePaddingTop &&
      m.hover.beforePaddingTop === m.focus.beforePaddingTop,
    bgTransparent: [m.rest, m.hover, m.focus].every((s) =>
      s.backgroundColor === 'rgba(0, 0, 0, 0)' || s.backgroundColor === 'transparent'
    ),
    maskOn: m.rest.useMask === '1',
    borderWidthZeroInMask: [m.rest, m.hover, m.focus].every((s) => s.borderTopWidth === '0px')
  };
}

fs.writeFileSync(path.join(out, 'measures.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
