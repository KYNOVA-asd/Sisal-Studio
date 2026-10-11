import { renderHeader } from '../components/Header.js';
import { renderFooter } from '../components/Footer.js';
import { createGallery3DLoader } from '../components/Gallery3D.js';
import { initAutoExperience } from '../components/AutoExperience.js';
import '../styles/auto-experience.css';

export const initGlobalLayout = () => {
  renderHeader(); renderFooter();
  if (document.querySelector('.liquid-page')) {
    initAutoExperience({ target: document.querySelector('.liquid-page'), type: 'liquid' });
    const loader = createGallery3DLoader(document.querySelector('.liquid-page'));
    let progress = 8;
    const timer = window.setInterval(() => {
      progress = Math.min(92, progress + 7);
      loader.update(progress);
    }, 90);
    window.addEventListener('load', () => {
      window.clearInterval(timer);
      loader.complete();
    }, { once: true });
  }
  const button = document.querySelector('.site-header__menu');
  const nav = document.querySelector('.site-nav');
  button?.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
  });
};
