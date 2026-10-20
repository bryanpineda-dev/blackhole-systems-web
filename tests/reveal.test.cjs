const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { read, launchBrowser, openPage, addScripts } = require('./helpers/browser.cjs');

let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

async function withPage(options, run) {
    const session = await openPage(browser, { reducedMotion: 'no-preference', ...options });
    try { await run(session.page, session.errors); }
    finally { await session.context.close(); }
}

async function fixture(content = '<article class="probe">Readable content</article>', loading = false) {
    return `<html><head><style>${await read('assets/css/variables.css')}
        ${await read('assets/css/animations.css')}${await read('assets/css/sections/services.css')}
        html { scroll-behavior: auto; } body { margin: 0; background: black; color: white; }
        .spacer { height: 110vh; } .tail { height: 180vh; }
        .probe { width: 60%; height: 240px; margin: auto; padding: 16px; box-sizing: border-box; }
        .tall { height: 150vh; } .capability-card { min-height: 240px; }
        </style></head><body ${loading ? 'class="is-loading"' : ''}>
        ${loading ? '<div id="page-loader"></div>' : '<div class="spacer"></div>'}
        ${content}<div class="tail"></div></body></html>`;
}

async function initialize(page, repeat = true) {
    await addScripts(page, ['assets/js/modules/reveal.js', 'assets/js/modules/reveal-repeat.js']);
    await page.evaluate((repeat) => {
        window.BlackholeSystems.registerScrollRevealGroups([{ selector: '.probe', preset: 'fade-up', repeat }]);
        window.BlackholeSystems.initScrollReveal();
    }, repeat);
}

async function center(page, selector) {
    await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * 0.3, behavior: 'instant' });
    }, selector);
}

async function visible(page, selector, expected = true) {
    await page.waitForFunction(({ selector, expected }) =>
        document.querySelector(selector).classList.contains('is-revealed') === expected,
    { selector, expected });
}

async function settled(page, selector, opacity = 1) {
    await page.waitForFunction(({ selector, opacity }) => {
        const element = document.querySelector(selector);
        return Math.abs(Number(getComputedStyle(element).opacity) - opacity) < 0.001 && !element.getAnimations().length;
    }, { selector, opacity });
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`reversible reveals enter, exit both edges, reverse mid-flight and resize at ${viewport.width}px`, async () => {
        await withPage({ viewport, fixture: await fixture() }, async (page, errors) => {
            await initialize(page);
            await visible(page, '.probe', false);
            await center(page, '.probe');
            await visible(page, '.probe');
            await settled(page, '.probe');
            assert.equal(await page.locator('.probe').evaluate((element) => getComputedStyle(element).filter), 'none');
            assert.equal(await page.locator('.probe').evaluate((element) => getComputedStyle(element).transform), 'none');
            for (const edge of ['above', 'below']) {
                await page.evaluate((edge) => scrollTo({
                    top: edge === 'above' ? document.documentElement.scrollHeight : 0, behavior: 'instant'
                }), edge);
                await visible(page, '.probe', false);
                assert.equal(await page.locator('.probe').getAttribute('data-reveal-edge'), edge);
                await settled(page, '.probe', 0);
                await center(page, '.probe');
                await visible(page, '.probe');
                await settled(page, '.probe');
            }
            for (let index = 0; index < 3; index++) {
                await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
                await visible(page, '.probe', false);
                await center(page, '.probe');
                await visible(page, '.probe');
            }
            await settled(page, '.probe');
            await page.setViewportSize({ width: viewport.width === 390 ? 844 : 1024, height: 700 });
            await center(page, '.probe');
            await settled(page, '.probe');
            assert.deepEqual(errors, []);
        });
    });

    test(`landing repeats without breaking filters, reviews, footer or planets at ${viewport.width}px`, async () => {
        await withPage({ viewport }, async (page, errors) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            await settled(page, '.hero-title');
            await center(page, '#about .about-planets-right');
            await visible(page, '#about .about-planets-right');
            assert.equal(await page.locator('.about-planets-right').getAttribute('data-reveal-cycle'), null);
            assert.match(await page.locator('.planet').evaluate((element) => getComputedStyle(element).animationName), /popInPlanet, rotatePlanet/);
            await center(page, '.capability-card');
            await settled(page, '.capability-card');
            await center(page, '.dossier-card');
            await settled(page, '.dossier-card');
            await page.locator('.cmd-btn:not(.active)').first().click();
            await page.waitForFunction(() => !document.querySelector('.dossier-grid').classList.contains('is-transitioning'));
            await page.locator('.dossier-card:not([hidden])').first().scrollIntoViewIfNeeded();
            await visible(page, '.dossier-card:not([hidden])');
            await page.locator('.cmd-btn[data-filter="all"]').click();
            await page.waitForFunction(() => !document.querySelector('.dossier-grid').classList.contains('is-transitioning'));
            assert.equal(await page.locator('.dossier-card:not([hidden])').count(), 17);
            await center(page, '.reviews-slider');
            await settled(page, '.reviews-slider');
            await center(page, '.review-card.is-active [data-review-next]');
            await page.locator('.review-card.is-active [data-review-next]').click();
            await visible(page, '.reviews-slider');
            assert.equal(await page.locator('.review-card-main[data-reveal-cycle]').count(), 0);
            assert.equal(await page.locator('[data-review-slider]').getAttribute('data-active-review'), '1');
            await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
            await settled(page, '.footer-bottom');
            assert.equal(await page.locator('.about-planets-right.is-revealed').count(), 1);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert.deepEqual(errors, []);
        });
    });
}

