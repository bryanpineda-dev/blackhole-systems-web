const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { launchBrowser, openPage, addScripts } = require('./helpers/browser.cjs');

let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });
const scripts = ['visibility-gate', 'star-field', 'comet-field', 'signal-field'].map(name => `assets/js/modules/effects/${name}.js`);
const fixture = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="assets/css/shared.css"><link rel="stylesheet" href="assets/css/sections/services.css">
<link rel="stylesheet" href="assets/css/sections/reviews-contact.css">
<style>body{margin:0;min-height:3500px}.frame{position:absolute;left:20px;width:300px;height:180px}#stars{top:30px}#comets{top:250px}#signals{top:480px}</style>
<section class="frame" id="stars"><div class="star-field" data-star-field data-star-count="3"></div></section>
<section class="frame" id="comets"><div class="comet-field" data-comet-field></div></section>
<section class="frame" id="signals"><div class="signal-field" data-signal-field>${'abcdefgh'.split('').map(letter => `<span class="signal-particle particle-${letter}"></span>`).join('')}</div></section>`;

async function waitState(page, selector, state) {
    await page.waitForFunction(({ selector, state }) => [...document.querySelectorAll(selector)].length > 0 &&
        [...document.querySelectorAll(selector)].every(node => getComputedStyle(node).animationPlayState === state), { selector, state });
}

async function mountFixture(options = {}) {
    const session = await openPage(browser, { reducedMotion: 'no-preference', overrides: { 'index.html': fixture } });
    session.page.setDefaultTimeout(10000);
    if (options.noObserver) await session.page.evaluate(() => { delete window.IntersectionObserver; });
    await addScripts(session.page, scripts);
    await session.page.evaluate(() => {
        const effects = window.BlackholeSystems.Effects;
        window.instances = [effects.createStarField(document.querySelector('[data-star-field]')),
            effects.createCometField(document.querySelector('[data-comet-field]')),
            effects.createSignalField(document.querySelector('[data-signal-field]'))];
    });
    return session;
}

test('real CSS stars and testimonial particles pause offscreen without resetting their clocks', async () => {
    const { page, context, errors } = await mountFixture();
    try {
        await waitState(page, '.star, .signal-particle', 'running');
        await page.evaluate(async () => { await Promise.all(document.getAnimations().map(animation => animation.ready)); });
        const first = await page.locator('.star').first().evaluate(node => node.getAnimations()[0].currentTime);
        await page.waitForTimeout(100);
        assert.ok(await page.locator('.star').first().evaluate(node => node.getAnimations()[0].currentTime) > first);
        await page.evaluate(() => scrollTo(0, 1800));
        await waitState(page, '.star, .signal-particle', 'paused');
        await page.evaluate(async () => { await Promise.all(document.getAnimations().map(animation => animation.ready)); });
        const paused = await page.locator('.star').first().evaluate(node => node.getAnimations()[0].currentTime);
        await page.waitForTimeout(120);
        assert.equal(await page.locator('.star').first().evaluate(node => node.getAnimations()[0].currentTime), paused);
        await page.evaluate(() => scrollTo(0, 0)); await waitState(page, '.star, .signal-particle', 'running');
        await page.waitForTimeout(100);
        assert.ok(await page.locator('.star').first().evaluate(node => node.getAnimations()[0].currentTime) > paused);
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

test('hidden-page and live motion policy work with a missing IntersectionObserver', async () => {
    const { page, context, errors } = await mountFixture({ noObserver: true });
    try {
        await waitState(page, '.star, .signal-particle', 'running');
        await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        await waitState(page, '.star, .signal-particle', 'paused');
        await page.evaluate(() => {
            delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
        });
        await waitState(page, '.star, .signal-particle', 'running');
        await page.emulateMedia({ reducedMotion: 'reduce' }); await waitState(page, '.star', 'paused');
        assert.equal(await page.locator('.signal-particle').first().evaluate(node => getComputedStyle(node).animationName), 'none');
        await page.emulateMedia({ reducedMotion: 'no-preference' }); await waitState(page, '.star, .signal-particle', 'running');
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

test('effect instances can destroy and remount without duplicate particles or late comet work', async () => {
    const { page, context, errors } = await mountFixture();
    try {
        await waitState(page, '.star', 'running');
        const identities = await page.evaluate(() => {
            const BH = window.BlackholeSystems;
            const same = BH.Effects.createStarField(document.querySelector('[data-star-field]')) === window.instances[0];
            BH.initStarField(); BH.initCometField(); BH.initSignalField();
            return { same, stars: document.querySelectorAll('.star').length, signals: document.querySelectorAll('.signal-particle').length };
        });
        assert.deepEqual(identities, { same: true, stars: 3, signals: 8 });
        await page.evaluate(() => window.instances.forEach(instance => { instance.destroy(); instance.destroy(); }));
        assert.equal(await page.locator('.star, .comet').count(), 0);
        assert.equal(await page.locator('.signal-particle').count(), 8);
        await page.emulateMedia({ reducedMotion: 'reduce' }); await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.evaluate(() => scrollTo(0, 1600)); await page.waitForTimeout(150);
        assert.equal(await page.locator('.star, .comet').count(), 0);
        await page.evaluate(() => {
            const BH = window.BlackholeSystems;
            BH.initStarField(); BH.initCometField(); BH.initSignalField(); scrollTo(0, 0);
        });
        await waitState(page, '.star, .signal-particle', 'running');
        assert.equal(await page.locator('.star').count(), 3); assert.equal(await page.locator('.signal-particle').count(), 8);
        assert.deepEqual(errors, []);
    } finally { await context.close(); }
});

for (const kind of ['landing', 'qr']) for (const width of [1440, 390]) {
    test(`${kind} uses effective star lifecycle and its original visual parameters at ${width}px`, async () => {
        const { page, context, errors } = await openPage(browser, { url: kind === 'qr' ? '/tools/blackhole-qr/' : '/',
            viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390, reducedMotion: 'no-preference' });
        page.setDefaultTimeout(15000);
        try {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const counts = await page.locator('[data-star-field]').evaluateAll(fields => fields.map(field => field.querySelectorAll('.star').length));
            assert.deepEqual(counts, kind === 'landing' ? [34, 70, 46] : [72]);
            const fields = kind === 'landing' ? ['#star-field', '#footer-star-field'] : ['.qr-hero-stars'];
            for (const field of fields) {
                await page.locator(field).evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
                await waitState(page, `${field} .star`, 'running');
                const parameters = await page.locator(`${field} .star`).first().evaluate(node => {
                    const style = getComputedStyle(node);
                    return { name: style.animationName, duration: parseFloat(style.animationDuration), delay: parseFloat(style.animationDelay),
                        easing: style.animationTimingFunction, iterations: style.animationIterationCount, inline: node.style.animation };
                });
                assert.equal(parameters.name, 'absorbStar'); assert.ok(parameters.duration >= 2.5 && parameters.duration <= 5.5);
                assert.ok(parameters.delay >= 0 && parameters.delay <= 5);
                assert.equal(parameters.easing, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
                assert.equal(parameters.iterations, 'infinite'); assert.equal(parameters.inline, '');
            }
            if (kind === 'landing') {
                await page.locator('#reviews').evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
                await waitState(page, '.signal-particle', 'running');
                assert.equal(await page.locator('.signal-particle').count(), 8);
                if (width === 390) {
                    await page.locator('.mobile-nav-toggle').click(); await waitState(page, '.mobile-command-stars .star', 'running');
                    await page.locator('.mobile-nav-toggle').click(); await waitState(page, '.mobile-command-stars .star', 'paused');
                } else {
                    await waitState(page, '.mobile-command-stars .star', 'paused');
                }
                await page.locator('#star-field').evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
                await page.locator('.hero-section').evaluate(node => node.classList.add('is-webgpu-ready'));
                await waitState(page, '#star-field .star', 'paused');
                await page.locator('.hero-section').evaluate(node => node.classList.remove('is-webgpu-ready'));
                await waitState(page, '#star-field .star', 'running');
            }
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.waitForFunction(() => [...document.querySelectorAll('[data-star-field] .star')].every(node => {
                const style = getComputedStyle(node);
                return style.animationName === 'none' || style.animationPlayState === 'paused';
            }));
            if (kind === 'qr') {
                const reduced = await page.locator('.qr-hero-stars .star').first().evaluate(node => ({
                    name: getComputedStyle(node).animationName, opacity: getComputedStyle(node).opacity
                }));
                assert.deepEqual(reduced, { name: 'none', opacity: '0.35' });
            }
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}
