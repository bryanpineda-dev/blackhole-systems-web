/**
 * Blackhole QR Studio.
 * Static QR generator that runs fully in the browser.
 */
(function initBlackholeQrStudio() {
    'use strict';

    const form = document.querySelector('[data-qr-form]');
    const preview = document.querySelector('[data-qr-preview]');
    const statusMessage = document.querySelector('[data-qr-status]');
    const typeButtons = Array.from(document.querySelectorAll('[data-qr-type]'));
    const panels = Array.from(document.querySelectorAll('[data-qr-panel]'));
    const downloadButtons = Array.from(document.querySelectorAll('[data-qr-download]'));
    const presetButtons = Array.from(document.querySelectorAll('[data-qr-preset]'));
    const faqItems = Array.from(document.querySelectorAll('.qr-faq-item'));

    if (!form || !preview || typeof window.QRCodeStyling !== 'function') {
        if (statusMessage) {
            statusMessage.textContent = 'QR engine unavailable. Please reload the tool.';
            statusMessage.classList.add('is-error');
        }
        return;
    }

    const fields = {
        url: document.querySelector('[data-qr-url]'),
        text: document.querySelector('[data-qr-text]'),
        whatsappPhone: document.querySelector('[data-qr-whatsapp-phone]'),
        whatsappMessage: document.querySelector('[data-qr-whatsapp-message]'),
        wifiSsid: document.querySelector('[data-qr-wifi-ssid]'),
        wifiPassword: document.querySelector('[data-qr-wifi-password]'),
        wifiSecurity: document.querySelector('[data-qr-wifi-security]'),
        wifiHidden: document.querySelector('[data-qr-wifi-hidden]'),
        color: document.querySelector('[data-qr-color]'),
        background: document.querySelector('[data-qr-background]'),
        size: document.querySelector('[data-qr-size]'),
        margin: document.querySelector('[data-qr-margin]'),
        logo: document.querySelector('[data-qr-logo]')
    };

    const indicators = {
        size: document.querySelector('[data-qr-size-value]'),
        margin: document.querySelector('[data-qr-margin-value]'),
        type: document.querySelector('[data-qr-meta-type]'),
        length: document.querySelector('[data-qr-meta-length]'),
        logoName: document.querySelector('[data-qr-logo-name]'),
        removeLogo: document.querySelector('[data-qr-remove-logo]')
    };

    const state = {
        type: 'url',
        logoDataUrl: ''
    };

    const presets = {
        blackhole: {
            color: '#0062ff',
            background: '#ffffff'
        },
        classic: {
            color: '#05070c',
            background: '#ffffff'
        },
        print: {
            color: '#111827',
            background: '#ffffff'
        }
    };

    let qrCode = null;
    let renderTimer = 0;

    function cancelScheduledRender() {
        if (!renderTimer) return;

        window.clearTimeout(renderTimer);
        renderTimer = 0;
    }

    function scheduleRenderQr() {
        cancelScheduledRender();

        renderTimer = window.setTimeout(() => {
            renderTimer = 0;
            renderQr();
        }, 80);
    }

    function renderQrNow() {
        cancelScheduledRender();
        renderQr();
    }

    function getValue(field, fallback = '') {
        return field && typeof field.value === 'string' ? field.value.trim() : fallback;
    }

    function getNumber(field, fallback) {
        const value = Number(field ? field.value : fallback);
        return Number.isFinite(value) ? value : fallback;
    }

    function sanitizeHex(value, fallback) {
        return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    }

    function normalizeUrl(value) {
        const url = value.trim();

        if (url === '') {
            return 'https://blackholesys.com';
        }

        if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
            return url;
        }

        return `https://${url}`;
    }

    function normalizePhone(value) {
        return value.replace(/[^\d]/g, '');
    }

    function escapeWifi(value) {
        return value
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/:/g, '\\:');
    }

    function buildWifiPayload() {
        const ssid = escapeWifi(getValue(fields.wifiSsid, 'Blackhole Guest'));
        const password = escapeWifi(getValue(fields.wifiPassword));
        const security = getValue(fields.wifiSecurity, 'WPA');
        const hidden = fields.wifiHidden && fields.wifiHidden.checked ? 'true' : 'false';

        if (security === 'nopass') {
            return `WIFI:T:nopass;S:${ssid};H:${hidden};;`;
        }

        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
    }

    function buildPayload() {
        if (state.type === 'text') {
            const text = getValue(fields.text);
            return {
                data: text || 'Blackhole Systems builds custom digital systems.',
                fallback: text === ''
            };
        }

        if (state.type === 'whatsapp') {
            const phone = normalizePhone(getValue(fields.whatsappPhone, '+50670827504')) || '50670827504';
            const message = getValue(fields.whatsappMessage);
            const query = message !== '' ? `?text=${encodeURIComponent(message)}` : '';

            return {
                data: `https://wa.me/${phone}${query}`,
                fallback: false
            };
        }

        if (state.type === 'wifi') {
            return {
                data: buildWifiPayload(),
                fallback: getValue(fields.wifiSsid) === ''
            };
        }

        return {
            data: normalizeUrl(getValue(fields.url, 'https://blackholesys.com')),
            fallback: getValue(fields.url) === ''
        };
    }

    function buildQrOptions(data) {
        const size = getNumber(fields.size, 320);
        const margin = getNumber(fields.margin, 12);
        const color = sanitizeHex(getValue(fields.color, '#0062ff'), '#0062ff');
        const background = sanitizeHex(getValue(fields.background, '#ffffff'), '#ffffff');

        return {
            width: size,
            height: size,
            type: 'svg',
            data,
            margin,
            qrOptions: {
                errorCorrectionLevel: 'H'
            },
            dotsOptions: {
                color,
                type: 'rounded'
            },
            cornersSquareOptions: {
                color,
                type: 'extra-rounded'
            },
            cornersDotOptions: {
                color,
                type: 'dot'
            },
            backgroundOptions: {
                color: background
            },
            image: state.logoDataUrl || undefined,
            imageOptions: {
                imageSize: 0.24,
                margin: 8,
                hideBackgroundDots: true
            }
        };
    }

    function setStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.classList.toggle('is-error', isError);
    }

    function updateIndicators(payload) {
        const size = getNumber(fields.size, 320);
        const margin = getNumber(fields.margin, 12);

        if (indicators.size) indicators.size.textContent = `${size}px`;
        if (indicators.margin) indicators.margin.textContent = String(margin);
        if (indicators.type) indicators.type.textContent = state.type.toUpperCase();
        if (indicators.length) indicators.length.textContent = `${payload.data.length} chars`;
    }

    function fitPreviewToPanel(size) {
        const previewSize = `min(100%, ${size}px)`;

        Array.from(preview.children).forEach((child) => {
            child.style.width = previewSize;
            child.style.maxWidth = '100%';
        });

        preview.querySelectorAll('canvas, svg').forEach((element) => {
            element.style.width = previewSize;
            element.style.maxWidth = '100%';
            element.style.height = 'auto';
        });
    }

    function renderQr() {
        const payload = buildPayload();
        const options = buildQrOptions(payload.data);

        updateIndicators(payload);

        try {
            if (!qrCode) {
                qrCode = new window.QRCodeStyling(options);
                preview.innerHTML = '';
                qrCode.append(preview);
            } else {
                qrCode.update(options);
            }

            window.requestAnimationFrame(() => fitPreviewToPanel(options.width));

            setStatus(payload.fallback ? 'Preview uses safe sample content until you complete the field.' : 'Ready. Static QR generated locally.');
        } catch (error) {
            setStatus('This content is too large for the current QR settings. Shorten it and try again.', true);
        }
    }

    function setQrType(type) {
        state.type = type;

        typeButtons.forEach((button) => {
            const isActive = button.dataset.qrType === type;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });

        panels.forEach((panel) => {
            const isActive = panel.dataset.qrPanel === type;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });

        renderQrNow();
    }

    function handleLogoUpload(event) {
        const file = event.target.files && event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setStatus('Logo file must be an image.', true);
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setStatus('Logo file is too large. Use an image below 2 MB.', true);
            return;
        }

        const reader = new FileReader();

        reader.addEventListener('load', () => {
            state.logoDataUrl = String(reader.result || '');
            if (indicators.logoName) indicators.logoName.textContent = file.name;
            if (indicators.removeLogo) indicators.removeLogo.disabled = false;
            renderQrNow();
        });

        reader.readAsDataURL(file);
    }

    function removeLogo() {
        state.logoDataUrl = '';
        if (fields.logo) fields.logo.value = '';
        if (indicators.logoName) indicators.logoName.textContent = 'No logo selected';
        if (indicators.removeLogo) indicators.removeLogo.disabled = true;
        renderQrNow();
    }

    function setActivePreset(name) {
        presetButtons.forEach((button) => {
            const isActive = button.dataset.qrPreset === name;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function applyPreset(name) {
        const preset = presets[name];

        if (!preset) {
            return;
        }

        if (fields.color) fields.color.value = preset.color;
        if (fields.background) fields.background.value = preset.background;

        setActivePreset(name);
        renderQrNow();
    }

    function syncFaqHeight(item) {
        const answer = item.querySelector('.qr-faq-answer');

        if (!answer) {
            return;
        }

        item.style.setProperty('--faq-answer-height', `${answer.scrollHeight}px`);
    }

    function setFaqItem(item, isOpen) {
        const trigger = item.querySelector('.qr-faq-trigger');

        syncFaqHeight(item);
        item.classList.toggle('is-open', isOpen);

        if (trigger) {
            trigger.setAttribute('aria-expanded', String(isOpen));
        }
    }

    function initFaq() {
        faqItems.forEach((item) => {
            const trigger = item.querySelector('.qr-faq-trigger');

            syncFaqHeight(item);

            if (!trigger) {
                return;
            }

            trigger.addEventListener('click', () => {
                setFaqItem(item, !item.classList.contains('is-open'));
            });
        });

        window.addEventListener('resize', () => {
            faqItems.forEach(syncFaqHeight);
        });
    }

    function downloadQr(extension) {
        renderQrNow();

        const timestamp = new Date().toISOString().slice(0, 10);
        const name = `blackhole-${state.type}-qr-${timestamp}`;
        qrCode.download({ name, extension });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    form.addEventListener('input', (event) => {
        if (event.target !== fields.logo) {
            scheduleRenderQr();
        }
    });

    form.addEventListener('change', (event) => {
        if (event.target === fields.logo) {
            handleLogoUpload(event);
            return;
        }

        renderQrNow();
    });

    typeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setQrType(button.dataset.qrType || 'url');
        });
    });

    downloadButtons.forEach((button) => {
        button.addEventListener('click', () => {
            downloadQr(button.dataset.qrDownload || 'png');
        });
    });

    presetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyPreset(button.dataset.qrPreset || 'blackhole');
        });
    });

    if (indicators.removeLogo) {
        indicators.removeLogo.addEventListener('click', removeLogo);
    }

    setActivePreset('blackhole');
    initFaq();
    renderQrNow();
})();
