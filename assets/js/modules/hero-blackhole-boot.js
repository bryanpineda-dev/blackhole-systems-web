/**
 * Load the existing 3D scene only when its stage and WebGPU API are present.
 */
(function (BH) {
    'use strict';

    if (BH.heroBlackholeReady) return;
    const stage = document.querySelector('[data-hero-blackhole]');
    if (!stage?.closest('.hero-section') || !('gpu' in navigator)) return;

    BH.heroBlackholeReady = import('./hero-blackhole.js?v=1.0.21').catch(error => {
        console.warn('[Blackhole Systems] WebGPU hero module fallback active:', error);
    });
})(window.BlackholeSystems = window.BlackholeSystems || {});
