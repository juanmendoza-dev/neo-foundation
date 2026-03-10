import * as THREE from 'three';
import gsap from 'gsap';

const EARTH_TEXTURE_URL = 'https://unpkg.com/three-globe/example/img/earth-day.jpg';
const DEG75 = (75 * Math.PI) / 180;
const AUTO_SPEED = (Math.PI * 2) / (20 * 60); // ~20s per full rotation
const DAMPING = 0.95;
const VELOCITY_THRESHOLD = 0.001;
const CLICK_THRESHOLD = 5; // px — less than this = click, not drag

// Preloaded texture (starts loading immediately on import)
let earthTexture = null;
const textureLoader = new THREE.TextureLoader();
textureLoader.load(EARTH_TEXTURE_URL, (tex) => {
  tex.colorSpace = THREE.SRGBColorSpace;
  earthTexture = tex;
});

/**
 * Creates an interactive globe rendered via scissor on the shared starfield canvas.
 * @param {HTMLElement} container - The .hero-globe div (used for positioning + events)
 * @param {THREE.WebGLRenderer} sharedRenderer - The starfield's renderer
 * @returns {Function} renderCallback to be called each frame from starfield loop
 */
export function initGlobe(container, sharedRenderer) {
  if (!container || !sharedRenderer) return null;

  // ── Scene setup ───────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5;

  // ── Globe group (holds all meshes, receives rotation) ──
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // ── Wireframe spheres ─────────────────────────
  const wireGeo1 = new THREE.SphereGeometry(1.6, 24, 16);
  const wireMat1 = new THREE.MeshBasicMaterial({
    color: 0x06B6D4,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const wireSphere1 = new THREE.Mesh(wireGeo1, wireMat1);
  globeGroup.add(wireSphere1);

  const wireGeo2 = new THREE.SphereGeometry(1.6, 16, 24);
  const wireMat2 = new THREE.MeshBasicMaterial({
    color: 0x06B6D4,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const wireSphere2 = new THREE.Mesh(wireGeo2, wireMat2);
  wireSphere2.rotation.y = Math.PI / 4;
  wireSphere2.rotation.x = Math.PI / 6;
  globeGroup.add(wireSphere2);

  // ── Earth textured sphere (hidden initially) ──
  const earthGeo = new THREE.SphereGeometry(1.6, 48, 32);
  const earthMat = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0,
    color: 0xffffff,
  });
  const earthSphere = new THREE.Mesh(earthGeo, earthMat);
  earthSphere.visible = false;
  globeGroup.add(earthSphere);

  // ── Atmosphere glow (for Earth mode) ──────────
  const atmosGeo = new THREE.SphereGeometry(1.72, 48, 32);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x06B6D4,
    transparent: true,
    opacity: 0,
    side: THREE.BackSide,
  });
  const atmosSphere = new THREE.Mesh(atmosGeo, atmosMat);
  atmosSphere.visible = false;
  globeGroup.add(atmosSphere);

  // ── Directional light (for Earth mode) ────────
  const sunLight = new THREE.DirectionalLight(0xffffff, 0);
  sunLight.position.set(-3, 4, 2);
  scene.add(sunLight);

  // Soft ambient so the dark side isn't pitch black
  const ambientLight = new THREE.AmbientLight(0x404060, 0);
  scene.add(ambientLight);

  // ── State ─────────────────────────────────────
  let isDragging = false;
  let isEarthMode = false;
  let transitioning = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerTotalDist = 0;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let rotX = 0;
  let rotY = 0;

  // ── Tooltip ───────────────────────────────────
  const tooltip = document.createElement('span');
  tooltip.className = 'hero-globe-tooltip';
  tooltip.textContent = 'click to reveal';
  container.appendChild(tooltip);
  gsap.fromTo(tooltip,
    { opacity: 0, y: 5 },
    { opacity: 1, y: 0, duration: 0.6, delay: 1, ease: 'power2.out' }
  );
  gsap.to(tooltip, { opacity: 0, duration: 0.5, delay: 4, ease: 'power2.in' });

  // ── Pointer events ────────────────────────────
  container.addEventListener('pointerdown', onPointerDown, { passive: false });

  function onPointerDown(e) {
    // Don't interfere with scrolling for touch — only capture if on globe
    if (e.pointerType === 'touch') {
      container.setPointerCapture(e.pointerId);
    }

    isDragging = true;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    pointerTotalDist = 0;
    velocityX = 0;
    velocityY = 0;

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scroll while dragging globe

    const dx = e.clientX - prevPointerX;
    const dy = e.clientY - prevPointerY;

    pointerTotalDist += Math.abs(dx) + Math.abs(dy);

    // 1:1 rotation — sensitivity scaled to globe size
    const sensitivity = 0.008;
    velocityY = dx * sensitivity;
    velocityX = dy * sensitivity;

    rotY += velocityY;
    rotX += velocityX;

    // Clamp X rotation to ±75°
    rotX = Math.max(-DEG75, Math.min(DEG75, rotX));

    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
  }

  function onPointerUp(e) {
    isDragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

    if (e.pointerType === 'touch') {
      try { container.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    // Click detection — less than 5px total movement
    if (pointerTotalDist < CLICK_THRESHOLD && !transitioning) {
      toggleEarthMode();
    }
    // If it was a drag, momentum carries via velocityX/velocityY in the render loop
  }

  // ── Toggle wireframe ↔ Earth ──────────────────
  function toggleEarthMode() {
    if (transitioning) return;
    transitioning = true;

    // Hide tooltip permanently
    gsap.to(tooltip, { opacity: 0, duration: 0.3, overwrite: true });

    if (!isEarthMode) {
      // Wireframe → Earth
      if (earthTexture) {
        earthMat.map = earthTexture;
        earthMat.needsUpdate = true;
      }
      earthSphere.visible = true;
      atmosSphere.visible = true;

      // Crossfade: wireframe out, Earth in
      gsap.to(wireMat1, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(wireMat2, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(earthMat, { opacity: 1, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(atmosMat, { opacity: 0.12, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(sunLight, { intensity: 1.8, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(ambientLight, { intensity: 0.3, duration: 0.8, ease: 'power2.inOut',
        onComplete: () => { transitioning = false; },
      });
      isEarthMode = true;
    } else {
      // Earth → Wireframe
      gsap.to(wireMat1, { opacity: 0.25, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(wireMat2, { opacity: 0.12, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(earthMat, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(atmosMat, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(sunLight, { intensity: 0, duration: 0.8, ease: 'power2.inOut' });
      gsap.to(ambientLight, { intensity: 0, duration: 0.8, ease: 'power2.inOut',
        onComplete: () => {
          earthSphere.visible = false;
          atmosSphere.visible = false;
          transitioning = false;
        },
      });
      isEarthMode = false;
    }
  }

  // Prevent globe container from triggering scroll
  container.style.touchAction = 'none';

  // ── Render callback (called each frame by starfield) ──
  function render() {
    // Apply momentum when not dragging
    if (!isDragging) {
      const absVx = Math.abs(velocityX);
      const absVy = Math.abs(velocityY);

      if (absVx > VELOCITY_THRESHOLD || absVy > VELOCITY_THRESHOLD) {
        // Momentum deceleration
        velocityX *= DAMPING;
        velocityY *= DAMPING;
        rotX += velocityX;
        rotY += velocityY;
        rotX = Math.max(-DEG75, Math.min(DEG75, rotX));
      } else {
        // Settled — idle auto-rotation
        velocityX = 0;
        velocityY = 0;
        rotY += AUTO_SPEED;
      }
    }

    // Apply rotation to globe group
    globeGroup.rotation.x = rotX;
    globeGroup.rotation.y = rotY;
    // Keep cross-hatch offset on wireframe 2
    wireSphere2.rotation.x = Math.PI / 6;
    wireSphere2.rotation.y = Math.PI / 4;

    // ── Scissor render into globe's DOM rect ────
    const rect = container.getBoundingClientRect();
    const canvasRect = sharedRenderer.domElement.getBoundingClientRect();
    const pixelRatio = sharedRenderer.getPixelRatio();

    // Convert DOM coords to canvas pixel coords (Y is flipped)
    const x = (rect.left - canvasRect.left) * pixelRatio;
    const y = (canvasRect.bottom - rect.bottom) * pixelRatio;
    const w = rect.width * pixelRatio;
    const h = rect.height * pixelRatio;

    // Skip if offscreen
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const prevAutoClear = sharedRenderer.autoClear;
    sharedRenderer.autoClear = false;
    sharedRenderer.setScissorTest(true);
    sharedRenderer.setScissor(x, y, w, h);
    sharedRenderer.setViewport(x, y, w, h);

    // Clear just the globe region (transparent)
    sharedRenderer.setClearColor(0x000000, 0);
    sharedRenderer.clear(true, true, false);

    sharedRenderer.render(scene, camera);

    // Restore
    sharedRenderer.setScissorTest(false);
    sharedRenderer.setViewport(0, 0, canvasRect.width * pixelRatio, canvasRect.height * pixelRatio);
    sharedRenderer.autoClear = prevAutoClear;
  }

  return render;
}
