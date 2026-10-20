/** Landing bootstrap and an independent direct-contact fallback for missing modules. */
(function (BH) {
    'use strict';
    const Assistant = BH.Assistant = BH.Assistant || {};
    const fallbacks = new WeakMap();

    function mountFallback(elements) {
        const { widget, panel, toggle, close, messages, form, input, chips } = elements;
        if (fallbacks.has(widget)) return;
        const original = messages.innerHTML;
        messages.replaceChildren();
        const message = document.createElement('div');
        message.className = 'assistant-message bot';
        const bubble = document.createElement('div');
        bubble.className = 'assistant-bubble';
        bubble.textContent = 'Project guidance is unavailable right now. You can still contact Bryan directly. ';
        const link = document.createElement('a');
        link.href = widget.querySelector('.assistant-whatsapp').href;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open WhatsApp';
        bubble.appendChild(link);
        message.appendChild(bubble);
        messages.appendChild(message);
        input.disabled = true;
        form.querySelector('[type="submit"]').disabled = true;
        chips.forEach(chip => { chip.disabled = true; });
        const status = widget.querySelector('.assistant-status');
        status.textContent = 'Direct contact available';
        let focusFrame = 0;
        const focusClose = () => {
            focusFrame = 0;
            if (!widget.classList.contains('is-open') || widget.closest('[inert]')) return;
            if (getComputedStyle(panel).visibility !== 'visible') {
                focusFrame = requestAnimationFrame(focusClose);
                return;
            }
            close.focus({ preventScroll: true });
        };
        const setOpen = open => {
            cancelAnimationFrame(focusFrame);
            focusFrame = 0;
            widget.classList.toggle('is-open', open);
            panel.setAttribute('aria-hidden', String(!open));
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close Blackhole assistant' : 'Open Blackhole assistant');
            if (open) focusClose();
            else toggle.focus({ preventScroll: true });
        };
        const onToggle = () => setOpen(!widget.classList.contains('is-open'));
        const onClose = () => setOpen(false);
        const onKey = event => { if (event.key === 'Escape' && widget.classList.contains('is-open') && !widget.closest('[inert]')) onClose(); };
        const onSubmit = event => event.preventDefault();
        toggle.addEventListener('click', onToggle);
        close?.addEventListener('click', onClose);
        window.addEventListener('keydown', onKey);
        form.addEventListener('submit', onSubmit);
        widget.dataset.assistantReady = 'fallback';
        toggle.disabled = false;
        fallbacks.set(widget, () => {
            cancelAnimationFrame(focusFrame);
            toggle.removeEventListener('click', onToggle);
            close?.removeEventListener('click', onClose);
            window.removeEventListener('keydown', onKey);
            form.removeEventListener('submit', onSubmit);
            messages.innerHTML = original;
            input.disabled = false;
            form.querySelector('[type="submit"]').disabled = false;
            chips.forEach(chip => { chip.disabled = false; });
            status.textContent = 'Project routing online';
            delete widget.dataset.assistantReady;
        });
    }

    BH.initFloatingAssistant = function initFloatingAssistant() {
        const widget = document.querySelector('[data-floating-assistant]');
        if (!widget || widget.dataset.assistantReady === 'true') return;
        const elements = { widget };
        for (const key of ['panel', 'toggle', 'close', 'messages', 'form', 'input']) elements[key] = widget.querySelector('[data-assistant-' + key + ']');
        elements.chips = Array.from(widget.querySelectorAll('[data-assistant-question]'));
        if (!elements.panel || !elements.toggle || !elements.close || !elements.messages || !elements.form || !elements.input) return;
        const data = BH.assistantData;
        if (!data?.links || !data.serviceCatalog || !data.limits || !['createRouter', 'createSession', 'createHandoff', 'mountUi'].every(key => typeof Assistant[key] === 'function')) {
            mountFallback(elements);
            return;
        }
        fallbacks.get(widget)?.();
        fallbacks.delete(widget);
        const projects = window.BlackholeSystemsProjects?.projects || [];
        const router = Assistant.createRouter(data.serviceCatalog, projects);
        const session = Assistant.createSession(data.limits);
        const handoff = Assistant.createHandoff({ ...data, router, session, projects });
        Assistant.mountUi({ ...elements, ...data, buildResponse: handoff.buildResponse });
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
