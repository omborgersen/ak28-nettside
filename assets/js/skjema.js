// Felles for skjema som sendes med FormSubmit: sett returadresse og vis takk-melding.
(function () {
  var neste = document.getElementById('neste');
  if (neste) neste.value = location.origin + location.pathname + '?sendt=1#takk';
  if (/[?&]sendt=1/.test(location.search)) {
    var takk = document.getElementById('takk');
    if (takk) { takk.hidden = false; takk.scrollIntoView({ block: 'center' }); }
  }
})();
