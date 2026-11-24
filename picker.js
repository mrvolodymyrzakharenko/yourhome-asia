// Search-card lists on phones/tablets (owner, 2026-11-24: "a disztrikt ne nyíljon meg teljes ablakra… a képernyő 25%-a
// látszódjon a tetejétől, aljától, jobbról, balról"): instead of the phone's full-screen picker, every select of the search
// card (District, Property type, Budget) opens our own small list in the middle of the screen – 25% of the screen stays free
// on every side (owner, later: a little bigger – 20% / 16% – with an X at the very top to close it), rounded, soft shadow, picked one red. The real <select> keeps the value (change event fired).
(function () {
  var mq = window.matchMedia('(max-width:900px)');
  var box = null, cur = null;
  function close() { if (box) { box.classList.remove('in'); var b = box; setTimeout(function () { b.remove(); }, 180); box = null; cur = null; } }
  function open(sel) {
    close(); cur = sel;
    box = document.createElement('div'); box.className = 'ypk';
    var lw = sel.closest('.f') || sel.closest('label'), lab = sel.getAttribute('aria-label') || (lw ? (lw.querySelector('label') || lw).firstChild.textContent.replace(/^\W+/, '').trim() : '');
    var h = '<div class="ypk-bg"></div><div class="ypk-w" role="listbox" aria-label="' + lab.replace(/"/g, '&quot;') + '"><div class="ypk-h"><span>' + lab.replace(/</g, '&lt;') + '</span><button type="button" class="ypk-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="ypk-l">';
    for (var i = 0; i < sel.options.length; i++) {
      var o = sel.options[i];
      h += '<button type="button" data-i="' + i + '" class="' + (i === sel.selectedIndex ? 'on' : '') + '">' + o.textContent.replace(/</g, '&lt;') + '</button>';
    }
    box.innerHTML = h + '</div></div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box && box.classList.add('in'); var on = box && box.querySelector('.on'); if (on) on.scrollIntoView({ block: 'center' }); });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (b) { var s = cur; s.selectedIndex = +b.dataset.i; s.dispatchEvent(new Event('change', { bubbles: true })); s.dispatchEvent(new Event('input', { bubbles: true })); }
      if (b || e.target.classList.contains('ypk-bg') || e.target.closest('.ypk-x')) close();
    });
  }
  // also the More filters selects on EVERY screen (owner, 2026-11-24 17:28: the native list was ugly – "szép, gömbölyű, szélesebb")
  // EVERY list of the search area opens our rounded list on every screen – search card, More filters, Newest (owner, 2026-11-24 17:28: "legyen egységesen szép")
  function hit(e) { if (!e.target.closest) return null; var s = e.target.closest('.sbox select, .more-panel select, #sortSel'); return s && !s.disabled ? s : null; }
  document.addEventListener('mousedown', function (e) { if (hit(e)) e.preventDefault(); }, true);
  document.addEventListener('touchstart', function (e) { if (hit(e)) e.preventDefault(); }, { capture: true, passive: false });
  document.addEventListener('touchend', function (e) { var s = hit(e); if (s) { e.preventDefault(); open(s); } }, { capture: true, passive: false });
  document.addEventListener('click', function (e) { var s = hit(e); if (s) { e.preventDefault(); open(s); } }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('hashchange', close);
})();
