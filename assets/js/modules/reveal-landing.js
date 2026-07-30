/**
 * Landing page reveal presets.
 */
(function (BH) {
    'use strict';

    BH.scrollRevealGroups = BH.scrollRevealGroups || [];

    BH.scrollRevealGroups.push(...[
        { selector: '#hero .hero-signal-pill', preset: 'fade-down', delay: 80 },
        { selector: '#hero .hero-title', preset: 'fade-up', delay: 160 },
        { selector: '#hero .hero-description', preset: 'fade-up', delay: 250 },
        { selector: '#hero .hero-actions', preset: 'fade-up', delay: 330 },

        { selector: '#about .about-content-left', preset: 'fade-right', delay: 0 },
        { selector: '#about .sci-fi-bullets li', preset: 'fade-up', delay: 140, stagger: 70 },
        { selector: '#about .about-capability-chips span', preset: 'scale-soft', delay: 320, stagger: 45 },
        { selector: '#about .about-planets-right', preset: 'fade-left', delay: 120 },

        { selector: '#mission .about-visuals', preset: 'fade-right', delay: 0 },
        { selector: '#mission .about-content', preset: 'fade-left', delay: 120 },
        { selector: '#mission .tech-coins-wrapper', preset: 'fade-up', delay: 220 },

        { selector: '#capabilities .section-header', preset: 'fade-up', delay: 0 },
        { selector: '#capabilities .capability-card', preset: 'scale-soft', delay: 120, stagger: 80 },

        { selector: '#deployments .command-base', preset: 'fade-right', delay: 0 },
        { selector: '#deployments .deploy-header', preset: 'fade-up', delay: 100 },
        { selector: '.dossier-card', preset: 'scale-soft', delay: 0, stagger: 80 },

        { selector: '#reviews .reviews-header', preset: 'fade-up', delay: 0 },
        { selector: '#reviews .review-card-main', preset: 'fade-right', delay: 120 },
        { selector: '#reviews .review-card-side', preset: 'fade-left', delay: 180 },

        { selector: '#contact .launch-console', preset: 'fade-right', delay: 0 },
        { selector: '#contact .glass-form', preset: 'fade-left', delay: 120 },

        { selector: '.footer-newsletter', preset: 'fade-up', delay: 0 },
        { selector: '.footer-brand', preset: 'fade-right', delay: 80 },
        { selector: '.footer-nav', preset: 'fade-up', delay: 140, stagger: 70 },
        { selector: '.footer-contact', preset: 'fade-left', delay: 220 },
        { selector: '.footer-bottom', preset: 'fade-up', delay: 300 }
    ]);
})(window.BlackholeSystems = window.BlackholeSystems || {});
