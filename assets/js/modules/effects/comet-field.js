/**
 * Services section comet field.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};
    const instances = new WeakMap();

    Effects.createCometField = function createCometField(container) {
        if (!container) return;
        if (instances.has(container)) return instances.get(container);
        if (container.dataset.cometFieldReady === 'true') return;
        if (typeof Effects.createVisibilityGate !== 'function') return;

        const randomBetween = (min, max) => Math.random() * (max - min) + min;
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const maxActiveComets = 12;
        const comets = new Map();
        let isFieldActive = false;
        let loopTimer = 0;
        let gate;
        let destroyed = false;

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
            if (comets.size >= maxActiveComets) return;

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

            container.appendChild(comet);
            const timer = window.setTimeout(() => {
                comet.remove();
                comets.delete(comet);
            }, path.duration * 1000);
            comets.set(comet, timer);
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

        const controller = {
            destroy() {
                if (destroyed) return;
                destroyed = true;
                isFieldActive = false;
                clearLoop();
                gate?.destroy();
                comets.forEach((timer, comet) => {
                    window.clearTimeout(timer);
                    comet.remove();
                });
                comets.clear();
                delete container.dataset.cometFieldReady;
                instances.delete(container);
            }
        };

        try {
            gate = Effects.createVisibilityGate(container, (isActive) => {
                isFieldActive = isActive;
                if (isFieldActive && !loopTimer) {
                    loop();
                    return;
                }
                if (!isFieldActive) clearLoop();
            }, { rootMargin: '220px 0px', respectReducedMotion: true });
        } catch (error) {
            controller.destroy();
            throw error;
        }
        instances.set(container, controller);
        container.dataset.cometFieldReady = 'true';
        return controller;
    };

    BH.initCometField = function initCometField() {
        document.querySelectorAll('[data-comet-field], #comet-field').forEach(Effects.createCometField);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