test('focused tall forms stay visible and retain input until focus leaves', async () => {
    await withPage({ fixture: await fixture('<form class="probe tall"><input aria-label="Name"></form>') }, async (page, errors) => {
        await initialize(page);
        await center(page, '.probe');
        await settled(page, '.probe');
        await page.locator('input').fill('Preserved input');
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('.probe').getBoundingClientRect().bottom < 0);
        await settled(page, '.probe');
        await page.locator('input').evaluate((element) => element.blur());
        await visible(page, '.probe', false);
        await center(page, '.probe');
        await settled(page, '.probe');
        assert.equal(await page.locator('input').inputValue(), 'Preserved input');
        assert.deepEqual(errors, []);
    });
});

test('mouse and touch tilt keep their own transform while reveals repeat', async () => {
    await withPage({ fixture: await fixture('<article class="probe capability-card js-card-tilt">Service</article>') }, async (page, errors) => {
        await page.evaluate(() => Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 1 }));
        await initialize(page);
        await addScripts(page, ['assets/js/modules/cards.js']);
        await page.evaluate(() => window.BlackholeSystems.initCardTilt());
        await center(page, '.probe');
        await settled(page, '.probe');
        await page.locator('.probe').hover({ position: { x: 40, y: 40 } });
        assert.match(await page.locator('.probe').getAttribute('style'), /perspective\(1000px\)/);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await visible(page, '.probe', false);
        await settled(page, '.probe', 0);
        await center(page, '.probe');
        await settled(page, '.probe');
        await page.locator('.probe').evaluate((element) => {
            const rect = element.getBoundingClientRect();
            element.dispatchEvent(new TouchEvent('touchstart', { touches: [new Touch({
                identifier: 0, target: element, clientX: rect.left + 40, clientY: rect.top + 40
            })] }));
        });
        assert.match(await page.locator('.probe').getAttribute('style'), /scale\(1\.015\)/);
        await page.locator('.probe').dispatchEvent('touchend', { touches: [] });
        assert.deepEqual(errors, []);
    });
});

test('hero reveals wait for loader completion and can enter again afterwards', async () => {
    await withPage({ fixture: await fixture('<section id="hero"><h1 class="probe">Hero</h1></section>', true) }, async (page, errors) => {
        await initialize(page);
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.probe.is-revealed').count(), 0);
        await page.evaluate(() => {
            document.body.classList.remove('is-loading');
            document.dispatchEvent(new CustomEvent('blackhole:loader-complete'));
        });
        await settled(page, '.probe');
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await visible(page, '.probe', false);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await settled(page, '.probe');
        assert.deepEqual(errors, []);
    });
});

