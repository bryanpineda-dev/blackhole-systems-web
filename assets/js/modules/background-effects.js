/**
 * Section background effects.
 * These generators create transient DOM nodes for comets and tactical grid pulses.
 */
(function (BH) {
    'use strict';

    const createVisibilityGate = (element, onChange, rootMargin = '160px 0px') => {
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

    BH.initCometField = function initCometField() {
        const container = document.getElementById('comet-field');
        if (!container) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

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

        createVisibilityGate(container, (isActive) => {
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

    BH.initGridPulse = function initGridPulse() {
        const grid = document.getElementById('grid-pulse');
        if (!grid) return;

        grid.innerHTML = '';

        const cellSize = 40;
        const cols = Math.ceil(grid.offsetWidth / cellSize);
        const rows = Math.ceil(grid.offsetHeight / cellSize);
        const totalCells = cols * rows;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            grid.appendChild(cell);
        }

        const allCells = grid.querySelectorAll('.grid-cell');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let isGridActive = false;
        let pulseTimer = 0;

        if (prefersReducedMotion) return;

        const clearPulse = () => {
            if (!pulseTimer) return;

            window.clearTimeout(pulseTimer);
            pulseTimer = 0;
        };

        const schedulePulse = () => {
            clearPulse();

            if (!isGridActive) return;

            pulseTimer = window.setTimeout(pulse, Math.random() * 500 + 100);
        };

        const pulse = () => {
            if (!isGridActive) return;
            if (!allCells.length) return;

            const numPulses = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < numPulses; i++) {
                const randomIndex = Math.floor(Math.random() * allCells.length);
                const cell = allCells[randomIndex];

                if (cell) {
                    cell.classList.add('active');
                    window.setTimeout(() => cell.classList.remove('active'), Math.random() * 2000 + 500);
                }
            }

            schedulePulse();
        };

        createVisibilityGate(grid, (isActive) => {
            isGridActive = isActive;

            if (isGridActive && !pulseTimer) {
                pulse();
                return;
            }

            if (!isGridActive) {
                clearPulse();
            }
        }, '160px 0px');
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
