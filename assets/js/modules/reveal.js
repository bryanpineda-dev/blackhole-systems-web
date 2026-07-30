/**
 * Shared scroll reveal engine.
 * Page-specific modules register selector presets before this initializer runs.
 */
(function (BH) {
    'use strict';

    const revealGroups = BH.scrollRevealGroups || [];
    BH.scrollRevealGroups = revealGroups;

    BH.registerScrollRevealGroups = function registerScrollRevealGroups(groups) {
        if (!Array.isArray(groups)) return;
        revealGroups.push(...groups);
    };

    BH.initScrollReveal = function initScrollReveal() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const revealQueue = new Map();
        const pendingHeroReveals = new Set();
        let isLoaderComplete = !document.body.classList.contains('is-loading') || !document.getElementById('page-loader');

        const queueElement = (element, preset, delay) => {
            const current = revealQueue.get(element);
            if (current && current.delay <= delay) return;

            revealQueue.set(element, { preset, delay });
        };

        revealGroups.forEach((group) => {
            const elements = document.querySelectorAll(group.selector);

            elements.forEach((element, index) => {
                queueElement(
                    element,
                    group.preset,
                    (group.delay || 0) + (group.stagger || 0) * index
                );
            });
        });

        document.querySelectorAll('.section-tag').forEach((tag) => {
            queueElement(tag, 'fade-up', 0);
        });

        const elements = Array.from(revealQueue.keys());

        if (!elements.length) return;

        const revealElement = (element) => {
            element.classList.add('reveal-active', 'is-revealed');

            const tag = element.querySelector('.section-tag');
            if (tag) {
                tag.classList.add('reveal-active', 'is-revealed');
            }
        };

        document.addEventListener('blackhole:loader-complete', () => {
            isLoaderComplete = true;
            pendingHeroReveals.forEach(revealElement);
            pendingHeroReveals.clear();
        }, { once: true });

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach((element) => {
                revealElement(element);
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                if (entry.target.closest('#hero, .qr-hero') && !isLoaderComplete) {
                    pendingHeroReveals.add(entry.target);
                    observer.unobserve(entry.target);
                    return;
                }

                revealElement(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

        elements.forEach((element) => {
            const config = revealQueue.get(element);

            element.classList.add('reveal-item');
            element.dataset.reveal = config.preset;
            element.style.setProperty('--reveal-delay', `${config.delay}ms`);
            observer.observe(element);
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
