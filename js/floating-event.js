/* ========================================================================== */
/* FLOATING EVENT PROMOTION                                                   */
/* User preference persists in localStorage; the image link never dismisses. */
/* Sounds are generated with Web Audio (no external audio files or requests). */
/* ========================================================================== */
(() => {
    'use strict';

    const promo = document.getElementById('floating-event-promo');
    if (!promo) return;

    const promoLink = promo.querySelector('.floating-event-promo__link');
    const closeButton = promo.querySelector('.floating-event-promo__close');
    const restoreButton = promo.querySelector('.floating-event-promo__restore');
    if (!promoLink || !closeButton || !restoreButton) return;

    const STORAGE_KEY = 'mir4ve:floating-event-promo:state:v1';
    let audioContext = null;

    const readSavedState = () => {
        try {
            return window.localStorage.getItem(STORAGE_KEY) === 'minimized' ? 'minimized' : 'open';
        } catch (_) {
            // Keep the component functional when storage is disabled by the browser.
            return 'open';
        }
    };

    const saveState = (state) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, state);
        } catch (_) {
            // State changes still work for this page even when persistent storage is blocked.
        }
    };

    const applyState = (state) => {
        const minimized = state === 'minimized';
        promo.classList.toggle('is-minimized', minimized);
        closeButton.setAttribute('aria-expanded', String(!minimized));
        restoreButton.setAttribute('aria-expanded', String(!minimized));
        promoLink.setAttribute('tabindex', minimized ? '-1' : '0');
        closeButton.tabIndex = minimized ? -1 : 0;
        restoreButton.tabIndex = minimized ? 0 : -1;
    };

    /* Tiny, low-volume chimes; called only from direct user interaction. */
    const playHalloweenChime = (action) => {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            if (!audioContext) audioContext = new AudioContextClass();
            if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});

            const now = audioContext.currentTime;
            const tones = action === 'restore'
                ? [{ from: 480, to: 620, at: 0 }, { from: 660, to: 760, at: 0.075 }]
                : [{ from: 620, to: 470, at: 0 }, { from: 420, to: 350, at: 0.055 }];

            tones.forEach(({ from, to, at }) => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                const start = now + at;
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(from, start);
                oscillator.frequency.exponentialRampToValueAtTime(to, start + 0.12);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.026, start + 0.018);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                oscillator.start(start);
                oscillator.stop(start + 0.17);
                oscillator.addEventListener('ended', () => {
                    oscillator.disconnect();
                    gain.disconnect();
                }, { once: true });
            });
        } catch (_) {
            // Audio is an enhancement only; never block minimization or restoration.
        }
    };

    const minimizePromo = () => {
        playHalloweenChime('minimize');
        applyState('minimized');
        saveState('minimized');
        restoreButton.focus({ preventScroll: true });
    };

    const restorePromo = () => {
        playHalloweenChime('restore');
        applyState('open');
        saveState('open');
        closeButton.focus({ preventScroll: true });
    };

    closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        minimizePromo();
    });

    restoreButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        restorePromo();
    });

    // Deliberately do not hide or minimize the artwork on link activation.
    // The anchor's target=_blank and rel=noopener attributes handle the pop-up safely.

    applyState(readSavedState());
})();
