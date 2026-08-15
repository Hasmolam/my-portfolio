/* =============================================================
   Hasan Hüseyin Yolcu — Portfolyo
   Tema geçişi, giriş animasyonu ve iletişim formu.
   ============================================================= */

(function () {
  'use strict';

  /* ---------- Tema ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');

  function systemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggle();
    });
    syncToggle();
  }

  // Kullanıcı elle seçim yapmadıysa sistem değişimini takip et
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    if (!stored) syncToggle();
  });

  /* ---------- Yıl ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Giriş animasyonu ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');

  function revealAll() {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    items.forEach(function (el) { io.observe(el); });

    // Emniyet ağı: gözlemci herhangi bir nedenle tetiklenmezse
    // (bazı gömülü tarayıcılar, agresif güç tasarrufu vb.) içeriği aç.
    setTimeout(revealAll, 2000);
  }

  /* ---------- İletişim formu ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('contact-status');
  var submit = document.getElementById('contact-submit');
  var replyto = document.getElementById('contact-replyto');
  var emailInput = document.getElementById('contact-email');

  var fields = [
    { input: document.getElementById('contact-name'), error: document.getElementById('err-name') },
    { input: emailInput, error: document.getElementById('err-email') },
    { input: document.getElementById('contact-message'), error: document.getElementById('err-message') }
  ];

  function setError(field, show) {
    if (!field.input || !field.error) return;
    field.error.hidden = !show;
    field.input.setAttribute('aria-invalid', show ? 'true' : 'false');
  }

  function validate() {
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!field.input) return;
      var invalid = !field.input.checkValidity();
      setError(field, invalid);
      if (invalid && !firstInvalid) firstInvalid = field.input;
    });
    return firstInvalid;
  }

  // Kullanıcı düzeltmeye başlayınca hatayı temizle
  fields.forEach(function (field) {
    if (!field.input) return;
    field.input.addEventListener('input', function () {
      if (field.input.checkValidity()) setError(field, false);
    });
  });

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var invalid = validate();
    if (invalid) {
      invalid.focus();
      setStatus('Lütfen işaretli alanları kontrol edin.', 'error');
      return;
    }

    if (replyto && emailInput) replyto.value = emailInput.value;

    submit.disabled = true;
    var original = submit.textContent;
    submit.textContent = 'Gönderiliyor…';
    setStatus('');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Gönderim başarısız');
        form.reset();
        fields.forEach(function (field) { setError(field, false); });
        setStatus('Mesajınız iletildi. En kısa sürede dönüş yapacağım.', 'ok');
      })
      .catch(function () {
        setStatus(
          'Mesaj gönderilemedi. Doğrudan hasanhuseyinyolcu25@gmail.com adresine yazabilirsiniz.',
          'error'
        );
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = original;
      });
  });
})();
