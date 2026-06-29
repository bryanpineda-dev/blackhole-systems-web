/**
 * Hero background particles.
 * Generates a lightweight star field that visually pulls toward the viewport center.
 */
(function (BH) {
    'use strict';

    BH.initStarField = function initStarField() {
        const container = document.getElementById('star-field');
        if (!container) return;

        const numStars = 70;
        const width = window.innerWidth;
        const height = window.innerHeight;
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
})(window.BlackholeSystems = window.BlackholeSystems || {});
