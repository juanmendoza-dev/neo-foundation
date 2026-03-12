import * as THREE from 'three';

export function initStarfield(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x0a0a0f, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Particle system ──────────────────────
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 800 : 2000;
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const opacities = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 120;
    const y = (Math.random() - 0.5) * 120;
    const z = (Math.random() - 0.5) * 80;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    originalPositions[i * 3] = x;
    originalPositions[i * 3 + 1] = y;
    originalPositions[i * 3 + 2] = z;
    sizes[i] = Math.random() * 2 + 0.5;
    opacities[i] = Math.random() * 0.6 + 0.4;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aOpacity;
      varying float vOpacity;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vOpacity = aOpacity;
        vec3 pos = position;
        // Subtle drift
        pos.x += sin(uTime * 0.1 + position.y * 0.5) * 0.15;
        pos.y += cos(uTime * 0.08 + position.x * 0.3) * 0.15;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * uPixelRatio * (50.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vOpacity;

      void main() {
        float dist = length(gl_PointCoord - 0.5);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, dist) * vOpacity;
        // Slight teal/white tint
        vec3 color = mix(vec3(0.886, 0.910, 0.941), vec3(0.024, 0.714, 0.831), 0.15);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ── Mouse interaction ─────────────────────
  const mouse = { x: 0, y: 0 };
  const mouseWorld = new THREE.Vector2(0, 0);
  const SCATTER_RADIUS = 12;
  const SCATTER_FORCE = 8;

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseWorld.set(mouse.x * 60, mouse.y * 35);
  }, { passive: true });

  // ── Resize ────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }, { passive: true });

  // ── Animate ───────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    // Skip rendering when tab is hidden — saves GPU cycles
    if (document.hidden) return;

    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;

    const posArray = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;

      const dx = posArray[ix] - mouseWorld.x;
      const dy = posArray[iy] - mouseWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SCATTER_RADIUS) {
        const force = (1 - dist / SCATTER_RADIUS) * SCATTER_FORCE;
        const angle = Math.atan2(dy, dx);
        posArray[ix] += Math.cos(angle) * force * 0.3;
        posArray[iy] += Math.sin(angle) * force * 0.3;
      } else {
        // Ease back to original position
        posArray[ix] += (originalPositions[ix] - posArray[ix]) * 0.02;
        posArray[iy] += (originalPositions[iy] - posArray[iy]) * 0.02;
      }
    }

    geometry.attributes.position.needsUpdate = true;

    // Gentle camera parallax from mouse
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;

    renderer.render(scene, camera);
  }

  animate();
}
