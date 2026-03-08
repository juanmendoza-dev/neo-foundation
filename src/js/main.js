import Lenis from 'lenis';
import { initStarfield } from './starfield.js';
import { initCursor } from './cursor.js';
import { initHero } from './hero.js';
import { initScroll } from './scroll.js';
import { initConstellation } from './constellation.js';
import { initImpact } from './impact.js';
import { initCrew } from './crew.js';

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
initConstellation();
initImpact();
initCrew();
