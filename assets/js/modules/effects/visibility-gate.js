/**
 * Shared visibility gate for motion effects.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};
    const visibilitySubscribers = new Set();
    const motionSubscribers = new Set();
    let motionQuery;

    const notify = (subscribers) => {
        subscribers.forEach((syncState) => {
            try {
                syncState();
            } catch (error) {
                console.error('[Blackhole Systems] Effect lifecycle update failed:', error);
            }
        });
    };

    const syncVisibility = () => notify(visibilitySubscribers);
    const syncMotion = () => notify(motionSubscribers);

    // String margins retain the existing API; motion policy is opt-in per effect.
    Effects.createVisibilityGate = function createVisibilityGate(element, onChange, options = '160px 0px') {
        const config = typeof options === 'string' ? { rootMargin: options } : options;
        const rootMargin = config.rootMargin ?? '160px 0px';
        const respectsMotion = Boolean(config.respectReducedMotion);
        let isInView = !('IntersectionObserver' in window);
        let observer;
        let destroyed = false;

        if (respectsMotion && !motionQuery) {
            motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        }

        const syncState = () => {
            if (!destroyed) onChange(isInView && !document.hidden && !(respectsMotion && motionQuery.matches));
        };

        const controller = {
            destroy() {
                if (destroyed) return;
                destroyed = true;
                observer?.disconnect();
                visibilitySubscribers.delete(syncState);
                if (!visibilitySubscribers.size) document.removeEventListener('visibilitychange', syncVisibility);
                if (motionSubscribers.delete(syncState) && !motionSubscribers.size) {
                    if (typeof motionQuery.removeEventListener === 'function') {
                        motionQuery.removeEventListener('change', syncMotion);
                    } else {
                        motionQuery.removeListener?.(syncMotion);
                    }
                }
            }
        };

        if (!visibilitySubscribers.size) document.addEventListener('visibilitychange', syncVisibility);
        visibilitySubscribers.add(syncState);
        if (respectsMotion) {
            if (!motionSubscribers.size) {
                if (typeof motionQuery.addEventListener === 'function') {
                    motionQuery.addEventListener('change', syncMotion);
                } else {
                    motionQuery.addListener?.(syncMotion);
                }
            }
            motionSubscribers.add(syncState);
        }

        try {
            if ('IntersectionObserver' in window) {
                observer = new IntersectionObserver((entries) => {
                    const entry = entries[0];
                    if (!entry || destroyed) return;
                    isInView = entry.isIntersecting;
                    syncState();
                }, { threshold: 0.01, rootMargin });
                observer.observe(element);
            }
            syncState();
        } catch (error) {
            controller.destroy();
            throw error;
        }
        return controller;
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
