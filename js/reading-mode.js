/* Isolated reading-mode control: darkens only the page's photographic background. */
(() => {
    'use strict';

    const button = document.getElementById('reading-mode-toggle');
    if (!button) return;

    const labels = {
        es: { off: 'Oscurecer el fondo de la página', on: 'Restaurar el fondo original' },
        pt: { off: 'Escurecer o fundo da página', on: 'Restaurar o fundo original' },
        en: { off: 'Darken the page background', on: 'Restore the original background' }
    };

    function updateAccessibleLabel(language = document.documentElement.lang) {
        const languageLabels = labels[language] || labels.es;
        const enabled = button.getAttribute('aria-pressed') === 'true';
        const label = enabled ? languageLabels.on : languageLabels.off;
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
    }

    button.addEventListener('click', () => {
        const enabled = document.documentElement.classList.toggle('reading-mode');
        button.setAttribute('aria-pressed', String(enabled));
        updateAccessibleLabel();
    });

    document.addEventListener('mir4ve:languagechange', event => {
        updateAccessibleLabel(event.detail?.language);
    });

    updateAccessibleLabel();
})();
