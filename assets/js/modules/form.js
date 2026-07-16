/**
 * Project inquiry form transport.
 * Sends quote requests to the Blackhole Systems admin lead API.
 */
(function (BH) {
    'use strict';

    BH.initFormHandler = function initFormHandler() {
        const submitBtn = document.getElementById('formSubmitBtn');
        const form = document.querySelector('.sci-fi-form');
        const formStatus = document.querySelector('[data-form-status]');
        const newsletterForm = document.querySelector('[data-newsletter-form]');
        const newsletterSubmit = document.querySelector('[data-newsletter-submit]');
        const newsletterStatus = document.querySelector('[data-newsletter-status]');

        if (submitBtn && form) {
            const originalContent = submitBtn.innerHTML;
            const submitStateClasses = ['is-loading', 'is-success', 'is-error'];

            const setSubmitState = (content, type = 'default') => {
                submitBtn.innerHTML = content;
                submitBtn.classList.remove(...submitStateClasses);
                submitBtn.setAttribute('aria-busy', type === 'loading' ? 'true' : 'false');

                if (type !== 'default') {
                    submitBtn.classList.add(`is-${type}`);
                }
            };

            const setSubmitLocked = (isLocked) => {
                submitBtn.classList.toggle('is-locked', isLocked);
                submitBtn.setAttribute('aria-disabled', String(isLocked));

                if ('disabled' in submitBtn) {
                    submitBtn.disabled = isLocked;
                }
            };

            const setStatus = (message, type = 'default') => {
                if (!formStatus) return;
                formStatus.textContent = message;
                formStatus.dataset.status = type;
            };

            const resolveEndpoint = () => {
                const host = window.location.hostname;
                const isLocal = !host || host === 'localhost' || host === '127.0.0.1';

                if (isLocal) {
                    return form.dataset.leadEndpointLocal || form.dataset.leadEndpoint || '';
                }

                return form.dataset.leadEndpointProduction || form.dataset.leadEndpoint || '';
            };

            const buildPayload = () => {
                const payload = new FormData(form);
                const firstName = (payload.get('firstName') || '').toString().trim();
                const lastName = (payload.get('lastName') || '').toString().trim();

                payload.set('name', `${firstName} ${lastName}`.trim());
                payload.set('project_type', payload.get('projectType') || '');
                payload.set('budget_range', payload.get('optionalRange') || '');
                payload.set('brief', payload.get('message') || '');
                payload.set('lead_channel', form.dataset.leadChannel || 'blackhole-web-quote');
                payload.set('source_page', window.location.href);

                return payload;
            };

            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const endpoint = resolveEndpoint();

                if (!endpoint) {
                    setStatus('Lead endpoint is not configured yet.', 'error');
                    setSubmitState('<i class="ri-error-warning-line"></i> CONFIG REQUIRED', 'error');
                    return;
                }

                setSubmitState('<i class="ri-loader-4-line ri-spin"></i> SENDING...', 'loading');
                setStatus('Transmitting project signal...', 'loading');
                setSubmitLocked(true);

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        body: buildPayload()
                    });
                    const data = await response.json().catch(() => ({}));

                    if (!response.ok || data.ok !== true) {
                        throw new Error(data.message || 'The signal could not be transmitted.');
                    }

                    setSubmitState('<i class="ri-check-double-line"></i> TRANSMISSION SENT', 'success');
                    setStatus(data.message || 'Project signal received. I will review it soon.', 'success');
                    form.reset();

                    setTimeout(() => {
                        setSubmitState(originalContent);
                        setStatus('');
                    }, 4200);
                } catch (error) {
                    setSubmitState('<i class="ri-error-warning-line"></i> TRY AGAIN', 'error');
                    setStatus(error.message || 'Something went wrong. Please try again or use WhatsApp.', 'error');

                    setTimeout(() => {
                        setSubmitState(originalContent);
                    }, 3600);
                } finally {
                    setSubmitLocked(false);
                }
            });
        }

        if (newsletterForm && newsletterSubmit) {
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
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
