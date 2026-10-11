import '../../styles/global.css';
import '../../styles/blog.css';
import { initGlobalLayout } from '../global.js';
import { getImagesByKeywords } from '../../data/localImages.js';

initGlobalLayout();

const posts = [
  { category: 'Locaciones', title: 'Haciendas de Yucatán: cómo elegir según la luz', excerpt: 'Arquitectura, orientación y horarios que transforman una cobertura.', slug: 'haciendas-yucatan-luz' },
  { category: 'Planeación', title: 'La hora dorada y el timeline perfecto para tu boda', excerpt: 'Una guía práctica para organizar votos, retratos y recepción.', slug: 'hora-dorada-timeline-boda' },
  { category: 'Fine Art', title: 'Fotografía documental y editorial: una mirada que une ambas', excerpt: 'Qué sucede cuando la espontaneidad se encuentra con una dirección sensible.', slug: 'fotografia-documental-editorial' },
];
const images = getImagesByKeywords(['blog', 'boda', 'hacienda', 'pareja'], posts.length);
const grid = document.querySelector('[data-blog-grid]');
if (grid) grid.innerHTML = posts.map((post, index) => `<article class="article-card">
  <div class="article-card__media"><img src="${images[index] || ''}" alt="${post.title}" width="900" height="1125" loading="lazy"></div>
  <p class="article-card__category">${post.category}</p><h3>${post.title}</h3><p>${post.excerpt}</p>
  <span class="article-card__soon">Artículo en preparación</span>
</article>`).join('');
