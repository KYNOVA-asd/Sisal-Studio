import './styles/main.css';
import './styles/_calculator.css';
import { initGoldenHourCalculator } from './scripts/features/goldenHourCalc.js';
import { initGallery3D } from './scripts/features/gallery3D.js';

const menuButton = document.querySelector('.header__menu');
const navigation = document.querySelector('.header__nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation?.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });

    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  });
});

const yearElement = document.querySelector('[data-current-year]');
if (yearElement) yearElement.textContent = new Date().getFullYear();

initGoldenHourCalculator();
initGallery3D();

const portfolioFeed = document.querySelector('[data-portfolio-feed]');
const portfolioPrevious = document.querySelector('[data-portfolio-previous]');
const portfolioNext = document.querySelector('[data-portfolio-next]');

const movePortfolio = (direction) => {
  if (!portfolioFeed) return;
  const card = portfolioFeed.querySelector('.portfolio-card');
  const gap = Number.parseFloat(getComputedStyle(portfolioFeed).columnGap) || 0;
  const distance = (card?.getBoundingClientRect().width || 320) + gap;
  portfolioFeed.scrollBy({ left: distance * direction, behavior: 'smooth' });
};

portfolioPrevious?.addEventListener('click', () => movePortfolio(-1));
portfolioNext?.addEventListener('click', () => movePortfolio(1));

document.querySelectorAll('.portfolio-card__media img').forEach((image) => {
  const revealImage = () => image.closest('.portfolio-card')?.classList.remove('is-loading');
  if (image.complete) revealImage();
  else {
    image.addEventListener('load', revealImage, { once: true });
    image.addEventListener('error', revealImage, { once: true });
  }
});

/*
 * Próxima iteración: fade-in progresivo de fotografías.
 *
 * 1. Añadir una clase inicial (por ejemplo `.reveal`) a cada `.gallery__item`.
 * 2. Crear un IntersectionObserver con un threshold cercano a 0.15.
 * 3. Al intersectar, agregar `.is-visible` y ejecutar `unobserve(entry.target)`.
 * 4. Respetar `prefers-reduced-motion` mostrando el contenido sin animación.
 */
