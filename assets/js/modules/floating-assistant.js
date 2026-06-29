/**
 * Floating assistant.
 * Lightweight guided chat for lead qualification and fast contact routing.
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
        const chips = widget.querySelectorAll('[data-assistant-question]');

        if (!panel || !toggle || !messages || !form || !input) return;

        const whatsappUrl = 'https://wa.me/50670827504?text=' + encodeURIComponent('Hi Bryan, I want to talk about a project for Blackhole Systems.');
        const contactUrl = '#contact';

        const responseMap = {
            services: `
                <strong>Blackhole Systems</strong> builds custom digital products around the business problem.
                <br><br>
                Core work includes high-end interfaces, web platforms, dashboards, e-commerce, automations, API integrations, and AI-assisted tools.
            `,
            dashboards: `
                Yes. Dashboards and client portals are a strong fit here.
                <br><br>
                The usual path is: define the workflow, map user roles, structure the data, design the UI, then build the front end, backend logic, permissions, and reporting views.
            `,
            automation: `
                Automation is ideal when repetitive work is slowing the business down.
                <br><br>
                Blackhole can help with Python scripts, API syncs, reporting flows, content workflows, CRM automations, and internal utilities.
            `,
            ecommerce: `
                E-commerce projects can be built as conversion-focused storefronts, custom checkout flows, WooCommerce systems, inventory workflows, or sales dashboards.
                <br><br>
                The technology depends on what the business needs, not the other way around.
            `,
            integrations: `
                Integrations connect the tools already running the business.
                <br><br>
                Examples: REST APIs, webhooks, booking systems, payment gateways, CRMs, dashboards, reporting tools, and third-party platforms.
            `,
            stack: `
                The stack is flexible. Projects can use HTML, CSS, JavaScript, React, PHP, WordPress, WooCommerce, Python, MySQL, APIs, GPT API, and other tools when the project requires them.
                <br><br>
                The goal is simple: build the right system with the right technology.
            `,
            budget: `
                Budget depends on scope, complexity, integrations, and whether the project needs design, front-end, backend, automation, or ongoing support.
                <br><br>
                The cleanest first step is a quick discovery conversation so the build can be scoped properly.
                <br><br>
                <a href="${contactUrl}">Send a project brief</a> or <a href="${whatsappUrl}" target="_blank" rel="noopener">message on WhatsApp</a>.
            `,
            timeline: `
                Timeline depends on the product size.
                <br><br>
                A focused landing or interface can move quickly. A dashboard, booking flow, e-commerce system, or automation platform needs a discovery and architecture phase before delivery dates are committed.
            `,
            contact: `
                You can start here:
                <br><br>
                <a href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp: +506 7082-7504</a>
                <br>
                <a href="mailto:pinedabryan98@gmail.com">pinedabryan98@gmail.com</a>
                <br>
                <a href="https://github.com/bryanpineda-dev" target="_blank" rel="noopener">GitHub</a> ·
                <a href="https://www.instagram.com/blackholesys" target="_blank" rel="noopener">Instagram</a> ·
                <a href="https://www.facebook.com/blackholesys" target="_blank" rel="noopener">Facebook</a>
            `,
            fallback: `
                That sounds like something worth reviewing directly.
                <br><br>
                Share the project context, current problem, desired outcome, and any tools already involved.
                <br><br>
                <a href="${whatsappUrl}" target="_blank" rel="noopener">Send it on WhatsApp</a> or <a href="${contactUrl}">use the project form</a>.
            `
        };

        const intents = [
            {
                name: 'dashboards',
                keywords: ['dashboard', 'portal', 'admin', 'panel', 'client area', 'crm', 'reporting', 'reports']
            },
            {
                name: 'automation',
                keywords: ['automation', 'automate', 'script', 'python', 'workflow', 'repetitive', 'ai', 'chatbot', 'gpt']
            },
            {
                name: 'ecommerce',
                keywords: ['ecommerce', 'e-commerce', 'store', 'shop', 'woocommerce', 'checkout', 'payment', 'inventory']
            },
            {
                name: 'integrations',
                keywords: ['api', 'integration', 'webhook', 'sync', 'booking', 'payment gateway', 'connect']
            },
            {
                name: 'stack',
                keywords: ['technology', 'stack', 'wordpress', 'php', 'react', 'javascript', 'mysql', 'language', 'framework']
            },
            {
                name: 'budget',
                keywords: ['budget', 'price', 'cost', 'quote', 'estimate', 'pricing', 'how much']
            },
            {
                name: 'timeline',
                keywords: ['timeline', 'time', 'deadline', 'delivery', 'how long', 'duration']
            },
            {
                name: 'contact',
                keywords: ['contact', 'whatsapp', 'email', 'instagram', 'facebook', 'github', 'linkedin', 'call']
            },
            {
                name: 'services',
                keywords: ['service', 'services', 'build', 'website', 'landing', 'software', 'system', 'design']
            }
        ];

        function normalizeText(value) {
            return String(value || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
        }

        function detectIntent(message) {
            const text = normalizeText(message);

            for (const intent of intents) {
                if (intent.keywords.some((keyword) => text.includes(keyword))) {
                    return intent.name;
                }
            }

            return 'fallback';
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

        function respondTo(message, explicitIntent) {
            const intent = explicitIntent || detectIntent(message);
            const typing = addTyping();

            window.setTimeout(() => {
                typing.remove();
                addMessage('bot', responseMap[intent] || responseMap.fallback);
            }, 420);
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
                const intent = chip.dataset.assistantQuestion;

                addMessage('user', question);
                respondTo(question, intent);
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
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
