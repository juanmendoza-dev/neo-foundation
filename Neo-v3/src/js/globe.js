import * as THREE from 'three';

/**
 * Creates a wireframe globe on a small canvas element.
 * Separate WebGL context but minimal GPU cost (180px canvas).
 */
export function initGlobe(container) {
  if (!container) return;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-globe-canvas';
  canvas.width = 360;  // 2x for retina
  canvas.height = 360;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(180, 180);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Wireframe sphere ──────────────────────
  const geometry = new THREE.SphereGeometry(1.6, 24, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0x06B6D4,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Second sphere — rotated for cross-hatched look
  const geometry2 = new THREE.SphereGeometry(1.6, 16, 24);
  const material2 = new THREE.MeshBasicMaterial({
    color: 0x06B6D4,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const sphere2 = new THREE.Mesh(geometry2, material2);
  sphere2.rotation.y = Math.PI / 4;
  sphere2.rotation.x = Math.PI / 6;
  scene.add(sphere2);

  // ── Animate ─────────────────────────────────
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);

    if (document.hidden) return;

    // ~20s per full rotation
    const speed = (Math.PI * 2) / (20 * 60);
    sphere.rotation.y += speed;
    sphere2.rotation.y += speed * 0.8;

    renderer.render(scene, camera);
  }

  animate();

  // Cleanup on page visibility
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !animId) animate();
  });

  return { canvas, renderer, scene };
}