test('default one-shot groups and QR preserve their existing reveal behavior', async () => {
    await withPage({ fixture: await fixture() }, async (page) => {
        await initialize(page, false);
        await center(page, '.probe');
        await visible(page, '.probe');
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        assert.equal(await page.locator('.probe.is-revealed').count(), 1);
        assert.equal(await page.locator('[data-reveal-cycle]').count(), 0);
    });
    await withPage({ url: '/tools/blackhole-qr/' }, async (page, errors) => {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        await center(page, '.qr-builder');
        await visible(page, '.qr-builder');
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        assert.equal(await page.locator('.qr-builder.is-revealed').count(), 1);
        assert.equal(await page.locator('[data-reveal-cycle]').count(), 0);
        assert.deepEqual(errors, []);
    });
});

test('reduced motion initially or during an animation leaves all content readable', async () => {
    for (const reducedMotion of ['reduce', 'no-preference']) {
        await withPage({ reducedMotion, fixture: await fixture() }, async (page, errors) => {
            await initialize(page);
            if (reducedMotion === 'no-preference') {
                await center(page, '.probe');
                await visible(page, '.probe');
                await page.emulateMedia({ reducedMotion: 'reduce' });
            }
            await settled(page, '.probe');
            assert.equal(await page.locator('.probe').evaluate((element) => getComputedStyle(element).translate), 'none');
            assert.deepEqual(errors, []);
        });
    }
});

test('missing viewport observation fails open instead of hiding page content', async () => {
    await withPage({ fixture: await fixture() }, async (page, errors) => {
        await page.evaluate(() => { delete window.IntersectionObserver; });
        await initialize(page);
        await settled(page, '.probe');
        assert.deepEqual(errors, []);
    });
});

test('row staggering recalculates after filtering and mobile reflow', async () => {
    const markup = `<div class="grid" style="display:grid;grid-template-columns:repeat(2,1fr)">
        ${'<article class="probe">Card</article>'.repeat(4)}</div>`;
    await withPage({ fixture: await fixture(markup) }, async (page, errors) => {
        await addScripts(page, ['assets/js/modules/reveal.js', 'assets/js/modules/reveal-repeat.js']);
        await page.evaluate(() => {
            window.BlackholeSystems.registerScrollRevealGroups([{ selector: '.probe', preset: 'fade-up', repeat: true, stagger: 70, staggerByRow: true }]);
            window.BlackholeSystems.initScrollReveal();
        });
        const delays = async () => {
            await center(page, '.grid');
            return page.waitForFunction(() => {
                const cards = [...document.querySelectorAll('.probe:not([hidden])')];
                const animations = cards.map(card => card.getAnimations()[0]);
                if (cards.some(card => !card.classList.contains('is-revealed')) || animations.some(animation => !animation)) return false;
                animations.forEach(animation => animation.pause());
                return animations.map(animation => animation.effect.getTiming().delay);
            }).then(handle => handle.jsonValue());
        };
        assert.deepEqual(await delays(), [0, 70, 0, 70]);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await visible(page, '.probe', false);
        await page.evaluate(() => { document.querySelector('.probe').hidden = true; });
        assert.deepEqual(await delays(), [0, 70, 0]);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await visible(page, '.probe:not([hidden])', false);
        await page.evaluate(() => { document.querySelector('.grid').style.gridTemplateColumns = '1fr'; });
        await page.setViewportSize({ width: 390, height: 1400 });
        assert.deepEqual(await delays(), [0, 0, 0]);
        assert.deepEqual(errors, []);
    });
});

test('unavailable Web Animations falls back to the one-shot lifecycle', async () => {
    await withPage({ fixture: await fixture() }, async (page, errors) => {
        await page.evaluate(() => { Element.prototype.animate = undefined; });
        await initialize(page);
        await center(page, '.probe');
        await visible(page, '.probe');
        assert.equal(await page.locator('[data-reveal-cycle]').count(), 0);
        assert.deepEqual(errors, []);
    });
});

test('missing motion tokens keep content readable without native animation errors', async () => {
    await withPage({ fixture: await fixture() }, async (page, errors) => {
        await page.locator('.probe').evaluate(element => {
            element.style.setProperty('--motion-duration-reveal-repeat', 'initial');
            element.style.setProperty('--motion-ease-out', 'initial');
        });
        await initialize(page);
        await center(page, '.probe');
        await settled(page, '.probe');
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await visible(page, '.probe', false);
        await center(page, '.probe');
        await settled(page, '.probe');
        assert.deepEqual(errors, []);
    });
});
