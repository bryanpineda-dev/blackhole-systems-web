/** Pure classification: project references, service domains and intent are independent. */
(function (BH) {
    'use strict';
    const Assistant = BH.Assistant = BH.Assistant || {};

    function normalize(value) {
        return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9.,;!?]+/g, ' ').replace(/\s+/g, ' ').replace(/[.,;!?]+$/, '').trim();
    }

    function escape(value) {
        return value.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');
    }

    function score(text, keywords = []) {
        let best = 0;
        new Set(keywords.map(normalize)).forEach((keyword) => {
            if (!keyword) return;
            const pattern = new RegExp('(^|[^a-z0-9])(' + escape(keyword) + ')(?=[^a-z0-9]|$)', 'g');
            for (const match of text.matchAll(pattern)) {
                const prefix = text.slice(0, match.index + match[1].length).split(/\b(?:but|pero|sino)\b|[,.;!?]/).pop();
                // Negation is local to a clause; later positive needs remain eligible.
                if (/\b(?:no(?: necesito| quiero| busco| requiero)?|not|don t(?: need| want)?|do not(?: need| want)?|without|sin)\s+(?:[a-z0-9]+\s+){0,4}$/.test(prefix)) continue;
                best = Math.max(best, keyword.split(' ').length * 3);
            }
        });
        return best;
    }

    Assistant.createRouter = function createRouter(catalog, projects = []) {
        function rank(text, kind) {
            return Object.entries(catalog).filter(([, item]) => item.kind === kind)
                .map(([id, service]) => ({ id, service, confidence: score(text, service.keywords) }))
                .filter(item => item.confidence > 0).sort((a, b) => b.confidence - a.confidence);
        }

        function analyze(message, explicitService, context = {}) {
            const text = normalize(message);
            const explicit = Object.hasOwn(catalog, explicitService) ? catalog[explicitService] : null;
            const projectMatches = projects.filter(project => score(text, [project.name, project.id, new URL(project.url).hostname.replace(/^www\./, '')]));
            const domains = rank(text, 'service');
            const specific = domains.filter(item => item.id !== 'website' && item.id !== 'wordpress');
            const candidates = specific.length ? specific : domains;
            const tied = candidates.filter(item => item.confidence === candidates[0]?.confidence);
            const intents = rank(text, 'intent');
            const priority = ['restart', 'support', 'timeline', 'budget', 'social', 'contact', 'projects', 'services'];
            let intent = priority.find(id => intents.some(item => item.id === id)) || null;
            if (explicit?.kind === 'intent') intent = explicitService;
            if (!explicit && candidates.length) {
                // A project feature is not automatically a request for our contact channels.
                if (intent === 'contact' && !/\b(?:contact you|contact me|contact details|contact information|get in touch|your phone|your email|your number|tu correo|tu telefono|tu numero|hablar con|contactarte|contactarlos|contactar a|contactar con|comunicarme|escribirte)\b/.test(text)) intent = null;
                if (intent === 'social' && !/\b(?:follow|official channels|social links|your social|tus redes|seguir|canales oficiales)\b/.test(text)) intent = null;
                if (intent === 'services' && !/\b(?:all services|todos los servicios|lista de servicios)\b/.test(text)) intent = null;
            }
            const ordinal = /^(?:the )?(?:first|first one|primero|el primero)$/.test(text) ? 0
                : /^(?:the )?(?:second|second one|segundo|el segundo)$/.test(text) ? 1 : -1;
            const selected = ordinal >= 0 ? context.pending?.[ordinal] : null;
            const selectedProject = ordinal >= 0 ? context.pendingProjects?.[ordinal] : null;
            const serviceId = explicit?.kind === 'service' ? explicitService : selected || (tied.length === 1 ? tied[0].id : null);
            const es = score(text, ['quiero', 'necesito', 'una', 'un', 'cuanto', 'hola', 'gracias', 'tienda', 'reservas', 'pagina', 'proyecto', 'cotizacion', 'cotizar', 'precio', 'costo', 'presupuesto', 'plazo', 'entrega', 'soporte', 'mantenimiento', 'formulario', 'contacto', 'correo', 'telefono', 'numero', 'servicios', 'redes', 'empezar', 'primero', 'segundo', 'espanol']);
            const en = score(text, ['need', 'want', 'how', 'hello', 'hi', 'thanks', 'please', 'my', 'english']);
            const language = /\bin english\b/.test(text) ? 'en' : /\ben espanol\b/.test(text) ? 'es' : es > en ? 'es' : en > es ? 'en' : null;
            return {
                serviceId, intent, language,
                candidates: tied.length > 1 && !explicit && !selected ? tied.map(item => item.id) : [],
                project: selectedProject || (projectMatches.length === 1 ? projectMatches[0] : null),
                projectCandidates: projectMatches.length > 1 ? projectMatches : [],
                greeting: /^(?:hi|hello|hey|hola|buenas|buenos dias|buenas tardes)[.! ]*$/.test(text),
                thanks: /^(?:thanks|thank you|gracias|muchas gracias|perfecto|great|ok)[.! ]*$/.test(text),
                isExplicit: Boolean(explicit)
            };
        }

        function detectService(message, explicitService) {
            const analysis = analyze(message, explicitService);
            const id = Object.hasOwn(catalog, explicitService) ? explicitService : analysis.intent || (analysis.project ? 'projects' : analysis.serviceId) || 'fallback';
            return { id, service: catalog[id] || null, confidence: id === 'fallback' ? 0 : 1, isExplicit: analysis.isExplicit };
        }
        return { analyze, detectService };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
