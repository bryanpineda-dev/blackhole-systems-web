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

    BH.initHeaderMobileNav = function initHeaderMobileNav() {
        const header = document.querySelector('.site-header');
        const toggle = document.querySelector('.mobile-nav-toggle');
        const navLinks = document.querySelectorAll('.main-nav-list a');

        if (!header || !toggle) return;

        const closeMenu = () => {
            header.classList.remove('menu-open');
            document.body.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open navigation menu');
        };

        const openMenu = () => {
            header.classList.add('menu-open');
            document.body.classList.add('nav-open');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close navigation menu');
        };

        toggle.addEventListener('click', () => {
            if (header.classList.contains('menu-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) closeMenu();
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
