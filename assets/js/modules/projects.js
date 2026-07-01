/**
 * Deployment archive.
 * Renders portfolio cards from structured data and controls the detail modal.
 */
(function (BH) {
    'use strict';

    const projects = [
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

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderList(items) {
        return items.map((item) => `
            <li>
                <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
                <span>${escapeHtml(item)}</span>
            </li>
        `).join('');
    }

    function renderProjectMeta(project) {
        const metadata = [
            { icon: 'ri-building-4-line', label: 'Industry', value: project.industry },
            { icon: 'ri-layout-masonry-line', label: 'Type', value: project.type },
            { icon: 'ri-user-star-line', label: 'Role', value: project.role },
            { icon: 'ri-links-line', label: 'Association', value: project.association || 'Direct build' }
        ];

        return metadata.map((item) => `
            <div class="project-modal-meta-item">
                <span class="project-modal-meta-icon" aria-hidden="true">
                    <i class="${escapeHtml(item.icon)}"></i>
                </span>
                <div class="project-modal-meta-copy">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                </div>
            </div>
        `).join('');
    }

    function renderProjectCard(project) {
        const tags = project.stack.slice(0, 4)
            .map((tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`)
            .join('');

        const association = project.association
            ? `<span class="d-association">${escapeHtml(project.association)}</span>`
            : '';

        return `
            <article class="dossier-card" data-project-id="${escapeHtml(project.id)}" data-filters="${escapeHtml(project.filters.join(' '))}">
                <div class="dossier-top-bar">
                    <span class="d-id">ID: #${escapeHtml(project.id)}</span>
                    <span class="d-status ${escapeHtml(project.statusType)}">${escapeHtml(project.status)}</span>
                </div>

                <div class="dossier-screen">
                    <div class="screen-placeholder">
                        <i class="${escapeHtml(project.icon)}" aria-hidden="true"></i>
                        <span>${escapeHtml(project.category)}</span>
                    </div>
                    <div class="screen-glare"></div>
                </div>

                <div class="dossier-info">
                    <div class="dossier-title-row">
                        <h3 class="d-title">${escapeHtml(project.name)}</h3>
                        <span class="d-type">${escapeHtml(project.industry)}</span>
                    </div>
                    <p class="d-desc">${escapeHtml(project.summary)}</p>
                    ${association}
                    <div class="d-tags">${tags}</div>

                    <div class="dossier-footer">
                        <div class="d-actions">
                            <button type="button" class="btn-terminal-sm view-live" data-project-details="${escapeHtml(project.id)}">
                                <span>VIEW_DETAILS</span>
                                <i class="ri-file-search-line" aria-hidden="true"></i>
                            </button>
                            <a href="${escapeHtml(project.url)}" class="btn-terminal-sm request-demo" target="_blank" rel="noopener">
                                <span>LIVE_URL</span>
                                <i class="ri-external-link-line" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    BH.initProjectFilter = function initProjectFilter() {
        const grid = document.querySelector('[data-project-grid]');
        const buttons = document.querySelectorAll('.cmd-btn');
        const count = document.querySelector('[data-project-count]');
        const modal = document.querySelector('[data-project-modal]');

        if (!grid || !buttons.length) return;

        grid.innerHTML = projects.map(renderProjectCard).join('');

        if (count) {
            count.textContent = String(projects.length);
        }

        const cards = [...grid.querySelectorAll('.dossier-card')];
        const deploySection = document.getElementById('deployments');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const filterExitDuration = reducedMotion ? 0 : 160;
        const filterEnterDuration = reducedMotion ? 0 : 260;
        let filterTransitionId = 0;

        function wait(duration) {
            return new Promise((resolve) => {
                if (!duration) {
                    resolve();
                    return;
                }

                window.setTimeout(resolve, duration);
            });
        }

        function applyFilter(filterValue) {
            cards.forEach((card) => {
                const filters = (card.dataset.filters || '').split(' ');
                const shouldShow = filterValue === 'all' || filters.includes(filterValue);

                card.hidden = !shouldShow;
            });
        }

        function getDeployScrollTarget() {
            if (!deploySection) return window.scrollY;
            const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 0;
            return Math.max(0, deploySection.getBoundingClientRect().top + window.scrollY - headerHeight + 8);
        }

        function waitForScrollEnd(duration) {
            return new Promise((resolve) => {
                let timeout = window.setTimeout(resolve, duration);

                if (!('onscrollend' in window)) return;

                const finish = () => {
                    window.clearTimeout(timeout);
                    window.removeEventListener('scrollend', finish);
                    resolve();
                };

                window.addEventListener('scrollend', finish, { once: true });
            });
        }

        function scrollToDeployments() {
            if (!deploySection) return Promise.resolve();

            const start = window.scrollY;
            const target = getDeployScrollTarget();
            const distance = Math.abs(target - start);

            if (start <= target + 48) {
                return Promise.resolve();
            }

            if (reducedMotion || distance < 24) {
                window.scrollTo({ top: target, behavior: 'auto' });
                return Promise.resolve();
            }

            const duration = Math.min(900, Math.max(360, distance * 0.32));

            window.scrollTo({ top: target, behavior: 'smooth' });
            return waitForScrollEnd(duration + 120);
        }

        async function transitionFilter(filterValue) {
            const transitionId = ++filterTransitionId;
            const lockedHeight = grid.offsetHeight;
            const shouldScroll = deploySection && window.scrollY > getDeployScrollTarget() + 48;

            grid.style.minHeight = `${lockedHeight}px`;
            grid.classList.remove('is-entering');
            grid.classList.add('is-transitioning', 'is-leaving');

            await wait(filterExitDuration);
            if (transitionId !== filterTransitionId) return;

            applyFilter(filterValue);
            grid.classList.remove('is-leaving');
            grid.classList.add('is-entering');

            const nextHeight = grid.scrollHeight;
            grid.style.minHeight = `${Math.max(lockedHeight, nextHeight, 240)}px`;
            grid.offsetHeight;

            requestAnimationFrame(() => {
                if (transitionId !== filterTransitionId) return;
                grid.classList.remove('is-entering');
            });

            await Promise.all([
                shouldScroll ? scrollToDeployments() : Promise.resolve(),
                wait(filterEnterDuration)
            ]);

            if (transitionId !== filterTransitionId) return;

            grid.classList.remove('is-transitioning');
            grid.style.minHeight = '';
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const filterValue = button.getAttribute('data-filter');

                if (button.classList.contains('active')) {
                    scrollToDeployments();
                    return;
                }

                buttons.forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                transitionFilter(filterValue);
            });
        });

        if (!modal) return;

        const modalFields = {
            icon: modal.querySelector('[data-project-modal-icon]'),
            id: modal.querySelector('[data-project-modal-id]'),
            status: modal.querySelector('[data-project-modal-status]'),
            title: modal.querySelector('[data-project-modal-title]'),
            summary: modal.querySelector('[data-project-modal-summary]'),
            meta: modal.querySelector('[data-project-modal-meta]'),
            built: modal.querySelector('[data-project-modal-built]'),
            systems: modal.querySelector('[data-project-modal-systems]'),
            tags: modal.querySelector('[data-project-modal-tags]'),
            live: modal.querySelector('[data-project-modal-live]')
        };

        function openModal(project) {
            if (!project) return;

            modalFields.icon.innerHTML = `<i class="${escapeHtml(project.icon)}" aria-hidden="true"></i><span>${escapeHtml(project.category)}</span>`;
            modalFields.id.textContent = `#${project.id}`;
            modalFields.status.textContent = project.status;
            modalFields.status.className = project.statusType;
            modalFields.title.textContent = project.name;
            modalFields.summary.textContent = project.summary;
            modalFields.meta.innerHTML = renderProjectMeta(project);
            modalFields.built.innerHTML = renderList(project.built);
            modalFields.systems.innerHTML = renderList(project.systems);
            modalFields.tags.innerHTML = project.stack.map((tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join('');
            modalFields.live.href = project.url;

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('project-modal-open');
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('project-modal-open');
        }

        grid.addEventListener('click', (event) => {
            const button = event.target.closest('[data-project-details]');
            if (!button) return;

            const project = projects.find((item) => item.id === button.dataset.projectDetails);
            openModal(project);
        });

        modal.querySelectorAll('[data-project-close]').forEach((button) => {
            button.addEventListener('click', closeModal);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeModal();
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
