/**
 * Interactive card physics.
 * Keep this scoped to .glass-card so project cards and code cards remain stable.
 */
(function (BH) {
    'use strict';

    BH.initCardTilt = function initCardTilt() {
        const cards = document.querySelectorAll('.glass-card');
        if (!cards.length) return;

        cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const xRot = -1 * ((y - rect.height / 2) / 25);
                const yRot = (x - rect.width / 2) / 25;

                card.style.transition = 'transform 0.2s ease';
                card.style.transform = `perspective(1000px) scale(1.02) translateY(-10px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
                card.style.zIndex = 'var(--z-content)';
                card.style.borderColor = 'var(--primary-white)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease, border-color 0.4s ease';
                card.style.transform = 'perspective(1000px) scale(1) translateY(0) rotateX(0) rotateY(0)';
                card.style.zIndex = 'var(--z-base)';
                card.style.borderColor = '';

                setTimeout(() => {
                    card.style.zIndex = '';
                }, 300);
            });
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
