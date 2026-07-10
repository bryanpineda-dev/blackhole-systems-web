/**
 * Custom cursor layer.
 * Runs only on fine pointers and respects reduced-motion preferences.
 */
(function (BH) {
    'use strict';

    BH.initCustomCursor = function initCustomCursor() {
        const cursorDot = document.getElementById('cursor-dot');
        const cursorRing = document.getElementById('cursor-ring');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;

        if (!cursorDot || !cursorRing || prefersReducedMotion || !supportsFinePointer) return;

        document.documentElement.classList.add('has-custom-cursor');

        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        let isHovering = false;

        window.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            document.documentElement.classList.add('cursor-ready');
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        document.addEventListener('mouseleave', () => {
            document.documentElement.classList.remove('cursor-ready');
        });

        const renderCursor = () => {
            const easing = isHovering ? 0.45 : 0.25;

            ringX += (mouseX - ringX) * easing;
            ringY += (mouseY - ringY) * easing;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(renderCursor);
        };

        requestAnimationFrame(renderCursor);

        const interactiveElements = document.querySelectorAll(
            'a, button, input, select, textarea, .bh-glass, .glass-coin, .code-card, .dossier-card, .cmd-btn, .btn-morph, .btn-terminal-sm, .review-control, .review-dot, .qr-file-control span, .qr-inline-button, .qr-preset-strip button'
        );

        interactiveElements.forEach((element) => {
            element.addEventListener('mouseenter', () => {
                isHovering = true;
                ringX = mouseX;
                ringY = mouseY;
                cursorDot.classList.add('hovered');
                cursorRing.classList.add('hovered');
            });

            element.addEventListener('mouseleave', () => {
                isHovering = false;
                cursorDot.classList.remove('hovered');
                cursorRing.classList.remove('hovered');
            });
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
