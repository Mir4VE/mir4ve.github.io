/* Site core: interface behavior, event timers, navigation, and alerts. */
// --- CASUAL SOURCE-INSPECTION DETERRENCE (NOT SECURITY) ---
        // This only discourages casual access. Client-side HTML/JS can never be made secret.
        document.addEventListener('contextmenu', event => event.preventDefault());
        document.addEventListener('keydown', event => {
            const key = String(event.key || '').toLowerCase();
            const blockedDevShortcut = event.key === 'F12' ||
                (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
                (event.ctrlKey && key === 'u');
            if (blockedDevShortcut) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);

        // --- ROBUST PERSISTENCE LAYER ---
        // localStorage survives page/browser restarts for the same site origin.
        // Guard every access: privacy settings, file:// origins, and storage quotas can throw.
        const appStorage = {
            available: false,
            _tested: false,
            _test() {
                if (this._tested && this.available) return true;
                try {
                    const storage = window.localStorage;
                    const testKey = '__mir4_timer_storage_test__';
                    storage.setItem(testKey, '1');
                    this.available = storage.getItem(testKey) === '1';
                    storage.removeItem(testKey);
                    this._tested = this.available;
                    if (!this.available) {
                        console.warn('[TIMERS] La prueba de almacenamiento local no pudo verificarse. Se volverá a intentar.');
                    }
                } catch (error) {
                    // Do not permanently cache a failed probe: browser privacy policies or
                    // embedded contexts can change while the page is open.
                    this.available = false;
                    this._tested = false;
                    console.warn(
                        '[TIMERS] No se puede acceder a localStorage en este contexto. ' +
                        'Publica la página en GitHub Pages mediante HTTPS y ábrela desde su URL, ' +
                        'no como archivo local ni dentro de un iframe restrictivo.',
                        error
                    );
                }
                return this.available;
            },
            getItem(key) {
                try {
                    if (!this._test()) return null;
                    return window.localStorage.getItem(key);
                } catch (error) {
                    this.available = false;
                    console.warn('[TIMERS] No se pudo leer almacenamiento local:', key, error);
                    return null;
                }
            },
            setItem(key, value) {
                try {
                    if (!this._test()) return false;
                    window.localStorage.setItem(key, String(value));
                    // Verify the write rather than silently claiming persistence.
                    return window.localStorage.getItem(key) === String(value);
                } catch (error) {
                    this.available = false;
                    console.error(
                        '[TIMERS] No se pudo guardar la preferencia:', key, error,
                        'Comprueba que estás usando siempre el mismo dominio HTTPS y que el navegador no bloquea el almacenamiento del sitio.'
                    );
                    return false;
                }
            }
        };
        // Save pending preference changes when the document is backgrounded or closed.
        // This supplements immediate saves; it does not rely on unload firing.
        window.addEventListener('pagehide', () => {
            try {
                appStorage.setItem(STORAGE_LANG, currentLang);
                appStorage.setItem(serverPreferenceKey(STORAGE_MASTER_ALERT), String(globalAudioEnabled));
                appStorage.setItem(serverPreferenceKey(STORAGE_BELLS), JSON.stringify(cardBellStates));
                try { sessionStorage.setItem(STORAGE_SERVER, currentServer); } catch (error) {}
                appStorage.setItem(STORAGE_TIME_FORMAT, timeFormat);
                saveAudioPreferences();
                appStorage.setItem(STORAGE_ACTIVE_TAB, currentTab);
                const about = document.getElementById('about-view');
                appStorage.setItem(STORAGE_ACTIVE_VIEW, about && !about.classList.contains('hidden') ? 'about' : 'home');
            } catch (error) {
                console.warn('[TIMERS] No se pudieron sincronizar todas las preferencias al cerrar:', error);
            }
        });
        // Probe storage immediately. localStorage persists across reloads and browser restarts
        // when this page is opened from the same HTTPS origin and the user has not cleared site data.
        appStorage._test();
        if (location.protocol === 'file:') {
            console.warn('[TIMERS] Esta página se abrió como archivo local. Para probar la persistencia real, publícala en GitHub Pages y usa su URL HTTPS.');
        }

        // --- LOCALSTORAGE PERSISTENCE KEYS ---
        const STORAGE_LANG = "mir4_timer_lang";
        const STORAGE_MASTER_ALERT = "mir4_timer_master_alert";
        const STORAGE_BELLS = "mir4_timer_bells";
        const STORAGE_SERVER = "mir4_timer_server";
        const STORAGE_TIME_FORMAT = "mir4_timer_time_format";
        const STORAGE_ACTIVE_TAB = "mir4_timer_active_tab";
        const STORAGE_ACTIVE_VIEW = "mir4_timer_active_view";

        // --- TRANSLATIONS DICTIONARY ---
        const I18N = {
            es: {
                serverTime: "HORA SERVIDOR", localTime: "HORA LOCAL", weekReset: "REINICIO SEMANAL", online: "en línea", alertsOn: "Alertas activadas", alertsOff: "Alertas desactivadas", sponsor: "SPONSOR",
                introCommunity: "COMUNIDAD DARKOMENS", introDescription: "Consulta los horarios de todos los eventos de MIR4 Global en tiempo real.", introLive: "PANEL DE ALERTAS", alertVolumeLabel: "VOLUMEN DE ALERTA", alertTriggerLabel: "DISPARADOR DE ALERTA",
                navGroups: { domination: "DOMINACIÓN", msP11P12: "𝐏𝟏𝟏 & 𝐏𝟏𝟐", msSp: "MS & SP", worldBoss: "WORLD BOSS", otherContent: "OTROS CONTENIDOS" }, mirageLayer1: "PLANO 1", mirageLayer3: "PLANO 3", conditionStatus: "POR CONDICIÓN", monsterKillCondition: "Aparece tras eliminar entre 7.000 y 8.000 monstruos.", noFixedTime: "SIN HORARIO FIJO", reappearsEvery: "REAPARECE CADA:", frequency: "FRECUENCIA:", perDay: "AL DÍA", bossAppearsIn: "APARECE EN:",
                tabs: { ALL: "TODAS", FRENESI: "FRENESÍ", FURIA: "FURIA", LIDERES: "LIDER III", CIMA: "CIMA", WB_VALLES: "VALLES", WB_LABERINTOS: "LABERINTOS", PURGATORIO: "PURGATORIO", ORATORIO: "ORATORIO CRÍPTICO", TORRE: "TORRE", W1: "W1", W2: "W2", W3: "W3", P3_W1: "W1", P3_W2: "W2", P3_W3: "W3", P3_W4: "W4", P3_W5: "W5", P3_W6: "W6", P3_W7: "W7", P3_W8: "W8" },
                statusActive: "En curso", activeNow: "Evento en curso", statusWaiting: "En espera", nextOpening: "Próxima apertura:", mirageSchedule: "CICLO DE APARICIONES", nextSpawn: "Próxima aparición", timeRemaining: "Tiempo restante", durationActive: "Duración activa:", opensIn: "INICIA EN:", closesIn: "FINALIZA EN:",
                toastTitle: "¡EVENTO ACTIVADO!", toastSub: "Alerta de TIMERS | Mir4VE", nextQueueTitle: "Próximos ciclos en espera:", durationMin: "min", durationHour: "1 hora", timePrefix: "en ", unitHour: "h", unitMinute: "m", unitSecond: "s",
                eventTitles: { frenesi: "MS ◂ FRENESÍ ▸", furia: "MS ◂ FURIA ▸", lideres: "MS ◂ LIDER 3 ▸", oratorio: "◂ Oratorio Críptico ▸", cima_inferior: "SP ◂ JEFE SUR ▸", cima_superior: "SP ◂ JEFE NORTE ▸", purgatorio: "◂ Purgatorio ▸", wb_valles: "WB ◂ VALLES ▸", wb_laberintos: "WB ◂ LABERINTOS ▸", domination_tower: "◂ TORRE DEL DRAGÓN ▸", mirage_jihwa: "P1·W1 ◂ JIHWA ▸", mirage_yaksha: "P1·W1 ◂ YAKSHA ▸", mirage_black_carapace: "P1·W1 ◂ BLACK CARAPACE ▸", mirage_bulhu: "P1·W1 ◂ BULHU ▸", mirage_w2_guemugwang: "P1·W2 ◂ GUEMUGWANG ▸", mirage_w2_maengryong: "P1·W2 ◂ MAEONGRYONG ▸", mirage_w2_molgrash: "P1·W2 ◂ MOLGRASH ▸", mirage_w2_kwangryeong: "P1·W2 ◂ GWANGRYEONG ▸", mirage_w3_bargan: "P1·W3 ◂ BARGAN ▸", mirage_w3_barkas: "P1·W3 ◂ BARKAS ▸", mirage_w3_bordo: "P1·W3 ◂ BORDO ▸", mirage_w3_kelis: "P1·W3 ◂ KELIS ▸", mirage_w3_krog: "P1·W3 ◂ KROG ▸", mirage_w3_morg: "P1·W3 ◂ MORG ▸", mirage_w3_talasa: "P1·W3 ◂ TALASA ▸" },
                bellTitle: "Alertas para este evento", stop: "DETENER", switchTo12: "Cambiar a formato de 12 horas", switchTo24: "Cambiar a formato de 24 horas", triggerAvailable: "Disparador disponible", triggerAvailableIn: "Disponible en "
            },
            pt: {
                serverTime: "HORA DO SERVIDOR", localTime: "HORA LOCAL", weekReset: "REINÍCIO SEMANAL", online: "online", alertsOn: "Alertas ativados", alertsOff: "Alertas desativados", sponsor: "PATROCÍNIO",
                introCommunity: "COMUNIDADE DARKOMENS", introDescription: "Consulte os horários de todos os eventos de MIR4 Global em tempo real.", introLive: "PAINEL DE ALERTAS", alertVolumeLabel: "VOLUME DO ALERTA", alertTriggerLabel: "ACIONADOR DO ALERTA",
                navGroups: { domination: "DOMINAÇÃO", msP11P12: "𝐏𝟏𝟏 & 𝐏𝟏𝟐", msSp: "MS & SP", worldBoss: "WORLD BOSS", otherContent: "OUTROS CONTEÚDOS" }, mirageLayer1: "CAMADA 1", mirageLayer3: "CAMADA 3", conditionStatus: "POR CONDIÇÃO", monsterKillCondition: "Aparece após eliminar entre 7.000 e 8.000 monstros.", noFixedTime: "SEM HORÁRIO FIXO", reappearsEvery: "REAPARECE A CADA:", frequency: "FREQUÊNCIA:", perDay: "POR DIA", bossAppearsIn: "SURGE EM:",
                tabs: { ALL: "TODOS", FRENESI: "FRENESI", FURIA: "FÚRIA", LIDERES: "LÍDER III", CIMA: "PICO SECRETO", WB_VALLES: "VALES", WB_LABERINTOS: "LABIRINTOS", PURGATORIO: "PURGATÓRIO", ORATORIO: "SANTUÁRIO SECRETO", TORRE: "TORRE", W1: "W1", W2: "W2", W3: "W3", P3_W1: "W1", P3_W2: "W2", P3_W3: "W3", P3_W4: "W4", P3_W5: "W5", P3_W6: "W6", P3_W7: "W7", P3_W8: "W8" },
                statusActive: "Em andamento", activeNow: "Evento em andamento", statusWaiting: "Aguardando", nextOpening: "Próxima aparição:", mirageSchedule: "CICLO DE APARIÇÕES", nextSpawn: "Próxima aparição", timeRemaining: "Tempo restante", durationActive: "Duração ativa:", opensIn: "INICIA EM:", closesIn: "FINALIZA EM:",
                toastTitle: "EVENTO INICIADO!", toastSub: "Alerta do TIMERS | Mir4VE", nextQueueTitle: "Próximos ciclos aguardando:", durationMin: "min", durationHour: "1 hora", timePrefix: "em ", unitHour: "h", unitMinute: "min", unitSecond: "s",
                eventTitles: { frenesi: "MS ◂ FRENESI ▸", furia: "MS ◂ FÚRIA ▸", lideres: "MS ◂ LÍDER 3 ▸", oratorio: "◂ Santuário Secreto ▸", cima_inferior: "SP ◂ BOSS SUL ▸", cima_superior: "SP ◂ BOSS NORTE ▸", purgatorio: "◂ Purgatório ▸", wb_valles: "WB ◂ VALES ▸", wb_laberintos: "WB ◂ LABIRINTOS ▸", domination_tower: "◂ TORRE DO DRAGÃO ▸", mirage_jihwa: "C1·W1 ◂ JIHWA ▸", mirage_yaksha: "C1·W1 ◂ YAKSHA ▸", mirage_black_carapace: "C1·W1 ◂ BLACK CARAPACE ▸", mirage_bulhu: "C1·W1 ◂ BULHU ▸", mirage_w2_guemugwang: "C1·W2 ◂ GUEMUGWANG ▸", mirage_w2_maengryong: "C1·W2 ◂ MAEONGRYONG ▸", mirage_w2_molgrash: "C1·W2 ◂ MOLGRASH ▸", mirage_w2_kwangryeong: "C1·W2 ◂ GWANGRYEONG ▸", mirage_w3_bargan: "C1·W3 ◂ BARGAN ▸", mirage_w3_barkas: "C1·W3 ◂ BARKAS ▸", mirage_w3_bordo: "C1·W3 ◂ BORDO ▸", mirage_w3_kelis: "C1·W3 ◂ KELIS ▸", mirage_w3_krog: "C1·W3 ◂ KROG ▸", mirage_w3_morg: "C1·W3 ◂ MORG ▸", mirage_w3_talasa: "C1·W3 ◂ TALASA ▸" },
                bellTitle: "Alertas para este evento", stop: "PARAR", switchTo12: "Mudar para o formato de 12 horas", switchTo24: "Mudar para o formato de 24 horas", triggerAvailable: "Alerta disponível", triggerAvailableIn: "Disponível em "
            },
            en: {
                serverTime: "SERVER TIME", localTime: "LOCAL TIME", weekReset: "WEEKLY RESET", online: "online", alertsOn: "Alerts On", alertsOff: "Alerts Off", sponsor: "SPONSOR",
                introCommunity: "DARKOMENS COMMUNITY", introDescription: "Check the schedules for all MIR4 Global events in real time.", introLive: "ALERT PANEL", alertVolumeLabel: "ALERT VOLUME", alertTriggerLabel: "ALERT TRIGGER",
                navGroups: { domination: "DOMINATION", msP11P12: "𝐏𝟏𝟏 & 𝐏𝟏𝟐", msSp: "MS & SP", worldBoss: "WORLD BOSS", otherContent: "OTHER CONTENT" }, mirageLayer1: "LAYER 1", mirageLayer3: "LAYER 3", conditionStatus: "CONDITION-BASED", monsterKillCondition: "Appears after defeating 7,000–8,000 monsters.", noFixedTime: "NO FIXED SCHEDULE", reappearsEvery: "REAPPEARS EVERY:", frequency: "FREQUENCY:", perDay: "PER DAY", bossAppearsIn: "SPAWNS IN:",
                tabs: { ALL: "ALL", FRENESI: "FRENZY", FURIA: "FURY", LIDERES: "LEADER III", CIMA: "SECRET PEAK", WB_VALLES: "VALLEYS", WB_LABERINTOS: "LABYRINTHS", PURGATORIO: "PURGATORY", ORATORIO: "CRYPTIC SANCTUARY", TORRE: "TOWER", W1: "W1", W2: "W2", W3: "W3", P3_W1: "W1", P3_W2: "W2", P3_W3: "W3", P3_W4: "W4", P3_W5: "W5", P3_W6: "W6", P3_W7: "W7", P3_W8: "W8" },
                statusActive: "Active", activeNow: "Event in progress", statusWaiting: "Waiting", nextOpening: "Next spawn:", mirageSchedule: "SPAWN CYCLE", nextSpawn: "Next spawn", timeRemaining: "Time remaining", durationActive: "Active duration:", opensIn: "STARTS IN:", closesIn: "ENDS IN:",
                toastTitle: "EVENT STARTED!", toastSub: "TIMERS | Mir4VE alert", nextQueueTitle: "Upcoming waiting cycles:", durationMin: "min", durationHour: "1 hour", timePrefix: "in ", unitHour: "h", unitMinute: "m", unitSecond: "s",
                eventTitles: { frenesi: "MS ◂ FRENZY ▸", furia: "MS ◂ FURY ▸", lideres: "MS ◂ LEADER 3 ▸", oratorio: "◂ Cryptic Sanctuary ▸", cima_inferior: "SP ◂ SOUTH BOSS ▸", cima_superior: "SP ◂ NORTH BOSS ▸", purgatorio: "◂ Purgatory ▸", wb_valles: "World Boss ◂ VALLEYS ▸", wb_laberintos: "World Boss ◂ LABYRINTHS ▸", domination_tower: "◂ DRAGON TOWER ▸", mirage_jihwa: "L1·W1 ◂ JIHWA ▸", mirage_yaksha: "L1·W1 ◂ YAKSHA ▸", mirage_black_carapace: "L1·W1 ◂ BLACK CARAPACE ▸", mirage_bulhu: "L1·W1 ◂ BULHU ▸", mirage_w2_guemugwang: "L1·W2 ◂ GUEMUGWANG ▸", mirage_w2_maengryong: "L1·W2 ◂ MAEONGRYONG ▸", mirage_w2_molgrash: "L1·W2 ◂ MOLGRASH ▸", mirage_w2_kwangryeong: "L1·W2 ◂ GWANGRYEONG ▸", mirage_w3_bargan: "L1·W3 ◂ BARGAN ▸", mirage_w3_barkas: "L1·W3 ◂ BARKAS ▸", mirage_w3_bordo: "L1·W3 ◂ BORDO ▸", mirage_w3_kelis: "L1·W3 ◂ KELIS ▸", mirage_w3_krog: "L1·W3 ◂ KROG ▸", mirage_w3_morg: "L1·W3 ◂ MORG ▸", mirage_w3_talasa: "L1·W3 ◂ TALASA ▸" },
                bellTitle: "Alerts for this event", stop: "STOP", switchTo12: "Switch to 12-hour time", switchTo24: "Switch to 24-hour time", triggerAvailable: "Trigger available", triggerAvailableIn: "Available in "
            }
        };


        // Plano 3 title prefixes vary by language: P3 (Spanish), C3 (Portuguese), L3 (English).
        const P3_EVENT_TITLES = {
            es: {
                mirage_p3_mata: "P3·W1 ◂ MATA ▸",
                mirage_p3_boltox: "P3·W1 ◂ BOLTOX ▸",
                mirage_p3_bullface_f_king: "P3·W1 ◂ BULLFACE F. KING ▸",
                mirage_p3_ma_wonwi: "P3·W2 ◂ MA WONWI ▸",
                mirage_p3_juhui: "P3·W2 ◂ JUHUI ▸",
                mirage_p3_tombbeast_gyo: "P3·W3 ◂ TOMBBEAST GYO ▸",
                mirage_p3_dusk_a_emperor: "P3·W3 ◂ DUSK A. EMPEROR ▸",
                mirage_p3_mara: "P3·W3 ◂ MARA ▸",
                mirage_p3_boodo: "P3·W3 ◂ BOODO ▸",
                mirage_p3_kurilacai: "P3·W4 ◂ KURILACAI ▸",
                mirage_p3_nefariox: "P3·W4 ◂ NEFARIOX ▸",
                mirage_p3_faluk: "P3·W5 ◂ FALUK ▸",
                mirage_p3_illusory_dream: "P3·W5 ◂ ILLUSORY DREAM ▸",
                mirage_p3_tale_warper_f: "P3·W5 ◂ TALE WARPER F. ▸",
                mirage_p3_biceon_sura: "P3·W6 ◂ BICEON SURA ▸",
                mirage_p3_cheol_mokgang: "P3·W6 ◂ CHEOL MOKGANG ▸",
                mirage_p3_wuihan: "P3·W6 ◂ WUIHAN ▸",
                mirage_p3_obscene_yeticlops: "P3·W6 ◂ OBSCENE YETICLOPS ▸",
                mirage_p3_transformed_h_yeom: "P3·W6 ◂ TRANSFORMED H. YEOM ▸",
                mirage_p3_taehyul: "P3·W7 ◂ TAEHYUL ▸",
                mirage_p3_yiun: "P3·W7 ◂ YIUN ▸",
                mirage_p3_yeo_whitemaur: "P3·W8 ◂ YEO WHITEMAUR ▸"
            },
            pt: {
                mirage_p3_mata: "C3·W1 ◂ MATA ▸",
                mirage_p3_boltox: "C3·W1 ◂ BOLTOX ▸",
                mirage_p3_bullface_f_king: "C3·W1 ◂ BULLFACE F. KING ▸",
                mirage_p3_ma_wonwi: "C3·W2 ◂ MA WONWI ▸",
                mirage_p3_juhui: "C3·W2 ◂ JUHUI ▸",
                mirage_p3_tombbeast_gyo: "C3·W3 ◂ TOMBBEAST GYO ▸",
                mirage_p3_dusk_a_emperor: "C3·W3 ◂ DUSK A. EMPEROR ▸",
                mirage_p3_mara: "C3·W3 ◂ MARA ▸",
                mirage_p3_boodo: "C3·W3 ◂ BOODO ▸",
                mirage_p3_kurilacai: "C3·W4 ◂ KURILACAI ▸",
                mirage_p3_nefariox: "C3·W4 ◂ NEFARIOX ▸",
                mirage_p3_faluk: "C3·W5 ◂ FALUK ▸",
                mirage_p3_illusory_dream: "C3·W5 ◂ ILLUSORY DREAM ▸",
                mirage_p3_tale_warper_f: "C3·W5 ◂ TALE WARPER F. ▸",
                mirage_p3_biceon_sura: "C3·W6 ◂ BICEON SURA ▸",
                mirage_p3_cheol_mokgang: "C3·W6 ◂ CHEOL MOKGANG ▸",
                mirage_p3_wuihan: "C3·W6 ◂ WUIHAN ▸",
                mirage_p3_obscene_yeticlops: "C3·W6 ◂ OBSCENE YETICLOPS ▸",
                mirage_p3_transformed_h_yeom: "C3·W6 ◂ TRANSFORMED H. YEOM ▸",
                mirage_p3_taehyul: "C3·W7 ◂ TAEHYUL ▸",
                mirage_p3_yiun: "C3·W7 ◂ YIUN ▸",
                mirage_p3_yeo_whitemaur: "C3·W8 ◂ YEO WHITEMAUR ▸"
            },
            en: {
                mirage_p3_mata: "L3·W1 ◂ MATA ▸",
                mirage_p3_boltox: "L3·W1 ◂ BOLTOX ▸",
                mirage_p3_bullface_f_king: "L3·W1 ◂ BULLFACE F. KING ▸",
                mirage_p3_ma_wonwi: "L3·W2 ◂ MA WONWI ▸",
                mirage_p3_juhui: "L3·W2 ◂ JUHUI ▸",
                mirage_p3_tombbeast_gyo: "L3·W3 ◂ TOMBBEAST GYO ▸",
                mirage_p3_dusk_a_emperor: "L3·W3 ◂ DUSK A. EMPEROR ▸",
                mirage_p3_mara: "L3·W3 ◂ MARA ▸",
                mirage_p3_boodo: "L3·W3 ◂ BOODO ▸",
                mirage_p3_kurilacai: "L3·W4 ◂ KURILACAI ▸",
                mirage_p3_nefariox: "L3·W4 ◂ NEFARIOX ▸",
                mirage_p3_faluk: "L3·W5 ◂ FALUK ▸",
                mirage_p3_illusory_dream: "L3·W5 ◂ ILLUSORY DREAM ▸",
                mirage_p3_tale_warper_f: "L3·W5 ◂ TALE WARPER F. ▸",
                mirage_p3_biceon_sura: "L3·W6 ◂ BICEON SURA ▸",
                mirage_p3_cheol_mokgang: "L3·W6 ◂ CHEOL MOKGANG ▸",
                mirage_p3_wuihan: "L3·W6 ◂ WUIHAN ▸",
                mirage_p3_obscene_yeticlops: "L3·W6 ◂ OBSCENE YETICLOPS ▸",
                mirage_p3_transformed_h_yeom: "L3·W6 ◂ TRANSFORMED H. YEOM ▸",
                mirage_p3_taehyul: "L3·W7 ◂ TAEHYUL ▸",
                mirage_p3_yiun: "L3·W7 ◂ YIUN ▸",
                mirage_p3_yeo_whitemaur: "L3·W8 ◂ YEO WHITEMAUR ▸"
            }
        };

        // Load saved preferences once per setting; fall back safely when storage is unavailable.
        const savedLang = appStorage.getItem(STORAGE_LANG);
        const savedTab = appStorage.getItem(STORAGE_ACTIVE_TAB);
        // First visit only: Spanish browsers use general Spanish, Portuguese browsers use Portuguese,
        // and all other locales default to English. A saved manual choice always wins.
        function detectInitialLanguage() {
            const locales = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'])
                .map(value => String(value).toLowerCase());
            if (locales.some(value => value === 'es' || value.startsWith('es-'))) return 'es';
            if (locales.some(value => value === 'pt' || value.startsWith('pt-'))) return 'pt';
            return 'en';
        }
        let currentLang = ['es', 'pt', 'en'].includes(savedLang) ? savedLang : detectInitialLanguage();
        const VALID_TABS = ['ALL', 'FRENESI', 'FURIA', 'LIDERES', 'CIMA', 'WB_VALLES', 'WB_LABERINTOS', 'PURGATORIO', 'ORATORIO', 'TORRE', 'W1', 'W2', 'W3', 'P3_W1', 'P3_W2', 'P3_W3', 'P3_W4', 'P3_W5', 'P3_W6', 'P3_W7', 'P3_W8'];
        let currentTab = VALID_TABS.includes(savedTab) ? savedTab : 'ALL';
        // Keep the ALL dashboard lightweight by drawing at most fifteen cards at a time.
        // All event states and alerts are still computed for every definition on every tick.
        const ALL_EVENTS_PAGE_SIZE = 15;
        let allEventsPage = 0;
        const SERVER_CONFIG = {
            NA: { offset: -4, label: 'NA', utc: 'UTC-4' },
            ASIA: { offset: 8, label: 'ASIA', utc: 'UTC+8' },
            INMENA: { offset: 6, label: 'INMENA', utc: 'UTC+6' },
            EU: { offset: 2, label: 'EU', utc: 'UTC+2' },
            SA: { offset: -3, label: 'SA', utc: 'UTC-3' }
        };
        let savedServer = null;
        try { savedServer = sessionStorage.getItem(STORAGE_SERVER); } catch (error) {}
        if (!Object.prototype.hasOwnProperty.call(SERVER_CONFIG, savedServer)) savedServer = appStorage.getItem(STORAGE_SERVER);
        let currentServer = Object.prototype.hasOwnProperty.call(SERVER_CONFIG, savedServer) ? savedServer : 'NA';
        // Timestamp of entry into the currently selected Global. An alert window that
        // began before this timestamp is considered missed; it must never catch up later.
        let currentServerEnteredAt = Date.now();
        let suppressTransitionSounds = false;
        function serverPreferenceKey(baseKey, server = currentServer) { return `${baseKey}_${server}`; }
        function getServerPreference(baseKey, legacyFallback = null) {
            const serverValue = appStorage.getItem(serverPreferenceKey(baseKey));
            return serverValue !== null ? serverValue : (legacyFallback === null ? appStorage.getItem(baseKey) : legacyFallback);
        }
        let globalAudioEnabled = getServerPreference(STORAGE_MASTER_ALERT) === 'true';

        // Format each event's configured duration independently (minutes are defined per event).
        function formatActiveDuration(durationMin) {
            const lang = currentLang || 'es';
            const hours = Math.floor(durationMin / 60);
            const minutes = durationMin % 60;
            const hourWord = lang === 'en' ? (hours === 1 ? 'hour' : 'hours')
                : (hours === 1 ? 'hora' : 'horas');
            const minuteWord = lang === 'en' ? 'min' : (lang === 'pt' ? 'min' : 'min');
            if (hours && minutes) return `${hours} ${hourWord} ${minutes} ${minuteWord}`;
            if (hours) return `${hours} ${hourWord}`;
            return `${durationMin} ${minuteWord}`;
        }

        // MASTER SCHEDULE DEFINITIONS (NA SERVER UTC-4)
        const EVENT_DEFINITIONS = [
            {
                id: "frenesi",
                cat: "FRENESI",
                title: "MS ◂ FRENESÍ ▸",
                icon: "fa-gauge-high", badgeIcon: "fa-gauge-high",
                color: "orange",
                durationMin: 60,
                schedule: [[2,0], [5,0], [8,0], [11,0], [14,0], [17,0], [20,0], [23,0]]
            },
            {
                id: "furia",
                cat: "FURIA",
                title: "MS ◂ FURIA ▸",
                icon: "fa-fire", badgeIcon: "fa-fire",
                color: "red",
                durationMin: 60,
                schedule: [[0,30], [3,30], [6,30], [9,30], [12,30], [15,30], [18,30], [21,30]]
            },
            {
                id: "lideres",
                cat: "LIDERES",
                title: "MS ◂ LIDER 3 ▸",
                icon: "fa-crown", badgeIcon: "fa-crown",
                color: "yellow",
                durationMin: 5,
                schedule: [[0,0], [3,0], [6,0], [9,0], [12,0], [15,0], [18,0], [21,0]]
            },
            {
                id: "oratorio",
                cat: "ORATORIO",
                title: "Oratorio Críptico",
                icon: "fa-scroll", badgeIcon: "fa-scroll",
                color: "indigo",
                durationMin: 5,
                schedule: [[0,0], [3,0], [6,0], [9,0], [12,0], [15,0], [18,0], [21,0]]
            },
            {
                id: "cima_inferior",
                cat: "CIMA",
                title: "SP ◂ JEFE SUR ▸",
                icon: "fa-mountain", badgeIcon: "fa-mountain",
                color: "red",
                durationMin: 5,
                schedule: [[1,0], [7,0], [13,0], [19,0]]
            },
            {
                id: "cima_superior",
                cat: "CIMA",
                title: "SP ◂ JEFE NORTE ▸",
                icon: "fa-mountain-sun", badgeIcon: "fa-mountain-sun",
                color: "purple",
                durationMin: 5,
                schedule: [[4,0], [10,0], [16,0], [22,0]]
            },
            {
                id: "purgatorio",
                cat: "PURGATORIO",
                title: "Purgatorio",
                icon: "fa-dungeon", badgeIcon: "fa-dungeon",
                color: "violet",
                durationMin: 5,
                schedule: [[0,0], [6,0], [12,0], [18,0]]
            },
            {
                id: "wb_valles",
                cat: "WB_VALLES",
                title: "WB (VALLES)",
                icon: "fa-landmark", badgeIcon: "fa-landmark",
                color: "green",
                durationMin: 15,
                schedule: [[12,0], [22,0]]
            },
            {
                id: "wb_laberintos",
                cat: "WB_LABERINTOS",
                title: "WB (LABERINTOS)",
                icon: "fa-route", badgeIcon: "fa-route",
                color: "cyan",
                durationMin: 15,
                schedule: [[10,0], [20,0]]
            },
            {
                id: "domination_tower",
                cat: "TORRE",
                title: "Torre del Dragón",
                icon: "fa-tower-observation", badgeIcon: "fa-tower-observation",
                color: "purple",
                durationMin: 240,
                schedule: [[9,0], [15,0], [21,0]]
            },
            // MIRAGE SHIP / PLANO 1 / W1. Respawns diarios cada 3 o 6 horas.
            { id: "mirage_jihwa", cat: "W1", title: "P1·W1 ◂ JIHWA ▸", icon: "fa-eye", badgeIcon: "fa-eye", color: "cyan", durationMin: 5, schedule: [[2,30],[5,30],[8,30],[11,30],[14,30],[17,30],[20,30],[23,30]] },
            { id: "mirage_yaksha", cat: "W1", title: "P1·W1 ◂ YAKSHA ▸", icon: "fa-wand-magic-sparkles", badgeIcon: "fa-wand-magic-sparkles", color: "purple", durationMin: 5, schedule: [[3,30],[9,30],[15,30],[21,30]] },
            { id: "mirage_black_carapace", cat: "W1", title: "P1·W1 ◂ BLACK CARAPACE ▸", icon: "fa-bug", badgeIcon: "fa-bug", color: "green", durationMin: 5, schedule: [[0,30],[3,30],[6,30],[9,30],[12,30],[15,30],[18,30],[21,30]] },
            { id: "mirage_bulhu", cat: "W1", title: "P1·W1 ◂ BULHU ▸", icon: "fa-meteor", badgeIcon: "fa-meteor", color: "orange", durationMin: 5, schedule: [[4,30],[10,30],[16,30],[22,30]] },
            // MIRAGE SHIP / PLANO 1 / W2. Horarios suministrados para la primera implementación funcional.
            // La duración activa se establece provisionalmente en 5 minutos, igual que W1, hasta confirmar la duración propia de W2.
            { id: "mirage_w2_guemugwang", cat: "W2", title: "P1·W2 ◂ GUEMUGWANG ▸", icon: "fa-dragon", badgeIcon: "fa-dragon", color: "cyan", durationMin: 5, schedule: [[5,30],[11,30],[17,30],[23,30]] },
            { id: "mirage_w2_maengryong", cat: "W2", title: "P1·W2 ◂ MAEONGRYONG ▸", icon: "fa-fan", badgeIcon: "fa-fan", color: "purple", durationMin: 5, schedule: [[0,30],[6,30],[12,30],[18,30]] },
            { id: "mirage_w2_molgrash", cat: "W2", title: "P1·W2 ◂ MOLGRASH ▸", icon: "fa-mask", badgeIcon: "fa-mask", color: "green", durationMin: 5, schedule: [[1,30],[4,30],[7,30],[10,30],[13,30],[16,30],[19,30],[22,30]] },
            { id: "mirage_w2_kwangryeong", cat: "W2", title: "P1·W2 ◂ GWANGRYEONG ▸", icon: "fa-gem", badgeIcon: "fa-gem", color: "orange", durationMin: 5, schedule: [[2,30],[5,30],[8,30],[11,30],[14,30],[17,30],[20,30],[23,30]] },
            // MIRAGE SHIP / PLANO 1 / W3. Horarios proporcionados para el nuevo ciclo de contadores.
            // La duración activa se deja provisionalmente en 5 minutos, siguiendo W1/W2, hasta confirmar la duración propia de W3.
            { id: "mirage_w3_bargan", cat: "W3", title: "P1·W3 ◂ BARGAN ▸", icon: "fa-fire-flame-curved", badgeIcon: "fa-fire-flame-curved", color: "cyan", durationMin: 5, schedule: [[4,30],[10,30],[16,30],[22,30]] },
            { id: "mirage_w3_barkas", cat: "W3", title: "P1·W3 ◂ BARKAS ▸", icon: "fa-shield-halved", badgeIcon: "fa-shield-halved", color: "purple", durationMin: 5, schedule: [[3,30],[9,30],[15,30],[21,30]] },
            { id: "mirage_w3_bordo", cat: "W3", title: "P1·W3 ◂ BORDO ▸", icon: "fa-chess-king", badgeIcon: "fa-chess-king", color: "green", durationMin: 5, schedule: [[5,30],[11,30],[17,30],[23,30]] },
            { id: "mirage_w3_kelis", cat: "W3", title: "P1·W3 ◂ KELIS ▸", icon: "fa-eye-low-vision", badgeIcon: "fa-eye-low-vision", color: "orange", durationMin: 5, schedule: [[2,30],[8,30],[14,30],[20,30]] },
            { id: "mirage_w3_krog", cat: "W3", title: "P1·W3 ◂ KROG ▸", icon: "fa-hat-wizard", badgeIcon: "fa-hat-wizard", color: "blue", durationMin: 5, schedule: [[1,30],[7,30],[13,30],[19,30]] },
            { id: "mirage_w3_morg", cat: "W3", title: "P1·W3 ◂ MORG ▸", icon: "fa-skull", badgeIcon: "fa-skull", color: "violet", durationMin: 5, schedule: [[0,30],[3,30],[6,30],[9,30],[12,30],[15,30],[18,30],[21,30]] },
            { id: "mirage_w3_talasa", cat: "W3", title: "P1·W3 ◂ TALASA ▸", icon: "fa-fish", badgeIcon: "fa-fish", color: "teal", durationMin: 5, schedule: [[2,30],[5,30],[8,30],[11,30],[14,30],[17,30],[20,30],[23,30]] },
            // MIRAGE SHIP / PLANO 3. Durations default to 5 minutes until their actual duration is confirmed.
            { id: "mirage_p3_mata", cat: "P3_W1", title: "P3·W1 ◂ MATA ▸", icon: "fa-seedling", badgeIcon: "fa-seedling", color: "green", durationMin: 5, schedule: [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0]] },
            { id: "mirage_p3_boltox", cat: "P3_W1", title: "P3·W1 ◂ BOLTOX ▸", icon: "fa-bolt", badgeIcon: "fa-bolt", color: "yellow", durationMin: 5, schedule: [[1,0],[3,0],[5,0],[7,0],[9,0],[11,0],[13,0],[15,0],[17,0],[19,0],[21,0],[23,0]] },
            { id: "mirage_p3_bullface_f_king", cat: "P3_W1", title: "P3·W1 ◂ BULLFACE F. KING ▸", icon: "fa-skull-crossbones", badgeIcon: "fa-skull-crossbones", color: "red", durationMin: 5, schedule: [[0,0],[3,0],[6,0],[12,0],[15,0],[18,0],[21,0]] },
            { id: "mirage_p3_ma_wonwi", cat: "P3_W2", title: "P3·W2 ◂ MA WONWI ▸", icon: "fa-hand-sparkles", badgeIcon: "fa-hand-sparkles", color: "purple", durationMin: 5, triggerType: "kill-count", schedule: [] },
            { id: "mirage_p3_juhui", cat: "P3_W2", title: "P3·W2 ◂ JUHUI ▸", icon: "fa-fingerprint", badgeIcon: "fa-fingerprint", color: "cyan", durationMin: 5, schedule: [[2,30],[5,30],[8,30],[11,30],[14,30],[17,30],[20,30],[23,30]] },
            { id: "mirage_p3_tombbeast_gyo", cat: "P3_W3", title: "P3·W3 ◂ TOMBBEAST GYO ▸", icon: "fa-bone", badgeIcon: "fa-bone", color: "violet", durationMin: 5, schedule: [[2,30],[8,30],[14,30],[20,30]] },
            { id: "mirage_p3_dusk_a_emperor", cat: "P3_W3", title: "P3·W3 ◂ DUSK A. EMPEROR ▸", icon: "fa-star-and-crescent", badgeIcon: "fa-star-and-crescent", color: "indigo", durationMin: 5, schedule: [[1,30],[3,30],[5,30],[7,30],[9,30],[11,30],[13,30],[15,30],[17,30],[19,30],[21,30],[23,30]] },
            { id: "mirage_p3_mara", cat: "P3_W3", title: "P3·W3 ◂ MARA ▸", icon: "fa-ghost", badgeIcon: "fa-ghost", color: "pink", durationMin: 5, schedule: [[2,30],[5,30],[8,30],[11,30],[14,30],[17,30],[20,30],[23,30]] },
            { id: "mirage_p3_boodo", cat: "P3_W3", title: "P3·W3 ◂ BOODO ▸", icon: "fa-hand-fist", badgeIcon: "fa-hand-fist", color: "orange", durationMin: 5, schedule: [[3,30],[9,30],[15,30],[21,30]] },
            { id: "mirage_p3_kurilacai", cat: "P3_W4", title: "P3·W4 ◂ KURILACAI ▸", icon: "fa-compass", badgeIcon: "fa-compass", color: "teal", durationMin: 5, schedule: [[0,0],[3,0],[6,0],[9,0],[12,0],[15,0],[18,0],[21,0]] },
            { id: "mirage_p3_nefariox", cat: "P3_W4", title: "P3·W4 ◂ NEFARIOX ▸", icon: "fa-spider", badgeIcon: "fa-spider", color: "lime", durationMin: 5, schedule: [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0]] },
            { id: "mirage_p3_faluk", cat: "P3_W5", title: "P3·W5 ◂ FALUK ▸", icon: "fa-feather-pointed", badgeIcon: "fa-feather-pointed", color: "crimson", durationMin: 5, schedule: [[0,30],[3,30],[6,30],[9,30],[12,30],[15,30],[18,30],[21,30]] },
            { id: "mirage_p3_illusory_dream", cat: "P3_W5", title: "P3·W5 ◂ ILLUSORY DREAM ▸", icon: "fa-cloud-moon", badgeIcon: "fa-cloud-moon", color: "dream", durationMin: 5, triggerType: "kill-count", schedule: [] },
            { id: "mirage_p3_tale_warper_f", cat: "P3_W5", title: "P3·W5 ◂ TALE WARPER F. ▸", icon: "fa-hourglass-half", badgeIcon: "fa-hourglass-half", color: "blue", durationMin: 5, schedule: [[1,30],[4,30],[7,30],[10,30],[13,30],[16,30],[19,30],[22,30]] },
            { id: "mirage_p3_biceon_sura", cat: "P3_W6", title: "P3·W6 ◂ BICEON SURA ▸", icon: "fa-khanda", badgeIcon: "fa-khanda", color: "rose", durationMin: 5, schedule: [[4,30],[10,30],[16,30],[22,30]] },
            { id: "mirage_p3_cheol_mokgang", cat: "P3_W6", title: "P3·W6 ◂ CHEOL MOKGANG ▸", icon: "fa-chess-rook", badgeIcon: "fa-chess-rook", color: "steel", durationMin: 5, schedule: [[0,30],[2,30],[4,30],[6,30],[8,30],[10,30],[12,30],[14,30],[16,30],[18,30],[20,30],[22,30]] },
            { id: "mirage_p3_wuihan", cat: "P3_W6", title: "P3·W6 ◂ WUIHAN ▸", icon: "fa-wind", badgeIcon: "fa-wind", color: "amber", durationMin: 5, schedule: [[5,30],[11,30],[17,30],[23,30]] },
            { id: "mirage_p3_obscene_yeticlops", cat: "P3_W6", title: "P3·W6 ◂ OBSCENE YETICLOPS ▸", icon: "fa-snowflake", badgeIcon: "fa-snowflake", color: "ice", durationMin: 5, schedule: [[0,30],[6,30],[12,30],[18,30]] },
            { id: "mirage_p3_transformed_h_yeom", cat: "P3_W6", title: "P3·W6 ◂ TRANSFORMED H. YEOM ▸", icon: "fa-arrows-rotate", badgeIcon: "fa-arrows-rotate", color: "forest", durationMin: 5, schedule: [[1,30],[3,30],[5,30],[7,30],[9,30],[11,30],[13,30],[15,30],[17,30],[19,30],[21,30],[23,30]] },
            { id: "mirage_p3_taehyul", cat: "P3_W7", title: "P3·W7 ◂ TAEHYUL ▸", icon: "fa-bolt-lightning", badgeIcon: "fa-bolt-lightning", color: "electric", durationMin: 5, schedule: [[1,0],[3,0],[5,0],[7,0],[9,0],[11,0],[13,0],[15,0],[17,0],[19,0],[21,0],[23,0]] },
            { id: "mirage_p3_yiun", cat: "P3_W7", title: "P3·W7 ◂ YIUN ▸", icon: "fa-sun", badgeIcon: "fa-sun", color: "sky", durationMin: 5, schedule: [[2,0],[5,0],[8,0],[11,0],[14,0],[17,0],[20,0],[23,30]] },
            { id: "mirage_p3_yeo_whitemaur", cat: "P3_W8", title: "P3·W8 ◂ YEO WHITEMAUR ▸", icon: "fa-water", badgeIcon: "fa-water", color: "pearl", durationMin: 5, schedule: [[1,0],[5,0],[9,0],[13,0],[17,0],[21,0]] }
        ];

        // Emotion/theme-based gradients for the title icons only. Text remains white.
        const BOSS_ICON_GRADIENTS = Object.freeze({
            "frenesi": ["#FFD08A", "#F97316"],
            "furia": ["#FDA4AF", "#DC2626"],
            "lideres": ["#FDE68A", "#B7791F"],
            "oratorio": ["#C4B5FD", "#4F46E5"],
            "cima_inferior": ["#FDBA74", "#C2410C"],
            "cima_superior": ["#C4B5FD", "#6366F1"],
            "purgatorio": ["#D8B4FE", "#7E22CE"],
            "wb_valles": ["#BEF264", "#15803D"],
            "wb_laberintos": ["#99F6E4", "#0E7490"],
            "domination_tower": ["#FDE68A", "#92400E"],
            "mirage_jihwa": ["#F9A8D4", "#BE185D"],
            "mirage_yaksha": ["#DDD6FE", "#7C3AED"],
            "mirage_black_carapace": ["#D9F99D", "#4D7C0F"],
            "mirage_bulhu": ["#FED7AA", "#EA580C"],
            "mirage_w2_guemugwang": ["#99F6E4", "#0F766E"],
            "mirage_w2_maengryong": ["#BFDBFE", "#4338CA"],
            "mirage_w2_molgrash": ["#D9F99D", "#3F6212"],
            "mirage_w2_kwangryeong": ["#FDE68A", "#C2410C"],
            "mirage_w3_bargan": ["#FDBA74", "#B91C1C"],
            "mirage_w3_barkas": ["#E2E8F0", "#64748B"],
            "mirage_w3_bordo": ["#FEF08A", "#A16207"],
            "mirage_w3_kelis": ["#C4B5FD", "#6D28D9"],
            "mirage_w3_krog": ["#E9D5FF", "#9333EA"],
            "mirage_w3_morg": ["#D1D5DB", "#6D28D9"],
            "mirage_w3_talasa": ["#99F6E4", "#0369A1"],
            "mirage_p3_mata": ["#BBF7D0", "#15803D"],
            "mirage_p3_boltox": ["#FEF08A", "#CA8A04"],
            "mirage_p3_bullface_f_king": ["#FDA4AF", "#9F1239"],
            "mirage_p3_ma_wonwi": ["#DDD6FE", "#7E22CE"],
            "mirage_p3_juhui": ["#A5F3FC", "#0E7490"],
            "mirage_p3_tombbeast_gyo": ["#E7E5E4", "#78716C"],
            "mirage_p3_dusk_a_emperor": ["#C7D2FE", "#4338CA"],
            "mirage_p3_mara": ["#F5D0FE", "#A21CAF"],
            "mirage_p3_boodo": ["#FDBA74", "#C2410C"],
            "mirage_p3_kurilacai": ["#A5F3FC", "#0F766E"],
            "mirage_p3_nefariox": ["#BEF264", "#166534"],
            "mirage_p3_faluk": ["#FED7AA", "#9A3412"],
            "mirage_p3_illusory_dream": ["#DDD6FE", "#6366F1"],
            "mirage_p3_tale_warper_f": ["#BFDBFE", "#1D4ED8"],
            "mirage_p3_biceon_sura": ["#FDA4AF", "#BE123C"],
            "mirage_p3_cheol_mokgang": ["#E2E8F0", "#475569"],
            "mirage_p3_wuihan": ["#BAE6FD", "#0284C7"],
            "mirage_p3_obscene_yeticlops": ["#E0F2FE", "#64748B"],
            "mirage_p3_transformed_h_yeom": ["#C4B5FD", "#C2410C"],
            "mirage_p3_taehyul": ["#FEF08A", "#2563EB"],
            "mirage_p3_yiun": ["#FDE68A", "#EA580C"],
            "mirage_p3_yeo_whitemaur": ["#A5F3FC", "#1D4ED8"],
        });
        function getBossIconGradientStyle(eventId) {
            const [start, end] = BOSS_ICON_GRADIENTS[eventId] || ["#E2E8F0", "#64748B"];
            return `--boss-icon-gradient-start:${start};--boss-icon-gradient-end:${end};`;
        }

        // Restore individual bell states from LocalStorage
        let cardBellStates = {};
        try {
            const savedBells = JSON.parse(getServerPreference(STORAGE_BELLS));
            if (savedBells && typeof savedBells === 'object') {
                cardBellStates = savedBells;
            }
        } catch(e) {}

        // Each scheduled occurrence (event + exact time) owns its own audio-alert state.
        // Legacy event-level values remain as defaults for occurrence cards not yet customized.
        EVENT_DEFINITIONS.forEach(e => {
            if (cardBellStates[e.id] === undefined) {
                cardBellStates[e.id] = globalAudioEnabled;
            }
        });

        function getOccurrenceBellKey(eventId, startH, startM) {
            return `${eventId}__${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}`;
        }

        function isOccurrenceBellOn(eventId, startH, startM) {
            const key = getOccurrenceBellKey(eventId, startH, startM);
            return cardBellStates[key] === undefined ? Boolean(cardBellStates[eventId]) : Boolean(cardBellStates[key]);
        }

        // The master button reflects the effective state of all scheduled occurrences,
        // including individually overridden bells, rather than a potentially stale flag.
        function hasAnyEnabledBell() {
            return EVENT_DEFINITIONS.some(eventDef =>
                eventDef.schedule.some(([startH, startM]) => isOccurrenceBellOn(eventDef.id, startH, startM))
            );
        }

        function persistBellPreferences() {
            globalAudioEnabled = hasAnyEnabledBell();
            appStorage.setItem(serverPreferenceKey(STORAGE_MASTER_ALERT), String(globalAudioEnabled));
            appStorage.setItem(serverPreferenceKey(STORAGE_BELLS), JSON.stringify(cardBellStates));
        }

        function getOccurrenceDateKey(serverNow, startH, startM) {
            const targetMinutes = startH * 60 + startM;
            const currentMinutes = serverNow.getUTCHours() * 60 + serverNow.getUTCMinutes();
            const occurrenceDate = new Date(serverNow.getTime());
            if (targetMinutes <= currentMinutes) occurrenceDate.setUTCDate(occurrenceDate.getUTCDate() + 1);
            return `${occurrenceDate.getUTCFullYear()}-${String(occurrenceDate.getUTCMonth() + 1).padStart(2, '0')}-${String(occurrenceDate.getUTCDate()).padStart(2, '0')}`;
        }

        // Track fired alerts to avoid repeated ringing in same minute
        const triggeredAlerts = {};
        // Event cards glow for the duration of the scheduled warning sound.
        const alertGlowUntil = Object.create(null);
        const previousActiveState = {};
        // Agrupa avisos de transición cercanos para evitar sonidos simultáneos.
        const completionWarningsFired = new Set();
        let lastStartSoundAt = 0;
        let lastCompletionSoundAt = 0;

        // --- Web Audio engine: original interface cues + single configurable event-alarm tone ---
        let audioCtx = null;
        let masterGain = null; // Interface sounds remain at their original level.
        let alertGain = null;  // Only the main event alarm uses this per-server volume.
        const AUDIO_PREFS_KEY = 'mir4_audio_preferences_v2';
        const DEFAULT_AUDIO_PREFS = { volume: 60, triggerMinutes: 1, triggerCooldownUntil: 0 };
        const EVENT_ALARM_PRESET = {
            id: "eventAlarm",
            name: "Alarma / aviso de evento",
            desc: "Aviso principal de tres notas que el sitio repite durante la alerta.",
            notes: [659.25, 523.25, 392],
            wave: "sine",
            volume: 100,
            duration: 0.3,
            spacing: 0.13,
            attack: 0.025,
            release: 0.3,
            filter: 7500,
            echo: 0.04,
            pitch: 2,
            repeat: 1,
            pattern: "original",
            variant: 0
        };
        let audioPrefs = { ...DEFAULT_AUDIO_PREFS };
        const armedAlertTargets = Object.create(null);
        let previewStopTimer = null;
        let previewUnlockTimer = null;
        let previewAlarmInterval = null;
        let previewInProgress = false;
        let previewStopping = false;
        let previewSoundNodes = [];
        let previewInertElements = [];
        let previewPreviousFocus = null;
        let triggerChangeLocked = false;
        let triggerUnlockTimer = null;
        let triggerFeedbackTimer = null;
        let armNoticeTimer = null;
        let alertSettingsUnlockAt = 0;
        let alertSettingsUnlockTimer = null;
        // Arbitration global: si varias tarjetas generan una señal prácticamente a la vez,
        // solo la primera obtiene permiso para sonar. No altera los sonidos de interfaz.
        let lastCoordinatedEventCueAt = -Infinity;
        function claimCoordinatedEventCue() {
            const now = performance.now();
            if (now - lastCoordinatedEventCueAt < 350) return false;
            lastCoordinatedEventCueAt = now;
            return true;
        }

        function initAudioContext() {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    audioCtx = new AudioContext();
                    masterGain = audioCtx.createGain();
                    masterGain.gain.value = 1;
                    masterGain.connect(audioCtx.destination);
                    alertGain = audioCtx.createGain();
                    alertGain.gain.value = Math.max(0, Math.min(1, Number(audioPrefs.volume) / 100));
                    alertGain.connect(audioCtx.destination);
                }
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                // Browsers suspend Web Audio until a user gesture; resume whenever a control is used.
                const resumeResult = audioCtx.resume();
                if (resumeResult && typeof resumeResult.catch === 'function') resumeResult.catch(() => {});
            }
        }

        // Original activation/deactivation tones retained; every sound now passes through masterGain.
        function playActivationSound() {
            initAudioContext(); if (!audioCtx) return;
            try { const now=audioCtx.currentTime; [[880,0,0.11],[1320,0.025,0.055],[1760,0.045,0.025]].forEach(([freq,delay,volume])=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+delay;osc.type='sine';osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,t+0.42);osc.connect(gain);gain.connect(masterGain);osc.start(t);osc.stop(t+0.44);}); } catch(e) {}
        }
        function playDeactivationSound() {
            initAudioContext(); if (!audioCtx) return;
            try { const now=audioCtx.currentTime; [[784,0,0.075],[587.33,0.09,0.05],[440,0.17,0.028]].forEach(([freq,delay,volume])=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+delay;osc.type='sine';osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,t+0.28);osc.connect(gain);gain.connect(masterGain);osc.start(t);osc.stop(t+0.30);}); } catch(e) {}
        }

        // Alert playback is governed by the selected MIR4 Global server inside this page,
        // not by browser-tab visibility, window focus, or whether the browser is minimized.
        // updateDashboard calculates events only for currentServer, so other Global regions
        // are never evaluated or played by this page instance.
        function isAlertPlaybackAllowed() {
            return true;
        }

        // Original event-start cue retained: short, soft two-note signal independent of bell settings.
        async function playEventStartSound() {
            if (!isAlertPlaybackAllowed()) return;
            initAudioContext(); if (!audioCtx) return;
            try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch(e) { return; }
            if (!claimCoordinatedEventCue()) return;
            try { const now=audioCtx.currentTime; [[587.33,0,0.085,0.22],[783.99,0.16,0.075,0.30]].forEach(([frequency,delay,volume,duration])=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+delay;osc.type='sine';osc.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+0.018);gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);osc.connect(gain);gain.connect(masterGain || audioCtx.destination);osc.start(t);osc.stop(t+duration+0.02);}); } catch(e) {}
        }
        // Original completion cue retained: descending three-note chime.
        async function playCompletionSound() {
            if (!isAlertPlaybackAllowed()) return;
            initAudioContext(); if (!audioCtx) return;
            try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch(e) { return; }
            if (!claimCoordinatedEventCue()) return;
            try { const now=audioCtx.currentTime; [[493.88,0,0.095],[392.00,0.17,0.075],[293.66,0.34,0.055]].forEach(([frequency,delay,volume])=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+delay;osc.type='triangle';osc.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+0.022);gain.gain.exponentialRampToValueAtTime(0.0001,t+0.24);osc.connect(gain);gain.connect(masterGain || audioCtx.destination);osc.start(t);osc.stop(t+0.26);}); } catch(e) {}
        }

        // One global alarm at a time: the first eligible card wins; later simultaneous cards are suppressed.
        let activeAlarm = null;
        let alarmStartedAt = 0;
        let alarmDeadlineTimer = null;
        let alarmFadeTimer = null;
        let alertPreLock = false;
        const alertPreparationKeys = new Set();
        const ALARM_MAX_DURATION_MS = 15000;
        const ALERT_CYCLE_MS = 900;

        async function triggerChimeSound(eventId = 'general', cardEventId = null, serverId = currentServer) {
            if (!isAlertPlaybackAllowed() || serverId !== currentServer) return;
            // A card may join the visual glow while the first alarm owns the shared audio channel.
            if (activeAlarm) {
                if (cardEventId) {
                    activeAlarm.glowCardIds.add(cardEventId);
                    alertGlowUntil[cardEventId] = activeAlarm.deadlineAt;
                    if (activeAlarm.glowCardIds.size > 1) {
                        const toastSub = document.getElementById('toast-sub');
                        if (toastSub) toastSub.textContent = ({ es: 'EVENTOS EN CURSO', pt: 'EVENTOS EM ANDAMENTO', en: 'EVENTS IN PROGRESS' })[currentLang] || 'EVENTOS EN CURSO';
                    }
                }
                return;
            }
            initAudioContext();
            if (!audioCtx) return;
            try { if (audioCtx.state === 'suspended') await audioCtx.resume(); }
            catch (error) { console.warn('El navegador no permitió activar el audio todavía:', error); return; }
            if (serverId !== currentServer) return;
            if (activeAlarm) {
                if (cardEventId) {
                    activeAlarm.glowCardIds.add(cardEventId);
                    alertGlowUntil[cardEventId] = activeAlarm.deadlineAt;
                    if (activeAlarm.glowCardIds.size > 1) {
                        const toastSub = document.getElementById('toast-sub');
                        if (toastSub) toastSub.textContent = ({ es: 'EVENTOS EN CURSO', pt: 'EVENTOS EM ANDAMENTO', en: 'EVENTS IN PROGRESS' })[currentLang] || 'EVENTOS EN CURSO';
                    }
                }
                return;
            }
            cancelMainAlertPreview(true);

            const toast = document.getElementById('alarm-toast');
            if (!toast) return;
            const startAt = performance.now();
            activeAlarm = {
                eventId, cardEventId, serverId, volume: Number(audioPrefs.volume),
                startedAt: startAt, deadlineAt: Date.now() + ALARM_MAX_DURATION_MS,
                glowCardIds: new Set(cardEventId ? [cardEventId] : [])
            };
            alarmStartedAt = startAt;
            alertPreLock = false;
            alertSettingsUnlockAt = 0;
            if (cardEventId) alertGlowUntil[cardEventId] = activeAlarm.deadlineAt;
            const eventDef = EVENT_DEFINITIONS.find(def => def.id === cardEventId);
            const eventName = (I18N[currentLang]?.eventTitles?.[cardEventId]) || eventDef?.title || 'MIR4';
            const toastCopy = {
                es: ['🔔 ¡ALERTA DE EVENTO!', eventName],
                pt: ['🔔 ALERTA DE EVENTO!', eventName],
                en: ['🔔 EVENT ALERT!', eventName]
            }[currentLang] || ['🔔 ¡ALERTA DE EVENTO!', eventName];
            document.getElementById('toast-title').textContent = toastCopy[0];
            document.getElementById('toast-sub').textContent = toastCopy[1];
            toast.classList.remove('alarm-toast-leaving', 'hidden', 'alert-previewing');
            applyAlarmAnimation();
            setPreviewPageLock(true, 'alarm');
            updateAlertControlLocks();

            const playAlarmCycle = () => {
                if (!activeAlarm || activeAlarm.serverId !== currentServer) return;
                playSelectedAlertSound(activeAlarm.volume);
            };
            playAlarmCycle();
            activeAlarm.repeatTimer = setInterval(() => {
                if (!activeAlarm) return;
                if (performance.now() - alarmStartedAt >= ALARM_MAX_DURATION_MS) { stopChimeSound(false, true); return; }
                playAlarmCycle();
            }, ALERT_CYCLE_MS);
            alarmDeadlineTimer = setTimeout(() => stopChimeSound(false, true), ALARM_MAX_DURATION_MS);
        }

        function stopChimeSound(playStopCue = true, automatic = false) {
            const wasPreview = previewInProgress;
            if (wasPreview) { cancelMainAlertPreview(true, true); if (!activeAlarm) return; }
            const previous = activeAlarm;
            const toast = document.getElementById('alarm-toast');
            const wasVisible = Boolean(toast && !toast.classList.contains('hidden'));
            if (previous?.repeatTimer) clearInterval(previous.repeatTimer);
            if (alarmDeadlineTimer) clearTimeout(alarmDeadlineTimer);
            if (alarmFadeTimer) clearTimeout(alarmFadeTimer);
            alarmDeadlineTimer = null;
            alarmFadeTimer = null;
            activeAlarm = null;
            alertPreLock = false;
            if (previous) {
                alertSettingsUnlockAt = Date.now() + 3000;
                if (alertSettingsUnlockTimer) clearTimeout(alertSettingsUnlockTimer);
                alertSettingsUnlockTimer = setTimeout(() => { alertSettingsUnlockAt = 0; alertSettingsUnlockTimer = null; updateAlertControlLocks(); }, 3000);
            }
            if (toast) toast.classList.remove('alert-previewing', 'alert-animation-4');
            if (toast && wasVisible) {
                toast.classList.add('alarm-toast-leaving');
                alarmFadeTimer = setTimeout(() => {
                    if (toast.classList.contains('alarm-toast-leaving')) toast.classList.add('hidden');
                    toast.classList.remove('alarm-toast-leaving');
                    alarmFadeTimer = null;
                }, 220);
            }
            if (previous) {
                for (const eventId of previous.glowCardIds || []) delete alertGlowUntil[eventId];
                document.querySelectorAll('.event-card.alert-glow-active').forEach(card => card.classList.remove('alert-glow-active'));
            }
            setPreviewPageLock(false);
            if (wasVisible && playStopCue && isAlertPlaybackAllowed()) playManualStopSound();
            else if (wasVisible && automatic && isAlertPlaybackAllowed()) playAutoDismissSound();
            updateAlertControlLocks();
        }

        // A gentle, resolved two-note sound when the user stops the alert manually.
        function playManualStopSound() {
            initAudioContext(); if (!audioCtx) return;
            try { const now=audioCtx.currentTime; [[784,0,0.045,0.14],[1174.66,0.07,0.035,0.2]].forEach(([freq,delay,volume,duration])=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+delay;osc.type='sine';osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);osc.connect(gain);gain.connect(masterGain || audioCtx.destination);osc.start(t);osc.stop(t+duration+0.02);}); } catch(e) {}
        }
        async function playAutoDismissSound() {
            initAudioContext(); if (!audioCtx) return;
            try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch (e) { return; }
            if (audioCtx.state !== 'running') return;
            try { const now=audioCtx.currentTime; [[659.25,0,0.035,0.13],[523.25,0.11,0.028,0.16],[392,0.23,0.018,0.22]].forEach(([freq,delay,volume,duration])=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=now+delay;osc.type='sine';osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);osc.connect(gain);gain.connect(masterGain || audioCtx.destination);osc.start(t);osc.stop(t+duration+0.02);}); } catch(e) {}
        }

        function loadAudioPreferences() {
            try {
                const serverRaw = appStorage.getItem(`${AUDIO_PREFS_KEY}_${currentServer}`);
                const serverPrefs = serverRaw ? JSON.parse(serverRaw) : {};
                audioPrefs = { ...DEFAULT_AUDIO_PREFS, ...serverPrefs };
            } catch (e) { audioPrefs = { ...DEFAULT_AUDIO_PREFS }; }
            audioPrefs.volume = [60,70,80,90,100].includes(Number(audioPrefs.volume)) ? Number(audioPrefs.volume) : 60;
            if (![1,2,3,4,5].includes(Number(audioPrefs.triggerMinutes))) audioPrefs.triggerMinutes = 1;
            audioPrefs.triggerCooldownUntil = Number.isFinite(Number(audioPrefs.triggerCooldownUntil)) ? Number(audioPrefs.triggerCooldownUntil) : 0;
            triggerChangeLocked = Date.now() < audioPrefs.triggerCooldownUntil;
            updateAlertTriggerButtons();
            updateAlertVolumeButtons();
            updateAlertControlLocks();
            updateTriggerCooldownDisplay();
            if (alertGain && audioCtx) alertGain.gain.setTargetAtTime(audioPrefs.volume / 100, audioCtx.currentTime, 0.02);
        }

        function saveAudioPreferences() {
            appStorage.setItem(`${AUDIO_PREFS_KEY}_${currentServer}`, JSON.stringify({
                volume: audioPrefs.volume,
                triggerMinutes: audioPrefs.triggerMinutes,
                triggerCooldownUntil: audioPrefs.triggerCooldownUntil || 0
            }));
        }

        function isAlertSettingsLocked() {
            const triggerCooldownActive = Date.now() < Number(audioPrefs.triggerCooldownUntil || 0);
            return Boolean(previewInProgress || activeAlarm || triggerCooldownActive || Date.now() < alertSettingsUnlockAt || isAlertImminentWindow());
        }

        function updateMasterAlertButtonLock() {
            const button = document.getElementById('global-alert-btn');
            if (!button) return;
            const locked = isAlertSettingsLocked();
            button.disabled = locked;
            button.classList.toggle('is-action-locked', locked);
            button.setAttribute('aria-disabled', String(locked));
            button.title = locked ? 'Panel de alertas bloqueado durante el tiempo de espera o mientras se prepara/ejecuta una alerta.' : (globalAudioEnabled ? I18N[currentLang].alertsOn : I18N[currentLang].alertsOff);
        }

        function updateAlertVolumeButtons() {
            const group = document.getElementById('alert-volume-buttons');
            if (!group) return;
            const locked = isAlertSettingsLocked();
            group.querySelectorAll('[data-alert-volume]').forEach(button => {
                const selected = Number(button.dataset.alertVolume) === Number(audioPrefs.volume);
                button.classList.toggle('is-selected', selected);
                button.setAttribute('aria-pressed', selected ? 'true' : 'false');
                button.disabled = locked;
                button.setAttribute('aria-disabled', String(locked));
            });
            group.classList.toggle('is-locked', locked);
            const label = document.getElementById('alert-volume-value');
            if (label) label.textContent = `${audioPrefs.volume}%`;
        }

        async function changeAlertVolume(value) {
            if (isAlertSettingsLocked()) return;
            const nextVolume = Number(value);
            if (![60,70,80,90,100].includes(nextVolume)) return;
            // Clicking the already-selected level is a no-op: no sound, save, or preview.
            if (nextVolume === Number(audioPrefs.volume)) return;
            audioPrefs.volume = nextVolume;
            initAudioContext();
            if (audioCtx && audioCtx.state === 'suspended') {
                try { await audioCtx.resume(); } catch (e) {}
            }
            if (alertGain && audioCtx) alertGain.gain.setTargetAtTime(nextVolume / 100, audioCtx.currentTime, 0.015);
            saveAudioPreferences();
            updateAlertVolumeButtons();
            await previewMainAlert();
        }

        function updateAlertTriggerButtons() {
            const group = document.getElementById('alert-trigger-buttons');
            if (!group) return;
            const settingsLocked = isAlertSettingsLocked();
            const cooldownActive = Date.now() < Number(audioPrefs.triggerCooldownUntil || 0);
            group.querySelectorAll('[data-alert-trigger]').forEach(button => {
                const selected = Number(button.dataset.alertTrigger) === Number(audioPrefs.triggerMinutes);
                button.classList.toggle('is-selected', selected);
                button.setAttribute('aria-pressed', selected ? 'true' : 'false');
                button.disabled = settingsLocked || cooldownActive;
                button.setAttribute('aria-disabled', String(settingsLocked || cooldownActive));
            });
            group.classList.toggle('is-locked', settingsLocked || cooldownActive);
            const value = document.getElementById('alert-trigger-value');
            if (value) value.textContent = `${audioPrefs.triggerMinutes}m`;
        }

        function updateTriggerCooldownDisplay() {
            const label = document.getElementById('alert-trigger-cooldown');
            const until = Number(audioPrefs.triggerCooldownUntil || 0);
            const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
            if (label) {
                if (remaining > 0) {
                    label.textContent = `${I18N[currentLang].triggerAvailableIn}${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
                    label.classList.add('is-counting');
                } else {
                    label.textContent = I18N[currentLang].triggerAvailable;
                    label.classList.remove('is-counting');
                }
            }
            const oldLocked = triggerChangeLocked;
            triggerChangeLocked = remaining > 0;
            if (oldLocked !== triggerChangeLocked) updateAlertTriggerButtons();
        }

        function updateAlertControlLocks() {
            updateTriggerCooldownDisplay();
            updateAlertVolumeButtons();
            updateAlertTriggerButtons();
            updateMasterAlertButtonLock();
        }


        function isAlertImminentWindow() {
            if (activeAlarm || previewInProgress || Date.now() < alertSettingsUnlockAt) return true;
            const serverNow = getSelectedServerTime();
            for (const eventDef of EVENT_DEFINITIONS) {
                const state = calculateEventState(eventDef, serverNow);
                for (const instance of (state.upcomingInstances || [])) {
                    if (!isOccurrenceBellOn(eventDef.id, instance.startH, instance.startM)) continue;
                    const dateKey = getOccurrenceDateKey(serverNow, instance.startH, instance.startM);
                    const alertKey = `${currentServer}_${eventDef.id}_${instance.startH}_${instance.startM}_${dateKey}`;
                    const target = armedAlertTargets[`${currentServer}_${alertKey}`];
                    const targetSec = Number.isFinite(target) ? target : calculateAlertTargetSec(instance.remainingSec, audioPrefs.triggerMinutes);
                    // Lock 30 seconds before the selected trigger threshold, e.g. 05:30 for 05:00.
                    if (targetSec > 0 && instance.remainingSec <= targetSec + 30 && instance.remainingSec > Math.max(15, targetSec - 15)) return true;
                }
            }
            return false;
        }

        function calculateAlertTargetSec(remainingSec, triggerMinutes = audioPrefs.triggerMinutes) {
            if (!Number.isFinite(remainingSec) || remainingSec <= 15) return -1;
            const selectedSec = Number(triggerMinutes) * 60;
            if (remainingSec > selectedSec) return selectedSec;
            // If the selected threshold has already passed, choose the next lower whole-minute
            // threshold. At the final minute, 30 seconds is the last useful warning point.
            const lowerMinute = Math.floor((remainingSec - 1) / 60) * 60;
            if (lowerMinute > 0 && lowerMinute < remainingSec) return lowerMinute;
            if (remainingSec > 30) return 30;
            return -1;
        }

        function refreshArmedAlertTargets() {
            const serverNow = getSelectedServerTime();
            EVENT_DEFINITIONS.forEach(eventDef => {
                const state = calculateEventState(eventDef, serverNow);
                (state.upcomingInstances || []).forEach(instance => {
                    if (!isOccurrenceBellOn(eventDef.id, instance.startH, instance.startM)) return;
                    const dateKey = getOccurrenceDateKey(serverNow, instance.startH, instance.startM);
                    const alertKey = `${currentServer}_${eventDef.id}_${instance.startH}_${instance.startM}_${dateKey}`;
                    const armedKey = `${currentServer}_${alertKey}`;
                    armedAlertTargets[armedKey] = calculateAlertTargetSec(instance.remainingSec, audioPrefs.triggerMinutes);
                });
            });
        }

        function changeAlertTrigger(value) {
            if (triggerChangeLocked || isAlertSettingsLocked() || Date.now() < Number(audioPrefs.triggerCooldownUntil || 0)) return;
            const nextValue = Number(value);
            if (![1, 2, 3, 4, 5].includes(nextValue) || nextValue === Number(audioPrefs.triggerMinutes)) return;
            playTimeFormatSound();
            audioPrefs.triggerMinutes = nextValue;
            audioPrefs.triggerCooldownUntil = Date.now() + 60000;
            saveAudioPreferences();
            refreshArmedAlertTargets();
            triggerChangeLocked = true;
            updateAlertControlLocks();
            const feedback = document.getElementById('alert-trigger-feedback');
            if (feedback) {
                feedback.textContent = `Disparador actualizado: ${nextValue}m`;
                feedback.classList.remove('is-visible');
                void feedback.offsetWidth;
                feedback.classList.add('is-visible');
                if (triggerFeedbackTimer) clearTimeout(triggerFeedbackTimer);
                triggerFeedbackTimer = setTimeout(() => { feedback.classList.remove('is-visible'); triggerFeedbackTimer = null; }, 1700);
            }
            if (triggerUnlockTimer) clearTimeout(triggerUnlockTimer);
            const cooldownServer = currentServer;
            const cooldownUntil = audioPrefs.triggerCooldownUntil;
            triggerUnlockTimer = setTimeout(() => {
                if (currentServer !== cooldownServer || Number(audioPrefs.triggerCooldownUntil) !== cooldownUntil) return;
                audioPrefs.triggerCooldownUntil = 0;
                triggerChangeLocked = false;
                triggerUnlockTimer = null;
                saveAudioPreferences();
                updateTriggerCooldownDisplay();
                updateAlertControlLocks();
            }, 60000);
        }

        function formatAlertMoment(totalSeconds) {
            const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
            return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        }

        function showAlertArmNotice(message) {
            const notice = document.getElementById('alert-arm-notice');
            if (!notice) return;
            notice.textContent = message;
            notice.classList.remove('hidden', 'alert-arm-notice-leaving');
            notice.classList.add('alert-arm-notice-visible');
            if (armNoticeTimer) clearTimeout(armNoticeTimer);
            armNoticeTimer = setTimeout(() => {
                notice.classList.remove('alert-arm-notice-visible');
                notice.classList.add('alert-arm-notice-leaving');
                setTimeout(() => { notice.classList.add('hidden'); notice.classList.remove('alert-arm-notice-leaving'); }, 180);
                armNoticeTimer = null;
            }, 3000);
        }

        function playSelectedAlertSound(volumeOverride = null, nodeTracker = null) {
            initAudioContext();
            if (!audioCtx || !alertGain) return;
            const preset = EVENT_ALARM_PRESET;
            const now = audioCtx.currentTime;
            let output = alertGain;
            try {
                if (volumeOverride !== null && Number.isFinite(Number(volumeOverride))) {
                    output = audioCtx.createGain();
                    output.gain.value = Math.max(0, Math.min(1, Number(volumeOverride) / 100));
                    output.connect(audioCtx.destination);
                }
                const master = audioCtx.createGain();
                master.gain.value = preset.volume / 100;
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(preset.filter, now);
                master.connect(filter);
                filter.connect(output);
                if (nodeTracker) {
                    nodeTracker.push({ master, output: volumeOverride !== null ? output : null, cleanupTimer: null });
                }

                const originalNoteLevels = [0.12, 0.10, 0.085];
                preset.notes.forEach((frequency, index) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const t = now + index * preset.spacing;
                    const peak = originalNoteLevels[index] * (preset.volume / 100);
                    osc.type = preset.wave;
                    osc.frequency.setValueAtTime(frequency, t);
                    gain.gain.setValueAtTime(0.0001, t);
                    gain.gain.linearRampToValueAtTime(peak, t + preset.attack);
                    gain.gain.setValueAtTime(peak, t + preset.duration);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + preset.duration + preset.release);
                    osc.connect(gain);
                    gain.connect(master);
                    osc.start(t);
                    osc.stop(t + preset.duration + preset.release + 0.01);
                });

                // A subtle 40 ms echo gives the three-note alert a little body without muddying it.
                const delay = audioCtx.createDelay(0.12);
                const echoGain = audioCtx.createGain();
                echoGain.gain.value = preset.echo;
                filter.connect(delay);
                delay.connect(echoGain);
                echoGain.connect(output);
                const trackedNode = nodeTracker ? nodeTracker[nodeTracker.length - 1] : null;
                const cleanup = () => { try { master.disconnect(); filter.disconnect(); delay.disconnect(); echoGain.disconnect(); if (volumeOverride !== null && output !== alertGain) output.disconnect(); } catch (e) {} };
                const cleanupTimer = setTimeout(cleanup, 900);
                if (trackedNode) trackedNode.cleanupTimer = cleanupTimer;
            } catch (e) {}
        }

        function applyAlarmAnimation() {
            const toast = document.getElementById('alarm-toast');
            if (!toast) return;
            toast.classList.add('alert-animation-4');
        }

        function setPreviewPageLock(locked, mode = 'preview') {
            const overlay = document.getElementById('preview-page-overlay');
            const shouldLock = Boolean(locked || previewInProgress || activeAlarm || alertPreLock);
            if (overlay) {
                overlay.classList.toggle('hidden', !shouldLock);
                overlay.classList.toggle('alert-overlay-preview', shouldLock && (previewInProgress || mode === 'preview'));
                overlay.classList.toggle('alert-overlay-live', shouldLock && (Boolean(activeAlarm) || alertPreLock || mode === 'alarm'));
                overlay.setAttribute('aria-hidden', String(!shouldLock));
            }
            if (shouldLock) {
                if (!previewInertElements.length) {
                    previewPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                    document.querySelectorAll('body > *').forEach(element => {
                        if (element.id === 'preview-page-overlay' || element.id === 'alarm-toast' || element.tagName === 'SCRIPT') return;
                        previewInertElements.push([element, Boolean(element.inert)]);
                        element.inert = true;
                    });
                }
                const stopButton = document.querySelector('#alarm-toast button');
                if (stopButton && (previewInProgress || activeAlarm)) requestAnimationFrame(() => stopButton.focus({ preventScroll: true }));
            } else {
                previewInertElements.forEach(([element, wasInert]) => { if (element?.isConnected) element.inert = wasInert; });
                previewInertElements = [];
                if (previewPreviousFocus?.isConnected && typeof previewPreviousFocus.focus === 'function') {
                    try { previewPreviousFocus.focus({ preventScroll: true }); } catch (e) {}
                }
                previewPreviousFocus = null;
            }
        }

        function fadePreviewAudioOut(durationMs = 240) {
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            const end = now + durationMs / 1000;
            previewSoundNodes.forEach(node => {
                if (node.cleanupTimer) clearTimeout(node.cleanupTimer);
                try {
                    const param = node.master?.gain;
                    if (param) {
                        const current = Math.max(0.0001, param.value || 0.0001);
                        param.cancelScheduledValues(now);
                        param.setValueAtTime(current, now);
                        param.exponentialRampToValueAtTime(0.0001, end);
                    }
                } catch (e) {}
                node.cleanupTimer = setTimeout(() => {
                    try { node.master?.disconnect(); node.output?.disconnect(); } catch (e) {}
                }, durationMs + 35);
            });
            previewSoundNodes = [];
        }

        function finishMainAlertPreview({ fade = false } = {}) {
            if (previewAlarmInterval) clearInterval(previewAlarmInterval);
            if (previewStopTimer) clearTimeout(previewStopTimer);
            if (previewUnlockTimer) clearTimeout(previewUnlockTimer);
            previewAlarmInterval = previewStopTimer = previewUnlockTimer = null;
            if (fade) fadePreviewAudioOut(240);
            else previewSoundNodes = [];
            const toast = document.getElementById('alarm-toast');
            if (toast) toast.classList.add('alarm-toast-leaving');
            previewUnlockTimer = setTimeout(() => {
                previewUnlockTimer = null;
                previewInProgress = false;
                previewStopping = false;
                if (toast && !activeAlarm) toast.classList.add('hidden');
                if (toast) toast.classList.remove('alarm-toast-leaving', 'alert-previewing', 'alert-animation-4');
                setPreviewPageLock(false);
                updateAlertControlLocks();
            }, fade ? 280 : 360);
        }

        async function previewMainAlert() {
            if (previewInProgress || activeAlarm) return;
            initAudioContext();
            if (!audioCtx) return;
            try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch (e) { return; }
            const toast = document.getElementById('alarm-toast');
            if (!toast) return;
            previewInProgress = true;
            previewStopping = false;
            previewSoundNodes = [];
            updateAlertControlLocks();
            setPreviewPageLock(true);
            toast.classList.remove('hidden', 'alarm-toast-leaving');
            toast.classList.add('alert-previewing');
            document.getElementById('toast-title').textContent = 'VISTA PREVIA DE ALERTA';
            document.getElementById('toast-sub').textContent = `Volumen ${audioPrefs.volume}% · sonido de evento`;
            applyAlarmAnimation();
            const previewVolume = Number(audioPrefs.volume);
            playSelectedAlertSound(previewVolume, previewSoundNodes);
            previewAlarmInterval = setInterval(() => {
                if (previewStopping || !previewInProgress) return;
                playSelectedAlertSound(previewVolume, previewSoundNodes);
            }, 900);
            previewStopTimer = setTimeout(() => {
                if (!previewInProgress || previewStopping) return;
                if (previewAlarmInterval) clearInterval(previewAlarmInterval);
                previewAlarmInterval = null;
                // Let the final notes and release tail finish before restoring the interface.
                previewUnlockTimer = setTimeout(() => {
                    previewUnlockTimer = null;
                    previewInProgress = false;
                    previewStopping = false;
                    toast.classList.add('alarm-toast-leaving');
                    setTimeout(() => {
                        if (!activeAlarm) toast.classList.add('hidden');
                        toast.classList.remove('alarm-toast-leaving', 'alert-previewing', 'alert-animation-4');
                        setPreviewPageLock(false);
                        updateAlertControlLocks();
                        previewSoundNodes = [];
                    }, 220);
                }, 360);
            }, 5000);
        }

        function cancelMainAlertPreview(unlock = true, fade = true) {
            if (!previewInProgress) return false;
            if (previewStopping) return true;
            previewStopping = true;
            if (previewAlarmInterval) clearInterval(previewAlarmInterval);
            previewAlarmInterval = null;
            if (previewStopTimer) clearTimeout(previewStopTimer);
            previewStopTimer = null;
            if (previewUnlockTimer) clearTimeout(previewUnlockTimer);
            previewUnlockTimer = null;
            if (fade) fadePreviewAudioOut(240);
            const toast = document.getElementById('alarm-toast');
            if (toast) toast.classList.add('alarm-toast-leaving');
            previewUnlockTimer = setTimeout(() => {
                previewUnlockTimer = null;
                previewInProgress = false;
                previewStopping = false;
                if (toast && !activeAlarm) toast.classList.add('hidden');
                if (toast) toast.classList.remove('alarm-toast-leaving', 'alert-previewing', 'alert-animation-4');
                setPreviewPageLock(false);
                if (unlock) updateAlertControlLocks();
            }, fade ? 280 : 1);
            return true;
        }

        // Soft, short UI click cue, intentionally distinct from event alerts.
        let lastUiClickAt = 0;
        function playUiClickSound() {
            const nowMs = Date.now();
            if (nowMs - lastUiClickAt < 120) return;
            lastUiClickAt = nowMs;
            initAudioContext();
            if (!audioCtx) return;
            try {
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(740, now);
                osc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
                osc.connect(gain); gain.connect(masterGain || audioCtx.destination);
                osc.start(now); osc.stop(now + 0.07);
            } catch (e) {}
        }
        // Dedicated 12/24-hour format cue: a soft, warm two-note ascending chime.
        // Separate from the general UI click and all event/alert sounds.
        function playTimeFormatSound() {
            initAudioContext();
            if (!audioCtx) return;
            try {
                const now = audioCtx.currentTime;
                [[659.25, 0, 0.035, 0.075], [880, 0.055, 0.027, 0.095]].forEach(([frequency, delay, volume, duration]) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(frequency, now + delay);
                    gain.gain.setValueAtTime(0.0001, now + delay);
                    gain.gain.exponentialRampToValueAtTime(volume, now + delay + 0.012);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
                    osc.connect(gain);
                    gain.connect(masterGain || audioCtx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + duration + 0.01);
                });
            } catch (e) {}
        }

        // Unlock/resume Web Audio on the first real user gesture so later scheduled alerts can be heard.
        // Browsers block automatic audio until the visitor interacts with the page at least once.
        document.addEventListener('pointerdown', () => {
            initAudioContext();
        }, { once: true, passive: true });

        document.addEventListener('click', (event) => {
            const target = event.target.closest('.tab-btn, .nav-group-trigger, .nav-submenu-option, #lang-select, #lang-menu button, #sponsor-btn, #server-select, #server-menu button, #home-nav-btn, #about-nav-btn, .token-coin');
            if (target) playUiClickSound();
        });

        // Master Alert Switch Logic
        // If at least one scheduled alert is enabled, one click performs a full clean
        // (all event defaults and every occurrence off). If none are enabled, it enables all.
        function toggleGlobalAudio() {
            if (previewInProgress || activeAlarm) return;
            initAudioContext();
            const nextValue = !hasAnyEnabledBell();

            // Synchronize legacy event defaults, known occurrences, and any saved overrides.
            // Keeping explicit occurrence values prevents old individual settings from
            // unexpectedly re-enabling a bell after a global clean or a page reload.
            Object.keys(cardBellStates).forEach(key => { cardBellStates[key] = nextValue; });
            EVENT_DEFINITIONS.forEach(eventDef => {
                cardBellStates[eventDef.id] = nextValue;
                eventDef.schedule.forEach(([startH, startM]) => {
                    cardBellStates[getOccurrenceBellKey(eventDef.id, startH, startM)] = nextValue;
                });
            });
            globalAudioEnabled = nextValue;
            appStorage.setItem(serverPreferenceKey(STORAGE_MASTER_ALERT), String(nextValue));
            appStorage.setItem(serverPreferenceKey(STORAGE_BELLS), JSON.stringify(cardBellStates));

            if (nextValue) {
                playActivationSound();
            } else {
                playDeactivationSound();
                stopChimeSound();
            }

            renderMasterAlertUI();
            updateDashboard();
        }

        // Individual occurrence bell: changing one scheduled time never changes other bells.
        function toggleCardBell(eventId, startH, startM, e) {
            if (e) e.stopPropagation();
            const eventDef = EVENT_DEFINITIONS.find(def => def.id === eventId);
            if (!eventDef) return;
            const serverNow = getSelectedServerTime();
            const state = calculateEventState(eventDef, serverNow);
            // The active card itself has no alert control; future occurrences remain independent.
            if (state.isActive && state.startH === startH && state.startM === startM) return;
            initAudioContext();

            const bellKey = getOccurrenceBellKey(eventId, startH, startM);
            const nextValue = !isOccurrenceBellOn(eventId, startH, startM);
            const upcoming = (state.upcomingInstances || []).find(instance =>
                instance.startH === startH && instance.startM === startM);
            const remaining = upcoming?.remainingSec;
            // Prevent late arming close to the start. The narrow 55–60 s boundary asks for
            // confirmation and schedules the next useful cue (normally 30 s); below that
            // boundary, activation is blocked to avoid an immediate or misleading alert.
            if (nextValue && Number.isFinite(remaining) && remaining <= 60 && remaining > 5) {
                if (remaining >= 55) {
                    const accepted = window.confirm('Falta aproximadamente 1 minuto para que suene esta alerta. ¿En verdad quieres activarla?');
                    if (!accepted) return;
                } else {
                    showAlertArmNotice('El tiempo restante no permite realizar esta acción.');
                    return;
                }
            }
            if (nextValue && Number.isFinite(remaining) && remaining <= 5) {
                showAlertArmNotice('El tiempo restante no permite realizar esta acción.');
                return;
            }
            cardBellStates[bellKey] = nextValue;
            const targetAlertKey = `${currentServer}_${eventId}_${startH}_${startM}_${getOccurrenceDateKey(serverNow, startH, startM)}`;
            const armedKey = `${currentServer}_${targetAlertKey}`;
            if (nextValue) {
                // Re-arming an occurrence creates a fresh chance to alert; the previous firing must not poison it.
                delete triggeredAlerts[targetAlertKey];
                const targetSec = calculateAlertTargetSec(remaining, audioPrefs.triggerMinutes);
                armedAlertTargets[armedKey] = targetSec;
                if (Number.isFinite(remaining) && remaining >= 55 && remaining <= 60) {
                    const moment = targetSec > 0 ? formatAlertMoment(targetSec) : 'próximo umbral disponible';
                    showAlertArmNotice(`Alerta programada: sonará cuando falten ${moment} para el evento.`);
                }
            } else delete armedAlertTargets[armedKey];
            persistBellPreferences();

            if (nextValue) playActivationSound();
            else playDeactivationSound();

            // A single bell remains independent; the master indicator updates to reflect
            // whether any scheduled alert is still enabled, without changing other bells.
            renderMasterAlertUI();
            updateDashboard();
        }

        function renderMasterAlertUI() {
            const btn = document.getElementById('global-alert-btn');
            const icon = document.getElementById('global-alert-icon');
            const txt = document.getElementById('global-alert-txt');
            globalAudioEnabled = hasAnyEnabledBell();
            appStorage.setItem(serverPreferenceKey(STORAGE_MASTER_ALERT), String(globalAudioEnabled));
            btn.setAttribute('aria-pressed', String(globalAudioEnabled));

            if (globalAudioEnabled) {
                btn.classList.add('alerts-enabled');
                btn.setAttribute('aria-label', I18N[currentLang].alertsOn);
                btn.setAttribute('title', I18N[currentLang].alertsOn);
                icon.className = "fa-solid fa-bell";
                txt.textContent = I18N[currentLang].alertsOn;
            } else {
                btn.classList.remove('alerts-enabled');
                btn.setAttribute('aria-label', I18N[currentLang].alertsOff);
                btn.setAttribute('title', I18N[currentLang].alertsOff);
                icon.className = "fa-solid fa-bell-slash";
                txt.textContent = I18N[currentLang].alertsOff;
            }
            updateMasterAlertButtonLock();
        }

        // SERVER CLOCK: fixed official MIR4 region offsets, independent of the visitor's timezone.
        // Keeping calculations in UTC avoids DST/local-time drift and repeated offset conversions.
        function getSelectedServerTime() {
            return new Date(Date.now() + SERVER_CONFIG[currentServer].offset * 3600000);
        }

        function renderServerSelection() {
            const config = SERVER_CONFIG[currentServer];
            const label = document.getElementById('server-select-label');
            if (label) label.textContent = `GLOBAL▸ ${config.label}`;
            const tz = document.getElementById('tz-info');
            if (tz) tz.textContent = `SERVIDOR ${config.label} (${config.utc})`;
            const clockLabel = document.getElementById('lbl-server-time');
            if (clockLabel) clockLabel.textContent = I18N[currentLang].serverTime;
            document.querySelectorAll('.server-option').forEach(option => {
                const selected = option.dataset.server === currentServer;
                option.classList.toggle('bg-amber-500/15', selected);
                option.classList.toggle('text-amber-300', selected);
                option.setAttribute('aria-checked', String(selected));
            });
        }

        function toggleServerMenu() {
            const menu = document.getElementById('server-menu');
            const button = document.getElementById('server-select');
            const willOpen = menu.classList.contains('hidden');
            closeDropdownMenus(willOpen ? 'server-menu' : null);
            menu.classList.toggle('hidden', !willOpen);
            menu.classList.remove('menu-pop-in');
            if (willOpen) {
                // Restart the entrance animation whenever the menu opens.
                void menu.offsetWidth;
                menu.classList.add('menu-pop-in');
            }
            button.setAttribute('aria-expanded', String(willOpen));
        }

        // A warning is eligible only while its own Global is selected. Returning to a
        // server inside the 60-second window may still play it, except at exactly 60s
        // (the boundary is deliberately skipped to avoid timing-edge double behavior).
        function markAlertsAtExactThresholdAsMissed(server) {
            const serverNow = new Date(Date.now() + SERVER_CONFIG[server].offset * 3600000);
            EVENT_DEFINITIONS.forEach(eventDef => {
                const state = calculateEventState(eventDef, serverNow);
                (state.upcomingInstances || []).forEach(instance => {
                    if (instance.remainingSec === 60) {
                        const alertKey = `${server}_${eventDef.id}_${instance.startH}_${instance.startM}_${getOccurrenceDateKey(serverNow, instance.startH, instance.startM)}`;
                        triggeredAlerts[alertKey] = true;
                    }
                });
            });
        }

        function selectServer(server) {
            if (!Object.prototype.hasOwnProperty.call(SERVER_CONFIG, server) || server === currentServer) {
                document.getElementById('server-menu').classList.add('hidden');
                document.getElementById('server-select').setAttribute('aria-expanded', 'false');
                return;
            }
            // Do not evaluate alerts for other Globals while they are unselected.
            // On entry, only the exact 60-second boundary is skipped; if the alert is
            // already under 60 seconds it may still play. Expired events never catch up.
            // An already-running alert or its preview is allowed to finish; new alerts are
            // still evaluated only for the selected Global. This prevents server navigation
            // from interrupting an alert that has already begun.
            saveAudioPreferences();
            // Server changes isolate alert playback: fade/cancel a preview and stop the old Global's active alarm.
            if (previewInProgress) cancelMainAlertPreview(true, true);
            if (activeAlarm) stopChimeSound(false, false);
            Object.keys(alertGlowUntil).forEach(eventId => { delete alertGlowUntil[eventId]; });
            alertPreparationKeys.clear();
            alertPreLock = false;
            setPreviewPageLock(false);
            currentServer = server;
            loadAudioPreferences();
            currentServerEnteredAt = Date.now();
            try { sessionStorage.setItem(STORAGE_SERVER, currentServer); } catch (error) {}
            // Avoid false start/end sounds caused by switching the clock's reference region.
            suppressTransitionSounds = true;
            renderServerSelection();
            document.getElementById('server-menu').classList.add('hidden');
            document.getElementById('server-select').setAttribute('aria-expanded', 'false');
            setTimeout(() => { if (currentServer === server) updateDashboard(); }, 1000);
        }

        function formatTwoDigits(num) {
            return num < 10 ? '0' + num : num;
        }

        function formatDecoratedLabel(text) {
            return String(text).replace(/\s*\(([^)]*)\)/g, (_, inside) => ` ◂ ${inside.toLocaleUpperCase(currentLang)} ▸`);
        }

        // 24-hour format is the default; this changes presentation only, never schedule calculations.
        const savedTimeFormat = appStorage.getItem(STORAGE_TIME_FORMAT);
        function detectInitialTimeFormat() {
            try {
                const locale = navigator.languages && navigator.languages[0] ? navigator.languages[0] : navigator.language;
                const options = new Intl.DateTimeFormat(locale || undefined, { hour: 'numeric' }).resolvedOptions();
                const cycle = options.hourCycle;
                if (cycle) return cycle === 'h11' || cycle === 'h12' ? '12h' : '24h';
                return /AM|PM/i.test(new Date().toLocaleTimeString(locale || undefined, { hour: 'numeric' })) ? '12h' : '24h';
            } catch (e) {
                return '24h';
            }
        }
        let timeFormat = savedTimeFormat === '12h' || savedTimeFormat === '24h'
            ? savedTimeFormat
            : detectInitialTimeFormat();
        if (!savedTimeFormat) appStorage.setItem(STORAGE_TIME_FORMAT, timeFormat);
        if (!savedLang) appStorage.setItem(STORAGE_LANG, currentLang);

        function renderTimeFormatToggle() {
            const toggle = document.getElementById('time-format-toggle');
            if (!toggle) return;
            toggle.textContent = timeFormat === '24h' ? '24H' : '12H';
            toggle.setAttribute('aria-label', timeFormat === '24h' ? I18N[currentLang].switchTo12 : I18N[currentLang].switchTo24);
            toggle.setAttribute('title', timeFormat === '24h' ? I18N[currentLang].switchTo12 : I18N[currentLang].switchTo24);
        }

        function toggleTimeFormat() {
            playTimeFormatSound();
            timeFormat = timeFormat === '24h' ? '12h' : '24h';
            appStorage.setItem(STORAGE_TIME_FORMAT, timeFormat);
            renderTimeFormatToggle();
            updateDashboard();
        }

        function updateHeaderClocks(serverNow) {
            const localNow = new Date();
            const localClock = document.getElementById('local-clock');
            if (localClock) {
                if (timeFormat === '12h') {
                    const hours12 = localNow.getHours() % 12 || 12;
                    const period = localNow.getHours() >= 12 ? 'PM' : 'AM';
                    localClock.textContent = `${formatTwoDigits(hours12)} : ${formatTwoDigits(localNow.getMinutes())} : ${formatTwoDigits(localNow.getSeconds())} ${period}`;
                } else {
                    localClock.textContent = `${formatTwoDigits(localNow.getHours())} : ${formatTwoDigits(localNow.getMinutes())} : ${formatTwoDigits(localNow.getSeconds())}`;
                }
            }
            const localLabel = document.getElementById('lbl-local-time');
            const resetLabel = document.getElementById('lbl-week-reset');
            if (localLabel) localLabel.textContent = I18N[currentLang].localTime;
            if (resetLabel) resetLabel.textContent = I18N[currentLang].weekReset;

            // Weekly reset is displayed as the next Monday at 00:00 in the selected server clock.
            const resetAt = new Date(serverNow.getTime());
            const daysUntilMonday = (8 - resetAt.getUTCDay()) % 7 || 7;
            resetAt.setUTCDate(resetAt.getUTCDate() + daysUntilMonday);
            resetAt.setUTCHours(0, 0, 0, 0);
            // If it is Monday before 00:00 is impossible after setUTCDate above; always use the next reset.
            let remaining = Math.max(0, Math.floor((resetAt.getTime() - serverNow.getTime()) / 1000));
            const days = Math.floor(remaining / 86400); remaining %= 86400;
            const hours = Math.floor(remaining / 3600); remaining %= 3600;
            const minutes = Math.floor(remaining / 60); const seconds = remaining % 60;
            const resetClock = document.getElementById('week-reset-clock');
            if (resetClock) resetClock.textContent = `${days}d  ${formatTwoDigits(hours)} : ${formatTwoDigits(minutes)} : ${formatTwoDigits(seconds)}`;
        }

        function formatTime12h(hours, minutes) {
            if (timeFormat === '12h') {
                const hours12 = hours % 12 || 12;
                const period = hours >= 12 ? 'PM' : 'AM';
                return `${formatTwoDigits(hours12)}:${formatTwoDigits(minutes)} ${period}`;
            }
            return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)} ${currentServer}`;
        }

        // Schedule chips follow the shared 12/24-hour preference without adding the
        // selected server suffix to the clock time. Sorting always uses the numeric schedule.
        function formatScheduleChipTime(hours, minutes) {
            if (timeFormat === '12h') {
                const hours12 = hours % 12 || 12;
                const period = hours >= 12 ? 'PM' : 'AM';
                return `${formatTwoDigits(hours12)}:${formatTwoDigits(minutes)} ${period}`;
            }
            return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}`;
        }

        function calculateEventState(eventDef, serverNow) {
            if (eventDef.triggerType === 'kill-count') {
                return {
                    isActive: false,
                    isConditionOnly: true,
                    timeToCompare: Number.POSITIVE_INFINITY,
                    displayTime: '',
                    remainingSec: 0,
                    startH: null,
                    startM: null,
                    durationMin: eventDef.durationMin,
                    waitingProgress: 0,
                    nextQueueDisplay: null,
                    nextQueueSec: null,
                    upcomingInstances: []
                };
            }
            const currentMinOfDay = serverNow.getUTCHours() * 60 + serverNow.getUTCMinutes();
            const currentSecOfMin = serverNow.getUTCSeconds();

            let activeInstance = null;
            let nextInstances = [];

            for (let timePair of eventDef.schedule) {
                const [h, m] = timePair;
                const startMin = h * 60 + m;
                const endMin = startMin + eventDef.durationMin;

                if (currentMinOfDay >= startMin && currentMinOfDay < endMin) {
                    const remainingSec = ((endMin - currentMinOfDay) * 60) - currentSecOfMin;
                    activeInstance = {
                        startH: h,
                        startM: m,
                        remainingSec: remainingSec,
                        durationMin: eventDef.durationMin
                    };
                }

                let diffMin = startMin - currentMinOfDay;
                if (diffMin <= 0) diffMin += 1440;

                const diffSec = (diffMin * 60) - currentSecOfMin;
                nextInstances.push({
                    startH: h,
                    startM: m,
                    remainingSec: diffSec
                });
            }

            nextInstances.sort((a, b) => a.remainingSec - b.remainingSec);
            const nextInstance = nextInstances[0];
            // Every scheduled occurrence in the next 24 hours, ordered by actual time remaining.
            // This list is rendered only in individual category tabs; the ALL tab keeps its current layout.
            const upcomingInstances = eventDef.schedule.map(([h, m]) => {
                let diffMin = (h * 60 + m) - currentMinOfDay;
                if (diffMin <= 0) diffMin += 1440;
                const remainingSec = (diffMin * 60) - currentSecOfMin;
                const scheduleSeconds = eventDef.schedule
                    .map(([sh, sm]) => sh * 3600 + sm * 60)
                    .sort((a, b) => a - b);
                const targetStartSec = h * 3600 + m * 60;
                const targetIndex = scheduleSeconds.indexOf(targetStartSec);
                const previousStartSec = scheduleSeconds[(targetIndex - 1 + scheduleSeconds.length) % scheduleSeconds.length];
                const fullDaySec = 24 * 60 * 60;
                const gapSec = (targetStartSec - (previousStartSec + eventDef.durationMin * 60) + fullDaySec) % fullDaySec;
                const safeGapSec = gapSec > 0 ? gapSec : fullDaySec;
                const waitingProgress = Math.max(0, Math.min(1, (safeGapSec - remainingSec) / safeGapSec));
                return {
                    startH: h,
                    startM: m,
                    remainingSec,
                    startH: h,
                    startM: m,
                    waitingProgress,
                    displayTime: formatTime12h(h, m)
                };
            }).sort((a, b) => a.remainingSec - b.remainingSec);

            if (activeInstance) {
                return {
                    isActive: true,
                    timeToCompare: activeInstance.remainingSec,
                    // While the event is active, show its next scheduled opening,
                    // not the opening time of the event that is already running.
                    displayTime: formatTime12h(nextInstance.startH, nextInstance.startM),
                    remainingSec: activeInstance.remainingSec,
                    startH: activeInstance.startH,
                    startM: activeInstance.startM,
                    durationMin: activeInstance.durationMin,
                    // The queue shows the opening after the one displayed above.
                    nextQueueDisplay: nextInstances[1] ? formatTime12h(nextInstances[1].startH, nextInstances[1].startM) : null,
                    nextQueueSec: nextInstances[1] ? nextInstances[1].remainingSec : null,
                    upcomingInstances
                };
            } else {
                // Waiting progress fills steadily from the previous event's end until the next start.
                // This uses the real gap between scheduled instances, not just the final 60 seconds.
                const scheduleSeconds = eventDef.schedule
                    .map(([h, m]) => h * 3600 + m * 60)
                    .sort((a, b) => a - b);
                const nextStartSec = nextInstance.startH * 3600 + nextInstance.startM * 60;
                const nextIndex = scheduleSeconds.indexOf(nextStartSec);
                const previousStartSec = scheduleSeconds[(nextIndex - 1 + scheduleSeconds.length) % scheduleSeconds.length];
                const fullDaySec = 24 * 60 * 60;
                const gapSec = (nextStartSec - (previousStartSec + eventDef.durationMin * 60) + fullDaySec) % fullDaySec;
                const safeGapSec = gapSec > 0 ? gapSec : fullDaySec;
                const waitingProgress = Math.max(0, Math.min(1, (safeGapSec - nextInstance.remainingSec) / safeGapSec));

                return {
                    isActive: false,
                    timeToCompare: nextInstance.remainingSec,
                    displayTime: formatTime12h(nextInstance.startH, nextInstance.startM),
                    remainingSec: nextInstance.remainingSec,
                    startH: nextInstance.startH,
                    startM: nextInstance.startM,
                    durationMin: eventDef.durationMin,
                    waitingProgress,
                    nextQueueDisplay: nextInstances[1] ? formatTime12h(nextInstances[1].startH, nextInstances[1].startM) : null,
                    nextQueueSec: nextInstances[1] ? nextInstances[1].remainingSec : null,
                    upcomingInstances
                };
            }
        }

        function formatDurationDHMS(totalSeconds) {
            if (totalSeconds <= 0) return "00m 00s";
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            if (h > 0) return `${h}h ${m}m ${formatTwoDigits(s)}s`;
            return `${m}m ${formatTwoDigits(s)}s`;
        }

        // Smoothly interpolate timer color from green to yellow, orange and red.
        function getTimerProgressColor(progress) {
            const stops = [
                { at: 0, color: [34, 197, 94] },      // green
                { at: 0.5, color: [234, 179, 8] },    // yellow
                { at: 0.78, color: [249, 115, 22] },  // orange
                { at: 1, color: [239, 68, 68] }       // red
            ];
            const p = Math.max(0, Math.min(1, progress));
            let left = stops[0], right = stops[stops.length - 1];
            for (let i = 0; i < stops.length - 1; i++) {
                if (p >= stops[i].at && p <= stops[i + 1].at) {
                    left = stops[i]; right = stops[i + 1]; break;
                }
            }
            const t = (p - left.at) / (right.at - left.at || 1);
            const rgb = left.color.map((channel, i) => Math.round(channel + (right.color[i] - channel) * t));
            return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        }

        // --- RENDER ENGINE & SORTING ---
        function updateDashboard() {
            const serverNow = getSelectedServerTime();

            // Update the clock for the selected MIR4 region.
            document.getElementById('server-clock').textContent =
                `${formatTwoDigits(serverNow.getUTCHours())} : ${formatTwoDigits(serverNow.getUTCMinutes())} : ${formatTwoDigits(serverNow.getUTCSeconds())}`;
            updateHeaderClocks(serverNow);

            const calculatedEvents = EVENT_DEFINITIONS.map(def => {
                const state = calculateEventState(def, serverNow);
                return { ...def, state };
            });

            // Detectar transiciones en bloque: un solo sonido por grupo de inicios.
            // El sonido de cierre se adelanta 5 s y también se agrupa si varios eventos
            // terminan con pocos segundos de diferencia.
            const nowMs = Date.now();
            let hasNewStart = false;
            let hasClosingWarning = false;

            calculatedEvents.forEach(evt => {
                if (evt.triggerType === 'kill-count') {
                    previousActiveState[evt.id] = false;
                    return;
                }
                const hadPreviousState = Object.prototype.hasOwnProperty.call(previousActiveState, evt.id);
                const wasActive = previousActiveState[evt.id];

                if (!suppressTransitionSounds && hadPreviousState && wasActive === false && evt.state.isActive) {
                    hasNewStart = true;
                }

                if (!suppressTransitionSounds && evt.state.isActive &&
                    evt.state.remainingSec > 0 && evt.state.remainingSec <= 5) {
                    const closeKey = `${currentServer}_${evt.id}_${evt.state.startH}_${evt.state.startM}_${getOccurrenceDateKey(serverNow, evt.state.startH, evt.state.startM)}`;
                    if (!completionWarningsFired.has(closeKey)) {
                        completionWarningsFired.add(closeKey);
                        hasClosingWarning = true;
                    }
                }

                previousActiveState[evt.id] = evt.state.isActive;
            });

            // Debounce independiente por tipo: las tarjetas que coinciden o casi coinciden
            // comparten una sola alerta, sin interferir con el sonido de inicio.
            if (hasClosingWarning && nowMs - lastCompletionSoundAt >= 3000) {
                lastCompletionSoundAt = nowMs;
                playCompletionSound();
            }
            if (hasNewStart && nowMs - lastStartSoundAt >= 2000) {
                lastStartSoundAt = nowMs;
                playEventStartSound();
            }
            suppressTransitionSounds = false;

            // Selector-based warning schedule. If the chosen threshold was already passed,
            // advance to the next lower minute rather than firing immediately; if a threshold
            // is missed during throttling, step down by one minute until a valid 15s window.
            let bellStateChanged = false;
            calculatedEvents.forEach(evt => {
                (evt.state.upcomingInstances || []).forEach(instance => {
                    const bellKey = getOccurrenceBellKey(evt.id, instance.startH, instance.startM);
                    const alertKey = `${currentServer}_${evt.id}_${instance.startH}_${instance.startM}_${getOccurrenceDateKey(serverNow, instance.startH, instance.startM)}`;
                    if (!isAlertPlaybackAllowed() || triggeredAlerts[alertKey] || !isOccurrenceBellOn(evt.id, instance.startH, instance.startM)) return;
                    const armedKey = `${currentServer}_${alertKey}`;
                    let targetSec = armedAlertTargets[armedKey];
                    if (!Number.isFinite(targetSec)) {
                        targetSec = calculateAlertTargetSec(instance.remainingSec, audioPrefs.triggerMinutes);
                        armedAlertTargets[armedKey] = targetSec;
                    }
                    if (targetSec <= 0) return;
                    // Redirect and lock 1.5–2.5 s before the trigger so the ALL view is ready.
                    // This is per occurrence and only for the currently selected server.
                    if (instance.remainingSec <= targetSec + 2 && instance.remainingSec > targetSec) {
                        if (!alertPreparationKeys.has(alertKey)) {
                            alertPreparationKeys.add(alertKey);
                            alertPreLock = true;
                            // Lock and start the dim/focus transition immediately. Only navigate/scroll
                            // when the user is actually on another category; the ALL view needs no jump.
                            setPreviewPageLock(true, 'alarm');
                            const homeView = document.getElementById('home-view');
                            const aboutView = document.getElementById('about-view');
                            const wasOnAbout = Boolean(aboutView && !aboutView.classList.contains('hidden'));
                            const wasOnOtherTab = currentTab !== 'ALL';
                            const wasOnSecondaryAllPage = currentTab === 'ALL' && allEventsPage > 0;
                            if (wasOnAbout) showHomeView(false);
                            if (wasOnOtherTab) setTab('ALL', false);
                            else if (wasOnSecondaryAllPage) allEventsPage = 0;
                            if (wasOnAbout || wasOnOtherTab || wasOnSecondaryAllPage) {
                                requestAnimationFrame(() => {
                                    const target = document.getElementById('tab-ALL') || document.getElementById('events-grid');
                                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                });
                            }
                        }
                    }
                    // Never catch up late after a tab/server switch or timer throttling.
                    // The configured trigger is valid only for its own 15-second window.
                    if (instance.remainingSec < targetSec - 15) {
                        armedAlertTargets[armedKey] = -1;
                        if (alertPreparationKeys.delete(alertKey) && !activeAlarm && !previewInProgress) {
                            alertPreLock = false;
                            setPreviewPageLock(false);
                        }
                        return;
                    }
                    if (instance.remainingSec <= targetSec && instance.remainingSec > Math.max(15, targetSec - 15)) {
                        triggeredAlerts[alertKey] = true;
                        delete armedAlertTargets[armedKey];
                        alertPreparationKeys.delete(alertKey);
                        if (currentTab !== 'ALL') setTab('ALL', false);
                        else if (allEventsPage > 0) allEventsPage = 0;
                        // The sound owner registers its own glow only after audio playback is
                        // accepted; simultaneous cards join that same visual deadline in triggerChimeSound.
                        triggerChimeSound(alertKey, evt.id, currentServer);
                        cardBellStates[bellKey] = false;
                        bellStateChanged = true;
                    }
                });
            });
            if (bellStateChanged) {
                persistBellPreferences();
                renderMasterAlertUI();
            }

            updateAlertControlLocks();

            let filtered = calculatedEvents;
            if (currentTab !== 'ALL') {
                filtered = calculatedEvents.filter(e => e.cat === currentTab);
            }

            // SORTING RULE: Active events top, then waiting events sorted chronologically by next spawn
            filtered.sort((a, b) => {
                if (a.state.isActive && !b.state.isActive) return -1;
                if (!a.state.isActive && b.state.isActive) return 1;
                return a.state.timeToCompare - b.state.timeToCompare;
            });

            const container = document.getElementById('events-grid');
            const langDict = I18N[currentLang];
            const totalFilteredEvents = filtered.length;
            const totalAllPages = Math.max(1, Math.ceil(totalFilteredEvents / ALL_EVENTS_PAGE_SIZE));
            if (currentTab === 'ALL') {
                allEventsPage = Math.max(0, Math.min(allEventsPage, totalAllPages - 1));
            }
            const eventsForRender = currentTab === 'ALL'
                ? filtered.slice(allEventsPage * ALL_EVENTS_PAGE_SIZE, (allEventsPage + 1) * ALL_EVENTS_PAGE_SIZE)
                : filtered;
            // Keep CSS loops at the same phase when cards are refreshed every second.
            const loopOffset = `-${(Date.now() % 5000) / 1000}s`;

            container.innerHTML = eventsForRender.map(evt => {
                const isActive = evt.state.isActive;
                const isConditionOnly = evt.triggerType === 'kill-count';
                const isBellOn = !isConditionOnly && isOccurrenceBellOn(evt.id, evt.state.startH, evt.state.startM);
                let localizedTitle = formatDecoratedLabel(langDict.eventTitles[evt.id] || (P3_EVENT_TITLES[currentLang] && P3_EVENT_TITLES[currentLang][evt.id]) || evt.title);
                // Consistent spacing around decorative name markers across ALL and individual views.
                localizedTitle = localizedTitle.replace(/◂ \s*/g, "◂ ").replace(/\s* ▸/g, " ▸");
                const formattedCardTitles = {
                    es: { frenesi: 'MS <strong>◂ FRENESÍ ▸</strong>', furia: 'MS <strong>◂ FURIA ▸</strong>', lideres: 'MS <strong>◂ LIDER 3 ▸</strong>', wb_valles: 'WB <strong>◂ VALLES ▸</strong>', wb_laberintos: 'WB <strong>◂ LABERINTOS ▸</strong>' },
                    pt: { frenesi: 'MS <strong>◂ FRENESI ▸</strong>', furia: 'MS <strong>◂ FÚRIA ▸</strong>', lideres: 'MS <strong>◂ LÍDER 3 ▸</strong>', wb_valles: 'WB <strong>◂ VALES ▸</strong>', wb_laberintos: 'WB <strong>◂ LABIRINTOS ▸</strong>' },
                    en: { frenesi: 'MS <strong>◂ FRENZY ▸</strong>', furia: 'MS <strong>◂ FURY ▸</strong>', lideres: 'MS <strong>◂ LEADER 3 ▸</strong>', wb_valles: 'WB <strong>◂ VALLEYS ▸</strong>', wb_laberintos: 'WB <strong>◂ LABYRINTHS ▸</strong>' }
                };
                const languageCardTitles = formattedCardTitles[currentLang] || formattedCardTitles.es;
                if (languageCardTitles[evt.id]) localizedTitle = languageCardTitles[evt.id];
                // Apply the same spaced name markers to every card, including titles that previously had none.
                if (!localizedTitle.includes('◂')) localizedTitle = `◂ ${localizedTitle} ▸`;
                localizedTitle = localizedTitle.replace(/◂\s*/g, '◂ ').replace(/\s*▸/g, ' ▸');
                const elapsedRatio = isActive ? Math.max(0, Math.min(1, 1 - (evt.state.remainingSec / (evt.durationMin * 60)))) : 0;
                // Active events show elapsed event duration; waiting events subtly fill the gap until their next start.
                const waitingProgress = !isActive ? (evt.state.waitingProgress || 0) : 0;
                const progressPercent = (isActive ? elapsedRatio : waitingProgress) * 100;
                const progressColor = getTimerProgressColor(elapsedRatio);
                const previousProgressColor = getTimerProgressColor(Math.max(0, elapsedRatio - 0.12));

                // Individual event tabs share the finalized W1-style cycle card.
                // ALL deliberately retains its original card layout and behavior.
                const isCimaCycleCard = currentTab === 'CIMA' && evt.cat === 'CIMA';
                const isLider3CycleCard = currentTab === 'LIDERES' && evt.cat === 'LIDERES';
                const isOtherCycleCard = currentTab !== 'ALL'
                    && evt.cat === currentTab
                    && !['CIMA', 'LIDERES'].includes(evt.cat);
                const isUnifiedCycleCard = isCimaCycleCard || isLider3CycleCard || isOtherCycleCard;
                const usesMirageCycleLayout = (evt.cat === 'W1' && currentTab !== 'ALL') || isUnifiedCycleCard;
                // Sort by real time-to-appearance, not display text: active first, then next schedule
                // occurrences, including the midnight wrap. The active time is listed only once.
                const cycleSchedule = isUnifiedCycleCard
                    ? [
                        ...(isActive ? [[evt.state.startH, evt.state.startM]] : []),
                        ...(evt.state.upcomingInstances || [])
                            .filter(instance => !isActive || instance.startH !== evt.state.startH || instance.startM !== evt.state.startM)
                            .map(instance => [instance.startH, instance.startM])
                    ]
                    : [...evt.schedule].sort((a, b) => (a[0] * 60 + a[1]) - (b[0] * 60 + b[1]));
                const cycleOpeningStateClass = isConditionOnly
                    ? 'mirage-condition-opening'
                    : isCimaCycleCard
                        ? (isActive ? 'mirage-cima-opening-active' : 'mirage-cima-opening-empty')
                        : isLider3CycleCard
                            ? (isActive ? 'mirage-lideres-opening-active' : 'mirage-lideres-opening-empty')
                            : isOtherCycleCard
                                ? (isActive ? 'mirage-unified-opening-active' : 'mirage-unified-opening-empty')
                                : '';
                // Calculate every real interval between appearances, including midnight wrap.
                // A regular schedule shows the interval; an irregular schedule shows its daily count
                // with the multiplier in the requested order (for example, 7X AL DÍA).
                const scheduleMinutes = [...evt.schedule]
                    .map(([hour, minute]) => hour * 60 + minute)
                    .sort((a, b) => a - b);
                const cycleGaps = scheduleMinutes.map((startMinute, index) => {
                    const nextMinute = scheduleMinutes[(index + 1) % scheduleMinutes.length]
                        + (index === scheduleMinutes.length - 1 ? 1440 : 0);
                    return nextMinute - startMinute;
                });
                const uniqueCycleGaps = [...new Set(cycleGaps)].sort((a, b) => a - b);
                const formatCycleGap = gapMinutes => {
                    const hours = Math.floor(gapMinutes / 60);
                    const minutes = gapMinutes % 60;
                    return `${hours ? `${hours}H` : ''}${minutes ? `${hours ? ' ' : ''}${minutes}M` : ''}` || '0M';
                };
                const isIrregularCycle = !isConditionOnly && uniqueCycleGaps.length > 1;
                const cycleIntervalLabel = isConditionOnly
                    ? langDict.noFixedTime
                    : isIrregularCycle
                        ? `${scheduleMinutes.length}X ${langDict.perDay}`
                        : formatCycleGap(uniqueCycleGaps[0] || 0);
                const cycleIntervalTitle = isConditionOnly
                    ? langDict.conditionStatus
                    : (isIrregularCycle ? langDict.frequency : langDict.reappearsEvery);

                return `
                <div data-event-id="${evt.id}" style="--alert-loop-offset: -${(Date.now() % 1400) / 1000}s" class="event-card ${usesMirageCycleLayout ? 'mirage-w1-individual' : ''} ${isCimaCycleCard ? 'mirage-cima-individual' : ''} ${isLider3CycleCard ? 'mirage-lideres-individual' : ''} ${isOtherCycleCard ? 'mirage-unified-individual' : ''} bg-brand-card/90 border border-brand-border/80 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between ${isActive ? 'glow-active bg-emerald-950/20' : (isConditionOnly ? '' : 'cursor-pointer')} ${alertGlowUntil[evt.id] > Date.now() ? 'alert-glow-active' : ''}" ${!isActive && !isConditionOnly ? `onclick="toggleCardBell('${evt.id}', ${evt.state.startH}, ${evt.state.startM}, event)" title="${langDict.bellTitle}"` : ''}>
                    
                    <i class="event-watermark fa-solid ${evt.icon}" aria-hidden="true"></i>
                    <div class="event-card-content">
                        <!-- Independent title header: the colored boss badge sits on its own divider line. -->
                        <div class="event-card-header event-card-title-header">
                            <span class="event-title inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border" data-title-color="${evt.color || 'amber'}" style="${getBossIconGradientStyle(evt.id)}" title="${localizedTitle.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;')}">
                                <i class="fa-solid ${evt.badgeIcon || evt.icon} boss-title-icon" style="${getBossIconGradientStyle(evt.id)}" aria-hidden="true"></i>
                                <span class="event-title-text">${localizedTitle}</span>
                            </span>
                        </div>
                        <!-- Status and bell sit underneath the title, aligned to the card's left edge. -->
                        <div class="event-card-status-row mb-3">
                            <div class="event-card-status-controls flex items-center gap-2">
                                ${isActive
                                    ? `<span title="${langDict.statusActive}" aria-label="${langDict.statusActive}" class="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 bell-locked"><i class="fa-solid fa-circle-check text-sm"></i></span>`
                                    : (isConditionOnly ? '' : `<button type="button" onclick="toggleCardBell('${evt.id}', ${evt.state.startH}, ${evt.state.startM}, event)" title="${langDict.bellTitle}" aria-label="${langDict.bellTitle}" class="alert-bell-button p-1.5 rounded-lg border border-brand-border/60 bg-brand-dark/60 text-slate-400"><i style="--loop-offset: ${loopOffset}" class="fa-solid fa-bell text-sm ${isBellOn ? 'bell-active bell-waiting-pulse' : 'bell-off opacity-40'}"></i></button>`)}
                                <span style="--loop-offset: ${loopOffset}" class="text-[11px] font-orbitron font-bold px-2.5 py-1 rounded-lg ${isConditionOnly ? 'bg-violet-500/15 text-violet-200 border border-violet-400/40' : (isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' : 'bg-brand-dark/80 text-slate-400 border border-brand-border') }" ${isConditionOnly ? `aria-label="${langDict.conditionStatus}"` : ''}>
                                    ${isConditionOnly ? langDict.conditionStatus : (isActive ? langDict.statusActive : `<span class="waiting-dots" style="--loop-offset: ${loopOffset}">${langDict.statusWaiting}</span>`)}
                                </span>
                            </div>
                        </div>

                        <!-- OPENING TIME & DURATION -->
                        <div class="${cycleOpeningStateClass} mt-4 mb-2">
                            ${isConditionOnly
                                ? `<div class="condition-only-panel rounded-xl border px-4 py-4">
                                        <div class="mb-2 flex items-center gap-2 text-violet-200"><i class="fa-solid fa-skull-crossbones" aria-hidden="true"></i><span class="text-xs font-bold tracking-wide">${langDict.conditionStatus}</span></div>
                                        <p class="text-sm sm:text-base font-bold leading-relaxed text-slate-100">${langDict.monsterKillCondition}</p>
                                        <p class="mt-2 text-[10px] font-bold tracking-wider text-violet-300/75">${langDict.noFixedTime}</p>
                                   </div>`
                                : usesMirageCycleLayout
                                ? (isActive
                                    ? `<div class="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent px-4 py-3 shadow-sm shadow-emerald-950/20">
                                            <div class="flex min-w-0 items-center gap-2.5">
                                                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i></span>
                                                <span class="active-duration-label text-xs sm:text-sm font-semibold tracking-wide text-emerald-100/80">${langDict.durationActive}</span>
                                            </div>
                                            <span class="active-duration-value shrink-0 text-base sm:text-lg font-black tracking-wide text-emerald-200">${formatActiveDuration(evt.durationMin)}</span>
                                       </div>`
                                    : (currentTab === 'ALL'
                                        ? `<div class="text-xs text-slate-400 font-medium">${langDict.nextSpawn}</div>
                                           <div class="timer-number text-2xl font-black text-white tracking-wide mt-0.5">${evt.state.displayTime}</div>
                                           <div class="text-xs text-slate-400 mt-2">${langDict.durationActive} <span class="text-slate-200 font-bold">${formatActiveDuration(evt.durationMin)}</span></div>`
                                        : '') )
                                : (isActive && currentTab !== 'ALL'
                                    ? `<div class="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent px-4 py-3 shadow-sm shadow-emerald-950/20">
                                            <div class="flex min-w-0 items-center gap-2.5">
                                                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i></span>
                                                <span class="active-duration-label text-xs sm:text-sm font-semibold tracking-wide text-emerald-100/80">${langDict.durationActive}</span>
                                            </div>
                                            <span class="active-duration-value shrink-0 text-base sm:text-lg font-black tracking-wide text-emerald-200">${formatActiveDuration(evt.durationMin)}</span>
                                       </div>`
                                    : `<div class="text-xs text-slate-400 font-medium">${langDict.nextOpening}</div>
                                       <div class="timer-number text-2xl font-black text-white tracking-wide mt-0.5">${evt.state.displayTime}</div>
                                       <div class="text-xs text-slate-400 mt-2">${langDict.durationActive} <span class="text-slate-200 font-bold">${formatActiveDuration(evt.durationMin)}</span></div>`)}
                        </div>
                        ${usesMirageCycleLayout && !isConditionOnly ? `
                            <section class="mirage-cycle-panel" aria-label="${langDict.mirageSchedule}">
                                <div class="mirage-cycle-grid" aria-label="${langDict.mirageSchedule}">
                                    ${cycleSchedule.map(([hour, minute]) => {
                                        const upcoming = evt.state.upcomingInstances[0];
                                        // En tarjetas W1 individuales, resaltar la aparición en curso;
                                        // al terminar, volver a resaltar la siguiente aparición. TODAS no cambia.
                                        const isNext = isActive
                                            ? evt.state.startH === hour && evt.state.startM === minute
                                            : upcoming && upcoming.startH === hour && upcoming.startM === minute;
                                        return `<div class="mirage-cycle-row ${isNext ? 'is-next' : ''}"><span class="mirage-cycle-time">${formatScheduleChipTime(hour, minute)}</span></div>`;
                                    }).join('')}
                                </div>
                            </section>
                            <div class="mirage-next-spawn" aria-label="${langDict.nextSpawn}">
                                <div class="mirage-next-spawn-cell">
                                    <span class="mirage-next-spawn-label">${cycleIntervalTitle}</span>
                                    <span class="mirage-next-spawn-value">${cycleIntervalLabel}</span>
                                </div>
                                <div class="mirage-next-spawn-cell">
                                    <span class="mirage-next-spawn-label">${isActive ? langDict.closesIn : langDict.bossAppearsIn}</span>
                                    <span class="mirage-next-spawn-value">${formatDurationDHMS(evt.state.remainingSec)}</span>
                                </div>
                            </div>` : ''}
                    </div>

                    <!-- Existing cards keep their original footer. W1 individual cards show their only countdown in the boss appearance panel. -->
                    ${usesMirageCycleLayout || isConditionOnly ? '' : `
                    <div class="event-card-content mt-4 pt-3 border-t border-brand-border/50">
                        <div class="flex items-center justify-between text-xs font-orbitron">
                            <span class="text-slate-400 font-bold">${isActive ? langDict.closesIn : langDict.opensIn}</span>
                            <span class="countdown-number font-black text-sm ${isActive ? 'text-emerald-400' : 'text-amber-400'}">${formatDurationDHMS(evt.state.remainingSec)}</span>
                        </div>
                        <div class="timer-progress-track ${!isActive ? 'waiting-track' : ''} mt-3 h-2 w-full overflow-hidden rounded-full ${isActive ? 'bg-slate-800/90 border border-slate-700/60' : 'border'}" role="progressbar" aria-label="Progreso del temporizador" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressPercent)}">
                            <div class="timer-progress-fill h-full rounded-full ${!isActive ? 'waiting-fill' : ''}" style="width: ${progressPercent}%; ${isActive ? `background: linear-gradient(90deg, ${previousProgressColor} 0%, ${progressColor} 100%); box-shadow: 0 0 9px ${progressColor.replace('rgb(', 'rgba(').replace(')', ', .30)')};` : ''}"></div>
                        </div>
                    </div>`}
                </div>
                ${currentTab !== 'ALL' && !usesMirageCycleLayout ? `
                    ${evt.state.upcomingInstances.filter(instance => isActive || instance.displayTime !== evt.state.displayTime).map((instance, instanceIndex) => {
                        const upcomingProgress = Math.round((instance.waitingProgress || 0) * 100);
                        const instanceBellOn = isOccurrenceBellOn(evt.id, instance.startH, instance.startM);
                        const instanceLabel = `${localizedTitle} · ${instanceIndex + 1}`;
                        return `
                        <article class="event-card upcoming-cycle-card cursor-pointer bg-brand-card/90 border border-brand-border/80 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between min-w-0" aria-label="${instanceLabel}" onclick="toggleCardBell('${evt.id}', ${instance.startH}, ${instance.startM}, event)" title="${langDict.bellTitle}">
                            <i class="event-watermark fa-solid ${evt.icon}" aria-hidden="true"></i>
                            <div class="event-card-content">
                                <div class="event-card-header event-card-title-header">
                                    <span class="event-title inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border" data-title-color="${evt.color || 'amber'}" style="${getBossIconGradientStyle(evt.id)}" title="${localizedTitle.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;')}">
                                        <i class="fa-solid ${evt.badgeIcon || evt.icon} boss-title-icon" style="${getBossIconGradientStyle(evt.id)}" aria-hidden="true"></i><span class="event-title-text">${localizedTitle}</span>
                                    </span>
                                </div>
                                <div class="event-card-status-row mb-3">
                                    <div class="event-card-status-controls flex items-center gap-2">
                                        <button type="button" onclick="toggleCardBell('${evt.id}', ${instance.startH}, ${instance.startM}, event)" title="${langDict.bellTitle}" aria-label="${langDict.bellTitle}" class="alert-bell-button p-1.5 rounded-lg border border-brand-border/60 bg-brand-dark/60 text-slate-400"><i style="--loop-offset: ${loopOffset}" class="fa-solid fa-bell text-sm ${instanceBellOn ? 'bell-active bell-waiting-pulse' : 'bell-off opacity-40'}"></i></button>
                                        <span class="text-[11px] font-orbitron font-bold px-2.5 py-1 rounded-lg bg-brand-dark/80 text-slate-400 border border-brand-border"><span class="waiting-dots" style="--loop-offset: ${loopOffset}">${langDict.statusWaiting}</span></span>
                                    </div>
                                </div>
                                <div class="mt-4 mb-2">
                                    <div class="text-xs text-slate-400 font-medium">${langDict.nextOpening}</div>
                                    <div class="timer-number text-2xl font-black text-white tracking-wide mt-0.5">${instance.displayTime}</div>
                                    <div class="text-xs text-slate-400 mt-1">${langDict.durationActive} <span class="text-slate-200 font-bold">${formatActiveDuration(evt.durationMin)}</span></div>
                                </div>
                            </div>
                            <div class="event-card-content mt-4 pt-3 border-t border-brand-border/50">
                                <div class="flex items-center justify-between text-xs font-orbitron">
                                    <span class="text-slate-400 font-bold">${langDict.opensIn}</span>
                                    <span class="countdown-number font-black text-sm text-amber-400 tabular-nums">${formatDurationDHMS(instance.remainingSec)}</span>
                                </div>
                                <div class="timer-progress-track waiting-track mt-3 h-2 w-full overflow-hidden rounded-full border" role="progressbar" aria-label="${langDict.statusWaiting}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${upcomingProgress}">
                                    <div class="timer-progress-fill waiting-fill h-full rounded-full" style="width: ${upcomingProgress}%"></div>
                                </div>
                            </div>
                        </article>`;
                    }).join('')}
                ` : ''}
                `;
            }).join('');
            renderAllEventsPagination(totalFilteredEvents);

        }

        // Side controls are available only in ALL. The timer engine still processes every event;
        // only the selected fifteen-card slice is inserted into the DOM.
        function renderAllEventsPagination(totalEvents) {
            const shell = document.getElementById('events-grid-shell');
            const status = document.getElementById('all-events-page-status');
            const previous = document.getElementById('all-events-prev');
            const next = document.getElementById('all-events-next');
            if (!shell || !status || !previous || !next) return;

            const pageCount = Math.max(1, Math.ceil(totalEvents / ALL_EVENTS_PAGE_SIZE));
            allEventsPage = Math.max(0, Math.min(allEventsPage, pageCount - 1));
            const isAllDashboard = currentTab === 'ALL';
            const shouldShow = isAllDashboard && pageCount > 1;
            const eventsMain = shell.closest('.events-main');
            if (eventsMain) eventsMain.classList.toggle('is-all-dashboard', isAllDashboard);
            shell.classList.toggle('is-all-paged', shouldShow);
            status.classList.toggle('hidden', !shouldShow);
            previous.classList.toggle('hidden', !shouldShow);
            next.classList.toggle('hidden', !shouldShow);

            if (!shouldShow) return;

            const start = allEventsPage * ALL_EVENTS_PAGE_SIZE + 1;
            const end = Math.min(totalEvents, start + ALL_EVENTS_PAGE_SIZE - 1);
            const translations = {
                es: { showing: `MOSTRANDO ${start}–${end} DE ${totalEvents} · PÁGINA ${allEventsPage + 1} DE ${pageCount}`, previous: 'Página anterior', next: 'Página siguiente' },
                pt: { showing: `MOSTRANDO ${start}–${end} DE ${totalEvents} · PÁGINA ${allEventsPage + 1} DE ${pageCount}`, previous: 'Página anterior', next: 'Página siguiente' },
                en: { showing: `SHOWING ${start}–${end} OF ${totalEvents} · PAGE ${allEventsPage + 1} OF ${pageCount}`, previous: 'Previous page', next: 'Next page' }
            };
            const labels = translations[currentLang] || translations.es;
            status.textContent = labels.showing;
            previous.disabled = allEventsPage <= 0;
            next.disabled = allEventsPage >= pageCount - 1;
            previous.setAttribute('aria-label', labels.previous);
            previous.title = labels.previous;
            next.setAttribute('aria-label', labels.next);
            next.title = labels.next;
        }

        function navigateAllEventsPage(delta) {
            if (currentTab !== 'ALL') return;
            const step = Number(delta);
            if (!Number.isInteger(step) || step === 0) return;
            setAllEventsPage(allEventsPage + step);
        }

        function setAllEventsPage(pageIndex) {
            if (currentTab !== 'ALL') return;
            const requestedPage = Number(pageIndex);
            if (!Number.isInteger(requestedPage) || requestedPage < 0) return;
            const totalPages = Math.max(1, Math.ceil(EVENT_DEFINITIONS.length / ALL_EVENTS_PAGE_SIZE));
            const targetPage = Math.max(0, Math.min(requestedPage, totalPages - 1));
            if (targetPage === allEventsPage) return;

            const grid = document.getElementById('events-grid');
            const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const enteringClass = targetPage > allEventsPage ? 'all-page-enter-from-next' : 'all-page-enter-from-previous';
            if (grid && motionAllowed) {
                grid.classList.remove('all-page-enter-from-next', 'all-page-enter-from-previous');
                grid.classList.add(enteringClass);
                // Ensure the off-canvas starting position is committed before replacing the cards.
                void grid.offsetWidth;
            }

            allEventsPage = targetPage;
            updateDashboard();

            if (grid && motionAllowed) {
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    grid.classList.remove('all-page-enter-from-next', 'all-page-enter-from-previous');
                }));
            }
        }

        // NAVIGATION AND REUSABLE OUTSIDE-CLICK CLOSING
        const NAV_MENU_IDS = ['nav-menu-mirage-ship', 'nav-menu-mirage-plano1', 'nav-menu-mirage-plano3', 'nav-menu-domination', 'nav-menu-ms-p11p12', 'nav-menu-ms-sp', 'nav-menu-world-boss', 'nav-menu-other-content'];
        function closeDropdownMenus(exceptId = null) {
            ['lang-menu', 'server-menu', ...NAV_MENU_IDS].forEach(id => {
                if (id === exceptId) return;
                const menu = document.getElementById(id);
                if (menu) menu.classList.add('hidden');
            });
            ['lang-select', 'server-select', 'nav-trigger-mirage-ship', 'nav-trigger-mirage-plano1', 'nav-trigger-mirage-plano3', 'nav-trigger-domination', 'nav-trigger-ms-p11p12', 'nav-trigger-ms-sp', 'nav-trigger-world-boss', 'nav-trigger-other-content'].forEach(id => {
                const button = document.getElementById(id);
                if (!button) return;
                const menuId = id === 'lang-select' ? 'lang-menu' : id === 'server-select' ? 'server-menu' : id.replace('nav-trigger-', 'nav-menu-');
                const menu = document.getElementById(menuId);
                button.setAttribute('aria-expanded', String(!!menu && !menu.classList.contains('hidden')));
            });
        }
        function toggleNavMenu(menuId) {
            const menu = document.getElementById(menuId);
            if (!menu) return;
            const willOpen = menu.classList.contains('hidden');
            const nestedMirageMenus = ['nav-menu-mirage-plano1', 'nav-menu-mirage-plano3'];
            const isNested = nestedMirageMenus.includes(menuId);
            if (isNested) {
                // A Plano submenu expands inside MIRAGE SHIP; only one Plano submenu stays open at a time.
                const parentMenu = document.getElementById('nav-menu-mirage-ship');
                if (parentMenu) parentMenu.classList.remove('hidden');
                nestedMirageMenus.forEach(id => {
                    const nested = document.getElementById(id);
                    if (nested) nested.classList.toggle('hidden', id !== menuId || !willOpen);
                    const nestedTrigger = nested && nested.previousElementSibling;
                    if (nestedTrigger) nestedTrigger.setAttribute('aria-expanded', String(id === menuId && willOpen));
                });
                const shipTrigger = document.getElementById('nav-trigger-mirage-ship');
                if (shipTrigger) shipTrigger.setAttribute('aria-expanded', 'true');
            } else {
                closeDropdownMenus(willOpen ? menuId : null);
                menu.classList.toggle('hidden', !willOpen);
            }
            const triggerId = isNested ? null : menuId.replace('nav-menu-', 'nav-trigger-');
            const trigger = triggerId ? document.getElementById(triggerId) : menu.previousElementSibling;
            if (trigger) trigger.setAttribute('aria-expanded', String(willOpen));
        }
        function chooseNavTab(tabName, menuId) {
            setTab(tabName);
            closeDropdownMenus();
        }
        document.addEventListener('click', (event) => {
            const insidePicker = event.target.closest('#language-picker, #server-picker, .nav-group');
            if (!insidePicker) closeDropdownMenus();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeDropdownMenus();
        });

        function setTab(tabName, refreshDashboard = true) {
            currentTab = VALID_TABS.includes(tabName) ? tabName : 'ALL';
            // Selecting ALL from navigation starts at page one; pagination controls change pages directly.
            if (currentTab === 'ALL') allEventsPage = 0;
            appStorage.setItem(STORAGE_ACTIVE_TAB, currentTab);
            tabName = currentTab;
            const baseInactive = "tab-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-card/80 border border-brand-border/80 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200 whitespace-nowrap";
            const baseActive = "tab-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 transition-all duration-200 whitespace-nowrap";
            document.querySelectorAll('.tab-btn').forEach(btn => btn.className = baseInactive);
            const activeBtn = document.getElementById(`tab-${tabName}`);
            if (activeBtn) activeBtn.className = baseActive;
            document.querySelectorAll('.nav-submenu-option').forEach(btn => btn.setAttribute('aria-current', btn.dataset.tab === tabName ? 'page' : 'false'));
            const groupMap = {
                FRENESI: 'nav-trigger-ms-p11p12', FURIA: 'nav-trigger-ms-p11p12',
                LIDERES: 'nav-trigger-ms-sp', CIMA: 'nav-trigger-ms-sp',
                WB_VALLES: 'nav-trigger-world-boss', WB_LABERINTOS: 'nav-trigger-world-boss',
                PURGATORIO: 'nav-trigger-other-content', ORATORIO: 'nav-trigger-other-content',
                TORRE: 'nav-trigger-domination', W1: 'nav-trigger-mirage-ship', W2: 'nav-trigger-mirage-ship', W3: 'nav-trigger-mirage-ship',
                P3_W1: 'nav-trigger-mirage-ship', P3_W2: 'nav-trigger-mirage-ship', P3_W3: 'nav-trigger-mirage-ship', P3_W4: 'nav-trigger-mirage-ship', P3_W5: 'nav-trigger-mirage-ship', P3_W6: 'nav-trigger-mirage-ship', P3_W7: 'nav-trigger-mirage-ship', P3_W8: 'nav-trigger-mirage-ship'
            };
            document.querySelectorAll('.nav-group-trigger').forEach(btn => btn.classList.toggle('group-active', btn.id === groupMap[tabName]));
            if (refreshDashboard) updateDashboard();
        }

        // Custom language picker uses real flag images (avoids emoji flag letters on Windows).
        function toggleLanguageMenu() {
            const menu = document.getElementById('lang-menu');
            const button = document.getElementById('lang-select');
            const willOpen = menu.classList.contains('hidden');
            closeDropdownMenus(willOpen ? 'lang-menu' : null);
            menu.classList.toggle('hidden', !willOpen);
            button.setAttribute('aria-expanded', String(willOpen));
        }

        function renderLanguagePicker() {
            const options = {
                es: { label: 'Español', flag: 've' },
                pt: { label: 'Português', flag: 'br' },
                en: { label: 'English', flag: 'us' }
            };
            const option = options[currentLang] || options.es;
            document.getElementById('lang-label').textContent = option.label;
            document.getElementById('lang-flag').src = `https://flagcdn.com/w40/${option.flag}.png`;
            document.getElementById('lang-menu').classList.add('hidden');
            document.getElementById('lang-select').setAttribute('aria-expanded', 'false');
        }

        const ABOUT_I18N = {
          es: {
            home:"INICIO", aboutNav:"SOBRE MÍ", eyebrow:"GUÍA DEL PROYECTO", communityTag:"HECHO PARA LA COMUNIDAD", title:"TIMERS | Mir4VE · Comunidad DarkOmens",
            lead:"Sigue los eventos de MIR4 Global desde un solo lugar: consulta horarios, revisa cuentas regresivas y configura alertas en una página adaptada a ordenador y móvil.",
            highlightTimers:"HORARIOS A SIMPLE VISTA", highlightAlerts:"AVISOS PARA NO PERDERTE NADA", highlightResponsive:"ORDENADOR Y MÓVIL", featuresEyebrow:"EXPLORA LA PLATAFORMA", featuresTitle:"Todo lo que puedes hacer",
            scheduleTitle:"Horarios y temporizadores", schedule:"Consulta los distintos contadores de eventos con estados, cuentas regresivas y barras de progreso. Filtra por categorías para encontrar rápidamente lo que buscas.",
            alertsTitle:"Alertas sonoras", alerts:"Activa las alertas generales o selecciona avisos individuales. Recibe señales sonoras cuando se acerca un evento y detén el sonido desde la notificación. El navegador puede requerir una interacción previa para habilitar el audio.",
            regionsTitle:"Región e idioma", regions:"Elige la región del servidor para adaptar los horarios y cambia entre español, português e inglés desde el selector de idioma.",
            locastoreTitle:"Preferencias guardadas", locastore:"Tus preferencias de idioma, región, formato horario, vista y alertas se guardan en el navegador. Si borras sus datos o cambias de dispositivo, quizá debas configurarlas de nuevo.",
            presenceTitle:"Comunidad en línea", presence:"Muestra una estimación de las conexiones activas a la página, no de los jugadores dentro de MIR4. Es una cifra orientativa basada en IP públicas y no identifica dispositivos con total precisión.",
            useTitle:"Una navegación sencilla", use:"Explora las categorías mediante los botones y submenús, ajusta tus preferencias y disfruta de una interfaz adaptada a pantallas grandes y pequeñas.",
            roadmapEyebrow:"EVOLUCIÓN CONTINUA", roadmapTitle:"Lo que puede venir después", roadmapLead:"El proyecto sigue en BETA y puede mejorar con el uso y las ideas de la comunidad. Estas son posibilidades, no funciones confirmadas ni fechas de lanzamiento.",
            roadmapOneTitle:"Más comodidad", roadmapOne:"Afinar la navegación y la experiencia en móviles.", roadmapTwoTitle:"Información más clara", roadmapTwo:"Hacer más claros los horarios y la información útil.", roadmapThreeTitle:"Ideas de la comunidad", roadmapThree:"Escuchar sugerencias y priorizar mejoras útiles.", roadmapNote:"La evolución dependerá de la viabilidad técnica y las necesidades de la comunidad.",
            fanEyebrow:"DE FANS PARA FANS", fanTitle:"Un proyecto de la comunidad DarkOmens", fan:"TIMERS | Mir4VE es una herramienta independiente de la comunidad DarkOmens, creada para facilitar el seguimiento de eventos de MIR4 Global en ordenador y móvil.",
            feedback:"¿Tienes una sugerencia o encontraste algo que corregir? Escríbeme por Instagram y ayuda a mejorar la plataforma.",
            instagram:"ESCRIBIR POR INSTAGRAM", back:"VOLVER A LOS TEMPORIZADORES", disclaimer:"Proyecto de fans no oficial. No está afiliado ni respaldado por Wemade o el equipo oficial de MIR4. Los horarios y funciones deben comprobarse según la información disponible y la región seleccionada."
          },
          pt: {
            home:"INÍCIO", aboutNav:"SOBRE", eyebrow:"GUIA DO PROJETO", communityTag:"FEITO PARA A COMUNIDADE", title:"TIMERS | Mir4VE · Comunidade DarkOmens",
            lead:"Acompanhe os eventos de MIR4 Global em um só lugar: consulte horários, contagens regressivas e alertas em uma página adaptada para computador e celular.",
            highlightTimers:"HORÁRIOS NUM RELANCE", highlightAlerts:"AVISOS PARA NÃO PERDER NADA", highlightResponsive:"COMPUTADOR E CELULAR", featuresEyebrow:"EXPLORE A PLATAFORMA", featuresTitle:"Tudo o que você pode fazer",
            scheduleTitle:"Horários e temporizadores", schedule:"Consulte os diferentes temporizadores de eventos, com estados, contagens regressivas e barras de progresso. Filtre por categoria para encontrar rapidamente o que procura.",
            alertsTitle:"Alertas sonoros", alerts:"Ative os alertas gerais ou escolha avisos individuais. Receba sinais sonoros quando um evento estiver próximo e pare o som pela notificação. O navegador pode exigir uma interação para liberar o áudio.",
            regionsTitle:"Região e idioma", regions:"Escolha a região do servidor para ajustar os horários e alterne entre português, espanhol e inglês no seletor de idioma.",
            locastoreTitle:"Preferências salvas", locastore:"Suas preferências de idioma, região, formato de hora, visualização e alertas ficam salvas no navegador. Se apagar os dados ou trocar de dispositivo, talvez precise configurá-las novamente.",
            presenceTitle:"Comunidade online", presence:"Exibe uma estimativa das conexões ativas à página, não dos jogadores dentro de MIR4. É um número aproximado baseado em IPs públicos e não identifica dispositivos com total precisão.",
            useTitle:"Navegação simples", use:"Explore as categorias pelos botões e submenus, ajuste suas preferências e use a interface adaptada a telas grandes e pequenas.",
            roadmapEyebrow:"EVOLUÇÃO CONTÍNUA", roadmapTitle:"O que pode vir depois", roadmapLead:"O projeto continua em BETA e pode melhorar com o uso e as ideias da comunidade. Estas são possibilidades, não recursos confirmados nem datas de lançamento.",
            roadmapOneTitle:"Mais praticidade", roadmapOne:"Aprimorar a navegação e a experiência em celulares.", roadmapTwoTitle:"Informações mais claras", roadmapTwo:"Deixar horários e informações úteis mais claros.", roadmapThreeTitle:"Ideias da comunidade", roadmapThree:"Ouvir sugestões e priorizar melhorias úteis.", roadmapNote:"A evolução dependerá da viabilidade técnica e das necessidades da comunidade.",
            fanEyebrow:"FEITO POR FÃS, PARA FÃS", fanTitle:"Um projeto da comunidade DarkOmens", fan:"TIMERS | Mir4VE é uma ferramenta independente da comunidade DarkOmens, criada para facilitar o acompanhamento dos eventos de MIR4 Global no computador e no celular.",
            feedback:"Tem uma sugestão ou encontrou algo para corrigir? Escreva pelo Instagram e ajude a melhorar a plataforma.",
            instagram:"FALAR PELO INSTAGRAM", back:"VOLTAR AOS TEMPORIZADORES", disclaimer:"Projeto de fãs não oficial. Não é afiliado nem endossado pela Wemade ou pela equipe oficial de MIR4. Horários e recursos devem ser conferidos conforme as informações disponíveis e a região selecionada."
          },
          en: {
            home:"HOME", aboutNav:"ABOUT", eyebrow:"PROJECT GUIDE", communityTag:"BUILT FOR THE COMMUNITY", title:"TIMERS | Mir4VE · DarkOmens Community",
            lead:"Follow MIR4 Global events in one place. Check schedules, countdowns, and alerts through a page designed for both desktop and mobile.",
            highlightTimers:"SCHEDULES AT A GLANCE", highlightAlerts:"ALERTS TO HELP YOU KEEP TRACK", highlightResponsive:"DESKTOP AND MOBILE", featuresEyebrow:"EXPLORE THE PLATFORM", featuresTitle:"What you can do",
            scheduleTitle:"Schedules and timers", schedule:"Track the different event timers with status indicators, countdowns, and progress bars. Filter by category to find what you need quickly.",
            alertsTitle:"Sound alerts", alerts:"Enable general or individual alerts. Get sound notifications as an event approaches and stop the sound from the on-screen notice. Your browser may require an interaction to enable audio.",
            regionsTitle:"Region and language", regions:"Choose a server region to adjust displayed schedules, and switch between English, Spanish, and Portuguese in the language menu.",
            locastoreTitle:"Saved preferences", locastore:"Your language, region, time format, view, and alert preferences are saved in your browser. Clearing site data or changing devices may require setting them up again.",
            presenceTitle:"Community online", presence:"Shows an estimate of active connections to this page, not players inside MIR4. It is an approximate count based on public IPs and cannot identify devices with complete accuracy.",
            useTitle:"Easy navigation", use:"Explore categories through the buttons and submenus, adjust your preferences, and enjoy an interface adapted to large and small screens.",
            roadmapEyebrow:"CONTINUOUS IMPROVEMENT", roadmapTitle:"What may come next", roadmapLead:"The project is still in BETA and may evolve through use and community ideas. These are possibilities, not confirmed features or release dates.",
            roadmapOneTitle:"More convenience", roadmapOne:"Refine navigation and the mobile experience.", roadmapTwoTitle:"Clearer information", roadmapTwo:"Make schedules and useful information clearer.", roadmapThreeTitle:"Community ideas", roadmapThree:"Listen to feedback and prioritize useful improvements.", roadmapNote:"Future changes depend on technical feasibility and community needs.",
            fanEyebrow:"MADE BY FANS, FOR FANS", fanTitle:"A DarkOmens community project", fan:"TIMERS | Mir4VE is an independent DarkOmens community tool designed to make tracking MIR4 Global events easier on desktop and mobile.",
            feedback:"Have a suggestion or spotted something to fix? Message me on Instagram and help improve the platform.",
            instagram:"MESSAGE ON INSTAGRAM", back:"BACK TO TIMERS", disclaimer:"Unofficial fan project. Not affiliated with or endorsed by Wemade or the official MIR4 team. Schedules and features should be checked against available information and the selected region."
          }
        };

        function renderAboutLanguage() {
            const t = ABOUT_I18N[currentLang] || ABOUT_I18N.es;
            const fields = {
                'home-nav-label':'home', 'about-nav-label':'aboutNav', 'about-eyebrow':'eyebrow', 'about-community-tag':'communityTag',
                'about-title':'title', 'about-lead':'lead', 'about-highlight-timers':'highlightTimers', 'about-highlight-alerts':'highlightAlerts', 'about-highlight-responsive':'highlightResponsive',
                'about-features-eyebrow':'featuresEyebrow', 'about-features-title':'featuresTitle',
                'about-schedule-title':'scheduleTitle', 'about-schedule':'schedule', 'about-alerts-title':'alertsTitle', 'about-alerts':'alerts',
                'about-regions-title':'regionsTitle', 'about-regions':'regions', 'about-presence-title':'presenceTitle', 'about-presence':'presence',
                'about-locastore-title':'locastoreTitle', 'about-locastore':'locastore', 'about-use-title':'useTitle', 'about-use':'use',
                'about-roadmap-eyebrow':'roadmapEyebrow', 'about-roadmap-title':'roadmapTitle', 'about-roadmap-lead':'roadmapLead',
                'about-roadmap-one-title':'roadmapOneTitle', 'about-roadmap-one':'roadmapOne', 'about-roadmap-two-title':'roadmapTwoTitle', 'about-roadmap-two':'roadmapTwo',
                'about-roadmap-three-title':'roadmapThreeTitle', 'about-roadmap-three':'roadmapThree', 'about-roadmap-note':'roadmapNote',
                'about-fan-eyebrow':'fanEyebrow', 'about-fan-title':'fanTitle', 'about-fan':'fan', 'about-feedback':'feedback',
                'about-instagram':'instagram', 'about-back':'back', 'about-disclaimer':'disclaimer'
            };
            Object.entries(fields).forEach(([id,key]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = t[key];
            });
        }

        function showHomeView(shouldScroll = true) {
            appStorage.setItem(STORAGE_ACTIVE_VIEW, 'home');
            document.getElementById('about-view').classList.add('hidden');
            document.getElementById('home-view').classList.remove('hidden');
            document.getElementById('home-nav-btn').classList.add('ring-1','ring-amber-400/40');
            document.getElementById('about-nav-btn').classList.remove('ring-1','ring-violet-400/40');
            if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function showAboutView() {
            appStorage.setItem(STORAGE_ACTIVE_VIEW, 'about');
            document.getElementById('home-view').classList.add('hidden');
            document.getElementById('about-view').classList.remove('hidden');
            document.getElementById('about-nav-btn').classList.add('ring-1','ring-violet-400/40');
            document.getElementById('home-nav-btn').classList.remove('ring-1','ring-amber-400/40');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // LANGUAGE CHANGE HANDLER
        function changeLanguage(langKey) {
            currentLang = ['es', 'pt', 'en'].includes(langKey) ? langKey : 'es';
            appStorage.setItem(STORAGE_LANG, currentLang);
            renderLanguagePicker();
            closeDropdownMenus();
            const langDict = I18N[currentLang];

            document.getElementById('lbl-server-time').textContent = langDict.serverTime.replace('NA', currentServer);
            document.getElementById('lbl-online').textContent = langDict.online;
            document.getElementById('intro-community').textContent = langDict.introCommunity;
            document.getElementById('intro-description').textContent = langDict.introDescription;
            document.getElementById('intro-live-label').textContent = langDict.introLive;
            const volumeCaption = document.querySelector('.alert-volume-caption span');
            const triggerCaption = document.querySelector('.alert-trigger-caption span');
            if (volumeCaption) volumeCaption.textContent = langDict.alertVolumeLabel;
            if (triggerCaption) triggerCaption.textContent = langDict.alertTriggerLabel;
            const volumePanel = document.querySelector('.alert-volume-compact');
            const triggerPanel = document.querySelector('.alert-trigger-compact');
            const volumeGroup = document.getElementById('alert-volume-buttons');
            const triggerGroup = document.getElementById('alert-trigger-buttons');
            if (volumePanel) volumePanel.setAttribute('aria-label', langDict.alertVolumeLabel);
            if (triggerPanel) triggerPanel.setAttribute('aria-label', langDict.alertTriggerLabel);
            if (volumeGroup) volumeGroup.setAttribute('aria-label', langDict.alertVolumeLabel);
            if (triggerGroup) triggerGroup.setAttribute('aria-label', langDict.alertTriggerLabel);
            document.querySelectorAll('[data-nav-label]').forEach(label => {
                const key = label.dataset.navLabel;
                if (langDict.navGroups && langDict.navGroups[key]) label.textContent = langDict.navGroups[key];
            });
            const mirageLayerLabel = document.querySelector('[data-i18n="mirageLayer1"]');
            if (mirageLayerLabel && langDict.mirageLayer1) mirageLayerLabel.textContent = langDict.mirageLayer1;
            const mirageLayer3Label = document.querySelector('[data-i18n="mirageLayer3"]');
            if (mirageLayer3Label && langDict.mirageLayer3) mirageLayer3Label.textContent = langDict.mirageLayer3;

            renderMasterAlertUI();

            Object.keys(langDict.tabs).forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if (btn) {
                    const label = btn.querySelector('.tab-label');
                    if (label) label.textContent = langDict.tabs[t];
                    else btn.textContent = langDict.tabs[t];
                }
            });
            document.querySelectorAll('.submenu-label[data-tab-label]').forEach(label => {
                const key = label.dataset.tabLabel;
                if (langDict.tabs[key]) label.textContent = formatDecoratedLabel(langDict.tabs[key]);
            });

            document.getElementById('toast-title').textContent = langDict.toastTitle;
            document.getElementById('toast-sub').textContent = langDict.toastSub;
            document.getElementById('sponsor-label').textContent = langDict.sponsor;
            document.querySelector('#alarm-toast button').textContent = langDict.stop;
            document.getElementById('sponsor-btn').setAttribute('aria-label', langDict.sponsor + ': NDS Beatsong YouTube channel');
            renderAboutLanguage();

            updateDashboard();
            document.documentElement.lang = currentLang;
            document.dispatchEvent(new CustomEvent('mir4ve:languagechange', {
                detail: { language: currentLang }
            }));
        }

        // LIVE PRESENCE COUNTER (Firebase Realtime Database)
        // Counts unique public IP addresses. Each IP can hold multiple live connections,
        // so closing one tab does not remove the IP while another tab/browser remains online.
        // The public IP is hashed before it is used as a Firebase path/key.
        const FIREBASE_CONFIG = {
            apiKey: "AIzaSyBhl6bezWHzjYnTozBkxcJEG6Bcv7eQqyE",
            authDomain: "darkomens-official.firebaseapp.com",
            databaseURL: "https://darkomens-official-default-rtdb.firebaseio.com",
            projectId: "darkomens-official",
            appId: "1:644381288660:web:33af904565c1cba3a3f341",
            messagingSenderId: "644381288660",
            measurementId: "G-4S6YN7R1MG"
        };

        async function getPublicIpHash() {
            // The IP lookup provider sees the visitor's public IP. Only its SHA-256 hash
            // is stored as a Firebase key; the raw IP is not written to the database.
            const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error('No se pudo consultar la IP pública.');
            const data = await response.json();
            const ip = String(data.ip || '').trim();
            // Accept only plausible IPv4/IPv6 characters; never create a presence key from an empty/bad response.
            if (!ip || !/^[0-9a-fA-F:.]+$/.test(ip) || !ip.includes('.' ) && !ip.includes(':')) {
                throw new Error('El servicio no devolvió una IP pública válida.');
            }
            if (!window.crypto || !crypto.subtle || !window.TextEncoder) {
                throw new Error('Este navegador no permite calcular el hash de la IP.');
            }
            const bytes = new TextEncoder().encode(ip);
            const digest = await crypto.subtle.digest('SHA-256', bytes);
            return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        let spectatorCounterInitialized = false;
        function initSpectatorCounter() {
            if (spectatorCounterInitialized) return;
            const counter = document.getElementById('online-counter');
            if (!counter) return;

            const configured = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain &&
                FIREBASE_CONFIG.databaseURL && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId &&
                !Object.values(FIREBASE_CONFIG).some(value => String(value).includes('PASTE_'));

            if (!configured || !window.firebase) {
                counter.textContent = '—';
                counter.title = 'Contador pendiente de configurar: introduce la configuración de Firebase.';
                return;
            }

            try {
                if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
                spectatorCounterInitialized = true;
                const auth = firebase.auth();
                const db = firebase.database();
                const connectedRef = db.ref('.info/connected');
                const presenceRoot = db.ref('mir4-presence/na-server');
                let ipRef = null;
                let lastConnectionRef = null;
                let registeredUid = null;
                let registrationInProgress = false;
                let firebaseConnected = false;
                let presenceConnectionRegistered = false;
                let ipHashPromise = null;

                // Count each IP only once, regardless of tabs or different browsers.
                // An IP is online while at least one connection exists beneath its node.
                auth.signInAnonymously().then(credential => {
                    registeredUid = credential.user.uid;
                    ipHashPromise = getPublicIpHash().catch(error => { ipHashPromise = null; throw error; });
                    // The .info/connected callback can fire before anonymous auth finishes.
                    // Retry registration now that the UID is ready to avoid missing the first connection.
                    registerPresenceIfConnected();

                    // Realtime counter: subscribe to IP nodes and their connection lists separately.
                    // Firebase pushes changes immediately; this does not require a page refresh.
                    const activeIpNodes = new Map();
                    const ipConnectionListeners = new Map();
                    const renderOnlineCount = () => {
                        let uniqueIps = 0;
                        activeIpNodes.forEach(isOnline => { if (isOnline) uniqueIps++; });
                        counter.textContent = String(uniqueIps);
                        counter.title = 'Estimación en tiempo real por IP pública única. Pestañas, navegadores y dispositivos con la misma IP cuentan como 1; no identifica dispositivos físicos ni garantiza excluir todos los bots.';
                    };
                    const onIpAdded = ipSnapshot => {
                        const ipKey = ipSnapshot.key;
                        if (ipConnectionListeners.has(ipKey)) return;
                        const connectionsRef = ipSnapshot.ref.child('connections');
                        const onConnectionsChanged = connectionsSnapshot => {
                            const hasConnections = connectionsSnapshot.exists() && connectionsSnapshot.numChildren() > 0;
                            activeIpNodes.set(ipKey, hasConnections);
                            renderOnlineCount();

                            // Best-effort cleanup of empty IP nodes while at least one page is online.
                            // The transaction prevents deleting a node if another tab/device connects concurrently.
                            if (!hasConnections) {
                                ipSnapshot.ref.transaction(current => {
                                    if (current == null) return;
                                    const connections = current.connections;
                                    if (!connections || Object.keys(connections).length === 0) return null;
                                    return;
                                }).catch(error => console.warn('No se pudo limpiar un nodo de presencia vacío:', error));
                            }
                        };
                        ipConnectionListeners.set(ipKey, { ref: connectionsRef, handler: onConnectionsChanged });
                        connectionsRef.on('value', onConnectionsChanged, error => {
                            console.error('Error leyendo conexiones de IP:', error);
                            counter.title = 'Error leyendo conexiones activas. Revisa las reglas de Firebase.';
                        });
                    };
                    presenceRoot.on('child_added', onIpAdded, error => {
                        counter.textContent = '—';
                        counter.title = 'Firebase no permite leer el contador. Revisa las reglas de Realtime Database.';
                        console.error('Error leyendo presencia en tiempo real:', error);
                    });
                    presenceRoot.on('child_removed', ipSnapshot => {
                        const ipKey = ipSnapshot.key;
                        const listener = ipConnectionListeners.get(ipKey);
                        if (listener) listener.ref.off('value', listener.handler);
                        ipConnectionListeners.delete(ipKey);
                        activeIpNodes.delete(ipKey);
                        renderOnlineCount();
                    });

                    async function registerPresenceIfConnected() {
                        if (!firebaseConnected || !registeredUid || registrationInProgress || presenceConnectionRegistered) return;
                        registrationInProgress = true;
                        try {
                            const ipHash = await (ipHashPromise || (ipHashPromise = getPublicIpHash().catch(error => { ipHashPromise = null; throw error; })));
                            ipRef = presenceRoot.child(ipHash);
                            const connectionsRef = ipRef.child('connections');
                            const connectionRef = connectionsRef.push();
                            // Register disconnect cleanup before writing presence.
                            await connectionRef.onDisconnect().remove();
                            await connectionRef.set({
                                uid: registeredUid,
                                connectedAt: firebase.database.ServerValue.TIMESTAMP,
                                page: 'DarkOmens'
                            });
                            lastConnectionRef = connectionRef;
                            presenceConnectionRegistered = firebaseConnected;
                            counter.title = 'Presencia agrupada por IP pública: otras pestañas, navegadores o dispositivos con la misma IP no aumentan el contador.';
                        } catch (error) {
                            counter.title = 'No se pudo registrar la IP. Comprueba la conexión y las reglas de Firebase.';
                            console.error('No se pudo registrar la presencia por IP:', error);
                        } finally {
                            registrationInProgress = false;
                        }
                    }

                    connectedRef.on('value', snapshot => {
                        firebaseConnected = snapshot.val() === true;
                        if (!firebaseConnected) {
                            presenceConnectionRegistered = false;
                            lastConnectionRef = null;
                            return;
                        }
                        registerPresenceIfConnected();
                    });

                    // Remove this connection when the page closes; onDisconnect is the fallback.
                    window.addEventListener('pagehide', () => {
                        if (lastConnectionRef) lastConnectionRef.remove().catch(() => {});
                    }, { once: true });
                }).catch(error => {
                    counter.textContent = '—';
                    counter.title = 'Activa Authentication > Sign-in method > Anonymous en Firebase.';
                    console.error('Error de autenticación anónima Firebase:', error);
                });
            } catch (error) {
                counter.textContent = '—';
                counter.title = 'No se pudo iniciar el contador. Revisa la configuración de Firebase.';
                console.error('Error inicializando Firebase:', error);
            }
        }

        document.addEventListener('click', event => {
            const picker = document.getElementById('server-picker');
            if (picker && !picker.contains(event.target)) {
                document.getElementById('server-menu').classList.add('hidden');
                document.getElementById('server-select').setAttribute('aria-expanded', 'false');
            }
        });

        // Deliberately do not stop or suppress event alerts when the browser is minimized,
        // loses focus, or another browser tab is selected. The selected Global server is
        // the only scope that determines which event alerts this page instance can play.

        // INITIALIZATION ON LOAD
        window.onload = function() {
            loadAudioPreferences();
            renderLanguagePicker();
            renderMasterAlertUI();
            renderServerSelection();
            renderTimeFormatToggle();
            changeLanguage(currentLang);
            // Restore the user's last selected filter and view on reload.
            setTab(currentTab);
            if (appStorage.getItem(STORAGE_ACTIVE_VIEW) === 'about') showAboutView();
            else showHomeView();
            initSpectatorCounter();
            updateDashboard();
            setInterval(updateDashboard, 1000);
        };
