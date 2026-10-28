const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/modules/effects/grid-pulse.js'), 'utf8');

function fixture(options = {}) {
    let now = 0, nextId = 0, visibility, resize, border = '1px', random = options.random || (() => 0);
    const timers = new Map(), listeners = new Map(), observers = [];
    const setTimeout = (callback, delay) => { const id = ++nextId; timers.set(id, { at: now + delay, callback }); return id; };
    function tick(duration) {
        const end = now + duration;
        for (let limit = 0; ; limit++) {
            if (limit > 100000) throw new Error('Unbounded timer loop');
            const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
            if (!next) break;
            now = next[1].at; timers.delete(next[0]); next[1].callback();
        }
        now = end;
    }
    function element(fragment = false) {
        const classes = new Set(), properties = new Map();
        const node = { fragment, children: [], dataset: {}, style: { setProperty: (name, value) => properties.set(name, value), properties },
            classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
            appendChild(child) {
                if (child.fragment) { for (const item of [...child.children]) this.appendChild(item); return; }
                child.remove(); child.parent = this; this.children.push(child);
            },
            remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
            getBoundingClientRect() { return { width: this.offsetWidth, height: this.offsetHeight }; }
        };
        Object.defineProperty(node, 'className', { get: () => [...classes].join(' '), set: value => { classes.clear(); value.split(/\s+/).filter(Boolean).forEach(name => classes.add(name)); } });
        Object.defineProperty(node, 'innerHTML', { set: () => { node.children.forEach(child => { child.parent = null; }); node.children = []; } });
        return node;
    }
    const grid = element(); grid.offsetWidth = 1112; grid.offsetHeight = 400;
    const motion = { matches: options.reduced || false, addEventListener: (_, callback) => { motion.change = callback; } };
    const BH = { Effects: options.noGate ? {} : { createVisibilityGate: (_, callback) => { visibility = callback; callback(false); } } };
    const window = { BlackholeSystems: BH, devicePixelRatio: 1,
        CSS: { supports: () => options.mask !== false },
        ResizeObserver: options.noResize ? undefined : class { constructor(callback) { resize = callback; observers.push(this); } observe() {} },
        matchMedia: () => motion,
        setTimeout, clearTimeout: id => timers.delete(id),
        requestAnimationFrame: callback => setTimeout(callback, 16),
        addEventListener: (name, callback) => listeners.set(name, callback)
    };
    const math = Object.create(Math); math.random = () => random();
    vm.runInNewContext(source, { window, document: { getElementById: () => grid, createElement: () => element(), createDocumentFragment: () => element(true) },
        Math: math, getComputedStyle: () => ({ height: '40px', borderLeftWidth: border, transitionDuration: '1.5s, 1.5s', backgroundColor: 'rgba(0, 0, 0, 0)' }) });
    return { grid, BH, timers, tick, observers, motion, setRandom: fn => { random = fn; },
        visible: value => visibility(value), resize: (width, height) => { grid.offsetWidth = width; grid.offsetHeight = height; resize?.(); listeners.get('resize')?.(); },
        reduced: value => { motion.matches = value; motion.change?.(); },
        ratio: (value, width) => { window.devicePixelRatio = value; border = width; listeners.get('resize')?.(); } };
}

test('static grid has no cell matrix, uses actual fitting columns and initializes once', () => {
    const f = fixture({ reduced: true }); f.BH.initGridPulse();
    assert.equal(f.grid.children.length, 0);
    assert.equal(f.grid.classList.contains('is-sparse-grid'), true);
    assert.equal(f.grid.style.properties.get('--grid-lines-width'), '1080px');
    assert.equal(f.observers.length, 1);
    f.BH.initGridPulse(); assert.equal(f.observers.length, 1); assert.equal(f.timers.size, 0);
});

test('pulses retain hold/fade lifetimes, reuse cells and drain timers when hidden', () => {
    const f = fixture(); f.BH.initGridPulse(); f.visible(true);
    const first = f.grid.children[0]; assert.equal(first.classList.contains('active'), true);
    f.visible(false); f.tick(499); assert.equal(first.classList.contains('active'), true);
    f.tick(1); assert.equal(first.classList.contains('active'), false);
    f.tick(1534); assert.equal(f.timers.size, 0);
    f.visible(true); assert.equal(f.grid.children.length, 1); assert.equal(f.grid.children[0], first);
    f.visible(false); f.tick(3000); assert.equal(f.timers.size, 0);
});

test('live layout changes reposition logical cells without building rows', () => {
    const values = [0, 28 / 280, 0, 0];
    const f = fixture({ random: () => values.shift() ?? 0 });
    f.BH.initGridPulse(); f.visible(true);
    const cell = f.grid.children[0]; assert.equal(cell.style.left, '40px'); assert.equal(cell.style.top, '40px');
    f.resize(390, 4000); f.tick(16);
    assert.equal(cell.style.left, '40px'); assert.equal(cell.style.top, '120px');
    assert.equal(f.grid.style.properties.get('--grid-lines-width'), '360px');
    assert.equal(f.grid.children.length, 1);
    f.visible(false); f.tick(5000); assert.equal(f.timers.size, 0);
});

