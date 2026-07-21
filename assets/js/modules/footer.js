/**
 * Footer metadata helpers.
 * Keeps small generated footer details out of the markup.
 */
(function (BH) {
    'use strict';

    BH.initFooterMeta = function initFooterMeta() {
        const yearTargets = document.querySelectorAll('[data-current-year]');

        if (!yearTargets.length) return;

        const currentYear = new Date().getFullYear().toString();

        yearTargets.forEach((target) => {
            target.textContent = currentYear;
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
