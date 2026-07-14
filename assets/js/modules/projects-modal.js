/**
 * Deployment archive modal.
 * Handles project detail population, open/close state, and modal keyboard exit.
 */
(function (namespace) {
    'use strict';

    const escapeHtml = namespace.escapeHtml;
    const renderList = namespace.renderList;
    const renderProjectMeta = namespace.renderProjectMeta;

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function setHtml(element, value) {
        if (element) element.innerHTML = value;
    }

    namespace.mountProjectModal = function mountProjectModal(options) {
        const { modal, grid, projects } = options;

        if (!modal || !grid || !projects.length || typeof escapeHtml !== 'function') return;

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

            setHtml(modalFields.icon, `<i class="${escapeHtml(project.icon)}" aria-hidden="true"></i><span>${escapeHtml(project.category)}</span>`);
            setText(modalFields.id, `#${project.id}`);
            setText(modalFields.status, project.status);

            if (modalFields.status) {
                modalFields.status.className = project.statusType;
            }

            setText(modalFields.title, project.name);
            setText(modalFields.summary, project.summary);
            setHtml(modalFields.meta, renderProjectMeta(project));
            setHtml(modalFields.built, renderList(project.built));
            setHtml(modalFields.systems, renderList(project.systems));
            setHtml(modalFields.tags, project.stack.map((tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join(''));

            if (modalFields.live) {
                modalFields.live.href = project.url;
            }

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
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    };
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