test('long-running pulses and repeated visibility changes cannot exceed the pool ceiling', () => {
    let seed = 17;
    const f = fixture({ random: () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) });
    f.grid.offsetHeight = 1000000; f.BH.initGridPulse(); f.visible(true); f.tick(120000);
    assert.ok(f.grid.children.length > 0 && f.grid.children.length <= 128);
    for (let i = 0; i < 500; i++) { f.visible(false); f.visible(true); }
    assert.ok(f.grid.children.length <= 128);
    f.visible(false); f.tick(6000); assert.equal(f.timers.size, 0);
});

test('a fading cell is not recycled into a different position before its fade completes', () => {
    const f = fixture(); f.BH.initGridPulse(); f.visible(true); f.visible(false); f.tick(1000);
    const first = f.grid.children[0], values = [0, 0.5, 0, 0]; f.setRandom(() => values.shift() ?? 0);
    f.visible(true); f.visible(false);
    assert.equal(f.grid.children.length, 2); assert.equal(first.style.top, '0px');
    f.tick(5000); assert.equal(f.timers.size, 0);
});

test('overlapping holds keep the original independent removal semantics', () => {
    const f = fixture(); f.BH.initGridPulse(); f.visible(true); f.tick(150); f.visible(false);
    assert.equal(f.grid.children.length, 1); f.tick(350);
    assert.equal(f.grid.children[0].classList.contains('active'), false);
    f.tick(4000); assert.equal(f.timers.size, 0);
});

test('reduced-motion changes stop work, preserve static lines and safely resume', () => {
    const f = fixture({ reduced: true }); f.BH.initGridPulse(); f.visible(true);
    assert.equal(f.grid.children.length, 0); assert.equal(f.timers.size, 0);
    f.reduced(false); assert.equal(f.grid.children.length, 1);
    f.reduced(true); assert.equal(f.grid.children.length, 0); assert.equal(f.timers.size, 0);
    f.tick(5000); assert.equal(f.grid.children.length, 0);
    f.reduced(false); assert.equal(f.grid.children.length, 1);
});

test('missing optional rendering APIs retain the original native-cell fallback', () => {
    for (const options of [{ mask: false }, { noResize: true }]) {
        const f = fixture({ ...options, reduced: true }); f.BH.initGridPulse();
        assert.equal(f.grid.classList.contains('is-sparse-grid'), false);
        assert.equal(f.grid.children.length, 280); assert.equal(f.timers.size, 0);
    }
    const f = fixture({ noGate: true }); f.BH.initGridPulse(); assert.equal(f.grid.children.length, 0); assert.equal(f.timers.size, 0);
});

test('a cancelled native fade cannot release a cell that has been reactivated', async () => {
    const f = fixture(); f.BH.initGridPulse(); f.visible(true); f.visible(false);
    const cell = f.grid.children[0]; let resolve;
    const finished = new Promise(done => { resolve = done; });
    cell.getAnimations = () => [{ transitionProperty: 'background-color', finished }];
    f.tick(500);
    f.visible(true); f.visible(false); cell.getAnimations = () => [];
    resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    f.tick(500);
    const values = [0, 0.5, 0, 0]; f.setRandom(() => values.shift() ?? 0);
    f.visible(true); f.visible(false);
    assert.equal(f.grid.children.length, 2);
    f.tick(5000); assert.equal(f.timers.size, 0);
});

test('device-ratio changes resample effective borders without retaining a probe cell', () => {
    const f = fixture({ reduced: true }); f.BH.initGridPulse();
    f.ratio(2, '2px'); f.tick(16);
    assert.equal(f.grid.style.properties.get('--grid-line-width'), '2px');
    assert.equal(f.grid.style.properties.get('--grid-edge-aa'), '0px');
    assert.equal(f.grid.children.length, 0);
    f.ratio(1.25, '0.8px'); f.tick(16);
    assert.equal(f.grid.style.properties.get('--grid-line-width'), '0.8px');
    assert.equal(f.grid.style.properties.get('--grid-edge-aa'), '0.4px');
    assert.equal(f.grid.children.length, 0);
});

test('shrinking an archive preserves the original virtual flash distribution', () => {
    const values = [0, 0.9, 0, 0];
    const f = fixture({ random: () => values.shift() ?? 0 });
    f.BH.initGridPulse(); f.resize(1112, 120); f.tick(16); f.visible(true); f.visible(false);
    // The original 280-cell sampling domain selects index 252, still clipped below the short archive.
    const cell = f.grid.children[0];
    assert.equal(cell.style.left, '360px'); assert.equal(cell.style.top, '360px');
    assert.equal(f.grid.children.length, 1);
    f.tick(5000); assert.equal(f.timers.size, 0);
});

test('current reduced motion is authoritative even before its change notification arrives', () => {
    const f = fixture(); f.BH.initGridPulse(); f.visible(true);
    f.motion.matches = true; f.tick(100);
    assert.equal(f.grid.children.length, 0); assert.equal(f.timers.size, 0);

    const resumed = fixture(); resumed.BH.initGridPulse(); resumed.visible(true); resumed.visible(false);
    resumed.motion.matches = true; resumed.visible(true);
    assert.equal(resumed.grid.children.length, 0); assert.equal(resumed.timers.size, 0);
});
