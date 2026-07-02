/**
 * Static project inquiry form feedback.
 * This is a front-end placeholder until a real email/CRM endpoint is wired in.
 */
(function (BH) {
    'use strict';

    BH.initFormHandler = function initFormHandler() {
        const submitBtn = document.getElementById('formSubmitBtn');
        const form = document.querySelector('.sci-fi-form');
        const newsletterForm = document.querySelector('[data-newsletter-form]');
        const newsletterSubmit = document.querySelector('[data-newsletter-submit]');

        if (submitBtn && form) {
            submitBtn.addEventListener('click', (event) => {
                event.preventDefault();

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const originalContent = submitBtn.innerHTML;

                submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> SENDING...';
                submitBtn.style.color = 'var(--primary-white)';
                submitBtn.style.textShadow = '0 0 10px var(--white-alpha-70)';
                submitBtn.style.background = 'var(--blue-alpha-50)';
                submitBtn.style.borderColor = 'var(--primary-blue)';
                submitBtn.style.boxShadow = '0 0 15px var(--blue-alpha-50)';

                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="ri-check-double-line"></i> TRANSMISSION SENT';
                    submitBtn.style.background = 'rgba(16, 185, 129, 0.5)';
                    submitBtn.style.borderColor = 'var(--accent-green)';
                    submitBtn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.5)';

                    form.reset();

                    setTimeout(() => {
                        submitBtn.innerHTML = originalContent;
                        submitBtn.removeAttribute('style');
                    }, 3000);
                }, 2000);
            });
        }

        if (newsletterForm && newsletterSubmit) {
            newsletterForm.addEventListener('submit', (event) => {
                event.preventDefault();

                if (!newsletterForm.checkValidity()) {
                    newsletterForm.reportValidity();
                    return;
                }

                const originalContent = newsletterSubmit.innerHTML;

                newsletterSubmit.innerHTML = '<i class="ri-check-double-line"></i> SUBSCRIBED';
                newsletterForm.reset();

                setTimeout(() => {
                    newsletterSubmit.innerHTML = originalContent;
                }, 2800);
            });
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
