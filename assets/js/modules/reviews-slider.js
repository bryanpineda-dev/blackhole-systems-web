/**
 * Client transmissions slider.
 * Keeps reviews as a controlled single-card carousel without adding autoplay noise.
 */
(function (BH) {
    'use strict';

    BH.initReviewsSlider = function initReviewsSlider() {
        const slider = document.querySelector('[data-review-slider]');
        if (!slider) return;
        if (slider.dataset.reviewSliderReady === 'true') return;

        const track = slider.querySelector('.reviews-track');
        const cards = Array.from(slider.querySelectorAll('.review-card'));
        const previousButtons = Array.from(slider.querySelectorAll('[data-review-prev]'));
        const nextButtons = Array.from(slider.querySelectorAll('[data-review-next]'));
        const dots = Array.from(slider.querySelectorAll('[data-review-dot]'));

        if (!track || !cards.length) return;

        let activeIndex = 0;
        let hasRendered = false;

        const normalizeIndex = (index) => (index + cards.length) % cards.length;

        const getDotIndex = (dot) => {
            const dotIndex = Number(dot.dataset.reviewDot);
            return Number.isFinite(dotIndex) ? dotIndex : 0;
        };

        const updateSlider = (nextIndex, options = {}) => {
            const normalizedIndex = normalizeIndex(nextIndex);
            if (hasRendered && !options.force && normalizedIndex === activeIndex) return;

            activeIndex = normalizedIndex;
            slider.dataset.activeReview = String(activeIndex);

            cards.forEach((card, index) => {
                const isActive = index === activeIndex;
                card.classList.toggle('is-active', isActive);
                card.setAttribute('aria-hidden', String(!isActive));
                card.toggleAttribute('inert', !isActive);
            });

            dots.forEach((dot) => {
                const dotIndex = getDotIndex(dot);
                const isActive = dotIndex === activeIndex;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
            });

            track.classList.add('is-ready');
            hasRendered = true;
        };

        previousButtons.forEach((button) => button.addEventListener('click', () => {
            updateSlider(activeIndex - 1);
        }));

        nextButtons.forEach((button) => button.addEventListener('click', () => {
            updateSlider(activeIndex + 1);
        }));

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                updateSlider(getDotIndex(dot));
            });
        });

        slider.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                updateSlider(activeIndex - 1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                updateSlider(activeIndex + 1);
            }
        });

        slider.dataset.reviewSliderReady = 'true';
        updateSlider(0, { force: true });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
