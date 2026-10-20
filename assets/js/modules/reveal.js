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

        const queueElement = (element, preset, delay, options = {}) => {
            const current = revealQueue.get(element);
            if (current && current.delay <= delay) return;

            revealQueue.set(element, { preset, delay, ...options });
        };

        revealGroups.forEach((group) => {
            const elements = document.querySelectorAll(group.selector);

            elements.forEach((element, index) => {
                queueElement(
                    element,
                    group.preset,
                    (group.delay || 0) + (group.stagger || 0) * index,
                    {
                        repeat: group.repeat === true,
                        getDelay: group.staggerByRow ? () => {
                            const rowIndex = Array.from(elements).filter((sibling) =>
                                !sibling.hidden && sibling.offsetTop === element.offsetTop && sibling.offsetLeft < element.offsetLeft
                            ).length;
                            return (group.delay || 0) + (group.stagger || 0) * rowIndex;
                        } : () => (group.delay || 0) + (group.stagger || 0) * index
                    }
                );
            });
        });

        document.querySelectorAll('.section-tag').forEach((tag) => {
            if (!revealQueue.has(tag)) queueElement(tag, 'fade-up', 0);
        });

        // A readable block gets one reveal, not multiplied parent/child fades.
        revealQueue.forEach((config, element) => {
            if (!config.repeat) return;
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
                if (revealQueue.get(parent)?.repeat) {
                    revealQueue.delete(element);
                    break;
                }
            }
        });

        const elements = Array.from(revealQueue.keys());
        let repeatCycle;

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
            repeatCycle?.releaseLoader();
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

        const repeatItems = new Map();
        elements.forEach((element) => {
            const config = revealQueue.get(element);
            const repeats = config.repeat && typeof BH.createRepeatReveal === 'function' && typeof element.animate === 'function';

            if (repeats) {
                element.style.setProperty('--reveal-rest-transition', getComputedStyle(element).transition);
                element.dataset.revealCycle = 'repeat';
                element.classList.remove('reveal-active', 'is-revealed');
                repeatItems.set(element, config);
            }

            element.classList.add('reveal-item');
            element.dataset.reveal = config.preset;
            element.style.setProperty('--reveal-delay', `${config.delay}ms`);
            if (!repeats) observer.observe(element);
        });

        if (repeatItems.size) {
            repeatCycle = BH.createRepeatReveal({
                items: repeatItems,
                isReady: (element) => !element.closest('#hero, .qr-hero') || isLoaderComplete
            });
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
