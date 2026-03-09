import gsap from 'gsap';
import Splitting from 'splitting';
import 'splitting/dist/splitting.css';

export function initHero() {
  // ── Split logo text into individual chars ──
  const logoEl = document.querySelector('.hero-logo');
  Splitting({ target: logoEl });

  const chars = logoEl.querySelectorAll('.char');
  const taglineText = document.querySelector('.tagline-text');
  const shootingStar = document.querySelector('.shooting-star');

  // Show the logo container
  gsap.set(logoEl, { opacity: 1 });

  // ── Master timeline ────────────────────────
  const tl = gsap.timeline({ delay: 0.5 });

  // 1. Stardust assembly — letters appear from scattered/blurred state
  tl.to(chars, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    stagger: {
      each: 0.05,
      from: 'random',
    },
    ease: 'power3.out',
  });

  // 2. Brief glow pulse on assembled logo
  tl.to(chars, {
    textShadow: '0 0 30px #06B6D4, 0 0 60px #6B21A8, 0 0 90px #06B6D4',
    duration: 0.4,
    ease: 'power2.in',
  }, '-=0.3');

  tl.to(chars, {
    textShadow: '0 0 8px rgba(6,182,212,0.3), 0 0 20px rgba(107,33,168,0.15)',
    duration: 0.8,
    ease: 'power2.out',
  });

  // 3. Shooting star streaks across
  tl.to(shootingStar, {
    opacity: 1,
    left: '110%',
    duration: 1,
    ease: 'power2.in',
  }, '-=0.6');

  tl.set(shootingStar, { opacity: 0 });

  // 4. Tagline types out like a terminal
  const tagline = 'EMPOWERING THE NEXT GENERATION OF BUILDERS';

  tl.add(() => {
    typewriterEffect(taglineText, tagline);
  }, '-=0.3');
}

function typewriterEffect(element, text) {
  let index = 0;
  const speed = 40;

  function type() {
    if (index < text.length) {
      element.textContent += text[index];
      index++;
      setTimeout(type, speed);
    } else {
      // After typing, glitch then resolve
      setTimeout(() => glitchEffect(element, text), 400);
    }
  }

  type();
}

function glitchEffect(element, originalText) {
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  let iterations = 0;
  const maxIterations = 6;

  const interval = setInterval(() => {
    element.textContent = originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        // Progressively resolve from left to right
        if (i < (iterations / maxIterations) * originalText.length) {
          return originalText[i];
        }
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      })
      .join('');

    iterations++;

    if (iterations > maxIterations) {
      clearInterval(interval);
      element.textContent = originalText;

      // Hide cursor after resolved
      const cursor = document.querySelector('.tagline-cursor');
      if (cursor) {
        gsap.to(cursor, {
          opacity: 0,
          duration: 0.3,
          delay: 1,
        });
      }
    }
  }, 80);
}
