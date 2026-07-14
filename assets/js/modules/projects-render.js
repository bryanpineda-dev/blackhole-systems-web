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

    function renderList(items) {
        return (items || []).map((item) => `
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

    namespace.escapeHtml = escapeHtml;
    namespace.renderList = renderList;
    namespace.renderProjectMeta = renderProjectMeta;
    namespace.renderProjectCard = renderProjectCard;
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
