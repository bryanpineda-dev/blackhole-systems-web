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

        try {
            if (typeof initializer !== 'function') {
                if (initializerName === 'initPageLoader') {
                    throw new Error('Page loader initializer is unavailable.');
                }
                return;
            }

            initializer();
            bootState.initialized.add(initializerName);
        } catch (error) {
            console.error(`[Blackhole Systems] ${initializerName} failed:`, error);

            if (initializerName === 'initPageLoader') {
                if (typeof BH.completePageLoader === 'function') {
                    BH.completePageLoader();
                } else {
                    document.getElementById('page-loader')?.remove();
                    document.body.classList.remove('is-loading');
                    document.dispatchEvent(new CustomEvent('blackhole:loader-complete'));
                }
            }

            if (initializerName === 'initCustomCursor') {
                document.documentElement.classList.remove('has-custom-cursor', 'cursor-ready');
            }
        }
    };

    const initApp = () => {
        initializers.forEach((initializerName) => {
            runInitializer(initializerName);
        });
    };

    const startApp = () => {
        // Dynamic imports do not hold DOMContentLoaded like the former static module.
        // Keep landing startup behind module evaluation, not behind the first GPU frame.
        if (BH.heroBlackholeReady) {
            BH.heroBlackholeReady.then(initApp, initApp);
        } else {
            initApp();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp, { once: true });
    } else {
        startApp();
    }
})(window.BlackholeSystems = window.BlackholeSystems || {});
