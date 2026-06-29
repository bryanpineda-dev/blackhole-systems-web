/**
 * Header state management.
 * Controls scroll styling and zone-specific header visibility.
 */
(function (BH) {
    'use strict';

    BH.initHeaderScroll = function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    };

    BH.initHeaderZoneObserver = function initHeaderZoneObserver() {
        const header = document.querySelector('.site-header');
        const deploySection = document.getElementById('deployments');
        const footer = document.querySelector('.site-footer');

        if (!header) return;

        if (deploySection) {
            const deployObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    header.classList.toggle('in-deploy-zone', entry.isIntersecting);
                });
            }, {
                threshold: 0.1,
                rootMargin: '-80px 0px 0px 0px'
            });

            deployObserver.observe(deploySection);
        }

        if (footer) {
            const footerObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    header.classList.toggle('in-footer-zone', entry.isIntersecting);
                });
            }, {
                threshold: 0.08,
                rootMargin: '0px 0px -20% 0px'
            });

            footerObserver.observe(footer);
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
