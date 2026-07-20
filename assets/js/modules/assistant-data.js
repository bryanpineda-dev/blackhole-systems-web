/**
 * Floating assistant knowledge base.
 * Keep service definitions, links, labels, and routing keywords outside the UI
 * module so the assistant can grow without bloating interaction code.
 */
(function (BH) {
    'use strict';

    const defaultQuickActions = ['website', 'booking', 'dashboard', 'ecommerce', 'automation', 'ai'];

    BH.assistantData = {
        links: {
            contact: '#contact',
            email: 'mailto:info@blackholesys.com',
            github: 'https://github.com/bryanpineda-dev',
            instagram: 'https://www.instagram.com/blackholesys',
            linkedin: 'https://www.linkedin.com/company/blackhole-sys/',
            facebook: 'https://www.facebook.com/blackholesys',
            whatsapp: 'https://wa.me/50670827504'
        },

        defaultQuickActions,
        fallbackQuickActions: ['website', 'booking', 'dashboard', 'projects', 'social', 'budget'],
        defaultWhatsAppText: 'Hi Bryan, I want to talk about a project for Blackhole Systems.',

        serviceCatalog: {
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
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
