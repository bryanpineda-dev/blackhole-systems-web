/**
 * Services section comet field.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};

    BH.initCometField = function initCometField() {
        const container = document.getElementById('comet-field');
        if (!container) return;
        if (container.dataset.cometFieldReady === 'true') return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        if (typeof Effects.createVisibilityGate !== 'function') return;

        container.dataset.cometFieldReady = 'true';

        const randomBetween = (min, max) => Math.random() * (max - min) + min;
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const maxActiveComets = 12;
        let activeComets = 0;
        let isFieldActive = false;
        let loopTimer = 0;

        const getCometPath = () => {
            const width = container.offsetWidth || window.innerWidth;
            const height = container.offsetHeight || window.innerHeight;
            const margin = 180;
            const isLongComet = Math.random() > 0.78;
            const angle = randomBetween(34, 52) * (Math.PI / 180);
            const unitX = Math.cos(angle);
            const unitY = Math.sin(angle);
            const spawnFromTop = Math.random() > 0.42;
            const startX = spawnFromTop
                ? randomBetween(-margin * 0.35, width * 0.92)
                : -margin;
            const startY = spawnFromTop
                ? -margin
                : randomBetween(-margin * 0.25, height * 0.72);
            const travelToRight = (width + margin - startX) / unitX;
            const travelToBottom = (height + margin - startY) / unitY;
            const travel = Math.max(travelToRight, travelToBottom) + randomBetween(80, 220);
            const speed = isLongComet ? randomBetween(760, 980) : randomBetween(560, 820);
            const duration = clamp(travel / speed, 1.8, 4.4);
            const length = isLongComet ? randomBetween(150, 230) : randomBetween(82, 150);
            const thickness = isLongComet ? randomBetween(1.5, 2.5) : randomBetween(1, 1.8);

            return {
                startX,
                startY,
                endX: startX + unitX * travel,
                endY: startY + unitY * travel,
                angle: angle * (180 / Math.PI),
                duration,
                length,
                thickness,
                opacity: isLongComet ? randomBetween(0.76, 0.96) : randomBetween(0.45, 0.78),
                glow: isLongComet ? randomBetween(14, 22) : randomBetween(8, 15),
                head: thickness * randomBetween(2.2, 3.2)
            };
        };

        const createComet = () => {
            if (!isFieldActive) return;
            if (activeComets >= maxActiveComets) return;

            const comet = document.createElement('div');
            const path = getCometPath();

            comet.classList.add('comet');
            comet.style.setProperty('--comet-start-x', `${path.startX}px`);
            comet.style.setProperty('--comet-start-y', `${path.startY}px`);
            comet.style.setProperty('--comet-end-x', `${path.endX}px`);
            comet.style.setProperty('--comet-end-y', `${path.endY}px`);
            comet.style.setProperty('--comet-angle', `${path.angle}deg`);
            comet.style.setProperty('--comet-duration', `${path.duration}s`);
            comet.style.setProperty('--comet-length', `${path.length}px`);
            comet.style.setProperty('--comet-thickness', `${path.thickness}px`);
            comet.style.setProperty('--comet-opacity', path.opacity.toFixed(2));
            comet.style.setProperty('--comet-glow', `${path.glow}px`);
            comet.style.setProperty('--comet-head', `${path.head}px`);

            activeComets += 1;
            container.appendChild(comet);
            setTimeout(() => {
                comet.remove();
                activeComets = Math.max(0, activeComets - 1);
            }, path.duration * 1000);
        };

        const clearLoop = () => {
            if (!loopTimer) return;

            window.clearTimeout(loopTimer);
            loopTimer = 0;
        };

        const scheduleLoop = () => {
            clearLoop();

            if (!isFieldActive) return;

            loopTimer = window.setTimeout(loop, randomBetween(420, 1150));
        };

        const loop = () => {
            if (!isFieldActive) return;

            const roll = Math.random();
            const batch = roll > 0.86 ? 3 : roll > 0.55 ? 2 : 1;
            for (let i = 0; i < batch; i++) {
                createComet();
            }

            scheduleLoop();
        };

        Effects.createVisibilityGate(container, (isActive) => {
            isFieldActive = isActive;

            if (isFieldActive && !loopTimer) {
                loop();
                return;
            }

            if (!isFieldActive) {
                clearLoop();
            }
        }, '220px 0px');
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
