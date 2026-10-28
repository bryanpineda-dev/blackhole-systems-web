const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function fixture(options = {}) {
    const observers = [], visibility = new Set(), media = new Set(), timers = new Map(), errors = [];
    let now = 0, nextTimer = 0;
    const motion = { matches: Boolean(options.reduced) };
    if (options.legacyMedia) {
        motion.addListener = callback => media.add(callback);
        motion.removeListener = callback => media.delete(callback);
    } else {
        motion.addEventListener = (_, callback) => media.add(callback);
        motion.removeEventListener = (_, callback) => media.delete(callback);
    }
    const makeNode = () => {
        const classes = new Set(), properties = new Map();
        return { children: [], dataset: {}, offsetWidth: 600, offsetHeight: 400,
            style: { setProperty: (key, value) => properties.set(key, value), getPropertyValue: key => properties.get(key) || '' },
            classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name),
                toggle(name, value) { if (value) classes.add(name); else classes.delete(name); } },
            getBoundingClientRect() { return { width: this.offsetWidth, height: this.offsetHeight }; },
            appendChild(child) { child.parent = this; this.children.push(child); },
            remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; }
        };
    };
    const star = makeNode(), comet = makeNode(), signal = makeNode();
    star.dataset.starCount = '3';
    const document = { hidden: false, createElement: makeNode,
        querySelectorAll: selector => selector.includes('star-field') ? [star] : selector.includes('comet-field') ? [comet] : [signal],
        addEventListener: (_, callback) => visibility.add(callback), removeEventListener: (_, callback) => visibility.delete(callback)
    };
    class Observer {
        constructor(callback, config) { this.callback = callback; this.config = config; observers.push(this); }
        observe(element) { this.element = element; }
        disconnect() { this.disconnected = true; }
    }
    const window = { BlackholeSystems: {}, innerWidth: 1200, innerHeight: 800, matchMedia: () => motion,
        setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
        clearTimeout: id => timers.delete(id)
    };
    if (!options.noObserver) window.IntersectionObserver = Observer;
    const math = Object.create(Math); math.random = () => 0.25;
    const context = vm.createContext({ window, document, IntersectionObserver: Observer, Math: math,
        console: { error: (...args) => errors.push(args) } });
    const load = name => vm.runInContext(read(`assets/js/modules/effects/${name}.js`), context);
    if (!options.noGate) load('visibility-gate');
    for (const name of ['star-field', 'comet-field', 'signal-field']) load(name);
    return { BH: window.BlackholeSystems, document, motion, visibility, media, observers, timers, star, comet, signal, makeNode, errors,
        visible(element, value) { observers.filter(observer => observer.element === element && !observer.disconnected)
            .forEach(observer => observer.callback([{ isIntersecting: value }])); },
        hidden(value) { document.hidden = value; [...visibility].forEach(callback => callback()); },
        reduced(value) { motion.matches = value; [...media].forEach(callback => callback()); },
        tick(duration) {
            const end = now + duration;
            for (let limit = 0; ; limit++) {
                if (limit > 10000) throw new Error('Unbounded timer loop');
                const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
                if (!next) break;
                now = next[1].at; timers.delete(next[0]); next[1].callback();
            }
            now = end;
        }
    };
}

test('legacy visibility margins and callback state remain compatible', () => {
    const f = fixture(), states = [];
    const gate = f.BH.Effects.createVisibilityGate(f.comet, active => states.push(active), '220px 0px');
    assert.equal(f.observers[0].config.rootMargin, '220px 0px');
    assert.equal(f.observers[0].config.threshold, 0.01);
    assert.deepEqual(states, [false]);
    f.visible(f.comet, true); f.hidden(true); f.hidden(false); f.visible(f.comet, false);
    assert.deepEqual(states, [false, true, false, true, false]);
    assert.equal(f.media.size, 0);
    gate.destroy(); assert.equal(f.visibility.size, 0);
});

test('motion policy is opt-in and shares subscriptions without notifying legacy gates', () => {
    const f = fixture(), modern = [], legacy = [];
    const a = f.BH.Effects.createVisibilityGate(f.star, active => modern.push(active), { rootMargin: '140px 0px', respectReducedMotion: true });
    const b = f.BH.Effects.createVisibilityGate(f.comet, active => legacy.push(active));
    assert.equal(f.visibility.size, 1); assert.equal(f.media.size, 1);
    f.visible(f.star, true); f.visible(f.comet, true);
    f.reduced(true); f.reduced(false);
    assert.deepEqual(modern, [false, true, false, true]);
    assert.deepEqual(legacy, [false, true]);
    assert.equal(f.observers[1].config.rootMargin, '160px 0px');
    a.destroy(); a.destroy(); assert.equal(f.media.size, 0); assert.equal(f.visibility.size, 1);
    const count = modern.length; f.observers[0].callback([{ isIntersecting: true }]); f.hidden(true);
    assert.equal(modern.length, count); assert.equal(legacy.at(-1), false);
    b.destroy(); assert.equal(f.visibility.size, 0);
});

