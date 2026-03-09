import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initStarfield } from './starfield.js';
import { initCursor } from './cursor.js';
import { initHero } from './hero.js';
import { initScroll } from './scroll.js';
import { initConstellation } from './constellation.js';
import { initImpact } from './impact.js';
import { initCrew } from './crew.js';
import { initInvolve } from './involve.js';

gsap.registerPlugin(ScrollTrigger);

// ── Smooth scroll ───────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// ── Init modules ────────────────────────────
const canvas = document.getElementById('starfield');
initStarfield(canvas);
initCursor();
initHero();
initScroll(lenis);

// Constellation builds asynchronously (deferred to next frame).
// Impact and crew ScrollTriggers must init AFTER the Ch2 pin is registered,
// otherwise their trigger positions are calculated without the pin's
// added scroll height — causing them to fire immediately on load.
initConstellation(() => {
  initImpact();
  initCrew();
  initInvolve(lenis);
  ScrollTrigger.refresh();
});
