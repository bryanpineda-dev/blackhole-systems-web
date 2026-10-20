/** Modeless widget: rendering, focus, bounded history and one pending turn. */
(function (BH) {
    'use strict';
    const Assistant = BH.Assistant = BH.Assistant || {};

    Assistant.mountUi = function mountUi(options) {
        const { widget, panel, toggle, close, messages, form, input, chips, defaultQuickActions, serviceCatalog, buildResponse } = options;
        if (widget.dataset.assistantReady === 'true') return;
        const send = form.querySelector('[type="submit"]');
        const whatsapp = widget.querySelector('.assistant-whatsapp');
        let focusFrame = 0;
        let busy = false;
        let language = 'en';

        function addMessage(type, content, forceScroll = false) {
            const follow = forceScroll || messages.scrollHeight - messages.scrollTop - messages.clientHeight < 32;
            const message = document.createElement('div');
            message.className = 'assistant-message ' + type;
            const bubble = document.createElement('div');
            bubble.className = 'assistant-bubble';
            if (type === 'bot') bubble.innerHTML = content;
            else bubble.textContent = content;
            message.appendChild(bubble);
            messages.appendChild(message);
            while (messages.children.length > 82) messages.firstElementChild.remove();
            if (follow) messages.scrollTop = messages.scrollHeight;
            return message;
        }

        function setBusy(value) {
            busy = value;
            form.setAttribute('aria-busy', String(value));
            send.disabled = value;
            chips.forEach(chip => { chip.disabled = value; });
        }

        function setQuickActions(ids = defaultQuickActions) {
            chips.forEach((chip, index) => {
                const id = ids[index];
                const item = serviceCatalog[id];
                chip.hidden = !item;
                if (!item) {
                    delete chip.dataset.assistantQuestion;
                    return;
                }
                chip.dataset.assistantQuestion = id;
                chip.textContent = language === 'es' ? item.es?.chip || item.chip : item.chip;
            });
        }

        function respondTo(message, explicitService, fromInput = false) {
            if (busy || !message) return;
            setBusy(true);
            let response;
            try {
                response = buildResponse(message, explicitService);
                if (!response || typeof response.html !== 'string' || !Array.isArray(response.quickActions)) throw new Error('Invalid assistant response');
            } catch (error) {
                const bubble = addMessage('user', error instanceof RangeError ? error.message : language === 'es'
                    ? 'Hubo un problema al responder. Tu mensaje sigue en el campo. Int\u00e9ntalo de nuevo o cont\u00e1ctanos por WhatsApp.'
                    : 'Something went wrong while preparing the reply. Your message is still in the field. Try again or contact us on WhatsApp.', true);
                bubble.className = 'assistant-message bot';
                bubble.setAttribute('role', 'alert');
                setBusy(false);
                return;
            }
            if (response.reset) messages.replaceChildren();
            addMessage('user', message, true);
            if (fromInput && input.value.trim() === message) input.value = '';
            language = response.language || language;
            panel.lang = language;
            input.placeholder = language === 'es' ? 'Sobre tu proyecto...' : 'Ask about your project...';
            input.setAttribute('aria-label', language === 'es' ? 'Preguntar al asesor de Blackhole' : 'Ask Blackhole Assistant');
            send.setAttribute('aria-label', language === 'es' ? 'Enviar mensaje' : 'Send message');
            if (response.whatsappUrl && whatsapp) whatsapp.href = response.whatsappUrl;
            const typing = addMessage('bot', '<span></span><span></span><span></span>');
            typing.classList.add('assistant-typing');
            typing.setAttribute('aria-hidden', 'true');
            window.setTimeout(() => {
                const follow = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 32;
                typing.remove();
                addMessage('bot', response.html, follow);
                setQuickActions(response.quickActions);
                setBusy(false);
            }, 360);
        }

        function focusCloseWhenVisible() {
            cancelAnimationFrame(focusFrame);
            focusFrame = 0;
            if (!widget.classList.contains('is-open') || widget.closest('[inert]')) return;
            if (getComputedStyle(panel).visibility !== 'visible') {
                focusFrame = requestAnimationFrame(focusCloseWhenVisible);
                return;
            }
            close?.focus({ preventScroll: true });
        }

        function openAssistant() {
            widget.classList.add('is-open');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close Blackhole assistant');
            focusCloseWhenVisible();
        }

        function closeAssistant() {
            const restore = widget.classList.contains('is-open') && panel.contains(document.activeElement);
            cancelAnimationFrame(focusFrame);
            focusFrame = 0;
            widget.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open Blackhole assistant');
            if (restore) toggle.focus({ preventScroll: true });
        }

        toggle.addEventListener('click', () => widget.classList.contains('is-open') ? closeAssistant() : openAssistant());
        close?.addEventListener('click', closeAssistant);
        chips.forEach(chip => chip.addEventListener('click', () => respondTo(chip.textContent.trim(), chip.dataset.assistantQuestion)));
        form.addEventListener('submit', event => {
            event.preventDefault();
            respondTo(input.value.trim(), undefined, true);
        });
        // A form handoff navigates only; it never submits or overwrites a visitor's brief.
        messages.addEventListener('click', event => {
            const anchor = event.target.closest('a[href="#contact"], a[href="#deployments"]');
            if (!anchor) return;
            closeAssistant();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target?.focus({ preventScroll: true });
        });
        window.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !widget.closest('[inert]')) closeAssistant();
        });
        window.addEventListener('resize', () => {
            if (widget.classList.contains('is-open') && document.activeElement?.closest('.assistant-floating-actions') && getComputedStyle(toggle).visibility === 'hidden') focusCloseWhenVisible();
        });
        widget.dataset.assistantReady = 'true';
        toggle.disabled = false;
        input.disabled = false;
        setBusy(false);
        setQuickActions();
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
