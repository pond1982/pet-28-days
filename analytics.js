/* Extra GA4 events for pet-28-days (needs gtag from the page head)
   Events sent:
   - scroll_depth   {percent_scrolled: 25|50|75|100, team}
   - view_section   {section, team}          once per section per page view
   - faq_open       {faq_question, team}
   - cta_click      {cta_text, link_location, team}   any button-style link that is not a download
   - preview_scroll {team}                   the sample-pages strip was scrolled
   - mascot_hover   {team}                   home page team card hovered (desktop interest signal)
   - page_engaged_30s {team}                 still on the page after 30 seconds
*/
(function () {
  function send(name, params) {
    if (typeof gtag !== 'function') return;
    params = params || {};
    params.team = document.body.getAttribute('data-team') || 'home';
    gtag('event', name, params);
  }

  // Scroll depth 25/50/75/100
  var marks = [25, 50, 75, 100], hit = {};
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 100;
    marks.forEach(function (m) { if (!hit[m] && pct >= m - 1) { hit[m] = 1; send('scroll_depth', { percent_scrolled: m }); } });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Section views
  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, name = el.id || (el.className.match(/\b(hero|stats|cross|final|mascot|ty-hero|arena|both)\b/) || [])[1] || 'section';
        if (seen[name]) return; seen[name] = 1;
        send('view_section', { section: name });
        io.unobserve(el);
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('main section, .arena, .both, .ty-hero').forEach(function (s) { io.observe(s); });
  }

  // FAQ opens
  document.querySelectorAll('details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) send('faq_open', { faq_question: (d.querySelector('summary') || {}).textContent || '' });
    });
  });

  // Button-style link clicks (downloads, team switches and shares already have their own events)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.btn, a.btn-ghost, a.stay, .home-link a, a.brand');
    if (!a || a.classList.contains('dl') || a.hasAttribute('data-to') || a.classList.contains('dl-manual')) return;
    var sec = a.closest('section, header, footer');
    send('cta_click', { cta_text: a.textContent.trim().slice(0, 80), link_location: sec ? (sec.id || sec.tagName.toLowerCase()) : 'page' });
  }, true);

  // Sample-pages strip scrolled
  var strip = document.querySelector('.pages');
  if (strip) {
    var sent = false;
    strip.addEventListener('scroll', function () { if (!sent && strip.scrollLeft > 60) { sent = true; send('preview_scroll'); } }, { passive: true });
  }

  // Home page: which team card people hover first
  var hovered = false;
  document.querySelectorAll('.pick').forEach(function (c) {
    c.addEventListener('mouseenter', function () { if (!hovered) { hovered = true; send('mascot_hover', { hovered_team: c.getAttribute('data-team') }); } });
  });

  // Engaged 30 seconds
  setTimeout(function () { if (document.visibilityState === 'visible') send('page_engaged_30s'); }, 30000);
})();
