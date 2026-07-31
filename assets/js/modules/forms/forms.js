/**
 * Landing form bootstrap.
 * Preserves the public initializer used by the landing app bootstrap.
 */
(function (BH) {
    'use strict';

    const Forms = BH.Forms = BH.Forms || {};

    BH.initFormHandler = function initFormHandler() {
        if (typeof Forms.initQuoteForm === 'function') {
            Forms.initQuoteForm();
        }

        if (typeof Forms.initNewsletterForm === 'function') {
            Forms.initNewsletterForm();
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
