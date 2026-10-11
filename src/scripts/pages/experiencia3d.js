import '../../styles/tokens.css';
import '../../styles/lightbox3d.css';
import '../../styles/gallery3d.css';
import '../../styles/auto-experience.css';
import { initLightbox3D } from '../features/lightbox3D.js';
import { initAutoExperience } from '../../components/AutoExperience.js';

initLightbox3D();
initAutoExperience({ target: document.querySelector('.lightbox-3d-page'), type: 'lightbox' });
