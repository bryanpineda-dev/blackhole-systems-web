/**
 * Floating assistant response and handoff builder.
 * Keeps WhatsApp, contact, social, and service response formatting outside UI.
 */
(function (BH) {
    'use strict';

    const Assistant = BH.Assistant = BH.Assistant || {};

    function truncateContext(value, maxLength = 180) {
        const text = String(value || '').replace(/\s+/g, ' ').trim();
        if (!text) return '';
        return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
    }

    Assistant.createHandoff = function createHandoff(options) {
        const {
            links,
            defaultQuickActions,
            fallbackQuickActions,
            defaultWhatsAppText,
            serviceCatalog,
            router
        } = options;

        function buildWhatsAppUrl(service, userMessage) {
            const label = service ? service.label : 'a project';
            const context = truncateContext(userMessage);
            const message = context
                ? `Hi Bryan, I want to talk about ${label}. Context: ${context}`
                : defaultWhatsAppText;

            return `${links.whatsapp}?text=${encodeURIComponent(message)}`;
        }

        function buildServiceResponse(result, userMessage) {
            const service = result.service;
            const whatsappUrl = buildWhatsAppUrl(service, userMessage);
            const primaryAction = service.pageHref
                ? `<a href="${service.pageHref}">${service.pageLabel}</a>`
                : `<a href="${whatsappUrl}" target="_blank" rel="noopener">${service.handoff}</a>`;
            const secondaryAction = service.pageHref
                ? `<br><a href="${whatsappUrl}" target="_blank" rel="noopener">${service.handoff}</a>`
                : '';

            return `
                <strong>${service.label}</strong>
                <br>
                ${service.summary}
                <br><br>
                ${primaryAction}
                ${secondaryAction}
            `;
        }

        function buildFallbackResponse() {
            return `
                I can route it, but I need one clearer signal.
                <br><br>
                Is it closer to a website, booking system, dashboard, store, automation, or AI tool?
            `;
        }

        function buildContactResponse(userMessage) {
            const whatsappUrl = buildWhatsAppUrl(serviceCatalog.contact, userMessage);

            return `
                <strong>Contact route</strong>
                <br>
                The fastest path is WhatsApp.
                <br><br>
                <a href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp: +506 7082-7504</a>
                <br>
                <a href="${links.email}">info@blackholesys.com</a>
                <br>
                <a href="${links.linkedin}" target="_blank" rel="noopener">LinkedIn</a> ·
                <a href="${links.github}" target="_blank" rel="noopener">GitHub</a> ·
                <a href="${links.instagram}" target="_blank" rel="noopener">Instagram</a> ·
                <a href="${links.facebook}" target="_blank" rel="noopener">Facebook</a>
            `;
        }

        function buildSocialResponse() {
            return `
                <strong>${serviceCatalog.social.label}</strong>
                <br>
                ${serviceCatalog.social.summary}
                <br><br>
                <a href="${links.linkedin}" target="_blank" rel="noopener">LinkedIn</a> ·
                <a href="${links.github}" target="_blank" rel="noopener">GitHub</a> ·
                <a href="${links.instagram}" target="_blank" rel="noopener">Instagram</a> ·
                <a href="${links.facebook}" target="_blank" rel="noopener">Facebook</a>
                <br>
                <a href="${links.whatsapp}" target="_blank" rel="noopener">WhatsApp</a> ·
                <a href="${links.email}">Email</a>
            `;
        }

        function buildResponse(message, explicitService) {
            const result = router.detectService(message, explicitService);

            if (!result.service) {
                return {
                    html: buildFallbackResponse(),
                    quickActions: fallbackQuickActions
                };
            }

            if (result.id === 'contact') {
                return {
                    html: buildContactResponse(message),
                    quickActions: serviceCatalog.contact.related
                };
            }

            if (result.id === 'social') {
                return {
                    html: buildSocialResponse(),
                    quickActions: serviceCatalog.social.related
                };
            }

            return {
                html: buildServiceResponse(result, message),
                quickActions: result.service.related || defaultQuickActions
            };
        }

        return {
            buildResponse,
            buildWhatsAppUrl
        };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
