/**
 * Interactive card physics.
 * Keep this scoped to .js-card-tilt so glass surfaces can be reused without motion.
 */
(function (BH) {
    'use strict';

    BH.initCardTilt = function initCardTilt() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
        const supportsTouch = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
        const cards = document.querySelectorAll('.js-card-tilt');
        if (!cards.length || prefersReducedMotion || (!supportsFinePointer && !supportsTouch)) return;

        cards.forEach((card) => {
            if (card.dataset.cardTiltReady === 'true') return;

            let resetTimer = null;

            const applyTilt = (clientX, clientY, options = {}) => {
                const rect = card.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                const divisor = options.divisor || 25;
                const scale = options.scale || 1.02;
                const translateY = options.translateY || -10;
                const xRot = -1 * ((y - rect.height / 2) / divisor);
                const yRot = (x - rect.width / 2) / divisor;

                if (resetTimer) {
                    clearTimeout(resetTimer);
                    resetTimer = null;
                }

                card.style.transition = `transform ${options.transition || '0.2s ease'}`;
                card.style.transform = `perspective(1000px) scale(${scale}) translateY(${translateY}px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
                card.style.zIndex = 'var(--z-content)';
                card.style.borderColor = 'var(--primary-white)';
            };

            const resetTilt = () => {
                card.style.transition = 'transform 0.5s ease, border-color 0.4s ease';
                card.style.transform = 'perspective(1000px) scale(1) translateY(0) rotateX(0) rotateY(0)';
                card.style.zIndex = 'var(--z-base)';
                card.style.borderColor = '';

                resetTimer = setTimeout(() => {
                    card.style.zIndex = '';
                    resetTimer = null;
                }, 300);
            };

            if (supportsFinePointer) {
                card.addEventListener('mousemove', (event) => {
                    applyTilt(event.clientX, event.clientY);
                });

                card.addEventListener('mouseleave', resetTilt);
            }

            if (supportsTouch) {
                const applyTouchTilt = (event) => {
                    const touch = event.touches[0];
                    if (!touch) return;

                    applyTilt(touch.clientX, touch.clientY, {
                        divisor: 42,
                        scale: 1.015,
                        translateY: -6,
                        transition: '0.16s ease'
                    });
                };

                card.addEventListener('touchstart', applyTouchTilt, { passive: true });
                card.addEventListener('touchmove', applyTouchTilt, { passive: true });
                card.addEventListener('touchend', resetTilt, { passive: true });
                card.addEventListener('touchcancel', resetTilt, { passive: true });
            }

            card.dataset.cardTiltReady = 'true';
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
