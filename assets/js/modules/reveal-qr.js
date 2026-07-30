/**
 * QR Studio reveal presets.
 */
(function (BH) {
    'use strict';

    BH.scrollRevealGroups = BH.scrollRevealGroups || [];

    BH.scrollRevealGroups.push(...[
        { selector: '.qr-hero .qr-hero-signal-pill', preset: 'fade-down', delay: 80 },
        { selector: '.qr-hero .qr-hero-title', preset: 'fade-up', delay: 150 },
        { selector: '.qr-hero p', preset: 'fade-up', delay: 230 },
        { selector: '.qr-hero-proof li', preset: 'scale-soft', delay: 320, stagger: 60 },
        { selector: '.qr-system-heading', preset: 'fade-up', delay: 0 },
        { selector: '.qr-builder', preset: 'fade-right', delay: 80 },
        { selector: '.qr-preview-panel', preset: 'fade-left', delay: 160 },
        { selector: '.qr-promise-heading', preset: 'fade-up', delay: 0 },
        { selector: '.qr-promise li', preset: 'scale-soft', delay: 120, stagger: 70 },
        { selector: '.qr-faq-heading', preset: 'fade-right', delay: 0 },
        { selector: '.qr-faq-item', preset: 'fade-left', delay: 100, stagger: 60 },
        { selector: '.qr-tool-footer', preset: 'fade-up', delay: 0 }
    ]);
})(window.BlackholeSystems = window.BlackholeSystems || {});
