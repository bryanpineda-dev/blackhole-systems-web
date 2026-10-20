const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function setup() {
    const context = vm.createContext({ window: {}, URL });
    for (const file of ['projects-data', 'assistant/assistant-data', 'assistant/assistant-router', 'assistant/assistant-session', 'assistant/assistant-handoff']) {
        vm.runInContext(read('assets/js/modules/' + file + '.js'), context);
    }
    const { BlackholeSystems: BH, BlackholeSystemsProjects: { projects } } = context.window;
    const data = BH.assistantData;
    const router = BH.Assistant.createRouter(data.serviceCatalog, projects);
    const session = BH.Assistant.createSession(data.limits);
    const handoff = BH.Assistant.createHandoff({ ...data, router, session, projects });
    return { BH, data, router, session, handoff, projects };
}
const draft = response => new URL(response.whatsappUrl).searchParams.get('text');

test('assistant separates domains and intent, respects negation and avoids substring false positives', () => {
    const { router } = setup();
    const cases = [
        ['No necesito reservas, quiero una tienda', 'ecommerce', null],
        ["I do not need booking, I want a store", 'ecommerce', null],
        ['Tengo un error 500 en mi tienda', 'ecommerce', 'support'],
        ['Please restore my backup', null, 'support'],
        ['Can you make this?', null, null],
        ['Here is my description', null, null],
        ['I want a booking website', 'booking', null],
        ['Quiero una tienda, cuanto cuesta?', 'ecommerce', 'budget'],
        ['Y cuanto tarda?', null, 'timeline'],
        ['Quiero una tienda con pedidos por WhatsApp', 'ecommerce', null],
        ['I need a website contact form', 'website', null],
        ['I need an Instagram integration', 'integrations', null],
        ['I need a website, how can I contact you?', 'website', 'contact'],
        ['WhatsApp', null, 'contact'],
        ['connect make.com', 'integrations', null],
        ['connect makeXcom', null, null]
    ];
    for (const [message, serviceId, intent] of cases) {
        const actual = router.analyze(message);
        assert.equal(actual.serviceId, serviceId, message);
        assert.equal(actual.intent, intent, message);
    }
    assert.equal(router.detectService('zxqvzz').id, 'fallback');
});

test('assistant covers all nine current service headings without duplicate keyword weighting', () => {
    const { router, data } = setup();
    const headings = [...read('index.html').matchAll(/<h3>(.*?)<\/h3>/g)].map(match => match[1].replace(/&amp;/g, '&'));
    assert.equal(headings.length, 9);
    for (const heading of headings) assert.ok(router.analyze(heading).serviceId, heading);
    const before = router.detectService('website').id;
    data.serviceCatalog.website.keywords.push('website', 'WEBSITE');
    assert.equal(router.detectService('website').id, before);
    assert.equal(router.analyze('I want a store and dashboard').serviceId, null);
});

test('assistant retains context across price, timing and contact chips and clears it only on restart', () => {
    const { handoff, session } = setup();
    const brief = 'Quiero una tienda con inventario y cuentas para mis clientes.';
    handoff.buildResponse(brief);
    assert.match(handoff.buildResponse('Los clientes deben descargar facturas').html, /Esos detalles ya forman parte/);
    const price = handoff.buildResponse('Cuanto cuesta?');
    assert.equal(price.language, 'es');
    assert.match(price.html, /Cotizaci\u00f3n: Tienda/);
    const timing = handoff.buildResponse('Y cuanto tarda?');
    assert.match(timing.html, /Plazo: Tienda/);
    const contact = handoff.buildResponse('Contacto', 'contact');
    for (const detail of [brief, 'Cuanto cuesta?', 'Y cuanto tarda?']) assert.ok(draft(contact).includes(detail));
    assert.ok(contact.html.includes('href="#contact"'));
    assert.equal(session.snapshot().serviceId, 'ecommerce');
    handoff.buildResponse('Gracias');
    assert.equal(session.snapshot().serviceId, 'ecommerce');
    handoff.buildResponse('Please respond in English');
    assert.equal(session.snapshot().language, 'en');
    const reset = handoff.buildResponse('Start over', 'restart');
    assert.equal(reset.reset, true);
    assert.equal(session.snapshot().serviceId, null);
    assert.equal(session.snapshot().details.length, 0);
    assert.equal(draft(reset).includes(brief), false);
});

