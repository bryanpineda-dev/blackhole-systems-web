/**
 * Lifecycle for authored CSS signal particles; visual presets stay in CSS.
 */
(function (BH) {
    'use strict';

    const Effects = BH.Effects = BH.Effects || {};
    const instances = new WeakMap();

    Effects.createSignalField = function createSignalField(container) {
        if (!container) return;
        if (instances.has(container)) return instances.get(container);
        if (container.dataset.signalFieldReady === 'true' || typeof Effects.createVisibilityGate !== 'function') return;

        const gate = Effects.createVisibilityGate(container, (isActive) => {
            container.classList.toggle('is-signal-field-paused', !isActive);
        }, { rootMargin: '160px 0px', respectReducedMotion: true });
        let destroyed = false;
        const controller = {
            destroy() {
                if (destroyed) return;
                destroyed = true;
                gate.destroy();
                container.classList.remove('is-signal-field-paused');
                delete container.dataset.signalFieldReady;
                instances.delete(container);
            }
        };
        instances.set(container, controller);
        container.dataset.signalFieldReady = 'true';
        return controller;
    };

    BH.initSignalField = function initSignalField() {
        document.querySelectorAll('[data-signal-field]').forEach(Effects.createSignalField);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
