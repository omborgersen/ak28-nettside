// Sender skjema til FormSubmit i bakgrunnen (AJAX) i stedet for å forlate siden.
// Går innsendingen ikke gjennom, får brukeren en ferdig utfylt e-post som reserveløsning,
// så ingen forespørsler går tapt.
(function () {
  var skjemaer = document.querySelectorAll('form[action^="https://formsubmit.co/"]');
  Array.prototype.forEach.call(skjemaer, function (form) {
    var mottaker = form.action.replace('https://formsubmit.co/', '').replace(/^ajax\//, '');
    var epostFallback = form.getAttribute('data-epost') || mottaker;     // adressen for «Send som e-post»
    var web3 = form.getAttribute('data-web3forms');                      // tilgangsnøkkel → bruk Web3Forms i stedet
    var emne = (form.querySelector('[name="_subject"]') || {}).value || 'Henvendelse fra ak28.no';
    var knapp = form.querySelector('[type="submit"]');
    var status = document.createElement('div');
    status.className = 'notice skjema-status';
    status.setAttribute('role', 'status');
    status.hidden = true;
    knapp.parentNode.insertBefore(status, knapp.nextSibling);

    function epostLenke() {
      var linjer = [];
      new FormData(form).forEach(function (v, k) { if (k.charAt(0) !== '_' && k !== 'email' && String(v).trim()) linjer.push(k + ': ' + v); });
      var epost = form.querySelector('[name="email"]');
      if (epost && epost.value) linjer.push('E-post: ' + epost.value);
      return 'mailto:' + epostFallback + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(linjer.join('\n'));
    }
    function visFeil(tekst) {
      status.className = 'notice skjema-status feil';
      status.innerHTML = '<strong>Skjemaet ble ikke sendt.</strong> ' + tekst +
        ' <a class="btn btn-red" style="margin-top:12px" href="' + epostLenke() + '">Send som e-post i stedet</a>';
      status.hidden = false;
      status.scrollIntoView({ block: 'center' });
    }

    form.addEventListener('submit', function (e) {
      if (e.defaultPrevented) return;              // annen validering stoppet innsendingen
      e.preventDefault();
      var honning = form.querySelector('[name="_honey"]');
      if (honning && honning.value) return;        // trolig en robot
      if (!window.fetch) { form.submit(); return; }
      knapp.disabled = true;
      var tekst = knapp.textContent;
      knapp.textContent = 'Sender …';
      status.hidden = true;
      // Gi opp etter 15 sekunder, så siden aldri bare står og venter
      var avbryt = window.AbortController ? new AbortController() : null;
      var tidsfrist = setTimeout(function () { if (avbryt) avbryt.abort(); }, 15000);
      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (k === '_next') return;
        data[k] = data[k] ? data[k] + ', ' + v : v;   // flere avkrysninger i samme felt
      });
      if (web3) {
        data = { access_key: web3, subject: emne, botcheck: '' };
        new FormData(form).forEach(function (v, k) {
          if (k.charAt(0) === '_') return;
          data[k] = data[k] ? data[k] + ', ' + v : v;
        });
      }
      fetch(web3 ? 'https://api.web3forms.com/submit' : 'https://formsubmit.co/ajax/' + mottaker, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: avbryt ? avbryt.signal : undefined
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (svar) {
          var ok = svar.ok && String(svar.j.success) === 'true';   // gjelder både FormSubmit og Web3Forms
          if (!ok) {
            var m = String(svar.j.message || '');
            visFeil(/activat/i.test(m)
              ? 'Mottakeradressen er ikke aktivert ennå. Klubben er varslet – i mellomtiden kan du sende forespørselen på e-post.'
              : 'Det oppsto en feil hos tjenesten som sender skjemaet. Prøv igjen litt senere, eller send forespørselen på e-post.');
            return;
          }
          form.reset();
          form.hidden = true;
          var takk = document.getElementById('takk');
          if (takk) { takk.hidden = false; takk.scrollIntoView({ block: 'center' }); }
        })
        .catch(function () {
          visFeil('Vi fikk ikke kontakt med skjematjenesten. Prøv igjen om litt, eller send forespørselen på e-post – den er allerede fylt ut for deg.');
        })
        .then(function () { clearTimeout(tidsfrist); knapp.disabled = false; knapp.textContent = tekst; });
    });
  });
})();
