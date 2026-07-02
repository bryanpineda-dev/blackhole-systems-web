/**
 * Hero background particles.
 * Generates a lightweight star field that visually pulls toward the viewport center.
 */
(function (BH) {
    'use strict';

    const createStarField = (container) => {
        if (!container || container.dataset.starFieldReady === 'true') return;

        container.dataset.starFieldReady = 'true';

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
            star.style.animation = `absorbStar ${duration}s ${delay}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

            container.appendChild(star);
        }
    };

    BH.initStarField = function initStarField() {
        const containers = document.querySelectorAll('[data-star-field]');
        if (!containers.length) return;

        containers.forEach(createStarField);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
