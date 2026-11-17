/**
 * Deployment archive rendering helpers.
 * Escapes dynamic content before injecting project cards or modal fragments.
 */
(function (namespace) {
    'use strict';

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const stackIcons = new Map([
        ['PHP', ['fa-php', '0 0 640 512']],
        ['Python', ['fa-python', '0 0 448 512']],
        ['React', ['fa-react', '0 0 512 512']],
        ['Node.js', ['fa-node-js', '0 0 448 512']],
        ['JavaScript', ['fa-js', '0 0 448 512']],
        ['WordPress', ['fa-wordpress', '0 0 512 512']],
        ['WordPress Plugin', ['fa-wordpress', '0 0 512 512']],
        ['WooCommerce', ['fa-cart-shopping', '0 0 576 512']],
        ['WhatsApp', ['ri-whatsapp-fill']]
    ]);

    const cardStackIcons = new Map([
        ['Authors', 'ri-user-star-line'],
        ['Brand', 'ri-artboard-2-line'],
        ['Brand System', 'ri-artboard-2-line'],
        ['Cafe', 'ri-cup-line'],
        ['Canvas 2D', 'ri-artboard-2-line'],
        ['Catalog', 'ri-layout-grid-line'],
        ['Commerce', 'ri-shopping-cart-2-line'],
        ['Computer Vision', 'ri-crosshair-2-line'],
        ['Content', 'ri-pages-line'],
        ['Corporate', 'ri-building-4-line'],
        ['CRM', 'ri-team-line'],
        ['Custom Plugin', 'ri-apps-2-line'],
        ['Dashboard', 'ri-dashboard-3-line'],
        ['E-Commerce', 'ri-shopping-cart-2-line'],
        ['Editorial', 'ri-newspaper-line'],
        ['Education', 'ri-graduation-cap-line'],
        ['Events', 'ri-calendar-check-line'],
        ['Forms', 'ri-pages-line'],
        ['FotoShare', 'ri-image-add-line'],
        ['Game Checklists', 'ri-check-double-line'],
        ['Internal Systems', 'ri-server-line'],
        ['Landing', 'ri-pages-line'],
        ['Local Data', 'ri-server-line'],
        ['Local Storage', 'ri-server-line'],
        ['Menu', 'ri-pages-line'],
        ['Moderation', 'ri-shield-check-line'],
        ['Multipage', 'ri-pages-line'],
        ['Payments', 'ri-bank-line'],
        ['PDF Export', 'ri-download-cloud-line'],
        ['PDF Search', 'ri-file-search-line'],
        ['Pixel Art', 'ri-layout-grid-line'],
        ['Progress Tracking', 'ri-route-line'],
        ['Redesign', 'ri-sparkling-line'],
        ['Reservations', 'ri-calendar-check-line'],
        ['Sales', 'ri-shopping-bag-3-line'],
        ['Shortcodes', 'ri-code-s-slash-line'],
        ['SQLite', 'ri-node-tree'],
        ['Travel', 'ri-plane-line'],
        ['TypeScript', 'ri-code-box-line'],
        ['Vehicle Compatibility', 'ri-route-line'],
        ['Windows', 'ri-computer-line']
    ]);

    function renderIcon(icon, viewBox = '0 0 24 24') {
        const id = escapeHtml(icon);
        return `<i class="${id} bh-icon" aria-hidden="true"><svg class="bh-icon-svg" viewBox="${viewBox}" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg?v=1.0.10#${id}"></use></svg></i>`;
    }

    function renderProjectStack(stack) {
        return stack.map((tag) => {
            const icon = stackIcons.get(tag);
            return `<span class="tech-tag">${icon ? renderIcon(...icon) : ''}<span>${escapeHtml(tag)}</span></span>`;
        }).join('');
    }

    function renderList(items) {
        return (items || []).map((item) => `
            <li>
                <i class="ri-arrow-right-s-line bh-icon" aria-hidden="true"><svg class="bh-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg?v=1.0.10#ri-arrow-right-s-line"></use></svg></i>
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
                <dt>
                    ${renderIcon(item.icon)}
                    <span>${escapeHtml(item.label)}</span>
                </dt>
                <dd>${escapeHtml(item.value)}</dd>
            </div>
        `).join('');
    }

    function renderProjectPreview(project, loading = 'lazy') {
        const fallback = `${renderIcon(project.icon)}<span>${escapeHtml(project.category)}</span>`;
        const preview = project.preview;

        if (!preview?.src) return fallback;

        const media = namespace.previewMedia;
        const candidates = loading !== 'eager' && media?.sources?.[preview.src];
        const responsive = candidates?.length
            ? `srcset="${escapeHtml([...candidates, { src: preview.src, width: preview.width }].map(candidate => `${candidate.src} ${candidate.width}w`).join(', '))}" sizes="${escapeHtml(media.cardSizes)}"`
            : '';

        return `${fallback}<img class="project-preview-image" data-project-preview
            src="${escapeHtml(preview.src)}" ${responsive} alt="${escapeHtml(preview.alt || `Homepage preview of ${project.name}`)}"
            width="${escapeHtml(preview.width)}" height="${escapeHtml(preview.height)}"
            loading="${loading === 'eager' ? 'eager' : 'lazy'}" decoding="async">`;
    }

    function getProjectLink(project) {
        if (project.url) return { href: project.url, label: 'LIVE_URL' };
        if (project.sourceUrl) return { href: project.sourceUrl, label: 'SOURCE_CODE' };
        return null;
    }

    function renderProjectCard(project) {
        const tech = project.stack.slice(0, 4).map((tag) => {
            const label = escapeHtml(tag);
            const icon = stackIcons.get(tag) || [cardStackIcons.get(tag) || 'ri-stack-line'];
            return `<span class="d-tech-icon" role="img" aria-label="${label}" title="${label}">${renderIcon(...icon)}</span>`;
        }).join('');
        const link = getProjectLink(project);

        return `
            <article class="dossier-card" data-project-id="${escapeHtml(project.id)}" data-filters="${escapeHtml(project.filters.join(' '))}">
                <div class="dossier-top-bar">
                    <span class="d-id">ID: #${escapeHtml(project.id)}</span>
                    <span class="d-status ${escapeHtml(project.statusType)}">${escapeHtml(project.status)}</span>
                </div>

                <div class="dossier-screen">
                    <div class="screen-placeholder">
                        ${renderProjectPreview(project)}
                    </div>
                    <div class="screen-glare"></div>
                </div>

                <div class="dossier-info">
                    <div class="dossier-title-row">
                        <h3 class="d-title">${escapeHtml(project.name)}</h3>
                        <span class="d-type">${escapeHtml(project.industry)}</span>
                    </div>
                    <p class="d-desc">${escapeHtml(project.summary)}</p>
                    <div class="d-tech" role="group" aria-label="Project technologies">${tech}</div>

                    <div class="dossier-footer">
                        <div class="d-actions">
                            <button type="button" class="btn-terminal-sm view-live" data-project-details="${escapeHtml(project.id)}">
                                <span>VIEW_DETAILS</span>
                                <i class="ri-file-search-line bh-icon" aria-hidden="true"><svg class="bh-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg?v=1.0.10#ri-file-search-line"></use></svg></i>
                            </button>
                            ${link ? `<a href="${escapeHtml(link.href)}" class="btn-terminal-sm request-demo" target="_blank" rel="noopener">
                                <span>${escapeHtml(link.label)}</span>
                                ${renderIcon('ri-external-link-line')}
                            </a>` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    namespace.escapeHtml = escapeHtml;
    namespace.getProjectLink = getProjectLink;
    namespace.renderProjectStack = renderProjectStack;
    namespace.renderList = renderList;
    namespace.renderProjectMeta = renderProjectMeta;
    namespace.renderProjectPreview = renderProjectPreview;
    namespace.renderProjectCard = renderProjectCard;
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
