(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzmJSy4a75OnqOShXtzg0yQQlpcRxiC1NWOtBgfQe9cPpCc5sDMiXEO9xhHrpZFWGtPnQ/exec';
  var TOKEN = '';
  var ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  try {
    if (/[?&](gclid|gbraid|wbraid|utm_source)=/.test(location.search)) {
      sessionStorage.setItem('lead_landing', location.href);
    }
  } catch (e) {}

  function paginaOrigem() {
    try { return sessionStorage.getItem('lead_landing') || location.href; }
    catch (e) { return location.href; }
  }

  function origemDe(p) {
    return /[?&](gclid|gbraid|wbraid)=|[?&]utm_source=google/i.test(p) ? 'google' : 'organico';
  }

  function gerarCodigo() {
    var s = '';
    for (var i = 0; i < 4; i++) {
      s += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length));
    }
    return s;
  }

  function ehWhatsapp(h) {
    return /^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(h || '');
  }

  function enviar(ref) {
    var p = paginaOrigem();
    var payload = JSON.stringify({
      token: TOKEN,
      nome: 'Lead WhatsApp',
      pagina: p,
      origem: origemDe(p),
      ref: ref
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain;charset=UTF-8' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST', mode: 'no-cors', keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: payload
        });
      }
    } catch (e) {}
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href]');
    if (!a) return;

    var original = a.getAttribute('data-wa-original') || a.getAttribute('href');
    if (!ehWhatsapp(original)) return;
    a.setAttribute('data-wa-original', original);

    var ref = gerarCodigo();

    try {
      var u = new URL(original, location.href);
      var texto = u.searchParams.get('text') || '';
      u.searchParams.set('text', (texto + ' (Ref: ' + ref + ')').trim());
      a.setAttribute('href', u.toString().replace(/\+/g, '%20'));
    } catch (e) {}

    enviar(ref);
  }, true);
})();
