/**
 * Scroll reveal and telemetry counters.
 * These features are intentionally DOM-driven so the landing can stay static.
 */
(function (BH) {
    'use strict';

    BH.initScrollReveal = function initScrollReveal() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const revealQueue = new Map();
        const revealGroups = [
            { selector: '#hero .status-badge', preset: 'fade-down', delay: 80 },
            { selector: '#hero .hero-title', preset: 'fade-up', delay: 160 },
            { selector: '#hero .hero-description', preset: 'fade-up', delay: 250 },
            { selector: '#hero .hero-actions', preset: 'fade-up', delay: 330 },

            { selector: '#about .about-content-left', preset: 'fade-right', delay: 0 },
            { selector: '#about .sci-fi-bullets li', preset: 'fade-up', delay: 140, stagger: 70 },
            { selector: '#about .about-capability-chips span', preset: 'scale-soft', delay: 320, stagger: 45 },
            { selector: '#about .about-planets-right', preset: 'fade-left', delay: 120 },

            { selector: '#mission .about-visuals', preset: 'fade-right', delay: 0 },
            { selector: '#mission .about-content', preset: 'fade-left', delay: 120 },
            { selector: '#mission .tech-coins-wrapper', preset: 'fade-up', delay: 220 },

            { selector: '#capabilities .section-header', preset: 'fade-up', delay: 0 },
            { selector: '#capabilities .capability-card', preset: 'scale-soft', delay: 120, stagger: 80 },

            { selector: '.dossier-card', preset: 'scale-soft', delay: 0, stagger: 80 },
            { selector: '#contact .launch-console', preset: 'fade-right', delay: 0 },
            { selector: '#contact .glass-form', preset: 'fade-left', delay: 120 }
        ];

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

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach((element) => {
                element.classList.add('reveal-active', 'is-revealed');
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('reveal-active', 'is-revealed');

                const tag = entry.target.querySelector('.section-tag');
                if (tag) {
                    tag.classList.add('reveal-active', 'is-revealed');
                }

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

    BH.initAboutOrbitObserver = function initAboutOrbitObserver() {
        const orbitStage = document.querySelector('#about .about-planets-right');
        if (!orbitStage) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            orbitStage.classList.add('is-orbit-paused');
            return;
        }

        if (!('IntersectionObserver' in window)) return;

        let isInView = false;

        const syncOrbitState = () => {
            orbitStage.classList.toggle('is-orbit-paused', document.hidden || !isInView);
        };

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            isInView = entry.isIntersecting;
            syncOrbitState();
        }, {
            threshold: 0.01,
            rootMargin: '140px 0px'
        });

        orbitStage.classList.add('is-orbit-paused');
        observer.observe(orbitStage);
        document.addEventListener('visibilitychange', syncOrbitState);
    };

    BH.initTechCoinsObserver = function initTechCoinsObserver() {
        const coinsWrapper = document.querySelector('.tech-coins-wrapper');
        if (!coinsWrapper) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            coinsWrapper.classList.add('is-coins-paused');
            return;
        }

        if (!('IntersectionObserver' in window)) return;

        let isInView = false;

        const syncCoinsState = () => {
            coinsWrapper.classList.toggle('is-coins-paused', document.hidden || !isInView);
        };

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            isInView = entry.isIntersecting;
            syncCoinsState();
        }, {
            threshold: 0.01,
            rootMargin: '140px 0px'
        });

        observer.observe(coinsWrapper);
        document.addEventListener('visibilitychange', syncCoinsState);
    };

    BH.initTelemetry = function initTelemetry() {
        const counters = document.querySelectorAll('.counter-value');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const target = Number(entry.target.getAttribute('data-target'));
                const prefix = entry.target.getAttribute('data-prefix') || '';
                const suffix = entry.target.getAttribute('data-suffix') || '';
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += increment;

                    if (current < target) {
                        entry.target.innerText = prefix + Math.ceil(current) + suffix;
                        requestAnimationFrame(updateCounter);
                        return;
                    }

                    entry.target.innerText = prefix + target + suffix;
                };

                updateCounter();
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        counters.forEach((counter) => observer.observe(counter));
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
