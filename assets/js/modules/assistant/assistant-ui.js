/**
 * Floating assistant UI controller.
 * Owns widget state, message rendering, quick actions, and DOM events.
 */
(function (BH) {
    'use strict';

    const Assistant = BH.Assistant = BH.Assistant || {};

    Assistant.mountUi = function mountUi(options) {
        const {
            widget,
            panel,
            toggle,
            close,
            messages,
            form,
            input,
            chips,
            defaultQuickActions,
            serviceCatalog,
            buildResponse
        } = options;

        if (widget.dataset.assistantReady === 'true') return;

        function scrollMessages() {
            messages.scrollTop = messages.scrollHeight;
        }

        function addMessage(type, content) {
            const message = document.createElement('div');
            message.className = `assistant-message ${type}`;

            const bubble = document.createElement('div');
            bubble.className = 'assistant-bubble';

            if (type === 'bot') {
                bubble.innerHTML = content;
            } else {
                bubble.textContent = content;
            }

            message.appendChild(bubble);
            messages.appendChild(message);
            scrollMessages();
        }

        function addTyping() {
            const typing = document.createElement('div');
            typing.className = 'assistant-message bot assistant-typing';
            typing.innerHTML = '<div class="assistant-bubble"><span></span><span></span><span></span></div>';
            messages.appendChild(typing);
            scrollMessages();
            return typing;
        }

        function setQuickActions(actionIds = defaultQuickActions) {
            chips.forEach((chip, index) => {
                const serviceId = actionIds[index] || defaultQuickActions[index];
                const service = serviceCatalog[serviceId];
                if (!service) return;

                chip.dataset.assistantQuestion = serviceId;
                chip.textContent = service.chip;
            });
        }

        function respondTo(message, explicitService) {
            const response = buildResponse(message, explicitService);
            const typing = addTyping();

            window.setTimeout(() => {
                typing.remove();
                addMessage('bot', response.html);
                setQuickActions(response.quickActions);
            }, 360);
        }

        function openAssistant() {
            widget.classList.add('is-open');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close Blackhole assistant');
        }

        function closeAssistant() {
            widget.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open Blackhole assistant');
        }

        function toggleAssistant() {
            if (widget.classList.contains('is-open')) {
                closeAssistant();
            } else {
                openAssistant();
            }
        }

        toggle.addEventListener('click', toggleAssistant);

        if (close) {
            close.addEventListener('click', closeAssistant);
        }

        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                const question = chip.textContent.trim();
                const serviceId = chip.dataset.assistantQuestion;

                addMessage('user', question);
                respondTo(question, serviceId);
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const message = input.value.trim();
            if (!message) return;

            addMessage('user', message);
            input.value = '';
            respondTo(message);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeAssistant();
        });

        widget.dataset.assistantReady = 'true';
        setQuickActions();
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
