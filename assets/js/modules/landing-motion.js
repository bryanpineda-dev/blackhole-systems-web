/**
 * Landing-only motion observers and telemetry counters.
 */
(function (BH) {
    'use strict';

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

    BH.initWorkflowCodeScanObserver = function initWorkflowCodeScanObserver() {
        const codeStage = document.querySelector('#mission .code-ecosystem');
        if (!codeStage) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            codeStage.classList.remove('is-code-scan-active');
            return;
        }

        if (!('IntersectionObserver' in window)) {
            codeStage.classList.add('is-code-scan-active');
            return;
        }

        let isInView = false;

        const syncCodeScanState = () => {
            codeStage.classList.toggle('is-code-scan-active', !document.hidden && isInView);
        };

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            isInView = entry.isIntersecting;
            syncCodeScanState();
        }, {
            threshold: 0.01,
            rootMargin: '160px 0px'
        });

        observer.observe(codeStage);
        document.addEventListener('visibilitychange', syncCodeScanState);
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
