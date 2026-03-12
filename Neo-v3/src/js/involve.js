import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initInvolve(lenis) {
  const chapter = document.querySelector('.chapter-5');
  if (!chapter) return;

  const label = chapter.querySelector('.ch5-label');
  const title = chapter.querySelector('.ch5-title');
  const subtitle = chapter.querySelector('.involve-subtitle');
  const ctaCards = chapter.querySelectorAll('.involve-cta-card');
  const eventsHeading = chapter.querySelector('.involve-events-heading');
  const eventCards = chapter.querySelectorAll('.involve-event-card');

  // ── Chapter label ──
  gsap.to(label, {
    opacity: 1,
    duration: 0.8,
    scrollTrigger: {
      trigger: chapter,
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    },
  });

  // ── Chapter title ──
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

  // ── Subtitle ──
  gsap.to(subtitle, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: chapter,
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    },
  });

  // ── CTA cards — staggered drift in ──
  ctaCards.forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // ── Events heading ──
  gsap.to(eventsHeading, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: eventsHeading,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });

  // ── Event cards — staggered drift in ──
  eventCards.forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // ── Smooth scroll for "See What We Do" card ──
  const scrollToCards = chapter.querySelectorAll('[data-scroll-to]');
  scrollToCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(card.getAttribute('href'));
      if (target && lenis) {
        lenis.scrollTo(target, { duration: 1.5 });
      }
    });
  });
}