test('multiple motion consumers release the last shared listener and can remount', () => {
    const f = fixture();
    const gates = [f.star, f.comet, f.signal].map(node => f.BH.Effects.createVisibilityGate(node, () => {}, { respectReducedMotion: true }));
    assert.equal(f.visibility.size, 1); assert.equal(f.media.size, 1);
    gates[0].destroy(); gates[1].destroy(); assert.equal(f.media.size, 1);
    gates[2].destroy(); assert.equal(f.media.size, 0); assert.equal(f.visibility.size, 0);
    const gate = f.BH.Effects.createVisibilityGate(f.star, () => {}, { respectReducedMotion: true });
    assert.equal(f.visibility.size, 1); assert.equal(f.media.size, 1); gate.destroy();
});

test('missing viewport observation and legacy media listeners preserve safe lifecycle', () => {
    const f = fixture({ noObserver: true, legacyMedia: true }), states = [];
    const gate = f.BH.Effects.createVisibilityGate(f.star, active => states.push(active), { respectReducedMotion: true });
    assert.deepEqual(states, [true]); f.reduced(true); f.reduced(false); f.hidden(true);
    assert.deepEqual(states, [true, false, true, false]);
    gate.destroy(); assert.equal(f.visibility.size, 0); assert.equal(f.media.size, 0);
});

test('failed initializers roll back subscriptions and one broken subscriber cannot stop others', () => {
    const f = fixture({ noObserver: true });
    assert.throws(() => f.BH.Effects.createVisibilityGate(f.star, () => { throw Error('initial failure'); }), /initial failure/);
    assert.equal(f.visibility.size, 0);
    let fail = false; const states = [];
    const a = f.BH.Effects.createVisibilityGate(f.star, () => { if (fail) throw Error('later failure'); });
    const b = f.BH.Effects.createVisibilityGate(f.comet, active => states.push(active));
    fail = true; f.hidden(true); assert.equal(states.at(-1), false); assert.equal(f.errors.length, 1);
    a.destroy(); b.destroy();
});

test('star instances preserve random parameters, avoid inline animation and own their cleanup', () => {
    const f = fixture(), sentinel = f.makeNode(); f.star.appendChild(sentinel);
    const instance = f.BH.Effects.createStarField(f.star);
    assert.equal(f.BH.Effects.createStarField(f.star), instance);
    f.BH.initStarField(); assert.equal(f.star.children.length, 4); assert.equal(f.observers.length, 1);
    const star = f.star.children[1];
    assert.equal(star.style.width, '1.125px'); assert.equal(star.style.left, '150px'); assert.equal(star.style.top, '100px');
    assert.equal(star.style.getPropertyValue('--tx'), '150px'); assert.equal(star.style.getPropertyValue('--ty'), '100px');
    assert.equal(star.style.getPropertyValue('--star-duration'), '3.25s');
    assert.equal(star.style.getPropertyValue('--star-delay'), '1.25s');
    assert.equal(star.style.animation, undefined); assert.equal(star.style.animationPlayState, undefined);
    assert.equal(f.star.classList.contains('is-star-field-paused'), true);
    f.visible(f.star, true); assert.equal(f.star.classList.contains('is-star-field-paused'), false);
    f.reduced(true); assert.equal(f.star.classList.contains('is-star-field-paused'), true);
    instance.destroy(); instance.destroy();
    assert.deepEqual(f.star.children, [sentinel]); assert.equal(f.star.dataset.starFieldReady, undefined);
    assert.equal(f.visibility.size, 0); assert.equal(f.media.size, 0);
    const remounted = f.BH.Effects.createStarField(f.star); assert.notEqual(remounted, instance); remounted.destroy();
});

test('viewport star coordinates retain the existing sizing mode', () => {
    const f = fixture(); f.star.dataset.starViewport = 'true';
    const instance = f.BH.Effects.createStarField(f.star), star = f.star.children[0];
    assert.equal(star.style.left, '300px'); assert.equal(star.style.top, '200px');
    assert.equal(star.style.getPropertyValue('--tx'), '300px'); instance.destroy();
});

