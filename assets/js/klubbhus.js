// AK28 – leieskjema for klubbhuset: pris, sjekk av tid og takk-melding.
(function () {
  var form = document.getElementById('leieskjema');
  if (!form) return;

  // Etter innsending sender FormSubmit brukeren tilbake hit med ?sendt=1
  var neste = document.getElementById('neste');
  if (neste) neste.value = location.origin + location.pathname + '?sendt=1#takk';
  if (/[?&]sendt=1/.test(location.search)) {
    var takk = document.getElementById('takk');
    if (takk) { takk.hidden = false; takk.scrollIntoView({ block: 'center' }); }
  }

  // Ikke mulig å velge dato bakover i tid
  var dato = document.getElementById('dato');
  if (dato) {
    var d = new Date();
    dato.min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Pris
  var VASK = 700, PRIS = { Ja: 2000, Nei: 4000 };
  var leie = document.getElementById('pris-leie');
  var total = document.getElementById('pris-total');
  var kr = function (n) { return n.toLocaleString('nb-NO') + ' kr'; };
  form.addEventListener('change', function (e) {
    if (e.target.name === 'Medlem') {
      var p = PRIS[e.target.value];
      leie.textContent = kr(p);
      total.textContent = kr(p + VASK);
    }
  });

  // Sluttid må være etter starttid
  var feil = document.getElementById('skjemafeil');
  form.addEventListener('submit', function (e) {
    var fra = document.getElementById('fra').value, til = document.getElementById('til').value;
    if (fra && til && til <= fra) {
      e.preventDefault();
      feil.textContent = 'Sluttiden må være etter starttiden.';
      feil.hidden = false;
      document.getElementById('til').focus();
      return;
    }
    feil.hidden = true;
  });
})();
