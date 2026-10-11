import '../../styles/global.css';
import '../../styles/portfolio-all.css';
import { initGlobalLayout } from '../global.js';
import { localImages } from '../../data/localImages.js';

initGlobalLayout();
const wall = document.querySelector('[data-portfolio-wall]');
const empty = document.querySelector('[data-portfolio-empty]');
const dialog = document.querySelector('[data-portfolio-lightbox]');
const full = dialog.querySelector('[data-portfolio-full]');
const caption = dialog.querySelector('[data-portfolio-caption]');

const classify = (path) => {
  if (/hacienda|cenote|venue|hotel|locacion|arquitectura|selva/.test(path)) return 'locaciones';
  if (/xv|quince|bautizo|evento|fiesta|child|adult/.test(path)) return 'eventos';
  return 'bodas';
};
const titleFromPath = (path, index) => {
  const name = path.split('/').pop().replace(/\.(webp|avif)$/i, '').replace(/[-_]+/g, ' ').trim();
  return name.length > 4 ? name : `Colección Sisal ${String(index + 1).padStart(2, '0')}`;
};
const items = localImages.map((image, index) => ({ ...image, index, category: classify(image.path), title: titleFromPath(image.path, index) }));

const render = (filter = 'all') => {
  const visible = filter === 'all' ? items : items.filter((item) => item.category === filter);
  empty.hidden = visible.length > 0;
  wall.innerHTML = visible.map((item) => `<button class="portfolio-shot portfolio-shot--${item.index % 5}" type="button" data-src="${item.url}" data-title="${item.title.replace(/"/g, '&quot;')}"><span class="portfolio-shot__skeleton"></span><img src="${item.url}" alt="${item.title.replace(/"/g, '&quot;')}" width="900" height="1200" loading="lazy" decoding="async"><span class="portfolio-shot__meta"><small>${item.category}</small><b>Ver fotografía</b></span></button>`).join('');
  wall.querySelectorAll('img').forEach((image) => {
    const ready = () => image.closest('.portfolio-shot').classList.add('is-loaded');
    if (image.complete) ready(); else image.addEventListener('load', ready, { once: true });
  });
};

document.querySelector('[data-portfolio-filters]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
  render(button.dataset.filter);
});
wall.addEventListener('click', (event) => {
  const shot = event.target.closest('.portfolio-shot');
  if (!shot) return;
  full.src = shot.dataset.src;
  caption.textContent = shot.dataset.title;
  dialog.showModal();
});
dialog.querySelector('[data-portfolio-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
render();
