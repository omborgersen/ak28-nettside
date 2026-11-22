// AK28 – samlet oversikt over treningstider (data/treningstider.json + navn fra data/lag.json)
(function () {
  var plan = document.getElementById('ukeplan');
  if (!plan) return;
  var DAGER = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  var EKSTRA_NAVN = { m4: 'Menn 4. divisjon' };
  var velgLag = document.getElementById('trening-lag');
  var hallvalg = document.getElementById('hallvalg');
  var data = null, navn = {}, hall = '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hvem(o) {
    var n = o.lag.map(function (id) { return navn[id] || id; });
    if (o.tekst) n.push(o.tekst);
    return n.join(' og ');
  }

  function tegn() {
    var lag = velgLag.value;
    var okter = data.okter.filter(function (o) {
      return (!lag || o.lag.indexOf(lag) >= 0) && (!hall || o.hall === hall);
    });
    var html = '';
    DAGER.forEach(function (dag) {
      var d = okter.filter(function (o) { return o.dag === dag; })
        .sort(function (a, b) { return a.fra < b.fra ? -1 : a.fra > b.fra ? 1 : a.hall < b.hall ? -1 : 1; });
      if (!d.length) return;
      html += '<section class="card dag-kort" aria-label="' + dag + '"><h2>' + dag + '</h2><ul>' +
        d.map(function (o) {
          return '<li><span class="okt-tid">' + esc(o.fra) + '–' + esc(o.til) + '</span>' +
            '<span class="okt-lag">' + esc(hvem(o)) + (o.ekstra ? ' <span class="pill">Ekstra</span>' : '') +
            '<span class="okt-hall">' + esc(o.hall) + (o.rom ? ', ' + esc(o.rom) : '') + '</span></span></li>';
        }).join('') + '</ul></section>';
    });
    plan.innerHTML = html || '<p class="muted">Ingen treninger med dette utvalget.</p>';
  }

  function hent(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { return r.json(); }); }
  Promise.all([hent('data/treningstider.json'), hent('data/lag.json')]).then(function (r) {
    data = r[0];
    r[1].lag.forEach(function (l) { navn[l.id] = l.navn; });
    Object.keys(EKSTRA_NAVN).forEach(function (id) { navn[id] = navn[id] || EKSTRA_NAVN[id]; });
    var harTrening = {};
    data.okter.forEach(function (o) { o.lag.forEach(function (id) { harTrening[id] = true; }); });
    r[1].lag.map(function (l) { return l.id; }).concat(Object.keys(EKSTRA_NAVN)).forEach(function (id) {
      if (!harTrening[id]) return;
      var op = document.createElement('option'); op.value = id; op.textContent = navn[id]; velgLag.appendChild(op);
    });
    var haller = [];
    data.okter.forEach(function (o) { if (haller.indexOf(o.hall) < 0) haller.push(o.hall); });
    haller.sort(function (a, b) { return a === 'Odderneshallen' ? -1 : b === 'Odderneshallen' ? 1 : a.localeCompare(b, 'nb'); });
    haller.forEach(function (h) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('data-hall', h);
      b.setAttribute('aria-pressed', 'false'); b.textContent = h; hallvalg.appendChild(b);
    });
    var fra = new URLSearchParams(location.search).get('lag');
    if (fra && harTrening[fra]) velgLag.value = fra;
    tegn();
  }).catch(function () { plan.innerHTML = '<p class="muted">Klarte ikke å hente treningstidene. Prøv å laste siden på nytt.</p>'; });

  velgLag.addEventListener('change', tegn);
  hallvalg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-hall]'); if (!b) return;
    hall = b.getAttribute('data-hall');
    hallvalg.querySelectorAll('[data-hall]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    tegn();
  });
})();
