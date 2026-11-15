/* Download scoreboard: ทีมหมา vs ทีมแมว (free Abacus counting API, no sign-up)
   - Thank-you pages add +1 to their team once per browser session.
   - Every .scoreboard element shows both totals as a tug-of-war bar with a cheeky line.
   - If the counter service can't be reached, the scoreboard stays hidden. */
(function () {
  var boxes = document.querySelectorAll('.scoreboard');
  if (!boxes.length) return;
  var API = 'https://abacus.jasoncameron.dev', NS = 'pond1982-pet-28-days';
  var team = document.body.getAttribute('data-team') || 'home';
  var onThanks = /\/thanks\/?$/.test(location.pathname);

  var css = '' +
    '.scoreboard{display:none}.scoreboard.ready{display:block}' +
    '.sb{background:#fff;border:1px solid #EEE3D6;border-radius:26px;padding:24px 26px 22px;box-shadow:0 18px 40px -26px rgba(120,70,30,.35);max-width:720px;margin:0 auto;text-align:center;font-family:Sarabun,system-ui,sans-serif}' +
    '.sb-head{font-family:Mitr,system-ui,sans-serif;font-weight:500;font-size:15px;color:#7A5C8E;background:#F1EAF5;display:inline-block;padding:4px 14px;border-radius:99px}' +
    '.sb-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 12px;font-family:Mitr,system-ui,sans-serif}' +
    '.sb-side{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:500}' +
    '.sb-side img{width:54px;height:54px;object-fit:contain;transition:transform .4s}' +
    '.sb-side b{font-size:clamp(28px,4.4vw,40px);font-weight:600;line-height:1;font-variant-numeric:tabular-nums}' +
    '.sb-dog{color:#E2714B}.sb-cat{color:#1F7A74;flex-direction:row-reverse}' +
    '.sb-lead img{animation:sb-bounce 1.2s ease-in-out infinite}' +
    '.sb-vs{font-family:Mitr;font-weight:600;color:#7A5C8E;font-size:15px;background:#F1EAF5;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex:none}' +
    '.sb-bar{position:relative;height:18px;border-radius:99px;overflow:hidden;background:#F1EAF5;display:flex}' +
    '.sb-bar i{display:block;height:100%;transition:width 1.2s cubic-bezier(.2,.8,.2,1)}' +
    '.sb-bar .d{background:linear-gradient(90deg,#F4A77F,#E2714B)}.sb-bar .c{background:linear-gradient(90deg,#1F7A74,#8CC9C1)}' +
    '.sb-knot{position:absolute;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25);transition:left 1.2s cubic-bezier(.2,.8,.2,1);display:flex;align-items:center;justify-content:center;font-size:13px}' +
    '.sb-msg{margin-top:14px;font-size:16.5px;color:#5C534C;line-height:1.55}' +
    '.sb-msg b{font-family:Mitr;font-weight:500;color:#2E2A27}' +
    '.sb-you{display:inline-block;margin-top:10px;font-family:Mitr;font-size:15px;font-weight:500;color:#fff;padding:6px 14px;border-radius:99px;animation:sb-pop .6s cubic-bezier(.3,1.6,.5,1) both}' +
    '@keyframes sb-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px) rotate(-4deg)}}' +
    '@keyframes sb-pop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}' +
    '@media (max-width:560px){.sb{padding:20px 16px}.sb-side{font-size:14px;gap:6px}.sb-side img{width:40px;height:40px}}' +
    '@media (prefers-reduced-motion:reduce){.sb-lead img,.sb-you{animation:none}.sb-bar i,.sb-knot{transition:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = (document.currentScript && document.currentScript.src.replace(/scoreboard\.js.*$/, '')) || './';

  function call(action, key) {
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(API + '/' + action + '/' + NS + '/' + key, ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (r.status === 404) return { value: 0 }; return r.ok ? r.json() : null; })
      .then(function (d) { return d && typeof d.value === 'number' ? d.value : null; })
      .catch(function () { return null; });
  }

  var counted = false, flag = 'petDlCounted_' + team;
  if (onThanks) { try { counted = sessionStorage.getItem(flag) === '1'; } catch (e) {} }
  var addMine = onThanks && !counted && (team === 'dog' || team === 'cat');

  Promise.all([
    addMine && team === 'dog' ? call('hit', 'dl-dog') : call('get', 'dl-dog'),
    addMine && team === 'cat' ? call('hit', 'dl-cat') : call('get', 'dl-cat')
  ]).then(function (v) {
    var dog = v[0], cat = v[1];
    if (dog === null || cat === null) return;
    if (addMine) { try { sessionStorage.setItem(flag, '1'); } catch (e) {} }
    var total = dog + cat, pctDog = total ? Math.round(dog / total * 100) : 50;
    var fmt = function (n) { return n.toLocaleString('th-TH'); };
    var msg;
    if (total === 0) msg = 'ยังไม่มีใครดาวน์โหลดเลย <b>มาเป็นคนแรกกัน!</b> ทีมไหนจะได้แต้มแรก?';
    else if (dog === cat) msg = '<b>เสมอกันเป๊ะ!</b> ข้าวตังกับส้มโอจ้องตากันไม่กะพริบ ศึกนี้ยังไม่จบ ⚔️';
    else if (dog > cat) {
      var gap = dog - cat;
      msg = gap <= 2 ? '<b>ทีมหมานำแบบหายใจรดต้นคอ!</b> ส้มโอทำเป็นไม่สนใจ... แต่หางกระดิกแรงมาก 😾'
        : pctDog >= 70 ? '<b>ทีมหมานำขาดลอย!</b> ข้าวตังวิ่งรอบบ้านไปแล้ว 3 รอบ ส้มโอเรียกทีมแมวมาช่วยด่วน 🆘🐱'
        : '<b>ทีมหมานำอยู่ ' + fmt(gap) + ' แต้ม!</b> ส้มโอบอกว่า “ปล่อยให้ชนะไปก่อนก็ได้” 😼';
    } else {
      var gap2 = cat - dog;
      msg = gap2 <= 2 ? '<b>ทีมแมวนำนิดเดียว!</b> ข้าวตังเห่าเชียร์ตัวเองดังมาก ทีมหมามาช่วยกันหน่อย 🐶📣'
        : (100 - pctDog) >= 70 ? '<b>ทีมแมวนำขาดลอย!</b> ส้มโอนอนเหยียดยาวบนโซฟาอย่างผู้ชนะ ข้าวตังนั่งซึม 🥺'
        : '<b>ทีมแมวนำอยู่ ' + fmt(gap2) + ' แต้ม!</b> ข้าวตังทำหน้าเศร้า... ทีมหมาสู้ ๆ 🐶';
    }
    var you = addMine ? '<div><span class="sb-you" style="background:' + (team === 'dog' ? '#E2714B' : '#1F7A74') + '">คุณเพิ่งช่วยทีม' + (team === 'dog' ? 'หมา 🐶' : 'แมว 🐱') + ' +1 แต้ม!</span></div>' : '';
    var html = '<div class="sb"><span class="sb-head">🏆 ศึกยอดดาวน์โหลด</span>' +
      '<div class="sb-row">' +
      '<span class="sb-side sb-dog' + (dog > cat ? ' sb-lead' : '') + '"><img src="' + root + 'dog/assets/img/sit.webp" alt=""><span>ทีมหมา<br><b data-n="' + dog + '">0</b></span></span>' +
      '<span class="sb-vs">VS</span>' +
      '<span class="sb-side sb-cat' + (cat > dog ? ' sb-lead' : '') + '"><img src="' + root + 'cat/assets/img/sit.webp" alt=""><span style="text-align:right">ทีมแมว<br><b data-n="' + cat + '">0</b></span></span>' +
      '</div>' +
      '<div class="sb-bar"><i class="d" style="width:50%"></i><i class="c" style="width:50%"></i><span class="sb-knot" style="left:50%">🎀</span></div>' +
      '<p class="sb-msg">' + msg + '</p>' + you + '</div>';
    boxes.forEach(function (box) {
      box.innerHTML = html; box.classList.add('ready');
      setTimeout(function () {
        box.querySelector('.d').style.width = pctDog + '%';
        box.querySelector('.c').style.width = (100 - pctDog) + '%';
        box.querySelector('.sb-knot').style.left = pctDog + '%';
      }, 120);
      box.querySelectorAll('b[data-n]').forEach(function (b) {
        var target = +b.getAttribute('data-n'), i = 0, steps = 20;
        var iv = setInterval(function () { i++; b.textContent = fmt(Math.round(target * (1 - Math.pow(1 - i / steps, 3)))); if (i >= steps) { clearInterval(iv); b.textContent = fmt(target); } }, 45);
      });
    });
    if (typeof gtag === 'function') gtag('event', 'scoreboard_loaded', { team: team, dog_downloads: dog, cat_downloads: cat, leader: dog === cat ? 'tie' : (dog > cat ? 'dog' : 'cat') });
  });
})();
