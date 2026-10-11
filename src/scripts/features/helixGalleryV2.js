import { createGallery3DLoader } from '../../components/Gallery3D.js';
import { getGalleryImages } from '../../data/localImages.js';

export const initHelixGallery = async () => {
  const container = document.querySelector('#helix-container');
  if (!container) return;
  const loaderUI = createGallery3DLoader(container);

  try {
    const [THREE, { CSS3DRenderer, CSS3DObject }] = await Promise.all([
      import('three'),
      import('three/addons/renderers/CSS3DRenderer.js'),
    ]);
    const originals = getGalleryImages(50);
    if (!originals.length) throw new Error('No hay imágenes para la colección.');
    const sources = Array.from({ length: Math.min(40, Math.max(30, originals.length)) }, (_, index) => originals[index % originals.length]);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 1, 5000);
    camera.position.z = 1150;
    const group = new THREE.Group();
    scene.add(group);
    const renderer = new CSS3DRenderer();
    renderer.setSize(innerWidth, innerHeight);
    Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0' });
    container.prepend(renderer.domElement);
    const modal = container.querySelector('[data-helix-lightbox]');
    let loaded = 0;

    sources.forEach((src, index) => {
      const element = document.createElement('div');
      element.className = 'helix-card';
      const image = new Image();
      image.src = src;
      image.alt = `Fotografía Fine Art ${index + 1}`;
      image.width = 220;
      image.height = 280;
      image.decoding = 'async';
      const settle = () => {
        loaded += 1;
        loaderUI.update(loaded / sources.length * 100);
        if (loaded === sources.length) loaderUI.complete();
      };
      image.addEventListener('load', settle, { once: true });
      image.addEventListener('error', settle, { once: true });
      element.append(image);
      element.addEventListener('click', () => {
        modal.querySelector('img').src = src;
        modal.showModal();
      });
      const object = new CSS3DObject(element);
      const theta = index * .55;
      const radius = innerWidth < 700 ? 430 : 720;
      object.position.setFromCylindricalCoords(radius, theta, (index - sources.length / 2) * 92);
      // Conserva la misma altura y orienta solo X/Z: evita el giro visual de 90°.
      const facing = object.position.clone();
      facing.x *= 2;
      facing.z *= 2;
      object.lookAt(facing);
      group.add(object);
    });

    modal.querySelector('[data-helix-close]')?.addEventListener('click', () => modal.close());
    let velocity = 0;
    let targetY = 0;
    let frame = 0;
    let touchY = 0;
    const impulse = (delta) => { velocity += THREE.MathUtils.clamp(delta * .000018, -.035, .035); };
    const wheel = (event) => { event.preventDefault(); impulse(event.deltaY); };
    const touchStart = (event) => { touchY = event.touches[0].clientY; };
    const touchMove = (event) => { const y = event.touches[0].clientY; impulse((touchY - y) * 8); touchY = y; };
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += velocity;
      targetY += velocity * 150;
      group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, .08);
      velocity *= .94;
      renderer.render(scene, camera);
    };
    container.addEventListener('wheel', wheel, { passive: false });
    container.addEventListener('touchstart', touchStart, { passive: true });
    container.addEventListener('touchmove', touchMove, { passive: true });
    addEventListener('resize', resize);
    animate();
    addEventListener('pagehide', () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('wheel', wheel);
      container.removeEventListener('touchstart', touchStart);
      container.removeEventListener('touchmove', touchMove);
      removeEventListener('resize', resize);
      group.clear();
      renderer.domElement.remove();
      loaderUI.destroy();
    }, { once: true });
  } catch (error) {
    console.error(error);
    loaderUI.destroy();
    container.classList.add('helix-fallback');
  }
};
