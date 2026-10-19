/**
 * Deployment archive modal.
 * Handles project detail population, open/close state, and modal keyboard exit.
 */
(function (namespace) {
    'use strict';

    const escapeHtml = namespace.escapeHtml;
    const renderList = namespace.renderList;
    const renderProjectMeta = namespace.renderProjectMeta;
    const renderProjectPreview = namespace.renderProjectPreview;

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function setHtml(element, value) {
        if (element) element.innerHTML = value;
    }

    function getStatusChipClass(statusType) {
        const modifiers = {
            success: 'bh-chip--green',
            pending: 'bh-chip--amber',
            private: ''
        };

        return ['bh-chip', modifiers[statusType] || ''].filter(Boolean).join(' ');
    }

    namespace.mountProjectModal = function mountProjectModal(options) {
        const { modal, grid, projects } = options;

        if (!modal || !grid || !projects.length || typeof escapeHtml !== 'function') return;
        if (modal.dataset.projectModalReady === 'true') return;

        let previousFocus = null;
        let focusFrame = 0;
        const inertSiblings = new Set();
        const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]';

        function getFocusableElements() {
            return Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => {
                return element.tabIndex >= 0 && !element.matches(':disabled') &&
                    !element.closest('[inert], [hidden]') && element.getClientRects().length > 0;
            });
        }

        function focusModal() {
            (getFocusableElements()[0] || modal).focus({ preventScroll: true });
        }

        function focusWhenVisible() {
            if (!modal.classList.contains('is-open')) return;

            // The existing visibility transition can reject focus in the opening frame.
            if (window.getComputedStyle(modal).visibility !== 'visible') {
                focusFrame = window.requestAnimationFrame(focusWhenVisible);
                return;
            }

            focusFrame = 0;
            focusModal();
        }

        function isolateBackground() {
            let current = modal;

            // The modal is nested in deployments, so isolate siblings along its ancestor path.
            while (current.parentElement) {
                Array.from(current.parentElement.children).forEach((sibling) => {
                    if (sibling !== current && !sibling.inert) {
                        sibling.inert = true;
                        inertSiblings.add(sibling);
                    }
                });
                current = current.parentElement;
                if (current === document.body) break;
            }
        }

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

        function openModal(project, trigger) {
            if (!project) return;
            if (!modal.classList.contains('is-open')) {
                previousFocus = trigger || document.activeElement;
            }

            setHtml(modalFields.icon, renderProjectPreview(project, 'eager'));
            setText(modalFields.id, `#${project.id}`);
            setText(modalFields.status, project.status);

            if (modalFields.status) {
                modalFields.status.className = getStatusChipClass(project.statusType);
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
            isolateBackground();
            focusWhenVisible();
        }

        function closeModal() {
            if (!modal.classList.contains('is-open')) return;

            window.cancelAnimationFrame(focusFrame);
            focusFrame = 0;
            modal.classList.remove('is-open');
            document.body.classList.remove('project-modal-open');
            inertSiblings.forEach((element) => { element.inert = false; });
            inertSiblings.clear();
            if (previousFocus?.isConnected) {
                previousFocus.focus({ preventScroll: true });
            }
            previousFocus = null;
            modal.setAttribute('aria-hidden', 'true');
        }

        grid.addEventListener('click', (event) => {
            const button = event.target.closest('[data-project-details]');
            if (!button) return;

            const project = projects.find((item) => item.id === button.dataset.projectDetails);
            openModal(project, button);
        });

        modal.querySelectorAll('[data-project-close]').forEach((button) => {
            button.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', (event) => {
            if (!modal.classList.contains('is-open')) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closeModal();
                return;
            }

            if (event.key === 'Tab') {
                const elements = getFocusableElements();
                const first = elements[0];
                const last = elements[elements.length - 1];

                if (!first) {
                    event.preventDefault();
                    modal.focus({ preventScroll: true });
                } else if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
                    event.preventDefault();
                    last.focus({ preventScroll: true });
                } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modal)) {
                    event.preventDefault();
                    first.focus({ preventScroll: true });
                }
            }
        });

        document.addEventListener('focusin', (event) => {
            if (modal.classList.contains('is-open') && !modal.contains(event.target)) {
                focusModal();
            }
        });

        modal.dataset.projectModalReady = 'true';
    };
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
