/* HYDRA and DRACO pricing: retrieves and displays market chart prices. */
// HYDRA + DRACO only: WEMIX PLAY public price-chart endpoint.
    // Kept isolated from the EXDRA/PNIX and WEMIX/MEXC routines above.
    (function initHydraDracoLivePrices() {
      const REFRESH_INTERVAL = 60 * 1000;
      const MAX_AGE_MS = 15 * 60 * 1000;
      const tokens = [
        { symbol: 'HYDRA', id: 'hydra-price' },
        { symbol: 'DRACO', id: 'draco-price' }
      ];
      const format = value => new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }).format(value);
      const inFlight = new Set();

      function setPrice(token, text, title, stale = false) {
        const el = document.getElementById(token.id);
        if (!el) return;
        el.textContent = text;
        el.title = title;
        el.classList.remove('loading');
        el.dataset.stale = stale ? 'true' : 'false';
        delete el.dataset.reference;
      }

      async function refreshToken(token) {
        if (inFlight.has(token.symbol)) return;
        inFlight.add(token.symbol);
        const el = document.getElementById(token.id);
        if (el) el.classList.add('loading');
        try {
          const url = 'https://api.wemixplay.com/info/v2/price-chart?symbol=' +
            encodeURIComponent(token.symbol) + '&range=1d';
          const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'omit',
            headers: { 'Accept': 'application/json' }
          });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          const data = await response.json();
          if (!data || data.Result !== 0 || !data.data ||
              data.data.symbol !== token.symbol || !Array.isArray(data.data.chart) ||
              data.data.chart.length === 0) {
            throw new Error('Respuesta de WEMIX PLAY no válida');
          }
          const points = data.data.chart;
          const latest = points[points.length - 1];
          const price = Number(latest && latest.p);
          const timestamp = Number(latest && latest.t);
          if (!Number.isFinite(price) || price <= 0 ||
              !Number.isFinite(timestamp) || timestamp <= 0) {
            throw new Error('Último punto sin precio o timestamp válido');
          }
          const age = Date.now() - timestamp * 1000;
          const stale = age > MAX_AGE_MS || age < -5 * 60 * 1000;
          const updated = new Date(timestamp * 1000).toLocaleString();
          const snapshot = { price, timestamp, updatedAt: Date.now() };
          try { localStorage.setItem('mir4TokenMarket.' + token.symbol.toLowerCase() + '.v1', JSON.stringify(snapshot)); } catch (_) {}
          setPrice(token, '$' + format(price),
            'WEMIX PLAY · ' + token.symbol + ' · último dato: ' + updated +
            (stale ? ' · advertencia: el dato puede estar desactualizado' : ' · actualización automática cada 60 segundos'),
            stale);
        } catch (error) {
          console.warn('[HYDRA/DRACO live prices] ' + token.symbol + ' refresh failed:', error);
          const current = document.getElementById(token.id);
          if (current) {
            current.classList.remove('loading');
            current.dataset.stale = 'true';
            current.title = 'No se pudo actualizar desde WEMIX PLAY; el precio mostrado puede estar desactualizado.';
            if (current.dataset.reference === 'true') current.textContent = '—';
          }
        } finally {
          inFlight.delete(token.symbol);
        }
      }

      // Do not present the embedded reference prices as live while the first request runs.
      tokens.forEach(token => {
        try {
          const cached = JSON.parse(localStorage.getItem('mir4TokenMarket.' + token.symbol.toLowerCase() + '.v1') || 'null');
          if (cached && Number.isFinite(cached.price) && cached.price > 0 && cached.timestamp) {
            const el = document.getElementById(token.id);
            if (el) {
              el.textContent = '$' + format(cached.price);
              el.classList.remove('loading');
              el.dataset.stale = 'true';
              el.title = 'Dato guardado · ' + token.symbol + ' · última cotización recibida: ' + new Date(cached.timestamp * 1000).toLocaleString();
            }
          }
        } catch (_) {}
        const el = document.getElementById(token.id);
        if (el && el.dataset.reference === 'true' && el.dataset.stale !== 'true') {
          el.textContent = '—';
          el.title = 'Consultando cotización en WEMIX PLAY…';
        }
        refreshToken(token);
      });
      window.setInterval(() => tokens.forEach(refreshToken), REFRESH_INTERVAL);
    })();
