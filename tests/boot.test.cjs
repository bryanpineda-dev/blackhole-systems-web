const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
const names = [...source.matchAll(/^        '(init\w+)'[,]?$/gm)].map((match) => match[1]);

function createRuntime() {
    const calls = [], errors = [], events = [];
    const bodyClasses = new Set(['is-loading']);
    const cursorClasses = new Set(['has-custom-cursor', 'cursor-ready']);
    let loader = { remove() { loader = null; } };
    const BH = Object.fromEntries(names.map((name) => [name, () => calls.push(name)]));
    const context = vm.createContext({
        window: { BlackholeSystems: BH }, console: { error: (...args) => errors.push(args) },
        CustomEvent: class { constructor(type) { this.type = type; } },
        document: {
            readyState: 'complete', getElementById: () => loader,
            dispatchEvent: (event) => events.push(event.type),
            body: { classList: { remove: (...items) => items.forEach((item) => bodyClasses.delete(item)) } },
            documentElement: { classList: { remove: (...items) => items.forEach((item) => cursorClasses.delete(item)) } }
        }
    });
    return { BH, calls, errors, events, bodyClasses, cursorClasses, getLoader: () => loader,
        boot: () => vm.runInContext(source, context) };
}

test('landing starts all registered initializers exactly once', () => {
    const runtime = createRuntime();
    runtime.boot();
    runtime.boot();
    assert.deepEqual(runtime.calls, names);
    assert.equal(runtime.errors.length, 0);
});

test('a failed initializer is reported without blocking forms, navigation or cursor', () => {
    const runtime = createRuntime();
    runtime.BH.initProjectFilter = () => { throw new Error('Injected project failure'); };
    runtime.boot();
    for (const name of ['initFormHandler', 'initHeaderMobileNav', 'initCustomCursor']) assert.ok(runtime.calls.includes(name));
    assert.equal(runtime.errors.length, 1);
    assert.match(runtime.errors[0][0], /initProjectFilter/);
    assert.equal(runtime.BH.appBootState.initialized.has('initProjectFilter'), false);
    runtime.BH.initProjectFilter = () => runtime.calls.push('recovered');
    runtime.boot();
    assert.equal(runtime.calls.filter((name) => name === 'recovered').length, 1);
    assert.equal(runtime.calls.filter((name) => name === 'initFormHandler').length, 1);
});

for (const mode of ['missing', 'throwing']) {
    test(`${mode} loader releases the landing overlay and completes the loader contract`, () => {
        const runtime = createRuntime();
        if (mode === 'missing') delete runtime.BH.initPageLoader;
        else runtime.BH.initPageLoader = () => { throw new Error('Injected loader failure'); };
        runtime.boot();
        assert.equal(runtime.getLoader(), null);
        assert.equal(runtime.bodyClasses.has('is-loading'), false);
        assert.deepEqual(runtime.events, ['blackhole:loader-complete']);
        assert.ok(runtime.calls.includes('initScrollReveal'));
        assert.ok(runtime.calls.includes('initFormHandler'));
    });
}

test('cursor failure restores the native cursor without undoing other modules', () => {
    const runtime = createRuntime();
    runtime.BH.initCustomCursor = () => { throw new Error('Injected cursor failure'); };
    runtime.boot();
    assert.equal(runtime.cursorClasses.size, 0);
    assert.ok(runtime.calls.includes('initFormHandler'));
});
