/** Transactional page-lifetime memory: no persistence, network calls or inferred facts. */
(function (BH) {
    'use strict';
    const Assistant = BH.Assistant = BH.Assistant || {};

    Assistant.createSession = function createSession(limits) {
        const empty = language => ({ language, serviceId: null, project: null, pending: [], pendingProjects: [], details: [], intents: [], turns: 0 });
        let current = empty('en');

        function prepare(message, analysis) {
            const language = analysis.language || current.language;
            if (analysis.intent === 'restart') return empty(language);
            if (message.length > limits.message) throw new RangeError(language === 'es'
                ? 'El mensaje supera ' + limits.message + ' caracteres. Ac\u00f3rtalo antes de enviarlo; el texto sigue en el campo.'
                : 'This message exceeds ' + limits.message + ' characters. Shorten it before sending; your draft is still in the field.');
            const details = current.details.slice();
            const navigation = ['contact', 'social'].includes(analysis.intent) && (analysis.isExplicit || /^(contact|contacto|whatsapp|email|correo|form|formulario|social|redes)$/i.test(message));
            if (!navigation && !analysis.isExplicit && !analysis.greeting && !analysis.thanks && !details.includes(message)) details.push(message);
            if (!navigation && (details.join('\n').length > limits.context || current.turns >= limits.turns)) throw new RangeError(language === 'es'
                ? 'Esta conversaci\u00f3n lleg\u00f3 a su l\u00edmite. Puedes contactar con el contexto actual o elegir Empezar de nuevo; tu borrador no se borr\u00f3.'
                : 'This conversation reached its limit. Contact us with the current context or choose Start over; your draft was not cleared.');
            return {
                language, details: navigation ? current.details.slice() : details,
                turns: current.turns + (navigation ? 0 : 1),
                serviceId: analysis.serviceId || current.serviceId,
                project: analysis.project || current.project,
                pending: analysis.serviceId ? [] : analysis.candidates.length ? analysis.candidates : current.pending,
                pendingProjects: analysis.project ? [] : analysis.projectCandidates.length ? analysis.projectCandidates : current.pendingProjects,
                intents: [...new Set([...current.intents, analysis.intent].filter(Boolean))]
            };
        }
        return { prepare, commit: next => { current = next; }, snapshot: () => ({ ...current, pending: current.pending.slice(), pendingProjects: current.pendingProjects.slice(), details: current.details.slice(), intents: current.intents.slice() }) };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
