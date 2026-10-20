/**
 * Project inquiry form transport.
 * Sends quote requests to the Blackhole Systems admin lead API.
 */
(function (BH) {
    'use strict';

    const Forms = BH.Forms = BH.Forms || {};

    Forms.initQuoteForm = function initQuoteForm() {
        const submitBtn = document.getElementById('formSubmitBtn');
        const form = document.querySelector('.sci-fi-form');
        const formStatus = form?.querySelector('[data-form-status]');

        if (!submitBtn || !form) return;
        if (form.dataset.quoteFormReady === 'true') return;

        const originalContent = submitBtn.innerHTML;
        const submitStateClasses = ['is-loading', 'is-success', 'is-error'];
        const configuredTimeout = Number(form.dataset.leadTimeoutMs);
        const requestTimeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 15000;
        let isSubmitting = false;
        let resetTimer = 0;

        const clearResetTimer = () => {
            window.clearTimeout(resetTimer);
            resetTimer = 0;
        };

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

        const validateContent = () => {
            const textFields = Array.from(form.querySelectorAll('input:not(.form-honeypot), textarea'));
            textFields.forEach((field) => {
                field.setCustomValidity('');
                const label = field.labels?.[0]?.textContent.trim() || field.name;
                const maxLength = Number(field.dataset.maxlength || field.maxLength);
                if (field.required && !field.value.trim()) {
                    field.setCustomValidity(`Please complete ${label.toLowerCase()}.`);
                } else if (maxLength > 0 && field.value.trim().length > maxLength) {
                    field.setCustomValidity(`${label} must be ${maxLength} characters or fewer.`);
                }
            });

            const firstName = form.elements.namedItem('firstName');
            const lastName = form.elements.namedItem('lastName');
            if (firstName && lastName && `${firstName.value.trim()} ${lastName.value.trim()}`.trim().length > 160) {
                lastName.setCustomValidity('Your full name must be 160 characters or fewer.');
            }
            return form.checkValidity();
        };

        form.addEventListener('input', () => {
            form.querySelectorAll('input, textarea').forEach((field) => field.setCustomValidity(''));
        });

        const buildPayload = (payload) => {
            const firstName = (payload.get('firstName') || '').toString().trim();
            const lastName = (payload.get('lastName') || '').toString().trim();

            payload.set('name', `${firstName} ${lastName}`.trim());
            payload.set('project_type', payload.get('projectType') || '');
            payload.set('budget_range', payload.get('optionalRange') || '');
            payload.set('brief', (payload.get('message') || '').toString().trim());
            payload.set('lead_channel', form.dataset.leadChannel || 'blackhole-web-quote');
            payload.set('source_page', window.location.href);

            return payload;
        };

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (isSubmitting) return;

            if (!validateContent()) {
                form.reportValidity();
                return;
            }

            const endpoint = resolveEndpoint();
            clearResetTimer();

            if (!endpoint) {
                setStatus('Lead endpoint is not configured yet.', 'error');
                setSubmitState('<i class="ri-error-warning-line"></i> CONFIG REQUIRED', 'error');
                return;
            }

            setSubmitState('<i class="ri-loader-4-line ri-spin"></i> SENDING...', 'loading');
            setStatus('Transmitting project signal...', 'loading');
            setSubmitLocked(true);
            isSubmitting = true;
            let timeoutId = 0;
            let didTimeout = false;

            try {
                const payload = new FormData(form);
                const submittedValues = Array.from(payload.entries());
                const controller = new AbortController();
                timeoutId = window.setTimeout(() => {
                    didTimeout = true;
                    controller.abort();
                }, requestTimeout);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: buildPayload(payload),
                    signal: controller.signal
                });
                const body = await response.json().catch(() => null);
                const data = body && typeof body === 'object' ? body : {};

                if (didTimeout || !response.ok || data.ok !== true) {
                    throw new Error(data.message || 'The signal could not be transmitted.');
                }

                setSubmitState('<i class="ri-check-double-line"></i> TRANSMISSION SENT', 'success');
                const currentValues = Array.from(new FormData(form).entries());
                const hasNewEdits = currentValues.length !== submittedValues.length || currentValues.some(([key, value], index) =>
                    key !== submittedValues[index]?.[0] || value !== submittedValues[index]?.[1]);
                setStatus(hasNewEdits
                    ? 'Your submitted details were received. Newer edits were kept here and were not included in that request.'
                    : data.message || 'Project signal received. I will review it soon.', 'success');
                if (!hasNewEdits) form.reset();

                resetTimer = window.setTimeout(() => {
                    setSubmitState(originalContent);
                    if (!hasNewEdits) setStatus('');
                    resetTimer = 0;
                }, 4200);
            } catch (error) {
                setSubmitState('<i class="ri-error-warning-line"></i> TRY AGAIN', 'error');
                setStatus(didTimeout
                    ? 'The server did not respond in time. Your details were kept. Please retry or contact me on WhatsApp.'
                    : error.message || 'Something went wrong. Please try again or use WhatsApp.', 'error');

                resetTimer = window.setTimeout(() => {
                    setSubmitState(originalContent);
                    resetTimer = 0;
                }, 3600);
            } finally {
                window.clearTimeout(timeoutId);
                isSubmitting = false;
                setSubmitLocked(false);
            }
        });

        form.dataset.quoteFormReady = 'true';
        setStatus('');
        setSubmitLocked(false);
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
