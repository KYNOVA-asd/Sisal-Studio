export const createDepthTextEffect = ({ target, text = 'SISAL FINE ART', radius = 220 }) => {
  if (!target) return { destroy() {} };
  const ring = document.createElement('div');
  ring.className = 'depth-effect__ring';
  ring.setAttribute('aria-hidden', 'true');
  const characters = [...` ${text.trim()} `];
  ring.style.setProperty('--total', characters.length);
  ring.style.setProperty('--radius', `${radius}px`);
  characters.forEach((character, index) => {
    const span = document.createElement('span');
    span.textContent = character === ' ' ? '\u00a0' : character;
    span.style.setProperty('--index', index);
    span.style.setProperty('--angle', `${index / characters.length * 360}deg`);
    ring.append(span);
  });
  target.append(ring);
  return { destroy() { ring.remove(); } };
};
