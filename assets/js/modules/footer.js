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

    BH.initFooterSpectrumObserver = function initFooterSpectrumObserver() {
        const footer = document.querySelector('.site-footer');

        if (!footer) return;

        if (!('IntersectionObserver' in window)) {
            footer.classList.add('is-spectrum-visible');
            return;
        }

        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                footer.classList.toggle('is-spectrum-visible', entry.isIntersecting);
            });
        }, {
            threshold: 0.12
        });

        footerObserver.observe(footer);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
