import { createGallery3DLoader } from '../../components/Gallery3D.js';
import { getImagesByKeywords } from '../../data/localImages.js';

const CARD_COUNT = 12;

export const initLightbox3D = async () => {
  const section = document.querySelector('.lightbox-3d-page');
  const canvas = document.querySelector('#canvas-lightbox');
  if (!section || !canvas) return;

  const loaderUI = createGallery3DLoader(section);
  const panel = section.querySelector('[data-lightbox-panel]');
  const panelTitle = section.querySelector('[data-lightbox-photo-title]');
  const resetButton = section.querySelector('[data-lightbox-reset]');
  let cleanup = () => {};

  try {
    const THREE = await import('three');
    const imageSources = getImagesByKeywords(
      ['boda', 'wedding', 'pareja', 'novia', 'evento', 'fineart', 'editorial'],
      CARD_COUNT,
    );
    if (!imageSources.length) throw new Error('No hay imágenes disponibles.');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121110);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 70);
    camera.position.set(0, 9.5, 10.5);
    const cameraHome = camera.position.clone();
    const cameraTarget = camera.position.clone();
    const lookCurrent = new THREE.Vector3(0, 0, 0);
    const lookTarget = new THREE.Vector3(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.AmbientLight(0xffead6, 1.15));
    const keyLight = new THREE.DirectionalLight(0xffd7aa, 3.1);
    keyLight.position.set(-4, 11, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.radius = 7;
    scene.add(keyLight);

    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.82, metalness: 0.03 });
    const tableGeometry = new THREE.PlaneGeometry(26, 20);
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.08;
    table.receiveShadow = true;
    scene.add(table);

    const manager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(manager);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(4, 4);
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.38);
    const planeHit = new THREE.Vector3();
    const cards = [];
    const interactiveMeshes = [];
    let draggedCard = null;
    let selectedCard = null;
    let pointerDownAt = 0;
    let pointerTravel = 0;
    let previousClient = { x: 0, y: 0, time: 0 };
    let dragOffset = new THREE.Vector3();
    let animationFrame = 0;
    let active = true;
    let autoMode = false;
    let destroyed = false;

    const makeCard = (source, index) => {
      const card = new THREE.Group();
      const column = index % 4;
      const row = Math.floor(index / 4);
      const home = new THREE.Vector3(
        (column - 1.5) * 3.15 + (row % 2) * 0.4,
        0.12 + index * 0.003,
        (row - 1) * 3.8 + (column % 2) * 0.3,
      );
      card.position.copy(home);
      card.rotation.y = ((index * 37) % 22 - 11) * Math.PI / 180;

      const paperGeometry = new THREE.BoxGeometry(2.65, 0.09, 3.4);
      const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf4eee6, roughness: 0.4, metalness: 0.01 });
      const paper = new THREE.Mesh(paperGeometry, paperMaterial);
      paper.castShadow = true;
      paper.receiveShadow = true;
      card.add(paper);

      const photoGeometry = new THREE.PlaneGeometry(2.34, 2.82);
      const photoMaterial = new THREE.MeshStandardMaterial({ color: 0x6d665f, roughness: 0.4, metalness: 0.01 });
      const photo = new THREE.Mesh(photoGeometry, photoMaterial);
      photo.rotation.x = -Math.PI / 2;
      photo.position.set(0, 0.052, -0.12);
      photo.receiveShadow = true;
      photo.userData.card = card;
      card.add(photo);

      const shadowGeometry = new THREE.PlaneGeometry(2.7, 3.45);
      const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12, depthWrite: false });
      const softShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      softShadow.rotation.x = -Math.PI / 2;
      softShadow.position.y = -0.105;
      card.add(softShadow);

      card.userData = {
        home,
        homeRotation: card.rotation.y,
        velocity: new THREE.Vector3(),
        verticalVelocity: 0,
        dragging: false,
        photo,
        softShadow,
        title: `Colección Fine Art · ${String(index + 1).padStart(2, '0')}`,
      };
      cards.push(card);
      interactiveMeshes.push(photo);
      scene.add(card);

      textureLoader.load(source, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        const imageAspect = texture.image.width / texture.image.height;
        const frameAspect = 2.34 / 2.82;
        if (imageAspect > frameAspect) {
          texture.repeat.x = frameAspect / imageAspect;
          texture.offset.x = (1 - texture.repeat.x) / 2;
        } else {
          texture.repeat.y = imageAspect / frameAspect;
          texture.offset.y = (1 - texture.repeat.y) / 2;
        }
        photoMaterial.map = texture;
        photoMaterial.color.set(0xffffff);
        photoMaterial.needsUpdate = true;
      });
    };

    manager.onProgress = (_url, loaded, total) => loaderUI.update(total ? loaded / total * 100 : 0);
    manager.onLoad = () => {
      if (destroyed) return;
      loaderUI.complete();
      animate();
    };
    imageSources.forEach(makeCard);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      camera.aspect = bounds.width / Math.max(bounds.height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
    };

    const setPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      pointer.y = -(event.clientY - bounds.top) / bounds.height * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    };

    const onPointerDown = (event) => {
      setPointer(event);
      const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
      if (!hit) return;
      draggedCard = hit.object.userData.card;
      draggedCard.userData.dragging = true;
      draggedCard.userData.velocity.set(0, 0, 0);
      pointerDownAt = performance.now();
      pointerTravel = 0;
      previousClient = { x: event.clientX, y: event.clientY, time: performance.now() };
      if (raycaster.ray.intersectPlane(dragPlane, planeHit)) dragOffset.copy(planeHit).sub(draggedCard.position);
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!draggedCard) return;
      setPointer(event);
      if (!raycaster.ray.intersectPlane(dragPlane, planeHit)) return;
      const now = performance.now();
      const elapsed = Math.max((now - previousClient.time) / 1000, 0.008);
      const target = planeHit.sub(dragOffset);
      const dx = event.clientX - previousClient.x;
      const dy = event.clientY - previousClient.y;
      pointerTravel += Math.hypot(dx, dy);
      draggedCard.userData.velocity.set(
        THREE.MathUtils.clamp((target.x - draggedCard.position.x) / elapsed, -14, 14),
        0,
        THREE.MathUtils.clamp((target.z - draggedCard.position.z) / elapsed, -14, 14),
      );
      draggedCard.position.x = THREE.MathUtils.clamp(target.x, -10.5, 10.5);
      draggedCard.position.z = THREE.MathUtils.clamp(target.z, -7.5, 7.5);
      draggedCard.position.y = THREE.MathUtils.lerp(draggedCard.position.y, 0.62, 0.45);
      draggedCard.rotation.z = THREE.MathUtils.clamp(-dx * 0.008, -0.18, 0.18);
      draggedCard.rotation.x = THREE.MathUtils.clamp(dy * 0.006, -0.14, 0.14);
      draggedCard.userData.softShadow.material.opacity = 0.055;
      previousClient = { x: event.clientX, y: event.clientY, time: now };
    };

    const focusCard = (card) => {
      selectedCard = card;
      cameraTarget.set(card.position.x, 6.2, card.position.z + 0.15);
      lookTarget.copy(card.position);
      panelTitle.textContent = card.userData.title;
      panel.classList.add('is-visible');
    };

    const onPointerUp = () => {
      if (!draggedCard) return;
      const card = draggedCard;
      card.userData.dragging = false;
      card.userData.verticalVelocity = -0.15;
      if (pointerTravel < 6 && performance.now() - pointerDownAt < 350) focusCard(card);
      draggedCard = null;
    };

    const resetTable = () => {
      selectedCard = null;
      panel.classList.remove('is-visible');
      cameraTarget.copy(cameraHome);
      lookTarget.set(0, 0, 0);
      cards.forEach((card) => {
        card.position.copy(card.userData.home);
        card.rotation.set(0, card.userData.homeRotation, 0);
        card.userData.velocity.set(0, 0, 0);
        card.userData.verticalVelocity = 0;
      });
    };

    const onAutoMode = (event) => {
      autoMode = Boolean(event.detail?.enabled);
      if (!autoMode) {
        cameraTarget.copy(cameraHome);
        lookTarget.set(0, 0, 0);
      }
    };

    const clock = new THREE.Clock();
    const animate = () => {
      if (destroyed || !active) return;
      animationFrame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.033);
      if (autoMode && !selectedCard && !draggedCard) {
        const time = performance.now() * 0.00022;
        cameraTarget.set(Math.sin(time) * 2.1, 9.2 + Math.sin(time * 1.7) * .45, 10.2 + Math.cos(time) * 1.2);
        lookTarget.set(Math.sin(time * .7) * 1.2, 0, Math.cos(time * .55) * .8);
      }
      cards.forEach((card) => {
        if (card.userData.dragging) return;
        card.position.addScaledVector(card.userData.velocity, delta);
        card.userData.velocity.multiplyScalar(Math.pow(0.085, delta));
        card.userData.verticalVelocity -= 7.2 * delta;
        card.position.y += card.userData.verticalVelocity * delta;
        const floor = card.userData.home.y;
        if (card.position.y < floor) {
          card.position.y = floor;
          if (Math.abs(card.userData.verticalVelocity) > 0.08) card.userData.verticalVelocity *= -0.16;
          else card.userData.verticalVelocity = 0;
        }
        if (Math.abs(card.position.x) > 10.6) { card.position.x = THREE.MathUtils.clamp(card.position.x, -10.6, 10.6); card.userData.velocity.x *= -0.22; }
        if (Math.abs(card.position.z) > 7.6) { card.position.z = THREE.MathUtils.clamp(card.position.z, -7.6, 7.6); card.userData.velocity.z *= -0.22; }
        card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, 0, 0.11);
        card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, 0, 0.11);
        card.userData.softShadow.material.opacity = THREE.MathUtils.lerp(card.userData.softShadow.material.opacity, 0.12, 0.08);
      });
      camera.position.lerp(cameraTarget, 0.065);
      lookCurrent.lerp(lookTarget, 0.08);
      camera.lookAt(lookCurrent);
      renderer.render(scene, camera);
    };

    const onVisibility = () => {
      active = !document.hidden;
      if (active && !destroyed && !animationFrame) { clock.getDelta(); animate(); }
      if (!active) { cancelAnimationFrame(animationFrame); animationFrame = 0; }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    resetButton?.addEventListener('click', resetTable);
    section.addEventListener('sisal:auto-mode', onAutoMode);

    cleanup = () => {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      resetButton?.removeEventListener('click', resetTable);
      section.removeEventListener('sisal:auto-mode', onAutoMode);
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      });
      scene.clear();
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      loaderUI.destroy();
    };

    window.addEventListener('pagehide', cleanup, { once: true });
  } catch (error) {
    console.error(error);
    loaderUI.destroy();
    document.documentElement.classList.add('lightbox-webgl-error');
  }

  return cleanup;
};
