// AK28 – lagsiden. Leser data/lag.json og viser lagkort, filter og kamper/tabell.
(function () {
  var grid = document.getElementById('lagliste');
  var panel = document.getElementById('lagpanel');
  if (!grid) return;

  var KAT = { barn: 'Barn', ungdom: 'Ungdom', senior: 'Senior' };
  var data = null;
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
    var knapp = l.handball
      ? '<button type="button" class="btn" data-lag="' + esc(l.id) + '" aria-controls="lagpanel" aria-expanded="' + (valgt === l.id) + '">' +
        '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>Kamper og tabell</button>'
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
    var kamper = (l.kamper || data.eksempel_kamper).map(function (k) {
      var spilt = !!k.resultat;
      return '<li class="match-row"><span class="match-time">' + esc(k.dato) + '<br><span class="muted" style="font-weight:400;font-size:13px">' + esc(k.tid) + '</span></span>' +
        '<span class="match-teams">' + esc(k.hjemme) + ' – ' + esc(k.borte) + '</span>' +
        '<span class="muted" style="flex:0 1 200px;font-size:14px">' + esc(k.hall) + '</span>' +
        '<span class="result' + (spilt ? '' : ' upcoming') + '">' + (spilt ? esc(k.resultat) : 'Kommende') + '</span></li>';
    }).join('');
    var tabell = (l.tabell || data.eksempel_tabell).map(function (r) {
      var egen = /AK ?28/i.test(r.lag);
      return '<tr' + (egen ? ' class="mine"' : '') + '><td>' + esc(r.plass) + '</td><td>' + esc(r.lag) + '</td><td>' + esc(r.k) + '</td><td>' + esc(r.v) + '</td><td>' + esc(r.u) + '</td><td>' + esc(r.t) + '</td><td>' + esc(r.maal) + '</td><td><strong>' + esc(r.p) + '</strong></td></tr>';
    }).join('');
    panel.innerHTML =
      '<div class="panel-head"><div><span class="eyebrow">' + esc(l.serie || '[Serie / avdeling] · Sesong 2026/2027') + '</span><h2 id="lagpanel-tittel">' + esc(l.navn) + '</h2></div>' +
      '<button type="button" class="icon-btn" data-lukk aria-label="Lukk kamper og tabell"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="panel-body">' +
      '<div class="filters" role="group" aria-label="Velg visning" style="margin:0">' +
      '<button type="button" class="chip dark-chip" data-visning="kamper" aria-pressed="' + (visning === 'kamper') + '">Terminliste</button>' +
      '<button type="button" class="chip dark-chip" data-visning="tabell" aria-pressed="' + (visning === 'tabell') + '">Tabell</button></div>' +
      (visning === 'kamper'
        ? '<ul class="match-list">' + kamper + '</ul>'
        : '<div class="table-wrap"><table class="league"><caption class="sr-only">Tabell for ' + esc(l.navn) + '</caption><thead><tr><th scope="col">#</th><th scope="col">Lag</th><th scope="col"><abbr title="Kamper">K</abbr></th><th scope="col"><abbr title="Vunnet">V</abbr></th><th scope="col"><abbr title="Uavgjort">U</abbr></th><th scope="col"><abbr title="Tapt">T</abbr></th><th scope="col">Mål</th><th scope="col"><abbr title="Poeng">P</abbr></th></tr></thead><tbody>' + tabell + '</tbody></table></div>') +
      '<div class="panel-foot"><span>Fullstendig og oppdatert oversikt finnes på handball.no.</span><a class="link-strong" href="' + esc(l.handball) + '">Se laget på handball.no →</a></div>' +
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

  fetch('data/lag.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) { data = d; visLag(); })
    .catch(function () { grid.innerHTML = '<p class="muted">Klarte ikke å hente laglisten. Prøv å laste siden på nytt.</p>'; });
})();
