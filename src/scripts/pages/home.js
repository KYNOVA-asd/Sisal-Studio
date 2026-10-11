import '../../styles/global.css';
import '../../styles/home.css';
import { initGlobalLayout } from '../global.js';
import { renderBeforeAfter } from '../../components/BeforeAfter.js';
import { findLocalImage } from '../../data/localImages.js';
initGlobalLayout();
const heroImage = document.querySelector('.hero__image');
const localHero = findLocalImage(['hero', 'portada', 'principal', 'banner'], 0);
if (heroImage && localHero) {
  heroImage.src = localHero;
  heroImage.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
}
const comparisonMount = document.createElement('div');
comparisonMount.dataset.beforeAfter = '';
document.querySelector('main')?.append(comparisonMount);
renderBeforeAfter(comparisonMount);