test('comets stop spawning while existing lifetimes drain and destroy cancels all owned work', () => {
    const f = fixture(), instance = f.BH.Effects.createCometField(f.comet);
    assert.equal(f.BH.Effects.createCometField(f.comet), instance);
    f.BH.initCometField(); assert.equal(f.observers.length, 1);
    assert.equal(f.observers[0].config.rootMargin, '220px 0px');
    f.visible(f.comet, true); f.tick(3000); assert.ok(f.comet.children.length > 0 && f.comet.children.length <= 12);
    f.visible(f.comet, false); f.tick(5000); assert.equal(f.comet.children.length, 0); assert.equal(f.timers.size, 0);
    f.visible(f.comet, true); assert.ok(f.comet.children.length > 0);
    instance.destroy(); instance.destroy(); assert.equal(f.comet.children.length, 0); assert.equal(f.timers.size, 0);
    assert.equal(f.visibility.size, 0); assert.equal(f.media.size, 0); assert.equal(f.comet.dataset.cometFieldReady, undefined);
    const remounted = f.BH.Effects.createCometField(f.comet); assert.notEqual(remounted, instance); remounted.destroy();
});

test('live reduced motion can start and stop comet spawning and rapid churn respects the ceiling', () => {
    const f = fixture({ reduced: true }), instance = f.BH.Effects.createCometField(f.comet);
    f.visible(f.comet, true); f.tick(10000); assert.equal(f.timers.size, 0);
    f.reduced(false); assert.equal(f.comet.children.length, 1);
    for (let i = 0; i < 100; i++) { f.visible(f.comet, false); f.visible(f.comet, true); }
    assert.equal(f.comet.children.length, 12);
    f.reduced(true); f.tick(5000); assert.equal(f.timers.size, 0); assert.equal(f.comet.children.length, 0);
    instance.destroy();
});

test('signal lifecycle never generates or removes the authored particle markup', () => {
    const f = fixture(), particles = Array.from({ length: 8 }, f.makeNode);
    particles.forEach(node => f.signal.appendChild(node));
    const instance = f.BH.Effects.createSignalField(f.signal);
    assert.equal(f.BH.Effects.createSignalField(f.signal), instance); f.BH.initSignalField();
    assert.equal(f.observers.length, 1); assert.equal(f.signal.classList.contains('is-signal-field-paused'), true);
    f.visible(f.signal, true); assert.equal(f.signal.classList.contains('is-signal-field-paused'), false);
    f.hidden(true); assert.equal(f.signal.classList.contains('is-signal-field-paused'), true);
    instance.destroy(); assert.deepEqual(f.signal.children, particles); assert.equal(f.signal.dataset.signalFieldReady, undefined);
    assert.equal(f.visibility.size, 0); assert.equal(f.media.size, 0);
    const remounted = f.BH.Effects.createSignalField(f.signal); assert.notEqual(remounted, instance); remounted.destroy();
});

test('missing lifecycle dependency skips effects without allocating nodes or readiness markers', () => {
    const f = fixture({ noGate: true });
    for (const [name, node, marker] of [['Star', f.star, 'starFieldReady'], ['Comet', f.comet, 'cometFieldReady'], ['Signal', f.signal, 'signalFieldReady']]) {
        assert.equal(f.BH.Effects[`create${name}Field`](null), undefined);
        assert.equal(f.BH.Effects[`create${name}Field`](node), undefined);
        assert.equal(node.dataset[marker], undefined); assert.equal(node.children.length, 0);
    }
});

test('a failed gate leaves generated star nodes and comet timers retryable', () => {
    const f = fixture(), create = f.BH.Effects.createVisibilityGate;
    f.BH.Effects.createVisibilityGate = () => { throw Error('gate unavailable'); };
    assert.throws(() => f.BH.Effects.createStarField(f.star), /gate unavailable/);
    assert.throws(() => f.BH.Effects.createCometField(f.comet), /gate unavailable/);
    assert.equal(f.star.children.length, 0); assert.equal(f.star.dataset.starFieldReady, undefined);
    assert.equal(f.comet.dataset.cometFieldReady, undefined); assert.equal(f.timers.size, 0);
    f.BH.Effects.createVisibilityGate = create;
    f.BH.Effects.createStarField(f.star).destroy(); f.BH.Effects.createCometField(f.comet).destroy();
});

test('entry points order shared dependencies and keep landing-only effects out of QR', () => {
    for (const file of ['index.html', 'tools/blackhole-qr/index.html']) {
        const scripts = [...read(file).matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
        const gate = scripts.findIndex(src => src.includes('/effects/visibility-gate.js'));
        const stars = scripts.findIndex(src => src.includes('/effects/star-field.js'));
        assert.ok(gate >= 0 && gate < stars);
        if (file.includes('blackhole-qr')) for (const name of ['comet-field', 'signal-field', 'grid-pulse', 'hero-blackhole']) {
            assert.equal(scripts.some(src => src.includes(name)), false);
        }
    }
    assert.ok(read('assets/js/app.js').includes("'initSignalField'"));
    assert.match(read('assets/css/effects/star-field.css'), /animation: absorbStar var\(--star-duration/);
    assert.doesNotMatch(read('assets/js/modules/effects/star-field.js'), /style\.animation\s*=/);
});
