import gsap from 'gsap';
import { initGlobe } from './globe.js';
import { addRenderCallback } from './starfield.js';

export function initHero(sharedRenderer) {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const words = hero.querySelectorAll('.hero-word');
  const period = hero.querySelector('.hero-period');
  const lineLeft = hero.querySelector('.hero-line-left');
  const lineRight = hero.querySelector('.hero-line-right');
  const glow = hero.querySelector('.hero-glow');
  const tagline = hero.querySelector('.hero-tagline');
  const globeContainer = hero.querySelector('.hero-globe');
  const sparklesContainer = hero.querySelector('.hero-sparkles');
  const titleEl = hero.querySelector('.hero-title');

  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ── Initial states ──────────────────────────
  gsap.set(words, { yPercent: 110 });
  gsap.set(period, { opacity: 0, scale: 0.8 });
  gsap.set([lineLeft, lineRight], { scaleX: 0 });
  gsap.set(glow, { opacity: 0 });
  gsap.set(tagline, { opacity: 0, y: 20 });
  gsap.set(globeContainer, { opacity: 0 });
  gsap.set(titleEl, { letterSpacing: '0.2em' });

  // ── Master timeline ─────────────────────────
  const tl = gsap.timeline({ delay: 0.3 });

  // 1. Word reveal — each word slides up from behind clip mask
  tl.to(titleEl, {
    letterSpacing: '0.02em',
    duration: 1.2,
    ease: 'power3.out',
  }, 0);

  words.forEach((word, i) => {
    tl.to(word, {
      yPercent: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, i * 0.15);
  });

  // 2. Period fades in after last word
  const periodStart = (words.length - 1) * 0.15 + 0.8 + 0.3;
  tl.to(period, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: 'power2.out',
  }, periodStart);

  // 3. After text fully appears — lines, glow, tagline, scroll
  const afterReveal = periodStart + 0.2;

  tl.to(lineLeft, {
    scaleX: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, afterReveal);

  tl.to(lineRight, {
    scaleX: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, afterReveal);

  tl.to(glow, {
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
  }, afterReveal);

  tl.to(tagline, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out',
  }, afterReveal + 0.2);

  // Globe fades in and initializes
  tl.to(globeContainer, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
    onStart: () => {
      const renderFn = initGlobe(globeContainer, sharedRenderer);
      if (renderFn) addRenderCallback(renderFn);
    },
  }, afterReveal + 0.6);

  // 4. Sparkles — staggered fade in after text reveal
  createSparkles(sparklesContainer, titleEl, afterReveal + 0.3);

  // 5. Ambient breathing after everything appears
  tl.call(() => {
    gsap.to(titleEl, {
      scale: 1.005,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, null, afterReveal + 1);

  // ── Cursor gradient sweep (desktop only) ────
  if (!isMobile) {
    initCursorSweep(titleEl);
  }
}

// ── Sparkle Stars ───────────────────────────────
function createSparkles(container, titleEl, startTime) {
  const count = 8 + Math.floor(Math.random() * 5); // 8-12
  const titleRect = titleEl.getBoundingClientRect();
  const heroRect = container.closest('#hero').getBoundingClientRect();

  // Bounding box around the title with generous padding
  const pad = 100;
  const bounds = {
    left: titleRect.left - heroRect.left - pad,
    top: titleRect.top - heroRect.top - pad,
    width: titleRect.width + pad * 2,
    height: titleRect.height + pad * 2,
  };

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'hero-sparkle-star';

    const size = 3 + Math.random() * 5; // 3-8px — subtle like starfield
    const x = bounds.left + Math.random() * bounds.width;
    const y = bounds.top + Math.random() * bounds.height;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;

    container.appendChild(star);

    const baseOpacity = 0.3 + Math.random() * 0.5; // 0.3-0.8

    // Staggered entrance
    gsap.fromTo(star,
      { opacity: 0, scale: 0 },
      {
        opacity: baseOpacity,
        scale: 1,
        duration: 0.5,
        delay: startTime + i * 0.1,
        ease: 'power2.out',
        onComplete: () => startSparkleLife(star, baseOpacity, x, y),
      }
    );
  }

  // Occasional shooting micro-star
  startMicroShootingStar(container, bounds, startTime + count * 0.1 + 0.5);
}

function startSparkleLife(star, baseOpacity, originX, originY) {
  // 1. Random twinkling — each star at its own speed
  const twinkleDuration = 1 + Math.random() * 3; // 1-4s
  gsap.to(star, {
    opacity: baseOpacity * 0.3,
    duration: twinkleDuration,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: Math.random() * 2,
  });

  // 2. Gentle floating drift — small random movement, zero-gravity feel
  function drift() {
    const driftX = (Math.random() - 0.5) * 12;
    const driftY = (Math.random() - 0.5) * 12;
    const driftDuration = 3 + Math.random() * 4;

    gsap.to(star, {
      left: `${originX + driftX}px`,
      top: `${originY + driftY}px`,
      duration: driftDuration,
      ease: 'sine.inOut',
      onComplete: drift,
    });
  }
  drift();

  // 3. Scale pulse — random grow/shrink, staggered
  function scalePulse() {
    const delay = 2 + Math.random() * 5;
    gsap.to(star, {
      scale: 1.3 + Math.random() * 0.4,
      duration: 0.8,
      ease: 'sine.inOut',
      delay: delay,
      yoyo: true,
      repeat: 1,
      onComplete: scalePulse,
    });
  }
  scalePulse();
}

function startMicroShootingStar(container, bounds, initialDelay) {
  function fire() {
    const star = document.createElement('div');
    star.className = 'hero-sparkle-star';
    const size = 2 + Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    const startX = bounds.left + Math.random() * bounds.width;
    const startY = bounds.top + Math.random() * bounds.height;
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    container.appendChild(star);

    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 25;

    gsap.fromTo(star,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 0.8,
        scale: 1,
        left: `${startX + Math.cos(angle) * distance}px`,
        top: `${startY + Math.sin(angle) * distance}px`,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(star, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => star.remove(),
          });
        },
      }
    );

    // Fire again every 3-6 seconds
    setTimeout(fire, 3000 + Math.random() * 3000);
  }

  setTimeout(fire, initialDelay * 1000);
}

