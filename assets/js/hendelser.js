// AK28 – viktige datoer (data/hendelser.json)
//  - #arshjul på datoer.html: alle hendelser, måned for måned
//  - #denne-maaned på forsiden: hendelser denne måneden (eller de neste)
(function () {
  var MND = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  var DAG = ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'];
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function d(iso) { var p = String(iso).slice(0, 10).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function mndNokkel(iso) { return String(iso).slice(0, 7); }
  function stor(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mndNavn(n) { var p = n.split('-'); return stor(MND[+p[1] - 1]) + ' ' + p[0]; }
  function datoTekst(h) {
    if (h.bare_maaned) return 'I løpet av ' + MND[d(h.dato).getMonth()];
    var a = d(h.dato), t = DAG[a.getDay()] + ' ' + a.getDate() + '. ' + MND[a.getMonth()];
    if (h.til && h.til !== h.dato) { var b = d(h.til); t = a.getDate() + '.–' + b.getDate() + '. ' + MND[b.getMonth()]; }
    return stor(t);
  }
  function kort(h, visBeskrivelse) {
    var tittel = h.lenke ? '<a href="' + esc(h.lenke) + '">' + esc(h.tittel) + '</a>' : esc(h.tittel);
    var dd = d(h.dato);
    var merke = h.bare_maaned
      ? '<span class="hd-dag hd-mnd">' + esc(MND[dd.getMonth()].slice(0, 3)) + '</span>'
      : '<span class="hd-dag"><b>' + dd.getDate() + '</b>' + esc(MND[dd.getMonth()].slice(0, 3)) + '</span>';
    return '<li class="hd">' + merke + '<div><span class="hd-meta">' + esc(datoTekst(h)) + (h.kategori ? ' · ' + esc(h.kategori) : '') + '</span>' +
      '<strong class="hd-tittel">' + tittel + '</strong>' +
      (visBeskrivelse && h.beskrivelse ? '<p>' + esc(h.beskrivelse) + '</p>' : '') + '</div></li>';
  }
  function sorter(a, b) {
    if (a.dato.slice(0, 7) !== b.dato.slice(0, 7)) return a.dato < b.dato ? -1 : 1;
    if (a.bare_maaned !== b.bare_maaned) return a.bare_maaned ? -1 : 1;   // «i løpet av måneden» først
    return a.dato < b.dato ? -1 : a.dato > b.dato ? 1 : 0;
  }
  var naa = new Date(), denneMnd = naa.getFullYear() + '-' + ('0' + (naa.getMonth() + 1)).slice(-2);
  var idag = denneMnd + '-' + ('0' + naa.getDate()).slice(-2);

  fetch('data/hendelser.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
    var alle = (data.hendelser || []).filter(function (h) { return h && h.tittel && h.dato; }).map(function (h) {
      h.dato = String(h.dato).slice(0, 10); h.til = h.til ? String(h.til).slice(0, 10) : '';
      if (h.til <= h.dato) h.til = '';   // tom eller ugyldig til-dato ignoreres
      return h;
    }).sort(sorter);

    // Forsiden
    var boks = document.getElementById('denne-maaned');
    if (boks) {
      var tittel = document.getElementById('denne-maaned-tittel');
      var liste = alle.filter(function (h) { return mndNokkel(h.dato) === denneMnd || (h.til && h.dato <= idag && h.til >= idag); });
      if (tittel) tittel.textContent = 'Skjer i ' + MND[naa.getMonth()];
      // Fyll opp med det som kommer etter denne måneden, så boksen alltid viser minst fire
      if (liste.length < 4) {
        var neste = alle.filter(function (h) { return mndNokkel(h.dato) > denneMnd; }).slice(0, 4 - liste.length);
        if (neste.length && tittel) tittel.textContent = liste.length ? 'Skjer i ' + MND[naa.getMonth()] + ' og fremover' : 'Kommer snart';
        liste = liste.concat(neste);
      }
      boks.innerHTML = liste.length ? liste.map(function (h) { return kort(h, false); }).join('') : '<li class="muted">Ingen hendelser registrert.</li>';
    }

    // Datoer-siden
    var side = document.getElementById('arshjul');
    if (!side) return;
    var visAlle = false, knapp = document.getElementById('vis-tidligere');
    function tegn() {
      var mnd = {};
      alle.forEach(function (h) {
        var n = mndNokkel(h.dato);
        if (!visAlle && n < denneMnd && (h.til || h.dato) < idag) return;
        (mnd[n] = mnd[n] || []).push(h);
      });
      var html = Object.keys(mnd).sort().map(function (n) {
        return '<section class="card hd-maaned' + (n === denneMnd ? ' denne' : '') + '"><h2>' + esc(mndNavn(n)) + (n === denneMnd ? ' <span class="pill">Nå</span>' : '') + '</h2>' +
          '<ul class="hd-liste">' + mnd[n].map(function (h) { return kort(h, true); }).join('') + '</ul></section>';
      }).join('');
      side.innerHTML = html || '<p class="muted">Ingen kommende hendelser.</p>';
      if (knapp) knapp.textContent = visAlle ? 'Skjul tidligere måneder' : 'Vis tidligere måneder';
    }
    if (knapp) knapp.addEventListener('click', function () { visAlle = !visAlle; tegn(); });
    tegn();
  }).catch(function () {
    ['denne-maaned', 'arshjul'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.innerHTML = '<p class="muted">Klarte ikke å hente datoene.</p>';
    });
  });
})();
