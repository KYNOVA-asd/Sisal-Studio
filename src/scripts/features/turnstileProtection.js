const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TEST_SITE_KEY = '1x00000000000000000000AA';

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) return resolve(window.turnstile);
  const script = document.createElement('script');
  script.src = SCRIPT_URL;
  script.async = true;
  script.defer = true;
  script.addEventListener('load', () => resolve(window.turnstile), { once: true });
  script.addEventListener('error', reject, { once: true });
  document.head.append(script);
});

export const initTurnstileProtection = async (form) => {
  if (!form) return;
  const submit = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-quote-status]');
  const trap = document.createElement('label');
  trap.className = 'quote-form__trap';
  trap.setAttribute('aria-hidden', 'true');
  trap.innerHTML = 'Sitio web<input name="website" tabindex="-1" autocomplete="off">';
  const mount = document.createElement('div');
  mount.className = 'quote-form__turnstile';
  mount.innerHTML = '<p>Verificando que eres una persona…</p>';
  submit.before(trap, mount);
  try {
    const turnstile = await loadTurnstile();
    mount.innerHTML = '';
    turnstile.render(mount, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || TEST_SITE_KEY,
      theme: 'light', size: 'flexible', action: 'generate_proposal',
      'error-callback': () => { status.textContent = 'No pudimos completar la verificación. Recarga e inténtalo nuevamente.'; },
      'expired-callback': () => { status.textContent = 'La verificación expiró. Confírmala nuevamente.'; },
    });
  } catch {
    mount.innerHTML = '<p>No pudimos cargar la verificación anti-spam. Revisa tu conexión y recarga la página.</p>';
  }
};
