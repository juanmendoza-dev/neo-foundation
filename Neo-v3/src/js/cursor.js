import gsap from 'gsap';

export function initCursor() {
  // Skip entirely on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const reticle = document.querySelector('.cursor-reticle');
  if (!reticle) return;

  let cx = 0;
  let cy = 0;
  let tx = 0;
  let ty = 0;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  function update() {
    if (!document.hidden) {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      gsap.set(reticle, { x: cx, y: cy });
    }
    requestAnimationFrame(update);
  }

  update();

  // Expand ring on hover over interactive elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-hover]')) {
      gsap.to('.cursor-ring', {
        width: 48,
        height: 48,
        opacity: 1,
        duration: 0.3,
      });
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [data-hover]')) {
      gsap.to('.cursor-ring', {
        width: 32,
        height: 32,
        opacity: 0.6,
        duration: 0.3,
      });
    }
  }, { passive: true });
}
