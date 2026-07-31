/**
 * BLACKHOLE SYSTEMS | ENGINE BOOTSTRAP
 * --------------------------------------------------------------------------
 * This file is the single startup point for the landing page. Feature modules
 * register their initializers on window.BlackholeSystems and this bootstrap
 * runs them after the DOM is ready.
 */
(function bootstrapBlackholeSystems(BH) {
    'use strict';

    const bootState = BH.appBootState || {
        initialized: new Set()
    };

    BH.appBootState = bootState;

    const initializers = [
        'initPageLoader',
        'initProjectFilter',
        'initScrollReveal',
        'initAboutOrbitObserver',
        'initTechCoinsObserver',
        'initWorkflowCodeScanObserver',
        'initTelemetry',
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
        'initFooterMeta',
        'initFooterSpectrumObserver',
        'initCustomCursor'
    ];

    const runInitializer = (initializerName) => {
        if (bootState.initialized.has(initializerName)) return;

        const initializer = BH[initializerName];

        if (typeof initializer !== 'function') return;

        initializer();
        bootState.initialized.add(initializerName);
    };

    const initApp = () => {
        initializers.forEach((initializerName) => {
            runInitializer(initializerName);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp, { once: true });
    } else {
        initApp();
    }
})(window.BlackholeSystems = window.BlackholeSystems || {});
