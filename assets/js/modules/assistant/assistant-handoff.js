/** Local guided responses and a reviewable, lossless WhatsApp handoff. */
(function (BH) {
    'use strict';
    const Assistant = BH.Assistant = BH.Assistant || {};
    const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

    Assistant.createHandoff = function createHandoff(options) {
        const { links, serviceCatalog: catalog, router, defaultQuickActions, fallbackQuickActions, defaultWhatsAppText, projects = [] } = options;
        const session = options.session || Assistant.createSession(options.limits);
        const local = (item, language, key) => language === 'es' ? item.es?.[key] || item[key] : item[key];
        const link = (href, label) => '<a href="' + escape(href) + '"' + (href.startsWith('https:') ? ' target="_blank" rel="noopener"' : '') + '>' + escape(label) + '</a>';

        function buildWhatsAppUrl(service, userMessage, state) {
            const language = state?.language || 'en';
            const es = language === 'es';
            const lines = [es ? 'Hola Bryan, quiero conversar sobre un proyecto para Blackhole Systems.' : defaultWhatsAppText];
            if (service) lines.push((es ? 'Servicio' : 'Service') + ': ' + local(service, language, 'label'));
            if (state?.project) lines.push((es ? 'Referencia p\u00fablica' : 'Public reference') + ': ' + state.project.name + ' (' + state.project.id + ')');
            const intents = (state?.intents || []).filter(id => !['restart', 'contact'].includes(id));
            if (intents.length) lines.push((es ? 'Consultas' : 'Questions') + ': ' + intents.map(id => local(catalog[id], language, 'label')).join(', '));
            const context = state ? state.details.join('\n') : userMessage;
            if (context) lines.push((es ? 'Contexto' : 'Context') + ':\n' + context);
            lines.push('https://blackholesys.com/');
            return links.whatsapp + '?text=' + encodeURIComponent(lines.join('\n\n'));
        }

        function buildResponse(message, explicitService) {
            const analysis = router.analyze(message, explicitService, session.snapshot());
            const state = session.prepare(message, analysis);
            const es = state.language === 'es';
            const service = catalog[state.serviceId];
            const text = (en, spanish) => es ? spanish : en;
            const label = service ? local(service, state.language, 'label') : text('your project', 'tu proyecto');
            const parts = [];
            let actions = service?.related || defaultQuickActions;
            const say = value => parts.push('<p>' + escape(value) + '</p>');
            const title = value => parts.push('<strong>' + escape(value) + '</strong>');

            if (analysis.intent === 'restart') {
                say(text('New conversation. What would you like to build or improve?', 'Nueva conversaci\u00f3n. Que necesitas construir o mejorar?'));
            } else if (analysis.greeting) {
                say(text('Hi! I am a guided project assistant, not an AI model. Tell me the result you need and who will use it.', 'Hola! Soy un asesor guiado de proyectos, no un modelo de IA. Cu\u00e9ntame que resultado necesitas y qui\u00e9n lo usara.'));
            } else if (analysis.thanks) {
                say(text('You are welcome. Your project context stays in this conversation; we can continue with scope, timing or contact.', 'Con gusto. El contexto del proyecto sigue en esta conversaci\u00f3n; podemos continuar con alcance, plazo o contacto.'));
            } else if ((state.pending.length || state.pendingProjects.length) && !analysis.intent) {
                say(text('There are several possible matches. Which is the main need?', 'Hay varias coincidencias posibles. Cu\u00e1l es la necesidad principal?'));
                say(state.pending.map(id => local(catalog[id], state.language, 'label')).concat(state.pendingProjects.map(project => project.name)).join(' / '));
                actions = [...state.pending, 'contact', 'restart'];
            } else if (analysis.intent === 'support') {
                title(text('Support for ', 'Soporte para ') + label);
                say(text('What fails, when did it start, and does it affect production? Share the error text and recent changes, but never passwords, access tokens or private customer records. A diagnosis is needed before promising a fix or estimate.', 'Que falla, desde cuando y afecta producci\u00f3n? Comparte el error y cambios recientes, nunca contrase\u00f1as, tokens ni registros privados de clientes. Hace falta diagnosticar antes de prometer una soluci\u00f3n o un costo.'));
            } else if (analysis.intent === 'budget') {
                title(text('Quote: ', 'Cotizaci\u00f3n: ') + label);
                say(text('There is no fixed price to infer here. Which features are essential for the first version, what exists today, and are any integrations required? Bryan will review that scope before quoting.', 'No hay un precio fijo que pueda deducir aqu\u00ed. Que funciones son indispensables para la primera version, que existe hoy y que integraciones necesitas? Bryan revisar\u00e1 ese alcance antes de cotizar.'));
            } else if (analysis.intent === 'timeline') {
                title(text('Timeline: ', 'Plazo: ') + label);
                say(text('Do you have a target date, and are the content, designs and integration access ready? Timing depends on the confirmed scope and QA; I cannot promise a delivery date.', 'Tienes una fecha objetivo y est\u00e1n listos los contenidos, dise\u00f1os y accesos de integraci\u00f3n? El plazo depende del alcance confirmado y del QA; no puedo prometer una fecha de entrega.'));
            } else if (analysis.intent === 'contact') {
                title(text('Contact Bryan', 'Contactar a Bryan'));
                say(text('The WhatsApp draft keeps the context you provided. Review and edit it before sending, or use the project form instead.', 'El borrador de WhatsApp conserva el contexto que compartiste. Rev\u00edsalo y ed\u00edtalo antes de enviarlo, o usa el formulario de proyecto.'));
                parts.push(link(links.email, 'info@blackholesys.com'));
            } else if (analysis.intent === 'social') {
                title(text('Official channels', 'Canales oficiales'));
                parts.push(['linkedin', 'github', 'instagram', 'facebook'].map(id => link(links[id], { linkedin: 'LinkedIn', github: 'GitHub', instagram: 'Instagram', facebook: 'Facebook' }[id])).join(' &middot; '));
            } else if (analysis.project || analysis.intent === 'projects') {
                if (state.project) {
                    title(state.project.name + ' / ' + state.project.id);
                    // Quote facts from the public dataset, not operational records.
                    say(state.project.summary);
                    say(text('Public status: ', 'Estado p\u00fablico: ') + state.project.status);
                } else {
                    say(projects.length ? text('The public archive currently contains ' + projects.length + ' projects with their individual status and implementation details. Which project would you like to use as a reference?', 'El archivo p\u00fablico contiene ' + projects.length + ' proyectos con su estado y detalles de implementaci\u00f3n. Cu\u00e1l quieres usar como referencia?') : text('Open the public archive to review the available project records.', 'Abre el archivo p\u00fablico para revisar las fichas disponibles.'));
                }
                parts.push(link('#deployments', text('Open project archive', 'Abrir portafolio')));
            } else if (analysis.intent === 'services') {
                title(text('Blackhole services', 'Servicios de Blackhole'));
                say(Object.values(catalog).filter(item => item.kind === 'service').map(item => local(item, state.language, 'label')).join(' / '));
                say(text('What outcome does your business need?', 'Que resultado necesita tu negocio?'));
            } else if (service) {
                title(label);
                if (analysis.serviceId) {
                    say(local(service, state.language, 'summary'));
                    say(text('What should the first version do, who will use it, and what do you already have? I will keep these details for the handoff.', 'Que debe hacer la primera version, qui\u00e9n la usara y que tienes actualmente? Conservar\u00e9 esos detalles para el contacto.'));
                } else {
                    say(text('Those details are now part of your project brief. You can add another requirement, discuss scope or timing, or review the draft before contacting Bryan.', 'Esos detalles ya forman parte del resumen de tu proyecto. Puedes agregar otro requerimiento, consultar alcance o plazo, o revisar el borrador antes de contactar a Bryan.'));
                }
            } else {
                say(text('I do not have enough information to choose a service. What should the system help people do? You can also choose a topic below.', 'No tengo informaci\u00f3n suficiente para elegir un servicio. Que debe permitir hacer el sistema? Tambi\u00e9n puedes elegir un tema abajo.'));
                actions = fallbackQuickActions;
            }

            const whatsappUrl = buildWhatsAppUrl(service, message, state);
            if (!analysis.greeting && !analysis.thanks && analysis.intent !== 'restart') {
                if (service || state.project) say(text('Handoff context: ', 'Contexto para el contacto: ') + label + (state.project ? ' / ' + state.project.name : ''));
                parts.push(link(whatsappUrl, text('Review on WhatsApp', 'Revisar en WhatsApp')));
                parts.push(link(links.contact, text('Open project form', 'Abrir formulario de proyecto')));
            }
            session.commit(state);
            const quickActions = [...new Set(actions.filter(id => id !== 'restart'))].slice(0, 5).concat('restart');
            return { html: parts.join('\n'), language: state.language, quickActions, whatsappUrl, reset: analysis.intent === 'restart' };
        }
        return { buildResponse, buildWhatsAppUrl };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
