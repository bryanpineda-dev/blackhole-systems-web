/**
 * Deployment project data.
 * Keep this file free of DOM logic so the portfolio archive can grow safely.
 */
(function (namespace) {
    'use strict';

    namespace.projects = [
        {
            id: 'BH-001',
            preview: { src: 'assets/images/projects/bh-001-sebana.jpg', width: 1440, height: 810 },
            name: 'SEBANA',
            url: 'https://sebanacr.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-bank-line',
            category: 'Booking System',
            industry: 'Institutional / Union Services',
            type: 'Institutional Portal + Modular WordPress System',
            role: 'Solo Developer',
            filters: ['featured', 'booking', 'systems', 'corporate'],
            summary: 'A modular WordPress platform for SEBANA that connects the institutional site with recreation center bookings, membership applications, and appointment workflows.',
            built: [
                'Institutional site and content management',
                'Recreation center booking flows with availability and billing',
                'Membership application forms and staff review tools',
                'Psychology appointment and per diem workflows'
            ],
            systems: [
                'SEBANA Matriz: modular WordPress architecture',
                'Custom PHP workflows for forms and administration',
                'Booking checkout and payment gateway integration',
                'Dedicated panels for institutional operations'
            ],
            stack: ['PHP', 'WordPress', 'Payments', 'Reservations', 'Custom Logic']
        },
        {
            id: 'BH-002',
            preview: { src: 'assets/images/projects/bh-002-alai-boutique.jpg', width: 1265, height: 712 },
            name: 'ALAI Boutique',
            url: 'https://alaiboutique.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-shopping-bag-3-line',
            category: 'E-Commerce System',
            industry: 'Fashion / Retail',
            type: 'Online Store + In-Store Point of Sale',
            role: 'Solo Developer',
            filters: ['featured', 'commerce', 'systems'],
            summary: 'Fashion storefront and in-store point of sale built around shared WooCommerce inventory, with discounts, digital receipts, credit, and layaway workflows.',
            built: [
                'Custom storefront, catalog, and checkout',
                'In-store sales with size and color variants and discounts',
                'Credit and layaway tracking in a dedicated admin dashboard',
                'Digital receipts with a WhatsApp sharing workflow'
            ],
            systems: [
                'Custom PHP plugin for WordPress and WooCommerce',
                'Shared inventory and temporary stock reservations',
                'Cash and transfer records with AFINIA card payment links',
                'In-store sales history and digital receipt retrieval'
            ],
            stack: ['PHP', 'WordPress Plugin', 'E-Commerce', 'Dashboard', 'Email', 'WooCommerce']
        },
        {
            id: 'BH-003',
            preview: { src: 'assets/images/projects/bh-003-mariam-enfermera.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-004-niuvort-solutions.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-005-coxbrand-academy.jpg', width: 1440, height: 810 },
            name: 'Coxbrand Academy',
            url: 'https://coxbrand-academy.com/',
            status: 'IN_PROGRESS',
            statusType: 'pending',
            icon: 'ri-graduation-cap-line',
            category: 'Education Platform',
            industry: 'Academy / Education',
            type: 'Academy Website + Academic Operations Platform',
            role: 'Solo Developer',
            filters: ['featured', 'content', 'systems'],
            summary: 'Public academy website and enrollment flow connected to custom academic operations. The student experience remains in development.',
            built: [
                'Public academy pages and enrollment form',
                'Staff workspace for enrollments, groups, and student records',
                'Academic planning, assignment, and materials workflows',
                'Role-based foundations for the student portal'
            ],
            systems: [
                'Custom WordPress and PHP academic modules',
                'Separate staff and student access rules',
                'Calendar, notices, and academic resources',
                'Administrative tracking across enrollment and courses'
            ],
            stack: ['PHP', 'Forms', 'Dashboard', 'Education', 'In Progress', 'WordPress']
        },
        {
            id: 'BH-006',
            preview: { src: 'assets/images/projects/bh-006-meraki-travel-cr.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-007-entre-cantones.jpg', width: 1440, height: 810 },
            name: 'Entre Cantones',
            url: 'https://entrecantones.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-newspaper-line',
            category: 'Content Platform',
            industry: 'Local News / Media',
            type: 'Editorial Website + Publishing System',
            role: 'Solo Developer',
            filters: ['content'],
            summary: 'Local news publication with a custom WordPress front page, paginated sections, and article layouts designed for regular publishing and easy reading.',
            built: [
                'Editorial homepage with masthead and latest-news ticker',
                'Category pages with pagination and editorial sidebars',
                'Article pages with metadata and related stories',
                'Publishing workflow for multiple authors'
            ],
            systems: [
                'Custom WordPress editorial template matrix',
                'Dynamic sections driven by post categories',
                'Responsive article layouts and sharing controls',
                'Configurable routing for editorial templates'
            ],
            stack: ['WordPress', 'Editorial', 'Content', 'Authors', 'News']
        },
        {
            id: 'BH-008',
            preview: { src: 'assets/images/projects/bh-008-polyacril.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-009-thermo-en-linea.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-010-rinnai-cr.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-011-all-fire-products.jpg', width: 1440, height: 810 },
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
            id: 'BH-013',
            preview: { src: 'assets/images/projects/bh-013-dulce-hogar.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-014-niuvort-entertainment.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-015-nvt-online.jpg', width: 1440, height: 810 },
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
            preview: { src: 'assets/images/projects/bh-016-tu-web-ahora.jpg', width: 1440, height: 810 },
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
        },
        {
            id: 'BH-017',
            preview: { src: 'assets/images/projects/bh-017-troleando-por-mexico.jpg', width: 1440, height: 810 },
            name: 'Troleando por Mexico',
            url: 'https://troleandopormexico.com/',
            status: 'IN_PROGRESS',
            statusType: 'pending',
            icon: 'ri-plane-line',
            category: 'Travel Website',
            industry: 'Travel / Tourism',
            type: 'Custom Website + Destination Catalog',
            role: 'Solo Developer',
            filters: ['corporate'],
            summary: 'Travel website for tours in Mexico, with a filterable destination catalog, extensive photo galleries, and WhatsApp inquiries tied to each tour.',
            built: [
                'Redesign with home, about, and destination pages',
                'Filterable catalog and individual tour pages',
                'Destination galleries with full-image viewing',
                'WhatsApp inquiries that identify the selected tour'
            ],
            systems: [
                'Reusable PHP templates through WordPress shortcodes',
                'Responsive masonry galleries with progressive loading',
                'Destination content managed without a page builder',
                'Tour inquiries without an online booking checkout'
            ],
            stack: ['PHP', 'WordPress', 'Shortcodes', 'WhatsApp', 'Travel']
        },
        {
            id: 'BH-018',
            preview: { src: 'assets/images/projects/bh-018-vision-territorial.jpg', width: 1440, height: 810 },
            name: 'Vision Territorial',
            url: 'https://visionterritorialcr.com/',
            status: 'DEPLOYED',
            statusType: 'success',
            icon: 'ri-file-search-line',
            category: 'Information Platform',
            industry: 'Municipal Information',
            type: 'Custom WordPress Platform + PDF Search',
            role: 'Solo Developer',
            association: 'Agency collaboration',
            filters: ['content', 'systems', 'agency'],
            summary: 'Complete custom web platform with intelligent search powered by each canton\'s PDF documents, a WordPress plugin matrix, and locally managed data without third-party data dependencies.',
            built: [
                'Complete website and system built from scratch',
                'Intelligent search based on canton PDF documents',
                'Custom WordPress plugin matrix',
                'Local storage for the platform data'
            ],
            systems: [
                'Search driven by canton PDF documents',
                'Custom WordPress plugin architecture',
                'Locally stored and managed platform data',
                'Data management without third-party dependencies'
            ],
            stack: ['WordPress', 'Custom Plugin', 'PDF Search', 'Local Data']
        },
        {
            id: 'BH-019',
            preview: { src: 'assets/images/projects/bh-019-field-report-studio.jpg', width: 1280, height: 720, alt: 'Field Report Studio dashboard with sample service reports' },
            name: 'Field Report Studio',
            sourceUrl: 'https://github.com/bryanpineda-dev/field-report-studio',
            status: 'LOCAL_APP',
            statusType: 'success',
            icon: 'ri-file-search-line',
            category: 'Field Reporting Software',
            industry: 'Field Services',
            type: 'Local Reporting App + PDF Export',
            role: 'Solo Developer',
            association: 'Blackhole Systems product',
            filters: ['systems'],
            summary: 'Local software for service teams to create numbered field reports, keep a searchable history, and export branded PDFs without a cloud subscription.',
            built: [
                'Reporting workspace with searchable local history',
                'Reusable templates for common service visits',
                'Company branding and bilingual interface',
                'Numbered PDF exports for sharing with customers'
            ],
            systems: [
                'Python application with SQLite storage',
                'Local report creation and export',
                'Configurable templates and brand settings',
                'Public Community edition with sample reports'
            ],
            stack: ['Python', 'SQLite', 'PDF Export', 'Local Storage']
        },
        {
            id: 'BH-020',
            preview: { src: 'assets/images/projects/bh-020-presencecue.jpg', width: 1400, height: 620, alt: 'PresenceCue workflow diagram: camera detects a visitor, plays a welcome video, then resumes the gallery' },
            name: 'PresenceCue',
            status: 'WINDOWS_APP',
            statusType: 'private',
            icon: 'ri-camera-lens-line',
            category: 'Interactive Display Software',
            industry: 'Events / Interactive Displays',
            type: 'Windows App + Camera Input',
            role: 'Solo Developer',
            filters: ['systems'],
            summary: 'Windows app that uses a camera to detect when someone approaches, plays a welcome video on the selected display, and then returns to the event gallery.',
            built: [
                'Camera and display selection for event operators',
                'Presence-triggered full-screen video playback',
                'Gallery playback with automatic resumption',
                'Timing and orientation controls for each setup'
            ],
            systems: [
                'Camera-based presence detection',
                'Playback on an operator-selected display',
                'Optional gallery sync from a public FotoShare event link',
                'Local gallery playback when connectivity is unavailable'
            ],
            stack: ['Python', 'Windows', 'FotoShare', 'Computer Vision']
        },
        {
            id: 'BH-021',
            preview: { src: 'assets/images/projects/bh-021-grupo-enduro-cr.jpg', width: 1440, height: 760, alt: 'Grupo Enduro CR compatibility finder with vehicle and parts filters in a demo environment' },
            name: 'Grupo Enduro CR',
            url: 'https://endurocr.com/',
            status: 'IN_PROGRESS',
            statusType: 'pending',
            icon: 'ri-shopping-bag-3-line',
            category: 'Commerce and Operations Platform',
            industry: 'Vehicle Parts / Retail',
            type: 'Parts Catalog + Commercial Operations Portal',
            role: 'Solo Developer',
            association: 'Agency collaboration',
            filters: ['commerce', 'systems', 'agency'],
            summary: 'A parts catalog that helps buyers find compatible products by vehicle, with a commercial portal for shops and workshops and tools for the Enduro team.',
            built: [
                'Public catalog for parts and accessories',
                'Compatibility finder by vehicle type, year, make, and model',
                'Customer portal and commercial account applications',
                'Administration for catalog, users, and commercial operations'
            ],
            systems: [
                'Custom WordPress matrix connected to WooCommerce',
                'Vehicle and product compatibility lookup',
                'Commercial account approval for shops and workshops',
                'Special-order inquiries and printable commercial documents'
            ],
            stack: ['PHP', 'WordPress', 'WooCommerce', 'Vehicle Compatibility']
        },
        {
            id: 'BH-022',
            preview: { src: 'assets/images/projects/bh-022-tu-assist.jpg', width: 1440, height: 900, alt: 'Tu Assist travel assistance quote form using a fictional agency in its demo environment' },
            name: 'Tu Assist',
            url: 'https://sauex.com/',
            status: 'IN_PROGRESS',
            statusType: 'pending',
            icon: 'ri-plane-line',
            category: 'Travel Assistance Quoting Platform',
            industry: 'Travel Assistance',
            type: 'Quote Comparison + Agency Portal',
            role: 'Solo Developer',
            filters: ['systems'],
            summary: 'Travel assistance quoting platform for direct customers and agencies, with plan comparison, quote history, and commercial document workflows.',
            built: [
                'Quote flow that uses region, travel dates, and ages',
                'Side-by-side comparison of assistance plans',
                'Commercial workspace for agencies and quotes',
                'Quote PDFs and history for provider documents'
            ],
            systems: [
                'Configurable plans, rates, and coverage rules',
                'Agency-specific access and quote follow-up',
                'Stored quotes with their original prices and coverage',
                'Demo environment with sample rates and no live payments'
            ],
            stack: ['React', 'TypeScript', 'Node.js', 'PDF Export']
        },
        {
            id: 'BH-023',
            preview: { src: 'assets/images/projects/bh-023-besos-inocentes.jpg', width: 1440, height: 870, alt: 'Besos Inocentes onboarding demo showing the empty registration form' },
            name: 'Besos Inocentes',
            status: 'WORDPRESS_APP',
            statusType: 'private',
            icon: 'ri-team-line',
            category: 'Community Platform',
            industry: 'Social / Dating',
            type: 'Member Platform + Moderation Tools',
            role: 'Solo Developer',
            filters: ['systems'],
            summary: 'An independent dating platform built from scratch, with member accounts, profiles, mutual matches, private chat, and tools for community moderation.',
            built: [
                'Public landing and registration with email verification',
                'Member profiles and discovery based on preferences',
                'Mutual matching and private conversations',
                'Management dashboard for reviews, members, and reports'
            ],
            systems: [
                'Custom WordPress plugin with separate member and staff access',
                'Profile visibility, blocking, and reporting controls',
                'Moderation queues for profile review and reports',
                'Account settings and access recovery'
            ],
            stack: ['PHP', 'WordPress', 'JavaScript', 'Moderation']
        },
        {
            id: 'BH-024',
            preview: { src: 'assets/images/projects/bh-024-save-outpost.jpg', width: 1440, height: 810, alt: 'Save Outpost diagram covering runs, progress, and friend comparisons without game artwork' },
            name: 'Save Outpost',
            status: 'EXPERIMENT',
            statusType: 'private',
            icon: 'ri-code-box-line',
            category: 'Playthrough Tracker',
            industry: 'Games / Interactive Tools',
            type: 'Game Library + Progress Journal',
            role: 'Solo Developer',
            association: 'Blackhole Lab',
            filters: ['lab'],
            summary: 'A playthrough tracker and game journal for organizing runs, keeping checklists, and comparing progress with accepted friends.',
            built: [
                'Game library with a progress view for each playthrough',
                'Searchable game checklists with completion filters',
                'Personal run notes and progress journal',
                'Side-by-side progress comparisons between friends'
            ],
            systems: [
                'Independent progress for each run',
                'Account-based continuity across devices',
                'Controls for sharing progress with accepted friends',
                'Progress backup and import workflow'
            ],
            stack: ['PHP', 'JavaScript', 'Progress Tracking', 'Game Checklists']
        },
        {
            id: 'BH-025',
            preview: { src: 'assets/images/projects/bh-025-trash-world.jpg', width: 1424, height: 802, alt: 'Daytime render of the western garden in Trash World' },
            name: 'Trash World',
            sourceUrl: 'https://github.com/bryanpineda-dev/trash-world',
            status: 'EXPERIMENT',
            statusType: 'private',
            icon: 'ri-code-box-line',
            category: 'Pixel Art Experiment',
            industry: 'Games / Interactive Art',
            type: 'Canvas 2D World + Autonomous Character',
            role: 'Solo Developer',
            association: 'Blackhole Lab',
            filters: ['lab'],
            summary: 'A mobile-first pixel-art world where a small autonomous character explores a forest cemetery as the light and surroundings change.',
            built: [
                'Canvas 2D world built around pixel-art environments',
                'Autonomous character behavior and ambient activity',
                'Day and night cycle with changing light',
                'Responsive viewport and local progress saving'
            ],
            systems: [
                'JavaScript simulation and Canvas 2D rendering',
                'Layered pixel art and environment updates',
                'Local persistence without a hosted account',
                'Original day and night preview renders'
            ],
            stack: ['JavaScript', 'Canvas 2D', 'Pixel Art', 'Local Storage']
        }
    ];
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
