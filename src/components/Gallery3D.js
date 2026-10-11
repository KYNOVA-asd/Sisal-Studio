export const createGallery3DLoader = (section) => {
  const overlay = document.createElement('div');
  overlay.className = 'webgl-loader';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = `
    <div class="webgl-loader__content">
      <span class="webgl-loader__spinner" aria-hidden="true"></span>
      <p class="webgl-loader__label">Preparando recuerdos</p>
      <div class="webgl-loader__track" aria-hidden="true"><span class="webgl-loader__bar"></span></div>
      <output class="webgl-loader__percentage">0%</output>
    </div>`;
  section.append(overlay);

  const bar = overlay.querySelector('.webgl-loader__bar');
  const percentage = overlay.querySelector('.webgl-loader__percentage');

  return {
    update(value) {
      const progress = Math.max(0, Math.min(100, Math.round(value)));
      bar.style.width = `${progress}%`;
      percentage.value = `${progress}%`;
      overlay.setAttribute('aria-label', `Cargando galería 3D: ${progress}%`);
    },
    complete() {
      this.update(100);
      overlay.classList.add('is-complete');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    },
    destroy() {
      overlay.remove();
    },
  };
};
