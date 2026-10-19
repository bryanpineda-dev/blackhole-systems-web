const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { read, launchBrowser, openPage, addScripts } = require('./helpers/browser.cjs');

let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

async function withPage(options, run) {
    const session = await openPage(browser, options);
    try { await run(session.page, session.errors); }
    finally { await session.context.close(); }
}

async function freezeClock(page) {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
}

test('standalone boot isolates failures and does not rerun successful modules', async () => {
    await withPage({ fixture: '<body class="is-loading" data-page-boot="loader cursor stars reveal"></body>' }, async (page, errors) => {
        await page.evaluate(() => {
            window.calls = [];
            window.completions = 0;
            document.addEventListener('blackhole:loader-complete', () => window.completions++);
            window.BlackholeSystems = {
                initCustomCursor() { document.documentElement.classList.add('has-custom-cursor'); throw new Error('Injected cursor failure'); },
                initStarField() { window.calls.push('stars'); },
                initScrollReveal() { window.calls.push('reveal'); }
            };
        });
        await addScripts(page, ['assets/js/modules/loader.js']);
        await page.evaluate(() => { window.BlackholeSystems.initPageLoader = () => { throw new Error('Injected loader failure'); }; });
        await addScripts(page, ['assets/js/modules/page-boot.js']);
        assert.equal(await page.locator('#page-loader').count(), 0);
        assert.equal(await page.locator('body.is-loading').count(), 0);
        assert.equal(await page.locator('html.has-custom-cursor').count(), 0);
        assert.deepEqual(await page.evaluate(() => window.calls), ['stars', 'reveal']);
        assert.equal(await page.evaluate(() => window.completions), 1);
        await page.evaluate(() => {
            window.BlackholeSystems.initPageLoader = () => window.calls.push('loader recovered');
            window.BlackholeSystems.initCustomCursor = () => window.calls.push('cursor recovered');
            window.BlackholeSystems.initPageBoot();
        });
        assert.deepEqual(await page.evaluate(() => window.calls), ['stars', 'reveal', 'loader recovered', 'cursor recovered']);
        assert.deepEqual(errors, []);
    });
});

test('loader preserves its normal timing and emits completion only once', async () => {
    await withPage({ fixture: '<body class="is-loading"><div id="page-loader"></div></body>' }, async (page) => {
        await freezeClock(page);
        await addScripts(page, ['assets/js/modules/loader.js']);
        await page.evaluate(() => {
            window.completions = 0;
            document.addEventListener('blackhole:loader-complete', () => window.completions++);
            window.BlackholeSystems.initPageLoader();
        });
        await page.clock.runFor(849);
        assert.equal(await page.locator('#page-loader.is-hiding').count(), 0);
        await page.clock.runFor(1);
        assert.equal(await page.locator('#page-loader.is-hiding').count(), 1);
        await page.clock.runFor(850);
        assert.equal(await page.locator('#page-loader').count(), 0);
        await page.evaluate(() => window.BlackholeSystems.completePageLoader());
        await page.clock.runFor(2200);
        assert.equal(await page.evaluate(() => window.completions), 1);
    });
});

