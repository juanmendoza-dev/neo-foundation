import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initImpact() {
  const chapter = document.querySelector('.chapter-3');
  if (!chapter) return;

  const radar = chapter.querySelector('.radar-container');
  const sweep = chapter.querySelector('.radar-sweep');
  const ping = chapter.querySelector('.radar-ping');
  const stats = chapter.querySelectorAll('.hud-stat');
  const label = chapter.querySelector('.ch3-label');
  const title = chapter.querySelector('.ch3-title');
  const note = chapter.querySelector('.hud-note');

  // ── Lock initial state so nothing is visible before scroll ──
  gsap.set(radar, { opacity: 0 });
  gsap.set(sweep, { opacity: 0, rotation: 0 });
  gsap.set(ping, { opacity: 0, scale: 0 });
  gsap.set(stats, { opacity: 0, scale: 0.8 });
  gsap.set(label, { opacity: 0 });
  gsap.set(title, { opacity: 0, y: 30 });
  gsap.set(note, { opacity: 0 });

  // ── Master timeline triggered on scroll ──
  // start: 'top 70%' = fires when section top reaches 70% of viewport
  // (i.e. ~30% of the section is visible)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top 70%',
      once: true,
    },
  });

  // 1. Fade in radar
  tl.to(radar, {
    opacity: 0.6,
    duration: 0.8,
    ease: 'power2.out',
  });

  // 2. Chapter label + title
  tl.to(label, {
    opacity: 1,
    duration: 0.6,
  }, '-=0.4');

  tl.to(title, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.3');

  // 3. Radar sweep rotation
  tl.to(sweep, {
    opacity: 1,
    duration: 0.2,
  });

  tl.to(sweep, {
    rotation: 360,
    duration: 1.5,
    ease: 'power1.inOut',
  });

  // 4. Ping burst at the end of sweep
  tl.to(ping, {
    opacity: 0.6,
    scale: 15,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.3');

  tl.to(ping, {
    opacity: 0,
    duration: 0.4,
  });

  // 5. Stats appear — staggered, then count up
  tl.to(stats, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.15,
    ease: 'back.out(1.5)',
    onComplete: () => {
      // Count up each stat
      stats.forEach((stat, i) => {
        const target = parseInt(stat.dataset.target, 10);
        const numberEl = stat.querySelector('.hud-stat-number');
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.5,
          delay: i * 0.1,
          ease: 'power2.out',
          onUpdate: () => {
            numberEl.textContent = Math.round(obj.val).toLocaleString();
          },
          onComplete: () => {
            // Slam to final number
            numberEl.textContent = target.toLocaleString();

            // Screen shake on the last stat — apply to chapter only,
            // not body (transform on body breaks position:fixed canvas)
            if (i === stats.length - 1) {
              chapter.classList.add('screen-shake');
              setTimeout(() => {
                chapter.classList.remove('screen-shake');
              }, 300);
            }
          },
        });
      });
    },
  }, '-=0.3');

  // 6. Note fades in
  tl.to(note, {
    opacity: 1,
    duration: 0.6,
  }, '+=0.5');

  // Hide sweep after animation
  tl.set(sweep, { opacity: 0 }, '+=0.2');
}