// ── Cursor Gradient Sweep ───────────────────────
function initCursorSweep(titleEl) {
  // Split title text into individual letter spans for color control
  const wordWraps = titleEl.querySelectorAll('.hero-word');
  const periodEl = titleEl.querySelector('.hero-period');
  const allLetterSpans = [];

  wordWraps.forEach((word) => {
    const text = word.textContent;
    word.textContent = '';
    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'hero-letter';
      span.style.color = '#E2E8F0';
      span.style.transition = 'none'; // GSAP handles transitions
      word.appendChild(span);
      allLetterSpans.push(span);
    });
  });

  // Add period to tracked spans
  if (periodEl) {
    periodEl.style.color = '#E2E8F0';
    allLetterSpans.push(periodEl);
  }

  const heroContent = titleEl.closest('.hero-content');

  heroContent.addEventListener('mousemove', (e) => {
    const rect = titleEl.getBoundingClientRect();
    const cursorX = (e.clientX - rect.left) / rect.width; // 0 to 1

    allLetterSpans.forEach((span, i) => {
      const letterPos = i / (allLetterSpans.length - 1);
      const distance = Math.abs(cursorX - letterPos);

      let color;
      if (distance < 0.05) {
        color = '#06B6D4'; // Cosmic teal — directly under cursor
      } else if (distance < 0.15) {
        // Blend from teal to purple
        const t = (distance - 0.05) / 0.10;
        color = lerpColor('#06B6D4', '#6B21A8', t);
      } else if (distance < 0.25) {
        // Blend from purple back to white
        const t = (distance - 0.15) / 0.10;
        color = lerpColor('#6B21A8', '#E2E8F0', t);
      } else {
        color = '#E2E8F0'; // Star white
      }

      gsap.to(span, {
        color: color,
        duration: 0.15,
        overwrite: 'auto',
      });
    });
  });

  heroContent.addEventListener('mouseleave', () => {
    allLetterSpans.forEach((span) => {
      gsap.to(span, {
        color: '#E2E8F0',
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });
}

// ── Color lerp utility ──────────────────────────
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);

  const ar = (ah >> 16) & 0xff;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;

  const br = (bh >> 16) & 0xff;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;

  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);

  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
}
