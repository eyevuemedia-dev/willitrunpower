/* Real-world test submission form. Posts to the proof-submissions Cloudflare Worker.
   Nothing is published automatically: every entry is reviewed by hand first. */
(function () {
  var form = document.getElementById('stf');
  if (!form) return;
  var API = form.getAttribute('data-api');
  var MAX = 8 * 1024 * 1024;
  var OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  var status = document.getElementById('stf-status');
  var btn = form.querySelector('button[type=submit]');
  var qs = new URLSearchParams(location.search);
  var from = qs.get('from');
  if (from && /^\/[\w\-./%]*$/.test(from) && from.length < 300) {
    form.page_url.value = location.origin + from;
    var fl = document.getElementById('stf-from');
    if (fl) { fl.hidden = false; fl.querySelector('a').href = from; fl.querySelector('a').textContent = from; }
  }
  qs.forEach(function (v, k) {
    var el = form.elements[k];
    if (el && k !== 'page_url' && k !== 'site' && el.type !== 'file' && el.type !== 'checkbox' && el.type !== 'hidden' && v.length < 200) el.value = v;
  });
  function say(msg, kind) { status.textContent = msg; status.className = 'stf-status ' + (kind || ''); status.hidden = false; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var photo = form.photo.files[0];
    var link = form.proof_url.value.trim();
    if (!photo && !link) { say('Add a photo or a proof link. One of them is required.', 'bad'); return; }
    if (photo) {
      if (photo.size > MAX) { say('That photo is ' + (photo.size / 1048576).toFixed(1) + ' MB. The limit is 8 MB; crop it or export a JPEG.', 'bad'); return; }
      var t = (photo.type || '').toLowerCase();
      if (t && OK_TYPES.indexOf(t) < 0) { say('Photo must be JPEG, PNG, WebP or HEIC.', 'bad'); return; }
    }
    if (!form.consent.checked) { say('Please tick the consent box.', 'bad'); return; }
    var tok = form.querySelector('[name="cf-turnstile-response"]');
    if (!tok || !tok.value) { say('Waiting for the bot check to finish. Give it a second and submit again.', 'bad'); return; }
    btn.disabled = true; say('Uploading…', '');
    fetch(API, { method: 'POST', body: new FormData(form) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected response (' + r.status + ')' }; }); })
      .then(function (j) {
        if (j.ok) {
          form.reset();
          say('Thanks. Your test is in the review queue (reference ' + String(j.id).slice(0, 8) + '). Nothing goes live until we have checked the proof.', 'good');
        } else say(j.error || 'Something went wrong. Try again or email eyevueventures@gmail.com.', 'bad');
      })
      .catch(function () { say('Network error. Check your connection and try again.', 'bad'); })
      .finally(function () { btn.disabled = false; if (window.turnstile) try { window.turnstile.reset(); } catch (x) {} });
  });
})();
