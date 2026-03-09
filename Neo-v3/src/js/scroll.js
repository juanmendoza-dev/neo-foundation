import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Prevent background flash on initial load — skip color shifts until first scroll
let hasScrolled = false;
window.addEventListener('scroll', () => { hasScrolled = true; }, { once: true });

export function initScroll(lenis) {
  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  initScrollProgress();
  initBackgroundShifts();
  initAsteroids();
  initOrbitalDividers();
  initChapter1();
  initChapter2Intro();
  initParallaxNumbers();
}

// ── Mission Track (Scroll Progress) ──────
function initScrollProgress() {
  const track = document.querySelector('.mission-track');
  const fill = document.querySelector('.mission-track-fill');
  const dot = document.querySelector('.mission-track-dot');
  if (!track || !fill || !dot) return;

  // Show after scrolling past hero
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom top',
    onEnter: () => track.classList.add('visible'),
    onLeaveBack: () => track.classList.remove('visible'),
  });

  // Update fill height and dot position on scroll
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const pct = self.progress * 100;
      fill.style.height = pct + '%';
      dot.style.top = pct + '%';
    },
  });
}

// ── Background Color Shifts ─────────────
function initBackgroundShifts() {
  const chapters = document.querySelectorAll('.chapter[data-bg]');

  chapters.forEach((chapter) => {
    const bg = chapter.dataset.bg;

    ScrollTrigger.create({
      trigger: chapter,
      start: 'top 80%',
      end: 'top 20%',
      onUpdate: (self) => {
        if (!hasScrolled) return;
        const startColor = [10, 10, 15]; // #0a0a0f
        const endColor = hexToRgb(bg);
        const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * self.progress);
        const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * self.progress);
        const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * self.progress);
        document.documentElement.style.background = `rgb(${r},${g},${b})`;
      },
    });

    // Shift back when leaving
    ScrollTrigger.create({
      trigger: chapter,
      start: 'bottom 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        if (!hasScrolled) return;
        const startColor = [10, 10, 15];
        const endColor = hexToRgb(bg);
        const r = Math.round(endColor[0] + (startColor[0] - endColor[0]) * self.progress);
        const g = Math.round(endColor[1] + (startColor[1] - endColor[1]) * self.progress);
        const b = Math.round(endColor[2] + (startColor[2] - endColor[2]) * self.progress);
        document.documentElement.style.background = `rgb(${r},${g},${b})`;
      },
    });
  });
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [10, 10, 15];
}

// ── Drifting Asteroids ──────────────────
function initAsteroids() {
  const asteroid1 = document.querySelector('.asteroid-1');
  const asteroid2 = document.querySelector('.asteroid-2');

  if (asteroid1) {
    gsap.to(asteroid1, {
      x: () => window.innerWidth + 40,
      y: -80,
      rotation: 120,
      opacity: 0.3,
      duration: 40,
      ease: 'none',
      repeat: -1,
      delay: 5,
    });
  }

  if (asteroid2) {
    gsap.to(asteroid2, {
      x: () => -(window.innerWidth + 40),
      y: -60,
      rotation: -90,
      opacity: 0.25,
      duration: 55,
      ease: 'none',
      repeat: -1,
      delay: 15,
    });
  }
}

// ── Orbital Dividers ────────────────────
function initOrbitalDividers() {
  const dividers = document.querySelectorAll('.orbital-divider');

  dividers.forEach((divider) => {
    const line = divider.querySelector('.orbital-line');
    const dot = divider.querySelector('.orbital-dot');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: divider,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(line, {
      width: '60%',
      duration: 1,
      ease: 'power2.out',
    });

    tl.to(dot, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(2)',
    }, '-=0.5');
  });
}

// ── Chapter 1 Animations ────────────────
function initChapter1() {
  const chapter = document.querySelector('.chapter-1');
  if (!chapter) return;

  // Chapter label
  const label = chapter.querySelector('.chapter-label');
  gsap.to(label, {
    opacity: 1,
    duration: 0.8,
    scrollTrigger: {
      trigger: chapter,
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    },
  });

  // Chapter title — reveal with clip
  const title = chapter.querySelector('.chapter-title');
  gsap.fromTo(
    title,
    { opacity: 0, y: 40, filter: 'blur(6px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  // Mission lines — staggered reveal
  const lines = chapter.querySelectorAll('.mission-line');
  gsap.to(lines, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: lines[0],
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  // Mission sub text
  const sub = chapter.querySelector('.mission-sub');
  gsap.to(sub, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: sub,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });
}

// ── Chapter 2 Intro Animations ──────────
function initChapter2Intro() {
  const wrapper = document.querySelector('.chapter-2-wrapper');
  if (!wrapper) return;

  const label = wrapper.querySelector('.ch2-label');
  const title = wrapper.querySelector('.ch2-title');
  const subtitle = wrapper.querySelector('.ch2-subtitle');

  // Chapter label
  if (label) {
    gsap.to(label, {
      opacity: 1,
      duration: 0.8,
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Chapter title
  if (title) {
    gsap.to(title, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Subtitle
  if (subtitle) {
    gsap.fromTo(
      subtitle,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 55%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }

  // Background shift for chapter 2
  const bg = wrapper.dataset.bg;
  if (bg) {
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top 80%',
      end: 'top 20%',
      onUpdate: (self) => {
        if (!hasScrolled) return;
        const startColor = [10, 10, 15];
        const endColor = hexToRgb(bg);
        const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * self.progress);
        const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * self.progress);
        const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * self.progress);
        document.documentElement.style.background = `rgb(${r},${g},${b})`;
      },
    });
  }
}

// ── Parallax Chapter Numbers ────────────
function initParallaxNumbers() {
  const numbers = document.querySelectorAll('.chapter-number-bg');

  numbers.forEach((num) => {
    gsap.to(num, {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: num.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  });
}
