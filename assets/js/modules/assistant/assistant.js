/**
 * Floating assistant bootstrap.
 * Wires data, routing, handoff, and UI while preserving the landing initializer.
 */
(function (BH) {
    'use strict';

    const Assistant = BH.Assistant = BH.Assistant || {};

    BH.initFloatingAssistant = function initFloatingAssistant() {
        const widget = document.querySelector('[data-floating-assistant]');
        if (!widget) return;

        const panel = widget.querySelector('[data-assistant-panel]');
        const toggle = widget.querySelector('[data-assistant-toggle]');
        const close = widget.querySelector('[data-assistant-close]');
        const messages = widget.querySelector('[data-assistant-messages]');
        const form = widget.querySelector('[data-assistant-form]');
        const input = widget.querySelector('[data-assistant-input]');
        const chips = Array.from(widget.querySelectorAll('[data-assistant-question]'));

        if (!panel || !toggle || !messages || !form || !input) return;

        const {
            links,
            defaultQuickActions,
            fallbackQuickActions,
            defaultWhatsAppText,
            serviceCatalog
        } = BH.assistantData || {};

        if (!links || !defaultQuickActions || !fallbackQuickActions || !defaultWhatsAppText || !serviceCatalog) return;
        if (typeof Assistant.createRouter !== 'function' || typeof Assistant.createHandoff !== 'function' || typeof Assistant.mountUi !== 'function') return;

        const router = Assistant.createRouter(serviceCatalog);
        const handoff = Assistant.createHandoff({
            links,
            defaultQuickActions,
            fallbackQuickActions,
            defaultWhatsAppText,
            serviceCatalog,
            router
        });

        Assistant.mountUi({
            widget,
            panel,
            toggle,
            close,
            messages,
            form,
            input,
            chips,
            defaultQuickActions,
            serviceCatalog,
            buildResponse: handoff.buildResponse
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
