/**
 * Opt-in reversible reveals. Individual translate leaves hover/tilt transforms intact.
 */
(function (BH) {
    'use strict';

    BH.createRepeatReveal = function createRepeatReveal({ items, isReady }) {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const records = new Map(Array.from(items, ([element, config]) => [element, {
            config, visible: false, intersecting: false, edge: 'below', animation: null
        }]));
        let observer;
        let resizeFrame;

        const setVisible = (element, visible, immediate = false) => {
            const record = records.get(element);
            if (!record || (!immediate && record.visible === visible)) return;
            if (visible && !isReady(element)) return;
            if (!visible && element.contains(document.activeElement)) return;

            const before = getComputedStyle(element);
            const from = { opacity: before.opacity, translate: before.translate };
            record.animation?.cancel();
            record.animation = null;
            record.visible = visible;
            element.dataset.revealEdge = record.edge;
            element.classList.toggle('reveal-active', visible);
            element.classList.toggle('is-revealed', visible);

            if (immediate || motion.matches) return;

            const style = getComputedStyle(element);
            const durationToken = visible ? '--motion-duration-reveal-repeat' : '--motion-duration-medium';
            const duration = parseFloat(style.getPropertyValue(durationToken));
            const easing = style.getPropertyValue('--motion-ease-out').trim();
            if (!Number.isFinite(duration) || duration < 0 || !easing) return;

            const animation = element.animate([
                from,
                { opacity: style.opacity, translate: style.translate }
            ], {
                duration,
                delay: visible ? record.config.getDelay() : 0,
                easing,
                fill: 'both'
            });
            record.animation = animation;
            animation.onfinish = () => {
                if (record.animation !== animation) return;
                record.animation = null;
                animation.cancel();
            };
        };

        const observe = () => {
            observer?.disconnect();
            if (motion.matches) {
                records.forEach((record, element) => setVisible(element, true, true));
                return;
            }

            // Use viewport-height pixels: percentage root margins resolve against width.
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const element = entry.target;
                    const record = records.get(element);
                    record.intersecting = entry.isIntersecting;
                    record.edge = entry.boundingClientRect.bottom <= entry.rootBounds.top ? 'above' : 'below';
                    if (!entry.isIntersecting && !record.visible) {
                        element.dataset.revealEdge = record.edge;
                    }
                    setVisible(element, entry.isIntersecting);
                });
            }, { threshold: 0, rootMargin: `-${Math.round(window.innerHeight * 0.08)}px 0px 0px 0px` });
            records.forEach((record, element) => observer.observe(element));
        };

        document.addEventListener('focusin', (event) => {
            records.forEach((record, element) => {
                if (element.contains(event.target)) setVisible(element, true, true);
            });
        });
        document.addEventListener('focusout', () => {
            queueMicrotask(() => records.forEach((record, element) => {
                if (!record.intersecting && !motion.matches) setVisible(element, false);
            }));
        });
        window.addEventListener('resize', () => {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(observe);
        }, { passive: true });
        motion.addEventListener('change', observe);
        observe();

        return {
            releaseLoader() {
                records.forEach((record, element) => {
                    if (record.intersecting) setVisible(element, true, motion.matches);
                });
            }
        };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
