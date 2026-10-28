const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const imports = file => [...read(file).matchAll(/@import\s+['"]([^'"]+)['"]/g)].map(match => match[1]);

test('both HTML entries load the same common layer before their page styles', () => {
    const version = JSON.parse(read('package.json')).version;
    for (const file of ['index.html', 'tools/blackhole-qr/index.html']) {
        const links = [...read(file).matchAll(/<link\b[^>]*\bhref="([^"]+\.css(?:\?[^"#]*)?)"/g)]
            .map(match => new URL(match[1], `https://blackhole.test/${file}`));
        const local = links.filter(url => url.origin === 'https://blackhole.test');
        const names = local.map(url => path.posix.basename(url.pathname));
        assert.deepEqual(names, file === 'index.html'
            ? ['icons.css', 'shared.css', 'style.css']
            : ['icons.css', 'shared.css', 'responsive-shared.css', 'qr-studio.css']);
        assert.equal(local.find(url => url.pathname.endsWith('/shared.css')).search, `?v=${version}`);
        assert.equal(/onload=|media="print"/.test(read(file)), false);
    }
});

test('common and landing manifests keep their ownership and import order explicit', () => {
    assert.deepEqual(imports('assets/css/shared.css').map(file => file.split('?')[0]), [
        'variables.css', 'base.css', 'utilities.css', 'components.css', 'animations.css', 'effects/star-field.css'
    ]);
    assert.deepEqual(imports('assets/css/style.css').map(file => file.split('?')[0]), [
        'sections.css', 'responsive-shared.css', 'responsive.css'
    ]);
    const version = JSON.parse(read('package.json')).version;
    for (const file of imports('assets/css/style.css')) assert.ok(file.endsWith(`?v=${version}`));
    assert.ok(imports('assets/css/sections.css').includes(`sections/hero.css?v=${version}`));
});

test('shared star pause and mobile reveals remain independent from the landing hero', () => {
    const stars = read('assets/css/effects/star-field.css');
    const hero = read('assets/css/sections/hero.css');
    const responsive = read('assets/css/responsive-shared.css');
    assert.ok(stars.includes('.star-field.is-star-field-paused .star'));
    assert.equal(stars.includes('.hero-section'), false);
    assert.match(hero, /\.hero-section\.is-webgpu-ready \.star-field \.star/);
    assert.doesNotMatch(hero, /^\.star(?:-field)?\s*\{/m);
    for (const name of ['fade-left', 'fade-right']) assert.ok(responsive.includes(`[data-reveal="${name}"]`));
    assert.ok(responsive.includes('transform: translate3d(0, var(--motion-distance-sm), 0)'));
    assert.doesNotMatch(responsive, /\.hero-title|\.mobile-command|\.dossier-card|\.btn-morph/);
});
