const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const walk = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]);

test('local icon sources, checksums and generated sprite are reproducible offline', () => {
    const result = spawnSync(process.execPath, ['scripts/build-icons.cjs', '--check'], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(read('assets/icons/manifest.json'));
    assert.equal(manifest.remixVersion, '3.5.0');
    assert.equal(manifest.fontAwesomeVersion, '6.7.2');
    assert.equal(new Set(manifest.icons.map(icon => icon.id)).size, manifest.icons.length);
    for (const license of ['Remix-3.5.0-LICENSE.txt', 'Font-Awesome-6.7.2-LICENSE.txt']) assert.ok(read(`assets/icons/licenses/${license}`).length > 1000);
});

test('every static and dynamically referenced icon exists, with no unused catalog entries', () => {
    const manifest = JSON.parse(read('assets/icons/manifest.json'));
    const ids = new Set(manifest.icons.map(icon => icon.id)), referenced = new Set();
    const files = ['index.html', 'tools/blackhole-qr/index.html', ...walk('assets/js').filter(file => file.endsWith('.js'))];
    for (const file of files) {
        const source = read(file);
        for (const [id] of source.matchAll(/\b(?:ri-[a-z0-9-]+|fa-[a-z0-9-]+)\b/g)) {
            if (['fa-solid', 'fa-brands', 'ri-spin'].includes(id)) continue;
            assert.ok(ids.has(id), `${file}: unknown icon ${id}`);
            referenced.add(id);
        }
        for (const [, attrs, body] of source.matchAll(/<i\b([^>]*)>([\s\S]*?)<\/i>/g)) {
            if (!/\b(?:ri-|fa-)/.test(attrs)) continue;
            assert.ok(/\bbh-icon\b/.test(attrs), `${file}: missing icon wrapper class`);
            assert.ok(body.includes('<svg') && body.includes('assets/icons/icons.svg'), `${file}: missing local SVG`);
            assert.ok(body.includes('aria-hidden="true"') && body.includes('focusable="false"'));
        }
    }
    assert.deepEqual([...referenced].sort(), [...ids].sort());
});

test('both entry points use local icon CSS without remote icon kits or fonts', () => {
    for (const file of ['index.html', 'tools/blackhole-qr/index.html']) {
        const source = read(file);
        assert.ok(source.includes('assets/css/icons.css?v=1.0.10'));
        assert.doesNotMatch(source, /https?:[^"'\s>]*(?:fontawesome|remixicon)/i);
    }
    assert.doesNotMatch(read('assets/css/icons.css'), /@font-face|!important|https?:/);
});
