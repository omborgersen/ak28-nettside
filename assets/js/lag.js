// AK28 – lagsiden. Leser data/lag.json og viser lagkort, filter og kamper/tabell.
(function () {
  var grid = document.getElementById('lagliste');
  var panel = document.getElementById('lagpanel');
  if (!grid) return;

  var KAT = { barn: 'Barn', ungdom: 'Ungdom', senior: 'Senior' };
  var data = null;
  var kamper = [];
  var harKamper = {};
  var filter = 'alle';
  var valgt = null;
  var visning = 'kamper';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function kort(l) {
    var bilde = l.bilde
      ? '<img src="assets/img/' + esc(l.bilde) + '" alt="Lagbilde av ' + esc(l.navn) + '" loading="lazy">'
      : '<div class="placeholder"><svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg><span>Lagbilde kommer</span></div>';
    var knapp = harKamper[l.id]
      ? '<button type="button" class="btn" data-lag="' + esc(l.id) + '" aria-controls="lagpanel" aria-expanded="' + (valgt === l.id) + '">' +
        '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>Kamper</button>'
      : '';
    return '<article class="card team">' + bilde +
      '<div class="team-body"><span class="pill" style="align-self:flex-start">' + esc(KAT[l.kategori]) + '</span>' +
      '<h2>' + esc(l.navn) + '</h2>' +
      '<dl><dt>Alder</dt><dd>' + esc(l.alder) + '</dd><dt>Trenere</dt><dd>' + esc(l.trenere) + '</dd><dt>Trening</dt><dd>' + esc(l.trening) + '</dd></dl>' +
      knapp + '</div></article>';
  }

  function visLag() {
    var lag = data.lag.filter(function (l) { return filter === 'alle' || l.kategori === filter; });
    grid.innerHTML = lag.map(kort).join('');
  }

  function visPanel() {
    var l = data.lag.filter(function (x) { return x.id === valgt; })[0];
    if (!l) { panel.hidden = true; return; }
    var idag = new Date(); idag.setHours(0, 0, 0, 0);
    var iso = idag.getFullYear() + '-' + ('0' + (idag.getMonth() + 1)).slice(-2) + '-' + ('0' + idag.getDate()).slice(-2);
    var alle = kamper.filter(function (k) { return k.lag.indexOf(l.id) >= 0; });
    var liste = alle.filter(function (k) { return visning === 'kamper' ? k.dato >= iso : k.dato < iso; });
    if (visning !== 'kamper') liste = liste.slice().reverse();
    var rader = liste.map(function (k) {
      var p = k.dato.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
      var dag = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'][d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
      return '<li class="match-row"><span class="match-time">' + esc(dag) + '<br><span class="muted" style="font-weight:400;font-size:13px">' + esc(k.tid) + '</span></span>' +
        '<span class="match-teams">' + esc(k.hjemme) + ' – ' + esc(k.borte) + '<span class="match-hall">' + esc(k.hall) + ' · ' + esc(k.serie) + '</span></span>' +
        (k.resultat ? '<span class="result">' + esc(k.resultat) + '</span>' : '') + '</li>';
    }).join('') || '<li class="match-row"><span class="muted">' + (visning === 'kamper' ? 'Ingen flere kamper registrert denne sesongen.' : 'Ingen kamper spilt ennå.') + '</span></li>';
    panel.innerHTML =
      '<div class="panel-head"><div><span class="eyebrow">Sesongen 2026/2027</span><h2 id="lagpanel-tittel">' + esc(l.navn) + '</h2></div>' +
      '<button type="button" class="icon-btn" data-lukk aria-label="Lukk kamper"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="panel-body">' +
      '<div class="filters" role="group" aria-label="Velg visning" style="margin:0">' +
      '<button type="button" class="chip dark-chip" data-visning="kamper" aria-pressed="' + (visning === 'kamper') + '">Kommende</button>' +
      '<button type="button" class="chip dark-chip" data-visning="spilte" aria-pressed="' + (visning === 'spilte') + '">Spilte</button></div>' +
      '<ul class="match-list">' + rader + '</ul>' +
      '<div class="panel-foot"><span>Kamper kan bli flyttet. Tabeller og siste endringer finner du på handball.no.</span>' +
      (l.handball ? '<a class="link-strong" href="' + esc(l.handball) + '">Se laget på handball.no →</a>' : '<a class="link-strong" href="kamper.html?lag=' + esc(l.id) + '">Alle kamper →</a>') + '</div>' +
      '</div>';
    panel.hidden = false;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-filter')) {
      filter = t.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
      visLag();
    } else if (t.hasAttribute('data-lag')) {
      valgt = t.getAttribute('data-lag');
      visning = 'kamper';
      visLag();
      visPanel();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var h = panel.querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    } else if (t.hasAttribute('data-visning')) {
      visning = t.getAttribute('data-visning');
      visPanel();
      var b = panel.querySelector('[data-visning="' + visning + '"]');
      if (b) b.focus();
    } else if (t.hasAttribute('data-lukk')) {
      var forrige = valgt;
      valgt = null;
      panel.hidden = true;
      visLag();
      var k = grid.querySelector('[data-lag="' + forrige + '"]');
      if (k) k.focus();
    }
  });

  var hentKamper = fetch('data/kamper.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) { kamper = d.kamper || []; kamper.forEach(function (k) { k.lag.forEach(function (id) { harKamper[id] = true; }); }); })
    .catch(function () {});
  Promise.all([fetch('data/lag.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }), hentKamper])
    .then(function (r) { data = r[0]; visLag(); })
    .catch(function () { grid.innerHTML = '<p class="muted">Klarte ikke å hente laglisten. Prøv å laste siden på nytt.</p>'; });
})();
