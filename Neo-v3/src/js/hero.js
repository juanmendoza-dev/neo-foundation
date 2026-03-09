import gsap from 'gsap';

export function initHero(canvas) {
  const sphereWrap = document.querySelector('.hero-sphere-wrap');
  const sphere = document.querySelector('.hero-sphere');
  const shockwave = document.querySelector('.hero-shockwave');
  const content = document.querySelector('.hero-content');
  const sphereFinal = document.querySelector('.hero-sphere-final');
  const wordmark = document.querySelector('.hero-wordmark');
  const taglineText = document.querySelector('.tagline-text');
  const scrollHint = document.querySelector('.hero-scroll-hint');

  // ── Set initial states ──────────────────────
  gsap.set(canvas, { opacity: 0 });
  gsap.set(sphere, { opacity: 0, scale: 0 });
  gsap.set(shockwave, { opacity: 0, scale: 0 });
  gsap.set(content, { opacity: 0 });
  gsap.set(wordmark, { opacity: 0, y: 20 });
  gsap.set(scrollHint, { opacity: 0 });
  gsap.set(sphereFinal, { opacity: 0 });

  // ── Master timeline — cinematic intro ──────
  const tl = gsap.timeline({ delay: 0.3 });

  // Step 1 — Darkness → starfield fades in (0.0s – 0.5s)
  tl.to(canvas, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.inOut',
  });

  // Step 2 — Logo sphere appears + rotates (0.5s – 1.5s)
  tl.to(sphere, {
    opacity: 1,
    scale: 1,
    rotation: 360,
    duration: 1,
    ease: 'power3.out',
  });

  // Step 3 — Shockwave pulse (1.5s – 2.2s)
  tl.to(shockwave, {
    opacity: 0.8,
    scale: 1,
    duration: 0.15,
    ease: 'power4.out',
  });

  tl.to(shockwave, {
    scale: 3,
    opacity: 0,
    duration: 0.55,
    ease: 'power2.out',
  });

  // Step 4 — Logo shrinks and moves to final position (2.2s – 3.0s)
  // Show the content container so the wordmark row is ready
  tl.set(content, { opacity: 1 });

  // Get the final position of the small sphere slot
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
    duration: 0.8,
    ease: 'power3.inOut',
    onUpdate: function () {
      // Dynamically update position as sphere shrinks
      const pos = getTargetPos();
      gsap.set(sphereWrap, { x: pos.x, y: pos.y });
    },
    onComplete: () => {
      // Hide the animated sphere, show the inline one
      gsap.set(sphereWrap, { display: 'none' });
      gsap.set(sphereFinal, { opacity: 1 });
    },
  });

  // Step 5 — "Neo Foundation" text appears (overlaps with step 4 end)
  tl.to(wordmark, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
  }, '-=0.2');

  // Brief glow pulse on the wordmark
  tl.to(wordmark, {
    textShadow: '0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(107, 33, 168, 0.4)',
    duration: 0.3,
    ease: 'power2.in',
  });

  tl.to(wordmark, {
    textShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
    duration: 0.5,
    ease: 'power2.out',
  });

  // Step 6 — Tagline types out (3.4s – 5.0s)
  const tagline = 'EMPOWERING THE NEXT GENERATION OF BUILDERS';

  tl.add(() => {
    typewriterEffect(taglineText, tagline);
  });

  // Step 7 — Scroll indicator appears (overlaps with tagline end)
  tl.to(scrollHint, {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
  }, '+=1.2');

  // ── Idle state: gentle glow pulse on wordmark ──
  tl.add(() => {
    gsap.to(wordmark, {
      textShadow: '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(107, 33, 168, 0.2)',
      duration: 5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });
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
