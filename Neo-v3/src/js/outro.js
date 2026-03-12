import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initOutro() {
  const footer = document.querySelector('.outro');
  if (!footer) return;

  const line1 = footer.querySelector('.outro-line-1');
  const line2 = footer.querySelector('.outro-line-2');
  const divider = footer.querySelector('.outro-divider');
  const logo = footer.querySelector('.outro-logo');
  const socials = footer.querySelector('.outro-socials');
  const email = footer.querySelector('.outro-email');
  const copyright = footer.querySelector('.outro-copyright');

  // ── Cinematic reveal timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footer,
      start: 'top 75%',
      once: true,
    },
  });

  // Closing statement — line 1
  tl.to(line1, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
  });

  // Closing statement — line 2 (teal, slightly delayed)
  tl.to(line2, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  }, '-=0.6');

  // Brief glow pulse on the teal line — animate pseudo-element opacity
  const line2Glow = { val: 0 };
  tl.to(line2Glow, {
    val: 1,
    duration: 0.5,
    ease: 'power2.in',
    onUpdate: () => {
      line2.style.setProperty('--glow-opacity', line2Glow.val);
    },
  }, '-=0.3');

  tl.to(line2Glow, {
    val: 0,
    duration: 0.8,
    ease: 'power2.out',
    onUpdate: () => {
      line2.style.setProperty('--glow-opacity', line2Glow.val);
    },
  });

  // Divider
  tl.to(divider, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.4');

  // Logo
  tl.to(logo, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.4');

  // Socials
  tl.to(socials, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
  }, '-=0.3');

  // Email
  tl.to(email, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
  }, '-=0.2');

  // Copyright — last, very subtle
  tl.to(copyright, {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
  }, '-=0.2');
}
