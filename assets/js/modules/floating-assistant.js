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

        const links = {
            contact: '#contact',
            email: 'mailto:info@blackholesys.com',
            github: 'https://github.com/bryanpineda-dev',
            instagram: 'https://www.instagram.com/blackholesys',
            linkedin: 'https://www.linkedin.com/company/blackhole-sys/',
            facebook: 'https://www.facebook.com/blackholesys',
            whatsapp: 'https://wa.me/50670827504'
        };

        const defaultQuickActions = ['website', 'booking', 'dashboard', 'ecommerce', 'automation', 'ai'];
        const fallbackQuickActions = ['website', 'booking', 'dashboard', 'projects', 'social', 'budget'];
        const defaultWhatsAppText = 'Hi Bryan, I want to talk about a project for Blackhole Systems.';

        const serviceCatalog = {
            website: {
                label: 'Website / landing',
                chip: 'Website',
                summary: 'Yes, this fits a website build. We can help with structure, premium UI, responsive front end, performance, SEO foundations, and lead capture.',
                handoff: 'Start a website brief on WhatsApp',
                keywords: ['website', 'web page', 'landing', 'landing page', 'site', 'redesign', 'refresh', 'campaign page', 'portfolio', 'institutional page', 'seo', 'performance', 'pagina web', 'página web', 'sitio web', 'landing', 'rediseño', 'redisenar', 'rediseñar', 'campana', 'campaña', 'portafolio', 'pagina informativa', 'página informativa'],
                related: ['booking', 'dashboard', 'ecommerce', 'support', 'budget', 'contact']
            },
            booking: {
                label: 'Booking / reservation system',
                chip: 'Booking',
                summary: 'Yes, this fits a booking system. We can build reservation logic, availability, forms, payments if needed, confirmations, and an admin panel.',
                handoff: 'Start a booking brief on WhatsApp',
                keywords: ['booking', 'booking system', 'reservation', 'reservations', 'appointment', 'appointments', 'calendar', 'schedule', 'tickets', 'ticketing', 'event tickets', 'availability', 'reservation flow', 'sistema de reservas', 'sitio de reservas', 'web de reservas', 'pagina de reservas', 'página de reservas', 'reserva', 'reservas', 'reservaciones', 'cita', 'citas', 'agenda', 'calendario', 'entradas', 'ranchos', 'disponibilidad'],
                related: ['dashboard', 'integrations', 'wordpress', 'budget', 'timeline', 'contact']
            },
            dashboard: {
                label: 'Dashboard / portal',
                chip: 'Dashboard',
                summary: 'Yes, this fits a dashboard or portal. We can centralize users, records, roles, reports, activity, and business workflows in one controlled system.',
                handoff: 'Start a dashboard brief on WhatsApp',
                keywords: ['dashboard', 'dashboards', 'portal', 'admin panel', 'panel', 'client area', 'customer portal', 'crm', 'reporting', 'reports', 'records', 'permissions', 'roles', 'internal system', 'panel admin', 'panel administrativo', 'portal cliente', 'sistema interno', 'reporteria', 'reportería', 'reportes', 'permisos', 'usuarios', 'roles'],
                related: ['automation', 'integrations', 'ai', 'budget', 'timeline', 'contact']
            },
            ecommerce: {
                label: 'E-commerce / sales system',
                chip: 'Store',
                summary: 'Yes, this fits an e-commerce build. We can handle product structure, checkout, WhatsApp orders, payment gateways, inventory, and customer notifications.',
                handoff: 'Start a store brief on WhatsApp',
                keywords: ['ecommerce', 'e-commerce', 'store', 'shop', 'storefront', 'checkout', 'payment', 'payments', 'inventory', 'catalog', 'woocommerce', 'cart', 'tienda', 'tienda en linea', 'tienda en línea', 'carrito', 'catalogo', 'catálogo', 'inventario', 'pasarela', 'pago', 'pagos', 'compras'],
                related: ['wordpress', 'integrations', 'dashboard', 'automation', 'budget', 'contact']
            },
            wordpress: {
                label: 'WordPress / custom plugin',
                chip: 'Plugin',
                summary: 'Yes, this fits a custom WordPress/PHP build. We can create plugins, admin tools, WooCommerce logic, booking flows, reports, and business-specific features.',
                handoff: 'Start a plugin brief on WhatsApp',
                keywords: ['wordpress', 'woocommerce plugin', 'custom plugin', 'plugin', 'theme', 'php plugin', 'shortcode', 'wp admin', 'wp-admin', 'php', 'plugin personalizado', 'tema', 'administrador wordpress', 'woocommerce', 'plugin wordpress'],
                related: ['booking', 'ecommerce', 'dashboard', 'support', 'budget', 'contact']
            },
            automation: {
                label: 'Automation / scripts',
                chip: 'Automation',
                summary: 'Yes, this fits automation. We can reduce manual work with scripts, API syncs, reporting flows, content utilities, and internal tools.',
                handoff: 'Start an automation brief on WhatsApp',
                keywords: ['automation', 'automate', 'script', 'python', 'workflow', 'repetitive', 'sync', 'process', 'task', 'utility', 'report automation', 'automatizacion', 'automatización', 'automatizar', 'flujo', 'proceso repetitivo', 'tarea repetitiva', 'sincronizar', 'reporte automatico', 'reporte automático'],
                related: ['integrations', 'dashboard', 'ai', 'budget', 'timeline', 'contact']
            },
            ai: {
                label: 'AI assistant / smart tool',
                chip: 'AI',
                summary: 'Yes, this fits an AI-assisted tool. We can build guided assistants, lead qualification, knowledge routing, GPT workflows, and smart internal utilities.',
                handoff: 'Start an AI tool brief on WhatsApp',
                keywords: ['ai', 'artificial intelligence', 'gpt', 'chatgpt', 'chatbot', 'assistant', 'bot', 'prompt', 'openai', 'knowledge base', 'ia', 'inteligencia artificial', 'asistente', 'chat bot', 'chatbot', 'base de conocimiento'],
                related: ['automation', 'integrations', 'dashboard', 'budget', 'timeline', 'contact']
            },
            integrations: {
                label: 'API / integrations',
                chip: 'APIs',
                summary: 'Yes, this fits an integration flow. We can connect platforms through APIs, webhooks, payment gateways, CRMs, sync logic, and admin visibility.',
                handoff: 'Start an integration brief on WhatsApp',
                keywords: ['api', 'integration', 'integrations', 'webhook', 'connect', 'payment gateway', 'third party', 'crm', 'zapier', 'make', 'sync', 'integracion', 'integración', 'integraciones', 'conectar', 'pasarela de pago', 'sincronizacion', 'sincronización'],
                related: ['dashboard', 'automation', 'ecommerce', 'ai', 'budget', 'contact']
            },
            support: {
                label: 'Support / maintenance',
                chip: 'Support',
                summary: 'Yes, this fits support or maintenance. We can review, fix, improve, monitor, and keep existing websites, stores, plugins, or systems moving.',
                handoff: 'Start a support request on WhatsApp',
                keywords: ['support', 'maintenance', 'hosting', 'domain', 'fix', 'bug', 'update', 'care', 'monthly', 'improve existing', 'soporte', 'mantenimiento', 'dominio', 'hospedaje', 'hosting', 'arreglo', 'error', 'mensualidad', 'mejoras'],
                related: ['website', 'wordpress', 'ecommerce', 'automation', 'budget', 'contact']
            },
            budget: {
                label: 'Quote / budget',
                chip: 'Quote',
                summary: 'Yes, we can scope it. The clean path is to define must-have features, timeline, technical risk, and a realistic first version before pricing.',
                handoff: 'Request a quote on WhatsApp',
                keywords: ['budget', 'price', 'cost', 'quote', 'estimate', 'pricing', 'how much', 'range', 'presupuesto', 'precio', 'costo', 'cotizacion', 'cotización', 'cotizar', 'cuanto cuesta', 'cuánto cuesta'],
                related: ['website', 'booking', 'dashboard', 'ecommerce', 'automation', 'contact']
            },
            timeline: {
                label: 'Timeline / delivery',
                chip: 'Timeline',
                summary: 'Yes, we can map timing. Delivery depends on scope, content readiness, integrations, QA, and whether we launch in phases.',
                handoff: 'Discuss timeline on WhatsApp',
                keywords: ['timeline', 'time', 'deadline', 'delivery', 'how long', 'duration', 'urgent', 'asap', 'launch', 'tiempo', 'fecha', 'plazo', 'entrega', 'urgente', 'rapido', 'rápido', 'lanzamiento'],
                related: ['budget', 'website', 'dashboard', 'integrations', 'support', 'contact']
            },
            projects: {
                label: 'Projects / deployment archive',
                chip: 'Projects',
                summary: 'The portfolio includes 16 real deployments built as solo developer: booking systems, e-commerce stores, dashboards, WordPress/PHP plugins, corporate sites, and automation-ready platforms.',
                handoff: 'Ask about a similar project on WhatsApp',
                pageHref: '#deployments',
                pageLabel: 'Open project archive',
                keywords: ['project', 'projects', 'portfolio', 'deployments', 'deploys', 'case studies', 'work examples', 'client work', 'real work', 'sebana', 'alai', 'mariam', 'coxbrand', 'meraki', 'my choice', 'niuvort', 'proyecto', 'proyectos', 'portafolio', 'trabajos', 'clientes', 'casos', 'casos de exito', 'casos de éxito', 'deploys', 'despliegues', 'ejemplos'],
                related: ['booking', 'dashboard', 'ecommerce', 'website', 'wordpress', 'contact']
            },
            social: {
                label: 'Social media / channels',
                chip: 'Social',
                summary: 'You can follow or contact Blackhole Systems through LinkedIn, GitHub, Instagram, Facebook, WhatsApp, or email.',
                keywords: ['social', 'social media', 'instagram', 'facebook', 'linkedin', 'github', 'network', 'networks', 'follow', 'redes', 'redes sociales', 'ig', 'fb', 'git', 'seguir', 'perfil', 'perfiles'],
                related: ['contact', 'projects', 'services', 'website', 'budget', 'ai']
            },
            services: {
                label: 'Blackhole services',
                chip: 'Services',
                summary: 'Blackhole Systems builds custom digital systems: websites, dashboards, booking tools, stores, plugins, automations, integrations, and AI-assisted workflows.',
                handoff: 'Ask about services on WhatsApp',
                keywords: ['service', 'services', 'what do you do', 'what can you build', 'blackhole systems', 'digital engineering', 'help me', 'servicio', 'servicios', 'que hacen', 'qué hacen', 'que puedes hacer', 'qué puedes hacer', 'ayuda'],
                related: defaultQuickActions
            },
            contact: {
                label: 'Contact route',
                chip: 'Contact',
                summary: 'The fastest route is WhatsApp or the project brief form. Send the idea, expected result, timeline, and any reference links.',
                handoff: 'Open WhatsApp',
                keywords: ['contact', 'whatsapp', 'email', 'instagram', 'facebook', 'github', 'linkedin', 'call', 'meeting', 'number', 'phone', 'phone number', 'mobile', 'cell', 'cellphone', 'telephone', 'tel', 'your number', 'contact number', 'whatsapp number', 'contacto', 'correo', 'llamar', 'reunion', 'reunión', 'numero', 'número', 'telefono', 'teléfono', 'celular', 'movil', 'móvil', 'tu numero', 'tu número', 'numero de telefono', 'número de teléfono', 'numero de whatsapp', 'número de whatsapp'],
                related: defaultQuickActions
            }
        };

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
