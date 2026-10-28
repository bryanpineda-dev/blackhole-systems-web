const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { launchBrowser, openPage } = require('./helpers/browser.cjs');

let browser;
before(async () => { browser = await launchBrowser(); });
after(async () => { await browser?.close(); });

async function loadedCss(page) {
    return page.evaluate(() => {
        const files = [];
        function walk(sheet) {
            if (!sheet.href || new URL(sheet.href).origin !== location.origin) return;
            files.push(new URL(sheet.href).pathname.slice(1));
            for (const rule of sheet.cssRules) if (rule instanceof CSSImportRule && rule.styleSheet) walk(rule.styleSheet);
        }
        for (const sheet of document.styleSheets) walk(sheet);
        return files;
    });
}

for (const kind of ['landing', 'qr']) for (const width of [1440, 390]) {
    test(`${kind} delivers its scoped styles and shared declarations at ${width}px`, async () => {
        const session = await openPage(browser, { url: kind === 'qr' ? '/tools/blackhole-qr/' : '/',
            viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390, reducedMotion: 'no-preference' });
        const { page, errors } = session;
        page.setDefaultTimeout(15000);
        try {
            const files = await loadedCss(page);
            assert.equal(new Set(files).size, files.length, 'no shared stylesheet is applied twice');
            for (const name of ['shared.css', 'variables.css', 'base.css', 'components.css', 'animations.css', 'responsive-shared.css', 'effects/star-field.css']) {
                assert.ok(files.includes(`assets/css/${name}`), name);
            }
            assert.ok(files.indexOf('assets/css/components.css') < files.indexOf('assets/css/responsive-shared.css'));
            const sections = files.filter(file => file.startsWith('assets/css/sections/'));
            if (kind === 'qr') {
                assert.deepEqual(sections, []);
                assert.equal(files.includes('assets/css/style.css'), false);
                assert.equal(files.includes('assets/css/responsive.css'), false);
                assert.equal(files.at(-1), 'assets/css/tools/qr-studio.css');
            } else {
                assert.equal(sections.length, 9);
                assert.equal(files.at(-1), 'assets/css/responsive.css');
            }
            await page.locator('#page-loader').waitFor({ state: 'detached' });
            const shared = await page.evaluate(() => ({
                stars: [...document.querySelectorAll('[data-star-field]')].map(field => {
                    const star = field.querySelector('.star');
                    return { overflow: getComputedStyle(field).overflow, position: getComputedStyle(star).position, radius: getComputedStyle(star).borderRadius };
                }),
                tokens: ['--motion-duration-reveal', '--motion-duration-reveal-repeat'].map(name => getComputedStyle(document.documentElement).getPropertyValue(name).trim())
            }));
            assert.equal(shared.stars.length, kind === 'qr' ? 1 : 3);
            for (const star of shared.stars) assert.deepEqual(star, { overflow: 'hidden', position: 'absolute', radius: '50%' });
            assert.deepEqual(shared.tokens, ['760ms', '600ms']);
            const metallic = await page.locator('.section-heading').first().evaluate(node => ({
                image: getComputedStyle(node).backgroundImage, clip: getComputedStyle(node).backgroundClip
            }));
            assert.ok(metallic.image.includes('linear-gradient('));
            assert.equal(metallic.clip, 'text');
            if (kind === 'qr' && width === 390) {
                await page.locator('.qr-builder').evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
                await page.waitForFunction(() => {
                    const panel = document.querySelector('.qr-builder');
                    return panel.classList.contains('is-revealed') && getComputedStyle(panel).transform === 'matrix(1, 0, 0, 1, 0, 16)';
                });
            }
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.waitForFunction(() => [...document.querySelectorAll('[data-star-field]')].every(field => field.classList.contains('is-star-field-paused')));
            await page.waitForFunction(() => [...document.querySelectorAll('[data-star-field] .star')].every(star => {
                const style = getComputedStyle(star);
                return style.animationName === 'none' || style.animationPlayState === 'paused';
            }));
            // Keep the stylesheet contract independent of the generator lifecycle.
            const declaredPause = await page.evaluate(() => {
                const field = document.createElement('div'), star = document.createElement('div');
                field.className = 'star-field is-star-field-paused';
                star.className = 'star';
                field.appendChild(star);
                document.body.appendChild(field);
                try { return getComputedStyle(star).animationPlayState; }
                finally { field.remove(); }
            });
            assert.equal(declaredPause, 'paused');
            assert.deepEqual(errors, []);
        } finally { await session.context.close(); }
    });
}
