/**
 * Shared visibility gate for motion effects.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};

    Effects.createVisibilityGate = function createVisibilityGate(element, onChange, rootMargin = '160px 0px') {
        let isInView = !('IntersectionObserver' in window);

        const syncState = () => {
            onChange(isInView && !document.hidden);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;

                isInView = entry.isIntersecting;
                syncState();
            }, {
                threshold: 0.01,
                rootMargin
            });

            observer.observe(element);
        }

        document.addEventListener('visibilitychange', syncState);
        syncState();
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
