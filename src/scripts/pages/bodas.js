import '../../styles/global.css'; import '../../styles/pages.css'; import { initGlobalLayout } from '../global.js';
import { getImagesByKeywords } from '../../data/localImages.js';
import { initGallery3D } from '../features/gallery3D.js';
import '../../styles/gallery3d.css';
import '../../styles/auto-experience.css';
import { initAutoExperience } from '../../components/AutoExperience.js';
initGlobalLayout();
const weddingImages=getImagesByKeywords(['boda','wedding','pareja','novia','novio','elopement'],8);
const hero=document.querySelector('.page-hero--weddings');if(hero&&weddingImages[0])hero.style.setProperty('--page-hero-image',`url("${weddingImages[0]}")`);
document.querySelectorAll('.editorial-grid img').forEach((image,index)=>{if(weddingImages[index+1])image.src=weddingImages[index+1];image.closest('picture')?.querySelectorAll('source').forEach(source=>source.remove());});
const gallery3D = document.createElement('section');
gallery3D.className = 'webgl-gallery';
gallery3D.id = 'galeria-3d';
gallery3D.setAttribute('aria-labelledby', 'gallery-3d-title');
gallery3D.innerHTML = `
  <canvas class="webgl-gallery__canvas" id="canvas-3d" aria-label="Túnel tridimensional de fotografías Fine Art"></canvas>
  <header class="webgl-gallery__heading">
    <p class="eyebrow eyebrow--light">Experiencia inmersiva</p>
    <h2 id="gallery-3d-title">Túnel de Recuerdos 3D</h2>
  </header>
  <p class="webgl-gallery__status" data-webgl-status aria-live="polite">La experiencia se cargará al entrar en esta sección.</p>
  <aside class="webgl-gallery__panel" data-webgl-panel aria-live="polite">
    <p>Historia seleccionada</p><h3 data-webgl-title></h3><p data-webgl-location></p>
    <a href="/cotizar/">Ver cobertura</a>
  </aside>
  <div class="webgl-gallery__controls" aria-label="Controles de la galería 3D">
    <button type="button" data-webgl-zoom-in>Zoom +</button>
    <button type="button" data-webgl-zoom-out>Zoom −</button>
    <button type="button" data-webgl-rotate>Rotar</button>
    <button type="button" data-webgl-reset>Reiniciar</button>
  </div>`;
document.querySelector('.page-cta')?.before(gallery3D);
initGallery3D();
initAutoExperience({ target: gallery3D, type: 'tunnel' });
if (window.location.hash === '#galeria-3d') {
  requestAnimationFrame(() => gallery3D.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}
