import { createDepthTextEffect } from './DepthTextEffect.js';

export const createDepthHero = ({ target, background, foreground = background, text = 'SISAL FINE ART', clipPath }) => {
  if (!target || !background) return { destroy() {} };
  target.className = 'depth-effect';
  target.innerHTML = `
    <div class="depth-effect__stage">
      <img class="depth-effect__image depth-effect__image--background" src="${background}" alt="Retrato Fine Art de Sisal Studio" width="960" height="1280" fetchpriority="high">
      <div class="depth-effect__ring-mount"></div>
      <img class="depth-effect__image depth-effect__image--foreground" src="${foreground}" alt="" width="960" height="1280" aria-hidden="true">
    </div>`;
  const stage = target.querySelector('.depth-effect__stage');
  const foregroundImage = target.querySelector('.depth-effect__image--foreground');
  if (clipPath) foregroundImage.style.clipPath = clipPath;
  const textEffect = createDepthTextEffect({ target: target.querySelector('.depth-effect__ring-mount'), text });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  const move = (event) => {
    if (reducedMotion || !visible) return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.style.setProperty('--tilt-x', `${-y * 5}deg`);
    stage.style.setProperty('--tilt-y', `${x * 7}deg`);
  };
  const reset = () => { stage.style.setProperty('--tilt-x', '0deg'); stage.style.setProperty('--tilt-y', '0deg'); };
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', reset);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    target.classList.toggle('is-paused', !visible);
  });
  observer.observe(target);
  return { destroy() { observer.disconnect(); stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', reset); textEffect.destroy(); } };
};
