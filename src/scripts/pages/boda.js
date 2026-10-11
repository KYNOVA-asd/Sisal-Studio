import '../../styles/global.css'; import '../../styles/private-gallery.css';
import { getImagesByKeywords } from '../../data/localImages.js';
const params=new URLSearchParams(window.location.search);const slug=params.get('id')||'nuestra-boda';
const readable=slug.split('-').filter(Boolean).map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' & ');
document.querySelector('[data-pin-form]')?.insertAdjacentHTML('beforebegin','<p class="gallery-access__demo">PIN de demostración: <strong>2026</strong></p>');
document.querySelector('[data-wedding-name]').textContent=readable;document.querySelector('[data-wedding-title]').textContent=readable;document.title=`${readable} | Sisal Studio`;
const form=document.querySelector('[data-pin-form]');const error=document.querySelector('[data-pin-error]');
// Acceso de presentación. Para privacidad real, el PIN debe validarse en servidor.
form.addEventListener('submit',event=>{event.preventDefault();const pin=new FormData(form).get('pin');if(pin!=='2026'){error.textContent='El PIN no es correcto. Inténtalo nuevamente.';return}document.querySelector('[data-access]').hidden=true;document.querySelector('[data-wedding-story]').hidden=false;sessionStorage.setItem(`sisal-access-${slug}`,'true');window.scrollTo(0,0)});
if(sessionStorage.getItem(`sisal-access-${slug}`)==='true'){document.querySelector('[data-access]').hidden=true;document.querySelector('[data-wedding-story]').hidden=false;}
const privateImages=getImagesByKeywords(['boda','wedding','pareja','novia','novio'],6);privateImages.slice(1,6).forEach((source,index)=>{const image=document.querySelectorAll('.wedding-grid img')[index];if(image)image.src=source;});const cover=document.querySelector('.wedding-cover');if(cover&&privateImages[0])cover.style.setProperty('--wedding-cover-image',`url("${privateImages[0]}")`);
