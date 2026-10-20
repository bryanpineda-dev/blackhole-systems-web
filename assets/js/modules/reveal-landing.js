/**
 * Landing page reveal presets.
 */
(function (BH) {
    'use strict';

    BH.scrollRevealGroups = BH.scrollRevealGroups || [];

    BH.scrollRevealGroups.push(...[
        { selector: '.section-tag', preset: 'fade-up', delay: 0 },
        { selector: '#hero .hero-signal-pill', preset: 'fade-up', delay: 60 },
        { selector: '#hero .hero-title', preset: 'fade-up', delay: 120 },
        { selector: '#hero .hero-description', preset: 'fade-up', delay: 180 },
        { selector: '#hero .hero-actions', preset: 'fade-up', delay: 240 },

        { selector: '#about .section-heading', preset: 'fade-up', delay: 70 },
        { selector: '#about .hud-text-block', preset: 'fade-up', delay: 140 },
        { selector: '#about .sci-fi-bullets li', preset: 'fade-up', delay: 0, stagger: 60 },
        { selector: '#about .about-capability-chips', preset: 'fade-up', delay: 100 },
        { selector: '#about .about-planets-right', preset: 'fade-left', delay: 120, once: true },

        { selector: '#mission .code-card', preset: 'fade-up', delay: 0, stagger: 60 },
        { selector: '#mission .section-heading', preset: 'fade-up', delay: 70 },
        { selector: '#mission .hud-text-block-color, #mission .about-content > .body-text', preset: 'fade-up', delay: 140 },
        { selector: '#mission .workflow-actions', preset: 'fade-up', delay: 180 },
        { selector: '#mission .tech-coins-wrapper', preset: 'fade-up', delay: 100 },

        { selector: '#capabilities .section-header > :not(.section-tag)', preset: 'fade-up', delay: 70, stagger: 60 },
        { selector: '#capabilities .capability-card', preset: 'fade-up', delay: 0, stagger: 70, staggerByRow: true },

        { selector: '#deployments .command-base', preset: 'fade', delay: 0 },
        { selector: '#deployments .deploy-header', preset: 'fade-up', delay: 100 },
        { selector: '.dossier-card', preset: 'fade-up', delay: 0, stagger: 70, staggerByRow: true },

        { selector: '#reviews .reviews-header > :not(.section-tag)', preset: 'fade-up', delay: 70, stagger: 60 },
        { selector: '#reviews .reviews-slider', preset: 'fade-up', delay: 60 },

        { selector: '#contact .launch-console', preset: 'fade-up', delay: 0 },
        { selector: '#contact .glass-form', preset: 'fade-up', delay: 100 },

        { selector: '.footer-newsletter', preset: 'fade-up', delay: 0 },
        { selector: '.footer-brand', preset: 'fade-up', delay: 60 },
        { selector: '.footer-nav', preset: 'fade-up', delay: 100, stagger: 60 },
        { selector: '.footer-contact', preset: 'fade-up', delay: 160 },
        { selector: '.footer-bottom', preset: 'fade-up', delay: 0 }
    ].map((group) => ({ ...group, repeat: !group.once })));
})(window.BlackholeSystems = window.BlackholeSystems || {});
