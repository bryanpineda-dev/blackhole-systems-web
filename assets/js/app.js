/**
 * BLACKHOLE SYSTEMS | ENGINE BOOTSTRAP
 * --------------------------------------------------------------------------
 * This file is the single startup point for the landing page. Feature modules
 * register their initializers on window.BlackholeSystems and this bootstrap
 * runs them after the DOM is ready.
 */
(function bootstrapBlackholeSystems(BH) {
    'use strict';

    const initializers = [
        'initPageLoader',
        'initScrollReveal',
        'initAboutOrbitObserver',
        'initTelemetry',
        'initProjectFilter',
        'initReviewsSlider',
        'initCardTilt',
        'initFormHandler',
        'initHeaderScroll',
        'initHeaderMobileNav',
        'initStarField',
        'initCometField',
        'initGridPulse',
        'initHeaderZoneObserver',
        'initFloatingAssistant',
        'initCustomCursor'
    ];

    document.addEventListener('DOMContentLoaded', () => {
        initializers.forEach((initializerName) => {
            const initializer = BH[initializerName];

            if (typeof initializer === 'function') {
                initializer();
            }
        });
    });
})(window.BlackholeSystems = window.BlackholeSystems || {});
