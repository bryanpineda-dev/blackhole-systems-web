/**
 * Deployment archive tactical grid pulse.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};

    BH.initGridPulse = function initGridPulse() {
        const grid = document.getElementById('grid-pulse');
        if (!grid) return;
        if (grid.dataset.gridPulseReady === 'true') return;

        grid.dataset.gridPulseReady = 'true';
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
        if (typeof Effects.createVisibilityGate !== 'function') return;

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

        Effects.createVisibilityGate(grid, (isActive) => {
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
