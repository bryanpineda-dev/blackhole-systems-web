const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { launchBrowser, openPage } = require('./helpers/browser.cjs');

let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

async function withPage(options, run) {
    const session = await openPage(browser, options);
    try {
        await session.page.locator('#page-loader').waitFor({ state: 'detached' });
        await run(session.page, session.errors);
    } finally { await session.context.close(); }
}

const settleViewport = page => page.evaluate(() => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
}));

test('hero and Workflow actions fit narrow touch viewports without enlarging the document', async () => {
    await withPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true }, async (page, errors) => {
        for (const width of [320, 336, 360, 390, 480]) {
            await page.setViewportSize({ width, height: 844 });
            await settleViewport(page);
            const geometry = await page.evaluate(() => ({
                viewport: innerWidth, document: document.documentElement.scrollWidth,
                groups: [...document.querySelectorAll('.hero-actions .container-btn, .workflow-actions')].map(group => ({
                    rect: group.getBoundingClientRect().toJSON(),
                    buttons: [...group.querySelectorAll('a')].map(link => {
                        const range = document.createRange();
                        range.selectNodeContents(link);
                        return { rect: link.getBoundingClientRect().toJSON(), text: range.getBoundingClientRect().toJSON() };
                    })
                }))
            }));
            assert.ok(geometry.document <= width, `document fits ${width}px`);
            assert.equal(geometry.viewport, width, 'touch layout viewport does not expand');
            for (const group of geometry.groups) {
                const [first, second] = group.buttons;
                assert.ok(Math.abs(first.rect.top - second.rect.top) < 1, 'actions stay side by side');
                for (const button of group.buttons) {
                    assert.ok(button.rect.left >= group.rect.left - 1 && button.rect.right <= group.rect.right + 1);
                    assert.ok(button.text.left >= button.rect.left - 1 && button.text.right <= button.rect.right + 1,
                        `complete button content at ${width}px`);
                }
            }
        }
        assert.deepEqual(errors, []);
    });
});

test('mobile navigation traps focus, preserves inert states and cleans up every close path', async () => {
    for (const viewport of [{ width: 320, height: 568 }, { width: 568, height: 320 }, { width: 1024, height: 768 }]) {
        await withPage({ viewport }, async (page, errors) => {
            const toggle = page.locator('.mobile-nav-toggle');
            const first = page.locator('.mobile-command-nav a').first();
            await page.locator('footer').evaluate(e => { e.inert = true; });
            await toggle.click();
            await page.waitForFunction(() => document.activeElement.matches('.mobile-command-nav a'));
            assert.equal(await page.locator('main').evaluate(e => e.inert), true);
            assert.equal(await page.locator('.logo').evaluate(e => e.inert), true);
            assert.equal(await page.locator('.floating-assistant').evaluate(e => getComputedStyle(e).visibility), 'hidden');
            await page.keyboard.press('Shift+Tab');
            assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
            await page.keyboard.press('Tab');
            assert.equal(await first.evaluate(e => e === document.activeElement), true);
            await page.locator('#firstName').evaluate(e => e.focus());
            assert.equal(await first.evaluate(e => e === document.activeElement), true);
            await page.keyboard.press('Escape');
            assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
            assert.equal(await page.locator('main').evaluate(e => e.inert), false);
            assert.equal(await page.locator('.mobile-command-menu').evaluate(e => e.inert), true);
            assert.equal(await page.locator('footer').evaluate(e => e.inert), true);
            await page.locator('footer').evaluate(e => { e.inert = false; });

            await toggle.click();
            await page.locator('.mobile-command-menu').click({ position: { x: 3, y: 120 } });
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
            assert.equal(await page.locator('body.nav-open').count(), 0);
            assert.equal(await toggle.evaluate(e => e === document.activeElement), true);

            await toggle.evaluate(e => { e.click(); e.click(); });
            await settleViewport(page);
            assert.equal(await page.locator('body.nav-open').count(), 0);
            assert.equal(await page.locator('main').evaluate(e => e.inert), false);

            await toggle.click();
            await first.click();
            assert.equal(await page.locator('body.nav-open').count(), 0);
            assert.equal(await page.locator('main').evaluate(e => e.inert), false);
            await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
            await toggle.click();
            await page.setViewportSize({ width: 1280, height: 900 });
            await page.waitForFunction(() => !document.body.classList.contains('nav-open'));
            assert.equal(await page.locator('main').evaluate(e => e.inert), false);
            assert.equal(await page.locator('.logo').evaluate(e => e.inert), false);
            assert.equal(await page.evaluate(() => document.activeElement.matches('.main-nav-list a')), true);
            assert.deepEqual(errors, []);
        });
    }
});

