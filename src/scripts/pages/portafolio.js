import '../../styles/global.css';
import '../../styles/portfolio.css';
import { initGlobalLayout } from '../global.js';
import { initGallery3D } from '../features/gallery3D.js';
initGlobalLayout();
document.querySelectorAll('.portfolio-feed img').forEach((image) => {
  const done = () => image.parentElement?.classList.add('is-loaded');
  if (image.complete) done(); else { image.addEventListener('load', done, { once: true }); image.addEventListener('error', done, { once: true }); }
});
initGallery3D();
