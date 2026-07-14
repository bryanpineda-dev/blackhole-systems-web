/**
 * Deployment project data.
 * Keep this file free of DOM logic so the portfolio archive can grow safely.
 */
(function (namespace) {
    'use strict';

    namespace.projects = [
        {
            id: 'BH-001',
            name: 'SEBANA',
            url: 'https://sebanacr.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-bank-line',
            category: 'Booking System',
            industry: 'Institutional / Union Services',
            type: 'Informational Portal + Complex Booking Systems',
            role: 'Solo Developer',
            filters: ['featured', 'booking', 'systems', 'corporate'],
            summary: 'Full redesign for an institutional website plus complex reservation systems with payment flows, per diem calculations, and an independent psychology booking subpage in progress.',
            built: [
                'Complete informational website redesign',
                'Complex reservation flows with payment gateway support',
                'Per diem calculation system built in PHP',
                'Independent psychology subpage with its own booking logic'
            ],
            systems: [
                'Custom PHP reservation workflows',
                'Payment gateway integration',
                'Advanced calculation logic',
                'WordPress-based content management'
            ],
            stack: ['PHP', 'WordPress', 'Payments', 'Reservations', 'Custom Logic']
        },
        {
            id: 'BH-002',
            name: 'ALAI Boutique',
            url: 'https://alaiboutique.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-shopping-bag-3-line',
            category: 'E-Commerce System',
            industry: 'Fashion / Retail',
            type: 'Online Store + Custom Operations Dashboard',
            role: 'Solo Developer',
            filters: ['featured', 'commerce', 'systems'],
            summary: 'Elegant online clothing store focused on sales, with a custom PHP plugin for purchases, layaway orders, credit tracking, dashboards, and transactional email flows.',
            built: [
                'Custom storefront aligned with the client brand',
                'Personalized purchase, layaway, and credit tracking flows',
                'Private dashboard for operational monitoring',
                'Custom email flows for customer communication'
            ],
            systems: [
                'Direct WordPress plugin development',
                'PHP business logic',
                'Dashboard views for order and credit follow-up',
                'Custom transactional emails'
            ],
            stack: ['PHP', 'WordPress Plugin', 'E-Commerce', 'Dashboard', 'Email']
        },
        {
            id: 'BH-003',
            name: 'Mariam Enfermera',
            url: 'https://mariamenfermera.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-nurse-line',
            category: 'Booking System',
            industry: 'Healthcare / Nursing',
            type: 'Informational Website + Reservation System',
            role: 'Solo Developer',
            filters: ['featured', 'booking', 'systems'],
            summary: 'Extensive informational healthcare website supported by a fully custom PHP reservation system and private dashboard monitoring.',
            built: [
                'Service-focused informational website',
                'Custom reservation flow for healthcare appointments',
                'Private dashboard for booking monitoring',
                'WhatsApp/contact paths for direct lead handling'
            ],
            systems: [
                'Full PHP reservation logic',
                'WordPress integration',
                'Dashboard monitoring',
                'Chatbot and WhatsApp contact layer'
            ],
            stack: ['PHP', 'WordPress', 'Reservations', 'Dashboard', 'WhatsApp']
        },
        {
            id: 'BH-004',
            name: 'Niuvort Solutions',
            url: 'https://niuvort.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-building-4-line',
            category: 'Business Platform',
            industry: 'Agency / Digital Services',
            type: 'Modern Landing + Internal Systems Matrix',
            role: 'Solo Developer',
            association: 'In association with Niuvort Solutions',
            filters: ['featured', 'corporate', 'systems', 'agency'],
            summary: 'Modern agency landing page with dynamic sliders and cards, plus a matrix plugin that hosts employee marks, vacation control, quotation control, and authenticated internal workflows.',
            built: [
                'Modern informational landing with dynamic sections',
                'Internal employee marks system',
                'Vacation control system',
                'Quotation control system with authenticated access'
            ],
            systems: [
                'Matrix WordPress plugin',
                'Custom PHP login flows',
                'Internal dashboards',
                'Dynamic front-end components'
            ],
            stack: ['PHP', 'WordPress Plugin', 'Internal Systems', 'Dashboard', 'Landing']
        },
        {
            id: 'BH-005',
            name: 'Coxbrand Academy',
            url: 'https://coxbrand-academy.com/',
            status: 'IN_PROGRESS',
            statusType: 'pending',
            icon: 'ri-graduation-cap-line',
            category: 'Education Platform',
            industry: 'Academy / Education',
            type: 'Interactive PHP Website + Enrollment Dashboard',
            role: 'Solo Developer',
            filters: ['featured', 'content', 'systems'],
            summary: 'Modern and interactive academy website with extensive content, an advanced enrollment form, and a custom dashboard. Functional and moving through versioned development.',
            built: [
                'Interactive informational academy experience',
                'Advanced enrollment form',
                'Custom dashboard connection',
                'Versioned development for an active project'
            ],
            systems: [
                'PHP-driven form logic',
                'Dashboard integration',
                'Custom content structure',
                'Lead capture workflow'
            ],
            stack: ['PHP', 'Forms', 'Dashboard', 'Education', 'In Progress']
        },
        {
            id: 'BH-006',
            name: 'Meraki Travel CR',
            url: 'https://merakitravelcr.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-plane-line',
            category: 'Travel Website',
            industry: 'Travel Agency',
            type: 'Multipage Informational Website + CRM',
            role: 'Solo Developer',
            filters: ['featured', 'corporate', 'booking'],
            summary: 'Brand-book based multipage travel website with structured package information, prefilled WhatsApp messages for each package, and CRM integration.',
            built: [
                'Multipage travel website aligned with the brand book',
                'Package pages with complete client-facing information',
                'Prefilled WhatsApp messages per package',
                'CRM integration for lead handling'
            ],
            systems: [
                'WhatsApp conversion paths',
                'CRM integration',
                'Package content architecture',
                'Responsive front-end implementation'
            ],
            stack: ['WordPress', 'CRM', 'WhatsApp', 'Travel', 'Multipage']
        },
        {
            id: 'BH-007',
            name: 'Entre Cantones',
            url: 'https://entrecantones.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-newspaper-line',
            category: 'Content Platform',
            industry: 'Local News / Media',
            type: 'Editorial Website',
            role: 'Solo Developer',
            filters: ['content'],
            summary: 'Local news platform focused on fast publishing for main and secondary authors, supporting frequent daily posts with a sober design built for quick reading.',
            built: [
                'Editorial structure for local notes and news',
                'Author-focused publishing flow',
                'Design optimized for fast content consumption',
                'Daily posting support for high content rhythm'
            ],
            systems: [
                'WordPress editorial workflow',
                'Post/category architecture',
                'Responsive reading experience',
                'Content scalability'
            ],
            stack: ['WordPress', 'Editorial', 'Content', 'Authors', 'News']
        },
        {
            id: 'BH-008',
            name: 'Polyacril',
            url: 'https://polyacril-ca.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-layout-grid-line',
            category: 'Commerce Catalog',
            industry: 'Polycarbonate / Materials',
            type: 'Informational Website + WhatsApp Order Portal',
            role: 'Solo Developer',
            filters: ['commerce', 'corporate'],
            summary: 'Informational and sales portal for a polycarbonate leader, with variable products for exact measurements and WhatsApp order summaries instead of payment checkout.',
            built: [
                'Informational corporate website',
                'Online inventory sales flow without payment gateway',
                'Variable products for exact measurements',
                'WhatsApp order summary routing'
            ],
            systems: [
                'Variable product configuration',
                'WhatsApp order summary',
                'CRM integration',
                'Catalog architecture'
            ],
            stack: ['WordPress', 'WooCommerce', 'WhatsApp', 'CRM', 'Catalog']
        },
        {
            id: 'BH-009',
            name: 'Thermo en Linea',
            url: 'https://thermoenlinea.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-fire-line',
            category: 'E-Commerce',
            industry: 'Water Heaters',
            type: 'Multipage Website + Payment Store',
            role: 'Solo Developer',
            filters: ['commerce', 'corporate'],
            summary: 'Informational multipage website and purchase portal for water heaters, including direct online checkout through a payment gateway.',
            built: [
                'Multipage informational website',
                'Online product purchase portal',
                'Payment gateway checkout',
                'Product education and conversion structure'
            ],
            systems: [
                'WooCommerce checkout',
                'Payment gateway integration',
                'Product catalog',
                'Responsive purchase flow'
            ],
            stack: ['WordPress', 'WooCommerce', 'Payments', 'Catalog', 'Sales']
        },
        {
            id: 'BH-010',
            name: 'Rinnai CR',
            url: 'https://rinnai.cr/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-home-gear-line',
            category: 'Corporate Catalog',
            industry: 'Home Systems / Appliances',
            type: 'Custom Redesign + Product Catalog',
            role: 'Solo Developer',
            filters: ['corporate'],
            summary: 'Custom redesign based on a prototype provided by the Japanese headquarters, focused on brand alignment and catalog-style product presentation.',
            built: [
                'Redesign based on external prototype',
                'Informational website structure',
                'Product catalog presentation',
                'Brand-aligned front-end implementation'
            ],
            systems: [
                'Custom WordPress front-end',
                'Catalog structure',
                'Brand prototype adaptation',
                'Responsive redesign'
            ],
            stack: ['WordPress', 'Redesign', 'Catalog', 'Brand System', 'Frontend']
        },
        {
            id: 'BH-011',
            name: 'All Fire Products',
            url: 'https://allfireproducts.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-shield-star-line',
            category: 'Corporate Catalog',
            industry: 'Tactical / Medical Supplies',
            type: 'Multipage Informational Website + Catalog',
            role: 'Solo Developer',
            filters: ['corporate'],
            summary: 'Multipage informational website with a product catalog, built around the brand identity for a tactical and medical supplies company.',
            built: [
                'Brand-based multipage website',
                'Product catalog without online purchase',
                'Industry-focused content structure',
                'Responsive corporate presentation'
            ],
            systems: [
                'Catalog content architecture',
                'WordPress content management',
                'Brand identity implementation',
                'Lead-oriented navigation'
            ],
            stack: ['WordPress', 'Catalog', 'Corporate', 'Multipage', 'Brand']
        },
        {
            id: 'BH-012',
            name: 'My Choice CR',
            url: 'https://mychoicecr.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-handbag-line',
            category: 'E-Commerce',
            industry: 'Accessories / Retail',
            type: 'Sales-Focused Online Store',
            role: 'Solo Developer',
            filters: ['commerce'],
            summary: 'Virtual store for women accessories, focused entirely on sales with payment gateway support and a custom design guided by client feedback.',
            built: [
                'Sales-focused virtual store',
                'Custom design based on client direction',
                'Payment gateway checkout',
                'Responsive shopping experience'
            ],
            systems: [
                'WooCommerce store setup',
                'Payment gateway integration',
                'Product catalog',
                'Conversion-focused storefront'
            ],
            stack: ['WordPress', 'WooCommerce', 'Payments', 'Retail', 'Storefront']
        },
        {
            id: 'BH-013',
            name: 'Dulce Hogar',
            url: 'https://dulcehogar.cr/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-cup-line',
            category: 'Brand Website',
            industry: 'Cafe / Food',
            type: 'Identity-Based Website + Menu',
            role: 'Solo Developer',
            filters: ['corporate'],
            summary: 'Warm identity-based website for a home-style cafe, including a general product menu and brand-aligned visual presentation.',
            built: [
                'Brand-aligned cafe website',
                'General menu presentation',
                'Warm visual direction based on identity',
                'Responsive informational experience'
            ],
            systems: [
                'WordPress content structure',
                'Menu architecture',
                'Brand-based design implementation',
                'Mobile-friendly presentation'
            ],
            stack: ['WordPress', 'Menu', 'Brand', 'Cafe', 'Responsive']
        },
        {
            id: 'BH-014',
            name: 'Niuvort Entertainment',
            url: 'https://niuvortentertainment.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-camera-lens-line',
            category: 'Event Landing',
            industry: 'Photobooths / Events',
            type: 'Modern Informational Landing',
            role: 'Solo Developer',
            association: 'In association with Niuvort Solutions',
            filters: ['agency', 'corporate'],
            summary: 'Modern informational landing for photobooths, events, and glambot services, derived from the Niuvort brand ecosystem.',
            built: [
                'Modern landing page',
                'Event service presentation',
                'Photobooth and glambot content structure',
                'Conversion paths for inquiries'
            ],
            systems: [
                'Landing page front-end',
                'Brand ecosystem consistency',
                'Responsive service sections',
                'WhatsApp/contact routing'
            ],
            stack: ['WordPress', 'Landing', 'Events', 'Brand System', 'Niuvort']
        },
        {
            id: 'BH-015',
            name: 'NVT Online',
            url: 'https://nvtonline.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-shopping-cart-2-line',
            category: 'WhatsApp Commerce',
            industry: 'Online Store',
            type: 'Modern Storefront + WhatsApp Orders',
            role: 'Solo Developer',
            association: 'In association with Niuvort Solutions',
            filters: ['agency', 'commerce'],
            summary: 'Online store with a modern landing experience and direct WhatsApp order routing instead of a traditional checkout flow.',
            built: [
                'Modern e-commerce landing',
                'Product purchase intent flow',
                'Direct WhatsApp order routing',
                'Mobile-first sales experience'
            ],
            systems: [
                'WhatsApp commerce flow',
                'Product presentation',
                'Responsive storefront',
                'Niuvort ecosystem implementation'
            ],
            stack: ['WordPress', 'Commerce', 'WhatsApp', 'Landing', 'Niuvort']
        },
        {
            id: 'BH-016',
            name: 'Tu Web Ahora',
            url: 'https://tuwebahora.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-pages-line',
            category: 'Business Platform',
            industry: 'Web Services',
            type: 'Landing for Websites Sold in Installments',
            role: 'Solo Developer',
            association: 'In association with Niuvort Solutions',
            filters: ['agency', 'corporate'],
            summary: 'Landing page for a system that sells websites through payment plans, with direct WhatsApp ordering and a clear offer structure.',
            built: [
                'Offer-focused landing page',
                'Website package presentation',
                'WhatsApp order flow',
                'Clear conversion path for installment-based sales'
            ],
            systems: [
                'Landing conversion flow',
                'WhatsApp lead routing',
                'Package structure',
                'Niuvort ecosystem implementation'
            ],
            stack: ['WordPress', 'Landing', 'WhatsApp', 'Sales', 'Niuvort']
        }
    ];
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
