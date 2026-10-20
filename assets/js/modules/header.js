/**
 * Header state management.
 * Controls scroll styling and zone-specific header visibility.
 */
(function (BH) {
    'use strict';

    BH.initHeaderScroll = function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let scrollTicking = false;
        const updateHeaderScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
            scrollTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(updateHeaderScroll);
        }, { passive: true });

        updateHeaderScroll();
    };

    BH.initHeaderZoneObserver = function initHeaderZoneObserver() {
        const header = document.querySelector('.site-header');
        const deploySection = document.getElementById('deployments');
        const footer = document.querySelector('.site-footer');

        if (!header) return;

        if (deploySection) {
            let deployObserver;
            let resizeFrame = 0;
            const observeDeployZone = () => {
                deployObserver?.disconnect();
                const top = Math.max(0, parseFloat(window.getComputedStyle(header).top) || 0);
                const bottom = Math.max(0, window.innerHeight - top - header.offsetHeight);

                // Observe the header band, not a percentage of the growing project archive.
                deployObserver = new IntersectionObserver(([entry]) => {
                    header.classList.toggle('in-deploy-zone', entry.isIntersecting);
                }, {
                    threshold: 0,
                    rootMargin: `-${top}px 0px -${bottom}px 0px`
                });
                deployObserver.observe(deploySection);
            };

            observeDeployZone();
            window.addEventListener('resize', () => {
                window.cancelAnimationFrame(resizeFrame);
                resizeFrame = window.requestAnimationFrame(observeDeployZone);
            }, { passive: true });
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
        const mobileMenu = document.getElementById('mobile-command-menu');
        const navLinks = document.querySelectorAll('.main-nav-list a, .mobile-command-menu a');

        if (!header || !toggle || !mobileMenu) return;

        const inertSiblings = new Set();
        let focusFrame = 0;
        mobileMenu.inert = true;

        const getFocusable = () => [...mobileMenu.querySelectorAll('a[href], button, input, select, textarea, [tabindex]'), toggle]
            .filter((element) => element.tabIndex >= 0 && !element.matches(':disabled') &&
                !element.closest('[inert], [hidden]') && element.getClientRects().length &&
                getComputedStyle(element).visibility === 'visible');

        const focusMenu = () => {
            if (!header.classList.contains('menu-open')) return;
            if (getComputedStyle(mobileMenu).visibility !== 'visible') {
                focusFrame = requestAnimationFrame(focusMenu);
                return;
            }
            focusFrame = 0;
            (getFocusable()[0] || toggle).focus();
        };

        const isolateBackground = () => {
            let current = mobileMenu;
            // The close control is a sibling of the menu, not a dialog descendant.
            while (current.parentElement) {
                Array.from(current.parentElement.children).forEach((sibling) => {
                    if (sibling !== current && sibling !== toggle && !sibling.contains(toggle) && !sibling.inert) {
                        sibling.inert = true;
                        inertSiblings.add(sibling);
                    }
                });
                current = current.parentElement;
            }
        };

        const closeMenu = () => {
            const wasOpen = header.classList.contains('menu-open');
            cancelAnimationFrame(focusFrame);
            focusFrame = 0;
            header.classList.remove('menu-open');
            document.body.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open navigation menu');
            mobileMenu.setAttribute('aria-hidden', 'true');
            mobileMenu.inert = true;
            inertSiblings.forEach((element) => { element.inert = false; });
            inertSiblings.clear();
            if (wasOpen) {
                const target = window.innerWidth <= 1024 ? toggle : header.querySelector('.main-nav-list a');
                target?.focus({ preventScroll: true });
            }
        };

        const openMenu = () => {
            if (window.innerWidth > 1024 || header.classList.contains('menu-open')) return;
            header.classList.add('menu-open');
            document.body.classList.add('nav-open');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close navigation menu');
            mobileMenu.setAttribute('aria-hidden', 'false');
            mobileMenu.inert = false;
            isolateBackground();
            focusFrame = requestAnimationFrame(focusMenu);
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

        if (mobileMenu) {
            mobileMenu.addEventListener('click', (event) => {
                if (event.target === mobileMenu) closeMenu();
            });
        }

        window.addEventListener('keydown', (event) => {
            if (!header.classList.contains('menu-open')) return;
            if (event.key === 'Escape') {
                closeMenu();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusable = getFocusable();
            const first = focusable[0] || toggle;
            const last = focusable[focusable.length - 1] || toggle;
            if (!focusable.includes(document.activeElement) ||
                (event.shiftKey && document.activeElement === first) ||
                (!event.shiftKey && document.activeElement === last)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) closeMenu();
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
