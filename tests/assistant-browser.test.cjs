const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { launchBrowser, openPage, read } = require('./helpers/browser.cjs');
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
async function send(page, value) {
    await page.locator('[data-assistant-input]').fill(value);
    await page.locator('[data-assistant-input]').press('Enter');
    await idle(page);
}
const idle = page => page.waitForFunction(() => document.querySelector('[data-assistant-form]').getAttribute('aria-busy') !== 'true');
const wa = page => page.locator('.assistant-whatsapp').evaluate(e => new URL(e.href).searchParams.get('text'));

test('assistant keyboard entry, bilingual follow-ups and handoffs keep the project context on desktop and mobile', async () => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 568, height: 320 }]) {
        await withPage({ viewport, hasTouch: viewport.width < 600, isMobile: viewport.width < 600 }, async (page, errors) => {
            await page.locator('[data-assistant-toggle]').click();
            await page.waitForFunction(() => document.activeElement.matches('[data-assistant-close]'));
            await page.keyboard.press('Tab');
            assert.equal(await page.locator('[data-assistant-messages]').evaluate(e => e === document.activeElement), true);
            await send(page, 'Quiero una tienda con inventario y cuentas de clientes.');
            await send(page, 'Y cuanto cuesta?');
            assert.match(await page.locator('.assistant-message.bot').last().innerText(), /Cotizaci\u00f3n: Tienda/);
            await page.locator('[data-assistant-question="contact"]').click();
            await idle(page);
            assert.match(await wa(page), /tienda con inventario y cuentas/);
            assert.match(await wa(page), /Y cuanto cuesta/);
            assert.equal(await page.locator('[data-assistant-panel]').getAttribute('lang'), 'es');
            assert.equal(await page.locator('[data-assistant-toggle]').getAttribute('aria-controls'), 'blackhole-assistant-panel');
            assert.equal(await page.locator('[data-assistant-messages]').getAttribute('role'), 'log');
            await page.locator('#message').fill('Do not overwrite this project form draft.');
            const formLink = page.locator('.assistant-message.bot').last().locator('a[href="#contact"]');
            await formLink.click();
            assert.equal(await page.locator('.floating-assistant.is-open').count(), 0);
            assert.equal(await page.locator('#message').inputValue(), 'Do not overwrite this project form draft.');
            assert.equal(await page.locator('#contact').evaluate(e => e === document.activeElement), true);
            assert.deepEqual(errors, []);
        });
    }
});

test('assistant contains long tokens, preserves over-limit drafts and keeps its existing panel dimensions', async () => {
    for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 568, height: 320 }, { width: 1440, height: 900 }]) {
        await withPage({ viewport }, async (page, errors) => {
            await page.locator('[data-assistant-toggle]').click();
            await send(page, 'I need a website ' + 'https://example.com/' + 'a'.repeat(1500));
            const geometry = await page.locator('[data-assistant-messages]').evaluate(e => ({
                client: e.clientWidth, scroll: e.scrollWidth,
                bubbles: [...e.querySelectorAll('.assistant-bubble')].map(b => ({ client: b.clientWidth, scroll: b.scrollWidth })),
                panel: e.parentElement.getBoundingClientRect().toJSON()
            }));
            assert.ok(geometry.scroll <= geometry.client + 1);
            for (const bubble of geometry.bubbles) assert.ok(bubble.scroll <= bubble.client + 1);
            assert.ok(geometry.panel.left >= 0 && geometry.panel.right <= viewport.width);
            const draft = 'z'.repeat(2001);
            await send(page, draft);
            assert.equal(await page.locator('[data-assistant-input]').inputValue(), draft);
            assert.match(await page.locator('[role="alert"]').last().innerText(), /2000/);
            assert.equal(await page.locator('.assistant-send').isEnabled(), true);
            assert.deepEqual(errors, []);
        });
    }
});

