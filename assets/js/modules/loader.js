/**
 * Page boot loader.
 * Keeps the brand loader visible briefly, then fades it out after load or timeout.
 */
(function (BH) {
    'use strict';

    BH.initPageLoader = function initPageLoader() {
        const loader = document.getElementById('page-loader');
        if (!loader) return;

        const startedAt = performance.now();
        const minimumDuration = 850;
        const maximumDuration = 2200;
        let hasFinished = false;

        const removeLoader = () => {
            window.setTimeout(() => {
                loader.remove();
            }, 700);
        };

        const hideLoader = () => {
            if (hasFinished) return;

            hasFinished = true;
            const elapsed = performance.now() - startedAt;
            const remaining = Math.max(0, minimumDuration - elapsed);

            window.setTimeout(() => {
                loader.classList.add('is-hiding');
                document.body.classList.remove('is-loading');
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
