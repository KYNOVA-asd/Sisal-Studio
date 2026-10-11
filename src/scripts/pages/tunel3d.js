import '../../styles/tokens.css';
import '../../styles/gallery3d.css';
import '../../styles/auto-experience.css';
import '../../styles/tunnel-page.css';
import { initGallery3D } from '../features/gallery3D.js';
import { initAutoExperience } from '../../components/AutoExperience.js';

initGallery3D();
initAutoExperience({ target: document.querySelector('#galeria-3d'), type: 'tunnel' });
