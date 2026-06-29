/**
 * Client transmissions slider.
 * Keeps reviews as a controlled single-card carousel without adding autoplay noise.
 */
(function (BH) {
    'use strict';

    BH.initReviewsSlider = function initReviewsSlider() {
        const slider = document.querySelector('[data-review-slider]');
        if (!slider) return;

        const track = slider.querySelector('.reviews-track');
        const cards = Array.from(slider.querySelectorAll('.review-card'));
        const previousButton = slider.querySelector('[data-review-prev]');
        const nextButton = slider.querySelector('[data-review-next]');
        const dots = Array.from(slider.querySelectorAll('[data-review-dot]'));

        if (!track || !cards.length) return;

        let activeIndex = 0;

        const updateSlider = (nextIndex) => {
            activeIndex = (nextIndex + cards.length) % cards.length;
            track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;

            cards.forEach((card, index) => {
                const isActive = index === activeIndex;
                card.classList.toggle('is-active', isActive);
                card.setAttribute('aria-hidden', String(!isActive));
            });

            dots.forEach((dot, index) => {
                const isActive = index === activeIndex;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
            });
        };

        previousButton?.addEventListener('click', () => {
            updateSlider(activeIndex - 1);
        });

        nextButton?.addEventListener('click', () => {
            updateSlider(activeIndex + 1);
        });

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                updateSlider(Number(dot.dataset.reviewDot || 0));
            });
        });

        slider.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') updateSlider(activeIndex - 1);
            if (event.key === 'ArrowRight') updateSlider(activeIndex + 1);
        });

        updateSlider(0);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
