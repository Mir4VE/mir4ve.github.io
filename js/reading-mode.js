/* Isolated reading-mode control: persists the background veil and plays a subtle toggle cue. */
(() => {
    'use strict';

    const STORAGE_KEY = 'mir4ve-reading-mode';
    const button = document.getElementById('reading-mode-toggle');
    if (!button) return;

    const labels = {
        es: { off: 'Oscurecer el fondo de la página', on: 'Restaurar el fondo original' },
        pt: { off: 'Escurecer o fundo da página', on: 'Restaurar o fundo original' },
        en: { off: 'Darken the page background', on: 'Restore the original background' }
    };

    let cueAudioContext = null;

    function readSavedMode() {
        try { return window.localStorage.getItem(STORAGE_KEY) === 'true'; }
        catch (_) { return false; }
    }

    function updateAccessibleLabel(language = document.documentElement.lang) {
        const languageLabels = labels[language] || labels.es;
        const enabled = document.documentElement.classList.contains('reading-mode');
        const label = enabled ? languageLabels.on : languageLabels.off;
        button.setAttribute('aria-pressed', String(enabled));
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
    }

    // A short, quiet two-note cue. It is created only from the click gesture, so it respects
    // browser autoplay policies and does not interfere with the event-alarm audio engine.
    function playToggleCue(enabled) {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            if (!cueAudioContext || cueAudioContext.state === 'closed') {
                cueAudioContext = new AudioContextClass();
            }
            if (cueAudioContext.state === 'suspended') {
                cueAudioContext.resume().catch(() => {});
            }

            const startAt = cueAudioContext.currentTime + 0.015;
            const notes = enabled ? [430, 320] : [587.33, 783.99];
            notes.forEach((frequency, index) => {
                const start = startAt + index * 0.075;
                const oscillator = cueAudioContext.createOscillator();
                const gain = cueAudioContext.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, start);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.035, start + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.105);
                oscillator.connect(gain);
                gain.connect(cueAudioContext.destination);
                oscillator.start(start);
                oscillator.stop(start + 0.11);
            });
        } catch (_) {
            // Sound is an enhancement; mode switching and persistence must still work silently.
        }
    }

    // Restore the mode before interaction; index.html also restores it early to avoid a flash.
    document.documentElement.classList.toggle('reading-mode', readSavedMode());
    updateAccessibleLabel();

    button.addEventListener('click', () => {
        const enabled = !document.documentElement.classList.contains('reading-mode');
        document.documentElement.classList.toggle('reading-mode', enabled);
        try { window.localStorage.setItem(STORAGE_KEY, String(enabled)); }
        catch (_) { /* Private browsing or restricted storage: keep the current session functional. */ }
        updateAccessibleLabel();
        playToggleCue(enabled);
    });

    document.addEventListener('mir4ve:languagechange', event => {
        updateAccessibleLabel(event.detail?.language);
    });
})();
