/**
 * Deployment archive tactical grid pulse.
 * Static lines are CSS paint; only active/fading pulses need DOM cells.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};
    const maxPulseCells = 128;

    BH.initGridPulse = function initGridPulse() {
        const grid = document.getElementById('grid-pulse');
        if (!grid || grid.dataset.gridPulseReady === 'true') return;

        grid.dataset.gridPulseReady = 'true';
        grid.innerHTML = '';

        const probe = document.createElement('div');
        probe.className = 'grid-cell';
        grid.appendChild(probe);
        const probeStyle = getComputedStyle(probe);
        const cellSize = parseFloat(probeStyle.height) || 40;
        let borderWidth = probeStyle.borderLeftWidth;
        let paintRatio = window.devicePixelRatio || 1;
        const durations = probeStyle.transitionDuration.split(',').map(toMilliseconds);
        const fadeDuration = Math.max(0, ...durations);
        let initialBounds = grid.getBoundingClientRect();
        const initialCellCount = Math.ceil(grid.offsetWidth / cellSize) * Math.ceil(grid.offsetHeight / cellSize);
        probe.remove();

        const pooled = Boolean(window.CSS?.supports?.('mask-composite', 'add') && window.ResizeObserver);
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const activeCells = new Map();
        const pool = [];
        const freeCells = [];
        let legacyCells = [];
        let columns = 0;
        let totalCells = 0;
        let geometry = '';
        let isGridActive = false;
        let pulseTimer = 0;
        let resizeFrame = 0;

        function toMilliseconds(value) {
            const number = parseFloat(value) || 0;
            return value.trim().endsWith('ms') ? number : number * 1000;
        }

        function clearPulse() {
            window.clearTimeout(pulseTimer);
            pulseTimer = 0;
        }

        function position(slot) {
            slot.node.style.left = `${(slot.index % columns) * cellSize}px`;
            slot.node.style.top = `${Math.floor(slot.index / columns) * cellSize}px`;
        }

        function syncGeometry() {
            resizeFrame = 0;
            // Reuse the probe pass on boot; class/paint updates can then settle together.
            const rect = initialBounds || grid.getBoundingClientRect();
            initialBounds = null;
            const ratio = window.devicePixelRatio || 1;
            const next = `${rect.width}:${rect.height}:${ratio}`;
            if (geometry === next) return;
            geometry = next;
            if (ratio !== paintRatio) {
                const reference = pool[0]?.node || document.createElement('div');
                const temporary = !pool.length;
                if (temporary) { reference.className = 'grid-cell'; grid.appendChild(reference); }
                borderWidth = getComputedStyle(reference).borderLeftWidth;
                if (temporary) reference.remove();
                paintRatio = ratio;
            }
            columns = rect.width > 0 ? Math.max(1, Math.floor(rect.width / cellSize)) : 0;
            // Filtering must not concentrate the original flashes into a smaller visible area.
            totalCells = columns && rect.height > 0 ? Math.max(initialCellCount, columns * Math.ceil(rect.height / cellSize)) : 0;
            grid.style.setProperty('--grid-lines-width', `${columns * cellSize}px`);
            grid.style.setProperty('--grid-line-width', borderWidth);
            grid.style.setProperty('--grid-edge-aa', `${Number.isInteger(ratio) ? 0 : 0.5 / ratio}px`);
            if (columns) activeCells.forEach(position);
            if (isGridActive && !pulseTimer && totalCells) pulse();
        }

        function requestGeometry() {
            if (!resizeFrame) resizeFrame = window.requestAnimationFrame(syncGeometry);
        }

        function acquire(index) {
            let slot = activeCells.get(index);
            if (slot) return slot;
            if (pooled) {
                slot = freeCells.pop();
                if (!slot) {
                    // The ceiling covers normal cadence/lifetimes without cutting an existing fade.
                    if (pool.length >= maxPulseCells) return null;
                    const node = document.createElement('div');
                    node.className = 'grid-cell';
                    grid.appendChild(node);
                    slot = { node, holds: new Set(), revision: 0, cleanup: 0 };
                    pool.push(slot);
                    // Commit the initial transparent style so new cells retain the 100ms entrance.
                    getComputedStyle(node).backgroundColor;
                }
            } else {
                slot = { node: legacyCells[index], holds: new Set(), revision: 0, cleanup: 0 };
            }
            slot.index = index;
            activeCells.set(index, slot);
            if (pooled) position(slot);
            return slot;
        }

        function finishFade(slot) {
            const revision = slot.revision;
            const release = () => {
                if (slot.revision !== revision || slot.holds.size || activeCells.get(slot.index) !== slot) return;
                slot.cleanup = 0;
                activeCells.delete(slot.index);
                if (pooled) freeCells.push(slot);
            };
            const transitions = slot.node.getAnimations?.().filter(animation => animation.transitionProperty) || [];
            if (transitions.length) {
                Promise.allSettled(transitions.map(animation => animation.finished)).then(release);
            } else {
                slot.cleanup = window.setTimeout(release, fadeDuration + 34);
            }
        }

        function pulse() {
            pulseTimer = 0;
            if (motion.matches) { syncMotion(); return; }
            if (!isGridActive || !totalCells) return;
            const count = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count; i++) {
                const index = Math.floor(Math.random() * totalCells);
                const slot = acquire(index);
                if (!slot) continue;
                window.clearTimeout(slot.cleanup);
                slot.cleanup = 0;
                slot.revision++;
                slot.node.classList.add('active');
                const timer = window.setTimeout(() => {
                    slot.holds.delete(timer);
                    slot.node.classList.remove('active');
                    if (!slot.holds.size) finishFade(slot);
                }, Math.random() * 2000 + 500);
                slot.holds.add(timer);
            }
            pulseTimer = window.setTimeout(pulse, Math.random() * 500 + 100);
        }

        function syncMotion() {
            if (!motion.matches) {
                if (isGridActive && !pulseTimer) pulse();
                return;
            }
            clearPulse();
            activeCells.forEach(slot => {
                slot.revision++;
                slot.holds.forEach(timer => window.clearTimeout(timer));
                window.clearTimeout(slot.cleanup);
                slot.node.classList.remove('active');
            });
            activeCells.clear();
            if (pooled) {
                pool.forEach(slot => slot.node.remove());
                pool.length = 0;
                freeCells.length = 0;
            }
        }

        if (pooled) {
            grid.classList.add('is-sparse-grid');
            syncGeometry();
            new window.ResizeObserver(requestGeometry).observe(grid);
            window.addEventListener('resize', requestGeometry, { passive: true });
        } else {
            // Older engines keep the original native-border grid rather than a changed background.
            const count = initialCellCount;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                fragment.appendChild(cell);
            }
            grid.appendChild(fragment);
            legacyCells = Array.from(grid.children);
            totalCells = legacyCells.length;
        }

        motion.addEventListener?.('change', syncMotion);
        if (typeof Effects.createVisibilityGate === 'function') {
            Effects.createVisibilityGate(grid, (isActive) => {
                isGridActive = isActive;
                if (!isGridActive) clearPulse();
                syncMotion();
            }, '160px 0px');
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
