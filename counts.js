/* Shared, resilient access to the free Abacus counting API.
   - retries a failed or slow request up to 3 times (the free service sometimes answers 500 or stalls)
   - remembers the last value this browser saw, so numbers can be shown instantly and survive a bad moment
   window.PetCount.get(key) / .hit(key) -> Promise<number|null>
   window.PetCount.cached(key) -> number|null */
(function () {
  if (window.PetCount) return;
  var API = 'https://abacus.jasoncameron.dev', NS = 'pond1982-pet-28-days';

  function cached(key) {
    try { var v = localStorage.getItem('petCount_' + key); return v === null ? null : +v; } catch (e) { return null; }
  }
  function remember(key, v) { try { localStorage.setItem('petCount_' + key, String(v)); } catch (e) {} }

  function once(action, key) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 8000) : null;
    return fetch(API + '/' + action + '/' + NS + '/' + key, ctl ? { signal: ctl.signal, cache: 'no-store' } : { cache: 'no-store' })
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (r.status === 404) return { value: 0 };
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d || typeof d.value !== 'number') throw new Error('bad body');
        return d.value;
      });
  }

  function attempt(action, key, tries, delay) {
    return once(action, key).catch(function () {
      if (tries <= 1) return null;
      return new Promise(function (res) { setTimeout(res, delay); }).then(function () { return attempt(action, key, tries - 1, delay * 2); });
    });
  }

  function run(action, key) {
    return attempt(action, key, 3, 1200).then(function (v) {
      if (v !== null) {
        var old = cached(key);
        // never show a smaller number than this browser has already seen
        if (old !== null && v < old && action === 'get') v = old;
        remember(key, v);
      }
      return v;
    });
  }

  window.PetCount = {
    get: function (key) { return run('get', key); },
    hit: function (key) { return run('hit', key); },
    cached: cached
  };
})();
