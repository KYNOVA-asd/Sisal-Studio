export const initAutoExperience = ({ target, type }) => {
  if (!target) return () => {};
  const button = document.createElement('button');
  button.className = 'auto-experience';
  button.type = 'button';
  button.innerHTML = '<span aria-hidden="true"></span><b>Modo automático</b>';
  button.setAttribute('aria-pressed', 'false');
  target.append(button);
  let enabled = false;
  let timer = 0;
  let direction = 1;
  let liquidIndex = -1;

  const step = () => {
    if (!enabled) return;
    if (type === 'helix') target.dispatchEvent(new WheelEvent('wheel', { deltaY: 18 * direction, bubbles: true, cancelable: true }));
    if (type === 'museum') {
      target.dispatchEvent(new WheelEvent('wheel', { deltaY: 18 * direction, bubbles: true }));
      const progress = target.querySelector('[data-museum-progress]');
      const value = Number.parseFloat(progress?.style.width || '0');
      if (value > 96) direction = -1;
      if (value < 2) direction = 1;
    }
    if (type === 'liquid') {
      const cards = [...target.querySelectorAll('.editorial-card')];
      cards[liquidIndex]?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      liquidIndex = (liquidIndex + 1) % Math.max(cards.length, 1);
      cards[liquidIndex]?.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    }
  };
  const setEnabled = (next) => {
    enabled = next;
    button.classList.toggle('is-active', enabled);
    button.setAttribute('aria-pressed', String(enabled));
    button.querySelector('b').textContent = enabled ? 'Pausar automático' : 'Modo automático';
    target.dispatchEvent(new CustomEvent('sisal:auto-mode', { detail: { enabled } }));
    if (type === 'tunnel') target.querySelector('[data-webgl-rotate]')?.click();
    window.clearInterval(timer);
    if (enabled && ['helix', 'museum', 'liquid'].includes(type)) {
      step();
      timer = window.setInterval(step, type === 'liquid' ? 1800 : 420);
    }
  };
  button.addEventListener('click', () => setEnabled(!enabled));
  const stopOnManualInput = (event) => {
    if (enabled && !event.target.closest('.auto-experience')) setEnabled(false);
  };
  target.addEventListener('pointerdown', stopOnManualInput);
  return () => { window.clearInterval(timer); button.remove(); };
};
