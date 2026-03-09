import gsap from 'gsap';

const LOGO_SRC = '/images/neoLogo-removebg-preview.png';

export function initHero() {
  const sphereWrap = document.querySelector('.hero-sphere-wrap');
  const sphere = document.querySelector('.hero-sphere');
  const shockwave = document.querySelector('.hero-shockwave');
  const content = document.querySelector('.hero-content');
  const sphereFinal = document.querySelector('.hero-sphere-final');
  const wordmark = document.querySelector('.hero-wordmark');
  const taglineText = document.querySelector('.tagline-text');
  const scrollHint = document.querySelector('.hero-scroll-hint');

  // ── Preload logo before starting any animation ──
  const preloader = new Image();
  preloader.src = LOGO_SRC;

  let started = false;
  function startOnce() {
    if (started) return;
    started = true;
    buildTimeline();
  }

  preloader.onload = startOnce;
  if (preloader.complete) startOnce();

  function buildTimeline() {
    // ── Set initial states ──────────────────────
    gsap.set(sphere, { opacity: 0, scale: 0 });
    gsap.set(shockwave, { opacity: 0, scale: 0 });
    gsap.set(content, { opacity: 0 });
    gsap.set(wordmark, { opacity: 0, y: 20 });
    gsap.set(scrollHint, { opacity: 0 });
    gsap.set(sphereFinal, { opacity: 0 });

    // ── Master timeline — exact absolute positions ──
    const tl = gsap.timeline();

    // Step 1 — Starfield fades in (0.0s – 0.5s)
    // Handled by starfield.js auto-reveal — no canvas manipulation here

    // Step 2 — Logo sphere appears center screen (0.5s – 1.5s)
    tl.to(sphere, {
      opacity: 1,
      scale: 1,
      rotation: 360,
      duration: 1,
      ease: 'power3.out',
    }, 0.5);

    // Logo glow corona — ramp up during appearance
    tl.to(sphere, {
      filter: 'drop-shadow(0 0 20px #06B6D4) drop-shadow(0 0 40px rgba(6,182,212,0.67))',
      duration: 0.8,
      ease: 'power2.in',
    }, 0.7);

    // Step 3 — Shockwave pulse (1.5s – 2.2s)
    tl.to(shockwave, {
      opacity: 0.8,
      scale: 1,
      duration: 0.15,
      ease: 'power4.out',
    }, 1.5);

    tl.to(shockwave, {
      scale: 3,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
    }, 1.65);

    // Step 4 — Logo shrinks + moves to final position (2.2s – 3.0s)
    tl.set(content, { opacity: 1 }, 2.2);

    const getTargetPos = () => {
      const finalRect = sphereFinal.getBoundingClientRect();
      const wrapRect = sphereWrap.getBoundingClientRect();
      return {
        x: finalRect.left + finalRect.width / 2 - (wrapRect.left + wrapRect.width / 2),
        y: finalRect.top + finalRect.height / 2 - (wrapRect.top + wrapRect.height / 2),
      };
    };

    tl.to(sphere, {
      width: 64,
      height: 64,
      filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.4))',
      duration: 0.8,
      ease: 'power3.inOut',
      onUpdate() {
        const pos = getTargetPos();
        gsap.set(sphereWrap, { x: pos.x, y: pos.y });
      },
      onComplete() {
        gsap.set(sphereWrap, { display: 'none' });
        gsap.set(sphereFinal, { opacity: 1 });
      },
    }, 2.2);

    // Step 5 — "Neo Foundation" text fades up (2.8s – 3.4s)
    tl.to(wordmark, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    }, 2.8);

    // Brief glow pulse on wordmark
    tl.to(wordmark, {
      textShadow: '0 0 30px rgba(6,182,212,0.6), 0 0 60px rgba(107,33,168,0.4)',
      duration: 0.3,
      ease: 'power2.in',
    }, 3.0);

    tl.to(wordmark, {
      textShadow: '0 0 20px rgba(6,182,212,0.2)',
      duration: 0.5,
      ease: 'power2.out',
    }, 3.3);

    // Step 6 — Tagline types out (3.4s – 5.0s)
    tl.add(() => {
      typewriterEffect(taglineText, 'EMPOWERING THE NEXT GENERATION OF BUILDERS');
    }, 3.4);

    // Step 7 — Scroll indicator appears (4.8s – 5.2s)
    tl.to(scrollHint, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, 4.8);

    // ── Idle state: gentle glow pulse on wordmark ──
    tl.add(() => {
      gsap.to(wordmark, {
        textShadow: '0 0 30px rgba(6,182,212,0.4), 0 0 60px rgba(107,33,168,0.2)',
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, 5.2);
  }
}

function typewriterEffect(element, text) {
  let index = 0;
  const speed = 35;

  function type() {
    if (index < text.length) {
      element.textContent += text[index];
      index++;
      setTimeout(type, speed);
    } else {
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
