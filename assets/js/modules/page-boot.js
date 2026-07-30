/**
 * Shared page bootstrap.
 * Prepares global UI layers and starts safe shared modules for standalone pages.
 */
(function (BH) {
    'use strict';

    const bootState = BH.pageBootState || {
        initialized: new Set()
    };

    BH.pageBootState = bootState;

    const getBootTokens = () => {
        const rawValue = document.body.dataset.pageBoot || '';
        return new Set(rawValue.split(/\s+/).filter(Boolean));
    };

    const getAssetsBase = () => {
        return (document.body.dataset.pageAssets || 'assets').replace(/\/$/, '');
    };

    const hasToken = (tokens, token) => tokens.has(token);

    const initOnce = (key, initializer) => {
        if (bootState.initialized.has(key)) return true;
        if (typeof initializer !== 'function') return false;

        bootState.initialized.add(key);
        initializer();
        return true;
    };

    const createLoaderRings = () => {
        const field = document.createElement('div');
        field.className = 'loader-radial-field';

        for (let ringIndex = 1; ringIndex <= 4; ringIndex += 1) {
            const ring = document.createElement('div');
            ring.className = 'loader-radial-ring';
            ring.style.setProperty('--r', String(ringIndex));

            for (let rayIndex = 0; rayIndex < 20; rayIndex += 1) {
                const ray = document.createElement('span');
                ray.className = 'loader-radial-ray';
                ray.style.setProperty('--i', String(rayIndex));
                ring.appendChild(ray);
            }

            field.appendChild(ring);
        }

        return field;
    };

    const prepareLoader = () => {
        let loader = document.getElementById('page-loader');

        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'page-loader';
            loader.id = 'page-loader';
            loader.setAttribute('role', 'status');
            loader.setAttribute('aria-live', 'polite');
            loader.setAttribute('aria-label', 'Initializing Blackhole Systems');
            document.body.prepend(loader);
        }

        if (loader.querySelector('.loader-radial')) return;

        const radial = document.createElement('div');
        radial.className = 'loader-radial';
        radial.setAttribute('aria-hidden', 'true');

        const core = document.createElement('div');
        core.className = 'loader-radial-core';

        const logo = document.createElement('img');
        logo.src = `${getAssetsBase()}/images/logo_bhws_w-icon.png`;
        logo.alt = '';
        logo.width = 500;
        logo.height = 500;
        logo.decoding = 'async';

        core.appendChild(logo);
        radial.appendChild(createLoaderRings());
        radial.appendChild(core);
        loader.appendChild(radial);
    };

    const prepareCursor = () => {
        if (!document.getElementById('cursor-dot')) {
            const cursorDot = document.createElement('div');
            cursorDot.className = 'cursor-dot';
            cursorDot.id = 'cursor-dot';
            cursorDot.setAttribute('aria-hidden', 'true');
            document.body.appendChild(cursorDot);
        }

        if (!document.getElementById('cursor-ring')) {
            const cursorRing = document.createElement('div');
            cursorRing.className = 'cursor-ring';
            cursorRing.id = 'cursor-ring';
            cursorRing.setAttribute('aria-hidden', 'true');
            document.body.appendChild(cursorRing);
        }
    };

    BH.initPageBoot = function initPageBoot() {
        const tokens = getBootTokens();

        if (hasToken(tokens, 'loader')) {
            prepareLoader();

            if (!initOnce('loader', BH.initPageLoader)) {
                document.body.classList.remove('is-loading');
            }
        }

        if (hasToken(tokens, 'cursor')) {
            prepareCursor();
            initOnce('cursor', BH.initCustomCursor);
        }

        if (hasToken(tokens, 'stars')) {
            initOnce('stars', BH.initStarField);
        }

        if (hasToken(tokens, 'reveal')) {
            initOnce('reveal', BH.initScrollReveal);
        }
    };

    document.addEventListener('DOMContentLoaded', BH.initPageBoot, { once: true });
})(window.BlackholeSystems = window.BlackholeSystems || {});
