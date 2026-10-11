import '../styles/before-after.css';
import { findLocalImage } from '../data/localImages.js';

const FALLBACK_BEFORE = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&fm=webp&w=1400&q=55&sat=-40';
const FALLBACK_AFTER = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&fm=webp&w=1400&q=88&sat=8';

export const renderBeforeAfter = (target) => {
  const mount = typeof target === 'string' ? document.querySelector(target) : target;
  if (!mount) return;
  const localBefore = findLocalImage(['before', 'antes', 'original'], 0) || '/assets/comparison/before.webp';
  const localAfter = findLocalImage(['after', 'despues', 'fine-art', 'fineart', 'editada'], 1) || '/assets/comparison/after.webp';
  mount.innerHTML = `<section class="comparison" aria-labelledby="comparison-title">
    <header class="comparison__intro"><p class="eyebrow">El acabado Sisal</p><h2 id="comparison-title">De un instante a una pieza Fine Art</h2><p>Desliza para descubrir el tratamiento de color, luz y textura.</p></header>
    <div class="comparison__stage" style="--reveal:50%">
      <img class="comparison__image" src="${localBefore}" alt="Fotografía antes de la edición Fine Art" data-fallback="${FALLBACK_BEFORE}">
      <div class="comparison__after"><img class="comparison__image" src="${localAfter}" alt="Fotografía con edición Sisal Fine Art" data-fallback="${FALLBACK_AFTER}"></div>
      <span class="comparison__label comparison__label--before">Foto convencional</span><span class="comparison__label comparison__label--after">Sisal Fine Art</span>
      <span class="comparison__divider" aria-hidden="true"><i>↔</i></span>
      <input class="comparison__range" type="range" min="0" max="100" value="50" aria-label="Comparar antes y después">
    </div>
  </section>`;
  const stage = mount.querySelector('.comparison__stage');
  const range = mount.querySelector('.comparison__range');
  range.addEventListener('input', () => stage.style.setProperty('--reveal', `${range.value}%`));
  mount.querySelectorAll('img[data-fallback]').forEach((image) => image.addEventListener('error', () => { image.src = image.dataset.fallback; }, { once: true }));
};
