export const initDemoCaptcha = (form) => {
  if (!form) return;

  const submit = form.querySelector('[type="submit"]');
  const trap = document.createElement('label');
  trap.className = 'quote-form__trap';
  trap.setAttribute('aria-hidden', 'true');
  trap.innerHTML = 'Sitio web<input name="website" tabindex="-1" autocomplete="off">';

  const card = document.createElement('fieldset');
  card.className = 'demo-captcha';
  card.innerHTML = `
    <legend>Verificación de seguridad</legend>
    <label class="demo-captcha__check">
      <input type="checkbox" data-captcha-check required>
      <span aria-hidden="true"></span>
      <b>Sí, soy una persona</b>
    </label>
    <input type="hidden" name="captcha_answer" value="">
    <p data-captcha-state>Marca la casilla para continuar</p>
  `;
  submit.before(trap, card);

  const check = card.querySelector('[data-captcha-check]');
  const state = card.querySelector('[data-captcha-state]');
  const answer = card.querySelector('[name="captcha_answer"]');

  check.addEventListener('change', () => {
    answer.value = check.checked ? 'yes' : '';
    card.classList.toggle('is-verified', check.checked);
    state.textContent = check.checked
      ? 'Verificación completada.'
      : 'Marca la casilla para continuar';
  });
};
