/**
 * Signal Log newsletter transport.
 * Opens the user's email client until newsletter capture is connected to admin.
 */
(function (BH) {
    'use strict';

    const Forms = BH.Forms = BH.Forms || {};

    Forms.initNewsletterForm = function initNewsletterForm() {
        const newsletterForm = document.querySelector('[data-newsletter-form]');
        const newsletterSubmit = document.querySelector('[data-newsletter-submit]');
        const newsletterStatus = document.querySelector('[data-newsletter-status]');

        if (!newsletterForm || !newsletterSubmit) return;
        if (newsletterForm.dataset.newsletterFormReady === 'true') return;

        const newsletterStateClasses = ['is-success'];

        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!newsletterForm.checkValidity()) {
                newsletterForm.reportValidity();
                return;
            }

            const originalContent = newsletterSubmit.innerHTML;
            const email = new FormData(newsletterForm).get('newsletterEmail') || '';
            const recipient = newsletterForm.dataset.newsletterRecipient || 'info@blackholesys.com';
            const subject = encodeURIComponent('Signal Log subscription');
            const body = encodeURIComponent(`Please add this email to the Blackhole Systems Signal Log: ${email}`);

            newsletterSubmit.classList.add('is-success');
            newsletterSubmit.innerHTML = '<i class="ri-mail-send-line"></i> OPENING MAIL';
            window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

            if (newsletterStatus) {
                newsletterStatus.textContent = 'Your email client should open to confirm the subscription request.';
                newsletterStatus.dataset.status = 'success';
            }

            newsletterForm.reset();

            setTimeout(() => {
                newsletterSubmit.classList.remove(...newsletterStateClasses);
                newsletterSubmit.innerHTML = originalContent;
                if (newsletterStatus) {
                    newsletterStatus.textContent = '';
                    newsletterStatus.dataset.status = '';
                }
            }, 2800);
        });

        newsletterForm.dataset.newsletterFormReady = 'true';
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
