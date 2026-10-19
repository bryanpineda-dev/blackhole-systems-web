/**
 * Page boot loader.
 * Keeps the brand loader visible briefly, then fades it out after load or timeout.
 */
(function (BH) {
    'use strict';

    BH.completePageLoader = function completePageLoader() {
        const loader = document.getElementById('page-loader');
        const wasLoading = document.body.classList.contains('is-loading');

        document.body.classList.remove('is-loading');
        loader?.remove();

        if (loader || wasLoading) {
            document.dispatchEvent(new CustomEvent('blackhole:loader-complete'));
        }
    };

    BH.initPageLoader = function initPageLoader() {
        const loader = document.getElementById('page-loader');
        if (!loader) {
            BH.completePageLoader();
            return;
        }

        const startedAt = performance.now();
        const minimumDuration = 850;
        const maximumDuration = 2200;
        const exitDuration = 850;
        let hasFinished = false;

        const removeLoader = () => {
            window.setTimeout(() => {
                BH.completePageLoader();
            }, exitDuration);
        };

        const hideLoader = () => {
            if (hasFinished) return;

            hasFinished = true;
            const elapsed = performance.now() - startedAt;
            const remaining = Math.max(0, minimumDuration - elapsed);

            window.setTimeout(() => {
                loader.classList.add('is-hiding');
                removeLoader();
            }, remaining);
        };

        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader, { once: true });
        }

        window.setTimeout(hideLoader, maximumDuration);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
