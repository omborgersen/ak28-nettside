// AK28 – kamper. Leser data/kamper.json og viser
//  - helgens hjemmekamper på forsiden (#helgekamper)
//  - hele kampoversikten med filter på kamper.html (#kampliste)
(function () {
  var DAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
  var MND = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  var EKSTRA_LAG = { m4: 'Menn 4. divisjon' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dato(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function langDato(s) { var d = dato(s); var t = DAGER[d.getDay()] + ' ' + d.getDate() + '. ' + MND[d.getMonth()]; return t.charAt(0).toUpperCase() + t.slice(1); }
  function kortDag(s) { var d = dato(s); return DAGER[d.getDay()].slice(0, 3).replace(/^./, function (c) { return c.toUpperCase(); }) + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; }
  function iOdderneshallen(k) { return /^odderneshallen/i.test(k.hall); }
  function idag() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }

  function rad(k, visDag) {
    var res = k.resultat ? '<span class="result" title="Resultat">' + esc(k.resultat) + '</span>' : '';
    return '<li class="match-row">' +
      '<span class="match-time">' + (visDag ? esc(kortDag(k.dato)) + ' ' : '') + esc(k.tid) + '</span>' +
      '<span class="pill">' + esc(k.klasse) + '</span>' +
      '<span class="match-teams">' + esc(k.hjemme) + ' – ' + esc(k.borte) +
      '<span class="match-hall">' + esc(k.hall) + '</span></span>' +
      res + '</li>';
  }

  function hent(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  // ---------- Forsiden: helgens kamper i Odderneshallen ----------
  var helg = document.getElementById('helgekamper');
  if (helg) {
    hent('data/kamper.json').then(function (data) {
      var i = idag(), dag = i.getDay();
      // Fra fredag (eller i dag, hvis det er helg) til og med søndag
      var fra = new Date(i), til = new Date(i);
      if (dag >= 1 && dag <= 4) fra.setDate(i.getDate() + (5 - dag));
      til.setDate(i.getDate() + ((7 - dag) % 7));
      var a = iso(fra), b = iso(til);
      var hjemme = data.kamper.filter(iOdderneshallen);
      var liste = hjemme.filter(function (k) { return k.dato >= a && k.dato <= b; });
      var tittel = document.getElementById('helg-tittel');
      if (!liste.length) {
        liste = hjemme.filter(function (k) { return k.dato >= iso(i); }).slice(0, 5);
        if (tittel) tittel.textContent = 'Neste kamper i Odderneshallen';
      }
      helg.innerHTML = liste.length
        ? liste.map(function (k) { return rad(k, true); }).join('')
        : '<li class="match-row"><span class="muted">Ingen flere hjemmekamper registrert denne sesongen.</span></li>';
    }).catch(function () {
      helg.innerHTML = '<li class="match-row"><span class="muted">Klarte ikke å hente kampene. <a href="kamper">Se alle kamper</a>.</span></li>';
    });
  }

  // ---------- Kamper-siden ----------
  var liste = document.getElementById('kampliste');
  if (!liste) return;
  var velgLag = document.getElementById('kamp-lag');
  var bareHjemme = document.getElementById('kamp-hjemme');
  var info = document.getElementById('kamp-info');
  var data = null, visning = 'kommende';

  function tegn() {
    var lag = velgLag.value, i = iso(idag());
    var k = data.kamper.filter(function (k) {
      if (lag && k.lag.indexOf(lag) < 0) return false;
      if (bareHjemme.checked && !iOdderneshallen(k)) return false;
      return visning === 'kommende' ? k.dato >= i : k.dato < i;
    });
    if (visning === 'spilte') k = k.slice().reverse();
    if (!k.length) {
      liste.innerHTML = '<p class="muted">Ingen kamper å vise med dette utvalget.</p>';
    } else {
      var html = '', dagNaa = '';
      k.forEach(function (m) {
        if (m.dato !== dagNaa) {
          if (dagNaa) html += '</ul>';
          dagNaa = m.dato;
          html += '<h2 class="kamp-dag">' + esc(langDato(m.dato)) + '</h2><ul class="match-list">';
        }
        html += rad(m, false);
      });
      liste.innerHTML = html + '</ul>';
    }
    info.textContent = k.length + (k.length === 1 ? ' kamp' : ' kamper');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-kampvisning]');
    if (!b) return;
    visning = b.getAttribute('data-kampvisning');
    document.querySelectorAll('[data-kampvisning]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    tegn();
  });
  velgLag.addEventListener('change', tegn);
  bareHjemme.addEventListener('change', tegn);

  Promise.all([hent('data/kamper.json'), hent('data/lag.json').catch(function () { return { lag: [] }; })])
    .then(function (r) {
      data = r[0];
      var navn = {};
      r[1].lag.forEach(function (l) { navn[l.id] = l.navn; });
      Object.keys(EKSTRA_LAG).forEach(function (id) { navn[id] = navn[id] || EKSTRA_LAG[id]; });
      var finnes = {};
      data.kamper.forEach(function (k) { k.lag.forEach(function (id) { finnes[id] = true; }); });
      var rekkefolge = r[1].lag.map(function (l) { return l.id; }).concat(Object.keys(EKSTRA_LAG));
      rekkefolge.filter(function (id) { return finnes[id]; }).forEach(function (id) {
        var o = document.createElement('option'); o.value = id; o.textContent = navn[id] || id; velgLag.appendChild(o);
      });
      var fra = new URLSearchParams(location.search).get('lag');
      if (fra && finnes[fra]) velgLag.value = fra;
      var opp = document.getElementById('kamp-oppdatert');
      if (opp && data.oppdatert) opp.textContent = langDato(data.oppdatert).replace(/^\S+ /, '') + ' ' + data.oppdatert.slice(0, 4);
      tegn();
    })
    .catch(function () { liste.innerHTML = '<p class="muted">Klarte ikke å hente kampene. Prøv å laste siden på nytt.</p>'; });
})();