test('assistant accepts one pending turn and retains the next draft without duplicate typing or replies', async () => {
    await withPage({}, async (page, errors) => {
        await page.locator('[data-assistant-toggle]').click();
        const pending = await page.evaluate(() => {
            const form = document.querySelector('[data-assistant-form]');
            const input = document.querySelector('[data-assistant-input]');
            for (const value of ['I need a store', 'How much?', 'Keep this next draft']) {
                input.value = value;
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
            return {
                typing: document.querySelectorAll('.assistant-typing').length,
                users: document.querySelectorAll('.assistant-message.user').length,
                whatsapp: new URL(document.querySelector('.assistant-whatsapp').href).searchParams.get('text')
            };
        });
        assert.equal(pending.typing, 1);
        assert.equal(pending.users, 1);
        assert.match(pending.whatsapp, /I need a store/);
        await idle(page);
        assert.equal(await page.locator('.assistant-message.bot').count(), 2);
        assert.equal(await page.locator('[data-assistant-input]').inputValue(), 'Keep this next draft');
        await send(page, 'How much?');
        assert.match(await wa(page), /I need a store/);
        await page.locator('[data-assistant-question="restart"]').click();
        await idle(page);
        assert.equal(await page.locator('.assistant-message.user').count(), 1);
        assert.equal((await wa(page)).includes('I need a store'), false);
        assert.deepEqual(errors, []);
    });
});

test('assistant catches response errors, preserves drafts and allows a manual retry', async () => {
    const file = 'assets/js/modules/assistant/assistant-handoff.js';
    const injected = (await read(file)) + `
        const create = window.BlackholeSystems.Assistant.createHandoff;
        window.BlackholeSystems.Assistant.createHandoff = function(options) {
            const api = create(options); let fail = true;
            return { ...api, buildResponse(...args) {
                if (fail) { fail = false; throw new Error('Injected failure'); }
                return api.buildResponse(...args);
            } };
        };`;
    await withPage({ overrides: { [file]: injected } }, async (page, errors) => {
        await page.locator('[data-assistant-toggle]').click();
        await send(page, 'I need a booking system');
        assert.equal(await page.locator('[data-assistant-input]').inputValue(), 'I need a booking system');
        assert.equal(await page.locator('.assistant-message.user').count(), 0);
        assert.equal(await page.locator('[role="alert"]').count(), 1);
        assert.equal(await page.locator('.assistant-send').isEnabled(), true);
        await send(page, 'I need a booking system');
        assert.equal(await page.locator('[data-assistant-input]').inputValue(), '');
        assert.match(await wa(page), /booking system/);
        assert.deepEqual(errors, []);
    });
});

test('assistant hides unused quick actions and removes their stale routes during clarification', async () => {
    await withPage({}, async page => {
        await page.locator('[data-assistant-toggle]').click();
        await send(page, 'I need a website');
        await send(page, 'I want a store and dashboard');
        assert.equal(await page.locator('.assistant-chip:visible').count(), 4);
        assert.equal(await page.locator('[data-assistant-question="restart"]').count(), 1);
        for (const hidden of await page.locator('.assistant-chip[hidden]').all()) {
            assert.equal(await hidden.evaluate(e => getComputedStyle(e).display), 'none');
            assert.equal(await hidden.getAttribute('data-assistant-question'), null);
        }
    });
});

test('missing assistant modules expose a working contact fallback instead of a dead control', async () => {
    for (const module of ['assistant-data', 'assistant-router', 'assistant-session', 'assistant-handoff', 'assistant-ui']) {
        const file = 'assets/js/modules/assistant/' + module + '.js';
        await withPage({ overrides: { [file]: '' }, viewport: { width: 390, height: 844 } }, async (page, errors) => {
            await page.locator('[data-assistant-toggle]').click();
            assert.equal(await page.locator('[data-floating-assistant]').getAttribute('data-assistant-ready'), 'fallback');
            await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-assistant-panel]')).visibility === 'visible' && document.activeElement.matches('[data-assistant-close]'));
            assert.match(await page.locator('[data-assistant-messages]').innerText(), /unavailable/);
            assert.equal(await page.locator('[data-assistant-input]').isDisabled(), true);
            const link = page.locator('[data-assistant-messages] a');
            assert.ok((await link.getAttribute('href')).startsWith('https://wa.me/50670827504'));
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('[data-assistant-toggle]').getAttribute('aria-expanded'), 'false');
            await page.addScriptTag({ content: await read(file) });
            await page.evaluate(() => window.BlackholeSystems.initFloatingAssistant());
            await page.locator('[data-assistant-toggle]').click();
            await send(page, 'I need a website');
            assert.match(await wa(page), /I need a website/);
            assert.deepEqual(errors, []);
        });
    }
    await withPage({ overrides: { 'assets/js/modules/assistant/assistant.js': '' } }, async page => {
        assert.equal(await page.locator('[data-assistant-toggle]').isDisabled(), true);
        assert.equal(await page.locator('.assistant-whatsapp').isVisible(), true);
    });
});