test('assistant uses Spanish for a first-message contact, quote or maintenance request', () => {
    for (const message of ['Contacto', 'Precio', 'Mantenimiento', 'Correo']) {
        assert.equal(setup().handoff.buildResponse(message).language, 'es', message);
    }
});

test('assistant remembers ambiguous needs and can resolve the pending choice', () => {
    const { handoff, session } = setup();
    const first = handoff.buildResponse('I want a store and dashboard');
    assert.match(first.html, /main need/);
    assert.equal(session.snapshot().pending.length, 2);
    assert.match(handoff.buildResponse('Not sure yet').html, /main need/);
    handoff.buildResponse('the first one');
    assert.equal(session.snapshot().serviceId, 'dashboard');
    assert.equal(session.snapshot().pending.length, 0);
});

test('assistant reads every project name, code and domain from the public archive', () => {
    const { handoff, router, projects } = setup();
    for (const project of projects) {
        for (const query of [project.name, project.id, new URL(project.url).hostname]) {
            assert.equal(router.analyze(query).project?.id, project.id, query);
        }
        const response = handoff.buildResponse(project.name);
        assert.ok(response.html.includes(project.id));
        assert.ok(response.html.includes(project.status));
        const contact = handoff.buildResponse('Contact', 'contact');
        assert.ok(draft(contact).includes(project.name));
    }
    const fresh = setup();
    assert.match(fresh.handoff.buildResponse('Projects', 'projects').html, /17 projects/);
    assert.equal(fresh.router.analyze('My Choice').project, null);
});

test('assistant preserves an ambiguous public reference until the visitor resolves it', () => {
    const { handoff, session } = setup();
    assert.match(handoff.buildResponse('SEBANA or ALAI Boutique').html, /main need/);
    assert.equal(session.snapshot().pendingProjects.length, 2);
    handoff.buildResponse('the second one');
    assert.equal(session.snapshot().project.id, 'BH-002');
    assert.equal(session.snapshot().pendingProjects.length, 0);
});

test('assistant bounds memory without truncation, rejects atomically, and still permits contact or reset', () => {
    const { handoff, session, data } = setup();
    const long = 'Need a website. ' + 'x'.repeat(1800) + ' IMPORTANT TAIL';
    assert.ok(draft(handoff.buildResponse(long)).includes('IMPORTANT TAIL'));
    const before = JSON.stringify(session.snapshot());
    assert.throws(() => handoff.buildResponse('x'.repeat(data.limits.message + 1)), /exceeds/);
    assert.equal(JSON.stringify(session.snapshot()), before);
    for (let i = 0; i < 3; i++) {
        try { handoff.buildResponse(String(i) + 'y'.repeat(1900)); } catch (error) { assert.match(error.message, /limit/); }
    }
    assert.ok(session.snapshot().details.join('\n').length <= data.limits.context);
    assert.ok(draft(handoff.buildResponse('Contact', 'contact')).includes('IMPORTANT TAIL'));
    handoff.buildResponse('Start over', 'restart');
    assert.equal(session.snapshot().details.length, 0);
});

test('assistant escapes visitor input and never invents a numeric price or delivery commitment', () => {
    const { handoff } = setup();
    const response = handoff.buildResponse('<img src=x onerror="alert(1)"> I want a website');
    assert.equal(response.html.includes('<img'), false);
    assert.ok(draft(response).includes('<img src=x'));
    assert.match(handoff.buildResponse('How much?').html, /before quoting/);
    assert.match(handoff.buildResponse('How long?').html, /cannot promise/);
});
