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
            const lines = [es ? 'Hola Bryan, me gustar\u00eda conversar sobre un proyecto con Blackhole Systems.' : defaultWhatsAppText];
            if (service) lines.push((es ? 'Servicio' : 'Service') + ': ' + local(service, language, 'label'));
            if (state?.project) lines.push((es ? 'Proyecto de referencia' : 'Reference project') + ': ' + state.project.name + ' (' + state.project.id + ')');
            const intents = (state?.intents || []).filter(id => !['restart', 'contact'].includes(id));
            if (intents.length) lines.push((es ? 'Temas' : 'Topics') + ': ' + intents.map(id => local(catalog[id], language, 'label')).join(', '));
            const context = state ? state.details.join('\n') : userMessage;
            if (context) lines.push((es ? 'Detalles del proyecto' : 'Project details') + ':\n' + context);
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
                say(text('What would you like to build or improve?', '\u00bfQu\u00e9 te gustar\u00eda crear o mejorar?'));
            } else if (analysis.greeting) {
                say(text('Hi! What would you like to build or improve?', '\u00a1Hola! \u00bfQu\u00e9 te gustar\u00eda crear o mejorar?'));
            } else if (analysis.thanks) {
                say(text('You are welcome. We can keep refining your project or continue on WhatsApp when you are ready.', 'Con gusto. Podemos seguir afinando tu proyecto o continuar por WhatsApp cuando quieras.'));
            } else if ((state.pending.length || state.pendingProjects.length) && !analysis.intent) {
                say(text('Your request could fit more than one option. Which of these options did you have in mind?', 'Tu consulta puede encajar en varias opciones. \u00bfA cu\u00e1l de estas opciones te refieres?'));
                say(state.pending.map(id => local(catalog[id], state.language, 'label')).concat(state.pendingProjects.map(project => project.name)).join(' / '));
                actions = [...state.pending, 'contact', 'restart'];
            } else if (analysis.intent === 'support') {
                title(text('Support: ', 'Soporte: ') + label);
                say(text('What is not working? You can share the error message and any recent changes, but never include passwords, access tokens or private customer data.', '\u00bfQu\u00e9 est\u00e1 fallando? Puedes compartir el mensaje de error y los cambios recientes, sin incluir contrase\u00f1as, tokens ni datos privados de clientes.'));
            } else if (analysis.intent === 'budget') {
                title(text('Quote: ', 'Cotizaci\u00f3n: ') + label);
                say(text('The price depends on the scope. Bryan will review your requirements before preparing a quote. Which features are essential for your project?', 'El costo depende del alcance. Bryan revisar\u00e1 lo que necesitas antes de preparar una cotizaci\u00f3n. \u00bfQu\u00e9 funciones son indispensables para tu proyecto?'));
            } else if (analysis.intent === 'timeline') {
                title(text('Timeline: ', 'Plazo: ') + label);
                say(text('Bryan will confirm the timeline after reviewing the scope, content and integrations. Do you have a launch date in mind?', 'Las fechas de entrega se confirman despu\u00e9s de revisar el alcance, los contenidos y las integraciones. \u00bfTienes una fecha de lanzamiento en mente?'));
            } else if (analysis.intent === 'contact') {
                title(text('Contact Bryan', 'Contacto con Bryan'));
                say(text('You can review your inquiry in WhatsApp before sending it, or use the project form.', 'Puedes revisar tu consulta en WhatsApp antes de enviarla, o usar el formulario de proyecto.'));
                parts.push(link(links.email, 'info@blackholesys.com'));
            } else if (analysis.intent === 'social') {
                title(text('Official channels', 'Canales oficiales'));
                parts.push(['linkedin', 'github', 'instagram', 'facebook'].map(id => link(links[id], { linkedin: 'LinkedIn', github: 'GitHub', instagram: 'Instagram', facebook: 'Facebook' }[id])).join(' &middot; '));
            } else if (analysis.project || analysis.intent === 'projects') {
                if (state.project) {
                    title(state.project.name + ' / ' + state.project.id);
                    // Quote facts from the public dataset, not operational records.
                    say(state.project.summary);
                    say(text('Project status: ', 'Estado del proyecto: ') + state.project.status);
                } else {
                    say(projects.length ? text('The public portfolio includes ' + projects.length + ' projects with their status and implementation details. Which project would you like to use as a reference?', 'En el portafolio hay ' + projects.length + ' proyectos con su estado y detalles de desarrollo. \u00bfHay alguno que quieras usar como referencia?') : text('You can browse the public portfolio for project details.', 'Puedes consultar el portafolio para ver los detalles de los proyectos.'));
                }
                parts.push(link('#deployments', text('View project portfolio', 'Ver portafolio')));
            } else if (analysis.intent === 'services') {
                title(text('Blackhole services', 'Servicios de Blackhole'));
                say(Object.values(catalog).filter(item => item.kind === 'service').map(item => local(item, state.language, 'label')).join(' / '));
                say(text('What would you like to build or improve?', '\u00bfQu\u00e9 te gustar\u00eda crear o mejorar?'));
            } else if (service) {
                title(label);
                if (analysis.serviceId) {
                    say(local(service, state.language, 'summary'));
                    say(local(service, state.language, 'question'));
                } else {
                    say(text('Got it. You can add other requirements or continue on WhatsApp when you are ready.', 'Entendido. Puedes agregar otros requisitos o continuar por WhatsApp cuando quieras.'));
                }
            } else {
                say(text('I need a bit more detail. What would you like to build or improve?', 'Necesito un poco m\u00e1s de informaci\u00f3n. \u00bfQu\u00e9 te gustar\u00eda crear o mejorar?'));
                actions = fallbackQuickActions;
            }

            const whatsappUrl = buildWhatsAppUrl(service, message, state);
            if (!analysis.greeting && !analysis.thanks && analysis.intent !== 'restart') {
                if (service || state.project) say(text('Project: ', 'Proyecto: ') + label + (state.project ? ' / ' + state.project.name : ''));
                parts.push(link(whatsappUrl, text('Continue on WhatsApp', 'Continuar por WhatsApp')));
                parts.push(link(links.contact, text('Use the project form', 'Ir al formulario de proyecto')));
            }
            session.commit(state);
            const quickActions = [...new Set(actions.filter(id => id !== 'restart'))].slice(0, 5).concat('restart');
            return { html: parts.join('\n'), language: state.language, quickActions, whatsappUrl, reset: analysis.intent === 'restart' };
        }
        return { buildResponse, buildWhatsAppUrl };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
