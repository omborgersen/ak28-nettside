// AK28 – felles skript: mobilmeny og nedtelling til cupen.
(function () {
  // Mobilmeny
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('hovedmeny');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Nedtelling. Starttidspunktet står i data-start på elementet med id="nedtelling".
  var box = document.getElementById('nedtelling');
  if (box) {
    var start = Date.parse(box.getAttribute('data-start'));
    var el = {
      d: box.querySelector('[data-unit="d"]'),
      h: box.querySelector('[data-unit="h"]'),
      m: box.querySelector('[data-unit="m"]'),
      s: box.querySelector('[data-unit="s"]')
    };
    var clock = box.querySelector('.countdown-clock');
    var done = box.querySelector('.started-msg');
    var label = box.querySelector('[data-countdown-label]');
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var tick = function () {
      var diff = Math.max(0, start - Date.now());
      if (diff === 0) {
        if (clock) clock.hidden = true;
        if (done) done.hidden = false;
        return false;
      }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      el.d.textContent = d;
      el.h.textContent = pad(h);
      el.m.textContent = pad(m);
      el.s.textContent = pad(s % 60);
      if (label) label.textContent = 'Tid igjen til cupstart: ' + d + ' dager, ' + h + ' timer og ' + m + ' minutter';
      return true;
    };
    if (!isNaN(start) && tick()) {
      var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
    }
  }

  var year = document.getElementById('aar');
  if (year) year.textContent = new Date().getFullYear();
})();
