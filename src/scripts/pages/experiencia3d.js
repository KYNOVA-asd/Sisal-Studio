import '../../styles/tokens.css';
import '../../styles/lightbox3d.css';
import '../../styles/gallery3d.css';
import { initLightbox3D } from '../features/lightbox3D.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) document.documentElement.classList.add('lightbox-reduced-motion');
else initLightbox3D();
