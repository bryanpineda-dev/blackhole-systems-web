/**
 * Floating assistant service router.
 * Scores user messages against the service catalog without owning UI behavior.
 */
(function (BH) {
    'use strict';

    const Assistant = BH.Assistant = BH.Assistant || {};

    function normalizeText(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function matchesKeyword(text, keyword) {
        const normalizedKeyword = normalizeText(keyword);
        if (!normalizedKeyword) return false;

        if (normalizedKeyword.includes(' ')) {
            return text.includes(normalizedKeyword);
        }

        if (normalizedKeyword.length <= 3) {
            const boundaryPattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`);
            return boundaryPattern.test(text);
        }

        return text.includes(normalizedKeyword);
    }

    function scoreService(text, service) {
        return service.keywords.reduce((score, keyword) => {
            const normalizedKeyword = normalizeText(keyword);
            if (!matchesKeyword(text, normalizedKeyword)) return score;

            const phraseBonus = normalizedKeyword.includes(' ') ? 4 : 1;
            const exactBonus = text === normalizedKeyword ? 6 : 0;
            return score + phraseBonus + exactBonus + Math.min(normalizedKeyword.length, 14);
        }, 0);
    }

    Assistant.createRouter = function createRouter(serviceCatalog) {
        function detectService(message, explicitService) {
            if (explicitService && serviceCatalog[explicitService]) {
                return {
                    service: serviceCatalog[explicitService],
                    id: explicitService,
                    confidence: 100,
                    isExplicit: true
                };
            }

            const text = normalizeText(message);
            const ranked = Object.entries(serviceCatalog)
                .map(([id, service]) => ({
                    id,
                    service,
                    score: scoreService(text, service)
                }))
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score);

            const best = ranked[0];
            if (!best) {
                return {
                    service: null,
                    id: 'fallback',
                    confidence: 0,
                    isExplicit: false
                };
            }

            return {
                service: best.service,
                id: best.id,
                confidence: best.score,
                isExplicit: false
            };
        }

        return {
            detectService
        };
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
