import { getImagesByKeywords } from '../../data/localImages.js';
import { createGallery3DLoader } from '../../components/Gallery3D.js';

const MAX_PHOTOS = 24;

export const initGallery3D = () => {
  const section = document.querySelector('#galeria-3d');
  const canvas = document.querySelector('#canvas-3d');
  if (!section || !canvas) return;

  const status = section.querySelector('[data-webgl-status]');
  const panel = section.querySelector('[data-webgl-panel]');
  const panelTitle = section.querySelector('[data-webgl-title]');
  const panelLocation = section.querySelector('[data-webgl-location]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let experience = null;
  let initializing = false;
  let loader = null;

  const destroyExperience = () => {
    experience?.destroy();
    experience = null;
    loader?.destroy();
    loader = null;
    panel?.classList.remove('is-visible');
  };

  const createExperience = async () => {
    if (experience || initializing) return;
    initializing = true;
    loader = createGallery3DLoader(section);
    loader.update(0);
    status.textContent = 'Preparando los recuerdos…';

    try {
    const THREE = await import('three');
      const photos = getImagesByKeywords(
        ['boda', 'wedding', 'pareja', 'novia', 'novio', 'elopement'],
        MAX_PHOTOS,
      ).map((src, index) => ({
        src,
        alt: `Fotografía Fine Art de boda ${index + 1}`,
        title: `Historia ${String(index + 1).padStart(2, '0')}`,
        location: 'Yucatán y Riviera Maya',
      }));
      if (!photos.length) throw new Error('No hay fotografías locales disponibles para la galería 3D.');
      experience = buildScene(THREE, photos, loader);
      status.textContent = 'Cargando fotografías…';
    } catch (error) {
      status.textContent = 'La galería 3D no está disponible en este dispositivo.';
      section.classList.add('webgl-gallery--fallback');
      loader?.destroy();
      loader = null;
      console.error(error);
    } finally {
      initializing = false;
    }
  };

  const buildScene = (THREE, photos, loadingOverlay) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    scene.fog = new THREE.FogExp2(0x121212, 0.026);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 0, 8);
    const cameraLookAt = new THREE.Vector3(0, 0, -5);
    const cameraTarget = camera.position.clone();
    const lookAtTarget = cameraLookAt.clone();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.AmbientLight(0xfff4e7, 1.7));
    const keyLight = new THREE.DirectionalLight(0xffead6, 2.1);
    keyLight.position.set(4, 7, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const constellation = new THREE.Group();
    scene.add(constellation);
    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(4, 4);
    const meshes = [];
    let animationFrame = 0;
    let running = false;
    let dragging = false;
    let moved = false;
    let previousPointer = { x: 0, y: 0 };
    let autoRotate = false;
    let selectedMesh = null;
    let alive = true;

    loadingManager.onProgress = (_url, loaded, total) => {
      if (alive && total > 0) loadingOverlay?.update((loaded / total) * 100);
    };

    loadingManager.onLoad = () => {
      if (!alive) return;
      loadingOverlay?.complete();
      loader = null;
      status.textContent = 'Arrastra para recorrer el túnel. Selecciona una fotografía para acercarte.';
      if (!running) {
        running = true;
        animate();
      }
    };

    const paperGeometry = new THREE.PlaneGeometry(3.12, 4.02);
    const photoGeometry = new THREE.PlaneGeometry(2.82, 3.62);
    const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xeee7df, roughness: 0.92, metalness: 0 });

    photos.forEach((photo, index) => {
      const angle = index * 1.72;
      const radius = 4.5 + (index % 3) * 0.75;
      const holder = new THREE.Group();
      holder.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.17) * 2.5,
        -index * 3.35,
      );
      holder.rotation.z = ((index % 5) - 2) * 0.035;
      holder.lookAt(0, holder.position.y * 0.25, 6);
      holder.userData.baseRotation = holder.rotation.clone();
      holder.userData.photo = photo;

      const paper = new THREE.Mesh(paperGeometry, paperMaterial);
      paper.castShadow = true;
      paper.receiveShadow = true;
      holder.add(paper);

      const imageMaterial = new THREE.MeshBasicMaterial({ color: 0x887f77, transparent: true, opacity: 0.45 });
      const image = new THREE.Mesh(photoGeometry, imageMaterial);
      image.position.z = 0.015;
      image.userData.holder = holder;
      holder.add(image);
      meshes.push(image);
      constellation.add(holder);

      textureLoader.load(photo.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        imageMaterial.map = texture;
        imageMaterial.color.set(0xffffff);
        imageMaterial.opacity = 1;
        imageMaterial.needsUpdate = true;
      });
    });

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const updatePointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };

    const onPointerDown = (event) => {
      dragging = true;
      moved = false;
      previousPointer = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      updatePointer(event);
      if (!dragging) return;
      const dx = event.clientX - previousPointer.x;
      const dy = event.clientY - previousPointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      constellation.rotation.y += dx * 0.0035;
      constellation.rotation.x += dy * 0.002;
      constellation.rotation.x = THREE.MathUtils.clamp(constellation.rotation.x, -0.3, 0.3);
      previousPointer = { x: event.clientX, y: event.clientY };
    };

    const focusPhoto = (image) => {
      selectedMesh = image;
      const holder = image.userData.holder;
      const worldPosition = new THREE.Vector3();
      const worldQuaternion = new THREE.Quaternion();
      holder.getWorldPosition(worldPosition);
      holder.getWorldQuaternion(worldQuaternion);
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion);
      cameraTarget.copy(worldPosition).add(normal.multiplyScalar(4.2));
      lookAtTarget.copy(worldPosition);
      meshes.forEach((mesh) => { mesh.material.opacity = mesh === image ? 1 : 0.16; });
      panelTitle.textContent = `Boda de ${holder.userData.photo.title}`;
      panelLocation.textContent = holder.userData.photo.location;
      panel.classList.add('is-visible');
    };

    const onPointerUp = (event) => {
      dragging = false;
      if (moved) return;
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const match = raycaster.intersectObjects(meshes, false)[0];
      if (match) focusPhoto(match.object);
    };

    const reset = () => {
      selectedMesh = null;
      cameraTarget.set(0, 0, 8);
      lookAtTarget.set(0, 0, -5);
      constellation.rotation.set(0, 0, 0);
      meshes.forEach((mesh) => { mesh.material.opacity = mesh.material.map ? 1 : 0.45; });
      panel.classList.remove('is-visible');
    };

    const zoom = (amount) => {
      cameraTarget.z = THREE.MathUtils.clamp(cameraTarget.z + amount, 2, 14);
    };

    const animate = () => {
      if (!running) return;
      animationFrame = requestAnimationFrame(animate);
      if (autoRotate && !dragging && !selectedMesh) constellation.rotation.y += 0.0015;
      camera.position.lerp(cameraTarget, reducedMotion ? 1 : 0.065);
      cameraLookAt.lerp(lookAtTarget, reducedMotion ? 1 : 0.08);
      camera.lookAt(cameraLookAt);

      if (!dragging && !selectedMesh && !reducedMotion) {
        meshes.forEach((mesh, index) => {
          const holder = mesh.userData.holder;
          const influence = 0.025 + (index % 4) * 0.002;
          holder.rotation.x = THREE.MathUtils.lerp(holder.rotation.x, holder.userData.baseRotation.x - pointer.y * influence, 0.045);
          holder.rotation.y = THREE.MathUtils.lerp(holder.rotation.y, holder.userData.baseRotation.y + pointer.x * influence, 0.045);
        });
      }
      renderer.render(scene, camera);
    };

    const zoomIn = () => zoom(-1.5);
    const zoomOut = () => zoom(1.5);
    const toggleRotation = () => { autoRotate = !autoRotate; };
    const controls = {
      zoomIn: section.querySelector('[data-webgl-zoom-in]'),
      zoomOut: section.querySelector('[data-webgl-zoom-out]'),
      rotate: section.querySelector('[data-webgl-rotate]'),
      reset: section.querySelector('[data-webgl-reset]'),
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    controls.zoomIn?.addEventListener('click', zoomIn);
    controls.zoomOut?.addEventListener('click', zoomOut);
    controls.rotate?.addEventListener('click', toggleRotation);
    controls.reset?.addEventListener('click', reset);

    return {
      start() { if (!running) { running = true; animate(); } },
      destroy() {
        alive = false;
        running = false;
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        controls.zoomIn?.removeEventListener('click', zoomIn);
        controls.zoomOut?.removeEventListener('click', zoomOut);
        controls.rotate?.removeEventListener('click', toggleRotation);
        controls.reset?.removeEventListener('click', reset);
        meshes.forEach((mesh) => {
          mesh.material.map?.dispose();
          mesh.material.dispose();
        });
        paperGeometry.dispose();
        photoGeometry.dispose();
        paperMaterial.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      },
    };
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) createExperience();
    else destroyExperience();
  }, { rootMargin: '0px', threshold: 0.01 });

  observer.observe(section);
};