test('loader maximum wait still releases a page without a load event', async () => {
    await withPage({ fixture: '<body class="is-loading"><div id="page-loader"></div></body>' }, async (page) => {
        await freezeClock(page);
        await addScripts(page, ['assets/js/modules/loader.js']);
        await page.evaluate(() => {
            Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });
            window.BlackholeSystems.initPageLoader();
        });
        await page.clock.runFor(3051);
        assert.equal(await page.locator('#page-loader').count(), 0);
        assert.equal(await page.locator('body.is-loading').count(), 0);
    });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`landing modal traps and restores focus at ${viewport.width}px without changing page layout`, async () => {
        await withPage({ viewport }, async (page, errors) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(await page.locator('.dossier-card').count(), 17);
            const trigger = page.locator('[data-project-details]').first();
            await trigger.scrollIntoViewIfNeeded();
            const layout = (element) => ({ top: element.offsetTop, left: element.offsetLeft,
                width: element.offsetWidth, height: element.offsetHeight });
            const before = await trigger.evaluate(layout);
            await page.locator('footer').evaluate((element) => { element.inert = true; });
            await trigger.click();
            const modal = page.locator('[data-project-modal]');
            assert.equal(await modal.getAttribute('aria-hidden'), 'false');
            await page.waitForFunction(() => document.activeElement.matches('.project-modal-close'), null, { timeout: 1500 });
            assert.equal(await page.evaluate(() => document.activeElement.matches('.project-modal-close')), true);
            await page.keyboard.press('Shift+Tab');
            assert.equal(await page.evaluate(() => document.activeElement.matches('.request-demo')), true);
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => document.activeElement.matches('.project-modal-close')), true);
            await page.locator('#firstName').evaluate((element) => element.focus());
            assert.equal(await page.evaluate(() => document.querySelector('[data-project-modal]').contains(document.activeElement)), true);
            await page.keyboard.press('Escape');
            assert.equal(await modal.getAttribute('aria-hidden'), 'true');
            assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
            assert.equal(await page.locator('footer').evaluate((element) => element.inert), true);
            await page.locator('footer').evaluate((element) => { element.inert = false; });
            assert.deepEqual(await trigger.evaluate(layout), before);
            await trigger.click();
            await page.locator('.project-modal-close').click();
            assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
            await trigger.click();
            await page.locator('.project-modal-backdrop').dispatchEvent('click');
            assert.equal(await modal.getAttribute('aria-hidden'), 'true');
            await trigger.click();
            await page.locator('.project-modal-actions .request-demo').click();
            assert.equal(await modal.getAttribute('aria-hidden'), 'true');
            assert.equal(await page.locator('body.project-modal-open').count(), 0);
            assert.deepEqual(errors, []);
            if (process.env.BLACKHOLE_QA_DIR) {
                await fs.mkdir(process.env.BLACKHOLE_QA_DIR, { recursive: true });
                for (const [name, selector] of [['hero', '#hero'], ['services', '#capabilities'], ['contact', '#contact']]) {
                    await page.locator(selector).scrollIntoViewIfNeeded();
                    await page.screenshot({ path: path.join(process.env.BLACKHOLE_QA_DIR, `landing-${name}-${viewport.width}.png`), animations: 'disabled' });
                }
            }
        });
    });

    test(`QR boot, preview and export work at ${viewport.width}px`, async () => {
        await withPage({ viewport, url: '/tools/blackhole-qr/' }, async (page, errors) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            assert.equal(await page.locator('#cursor-dot').count(), 1);
            assert.equal(await page.locator('#cursor-ring').count(), 1);
            assert.equal(await page.evaluate(() => window.BlackholeSystems.pageBootState.initialized.size), 4);
            assert.ok(await page.locator('[data-qr-preview] canvas, [data-qr-preview] svg').count());
            await page.locator('[data-qr-type="text"]').click();
            await page.locator('[data-qr-text]').fill('Blackhole regression check');
            for (const extension of ['png', 'svg']) {
                const download = page.waitForEvent('download');
                await page.locator(`[data-qr-download="${extension}"]`).click();
                const result = await download;
                assert.ok(result.suggestedFilename().endsWith('.' + extension));
                assert.equal(await result.failure(), null);
            }
            assert.deepEqual(errors, []);
            if (process.env.BLACKHOLE_QA_DIR) {
                await page.locator('.qr-builder').scrollIntoViewIfNeeded();
                await page.screenshot({ path: path.join(process.env.BLACKHOLE_QA_DIR, `qr-builder-${viewport.width}.png`), animations: 'disabled' });
            }
        });
    });

    test(`all 17 project screenshots load and match their modals at ${viewport.width}px`, async () => {
        await withPage({ viewport }, async (page, errors) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const projects = await page.evaluate(() => window.BlackholeSystemsProjects.projects.map(({ id, preview }) => ({ id, preview })));
            assert.equal(projects.length, 17);
            const inspectImage = async (image) => {
                await image.decode();
                return { src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight,
                    fit: getComputedStyle(image).objectFit, loading: image.loading };
            };
            for (const { id, preview } of projects) {
                const card = page.locator(`[data-project-id="${id}"]`);
                await card.scrollIntoViewIfNeeded();
                const image = card.locator('[data-project-preview]');
                const info = await image.evaluate(inspectImage);
                assert.deepEqual(info, { src: preview.src, width: preview.width, height: preview.height, fit: 'contain', loading: 'lazy' });
                await card.locator('[data-project-details]').click();
                const modalImage = page.locator('[data-project-modal] [data-project-preview]');
                const modalInfo = await modalImage.evaluate(inspectImage);
                assert.deepEqual(modalInfo, { ...info, loading: 'eager' });
                assert.equal(await page.locator('html').evaluate((element) => element.scrollWidth <= window.innerWidth), true);
                if (process.env.BLACKHOLE_QA_DIR && ['BH-001', 'BH-002', 'BH-017', 'BH-018'].includes(id)) {
                    await fs.mkdir(process.env.BLACKHOLE_QA_DIR, { recursive: true });
                    await page.screenshot({ path: path.join(process.env.BLACKHOLE_QA_DIR, `project-modal-${id}-${viewport.width}.png`), animations: 'disabled' });
                }
                await page.keyboard.press('Escape');
            }
            for (const filter of ['featured', 'agency', 'all']) {
                await page.locator(`.cmd-btn[data-filter="${filter}"]`).click();
                await page.locator('.dossier-grid.is-transitioning').waitFor({ state: 'detached' });
                const visible = await page.locator('.dossier-card:not([hidden])').evaluateAll((cards) => cards.map((card) => card.dataset.filters));
                assert.ok(visible.length > 0);
                if (filter !== 'all') assert.ok(visible.every((value) => value.split(' ').includes(filter)));
            }
            assert.deepEqual(errors, []);
            if (process.env.BLACKHOLE_QA_DIR) {
                await page.locator('.dossier-card').first().scrollIntoViewIfNeeded();
                await page.screenshot({ path: path.join(process.env.BLACKHOLE_QA_DIR, `project-cards-${viewport.width}.png`), animations: 'disabled' });
            }
        });
    });
}

