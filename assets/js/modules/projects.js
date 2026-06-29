/**
 * Deployment/project filters.
 * The visible cards use data-category attributes controlled by .cmd-btn buttons.
 */
(function (BH) {
    'use strict';

    BH.initProjectFilter = function initProjectFilter() {
        const buttons = document.querySelectorAll('.cmd-btn');
        const items = document.querySelectorAll('.dossier-card');

        if (!buttons.length || !items.length) return;

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                buttons.forEach((item) => item.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                items.forEach((item) => {
                    const category = item.getAttribute('data-category');
                    const shouldShow = filterValue === 'all' || filterValue === category;

                    if (shouldShow) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0) scale(1)';
                        }, 10);
                        return;
                    }

                    item.style.display = 'none';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px) scale(0.95)';
                });
            });
        });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
