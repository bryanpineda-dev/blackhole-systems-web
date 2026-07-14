/**
 * Deployment archive bootstrap.
 * Wires project data, card rendering, filtering, and modal behavior.
 */
(function (BH, namespace) {
    'use strict';

    BH.initProjectFilter = function initProjectFilter() {
        const grid = document.querySelector('[data-project-grid]');
        const buttons = document.querySelectorAll('.cmd-btn');
        const count = document.querySelector('[data-project-count]');
        const modal = document.querySelector('[data-project-modal]');
        const projects = namespace.projects || [];

        if (!grid || !buttons.length || !projects.length || typeof namespace.renderProjectCard !== 'function') return;

        grid.innerHTML = projects.map(namespace.renderProjectCard).join('');

        if (count) {
            count.textContent = String(projects.length);
        }

        const cards = Array.from(grid.querySelectorAll('.dossier-card'));

        if (typeof namespace.mountProjectFilter === 'function') {
            namespace.mountProjectFilter({
                grid,
                buttons,
                cards,
                deploySection: document.getElementById('deployments')
            });
        }

        if (typeof namespace.mountProjectModal === 'function') {
            namespace.mountProjectModal({
                grid,
                modal,
                projects
            });
        }
    };
})(
    window.BlackholeSystems = window.BlackholeSystems || {},
    window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {}
);