test('failed project images fall back to their original category in cards and modals', async () => {
    await withPage({ overrides: { 'assets/images/projects/bh-001-sebana.jpg': '' } }, async (page, errors) => {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        const card = page.locator('[data-project-id="BH-001"]');
        await card.scrollIntoViewIfNeeded();
        await card.locator('[data-project-preview]').waitFor({ state: 'detached' });
        assert.equal(await card.locator('.screen-placeholder span').textContent(), 'Booking System');
        await card.locator('[data-project-details]').click();
        const modal = page.locator('[data-project-modal]');
        await modal.locator('[data-project-preview]').waitFor({ state: 'detached' });
        assert.equal(await modal.locator('[data-project-modal-icon] span').textContent(), 'Booking System');
        assert.equal(await modal.getAttribute('aria-hidden'), 'false');
        await page.keyboard.press('Escape');
        assert.equal(await modal.getAttribute('aria-hidden'), 'true');
        assert.deepEqual(errors, []);
    });
});

test('QR remains usable when the loader module is unavailable', async () => {
    await withPage({ url: '/tools/blackhole-qr/', overrides: { 'assets/js/modules/loader.js': '' } }, async (page, errors) => {
        assert.equal(await page.locator('#page-loader').count(), 0);
        assert.equal(await page.locator('body.is-loading').count(), 0);
        assert.ok(await page.locator('[data-qr-preview] canvas, [data-qr-preview] svg').count());
        assert.deepEqual(errors, []);
    });
});

async function withForm(run, timeout) {
    const html = await read('index.html');
    const start = html.indexOf('<form class="bh-glass glass-form sci-fi-form"');
    let form = html.slice(start, html.indexOf('</form>', start) + 7);
    if (timeout !== undefined) form = form.replace('<form ', `<form data-lead-timeout-ms="${timeout}" `);
    await withPage({ fixture: form }, async (page, errors) => {
        await freezeClock(page);
        await addScripts(page, ['assets/js/modules/forms/quote-form.js']);
        await page.evaluate(() => {
            window.requests = [];
            window.fetch = (url, options) => {
                window.requests.push({ url, payload: Object.fromEntries(options.body), signal: options.signal });
                return new Promise((resolve, reject) => {
                    window.resolveRequest = (ok = true) => resolve({ ok, json: async () => ({ ok, message: ok ? 'Test accepted' : 'Test rejected' }) });
                    window.invalidJson = () => resolve({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } });
                    window.rejectRequest = () => reject(new TypeError('Test network failure'));
                    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
                });
            };
            window.BlackholeSystems.Forms.initQuoteForm();
        });
        await page.locator('#firstName').fill('Test');
        await page.locator('#lastName').fill('Blackhole');
        await page.locator('#email').fill('qa@example.invalid');
        await page.locator('#message').fill('Simulated request only');
        const submit = () => page.locator('form').evaluate((element) => element.requestSubmit());
        await run(page, submit);
        assert.deepEqual(errors, []);
    });
}

