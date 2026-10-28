const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { root, origin, read, launchBrowser } = require('./helpers/browser.cjs');

const scenePath = 'assets/js/modules/hero-blackhole.js';
const entryPath = 'assets/js/modules/hero-blackhole-boot.js';
const sceneStub = `
    window.sceneEvaluations = (window.sceneEvaluations || 0) + 1;
    window.sceneSawAppBoot = Boolean(window.BlackholeSystems.appBootState?.initialized.size);
`;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

async function withPage(options, run) {
    const context = await browser.newContext({ viewport: options.viewport || { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const requests = [], errors = [], warnings = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'warning') warnings.push(message.text()); });
    await context.addInitScript(supported => {
        if (supported) Object.defineProperty(navigator, 'gpu', { value: {}, configurable: true });
        else Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true });
        // The production check uses property presence, not truthiness.
        if (!supported) {
            delete navigator.gpu;
            delete Object.getPrototypeOf(navigator).gpu;
        }
    }, Boolean(options.supported));
    await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin || route.request().method() !== 'GET') return route.abort();
        let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        if (!relative || relative.endsWith('/')) relative += 'index.html';
        requests.push(relative);
        const file = path.resolve(root, relative);
        if (!file.startsWith(root + path.sep)) return route.abort();
        if (relative === scenePath && options.sceneGate) await options.sceneGate;
        if (relative === options.failPath) return route.fulfill({ status: 404, body: 'Injected missing module' });
        try {
            let body = await fs.readFile(file);
            if (relative === 'index.html' && options.removeStage) body = body.toString().replace(' data-hero-blackhole ', ' data-hero-placeholder ');
            if (relative === 'index.html' && options.removeParent) body = body.toString().replace('class="hero-section"', 'class="hero-placeholder"');
            if (relative === scenePath && options.supported) body = options.sceneSource || sceneStub;
            return route.fulfill({ contentType: types[path.extname(file)] || 'application/octet-stream', body });
        } catch { return route.fulfill({ status: 404, body: 'Not found' }); }
    });
    try {
        await page.goto(origin + (options.url || '/'), { waitUntil: 'load' });
        await run({ page, requests, errors, warnings });
    } finally { await context.close(); }
}

for (const width of [1440, 390]) {
    test(`unsupported WebGPU keeps the fallback and skips the entire engine at ${width}px`, async () => {
        await withPage({ viewport: { width, height: 900 } }, async ({ page, requests, errors }) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(requests.includes(entryPath), true);
            assert.equal(requests.includes(scenePath), false);
            assert.equal(requests.some(file => file.startsWith('assets/vendor/three/')), false);
            assert.equal(await page.locator('.hero-section.is-webgpu-ready').count(), 0);
            assert.equal(await page.locator('.hero-fallback-image').evaluate(image => image.complete && image.naturalWidth > 0 && getComputedStyle(image).opacity === '1'), true);
            assert.equal(await page.locator('#formSubmitBtn').isEnabled(), true);
            assert.deepEqual(errors, []);
        });
    });
}

for (const missing of ['removeStage', 'removeParent']) {
    test(`${missing} prevents scene import even when the WebGPU property exists`, async () => {
        await withPage({ supported: true, [missing]: true }, async ({ page, requests, errors }) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(requests.includes(scenePath), false);
            assert.equal(requests.some(file => file.startsWith('assets/vendor/three/')), false);
            assert.deepEqual(errors, []);
        });
    });
}

test('supported boot preserves module ordering, imports once and does not wait for a GPU frame', async () => {
    let release;
    const sceneGate = new Promise(resolve => { release = resolve; });
    await withPage({ supported: true, sceneGate }, async ({ page, requests, errors }) => {
        try {
            assert.equal(await page.evaluate(() => window.BlackholeSystems.appBootState.initialized.size), 0);
            assert.equal(await page.locator('#page-loader').count(), 1);
            release();
            await page.waitForFunction(() => window.BlackholeSystems.appBootState.initialized.has('initPageLoader'));
            assert.equal(await page.evaluate(() => window.sceneEvaluations), 1);
            assert.equal(await page.evaluate(() => window.sceneSawAppBoot), false);
            await page.addScriptTag({ url: '/assets/js/modules/hero-blackhole-boot.js?v=repeat' });
            await page.evaluate(() => window.BlackholeSystems.heroBlackholeReady);
            assert.equal(requests.filter(file => file === scenePath).length, 1);
            assert.equal(await page.locator('.hero-blackhole-canvas').count(), 0);
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(await page.locator('#formSubmitBtn').isEnabled(), true);
            assert.deepEqual(errors, []);
        } finally { release(); }
    });
});

for (const failure of ['missing', 'evaluation']) {
    test(`${failure} scene failure releases app startup and preserves the image fallback`, async () => {
        await withPage({ supported: true, failPath: failure === 'missing' ? scenePath : undefined,
            sceneSource: failure === 'evaluation' ? 'throw new Error("Injected scene evaluation failure");' : undefined }, async ({ page, errors, warnings }) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(await page.locator('#formSubmitBtn').isEnabled(), true);
            assert.equal(await page.locator('.hero-section.is-webgpu-ready').count(), 0);
            assert.equal(warnings.some(message => message.includes('hero module fallback active')), true);
            assert.deepEqual(errors, []);
        });
    });
}

test('a missing conditional entry cannot block independent app startup', async () => {
    await withPage({ supported: true, failPath: entryPath }, async ({ page, requests, errors }) => {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        assert.equal(await page.locator('#formSubmitBtn').isEnabled(), true);
        assert.equal(requests.includes(scenePath), false);
        assert.deepEqual(errors, []);
    });
});

test('QR continues to omit the hero entries and Three.js even with a WebGPU API', async () => {
    await withPage({ supported: true, url: '/tools/blackhole-qr/' }, async ({ page, requests, errors }) => {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        assert.equal(requests.includes(entryPath), false);
        assert.equal(requests.includes(scenePath), false);
        assert.equal(requests.some(file => file.startsWith('assets/vendor/three/')), false);
        assert.equal(await page.locator('[data-qr-form]').count(), 1);
        assert.deepEqual(errors, []);
    });
});

test('the conditional entry keeps the existing local import map and no rendering policy', async () => {
    const html = await read('index.html');
    const entry = await read(entryPath);
    const map = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
    for (const specifier of ['three', 'three/webgpu', 'three/tsl', 'three/addons/']) {
        assert.ok(map.imports[specifier].startsWith('./assets/vendor/three/'));
    }
    const entries = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1].split('?')[0]);
    assert.ok(entries.indexOf(entryPath) < entries.indexOf('assets/js/app.js'));
    assert.equal(/requestIdleCallback|IntersectionObserver|matchMedia|requestAdapter/.test(entry), false);
    assert.equal(html.includes('type="module" src="assets/js/modules/hero-blackhole.js"'), false);
});
