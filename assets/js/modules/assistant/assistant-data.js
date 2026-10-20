/** Public service knowledge only; never operational client records. */
(function (BH) {
    'use strict';
    const defaultQuickActions = ['website', 'booking', 'dashboard', 'ecommerce', 'automation', 'ai'];
    const related = ['budget', 'timeline', 'support', 'projects', 'contact', 'restart'];
    const serviceCatalog = {};

    function service(id, label, chip, summary, es, keywords) {
        serviceCatalog[id] = { kind: 'service', label, chip, summary, es, keywords, related };
    }

    service('website', 'Website / landing', 'Website',
        'Responsive websites with clear content, lead capture, SEO foundations and performance work.',
        { label: 'Sitio web / landing', chip: 'Sitio web', summary: 'Sitios adaptables con contenido claro, captaci\u00f3n de consultas, bases de SEO y trabajo de rendimiento.' },
        ['website', 'web page', 'landing', 'site', 'redesign', 'seo', 'performance', 'pagina web', 'sitio web', 'rediseno', 'redisenar', 'pagina informativa']);
    service('booking', 'Booking / reservation system', 'Booking',
        'Reservation systems can combine availability, appointment rules, confirmations and administration. Payments are scoped when needed.',
        { label: 'Sistema de reservas', chip: 'Reservas', summary: 'Las reservas pueden reunir disponibilidad, reglas de citas, confirmaciones y administraci\u00f3n. Los pagos se definen si el proyecto los necesita.' },
        ['booking', 'reservation', 'reservations', 'appointment', 'appointments', 'calendar', 'availability', 'reservas', 'reserva', 'reservaciones', 'citas', 'cita', 'agenda', 'calendario', 'disponibilidad']);
    service('dashboard', 'Dashboard / portal', 'Dashboard',
        'Custom dashboards centralize records, users, permissions, reports and business workflows around the actual operation.',
        { label: 'Dashboard / portal', chip: 'Dashboard', summary: 'Los paneles a medida centralizan registros, usuarios, permisos, reportes y flujos seg\u00fan la operaci\u00f3n del negocio.' },
        ['dashboard', 'dashboards', 'portal', 'admin panel', 'client area', 'customer portal', 'crm', 'reporting', 'reports', 'permissions', 'roles', 'panel', 'panel administrativo', 'reporteria', 'reportes', 'permisos']);
    service('ecommerce', 'E-commerce / sales system', 'Store',
        'Online stores can include a product catalog, checkout, payment integrations, inventory and order notifications.',
        { label: 'Tienda / sistema de ventas', chip: 'Tienda', summary: 'Una tienda puede incluir cat\u00e1logo, checkout, integraciones de pago, inventario y notificaciones de pedidos.' },
        ['ecommerce', 'e commerce', 'store', 'shop', 'storefront', 'checkout', 'inventory', 'catalog', 'cart', 'woocommerce', 'tienda', 'carrito', 'cat\u00e1logo', 'inventario', 'pasarela', 'compras']);
    service('wordpress', 'WordPress / custom plugin', 'Plugin',
        'Custom PHP and WordPress plugins add business-specific workflows, administration and integrations.',
        { label: 'WordPress / plugin a medida', chip: 'Plugin', summary: 'Los plugins PHP y WordPress a medida permiten crear flujos, administraci\u00f3n e integraciones propias del negocio.' },
        ['wordpress', 'custom plugin', 'plugin', 'theme', 'php', 'shortcode', 'wp admin', 'plugin personalizado', 'tema']);
    service('automation', 'Automation / scripts', 'Automation',
        'Automation connects repeatable tasks, data synchronization, reports and internal utilities to reduce manual work.',
        { label: 'Automatizaci\u00f3n / scripts', chip: 'Automatizaci\u00f3n', summary: 'La automatizaci\u00f3n conecta tareas repetitivas, sincronizaci\u00f3n de datos, reportes y utilidades internas para reducir trabajo manual.' },
        ['automation', 'automate', 'script', 'scripts', 'python', 'repetitive', 'automated reports', 'automatizaci\u00f3n', 'automatizar', 'proceso repetitivo', 'tarea repetitiva', 'reporte automatico']);
    service('ai', 'AI tools / chatbots', 'AI',
        'AI-assisted workflows, knowledge-based tools and chatbots are scoped around useful business tasks and their data requirements.',
        { label: 'Herramientas de IA / chatbots', chip: 'IA', summary: 'Los flujos con IA, herramientas de conocimiento y chatbots se definen seg\u00fan tareas utiles y los datos que necesitan.' },
        ['ai', 'artificial intelligence', 'gpt', 'chatgpt', 'chatbot', 'chatbots', 'assistant', 'openai', 'knowledge base', 'ia', 'inteligencia artificial', 'asistente', 'base de conocimiento']);
    service('integrations', 'API / integrations', 'APIs',
        'Integrations connect systems through APIs, webhooks, synchronization rules and visibility into failures.',
        { label: 'API / integraciones', chip: 'APIs', summary: 'Las integraciones conectan sistemas mediante APIs, webhooks, reglas de sincronizaci\u00f3n y seguimiento de errores.' },
        ['api', 'apis', 'integration', 'integrations', 'webhook', 'webhooks', 'payment gateway', 'zapier', 'make.com', 'integraci\u00f3n', 'integraciones', 'conectar', 'sincronizaci\u00f3n']);
    service('custom', 'Custom software systems', 'Software',
        'Custom software starts with business rules, users and workflows, then selects the technology and delivery scope that fit them.',
        { label: 'Software a medida', chip: 'Software', summary: 'El software a medida parte de las reglas del negocio, usuarios y procesos para definir la tecnolog\u00eda y el alcance adecuados.' },
        ['custom software', 'software systems', 'business system', 'internal system', 'software a medida', 'software personalizado', 'sistema interno', 'sistema a medida']);
    service('frontend', 'Front-end engineering', 'Front end',
        'Front-end work covers responsive interfaces, accessible interactions, application states and integration with the underlying system.',
        { label: 'Desarrollo front-end', chip: 'Front end', summary: 'El front-end abarca interfaces adaptables, interacciones accesibles, estados de la aplicaci\u00f3n y conexion con el sistema.' },
        ['front end', 'frontend', 'react', 'javascript interface', 'interfaz', 'interfaces']);
    service('backend', 'Back-end / databases', 'Back end',
        'Back-end work covers application rules, databases, authentication, permissions and reliable data flows.',
        { label: 'Back-end / bases de datos', chip: 'Back end', summary: 'El back-end comprende reglas de la aplicaci\u00f3n, bases de datos, autenticaci\u00f3n, permisos y flujos de datos fiables.' },
        ['back end', 'backend', 'database', 'databases', 'authentication', 'base de datos', 'bases de datos', 'autenticaci\u00f3n']);
    service('design', 'UX/UI product design', 'UX/UI',
        'Product design organizes information, user journeys, interface states and visual hierarchy before implementation.',
        { label: 'Dise\u00f1o de producto UX/UI', chip: 'UX/UI', summary: 'El dise\u00f1o de producto organiza informaci\u00f3n, recorridos de usuario, estados de interfaz y jerarqu\u00eda visual antes de implementar.' },
        ['ux', 'ui', 'ux ui', 'product design', 'user experience', 'dise\u00f1o de producto', 'dise\u00f1o ux', 'dise\u00f1o ui', 'experiencia de usuario']);

    const intents = {
        support: ['Support / maintenance', 'Support', 'Soporte / mantenimiento', 'Soporte', ['support', 'maintenance', 'hosting', 'domain', 'fix', 'bug', 'broken', 'restore', 'backup', 'error', 'update', 'soporte', 'mantenimiento', 'dominio', 'arreglar', 'falla', 'fallo', 'restaurar', 'respaldo', 'actualizar']],
        budget: ['Quote / budget', 'Quote', 'Cotizaci\u00f3n / presupuesto', 'Cotizaci\u00f3n', ['budget', 'price', 'cost', 'quote', 'estimate', 'pricing', 'how much', 'presupuesto', 'precio', 'costo', 'cotizaci\u00f3n', 'cotizar', 'cuanto cuesta', 'cuanto vale', 'cuanto cobran']],
        timeline: ['Timeline / delivery', 'Timeline', 'Plazo / entrega', 'Plazo', ['timeline', 'deadline', 'delivery', 'how long', 'duration', 'urgent', 'asap', 'tiempo', 'fecha', 'plazo', 'entrega', 'urgente', 'cuanto tarda', 'cuanto dura']],
        projects: ['Public project archive', 'Projects', 'Portafolio p\u00fablico', 'Proyectos', ['projects', 'portfolio', 'deployments', 'case studies', 'examples', 'proyectos', 'portafolio', 'trabajos', 'casos de exito', 'ejemplos']],
        social: ['Social channels', 'Social', 'Redes sociales', 'Redes', ['social', 'social media', 'instagram', 'facebook', 'linkedin', 'github', 'follow', 'redes', 'redes sociales', 'seguir']],
        services: ['Blackhole services', 'Services', 'Servicios de Blackhole', 'Servicios', ['services', 'what do you do', 'what can you build', 'servicios', 'que hacen', 'que puedes hacer']],
        contact: ['Contact', 'Contact', 'Contacto', 'Contacto', ['contact', 'whatsapp', 'email', 'call', 'meeting', 'phone', 'number', 'form', 'contacto', 'correo', 'llamar', 'reunion', 'numero', 'telefono', 'celular', 'formulario']],
        restart: ['New conversation', 'Start over', 'Nueva conversaci\u00f3n', 'Empezar de nuevo', ['start over', 'reset conversation', 'new conversation', 'empezar de nuevo', 'reiniciar conversaci\u00f3n', 'nueva conversaci\u00f3n']]
    };
    Object.entries(intents).forEach(([id, [label, chip, labelEs, chipEs, keywords]]) => {
        serviceCatalog[id] = { kind: 'intent', label, chip, es: { label: labelEs, chip: chipEs }, keywords, related: defaultQuickActions };
    });

    BH.assistantData = {
        links: {
            contact: '#contact', email: 'mailto:info@blackholesys.com',
            github: 'https://github.com/bryanpineda-dev', instagram: 'https://www.instagram.com/blackholesys',
            linkedin: 'https://www.linkedin.com/company/blackhole-sys/', facebook: 'https://www.facebook.com/blackholesys',
            whatsapp: 'https://wa.me/50670827504'
        },
        limits: { message: 2000, context: 6000, turns: 40 },
        defaultQuickActions,
        fallbackQuickActions: ['custom', 'website', 'booking', 'ecommerce', 'contact', 'restart'],
        defaultWhatsAppText: 'Hi Bryan, I want to talk about a project for Blackhole Systems.',
        serviceCatalog
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
