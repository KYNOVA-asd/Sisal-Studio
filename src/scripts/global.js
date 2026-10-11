import { renderHeader } from '../components/Header.js';
import { renderFooter } from '../components/Footer.js';

export const initGlobalLayout = () => {
  renderHeader(); renderFooter();
  const button = document.querySelector('.site-header__menu');
  const nav = document.querySelector('.site-nav');
  button?.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
  });
};
