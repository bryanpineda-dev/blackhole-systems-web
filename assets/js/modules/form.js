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

        if (submitBtn && form) {
            const originalContent = submitBtn.innerHTML;

            const setSubmitState = (content, type = 'default') => {
                submitBtn.innerHTML = content;
                submitBtn.removeAttribute('style');
                submitBtn.setAttribute('aria-busy', type === 'loading' ? 'true' : 'false');

                if (type === 'loading') {
                    submitBtn.style.color = 'var(--primary-white)';
                    submitBtn.style.textShadow = '0 0 10px var(--white-alpha-70)';
                    submitBtn.style.background = 'var(--blue-alpha-50)';
                    submitBtn.style.borderColor = 'var(--primary-blue)';
                    submitBtn.style.boxShadow = '0 0 15px var(--blue-alpha-50)';
                }

                if (type === 'success') {
                    submitBtn.style.background = 'rgba(16, 185, 129, 0.5)';
                    submitBtn.style.borderColor = 'var(--accent-green)';
                    submitBtn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.5)';
                }

                if (type === 'error') {
                    submitBtn.style.background = 'rgba(255, 93, 108, 0.18)';
                    submitBtn.style.borderColor = 'rgba(255, 93, 108, 0.55)';
                    submitBtn.style.boxShadow = '0 0 15px rgba(255, 93, 108, 0.25)';
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

            submitBtn.addEventListener('click', async (event) => {
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
                submitBtn.style.pointerEvents = 'none';

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
                    submitBtn.style.pointerEvents = '';
                }
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
