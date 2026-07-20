/**
 * Floating assistant.
 * Local service router for quick project qualification and WhatsApp handoff.
 */
(function (BH) {
    'use strict';

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

        function normalizeText(value) {
            return String(value || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
        }

        function escapeRegExp(value) {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function matchesKeyword(text, keyword) {
            const normalizedKeyword = normalizeText(keyword);
            if (!normalizedKeyword) return false;

            if (normalizedKeyword.includes(' ')) {
                return text.includes(normalizedKeyword);
            }

            if (normalizedKeyword.length <= 3) {
                const boundaryPattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`);
                return boundaryPattern.test(text);
            }

            return text.includes(normalizedKeyword);
        }

        function scoreService(text, service) {
            return service.keywords.reduce((score, keyword) => {
                const normalizedKeyword = normalizeText(keyword);
                if (!matchesKeyword(text, normalizedKeyword)) return score;

                const phraseBonus = normalizedKeyword.includes(' ') ? 4 : 1;
                const exactBonus = text === normalizedKeyword ? 6 : 0;
                return score + phraseBonus + exactBonus + Math.min(normalizedKeyword.length, 14);
            }, 0);
        }

        function detectService(message, explicitService) {
            if (explicitService && serviceCatalog[explicitService]) {
                return {
                    service: serviceCatalog[explicitService],
                    id: explicitService,
                    confidence: 100,
                    isExplicit: true
                };
            }

            const text = normalizeText(message);
            const ranked = Object.entries(serviceCatalog)
                .map(([id, service]) => ({
                    id,
                    service,
                    score: scoreService(text, service)
                }))
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score);

            const best = ranked[0];
            if (!best) {
                return {
                    service: null,
                    id: 'fallback',
                    confidence: 0,
                    isExplicit: false
                };
            }

            return {
                service: best.service,
                id: best.id,
                confidence: best.score,
                isExplicit: false
            };
        }

        function truncateContext(value, maxLength = 180) {
            const text = String(value || '').replace(/\s+/g, ' ').trim();
            if (!text) return '';
            return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
        }

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
            const result = detectService(message, explicitService);

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

        function scrollMessages() {
            messages.scrollTop = messages.scrollHeight;
        }

        function addMessage(type, content) {
            const message = document.createElement('div');
            message.className = `assistant-message ${type}`;

            const bubble = document.createElement('div');
            bubble.className = 'assistant-bubble';

            if (type === 'bot') {
                bubble.innerHTML = content;
            } else {
                bubble.textContent = content;
            }

            message.appendChild(bubble);
            messages.appendChild(message);
            scrollMessages();
        }

        function addTyping() {
            const typing = document.createElement('div');
            typing.className = 'assistant-message bot assistant-typing';
            typing.innerHTML = '<div class="assistant-bubble"><span></span><span></span><span></span></div>';
            messages.appendChild(typing);
            scrollMessages();
            return typing;
        }

        function setQuickActions(actionIds = defaultQuickActions) {
            chips.forEach((chip, index) => {
                const serviceId = actionIds[index] || defaultQuickActions[index];
                const service = serviceCatalog[serviceId];
                if (!service) return;

                chip.dataset.assistantQuestion = serviceId;
                chip.textContent = service.chip;
            });
        }

        function respondTo(message, explicitService) {
            const response = buildResponse(message, explicitService);
            const typing = addTyping();

            window.setTimeout(() => {
                typing.remove();
                addMessage('bot', response.html);
                setQuickActions(response.quickActions);
            }, 360);
        }

        function openAssistant() {
            widget.classList.add('is-open');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close Blackhole assistant');
        }

        function closeAssistant() {
            widget.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open Blackhole assistant');
        }

        function toggleAssistant() {
            if (widget.classList.contains('is-open')) {
                closeAssistant();
            } else {
                openAssistant();
            }
        }

        toggle.addEventListener('click', toggleAssistant);

        if (close) {
            close.addEventListener('click', closeAssistant);
        }

        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                const question = chip.textContent.trim();
                const serviceId = chip.dataset.assistantQuestion;

                addMessage('user', question);
                respondTo(question, serviceId);
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const message = input.value.trim();
            if (!message) return;

            addMessage('user', message);
            input.value = '';
            respondTo(message);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeAssistant();
        });

        setQuickActions();
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
