const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { launchBrowser, openPage } = require('./helpers/browser.cjs');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/images/generated/manifest.json'), 'utf8'));
const master = 'assets/images/projects/bh-001-sebana.jpg';
let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });
const fileOf = url => new URL(url).pathname.slice(1);

for (const profile of [
    { width: 1440, dpr: 1 }, { width: 390, dpr: 3 }, { width: 768, dpr: 2 },
    { width: 769, dpr: 2 }, { width: 1025, dpr: 1 }, { width: 1450, dpr: 2 }, { width: 1920, dpr: 1 }
]) {
    test(`preview candidates preserve frame and density at ${profile.width}px DPR ${profile.dpr}`, { timeout: 60000 }, async () => {
        const requests = [];
        const wrapper = { newContext: async options => {
            const context = await browser.newContext({ ...options, deviceScaleFactor: profile.dpr });
            context.on('request', request => requests.push(request.url()));
            return context;
        } };
        const { page, context, errors } = await openPage(wrapper, { viewport: { width: profile.width, height: 900 },
            isMobile: profile.width === 390, hasTouch: profile.width === 390 });
        try {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(requests.some(url => /\/(?:generated\/)?projects\//.test(new URL(url).pathname)), false, 'previews stay lazy at initial entry');
            const image = page.locator('[data-project-id="BH-001"] [data-project-preview]');
            await image.scrollIntoViewIfNeeded(); await image.evaluate(node => node.decode());
            const info = await image.evaluate(node => ({ current: node.currentSrc, src: node.getAttribute('src'), sizes: node.sizes,
                width: node.clientWidth, height: node.clientHeight, parentWidth: node.parentElement.clientWidth,
                parentHeight: node.parentElement.clientHeight, direct: node.parentElement.matches('.screen-placeholder'), dpr: devicePixelRatio }));
            const selected = fileOf(info.current);
            const asset = manifest.assets.find(asset => asset.src === selected) || manifest.sources.find(source => source.src === selected);
            assert.ok(asset, selected); assert.equal(info.src, master); assert.equal(info.direct, true);
            assert.ok(asset.width + 1 >= Math.min(info.width * info.dpr, 1440), `selected ${asset.width}px for ${info.width}px at DPR ${info.dpr}`);
            assert.ok(Math.abs(info.height - info.width * 810 / 1440) < 1);
            assert.ok(Math.abs(info.width - info.parentWidth) < 1 && Math.abs(info.height - info.parentHeight) < 1);
            if (profile.width === 1440 && profile.dpr === 1) {
                assert.equal(selected, manifest.projects[master][0].src);
                assert.equal(requests.some(url => fileOf(url) === master), false, 'card does not fetch the master before its modal');
            }
            if (profile.width === 390 && profile.dpr === 3) assert.equal(selected, master, 'high-density mobile retains the full source');
            await page.locator('[data-project-details="BH-001"]').click();
            const modalImage = page.locator('[data-project-modal] [data-project-preview]');
            await modalImage.evaluate(node => node.decode());
            const modal = await modalImage.evaluate(node => ({ current: node.currentSrc, srcset: node.srcset, width: node.naturalWidth, height: node.naturalHeight, loading: node.loading }));
            assert.equal(fileOf(modal.current), master); assert.equal(modal.srcset, '');
            assert.deepEqual([modal.width, modal.height, modal.loading], [1440, 810, 'eager']);
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}

for (const kind of ['landing', 'qr']) for (const dpr of [1, 3]) {
    test(`${kind} selects the same logo URL for preload and images at DPR ${dpr}`, { timeout: 45000 }, async () => {
        const requests = [];
        const wrapper = { newContext: async options => {
            const context = await browser.newContext({ ...options, deviceScaleFactor: dpr });
            context.on('request', request => requests.push(request.url())); return context;
        } };
        const { page, context, errors } = await openPage(wrapper, { url: kind === 'qr' ? '/tools/blackhole-qr/' : '/', viewport: { width: 1440, height: 900 } });
        try {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const logo = page.locator(kind === 'qr' ? '.qr-tool-logo img' : '.logo-full');
            await logo.evaluate(node => node.decode());
            const current = fileOf(await logo.evaluate(node => node.currentSrc));
            assert.equal(current, `assets/images/generated/logo-${dpr === 1 ? 625 : 1250}.png`);
            const logoRequests = requests.map(fileOf).filter(file => /(?:generated\/logo-\d+\.png|logo_bhws_w\.png)$/.test(file));
            assert.deepEqual(logoRequests, [current]);
            const ratio = await logo.evaluate(node => node.getBoundingClientRect().width / node.getBoundingClientRect().height);
            assert.ok(Math.abs(ratio - 2500 / 464) < 0.002);
            const icon = await page.locator('link[rel="shortcut icon"]').getAttribute('href');
            assert.equal(fileOf(new URL(icon, page.url()).href), 'assets/images/generated/favicon-32.png');
            if (kind === 'landing') {
                assert.equal(requests.filter(url => fileOf(url) === 'assets/images/generated/blackhole-fallback.png').length, 1);
                assert.equal(requests.some(url => fileOf(url) === 'assets/images/blackhole-fallback.png'), false);
            } else {
                assert.equal(requests.some(url => /projects-media\.js/.test(url)), false);
            }
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}

test('a failed card candidate retries the original before falling back to its category', { timeout: 45000 }, async () => {
    const candidate = manifest.projects[master][0].src;
    const { page, context, errors } = await openPage(browser, { overrides: { [candidate]: '' } });
    try {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        const image = page.locator('[data-project-id="BH-001"] [data-project-preview]');
        await image.scrollIntoViewIfNeeded();
        await page.waitForFunction(master => {
            const image = document.querySelector('[data-project-id="BH-001"] [data-project-preview]');
            return image && !image.hasAttribute('srcset') && image.complete && image.naturalWidth > 0 && new URL(image.currentSrc).pathname.slice(1) === master;
        }, master);
        await image.evaluate(node => node.decode());
        const selected = fileOf(await image.evaluate(node => node.currentSrc));
        assert.equal(manifest.sources.find(source => source.src === selected).width, 1440);
        const geometry = await image.evaluate(node => ({ width: node.clientWidth, height: node.clientHeight, parentWidth: node.parentElement.clientWidth, parentHeight: node.parentElement.clientHeight }));
        assert.ok(Math.abs(geometry.width - geometry.parentWidth) < 1 && Math.abs(geometry.height - geometry.parentHeight) < 1);
        assert.ok(Math.abs(geometry.height - geometry.width * 810 / 1440) < 1);
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

test('missing optional preview metadata keeps original card and modal rendering', { timeout: 45000 }, async () => {
    const { page, context, errors } = await openPage(browser, { overrides: { 'assets/js/modules/projects-media.js': '' } });
    try {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        const image = page.locator('[data-project-id="BH-001"] [data-project-preview]');
        await image.scrollIntoViewIfNeeded(); await image.evaluate(node => node.decode());
        assert.equal(await image.getAttribute('srcset'), null);
        assert.equal(fileOf(await image.evaluate(node => node.currentSrc)), master);
        await page.locator('[data-project-details="BH-001"]').click();
        await page.locator('[data-project-modal] [data-project-preview]').evaluate(node => node.decode());
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});
