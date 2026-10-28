const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const folder = 'assets/fonts/outfit/';
const read = file => fs.readFileSync(path.join(root, file));
const text = file => read(file).toString('utf8');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(text(folder + 'manifest.json'));

test('local Outfit subsets retain verified provider bytes and the original license', () => {
    assert.equal(manifest.family, 'Outfit');
    assert.equal(manifest.providerRevision, 'v15');
    assert.deepEqual(manifest.files.map(file => file.subset), ['latin-ext', 'latin']);
    for (const item of manifest.files) {
        const bytes = read(folder + item.file);
        assert.equal(bytes.toString('ascii', 0, 4), 'wOF2');
        assert.equal(bytes.readUInt32BE(8), bytes.length);
        assert.equal(bytes.length, item.bytes);
        assert.equal(hash(bytes), item.sha256);
        assert.match(item.file, new RegExp(`-${item.sha256.slice(0, 12)}\\.woff2$`));
        assert.match(item.url, /^https:\/\/fonts\.gstatic\.com\/s\/outfit\/v15\//);
    }
    const latin = manifest.files.find(file => file.subset === 'latin');
    assert.equal(latin.sha256, '6c18d579fd87c3776be068b762cbc83fde3acb543d49eabd3ade842eb987e887');
    assert.equal(latin.bytes, 32292);
    assert.equal(manifest.license.spdx, 'OFL-1.1');
    assert.equal(hash(read(folder + manifest.license.file)), manifest.license.sha256);
    assert.match(text(folder + manifest.license.file), /Copyright 2021 The Outfit Project Authors/);
    assert.match(text(folder + manifest.license.file), /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.ok(manifest.license.url.includes(manifest.upstream.commit));
});

test('shared font faces preserve variable weight, swap and both original Unicode ranges', () => {
    const css = text('assets/css/fonts.css');
    const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => Object.fromEntries(match[1].trim().split(';').filter(value => value.trim()).map(value => {
        const colon = value.indexOf(':'); return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
    })));
    assert.equal(faces.length, 2);
    for (const [index, face] of faces.entries()) {
        const item = manifest.files[index];
        assert.deepEqual(Object.keys(face).sort(), ['font-display', 'font-family', 'font-style', 'font-weight', 'src', 'unicode-range']);
        assert.equal(face['font-family'], "'Outfit'");
        assert.equal(face['font-style'], 'normal');
        assert.equal(face['font-weight'], '100 900');
        assert.equal(face['font-display'], 'swap');
        assert.equal(face['unicode-range'], item.unicodeRange);
        assert.equal(face.src, `url('../fonts/outfit/${item.file}') format('woff2')`);
        const mounted = new URL(`../fonts/outfit/${item.file}`, 'https://blackhole.test/project/assets/css/fonts.css');
        assert.equal(mounted.pathname, `/project/${folder}${item.file}`);
    }
    assert.doesNotMatch(css, /https?:|local\(|!important|size-adjust|override|font-synthesis/);
    assert.equal(css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]+\}/g, '').trim(), '');
});

test('both page entries replace the provider in place without adding font preloads', () => {
    let revision;
    for (const file of ['index.html', 'tools/blackhole-qr/index.html']) {
        const html = text(file);
        assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
        const links = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]);
        const fonts = links.filter(link => /\/fonts\.css\?v=/.test(link));
        assert.equal(fonts.length, 1);
        assert.match(fonts[0], /rel="stylesheet"/);
        const url = new URL(fonts[0].match(/href="([^"]+)"/)[1], `https://blackhole.test/${file}`);
        assert.equal(url.pathname, '/assets/css/fonts.css');
        assert.match(url.search, /^\?v=\d+\.\d+\.\d+$/);
        if (revision) assert.equal(url.search, revision);
        revision = url.search;
        assert.ok(html.indexOf(fonts[0]) < html.indexOf('/icons.css'));
        assert.equal(links.some(link => /as="font"/.test(link)), false);
    }
    assert.match(text('assets/css/variables.css'), /--font-display: 'Outfit', sans-serif/);
    assert.match(text('assets/css/variables.css'), /--font-body: 'Outfit', sans-serif/);
});
