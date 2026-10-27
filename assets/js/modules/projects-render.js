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

    function renderIcon(icon) {
        const id = escapeHtml(icon);
        return `<i class="${id} bh-icon" aria-hidden="true"><svg class="bh-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg?v=1.0.10#${id}"></use></svg></i>`;
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

        return `${fallback}<img class="project-preview-image" data-project-preview
            src="${escapeHtml(preview.src)}" alt="${escapeHtml(`Homepage preview of ${project.name}`)}"
            width="${escapeHtml(preview.width)}" height="${escapeHtml(preview.height)}"
            loading="${loading === 'eager' ? 'eager' : 'lazy'}" decoding="async">`;
    }

    function renderProjectCard(project) {
        const tags = project.stack.slice(0, 4)
            .map((tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`)
            .join('');

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
                    <div class="d-tags">${tags}</div>

                    <div class="dossier-footer">
                        <div class="d-actions">
                            <button type="button" class="btn-terminal-sm view-live" data-project-details="${escapeHtml(project.id)}">
                                <span>VIEW_DETAILS</span>
                                <i class="ri-file-search-line bh-icon" aria-hidden="true"><svg class="bh-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg?v=1.0.10#ri-file-search-line"></use></svg></i>
                            </button>
                            <a href="${escapeHtml(project.url)}" class="btn-terminal-sm request-demo" target="_blank" rel="noopener">
                                <span>LIVE_URL</span>
                                <i class="ri-external-link-line bh-icon" aria-hidden="true"><svg class="bh-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg?v=1.0.10#ri-external-link-line"></use></svg></i>
                            </a>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    namespace.escapeHtml = escapeHtml;
    namespace.renderList = renderList;
    namespace.renderProjectMeta = renderProjectMeta;
    namespace.renderProjectPreview = renderProjectPreview;
    namespace.renderProjectCard = renderProjectCard;
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
