const assert = require('node:assert/strict');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { read, launchBrowser, openPage, addScripts } = require('./helpers/browser.cjs');
// Reuse Playwright's pinned PNG decoder; no extra test package is required.
const { PNG } = require(path.join(path.dirname(require.resolve('playwright-core')), 'lib/utilsBundle.js'));
let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

function difference(a, b) {
    const x = PNG.sync.read(a), y = PNG.sync.read(b);
    assert.equal(x.width, y.width); assert.equal(x.height, y.height);
    let max = 0, sum = 0;
    for (let i = 0; i < x.data.length; i += 4) for (let c = 0; c < 3; c++) {
        const delta = Math.abs(x.data[i + c] - y.data[i + c]);
        max = Math.max(max, delta); sum += delta;
    }
    return { max, mean: sum / (x.width * x.height * 3) };
}

for (const profile of [{ id: 'desktop', width: 1112, viewport: 1440, ratio: 1 }, { id: 'retina', width: 1112, viewport: 1440, ratio: 2 }, { id: 'mobile', width: 390, viewport: 390, ratio: 3 }, { id: 'fractional scaling', width: 387.5, viewport: 390, ratio: 1.25 }]) {
    test(`grid lines and adjacent pulses retain native-border appearance at ${profile.id}`, async () => {
        const fixture = `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="assets/css/style.css"><style>body{margin:0}.frame{position:absolute;inset:0 auto auto 0;width:${profile.width}px;height:400px;overflow:hidden;background:var(--bg-void)}#optimized{visibility:hidden}.frame .grid-cell{transition:none}</style><div id="original" class="frame"><div id="native-grid" class="tactical-grid-bg"></div></div><div id="optimized" class="frame"><div id="grid-pulse" class="tactical-grid-bg"></div></div>`;
        const wrapper = { newContext: options => browser.newContext({ ...options, deviceScaleFactor: profile.ratio }) };
        const { page, context, errors } = await openPage(wrapper, { viewport: { width: profile.viewport, height: 500 }, overrides: { 'index.html': fixture } });
        try {
            await page.evaluate(() => {
                const grid = document.getElementById('native-grid');
                const count = Math.ceil(grid.getBoundingClientRect().width / 40) * Math.ceil(grid.offsetHeight / 40);
                for (let i = 0; i < count; i++) { const cell = document.createElement('div'); cell.className = 'grid-cell'; grid.appendChild(cell); }
            });
            await addScripts(page, ['assets/js/modules/effects/grid-pulse.js']);
            await page.evaluate(() => BlackholeSystems.initGridPulse());
            assert.equal(await page.locator('#grid-pulse > .grid-cell').count(), 0);
            for (const active of [false, true]) {
                if (active) await page.evaluate(() => {
                    const native = document.getElementById('native-grid'), sparse = document.getElementById('grid-pulse');
                    const columns = Math.max(1, Math.floor(native.getBoundingClientRect().width / 40));
                    for (const index of new Set([0, columns + 1, columns * 2])) {
                        native.children[index].classList.add('active');
                        const cell = document.createElement('div'); cell.className = 'grid-cell active';
                        cell.style.left = `${(index % columns) * 40}px`; cell.style.top = `${Math.floor(index / columns) * 40}px`; sparse.appendChild(cell);
                    }
                });
                await page.evaluate(() => { document.getElementById('original').style.visibility = 'visible'; document.getElementById('optimized').style.visibility = 'hidden'; });
                const a = await page.locator('#original').screenshot();
                await page.evaluate(() => { document.getElementById('original').style.visibility = 'hidden'; document.getElementById('optimized').style.visibility = 'visible'; });
                const b = await page.locator('#optimized').screenshot();
                const delta = difference(a, b);
                if (Number.isInteger(profile.ratio)) assert.equal(delta.max, 0, JSON.stringify(delta));
                else { assert.ok(delta.max <= 3, JSON.stringify(delta)); assert.ok(delta.mean < 0.06, JSON.stringify(delta)); }
            }
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}

test('native pulse transitions retain their timing and reduced motion drains the pool', async () => {
    const fixture = '<!doctype html><link rel="stylesheet" href="assets/css/style.css"><style>.frame{position:relative;width:400px;height:400px;overflow:hidden}</style><div class="frame"><div id="grid-pulse" class="tactical-grid-bg"></div></div>';
    const { page, context, errors } = await openPage(browser, { reducedMotion: 'no-preference', overrides: { 'index.html': fixture } });
    try {
        await page.evaluate(() => { Math.random = () => 0; window.BlackholeSystems = { Effects: { createVisibilityGate: (_, callback) => { window.gate = callback; callback(false); } } }; });
        await addScripts(page, ['assets/js/modules/effects/grid-pulse.js']);
        const ingress = await page.evaluate(() => {
            BlackholeSystems.initGridPulse(); gate(true); gate(false);
            window.firstCell = document.querySelector('.grid-cell');
            return firstCell.getAnimations().map(animation => ({ property: animation.transitionProperty, duration: animation.effect.getTiming().duration }));
        });
        assert.ok(ingress.some(animation => animation.property === 'background-color' && animation.duration === 100));
        await page.waitForFunction(() => !firstCell.classList.contains('active'));
        const egress = await page.evaluate(() => firstCell.getAnimations().map(animation => ({ property: animation.transitionProperty, duration: animation.effect.getTiming().duration })));
        for (const property of ['background-color', 'box-shadow']) assert.ok(egress.some(animation => animation.property === property && animation.duration === 1500));
        await page.waitForFunction(() => firstCell.getAnimations().length === 0);
        assert.equal(await page.evaluate(() => { gate(true); return document.querySelector('.grid-cell') === firstCell; }), true);
        assert.equal(await page.locator('.grid-cell').count(), 1);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => document.querySelectorAll('.grid-cell').length === 0);
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

test('real archive filtering and responsive reflow keep the grid bounded without overflow', async () => {
    const { page, context, errors } = await openPage(browser);
    try {
        await page.waitForFunction(() => !document.body.classList.contains('is-loading'));
        for (const width of [1440, 390, 768, 320]) {
            await page.setViewportSize({ width, height: 900 });
            for (const filter of ['booking', 'all']) {
                await page.locator(`.cmd-btn[data-filter="${filter}"]`).click();
                await page.waitForFunction(() => !document.querySelector('[data-project-grid]').classList.contains('is-transitioning'));
                await page.waitForFunction(() => {
                    const grid = document.getElementById('grid-pulse');
                    return parseFloat(grid.style.getPropertyValue('--grid-lines-width')) === Math.max(1, Math.floor(grid.getBoundingClientRect().width / 40)) * 40;
                });
                const state = await page.evaluate(() => {
                    const grid = document.getElementById('grid-pulse');
                    return { nodes: grid.children.length, height: grid.getBoundingClientRect().height,
                        paintHeight: parseFloat(getComputedStyle(grid, '::before').height), width: document.documentElement.scrollWidth, viewport: innerWidth,
                        projects: [...document.querySelectorAll('.dossier-card')].filter(card => !card.hidden).length };
                });
                assert.equal(state.nodes, 0); assert.ok(Math.abs(state.paintHeight - state.height) < 1);
                assert.ok(state.width <= state.viewport); assert.equal(state.projects, filter === 'all' ? 17 : 3);
            }
        }
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

test('missing mask composition or ResizeObserver preserves native static borders', async () => {
    for (const missing of ['mask', 'resize']) {
        const fixture = '<!doctype html><link rel="stylesheet" href="assets/css/style.css"><div style="position:relative;width:1112px;height:400px"><div id="grid-pulse" class="tactical-grid-bg"></div></div>';
        const { page, context } = await openPage(browser, { overrides: { 'index.html': fixture } });
        try {
            await page.evaluate(missing => { if (missing === 'mask') CSS.supports = () => false; else window.ResizeObserver = undefined; }, missing);
            await addScripts(page, ['assets/js/modules/effects/grid-pulse.js']);
            await page.evaluate(() => BlackholeSystems.initGridPulse());
            assert.equal(await page.locator('#grid-pulse.is-sparse-grid').count(), 0);
            assert.equal(await page.locator('#grid-pulse > .grid-cell').count(), 280);
            assert.equal(await page.locator('.grid-cell').first().evaluate(cell => getComputedStyle(cell).borderLeftColor), 'rgba(255, 255, 255, 0.05)');
        } finally { await context.close(); }
    }
});

test('live device-ratio changes refresh the native border metric without adding static cells', async () => {
    const fixture = '<!doctype html><link rel="stylesheet" href="assets/css/style.css"><div style="position:relative;width:400px;height:400px"><div id="grid-pulse" class="tactical-grid-bg"></div></div>';
    const { page, context, errors } = await openPage(browser, { overrides: { 'index.html': fixture } });
    try {
        await addScripts(page, ['assets/js/modules/effects/grid-pulse.js']);
        await page.evaluate(() => BlackholeSystems.initGridPulse());
        await page.addStyleTag({ content: '.grid-cell { border-width: 2px; }' });
        await page.evaluate(() => { Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 2 }); dispatchEvent(new Event('resize')); });
        await page.waitForFunction(() => document.getElementById('grid-pulse').style.getPropertyValue('--grid-line-width') === '2px');
        assert.equal(await page.locator('.grid-cell').count(), 0);
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});
