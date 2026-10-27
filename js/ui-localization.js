/* Translations for static HTML labels not owned by the timer engine modules. */
(() => {
    'use strict';

    const COPY = {
        es: {
            description: 'Consulta los horarios de todos los eventos de MIR4 Global en tiempo real. Temporizadores, regiones y alertas para la comunidad.',
            socialAlt: 'TIMERS | Mir4VE, horarios de eventos de MIR4 Global',
            flagAlts: ['Bandera de Venezuela', 'Bandera de Brasil', 'Bandera de Estados Unidos'],
            timeFormatLabel: 'Cambiar formato horario',
            timeFormatTitle: 'Cambiar entre formato de 24 y 12 horas',
            clockGroup: 'Relojes y reinicio semanal',
            onlineTitle: 'Usuarios con conexión activa a esta página',
            onlineCounterTitle: 'Contador de sesiones activas',
            serverSelect: 'Seleccionar región del servidor',
            languageSelect: 'Seleccionar idioma',
            eventCategories: 'Categorías de eventos',
            tokenMarket: 'Cotizaciones de tokens MIR4',
            betaTitle: 'Página en desarrollo',
            volumeGroup: 'Elegir volumen de la alerta principal',
            volumePanel: 'Volumen exclusivo de la alerta principal',
            triggerGroup: 'Elegir cuándo se activa la alerta principal',
            triggerPanel: 'Disparador de la alerta principal',
            volume: n => `Volumen ${n}%`,
            trigger: n => `Disparar a ${n} ${n === '1' ? 'minuto' : 'minutos'}`,
            tokenMarketOpen: 'abrir mercado PNIX', tokenWemixOpen: 'abrir WEMIX PLAY', tokenMexOpen: 'en MEXC',
            referencePrice: 'Valor de referencia de la captura aportada; pendiente de actualización en vivo',
            tokenLoading: 'Cargando…',
            home: 'Inicio',
            about: 'Sobre el proyecto',
            sponsorAria: 'Patrocinio: canal de YouTube de NDS Beatsong',
            footerAria: 'Créditos, reconocimiento y derechos de autor',
            instagramAria: 'Visitar el perfil de Sh0V1 en Instagram',
            independentProject: 'PROYECTO INDEPENDIENTE',
            communityMade: 'HECHO PARA LA COMUNIDAD',
            qualityAria: 'Diseñado para la comunidad',
            recognitionTitle: 'PLATAFORMAS Y HERRAMIENTAS RECONOCIDAS',
            recognitionAria: 'Plataformas y herramientas reconocidas',
            visitMir4: 'Visitar MIR4 Global', visitGitHub: 'Visitar GitHub', visitChatGPT: 'Visitar ChatGPT', visitGemini: 'Visitar Gemini',
            copyrightSuffix: '. Proyecto comunitario independiente.',
            legal: 'Las marcas se muestran con fines de reconocimiento y pertenecen a sus respectivos titulares.',
            promoAria: 'Evento destacado Bicheon Phantom Night',
            promoLinkAria: 'Ver los detalles del evento Bicheon Phantom Night (se abre en una pestaña nueva)',
            promoAlt: 'Bicheon Phantom Night, evento de MIR4 Global del 27 de octubre al 23 de noviembre de 2026',
            promoClose: 'Minimizar la promoción del evento',
            promoRestore: 'Mostrar la promoción del evento',
            promoRestoreTitle: 'Mostrar evento',
            promoBadge: 'EVENTO',
            copyright: '© 2026 MIR4VE Timers'
        },
        pt: {
            description: 'Consulte os horários de todos os eventos de MIR4 Global em tempo real. Temporizadores, regiões e alertas para a comunidade.',
            socialAlt: 'TIMERS | Mir4VE, horários dos eventos de MIR4 Global',
            flagAlts: ['Bandeira da Venezuela', 'Bandeira do Brasil', 'Bandeira dos Estados Unidos'],
            timeFormatLabel: 'Alterar formato de hora',
            timeFormatTitle: 'Alternar entre os formatos de 24 e 12 horas',
            clockGroup: 'Relógios e reinício semanal',
            onlineTitle: 'Usuários conectados a esta página',
            onlineCounterTitle: 'Contador de sessões ativas',
            serverSelect: 'Selecionar região do servidor',
            languageSelect: 'Selecionar idioma',
            eventCategories: 'Categorias de eventos',
            tokenMarket: 'Cotações dos tokens MIR4',
            betaTitle: 'Página em desenvolvimento',
            volumeGroup: 'Escolher o volume do alerta principal',
            volumePanel: 'Volume exclusivo do alerta principal',
            triggerGroup: 'Escolher quando o alerta principal será ativado',
            triggerPanel: 'Acionador do alerta principal',
            volume: n => `Volume ${n}%`,
            trigger: n => `Disparar em ${n} ${n === '1' ? 'minuto' : 'minutos'}`,
            tokenMarketOpen: 'abrir mercado PNIX', tokenWemixOpen: 'abrir WEMIX PLAY', tokenMexOpen: 'na MEXC',
            referencePrice: 'Valor de referência da captura enviada; aguardando atualização em tempo real',
            tokenLoading: 'Carregando…',
            home: 'Início',
            about: 'Sobre o projeto',
            sponsorAria: 'Patrocínio: canal do YouTube NDS Beatsong',
            footerAria: 'Créditos, reconhecimento e direitos autorais',
            instagramAria: 'Visitar o perfil de Sh0V1 no Instagram',
            independentProject: 'PROJETO INDEPENDENTE',
            communityMade: 'FEITO PARA A COMUNIDADE',
            qualityAria: 'Feito para a comunidade',
            recognitionTitle: 'PLATAFORMAS E FERRAMENTAS RECONHECIDAS',
            recognitionAria: 'Plataformas e ferramentas reconhecidas',
            visitMir4: 'Visitar MIR4 Global', visitGitHub: 'Visitar GitHub', visitChatGPT: 'Visitar ChatGPT', visitGemini: 'Visitar Gemini',
            copyrightSuffix: '. Projeto comunitário independente.',
            legal: 'As marcas são exibidas para fins de reconhecimento e pertencem aos seus respectivos titulares.',
            promoAria: 'Evento em destaque Bicheon Phantom Night',
            promoLinkAria: 'Ver detalhes do evento Bicheon Phantom Night (abre em uma nova aba)',
            promoAlt: 'Bicheon Phantom Night, evento de MIR4 Global de 27 de outubro a 23 de novembro de 2026',
            promoClose: 'Minimizar a promoção do evento',
            promoRestore: 'Mostrar a promoção do evento',
            promoRestoreTitle: 'Mostrar evento',
            promoBadge: 'EVENTO',
            copyright: '© 2026 MIR4VE Timers'
        },
        en: {
            description: 'Check all MIR4 Global event schedules in real time, with timers, regions, and alerts for the community.',
            socialAlt: 'TIMERS | Mir4VE, MIR4 Global event schedules',
            flagAlts: ['Flag of Venezuela', 'Flag of Brazil', 'Flag of the United States'],
            timeFormatLabel: 'Change time format',
            timeFormatTitle: 'Switch between 24-hour and 12-hour time',
            clockGroup: 'Clocks and weekly reset',
            onlineTitle: 'Users currently connected to this page',
            onlineCounterTitle: 'Active session counter',
            serverSelect: 'Select server region',
            languageSelect: 'Select language',
            eventCategories: 'Event categories',
            tokenMarket: 'MIR4 token prices',
            betaTitle: 'Page in development',
            volumeGroup: 'Choose the main alert volume',
            volumePanel: 'Volume for the main alert only',
            triggerGroup: 'Choose when the main alert activates',
            triggerPanel: 'Main alert trigger',
            volume: n => `Volume ${n}%`,
            trigger: n => `Trigger at ${n} ${n === '1' ? 'minute' : 'minutes'}`,
            tokenMarketOpen: 'open PNIX market', tokenWemixOpen: 'open WEMIX PLAY', tokenMexOpen: 'on MEXC',
            referencePrice: 'Reference value from the supplied capture; awaiting live refresh',
            tokenLoading: 'Loading…',
            home: 'Home',
            about: 'About the project',
            sponsorAria: 'Sponsor: NDS Beatsong YouTube channel',
            footerAria: 'Credits, recognition, and copyright',
            instagramAria: 'Visit Sh0V1 on Instagram',
            independentProject: 'INDEPENDENT PROJECT',
            communityMade: 'MADE FOR THE COMMUNITY',
            qualityAria: 'Designed for the community',
            recognitionTitle: 'RECOGNIZED PLATFORMS AND TOOLS',
            recognitionAria: 'Recognized platforms and tools',
            visitMir4: 'Visit MIR4 Global', visitGitHub: 'Visit GitHub', visitChatGPT: 'Visit ChatGPT', visitGemini: 'Visit Gemini',
            copyrightSuffix: '. Independent community project.',
            legal: 'These brands are shown for recognition purposes and belong to their respective owners.',
            promoAria: 'Featured event Bicheon Phantom Night',
            promoLinkAria: 'View Bicheon Phantom Night event details (opens in a new tab)',
            promoAlt: 'Bicheon Phantom Night, a MIR4 Global event running October 27 through November 23, 2026',
            promoClose: 'Minimize event promotion',
            promoRestore: 'Show event promotion',
            promoRestoreTitle: 'Show event',
            promoBadge: 'EVENT',
            copyright: '© 2026 MIR4VE Timers'
        }
    };

    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element && value !== undefined) element.textContent = value;
    };
    const setAttribute = (selector, attribute, value) => {
        const element = document.querySelector(selector);
        if (element && value !== undefined) element.setAttribute(attribute, value);
    };
    const setMeta = (selector, value) => {
        const element = document.querySelector(selector);
        if (element && value) element.setAttribute('content', value);
    };

    function applyLanguage(language) {
        const lang = COPY[language] ? language : 'es';
        const t = COPY[lang];

        setMeta('meta[name="description"]', t.description);
        setMeta('meta[property="og:description"]', t.description);
        setMeta('meta[name="twitter:description"]', t.description);
        setMeta('meta[property="og:image:alt"]', t.socialAlt);
        document.querySelectorAll('#lang-menu img').forEach((image, index) => {
            if (t.flagAlts[index]) image.setAttribute('alt', t.flagAlts[index]);
        });
        setAttribute('#time-format-toggle', 'aria-label', t.timeFormatLabel);
        setAttribute('#time-format-toggle', 'title', t.timeFormatTitle);
        setAttribute('#header-time-counters', 'aria-label', t.clockGroup);
        setAttribute('#online-pill', 'title', t.onlineTitle);
        setAttribute('#online-counter', 'title', t.onlineCounterTitle);
        setAttribute('#server-select', 'aria-label', t.serverSelect);
        setAttribute('#lang-select', 'aria-label', t.languageSelect);
        const eventNavigation = document.getElementById('main-event-nav')?.closest('nav');
        if (eventNavigation) eventNavigation.setAttribute('aria-label', t.eventCategories);
        setAttribute('#mir4-token-market', 'aria-label', t.tokenMarket);
        setAttribute('#site-intro-title .beta-superscript', 'title', t.betaTitle);
        setAttribute('.alert-volume-compact', 'aria-label', t.volumePanel);
        setAttribute('#alert-volume-buttons', 'aria-label', t.volumeGroup);
        setAttribute('.alert-trigger-compact', 'aria-label', t.triggerPanel);
        setAttribute('#alert-trigger-buttons', 'aria-label', t.triggerGroup);
        document.querySelectorAll('[data-alert-volume]').forEach(button => {
            button.setAttribute('aria-label', t.volume(button.dataset.alertVolume));
        });
        document.querySelectorAll('[data-alert-trigger]').forEach(button => {
            button.setAttribute('aria-label', t.trigger(button.dataset.alertTrigger));
        });
        setAttribute('#home-nav-btn', 'aria-label', t.home);
        setAttribute('#home-nav-btn', 'title', t.home);
        setAttribute('#about-nav-btn', 'aria-label', t.about);
        setAttribute('#about-nav-btn', 'title', t.about);
        setAttribute('#sponsor-btn', 'aria-label', t.sponsorAria);
        document.querySelectorAll('.token-coin').forEach(link => {
            const symbol = link.querySelector('.token-coin-symbol')?.textContent.trim() || '';
            let action = t.tokenMarketOpen;
            if (symbol === 'HYDRA' || symbol === 'DRACO') action = t.tokenWemixOpen;
            else if (symbol === 'WEMIX / USDT') action = t.tokenMexOpen;
            link.setAttribute('aria-label', `${symbol}, ${action}`);
        });
        document.querySelectorAll('.token-coin-price[data-reference="true"]').forEach(price => {
            price.setAttribute('title', t.referencePrice);
        });
        setText('#wemix-price.loading', t.tokenLoading);

        setAttribute('.site-credits-footer', 'aria-label', t.footerAria);
        setAttribute('.site-credits-footer__identity', 'aria-label', t.instagramAria);
        setText('.site-credits-footer__eyebrow', t.independentProject);
        setText('.site-credits-footer__quality span', t.communityMade);
        setAttribute('.site-credits-footer__quality', 'aria-label', t.qualityAria);
        setText('.site-credits-footer__section-label', t.recognitionTitle);
        setAttribute('.site-credits-footer__recognition nav', 'aria-label', t.recognitionAria);
        setAttribute('.site-credits-footer__logo-link--mir4', 'aria-label', t.visitMir4);
        setAttribute('.site-credits-footer__logo-link--github', 'aria-label', t.visitGitHub);
        setAttribute('.site-credits-footer__logo-link--chatgpt', 'aria-label', t.visitChatGPT);
        setAttribute('.site-credits-footer__logo-link--gemini', 'aria-label', t.visitGemini);
        setText('.site-credits-footer__legal', t.legal);

        const copyright = document.querySelector('.site-credits-footer__bottom > p:first-child');
        if (copyright) {
            const brand = copyright.querySelector('strong');
            if (brand) copyright.replaceChildren(document.createTextNode('© 2026 '), brand, document.createTextNode(t.copyrightSuffix));
            else copyright.textContent = `${t.copyright}${t.copyrightSuffix}`;
        }

        setAttribute('#floating-event-promo', 'aria-label', t.promoAria);
        setAttribute('#floating-event-promo__link', 'aria-label', t.promoLinkAria);
        setAttribute('#floating-event-promo__link img', 'alt', t.promoAlt);
        setAttribute('#floating-event-promo .floating-event-promo__close', 'aria-label', t.promoClose);
        setAttribute('#floating-event-promo .floating-event-promo__close', 'title', t.promoClose);
        setAttribute('#floating-event-promo .floating-event-promo__restore', 'aria-label', t.promoRestore);
        setAttribute('#floating-event-promo .floating-event-promo__restore', 'title', t.promoRestoreTitle);
        setText('#floating-event-promo .floating-event-promo__tombstone-label', t.promoBadge);
    }

    document.addEventListener('mir4ve:languagechange', event => {
        applyLanguage(event.detail?.language || document.documentElement.lang);
    });
    applyLanguage(document.documentElement.lang || 'es');
})();
