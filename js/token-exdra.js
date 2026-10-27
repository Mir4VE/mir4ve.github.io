/* EXDRA token pricing: retrieves and displays the token market price. */
// MIR4 Token Market. EXDRA prices come from the observed PNIX dex_getBillboard response.
      (function initMir4TokenMarket() {
        const CACHE_KEY = 'mir4TokenMarket.v1';
        const REFRESH_INTERVAL = 60 * 1000; // Revalidar cotizaciones PNIX cada 60 segundos.
        const pairToId = {
          '0xceacf0882412d27dc8be0679ee51e1faed1dbc21': 'exdra4-price',
          '0x535f65e66c353a417da9bbc3e249210622dd7fb7': 'exdra3-price',
          '0xbc01e61505121a7135544f138d4e010276483b8e': 'exdra2-price',
          '0x28deeae37f7b52579153d9be0bab2e347ceac414': 'exdra1-price'
        };
        const format = value => new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value);
        function show(id, text, title, stale = false, animateFresh = false) {
          const el = document.getElementById(id);
          if (!el) return;
          el.textContent = text;
          el.title = title || '';
          el.classList.remove('loading');
          el.dataset.stale = stale ? 'true' : 'false';
          if (animateFresh && !stale) {
            el.classList.remove('exdra-refresh-pulse');
            // Restart the animation even when the quoted price has not changed.
            void el.offsetWidth;
            el.classList.add('exdra-refresh-pulse');
          }
        }
        function renderCache(cache, stale) {
          if (!cache || !cache.prices) return;
          const when = cache.updatedAt ? new Date(cache.updatedAt).toLocaleString() : 'fecha desconocida';
          Object.entries(pairToId).forEach(([pair, id]) => {
            const item = cache.prices[pair];
            if (item && Number.isFinite(item.close) && item.close > 0) {
              show(id, format(item.close) + ' WEMIX', (stale ? 'Dato guardado; ' : 'PNIX · ') + 'última actualización correcta: ' + when, stale, !stale);
            }
          });
        }
        async function refreshPnix(force = false) {
          let cached = null;
          try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (_) {}
          if (cached) renderCache(cached, true);
          if (!force && cached && cached.updatedAt && Date.now() - cached.updatedAt < REFRESH_INTERVAL) return;
          try {
            const response = await fetch('https://mir4-router.pnix.exchange/dex', {
              method: 'POST', cache: 'no-store', credentials: 'omit',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'dex_getBillboard', params: [] })
            });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            if (!data || data.error || !Array.isArray(data.result)) throw new Error('Respuesta PNIX no válida');
            const prices = {};
            for (const item of data.result) {
              const pair = String(item.pair || '').toLowerCase();
              if (pairToId[pair] && Number.isFinite(item.close) && item.close > 0) prices[pair] = { close: item.close, time: item.time };
            }
            if (Object.keys(prices).length !== 4) throw new Error('PNIX no devolvió los cuatro mercados esperados');
            const fresh = { updatedAt: Date.now(), prices };
            localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
            renderCache(fresh, false);
          } catch (error) {
            console.warn('[Token Market] PNIX refresh failed:', error);
            if (cached) renderCache(cached, true);
            else Object.values(pairToId).forEach(id => show(id, '—', 'No se pudo obtener una cotización; no hay datos guardados.', true));
          }
        }
        // WEMIX/USD, HYDRA and DRACO use the existing display/reference markup.
        // Their reference values are not presented as verified live prices unless refreshed by a working source.
        refreshPnix();
        window.setInterval(() => refreshPnix(), REFRESH_INTERVAL); // Reintentar PNIX cada 60 segundos.
      })();
