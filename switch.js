/* Playful team-switch transition: ทีมหมา ⇄ ทีมแมว */
(function () {
  var root = document.currentScript && document.currentScript.src.replace(/switch\.js.*$/, '') || './';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TEAMS = {
    dog: { color1: '#FFE3D1', color2: '#F4A77F', ink: '#B84E2C', img: root + 'dog/assets/img/recall.webp', paw: '#E2714B' },
    cat: { color1: '#DDF1EE', color2: '#8CC9C1', ink: '#16605B', img: root + 'cat/assets/img/recall.webp', paw: '#1F7A74' }
  };
  var LINES = {
    'dog>cat': ['ย้ายไปทีมแมว... 🐱', 'ข้าวตัง: “ไปก็ได้... แต่อย่าลืมกลับมานะ” 🥺'],
    'cat>dog': ['ย้ายไปทีมหมา... 🐶', 'ส้มโอ: “ชิ… ไม่ได้สนใจสักหน่อย” 😾'],
    'home>dog': ['ยินดีต้อนรับสู่ทีมหมา! 🐶', 'ข้าวตังกระดิกหางรอจนหางจะหลุดแล้ว'],
    'home>cat': ['ยินดีต้อนรับสู่ทีมแมว! 🐱', 'ส้มโอยอมให้คุณเข้าบ้านแล้ว (ชั่วคราว)']
  };
  var ARRIVE = {
    dog: ['ทีมหมา ยินดีต้อนรับ! 🐶', 'โฮ่ง! ไปฝึกกันเลย'],
    cat: ['ทีมแมว ยินดีต้อนรับ! 🐱', 'เมี้ยว… อย่าลืมขนมเลียนะ']
  };
  var PAW = '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16.5" rx="6.2" ry="4.8"/><ellipse cx="4.6" cy="10.2" rx="2.3" ry="3"/><ellipse cx="9.3" cy="5.6" rx="2.3" ry="3"/><ellipse cx="14.7" cy="5.6" rx="2.3" ry="3"/><ellipse cx="19.4" cy="10.2" rx="2.3" ry="3"/></svg>';

  var css = '' +
    '.ps-ov{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;' +
    'background:radial-gradient(circle at 50% 45%,var(--c1) 0%,var(--c2) 100%);clip-path:circle(0% at var(--x) var(--y));transition:clip-path .65s cubic-bezier(.7,0,.2,1);overflow:hidden;font-family:Mitr,system-ui,sans-serif;pointer-events:all}' +
    '.ps-ov.open{clip-path:circle(150% at var(--x) var(--y))}' +
    '.ps-ov img{width:min(56vw,300px);height:auto;opacity:0;transform:translateY(60px) scale(.6) rotate(-10deg);transition:transform .55s cubic-bezier(.3,1.6,.5,1) .25s,opacity .3s .25s;filter:drop-shadow(0 18px 22px rgba(0,0,0,.18))}' +
    '.ps-ov.open img{opacity:1;transform:none;animation:ps-wiggle .5s ease-in-out .85s 2}' +
    '.ps-ov h2{font-size:clamp(28px,5vw,46px);font-weight:600;color:var(--ink);margin:14px 20px 4px;opacity:0;transform:translateY(16px);transition:all .4s .45s}' +
    '.ps-ov p{font-family:Sarabun,system-ui,sans-serif;font-size:clamp(16px,2.4vw,20px);color:var(--ink);opacity:0;transition:opacity .4s .6s;margin:0 20px}' +
    '.ps-ov.open h2,.ps-ov.open p{opacity:1;transform:none}' +
    '.ps-paw{position:absolute;width:44px;height:44px;fill:var(--paw);opacity:0;transform:scale(2.2) rotate(var(--r));animation:ps-stamp .28s ease-out forwards;animation-delay:var(--d)}' +
    '.ps-paw svg{width:100%;height:100%}' +
    '.ps-ov.leave{clip-path:circle(0% at 50% 50%);transition:clip-path .6s cubic-bezier(.7,0,.2,1) .15s}' +
    '.ps-ov.leave img{transform:scale(.4) rotate(14deg);opacity:0;transition:all .35s}' +
    '.ps-ov.leave h2,.ps-ov.leave p{opacity:0;transition:opacity .2s}' +
    '.ps-confetti{position:fixed;top:-50px;z-index:9998;width:26px;height:26px;fill:var(--paw);pointer-events:none;animation:ps-fall var(--t) linear forwards;opacity:.85}' +
    '.ps-confetti svg{width:100%;height:100%}' +
    '@keyframes ps-stamp{0%{opacity:0;transform:scale(2.2) rotate(var(--r))}60%{opacity:.9;transform:scale(.9) rotate(var(--r))}100%{opacity:.55;transform:scale(1) rotate(var(--r))}}' +
    '@keyframes ps-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}' +
    '@keyframes ps-fall{to{transform:translate(var(--dx),110vh) rotate(var(--rot));opacity:0}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function overlay(team, title, sub, x, y) {
    var t = TEAMS[team];
    var ov = document.createElement('div');
    ov.className = 'ps-ov';
    ov.style.cssText = '--c1:' + t.color1 + ';--c2:' + t.color2 + ';--ink:' + t.ink + ';--paw:' + t.paw + ';--x:' + x + 'px;--y:' + y + 'px';
    var paws = '';
    var w = window.innerWidth, h = window.innerHeight;
    for (var i = 0; i < 8; i++) {
      var px = (0.06 + i * 0.12) * w + (i % 2 ? 20 : -20);
      var py = h * (0.82 - i * 0.09) + (i % 2 ? -28 : 28);
      paws += '<span class="ps-paw" style="left:' + px + 'px;top:' + py + 'px;--r:' + (35 + (i % 2 ? 10 : -10)) + 'deg;--d:' + (0.3 + i * 0.07) + 's">' + PAW + '</span>';
    }
    ov.innerHTML = paws + '<img src="' + t.img + '" alt=""><h2>' + title + '</h2><p>' + sub + '</p>';
    document.body.appendChild(ov);
    return ov;
  }

  function confetti(team) {
    var t = TEAMS[team];
    for (var i = 0; i < 18; i++) {
      var s = document.createElement('span');
      s.className = 'ps-confetti';
      s.innerHTML = PAW;
      s.style.cssText = 'left:' + (Math.random() * 100) + 'vw;--paw:' + (i % 3 ? t.paw : '#E9A23B') + ';--t:' + (1.6 + Math.random() * 1.4) + 's;--dx:' + (Math.random() * 160 - 80) + 'px;--rot:' + (Math.random() * 540 - 270) + 'deg;animation-delay:' + (Math.random() * 0.5) + 's';
      document.body.appendChild(s);
      setTimeout(function (el) { return function () { el.remove(); }; }(s), 3600);
    }
  }

  // Leaving: intercept team links
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-to]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var to = a.getAttribute('data-to'), from = document.body.getAttribute('data-team') || 'home';
    var line = LINES[from + '>' + to]; if (!line) return;
    try { sessionStorage.setItem('petSwitch', to); } catch (err) {}
    if (reduce) return;
    e.preventDefault();
    var href = a.href;
    var ov = overlay(to, line[0], line[1], e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('open'); }); });
    setTimeout(function () { window.location.href = href; }, 1700);
  });

  // Arriving: reverse reveal + paw confetti
  var arrived = null;
  try { arrived = sessionStorage.getItem('petSwitch'); sessionStorage.removeItem('petSwitch'); } catch (err) {}
  var team = document.body.getAttribute('data-team');
  if (arrived && arrived === team && !reduce && ARRIVE[team]) {
    var ov = overlay(team, ARRIVE[team][0], ARRIVE[team][1], window.innerWidth / 2, window.innerHeight / 2);
    ov.classList.add('open');
    ov.style.transition = 'none';
    setTimeout(function () { ov.style.transition = ''; ov.classList.add('leave'); confetti(team); }, 650);
    setTimeout(function () { ov.remove(); }, 1500);
  }
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) document.querySelectorAll('.ps-ov').forEach(function (o) { o.remove(); }); });
})();
