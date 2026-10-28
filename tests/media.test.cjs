const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require('sharp');
const { test } = require('node:test');
const { check, recipe, renderRuntime } = require('../scripts/build-media.cjs');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const manifest = JSON.parse(read('assets/images/generated/manifest.json'));
function load(files) {
    const context = vm.createContext({ window: {} });
    files.forEach(file => vm.runInContext(read(file).toString('utf8'), context));
    return context.window.BlackholeSystemsProjects;
}

test('generated media matches pinned recipes, source hashes, dimensions and runtime data', async () => {
    await check();
    assert.equal(JSON.parse(read('package.json')).devDependencies.sharp, manifest.encoder.sharp);
    assert.equal(read('assets/js/modules/projects-media.js').toString('utf8').replace(/\r\n/g, '\n'), renderRuntime(manifest.projects));
    const expected = new Set(manifest.assets.map(asset => asset.src));
    const walk = directory => fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => entry.isDirectory()
        ? walk(path.posix.join(directory, entry.name)) : [path.posix.join(directory, entry.name)]);
    assert.deepEqual(walk('assets/images/generated').filter(file => file !== 'assets/images/generated/manifest.json').sort(), [...expected].sort());
});

test('hero recompression is pixel-exact and generated images preserve source aspect', async () => {
    const hero = manifest.assets.find(asset => asset.src.endsWith('/blackhole-fallback.png'));
    const source = manifest.sources.find(source => source.src === hero.source);
    assert.equal(source.width, 1324); assert.equal(source.height, 611);
    assert.ok(hero.bytes < source.bytes);
    assert.ok((await sharp(read(hero.source)).ensureAlpha().raw().toBuffer()).equals(await sharp(read(hero.src)).ensureAlpha().raw().toBuffer()));
    for (const asset of manifest.assets) {
        const source = manifest.sources.find(source => source.src === asset.source);
        assert.equal(asset.width * source.height, asset.height * source.width, asset.src);
        assert.ok(asset.width <= source.width && asset.bytes < source.bytes, asset.src);
    }
});

test('brand PNG variants preserve exact resized RGBA values without palette quantization', async () => {
    for (const asset of manifest.assets.filter(asset => /\/(logo|favicon)-/.test(asset.src))) {
        const expected = await sharp(read(asset.source)).resize({ width: asset.width, height: asset.height, withoutEnlargement: true, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer();
        const actual = await sharp(read(asset.src)).ensureAlpha().raw().toBuffer();
        assert.ok(expected.equals(actual), asset.src);
    }
});

test('preview candidates meet byte and quality gates while masters remain the modal source', async () => {
    const data = load(['assets/js/modules/projects-data.js', 'assets/js/modules/projects-media.js', 'assets/js/modules/projects-render.js']);
    for (const project of data.projects) {
        const preview = project.preview, candidates = manifest.projects[preview.src] || [];
        const card = data.renderProjectPreview(project), modal = data.renderProjectPreview(project, 'eager');
        assert.ok(card.includes(`src="${preview.src}"`));
        assert.ok(modal.includes(`src="${preview.src}"`));
        assert.equal(modal.includes('srcset='), false, 'modal keeps the reviewed original at all densities');
        assert.equal(card.includes('srcset='), candidates.length > 0);
        if (candidates.length) {
            assert.ok(card.includes(`sizes="${data.previewMedia.cardSizes}"`));
            assert.ok(card.includes(`${preview.src} ${preview.width}w`));
        }
        for (const candidate of candidates) {
            const asset = manifest.assets.find(asset => asset.src === candidate.src);
            const source = manifest.sources.find(source => source.src === preview.src);
            assert.ok(asset.bytes <= source.bytes * (1 - recipe.minimumSaving));
            const reference = await sharp(read(preview.src)).resize({ width: candidate.width, height: candidate.height, withoutEnlargement: true, kernel: 'lanczos3', fastShrinkOnLoad: false }).raw().toBuffer();
            const actual = await sharp(read(candidate.src)).raw().toBuffer();
            const comparison = require('../scripts/build-media.cjs').quality(reference, actual);
            assert.ok(comparison.psnr >= recipe.minimumPsnr && comparison.meanError <= recipe.maximumMeanError, candidate.src);
        }
    }
    assert.equal(data.renderProjectPreview({ ...data.projects[0], preview: undefined }).includes('<img'), false);
    const withoutMedia = load(['assets/js/modules/projects-data.js', 'assets/js/modules/projects-render.js']);
    assert.equal(withoutMedia.renderProjectPreview(withoutMedia.projects[0]).includes('srcset='), false);
});

test('HTML candidates and preloads resolve with matching logo selection and corrected hero metadata', () => {
    for (const file of ['index.html', 'tools/blackhole-qr/index.html']) {
        const html = read(file).toString('utf8');
        const tags = [...html.matchAll(/<(?:link|img)\b[^>]*\b(?:srcset|imagesrcset)="([^"]+)"[^>]*>/g)];
        assert.ok(tags.length >= 2);
        const selections = tags.map(match => ({ sources: match[1], sizes: match[0].match(/\b(?:sizes|imagesizes)="([^"]+)"/)[1] }));
        selections.forEach(selection => assert.equal(selection.sizes, '280px'));
        for (const selection of selections) for (const candidate of selection.sources.split(',')) {
            const [src, width] = candidate.trim().split(/\s+/);
            const url = new URL(src, `https://blackhole.test/${file}`), relative = url.pathname.slice(1);
            assert.ok(fs.existsSync(path.join(root, relative)), relative);
            const asset = manifest.assets.find(asset => asset.src === relative) || manifest.sources.find(asset => asset.src === relative);
            assert.equal(width, `${asset.width}w`);
        }
    }
    const html = read('index.html').toString('utf8');
    assert.match(html, /og:image:width" content="1324"/); assert.match(html, /og:image:height" content="611"/);
    assert.match(html, /class="hero-fallback-image"[^>]*width="1324" height="611"/);
    assert.ok(html.indexOf('projects-media.js') < html.indexOf('projects-render.js'));
    const icons = JSON.parse(read('site.webmanifest')).icons;
    for (const icon of icons) assert.ok(fs.existsSync(path.join(root, icon.src)));
    assert.ok(icons.some(icon => icon.sizes === '192x192'));
    assert.ok(icons.some(icon => icon.sizes === '900x900'), 'retain the high-resolution original manifest icon');
});
