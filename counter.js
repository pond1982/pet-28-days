/* Visitor counter (free Abacus counting API, no sign-up).
   Counts one visit per browser session for the whole site, and shows the total in #visitCount.
   If the service is down, the line simply stays hidden. */
(function () {
  var el = document.getElementById('visitCount'), box = document.querySelector('.visits');
  if (!el || !box) return;
  var NS = 'pond1982-pet-28-days', KEY = 'visits';
  var counted = false;
  try { counted = sessionStorage.getItem('petVisitCounted') === '1'; } catch (e) {}
  var url = 'https://abacus.jasoncameron.dev/' + (counted ? 'get' : 'hit') + '/' + NS + '/' + KEY;
  var ctl = window.AbortController ? new AbortController() : null;
  if (ctl) setTimeout(function () { ctl.abort(); }, 6000);
  fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || typeof d.value !== 'number') return;
    if (!counted) { try { sessionStorage.setItem('petVisitCounted', '1'); } catch (e) {} }
    var target = d.value, start = Math.max(0, target - 40), t0 = null;
    box.classList.add('show');
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 900);
      el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3))).toLocaleString('th-TH');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }).catch(function () {});
})();
