/* Visitor counter: one visit per browser session for the whole site, shown in #visitCount.
   Uses counts.js (retries + remembers the last number). Shows the remembered number at once,
   then updates. Stays hidden only if it has never been able to get a number. */
(function () {
  var el = document.getElementById('visitCount'), box = document.querySelector('.visits');
  if (!el || !box || !window.PetCount) return;
  var KEY = 'visits';
  var fmt = function (n) { return n.toLocaleString('th-TH'); };

  function show(target, animate) {
    box.classList.add('show');
    var current = parseInt((el.textContent || '').replace(/[^\d]/g, ''), 10);
    var start = isNaN(current) ? Math.max(0, target - 40) : current;
    if (!animate || start === target) { el.textContent = fmt(target); return; }
    var i = 0, steps = 18;
    var iv = setInterval(function () {
      i++;
      el.textContent = fmt(Math.round(start + (target - start) * (1 - Math.pow(1 - i / steps, 3))));
      if (i >= steps) { clearInterval(iv); el.textContent = fmt(target); }
    }, 50);
  }

  var remembered = PetCount.cached(KEY);
  if (remembered !== null) show(remembered, false);

  var counted = false;
  try { counted = sessionStorage.getItem('petVisitCounted') === '1'; } catch (e) {}

  (counted ? PetCount.get(KEY) : PetCount.hit(KEY)).then(function (v) {
    if (v === null) return; // service unreachable: keep the remembered number; count again on the next page
    if (!counted) { try { sessionStorage.setItem('petVisitCounted', '1'); } catch (e) {} }
    show(v, true);
  });
})();
