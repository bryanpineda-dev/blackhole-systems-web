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

async function assertFullPreview(image) {
    const geometry = await image.evaluate((element) => ({
        width: element.clientWidth, height: element.clientHeight,
        expectedHeight: element.clientWidth * element.naturalHeight / element.naturalWidth,
        frameWidth: element.parentElement.clientWidth,
        frameHeight: element.parentElement.clientHeight
    }));
    assert.ok(geometry.width > 0 && geometry.height > 0);
    assert.ok(Math.abs(geometry.width - geometry.frameWidth) <= 1, 'preview fills the frame width');
    assert.ok(Math.abs(geometry.height - geometry.frameHeight) <= 1, 'frame follows the image height');
    assert.ok(Math.abs(geometry.height - geometry.expectedHeight) <= 1, 'preview retains its intrinsic proportions');
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
    test(`header logo follows the project header band at ${viewport.width}px regardless of archive height`, async () => {
        await withPage({ viewport }, async (page, errors) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const header = page.locator('.site-header');
            const deploy = page.locator('#deployments');
            const settleViewport = () => page.evaluate(() => new Promise((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            }));
            const scrollToPosition = async (position) => page.evaluate(({ position }) => {
                const section = document.querySelector('#deployments');
                const top = section.getBoundingClientRect().top + scrollY;
                const header = document.querySelector('.site-header').getBoundingClientRect();
                const target = position === 'before' ? top - innerHeight : position === 'enter'
                    ? top - header.bottom + 4 : position === 'middle' ? top + section.offsetHeight / 2
                        : top + section.offsetHeight - header.top + 4;
                window.scrollTo({ top: target, behavior: 'instant' });
            }, { position });
            await scrollToPosition('before');
            await page.waitForFunction(() => !document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            await scrollToPosition('enter');
            await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            await page.waitForFunction(() => getComputedStyle(document.querySelector('.logo-wrapper')).opacity === '0');
            assert.equal(await header.evaluate((element) => getComputedStyle(element).opacity), '1');
            assert.equal(await header.locator(viewport.width > 1024 ? '.nav-capsule' : '.mobile-nav-toggle').isVisible(), true);
            await scrollToPosition('middle');
            assert.equal(await header.evaluate((element) => element.classList.contains('in-deploy-zone')), true);
            if (viewport.width === 390) {
                assert.ok(await deploy.evaluate((element) => innerHeight / element.offsetHeight < 0.1), 'archive exceeds the former 10% visibility requirement');
            }
            await page.setViewportSize({ width: viewport.width, height: viewport.height - 90 });
            await settleViewport();
            await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            await scrollToPosition('after');
            await page.waitForFunction(() => !document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            await page.waitForFunction((expected) => getComputedStyle(document.querySelector('.logo-wrapper')).opacity === expected,
                viewport.width <= 768 ? '0' : '1');
            await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
            await page.waitForFunction(() => !document.querySelector('.site-header').classList.contains('scrolled') &&
                getComputedStyle(document.querySelector('.logo-wrapper')).opacity === '1');
            await scrollToPosition('enter');
            await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            for (const filter of ['featured', 'all']) {
                await page.locator(`.cmd-btn[data-filter="${filter}"]`).click();
                await page.locator('.dossier-grid.is-transitioning').waitFor({ state: 'detached' });
                await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            }
            await page.locator('.site-footer').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
            await page.waitForFunction(() => document.querySelector('.site-header').classList.contains('in-footer-zone'));
            await page.setViewportSize(viewport);
            await settleViewport();
            await scrollToPosition('enter');
            await page.waitForFunction(() => !document.querySelector('.site-header').classList.contains('in-footer-zone') &&
                document.querySelector('.site-header').classList.contains('in-deploy-zone'));
            assert.deepEqual(errors, []);
        });
    });

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
                await assertFullPreview(image);
                await card.locator('[data-project-details]').click();
                const modalImage = page.locator('[data-project-modal] [data-project-preview]');
                const modalInfo = await modalImage.evaluate(inspectImage);
                assert.deepEqual(modalInfo, { ...info, loading: 'eager' });
                await assertFullPreview(modalImage);
                const inquiry = new URL(await page.locator('[data-project-modal-inquiry]').getAttribute('href'));
                assert.equal(inquiry.origin + inquiry.pathname, 'https://wa.me/50670827504');
                assert.ok(inquiry.searchParams.get('text').includes(id));
                assert.ok(inquiry.searchParams.get('text').includes(await page.locator('[data-project-modal-title]').textContent()));
                assert.equal(await page.locator('[data-project-modal-scroll]').evaluate((element) => element.scrollTop), 0);
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

for (const viewport of [
    { width: 320, height: 568 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 1920, height: 1080 },
    { width: 844, height: 390 }
]) {
    test(`project previews remain full-width with one modal scroll at ${viewport.width}x${viewport.height}`, async () => {
        await withPage({ viewport }, async (page, errors) => {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const card = page.locator('[data-project-id="BH-001"]');
            await card.scrollIntoViewIfNeeded();
            await card.locator('[data-project-preview]').evaluate((image) => image.decode());
            await assertFullPreview(card.locator('[data-project-preview]'));
            const documentWidthBefore = await page.locator('html').evaluate((element) => element.scrollWidth);
            await card.locator('[data-project-details]').click();
            const modal = page.locator('[data-project-modal]');
            const image = modal.locator('[data-project-preview]');
            await image.evaluate((element) => element.decode());
            await assertFullPreview(image);
            await page.waitForFunction(() => getComputedStyle(document.querySelector('.project-modal-panel')).transform === 'matrix(1, 0, 0, 1, 0, 0)');
            const composition = await modal.evaluate((element) => {
                const header = element.querySelector('.project-modal-header').getBoundingClientRect();
                const preview = element.querySelector('[data-project-preview]').getBoundingClientRect();
                const intro = element.querySelector('.project-modal-intro').getBoundingClientRect();
                const metadata = element.querySelector('.project-modal-meta').getBoundingClientRect();
                const scroll = element.querySelector('[data-project-modal-scroll]');
                const panel = element.querySelector('.project-modal-panel').getBoundingClientRect();
                return {
                    headerClear: header.bottom <= preview.top + 1,
                    introBefore: intro.bottom <= preview.top,
                    metadataBelow: metadata.top >= preview.bottom,
                    horizontalOverflow: scroll.scrollWidth > scroll.clientWidth,
                    nestedScroll: getComputedStyle(element.querySelector('.project-modal-content')).overflowY,
                    panelInViewport: header.top >= 0 && panel.bottom <= innerHeight,
                    compact: panel.width <= 760 && panel.height <= 680,
                    titleSize: parseFloat(getComputedStyle(element.querySelector('h3')).fontSize),
                    metaColumns: getComputedStyle(element.querySelector('.project-modal-meta')).gridTemplateColumns.split(' ').length,
                    detailColumns: getComputedStyle(element.querySelector('.project-modal-details')).gridTemplateColumns.split(' ').length
                };
            });
            assert.deepEqual(composition, { headerClear: true, introBefore: true, metadataBelow: true,
                horizontalOverflow: false, nestedScroll: 'visible', panelInViewport: true, compact: true,
                titleSize: 26, metaColumns: viewport.width <= 480 ? 1 : 2, detailColumns: viewport.width <= 640 ? 1 : 2 });
            assert.equal(await modal.locator('.project-modal-meta dt').count(), 4);
            assert.equal(await modal.locator('.project-modal-meta dd').count(), 4);
            assert.equal(await modal.locator('.project-modal-section h4').count(), 3);
            const close = modal.locator('.project-modal-close');
            const closeBefore = await close.boundingBox();
            const scroll = modal.locator('[data-project-modal-scroll]');
            await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; });
            assert.ok(await scroll.evaluate((element) => element.scrollTop > 0));
            assert.deepEqual(await close.boundingBox(), closeBefore);
            const actions = modal.locator('.project-modal-actions');
            assert.equal(await actions.evaluate((element) => {
                const box = element.getBoundingClientRect();
                const scrollBox = element.closest('[data-project-modal-scroll]').getBoundingClientRect();
                return box.top >= scrollBox.top && box.bottom <= scrollBox.bottom;
            }), true);
            const buttonGeometry = await actions.locator('.btn-terminal-sm').evaluateAll((buttons) => buttons.map((button) => {
                const box = button.getBoundingClientRect();
                const copy = button.querySelector('span');
                const label = copy.getBoundingClientRect();
                const icon = button.querySelector('i').getBoundingClientRect();
                return { top: box.top, height: box.height,
                    fits: label.left >= box.left && label.right <= box.right && icon.right <= box.right && copy.scrollWidth <= copy.clientWidth };
            }));
            assert.ok(buttonGeometry.every((button) => button.fits), 'action labels and icons stay inside their buttons');
            assert.equal(buttonGeometry[0].top, buttonGeometry[1].top);
            assert.equal(buttonGeometry[0].height, buttonGeometry[1].height);
            if (process.env.BLACKHOLE_QA_DIR) {
                await fs.mkdir(process.env.BLACKHOLE_QA_DIR, { recursive: true });
                await page.screenshot({ path: path.join(process.env.BLACKHOLE_QA_DIR, `project-details-${viewport.width}x${viewport.height}.png`), animations: 'disabled' });
            }
            await close.click();
            await page.locator('[data-project-id="BH-002"] [data-project-details]').click();
            assert.equal(await scroll.evaluate((element) => element.scrollTop), 0);
            if (process.env.BLACKHOLE_QA_DIR) {
                await image.evaluate((element) => element.decode());
                await page.screenshot({ path: path.join(process.env.BLACKHOLE_QA_DIR, `project-preview-${viewport.width}x${viewport.height}.png`), animations: 'disabled' });
            }
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('html').evaluate((element) => element.scrollWidth), documentWidthBefore,
                'opening and closing projects does not add document overflow');
            assert.deepEqual(errors, []);
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

test('quote validation rejects whitespace and over-limit values before sending and accepts the brief boundary', async () => {
    await withForm(async (page, submit) => {
        const invalid = [
            { firstName: '   ' }, { lastName: '   ' }, { message: '   ' },
            { firstName: 'A'.repeat(81) }, { lastName: 'B'.repeat(81) },
            { firstName: 'A'.repeat(80), lastName: 'B'.repeat(80) },
            { email: 'q'.repeat(179) + '@example.com' }, { whatsapp: '1'.repeat(61) },
            { message: 'A'.repeat(3001) }
        ];
        for (const values of invalid) {
            await page.evaluate(values => {
                const valid = { firstName: 'Test', lastName: 'Blackhole', email: 'qa@example.invalid', whatsapp: '', message: 'Simulated brief' };
                for (const [id, value] of Object.entries({ ...valid, ...values })) {
                    const field = document.getElementById(id);
                    field.value = value;
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, values);
            await submit();
            assert.equal(await page.evaluate(() => window.requests.length), 0);
            assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
        }
        await page.locator('#message').fill('A'.repeat(3001));
        await submit();
        assert.equal(await page.locator('#message').inputValue(), 'A'.repeat(3001), 'over-limit input is preserved rather than truncated');
        assert.equal(await page.evaluate(() => window.requests.length), 0);
        await page.locator('#message').fill('A'.repeat(3000));
        await submit();
        assert.equal(await page.evaluate(() => window.requests[0].payload.brief.length), 3000);
        await page.evaluate(() => window.resolveRequest());
        assert.equal(await page.locator('#message').inputValue(), '');
    });
});

test('quote success preserves edits made after the request and explains that they were not sent', async () => {
    await withForm(async (page, submit) => {
        await submit();
        await page.locator('#message').fill('Additional requirements typed while sending.');
        await page.locator('#projectType').selectOption({ label: 'E-Commerce Platform' });
        await page.evaluate(() => window.resolveRequest());
        assert.equal(await page.locator('#message').inputValue(), 'Additional requirements typed while sending.');
        assert.equal(await page.locator('#projectType').inputValue(), 'E-Commerce Platform');
        assert.equal(await page.evaluate(() => window.requests[0].payload.brief), 'Simulated request only');
        assert.match(await page.locator('[data-form-status]').textContent(), /Newer edits were kept.*not included/);
        await page.clock.runFor(4200);
        assert.match(await page.locator('[data-form-status]').textContent(), /Newer edits were kept/);
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
        await submit();
        assert.equal(await page.evaluate(() => window.requests[1].payload.brief), 'Additional requirements typed while sending.');
        await page.evaluate(() => window.resolveRequest());
        assert.equal(await page.locator('#message').inputValue(), '');
    });
});

test('quote form stays disabled with a WhatsApp fallback if its module cannot load', async () => {
    await withPage({ overrides: { 'assets/js/modules/forms/quote-form.js': '' } }, async (page, errors) => {
        await page.locator('#page-loader').waitFor({ state: 'detached' });
        const form = page.locator('.sci-fi-form');
        const navigations = [];
        page.on('request', request => { if (request.isNavigationRequest()) navigations.push(request.url()); });
        assert.equal(await form.getAttribute('method'), 'post');
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), true);
        assert.equal(await page.locator('[data-form-status] a').getAttribute('href').then(url => new URL(url).hostname), 'wa.me');
        for (const [id, value] of Object.entries({ firstName: 'Test', lastName: 'Blackhole', email: 'qa@example.invalid', message: 'No native submission allowed.' })) {
            await page.locator('#' + id).fill(value);
        }
        await page.locator('#firstName').focus();
        await page.keyboard.press('Enter');
        await page.locator('#formSubmitBtn').evaluate(button => button.click());
        await page.waitForTimeout(200);
        assert.deepEqual(navigations, []);
        assert.equal(page.url(), 'http://blackhole.test/');
        await addScripts(page, ['assets/js/modules/forms/quote-form.js']);
        await page.evaluate(() => window.BlackholeSystems.Forms.initQuoteForm());
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
        assert.equal(await page.locator('[data-form-status]').textContent(), '');
        assert.equal(await page.locator('#message').inputValue(), 'No native submission allowed.');
        assert.deepEqual(errors, []);
    });
});

test('quote null JSON response is a recoverable failure rather than a raw parsing error', async () => {
    await withForm(async (page, submit) => {
        await page.evaluate(() => { window.fetch = async () => ({ ok: true, json: async () => null }); });
        await submit();
        await page.waitForFunction(() => document.querySelector('[data-form-status]').dataset.status === 'error');
        assert.match(await page.locator('[data-form-status]').textContent(), /could not be transmitted/);
        assert.equal(await page.locator('#firstName').inputValue(), 'Test');
        assert.equal(await page.locator('#formSubmitBtn').isDisabled(), false);
    });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`service WhatsApp handoffs and keyboard labels retain their context at ${viewport.width}px`, async () => {
        const session = await openPage(browser, { viewport, isMobile: viewport.width < 768, hasTouch: viewport.width < 768 });
        const { page, context, errors } = session;
        try {
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const services = await page.locator('.capability-card').evaluateAll(cards => cards.map(card => ({
                name: card.querySelector('h3').textContent, href: card.querySelector('.btn-morph').href,
                target: card.querySelector('.btn-morph').target, rel: card.querySelector('.btn-morph').rel
            })));
            assert.equal(services.length, 9);
            for (const service of services) {
                const url = new URL(service.href);
                assert.equal(url.origin + url.pathname, 'https://wa.me/50670827504');
                assert.ok(url.searchParams.get('text').includes(service.name));
                assert.ok(url.searchParams.get('text').includes('https://blackholesys.com/#capabilities'));
                assert.equal(service.target, '_blank'); assert.ok(service.rel.includes('noopener'));
            }
            assert.deepEqual(await page.locator('.header-action a,.mobile-command-cta a,.hero-actions a[href="#contact"],.workflow-actions a[href="#contact"]')
                .evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), ['#contact', '#contact', '#contact', '#contact']);
            const service = page.locator('.btn-morph').first();
            await service.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0);
            await page.keyboard.press('Tab'); await service.focus();
            await page.waitForFunction(() => getComputedStyle(document.querySelector('.btn-morph .btn-text')).opacity === '1');
            assert.equal(await service.evaluate(e => e.matches(':focus-visible')), true);
            assert.ok(await service.evaluate(e => e.getBoundingClientRect().width >= 179));
            await context.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Simulated WhatsApp handoff</title>' }));
            const servicePopup = context.waitForEvent('page');
            await service.click({ noWaitAfter: true });
            const firstPopup = await servicePopup;
            await firstPopup.waitForURL(/^https:\/\/wa\.me\//);
            await firstPopup.waitForLoadState('domcontentloaded');
            assert.equal(new URL(firstPopup.url()).searchParams.get('text'), new URL(services[0].href).searchParams.get('text'));
            await firstPopup.close();
            await page.locator('[data-project-details="BH-001"]').click();
            const inquiry = page.locator('[data-project-modal-inquiry]');
            const projectUrl = await inquiry.getAttribute('href');
            const projectPopup = context.waitForEvent('page');
            await inquiry.click({ noWaitAfter: true });
            const secondPopup = await projectPopup;
            await secondPopup.waitForURL(/^https:\/\/wa\.me\//);
            await secondPopup.waitForLoadState('domcontentloaded');
            assert.equal(new URL(secondPopup.url()).searchParams.get('text'), new URL(projectUrl).searchParams.get('text'));
            assert.equal(await page.locator('.project-modal.is-open').count(), 0);
            assert.equal(await page.locator('.sci-fi-form').evaluate(e => !!e.closest('[inert]')), false);
            await secondPopup.close();
            assert.deepEqual(errors, []);
        } finally { await context.close(); }
    });
}
