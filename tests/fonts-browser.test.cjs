const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { root, launchBrowser, openPage } = require('./helpers/browser.cjs');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/fonts/outfit/manifest.json')));
const latin = manifest.files.find(file => file.subset === 'latin');
const extended = manifest.files.find(file => file.subset === 'latin-ext');
const relative = file => `assets/fonts/outfit/${file.file}`;
let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

async function platformFonts(page, selector) {
    const cdp = await page.context().newCDPSession(page);
    try {
        await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
        const { root: document } = await cdp.send('DOM.getDocument');
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: document.nodeId, selector });
        return (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
    } finally { await cdp.detach(); }
}

for (const kind of ['landing', 'qr']) for (const width of [1440, 390]) {
    test(`${kind} renders real local Outfit without external font requests at ${width}px`, { timeout: 60000 }, async () => {
        const requests = [];
        const wrapper = { newContext: async options => {
            const context = await browser.newContext(options);
            context.on('request', request => requests.push(request.url())); return context;
        } };
        const { page, context, errors } = await openPage(wrapper, { url: kind === 'qr' ? '/tools/blackhole-qr/' : '/',
            viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 });
        try {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            await page.evaluate(() => document.fonts.ready.then(() => null));
            const fonts = await platformFonts(page, 'h1');
            assert.ok(fonts.length > 0);
            assert.ok(fonts.every(font => font.isCustomFont && font.familyName.startsWith('Outfit')));
            const faces = await page.evaluate(() => [...document.fonts].map(face => ({ family: face.family, weight: face.weight, style: face.style, display: face.display, status: face.status })));
            assert.equal(faces.length, 2);
            faces.forEach(face => assert.deepEqual([face.family, face.weight, face.style, face.display], ['Outfit', '100 900', 'normal', 'swap']));
            assert.equal(faces.filter(face => face.status === 'loaded').length, 1);
            assert.equal(requests.filter(url => new URL(url).pathname.endsWith(latin.file)).length, 1);
            assert.equal(requests.some(url => new URL(url).pathname.endsWith(extended.file)), false);
            assert.equal(requests.some(url => new URL(url).origin !== new URL(page.url()).origin), false);
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}

test('Spanish text uses Latin while extended glyphs load their own subset on demand', { timeout: 45000 }, async () => {
    const fixture = '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="assets/css/fonts.css"><style>body{font-family:Outfit,sans-serif}#sample{font-weight:620}</style><span id="sample">Cotizaci\u00f3n, dise\u00f1o, \u00d1and\u00fa y ping\u00fcino</span>';
    const requests = [];
    const wrapper = { newContext: async options => {
        const context = await browser.newContext(options);
        context.on('request', request => requests.push(request.url())); return context;
    } };
    const { page, context, errors } = await openPage(wrapper, { overrides: { 'index.html': fixture } });
    try {
        await page.evaluate(() => document.fonts.ready.then(() => null));
        assert.equal(requests.filter(url => url.endsWith('.woff2')).length, 1);
        const weights = await page.evaluate(async () => {
            const result = [];
            for (const weight of [100, 300, 400, 500, 520, 600, 620, 700, 900]) {
                await document.fonts.load(`${weight} 20px Outfit`, 'Cotizaci\u00f3n');
                result.push(document.fonts.check(`${weight} 20px Outfit`, 'Cotizaci\u00f3n'));
            }
            document.querySelector('#sample').textContent = '\u0141\u00f3d\u017a \u010cesko \u0130stanbul \u015eeker';
            await document.fonts.load('620 20px Outfit', document.querySelector('#sample').textContent);
            return result;
        });
        assert.ok(weights.every(Boolean));
        const fonts = await platformFonts(page, '#sample');
        assert.ok(fonts.length > 0 && fonts.every(font => font.isCustomFont && font.familyName.startsWith('Outfit')));
        assert.equal(requests.filter(url => new URL(url).pathname.endsWith(latin.file)).length, 1);
        assert.equal(requests.filter(url => new URL(url).pathname.endsWith(extended.file)).length, 1);
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

for (const kind of ['landing', 'qr']) {
    test(`${kind} keeps readable content and releases its loader when font files fail`, { timeout: 45000 }, async () => {
        const overrides = Object.fromEntries(manifest.files.map(file => [relative(file), '']));
        const { page, context, errors } = await openPage(browser, { url: kind === 'qr' ? '/tools/blackhole-qr/' : '/', overrides });
        try {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            await page.evaluate(() => document.fonts.ready.then(() => null));
            const fonts = await platformFonts(page, 'h1');
            assert.ok(fonts.length > 0 && fonts.every(font => !font.isCustomFont));
            const title = page.locator('h1');
            assert.equal(await title.isVisible(), true);
            assert.ok((await title.innerText()).length > 5);
            if (kind === 'qr') await page.waitForFunction(() => document.querySelector('[data-qr-preview]')?.querySelector('canvas,svg'));
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}
