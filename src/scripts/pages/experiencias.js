import '../../styles/global.css';
import '../../styles/experiences.css';
import '../../styles/experiences-overrides.css';
import '../../styles/depth-hero.css';
import { initGlobalLayout } from '../global.js';
import { createDepthHero } from '../../components/DepthHero.js';
import { getImagesByKeywords } from '../../data/localImages.js';

initGlobalLayout();
const [portrait] = getImagesByKeywords(['pareja', 'boda', 'novia', 'xv'], 1);
createDepthHero({
  target: document.querySelector('[data-depth-hero]'),
  background: portrait,
  text: 'SISAL FINE ART',
  clipPath: 'polygon(32% 16%, 67% 14%, 78% 33%, 72% 48%, 84% 100%, 18% 100%, 27% 53%, 22% 34%)',
});
