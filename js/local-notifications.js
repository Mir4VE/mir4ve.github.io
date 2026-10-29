/* Browser-local notifications only. Never prompts for permission; requires pre-granted browser permission. */
(() => {
    'use strict';

    const hasNotificationApi = () => 'Notification' in window && typeof window.Notification === 'function';
    function createLocalNotification(title, options = {}) {
        if (!hasNotificationApi() || Notification.permission !== 'granted') return null;
        try {
            const notification = new Notification(title, options);
            notification.onclick = () => {
                try { window.focus(); } catch (_) {}
                try { notification.close(); } catch (_) {}
            };
            return notification;
        } catch (_) {
            // Some browsers/platforms do not expose the page constructor. Local alarm audio
            // remains independent and is not affected by notification permission.
            return null;
        }
    }


    document.addEventListener('mir4ve:alarm-fired', event => {
        const detail = event.detail || {};
        const lang = (localStorageSafe('mir4_timer_lang') || document.documentElement.lang || 'es').slice(0, 2);
        const titles = { es: '🔔 Alerta de evento', pt: '🔔 Alerta de evento', en: '🔔 Event alert' };
        const eventTitle = String(detail.eventTitle || 'MIR4VE').replace(/<[^>]*>/g, '');
        createLocalNotification(titles[lang] || titles.es, {
            body: `${eventTitle}${detail.serverId ? ` · ${detail.serverId}` : ''}`,
            icon: './pwa-icon-192.png',
            tag: String(detail.tag || `mir4ve-local-alarm-${detail.eventId || 'event'}`),
            requireInteraction: true,
            silent: true,
            data: { eventId: detail.eventId || null, serverId: detail.serverId || null }
        });
    });

    function localStorageSafe(key) {
        try { return localStorage.getItem(key) || ''; } catch (_) { return ''; }
    }

    // Keep the offline app shell cache only. This worker is not used for notification delivery.
    if ('serviceWorker' in navigator && window.isSecureContext) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {});
        }, { once: true });
    }
})();
