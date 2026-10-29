const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const walk = (directory) => fs.readdirSync(path.join(root, directory), { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);

function load(files) {
    const context = vm.createContext({ window: {} });
    for (const file of files) vm.runInContext(read(file), context, { filename: file });
    return context.window;
}

test('all authored JavaScript files pass syntax validation', () => {
    for (const file of walk('assets/js').filter((file) => file.endsWith('.js'))) {
        const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
        assert.equal(result.status, 0, `${file}: ${result.stderr || result.error || ''}`);
    }
});

test('local HTML resources, links and CSS imports resolve', () => {
    const check = (file, reference) => {
        if (/^(?:https?:|\/\/|#|mailto:|tel:|data:)/.test(reference)) return;
        let target = path.resolve(path.dirname(path.join(root, file)), reference.split(/[?#]/)[0]);
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
        assert.ok(fs.existsSync(target), `${file}: missing ${reference}`);
    };
    for (const file of ['index.html', 'tools/blackhole-qr/index.html']) {
        const source = read(file);
        for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) check(file, match[1]);
        const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
        for (const match of source.matchAll(/<script\b[^>]*\btype=["'](?:application\/ld\+json|importmap)["'][^>]*>([\s\S]*?)<\/script>/gi)) {
            assert.doesNotThrow(() => JSON.parse(match[1]));
        }
    }
    for (const file of walk('assets/css').filter((file) => file.endsWith('.css'))) {
        for (const match of read(file).matchAll(/(?:@import\s+|url\(\s*)["']?([^"'\s;)]+)["']?/g)) check(file, match[1]);
    }
});

test('portfolio records, filters and rendering share a valid unique dataset', () => {
    const namespace = load(['assets/js/modules/projects-data.js', 'assets/js/modules/projects-render.js']).BlackholeSystemsProjects;
    const filters = new Set([...read('index.html').matchAll(/data-filter="([^"]+)"/g)].map((match) => match[1]));
    assert.equal(namespace.projects.length, 17);
    assert.equal(new Set(namespace.projects.map((project) => project.id)).size, namespace.projects.length);
    for (const project of namespace.projects) {
        for (const field of ['id', 'name', 'url', 'icon', 'category', 'industry', 'type', 'role', 'summary', 'status', 'statusType']) {
            assert.ok(project[field], `${project.id}: missing ${field}`);
        }
        assert.equal(new URL(project.url).protocol, 'https:');
        for (const field of ['built', 'systems', 'stack', 'filters']) assert.ok(project[field].length, `${project.id}: ${field}`);
        for (const filter of project.filters) assert.ok(filters.has(filter), `${project.id}: unknown filter ${filter}`);
        assert.ok(namespace.renderProjectCard(project).includes(`data-project-id="${project.id}"`));
        const metadata = namespace.renderProjectMeta(project);
        assert.equal([...metadata.matchAll(/<dt>/g)].length, 4);
        assert.equal([...metadata.matchAll(/<dd>/g)].length, 4);
        for (const value of [project.industry, project.type, project.role, project.association || 'Direct build']) {
            assert.ok(metadata.includes(namespace.escapeHtml(value)));
        }
    }
    assert.equal(namespace.projects.some((project) => project.id === 'BH-012'), false);
    assert.ok(read('index.html').includes('Andrea'));
    assert.equal(namespace.escapeHtml('<script>"&\'').includes('<script>'), false);
});

test('assistant explicit routes, fallback and handoff encode user input safely', () => {
    const BH = load(['assets/js/modules/assistant/assistant-data.js', 'assets/js/modules/assistant/assistant-router.js', 'assets/js/modules/assistant/assistant-session.js',
        'assets/js/modules/assistant/assistant-handoff.js']).BlackholeSystems;
    const data = BH.assistantData;
    const router = BH.Assistant.createRouter(data.serviceCatalog);
    const handoff = BH.Assistant.createHandoff({ ...data, router });
    for (const id of Object.keys(data.serviceCatalog)) {
        assert.equal(router.detectService('', id).id, id);
        const response = handoff.buildResponse('<script>alert("test")</script>', id);
        assert.ok(response.html.length);
        assert.ok(Array.isArray(response.quickActions));
        assert.equal(response.html.includes('<script>'), false);
    }
    assert.equal(router.detectService('zxqvzz').id, 'fallback');
    for (const id of [...data.defaultQuickActions, ...data.fallbackQuickActions]) assert.ok(data.serviceCatalog[id]);
});

test('all project previews resolve to local reviewed JPEGs with stable dimensions and shared rendering', () => {
    const namespace = load(['assets/js/modules/projects-data.js', 'assets/js/modules/projects-render.js']).BlackholeSystemsProjects;
    const sources = new Set();
    for (const project of namespace.projects) {
        const preview = project.preview;
        assert.ok(preview.src.startsWith('assets/images/projects/'));
        assert.ok(path.basename(preview.src).startsWith(project.id.toLowerCase() + '-'));
        assert.ok(fs.statSync(path.join(root, preview.src)).size > 0);
        assert.ok(Number.isInteger(preview.width) && preview.width > 0);
        assert.ok(Number.isInteger(preview.height) && preview.height > 0);
        sources.add(preview.src);
        const card = namespace.renderProjectCard(project);
        const modal = namespace.renderProjectPreview(project, 'eager');
        assert.ok(card.includes(`src="${preview.src}"`));
        assert.ok(card.includes('loading="lazy"'));
        assert.ok(modal.includes(`src="${preview.src}"`));
        assert.ok(modal.includes('loading="eager"'));
        assert.ok(modal.includes(`width="${preview.width}" height="${preview.height}"`));
        assert.ok(modal.includes(`alt="Homepage preview of ${namespace.escapeHtml(project.name)}"`));
    }
    assert.equal(sources.size, namespace.projects.length);
    assert.equal(fs.readdirSync(path.join(root, 'assets/images/projects')).length, sources.size);
    const withoutPreview = { ...namespace.projects[0], preview: undefined };
    const fallback = namespace.renderProjectPreview(withoutPreview);
    assert.equal(fallback.includes('<img'), false);
    assert.ok(fallback.includes(withoutPreview.category));
});

test('README and development package declare the same release version', () => {
    const pkg = JSON.parse(read('package.json'));
    const readme = read('README.md');
    assert.ok(readme.includes(`Website version: **${pkg.version}**`));
    assert.ok(readme.includes(`Deployment tag: \`v${pkg.version}\``));
});

test('hosting redirect contains only the reviewed host-scoped HTTPS rules', () => {
    const rules = read('.htaccess').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    assert.deepEqual(rules, [
        '<IfModule mod_rewrite.c>',
        'RewriteEngine On',
        'RewriteRule ^\\.well-known(?:/|$) - [L]',
        'RewriteCond %{HTTP_HOST} ^blackholesys\\.com(?::80)?$ [NC]',
        'RewriteCond %{HTTPS} !=on',
        'RewriteRule ^ https://blackholesys.com%{REQUEST_URI} [R=301,L]',
        '</IfModule>'
    ]);
});

test('hosting host/path patterns exclude other domains and retain validation paths', () => {
    const source = read('.htaccess');
    const host = new RegExp(source.match(/RewriteCond %\{HTTP_HOST\} (\S+) \[NC\]/)[1], 'i');
    const validation = new RegExp(source.match(/RewriteRule (\S+) - \[L\]/)[1]);
    for (const value of ['blackholesys.com', 'BLACKHOLESYS.COM', 'blackholesys.com:80']) assert.ok(host.test(value));
    for (const value of ['example.com', 'localhost', 'www.blackholesys.com', 'admin.blackholesys.com', 'blackholesys.com.evil']) assert.equal(host.test(value), false);
    for (const value of ['.well-known', '.well-known/acme-challenge/token', '.well-known/pki-validation/file.txt']) assert.ok(validation.test(value));
    for (const value of ['', 'index.html', 'tools/blackhole-qr/', '.well-known-other/file']) assert.equal(validation.test(value), false);
});