test('quote form blocks concurrent submissions and clears values only after confirmed success', async () => {
    await withForm(async (page, submit) => {
        await submit();
        await submit();
        assert.equal(await page.evaluate(() => window.requests.length), 1);
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), true);
        const payload = await page.evaluate(() => window.requests[0].payload);
        assert.equal(payload.name, 'Test Blackhole');
        assert.equal(payload.lead_channel, 'blackhole-web-quote');
        assert.equal(payload.brief, 'Simulated request only');
        await page.evaluate(() => window.resolveRequest());
        assert.equal(await page.locator('#firstName').inputValue(), '');
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
        assert.equal(await page.locator('[data-form-status]').getAttribute('data-status'), 'success');
        await page.clock.runFor(15001);
        assert.equal(await page.evaluate(() => window.requests[0].signal.aborted), false);
    });
});

for (const timeout of [undefined, 75, 'invalid']) {
    test(`quote timeout (${timeout ?? 'default'}) aborts, preserves values and permits a manual retry`, async () => {
        await withForm(async (page, submit) => {
            await submit();
            await page.clock.runFor(typeof timeout === 'number' ? timeout : 15000);
            assert.equal(await page.evaluate(() => window.requests[0].signal.aborted), true);
            assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
            assert.equal(await page.locator('#firstName').inputValue(), 'Test');
            assert.match(await page.locator('[data-form-status]').textContent(), /did not respond in time/);
            assert.equal(await page.evaluate(() => window.requests.length), 1);
            await submit();
            assert.equal(await page.evaluate(() => window.requests.length), 2);
            await page.evaluate(() => window.resolveRequest());
        }, timeout);
    });
}

for (const mode of ['network', 'server', 'invalid-json']) {
    test(`quote ${mode} failure retains values and an old reset timer cannot overwrite a retry`, async () => {
        await withForm(async (page, submit) => {
            await submit();
            if (mode === 'network') await page.evaluate(() => window.rejectRequest());
            if (mode === 'server') await page.evaluate(() => window.resolveRequest(false));
            if (mode === 'invalid-json') await page.evaluate(() => window.invalidJson());
            assert.equal(await page.locator('#firstName').inputValue(), 'Test');
            assert.equal(await page.locator('[data-form-status]').getAttribute('data-status'), 'error');
            await submit();
            await page.clock.runFor(3600);
            assert.equal(await page.locator('#formSubmitBtn').getAttribute('aria-busy'), 'true');
            assert.match(await page.locator('#formSubmitBtn').textContent(), /SENDING/);
            await page.evaluate(() => window.resolveRequest());
            assert.equal(await page.locator('[data-form-status]').getAttribute('data-status'), 'success');
        });
    });
}

test('quote deadline also cancels a response body that never finishes', async () => {
    await withForm(async (page, submit) => {
        await page.evaluate(() => {
            window.bodyAborted = false;
            window.fetch = async (url, options) => ({
                ok: true,
                json: () => new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => {
                        window.bodyAborted = true;
                        reject(new DOMException('Aborted', 'AbortError'));
                    }, { once: true });
                })
            });
        });
        await submit();
        await page.clock.runFor(15000);
        assert.equal(await page.evaluate(() => window.bodyAborted), true);
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
        assert.equal(await page.locator('#firstName').inputValue(), 'Test');
        assert.match(await page.locator('[data-form-status]').textContent(), /did not respond in time/);
    });
});

test('invalid form data and missing endpoint never send a request', async () => {
    await withForm(async (page, submit) => {
        await page.locator('#firstName').fill('');
        await submit();
        assert.equal(await page.evaluate(() => window.requests.length), 0);
        await page.locator('#firstName').fill('Test');
        await page.locator('form').evaluate((form) => { form.dataset.leadEndpointProduction = ''; });
        await submit();
        assert.equal(await page.evaluate(() => window.requests.length), 0);
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
        assert.match(await page.locator('[data-form-status]').textContent(), /not configured/);
    });
});
