/** Public service knowledge only; never operational client records. */
(function (BH) {
    'use strict';
    const defaultQuickActions = ['website', 'booking', 'dashboard', 'ecommerce', 'automation', 'ai'];
    const related = ['budget', 'timeline', 'support', 'projects', 'contact', 'restart'];
    const serviceCatalog = {};

    function service(id, label, chip, summary, es, keywords, question) {
        serviceCatalog[id] = { kind: 'service', label, chip, summary, question, es, keywords, related };
    }

    service('website', 'Website / landing', 'Website',
        'Responsive websites with clear content, lead capture, SEO foundations and performance work.',
        { label: 'Sitio web / landing', chip: 'Sitio web', summary: 'Sitios web adaptables a distintos dispositivos, con contenido claro, formularios de contacto, bases de SEO y buen rendimiento.', question: '\u00bfQu\u00e9 necesitas que incluya tu sitio web?' },
        ['website', 'web page', 'landing', 'site', 'redesign', 'seo', 'performance', 'pagina web', 'sitio web', 'rediseno', 'redisenar', 'pagina informativa'], 'What does your website need to include?');
    service('booking', 'Booking / reservation system', 'Booking',
        'Reservation systems can combine availability, appointment rules, confirmations and administration. Payments are scoped when needed.',
        { label: 'Sistema de reservas', chip: 'Reservas', summary: 'Los sistemas de reservas pueden gestionar disponibilidad, reglas de citas, confirmaciones y administraci\u00f3n. La integraci\u00f3n de pagos se define seg\u00fan lo que necesite el proyecto.', question: '\u00bfQu\u00e9 tipo de reservas necesitas gestionar?' },
        ['booking', 'reservation', 'reservations', 'appointment', 'appointments', 'calendar', 'availability', 'reservas', 'reserva', 'reservaciones', 'citas', 'cita', 'agenda', 'calendario', 'disponibilidad'], 'What type of reservations do you need to manage?');
    service('dashboard', 'Dashboard / portal', 'Dashboard',
        'Custom dashboards centralize records, users, permissions, reports and business workflows around the actual operation.',
        { label: 'Dashboard / portal', chip: 'Dashboard', summary: 'Los paneles a medida centralizan registros, usuarios, permisos, reportes y procesos seg\u00fan la operaci\u00f3n del negocio.', question: '\u00bfQu\u00e9 necesitas gestionar desde el panel?' },
        ['dashboard', 'dashboards', 'portal', 'admin panel', 'client area', 'customer portal', 'crm', 'reporting', 'reports', 'permissions', 'roles', 'panel', 'panel administrativo', 'reporteria', 'reportes', 'permisos'], 'What do you need to manage from the dashboard?');
    service('ecommerce', 'E-commerce / sales system', 'Store',
        'Online stores can include a product catalog, checkout, payment integrations, inventory and order notifications.',
        { label: 'Tienda / sistema de ventas', chip: 'Tienda', summary: 'Tu tienda puede incluir un cat\u00e1logo de productos, proceso de compra, integraciones de pago, control de inventario y notificaciones de pedidos.', question: '\u00bfQu\u00e9 funciones necesitas que tenga tu tienda?' },
        ['ecommerce', 'e commerce', 'store', 'shop', 'storefront', 'checkout', 'inventory', 'catalog', 'cart', 'woocommerce', 'tienda', 'carrito', 'cat\u00e1logo', 'inventario', 'pasarela', 'compras'], 'What features does your store need?');
    service('wordpress', 'WordPress / custom plugin', 'Plugin',
        'Custom PHP and WordPress plugins add business-specific workflows, administration and integrations.',
        { label: 'WordPress / plugin a medida', chip: 'Plugin', summary: 'Los plugins a medida para WordPress permiten crear funciones, paneles de administraci\u00f3n e integraciones espec\u00edficas para tu negocio.', question: '\u00bfQu\u00e9 funci\u00f3n necesitas agregar a WordPress?' },
        ['wordpress', 'custom plugin', 'plugin', 'theme', 'php', 'shortcode', 'wp admin', 'plugin personalizado', 'tema'], 'What functionality would you like to add to WordPress?');
    service('automation', 'Automation / scripts', 'Automation',
        'Automation connects repeatable tasks, data synchronization, reports and internal utilities to reduce manual work.',
        { label: 'Automatizaci\u00f3n / scripts', chip: 'Automatizaci\u00f3n', summary: 'Automatizamos tareas repetitivas, sincronizaci\u00f3n de datos y generaci\u00f3n de reportes para reducir el trabajo manual.', question: '\u00bfQu\u00e9 tarea te gustar\u00eda automatizar?' },
        ['automation', 'automate', 'script', 'scripts', 'python', 'repetitive', 'automated reports', 'automatizaci\u00f3n', 'automatizar', 'proceso repetitivo', 'tarea repetitiva', 'reporte automatico'], 'What task would you like to automate?');
    service('ai', 'AI tools / chatbots', 'AI',
        'AI-assisted workflows, knowledge-based tools and chatbots are scoped around useful business tasks and their data requirements.',
        { label: 'Herramientas de IA / chatbots', chip: 'IA', summary: 'Dise\u00f1amos herramientas con IA y chatbots seg\u00fan las tareas que necesitas resolver y la informaci\u00f3n que deben consultar.', question: '\u00bfEn qu\u00e9 tarea necesitas ayuda de una herramienta o asistente?' },
        ['ai', 'artificial intelligence', 'gpt', 'chatgpt', 'chatbot', 'chatbots', 'assistant', 'openai', 'knowledge base', 'ia', 'inteligencia artificial', 'asistente', 'base de conocimiento'], 'What task should your tool or assistant help with?');
    service('integrations', 'API / integrations', 'APIs',
        'Integrations connect systems through APIs, webhooks, synchronization rules and visibility into failures.',
        { label: 'API / integraciones', chip: 'APIs', summary: 'Conectamos sistemas mediante APIs y webhooks, con reglas de sincronizaci\u00f3n y seguimiento de errores.', question: '\u00bfQu\u00e9 sistemas necesitas conectar?' },
        ['api', 'apis', 'integration', 'integrations', 'webhook', 'webhooks', 'payment gateway', 'zapier', 'make.com', 'integraci\u00f3n', 'integraciones', 'conectar', 'sincronizaci\u00f3n'], 'Which systems do you need to connect?');
    service('custom', 'Custom software systems', 'Software',
        'We define the business rules, users and workflows, then choose the technology and scope that fit your project.',
        { label: 'Software a medida', chip: 'Software', summary: 'Desarrollamos software a partir de las reglas y procesos de tu negocio, con la tecnolog\u00eda y el alcance que el proyecto necesita.', question: '\u00bfQu\u00e9 proceso de tu negocio te gustar\u00eda mejorar?' },
        ['custom software', 'software systems', 'business system', 'internal system', 'software a medida', 'software personalizado', 'sistema interno', 'sistema a medida'], 'Which business process would you like to improve?');
    service('frontend', 'Front-end engineering', 'Front end',
        'Front-end work covers responsive interfaces, accessible interactions, application states and integration with the underlying system.',
        { label: 'Desarrollo front-end', chip: 'Front end', summary: 'El front-end abarca interfaces adaptables, interacciones accesibles, estados de la aplicaci\u00f3n y conexi\u00f3n con el sistema.', question: '\u00bfQu\u00e9 necesitan hacer los usuarios en la interfaz?' },
        ['front end', 'frontend', 'react', 'javascript interface', 'interfaz', 'interfaces'], 'What do users need to be able to do in the interface?');
    service('backend', 'Back-end / databases', 'Back end',
        'Back-end work covers application rules, databases, authentication, permissions and reliable data flows.',
        { label: 'Back-end / bases de datos', chip: 'Back end', summary: 'El back-end gestiona la l\u00f3gica de la aplicaci\u00f3n, las bases de datos, la autenticaci\u00f3n, los permisos y los flujos de informaci\u00f3n.', question: '\u00bfQu\u00e9 necesitas que gestione el sistema?' },
        ['back end', 'backend', 'database', 'databases', 'authentication', 'base de datos', 'bases de datos', 'autenticaci\u00f3n'], 'What does your system need to manage?');
    service('design', 'UX/UI product design', 'UX/UI',
        'Product design organizes information, user journeys, interface states and visual hierarchy before implementation.',
        { label: 'Dise\u00f1o de producto UX/UI', chip: 'UX/UI', summary: 'El dise\u00f1o de producto organiza la informaci\u00f3n, los recorridos de usuario, los estados de la interfaz y la jerarqu\u00eda visual antes del desarrollo.', question: '\u00bfQu\u00e9 necesitan hacer los usuarios en tu producto?' },
        ['ux', 'ui', 'ux ui', 'product design', 'user experience', 'dise\u00f1o de producto', 'dise\u00f1o ux', 'dise\u00f1o ui', 'experiencia de usuario'], 'What do users need to be able to do in your product?');

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
        defaultWhatsAppText: 'Hi Bryan, I would like to discuss a project with Blackhole Systems.',
        serviceCatalog
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
