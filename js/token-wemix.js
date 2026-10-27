/* WEMIX token pricing: retrieves and displays the public market ticker. */
// WEMIX only: MEXC public ticker. This routine is intentionally isolated
      // from the existing EXDRA/PNIX refresh logic and does not touch HYDRA/DRACO.
      (function initWemixPriceOnly() {
        const id = 'wemix-price';
        const CACHE_KEY = 'mir4TokenMarket.wemix.v1';
        const target = 'https://api.mexc.com/api/v3/ticker/price?symbol=WEMIXUSDT';
        const urls = [
          'https://proxy.cors.dev/' + target,
          'https://corsproxy.io/?url=' + encodeURIComponent(target),
          'https://api.allorigins.win/raw?url=' + encodeURIComponent(target),
          target
        ];
        const format = value => new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4
        }).format(value);
        let requestInProgress = false;

        function setPrice(text, title = '') {
          const el = document.getElementById(id);
          if (!el) return;
          el.textContent = text;
          el.title = title;
          delete el.dataset.reference;
          el.classList.remove('loading');
        }

        async function readJson(url) {
          const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        }

        async function refreshWemix() {
          if (requestInProgress) return;
          requestInProgress = true;
          const el = document.getElementById(id);
          if (el) el.classList.add('loading');
          try {
            for (const url of urls) {
              try {
                const data = await readJson(url);
                const ticker = Array.isArray(data)
                  ? data.find(item => item && item.symbol === 'WEMIXUSDT')
                  : data;
                const price = Number(ticker && (ticker.price ?? ticker.lastPrice));
                if (!Number.isFinite(price) || price <= 0) throw new Error('Ticker sin precio válido');
                const snapshot = { price, updatedAt: Date.now() };
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot)); } catch (_) {}
                setPrice('$' + format(price), 'WEMIX/USDT · MEXC · actualizado: ' + new Date(snapshot.updatedAt).toLocaleString() + ' · próxima consulta en 60 s');
                const priceEl = document.getElementById(id);
                if (priceEl) priceEl.dataset.stale = 'false';
                return;
              } catch (error) {
                console.warn('[WEMIX only] Falló una fuente MEXC:', error.message);
              }
            }
            let cached = null;
            try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (_) {}
            if (cached && Number.isFinite(cached.price) && cached.price > 0 && cached.updatedAt) {
              setPrice('$' + format(cached.price), 'Sin conexión con MEXC · se conserva el último dato guardado: ' + new Date(cached.updatedAt).toLocaleString());
              const priceEl = document.getElementById(id);
              if (priceEl) priceEl.dataset.stale = 'true';
            } else {
              setPrice('—', 'No se pudo obtener el precio de MEXC y no hay datos guardados. Pulsa para abrir el mercado.');
            }
          } finally {
            requestInProgress = false;
          }
        }

        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
          if (cached && Number.isFinite(cached.price) && cached.price > 0 && cached.updatedAt) {
            setPrice('$' + format(cached.price), 'Dato guardado · WEMIX/USDT · última actualización correcta: ' + new Date(cached.updatedAt).toLocaleString());
            const priceEl = document.getElementById(id);
            if (priceEl) priceEl.dataset.stale = 'true';
          }
        } catch (_) {}
        refreshWemix();
        window.setInterval(refreshWemix, 60000);
      })();
