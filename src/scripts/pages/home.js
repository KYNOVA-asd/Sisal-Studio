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
const experiences = document.createElement('div');
experiences.className = 'immersive-index';
experiences.innerHTML = `
  <header class="immersive-index__heading">
    <p class="eyebrow">Sisal Experimental</p>
    <h2>Cuatro maneras de entrar en una fotografía.</h2>
    <p>Experiencias interactivas construidas alrededor de nuestra colección Fine Art.</p>
  </header>
  <div class="immersive-index__grid">
    <a href="/experiencia-3d/"><span>01</span><h3>Mesa de Luz</h3><p>Arrastra y explora impresiones con físicas.</p></a>
    <a href="/galeria-editorial/"><span>02</span><h3>Galería Líquida</h3><p>Distorsión editorial mediante shaders.</p></a>
    <a href="/espiral-3d/"><span>03</span><h3>Colección Infinita</h3><p>Una espiral tridimensional de recuerdos.</p></a>
    <a href="/museo-3d/"><span>04</span><h3>Museo Virtual</h3><p>Recorre una exposición inspirada en Yucatán.</p></a>
  </div>`;
document.querySelector('main')?.append(experiences);
