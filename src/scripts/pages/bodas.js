import '../../styles/global.css'; import '../../styles/pages.css'; import { initGlobalLayout } from '../global.js';
import { getImagesByKeywords } from '../../data/localImages.js';
initGlobalLayout();
const weddingImages=getImagesByKeywords(['boda','wedding','pareja','novia','novio','elopement'],8);
const hero=document.querySelector('.page-hero--weddings');if(hero&&weddingImages[0])hero.style.setProperty('--page-hero-image',`url("${weddingImages[0]}")`);
document.querySelectorAll('.editorial-grid img').forEach((image,index)=>{if(weddingImages[index+1])image.src=weddingImages[index+1];image.closest('picture')?.querySelectorAll('source').forEach(source=>source.remove());});
