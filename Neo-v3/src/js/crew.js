import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCrew() {
  const chapter = document.querySelector('.chapter-4');
  if (!chapter) return;

  const label = chapter.querySelector('.ch4-label');
  const title = chapter.querySelector('.ch4-title');
  const cards = chapter.querySelectorAll('.crew-card');
  const note = chapter.querySelector('.crew-note');

  // ── Chapter label + title ──
  gsap.to(label, {
    opacity: 1,
    duration: 0.8,
    scrollTrigger: {
      trigger: chapter,
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.to(title, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: chapter,
      start: 'top 65%',
      toggleActions: 'play none none reverse',
    },
  });

  // ── Cards drift in with zero-gravity float ──
  cards.forEach((card, i) => {
    // Stagger the initial entrance
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: i * 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    // Continuous zero-gravity float (different for each card)
    gsap.to(card, {
      y: -6 + Math.random() * 12,
      rotation: -1 + Math.random() * 2,
      duration: 4 + Math.random() * 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2,
    });
  });

  // Note
  gsap.to(note, {
    opacity: 1,
    duration: 0.8,
    scrollTrigger: {
      trigger: note,
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    },
  });
}
