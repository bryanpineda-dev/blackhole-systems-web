/**
 * Deployment archive filters.
 * Owns category transitions and the smooth return to the project archive top.
 */
(function (namespace) {
    'use strict';

    function wait(duration) {
        return new Promise((resolve) => {
            if (!duration) {
                resolve();
                return;
            }

            window.setTimeout(resolve, duration);
        });
    }

    namespace.mountProjectFilter = function mountProjectFilter(options) {
        const { grid, buttons, cards, deploySection } = options;

        if (!grid || !buttons.length || !cards.length) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const filterExitDuration = reducedMotion ? 0 : 160;
        const filterEnterDuration = reducedMotion ? 0 : 260;
        let filterTransitionId = 0;

        function applyFilter(filterValue) {
            cards.forEach((card) => {
                const filters = (card.dataset.filters || '').split(' ');
                const shouldShow = filterValue === 'all' || filters.includes(filterValue);

                card.hidden = !shouldShow;
            });
        }

        function getDeployScrollTarget() {
            if (!deploySection) return window.scrollY;

            const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 0;
            return Math.max(0, deploySection.getBoundingClientRect().top + window.scrollY - headerHeight + 8);
        }

        function waitForScrollEnd(duration) {
            return new Promise((resolve) => {
                let timeout = window.setTimeout(resolve, duration);

                if (!('onscrollend' in window)) return;

                const finish = () => {
                    window.clearTimeout(timeout);
                    window.removeEventListener('scrollend', finish);
                    resolve();
                };

                window.addEventListener('scrollend', finish, { once: true });
            });
        }

        function scrollToDeployments() {
            if (!deploySection) return Promise.resolve();

            const start = window.scrollY;
            const target = getDeployScrollTarget();
            const distance = Math.abs(target - start);

            if (start <= target + 48) {
                return Promise.resolve();
            }

            if (reducedMotion || distance < 24) {
                window.scrollTo({ top: target, behavior: 'auto' });
                return Promise.resolve();
            }

            const duration = Math.min(900, Math.max(360, distance * 0.32));

            window.scrollTo({ top: target, behavior: 'smooth' });
            return waitForScrollEnd(duration + 120);
        }

        async function transitionFilter(filterValue) {
            const transitionId = ++filterTransitionId;
            const lockedHeight = grid.offsetHeight;
            const shouldScroll = deploySection && window.scrollY > getDeployScrollTarget() + 48;

            grid.style.minHeight = `${lockedHeight}px`;
            grid.classList.remove('is-entering');
            grid.classList.add('is-transitioning', 'is-leaving');

            await wait(filterExitDuration);
            if (transitionId !== filterTransitionId) return;

            applyFilter(filterValue);
            grid.classList.remove('is-leaving');
            grid.classList.add('is-entering');

            const nextHeight = grid.scrollHeight;
            grid.style.minHeight = `${Math.max(lockedHeight, nextHeight, 240)}px`;
            grid.offsetHeight;

            requestAnimationFrame(() => {
                if (transitionId !== filterTransitionId) return;
                grid.classList.remove('is-entering');
            });

            await Promise.all([
                shouldScroll ? scrollToDeployments() : Promise.resolve(),
                wait(filterEnterDuration)
            ]);

            if (transitionId !== filterTransitionId) return;

            grid.classList.remove('is-transitioning');
            grid.style.minHeight = '';
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const filterValue = button.getAttribute('data-filter');

                if (button.classList.contains('active')) {
                    scrollToDeployments();
                    return;
                }

                buttons.forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                transitionFilter(filterValue);
            });
        });
    };
})(window.BlackholeSystemsProjects = window.BlackholeSystemsProjects || {});
