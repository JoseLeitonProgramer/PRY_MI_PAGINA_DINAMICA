/* sb-forms-latest.js
   Reemplazo ligero para uso offline.
   - Valida campos con data-sb-validations="required" y "email"
   - Muestra #submitSuccessMessage o #submitErrorMessage
   - Evita envío real (no hace POST a StartBootstrap)
*/

(function () {
  'use strict';

  function isEmail(value) {
    // comprobación simple de email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateField(field) {
    var rules = (field.getAttribute('data-sb-validations') || '').split(',');
    var val = (field.value || '').trim();
    var ok = true;
    rules.forEach(function (r) {
      r = r.trim();
      if (r === 'required' && val === '') ok = false;
      if (r === 'email' && val !== '' && !isEmail(val)) ok = false;
    });
    return ok;
  }

  function show(el) { if (!el) return; el.classList.remove('d-none'); el.classList.add('d-block'); }
  function hide(el) { if (!el) return; el.classList.add('d-none'); el.classList.remove('d-block'); }

  function markInvalid(field, feedbackSelector) {
    field.classList.add('is-invalid');
    var fb = field.parentNode.querySelector('[data-sb-feedback="' + feedbackSelector + '"]');
    if (fb) fb.style.display = 'block';
  }
  function clearInvalid(field) {
    field.classList.remove('is-invalid');
    var fbs = field.parentNode.querySelectorAll('[data-sb-feedback]');
    fbs.forEach(function (fb) { fb.style.display = 'none'; });
  }

  function initForm(form) {
    if (!form) return;
    var submitButton = form.querySelector('#submitButton');
    var successMsg = document.getElementById('submitSuccessMessage');
    var errorMsg = document.getElementById('submitErrorMessage');

    // Habilitar botón en caso esté disabled por plantilla
    if (submitButton && submitButton.classList.contains('disabled')) {
      submitButton.classList.remove('disabled');
      submitButton.disabled = false;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      // limpiar mensajes
      hide(successMsg);
      hide(errorMsg);

      // validar campos con data-sb-validations
      var valid = true;
      var fields = form.querySelectorAll('[data-sb-validations]');
      fields.forEach(function (field) {
        clearInvalid(field);
        if (!validateField(field)) {
          valid = false;
          // feedback key: name:required or name:email (convention used en plantilla)
          var keyReq = field.id + ':required';
          var keyEmail = field.id + ':email';
          if (!validateField(field)) markInvalid(field, keyReq);
          if (field.getAttribute('type') === 'email' && !isEmail(field.value)) markInvalid(field, keyEmail);
        }
      });

      if (!valid) {
        // mostrar error si hay invalidaciones
        show(errorMsg);
        return;
      }

      // Simular envío real: mostrar mensaje de éxito
      show(successMsg);

      // Si quieres que el mensaje desaparezca después de X segundos, descomenta:
      // setTimeout(function(){ hide(successMsg); }, 5000);

      // Opcional: aquí podrías hacer un fetch() a tu servidor local si quisieras
      // fetch('/contact-handler.php', { method: 'POST', body: new FormData(form) })...
    });
  }

  // Inicializar todos los forms que tengan data-sb-form-api-token (o cualquier form)
  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form[data-sb-form-api-token], form#contactForm');
    forms.forEach(initForm);
  });

})();
