const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const origin = 'http://blackhole.test';
const contentTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
    '.svg': 'image/svg+xml', '.json': 'application/json'
};
const read = (file) => fs.readFile(path.join(root, file), 'utf8');

async function launchBrowser() {
    return chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
}

async function openPage(browser, options = {}) {
    const context = await browser.newContext({
        viewport: options.viewport || { width: 1440, height: 900 },
        reducedMotion: options.reducedMotion || 'reduce', serviceWorkers: 'block'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // Serve repository bytes inside the browser, without a server or live requests.
    await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== origin || route.request().method() !== 'GET') return route.abort();
        if (options.fixture !== undefined) {
            return route.fulfill({ contentType: 'text/html', body: options.fixture });
        }
        let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        if (!relative || relative.endsWith('/')) relative += 'index.html';
        const file = path.resolve(root, relative);
        if (!file.startsWith(root + path.sep)) return route.abort();
        try {
            const body = Object.hasOwn(options.overrides || {}, relative)
                ? options.overrides[relative] : await fs.readFile(file);
            return route.fulfill({ contentType: contentTypes[path.extname(file)] || 'application/octet-stream', body });
        } catch {
            return route.fulfill({ status: 404, body: 'Not found' });
        }
    });
    await page.goto(origin + (options.url || '/'), { waitUntil: 'load' });
    return { page, context, errors };
}

async function addScripts(page, files) {
    for (const file of files) await page.addScriptTag({ content: await read(file) });
}

module.exports = { root, origin, read, launchBrowser, openPage, addScripts };
