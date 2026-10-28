/**
 * Star field effect.
 * Generates lightweight particles for any [data-star-field] container.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};
    const instances = new WeakMap();

    Effects.createStarField = function createStarField(container) {
        if (!container) return;
        if (instances.has(container)) return instances.get(container);
        if (container.dataset.starFieldReady === 'true' || typeof Effects.createVisibilityGate !== 'function') return;

        const stars = [];
        let gate;
        let destroyed = false;
        const controller = {
            destroy() {
                if (destroyed) return;
                destroyed = true;
                gate?.destroy();
                stars.forEach(star => star.remove());
                stars.length = 0;
                container.classList.remove('is-star-field-paused');
                delete container.dataset.starFieldReady;
                instances.delete(container);
            }
        };

        const useViewport = container.dataset.starViewport === 'true';
        const numStars = Number.parseInt(container.dataset.starCount || '70', 10);
        const bounds = container.getBoundingClientRect();
        const width = useViewport ? window.innerWidth : bounds.width || container.offsetWidth || window.innerWidth;
        const height = useViewport ? window.innerHeight : bounds.height || container.offsetHeight || window.innerHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 2.5 + 0.5;
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const moveX = centerX - startX;
            const moveY = centerY - startY;
            const duration = Math.random() * 3 + 2.5;
            const delay = Math.random() * 5;

            star.classList.add('star');
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;
            star.style.setProperty('--tx', `${moveX}px`);
            star.style.setProperty('--ty', `${moveY}px`);
            star.style.setProperty('--star-duration', `${duration}s`);
            star.style.setProperty('--star-delay', `${delay}s`);

            container.appendChild(star);
            stars.push(star);
        }

        try {
            gate = Effects.createVisibilityGate(container, (isActive) => {
                container.classList.toggle('is-star-field-paused', !isActive);
            }, { rootMargin: '140px 0px', respectReducedMotion: true });
        } catch (error) {
            controller.destroy();
            throw error;
        }
        instances.set(container, controller);
        container.dataset.starFieldReady = 'true';
        return controller;
    };

    BH.initStarField = function initStarField() {
        const containers = document.querySelectorAll('[data-star-field]');
        if (!containers.length) return;

        containers.forEach(Effects.createStarField);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