test('assistant controls and a readable message area remain inside portrait and short landscape panels', async () => {
    for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 568, height: 320 }, { width: 844, height: 390 }]) {
        await withPage({ viewport, isMobile: true, hasTouch: true }, async (page, errors) => {
            const toggle = page.locator('.assistant-bot-toggle');
            await toggle.click();
            const panel = page.locator('.floating-assistant-panel');
            await page.waitForFunction(() => getComputedStyle(document.querySelector('.floating-assistant-panel')).transform === 'matrix(1, 0, 0, 1, 0, 0)');
            const geometry = await panel.evaluate(e => ({
                panel: e.getBoundingClientRect().toJSON(),
                form: e.querySelector('.assistant-form').getBoundingClientRect().toJSON(),
                messages: e.querySelector('.assistant-messages').getBoundingClientRect().toJSON(),
                close: e.querySelector('.assistant-close').getBoundingClientRect().toJSON()
            }));
            assert.ok(geometry.panel.top >= 0 && geometry.panel.left >= 0);
            assert.ok(geometry.panel.right <= viewport.width && geometry.panel.bottom <= viewport.height);
            assert.ok(geometry.form.bottom <= geometry.panel.bottom && geometry.form.top >= geometry.panel.top);
            assert.ok(geometry.close.top >= geometry.panel.top && geometry.close.bottom <= geometry.panel.bottom);
            assert.ok(geometry.messages.height >= 80, 'conversation keeps usable height');
            if (viewport.height <= 520) {
                assert.equal(await toggle.evaluate(e => getComputedStyle(e).visibility), 'hidden');
                assert.equal(await page.evaluate(() => document.activeElement.matches('.assistant-close')), true);
            }
            await page.locator('.assistant-form input').fill('Keep this draft');
            assert.equal(await page.locator('.assistant-form input').inputValue(), 'Keep this draft');
            await page.locator('.assistant-close').click();
            assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
            assert.equal(await toggle.evaluate(e => getComputedStyle(e).visibility), 'visible');
            assert.deepEqual(errors, []);
        });
    }
});

test('assistant moves focus out of actions hidden by a short-height resize', async () => {
    await withPage({ viewport: { width: 390, height: 844 } }, async (page, errors) => {
        const toggle = page.locator('.assistant-bot-toggle');
        await toggle.click();
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForFunction(() => document.activeElement.matches('.assistant-close'));
        await page.keyboard.press('Escape');
        assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
        assert.equal(await toggle.evaluate(e => getComputedStyle(e).visibility), 'visible');
        await toggle.evaluate(e => { e.click(); e.click(); });
        await settleViewport(page);
        assert.equal(await page.locator('.floating-assistant.is-open').count(), 0);
        assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
        assert.deepEqual(errors, []);
    });
});

test('QR lateral reveals stay contained before and during entrances without clipping the full-bleed hero', async () => {
    for (const viewport of [{ width: 568, height: 320 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
        await withPage({ viewport, url: '/tools/blackhole-qr/', reducedMotion: 'no-preference',
            isMobile: viewport.width === 568, hasTouch: viewport.width === 568 }, async (page, errors) => {
            const assertWidth = async () => {
                const width = await page.evaluate(() => document.documentElement.scrollWidth);
                assert.ok(width <= viewport.width, `QR document stays within ${viewport.width}px, got ${width}`);
            };
            await assertWidth();
            const hero = await page.locator('.qr-hero').boundingBox();
            assert.equal(Math.round(hero.width), viewport.width);
            for (const selector of ['.qr-workspace', '.qr-preview-panel', '.qr-faq']) {
                await page.locator(selector).evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - innerHeight * 0.2, behavior: 'instant' }));
                await settleViewport(page);
                await assertWidth();
            }
            assert.deepEqual(errors, []);
        });
    }
});

test('footer columns fit their container and the final legend stays clear of floating actions', async () => {
    await withPage({}, async (page, errors) => {
        for (const width of [768, 1024, 1025, 1100, 1200, 1280, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            await settleViewport(page);
            await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
            const geometry = await page.evaluate(() => ({
                shell: { client: document.querySelector('.footer-shell').clientWidth, scroll: document.querySelector('.footer-shell').scrollWidth },
                labels: [...document.querySelector('.footer-bottom').children].map(e => e.getBoundingClientRect().toJSON()),
                actions: [...document.querySelectorAll('.assistant-floating-btn')].map(e => e.getBoundingClientRect().toJSON())
            }));
            assert.ok(geometry.shell.scroll <= geometry.shell.client + 1, `footer grid fits at ${width}px`);
            for (const label of geometry.labels) {
                for (const action of geometry.actions) {
                    assert.ok(label.right <= action.left || label.left >= action.right || label.bottom <= action.top || label.top >= action.bottom,
                        `footer legend does not overlap floating actions at ${width}px`);
                }
            }
        }
        assert.deepEqual(errors, []);
    });
});
