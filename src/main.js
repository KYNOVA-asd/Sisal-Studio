import './styles/main.css';

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

/*
 * Próxima iteración: fade-in progresivo de fotografías.
 *
 * 1. Añadir una clase inicial (por ejemplo `.reveal`) a cada `.gallery__item`.
 * 2. Crear un IntersectionObserver con un threshold cercano a 0.15.
 * 3. Al intersectar, agregar `.is-visible` y ejecutar `unobserve(entry.target)`.
 * 4. Respetar `prefers-reduced-motion` mostrando el contenido sin animación.
 */
