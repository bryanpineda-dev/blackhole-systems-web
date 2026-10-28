const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { launchBrowser, openPage, read } = require('./helpers/browser.cjs');

let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

const selector = '.qr-promise i';
async function withQr(options, callback) {
    const session = await openPage(browser, {
        url: '/tools/blackhole-qr/', reducedMotion: 'no-preference', ...options
    });
    try {
        session.page.setDefaultTimeout(15000);
        await session.page.locator('#page-loader').waitFor({ state: 'detached' });
        await callback(session.page);
        assert.deepEqual(session.errors, []);
    } finally { await session.context.close(); }
}

async function waitState(page, state, index = null) {
    await page.waitForFunction(({ selector, state, index }) => {
        const icons = [...document.querySelectorAll(selector)];
        const nodes = index === null ? icons : [icons[index]];
        return icons.length === 3 && nodes.every(node => getComputedStyle(node).animationPlayState === state);
    }, { selector, state, index });
}

async function rememberClocks(page) {
    await page.evaluate(async (selector) => {
        window.qrGlowAnimations = [...document.querySelectorAll(selector)].map(icon =>
            icon.getAnimations().find(animation => animation.animationName === 'qrOwnershipIconGlow'));
        await Promise.all(window.qrGlowAnimations.map(animation => animation.ready));
    }, selector);
}
const clocks = page => page.evaluate(() => window.qrGlowAnimations.map(animation => animation.currentTime));

for (const width of [1440, 390]) {
    test(`QR glows pause independently offscreen and resume their clocks at ${width}px`, async () => {
        await withQr({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 }, async page => {
            await waitState(page, 'paused');
            await page.locator(selector).first().evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
            await waitState(page, 'running', 0);
            await rememberClocks(page);
            const start = await clocks(page);
            await page.waitForTimeout(120);
            assert.ok((await clocks(page))[0] > start[0]);
            await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
            await waitState(page, 'paused');
            await page.evaluate(async () => { await Promise.all(window.qrGlowAnimations.map(animation => animation.ready)); });
            const paused = await clocks(page);
            await page.waitForTimeout(150);
            assert.deepEqual(await clocks(page), paused);
            await page.locator(selector).first().evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
            await waitState(page, 'running', 0);
            await page.waitForTimeout(100);
            assert.ok((await clocks(page))[0] > paused[0]);
            assert.equal(await page.evaluate((selector) => [...document.querySelectorAll(selector)].every((icon, index) =>
                icon.getAnimations().includes(window.qrGlowAnimations[index])), selector), true);
            assert.equal(await page.locator('[data-qr-preview] svg').count(), 1);
        });
    });
}

test('QR visible glow timing, keyframes and reduced-motion policy retain the authored effect', async () => {
    await withQr({}, async page => {
        await page.locator(selector).first().evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await waitState(page, 'running');
        const inspect = () => page.locator(selector).evaluateAll(icons => icons.map(icon => {
            const style = getComputedStyle(icon);
            const animation = icon.getAnimations().find(item => item.animationName === 'qrOwnershipIconGlow');
            return { name: style.animationName, duration: style.animationDuration, delay: style.animationDelay,
                easing: style.animationTimingFunction, iterations: style.animationIterationCount,
                keyframes: animation.effect.getKeyframes().map(({ offset, color, filter }) => ({ offset, color, filter })) };
        }));
        const normal = await inspect();
        for (const [index, icon] of normal.entries()) {
            assert.equal(icon.name, 'qrOwnershipIconGlow'); assert.equal(icon.duration, '2.8s');
            assert.equal(icon.easing, 'ease-in-out'); assert.equal(icon.iterations, 'infinite');
            assert.equal(icon.delay, ['0s', '0.35s', '0.7s'][index]);
            assert.deepEqual(icon.keyframes.map(frame => frame.offset), [0, 0.5, 1]);
            assert.equal(icon.keyframes[0].color, 'rgba(0, 98, 255, 0.78)');
            assert.equal(icon.keyframes[1].color, 'rgb(0, 98, 255)');
            assert.match(icon.keyframes[1].filter, /12px.*28px/);
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await waitState(page, 'running');
        assert.deepEqual(await inspect(), normal);
    });
});

test('QR glow viewport buffer preserves the halo near the screen edge', async () => {
    await withQr({ viewport: { width: 390, height: 600 }, isMobile: true, hasTouch: true }, async page => {
        const position = distance => page.locator(selector).first().evaluate((icon, distance) =>
            scrollTo({ top: scrollY + icon.getBoundingClientRect().top - innerHeight - distance, behavior: 'instant' }), distance);
        await position(100); await waitState(page, 'running', 0);
        await position(200); await waitState(page, 'paused', 0);
        await page.locator(selector).last().evaluate(icon => icon.scrollIntoView({ block: 'start', behavior: 'instant' }));
        assert.ok(await page.locator(selector).first().evaluate(icon => icon.getBoundingClientRect().bottom < -160));
        await waitState(page, 'running', 2);
        await waitState(page, 'paused', 0);
    });
});

test('QR glow hidden-page handling works without IntersectionObserver', async () => {
    await withQr({ overrides: { 'assets/js/modules/effects/visibility-gate.js':
        "delete window.IntersectionObserver;\n" + await read('assets/js/modules/effects/visibility-gate.js') } }, async page => {
        await waitState(page, 'running'); await rememberClocks(page);
        await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        await waitState(page, 'paused');
        await page.evaluate(async () => { await Promise.all(window.qrGlowAnimations.map(animation => animation.ready)); });
        const paused = await clocks(page); await page.waitForTimeout(120);
        assert.deepEqual(await clocks(page), paused);
        await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
        await waitState(page, 'running'); await page.waitForTimeout(100);
        assert.ok((await clocks(page)).every((time, index) => time > paused[index]));
    });
});

test('missing shared gate retains CSS and does not break QR generation', async () => {
    await withQr({ overrides: { 'assets/js/modules/effects/visibility-gate.js': '' } }, async page => {
        await waitState(page, 'running');
        assert.equal(await page.locator(`${selector}.is-qr-glow-paused`).count(), 0);
        assert.equal(await page.locator('[data-qr-preview] svg').count(), 1);
    });
});

test('unavailable QR engine still initializes ownership glow lifecycle', async () => {
    await withQr({ overrides: { 'assets/vendor/qr-code-styling.min.js': '' } }, async page => {
        await waitState(page, 'paused');
        assert.match(await page.locator('[data-qr-status]').textContent(), /QR engine unavailable/);
        await page.locator(selector).first().evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await waitState(page, 'running');
    });
});
