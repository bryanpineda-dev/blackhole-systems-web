/**
 * Interactive card physics.
 * Keep this scoped to .js-card-tilt so glass surfaces can be reused without motion.
 */
(function (BH) {
    'use strict';

    BH.initCardTilt = function initCardTilt() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
        const cards = document.querySelectorAll('.js-card-tilt');
        if (!cards.length || prefersReducedMotion || !supportsFinePointer) return;

        cards.forEach((card) => {
            if (card.dataset.cardTiltReady === 'true') return;

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

            card.dataset.cardTiltReady = 'true';
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
