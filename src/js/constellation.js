import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Brand colors for each skill ──
const BRAND_COLORS = {
  scratch: { primary: '#4D97FF', rgb: '77,151,255' },
  vscode:  { primary: '#007ACC', rgb: '0,122,204' },
  html:    { primary: '#E34F26', rgb: '227,79,38' },
  css:     { primary: '#1572B6', rgb: '21,114,182' },
  js:      { primary: '#F7DF1E', rgb: '247,223,30' },
  cpp:     { primary: '#00599C', rgb: '0,89,156' },
};

// ── Icon file paths (from /public/images/) ──
const ICON_FILES = {
  scratch: '/images/scratch-cat.svg',
  vscode:  '/images/vs-code-svgrepo-com.svg',
  html:    '/images/html-5-svgrepo-com.svg',
  css:     '/images/css-3-svgrepo-com.svg',
  js:      '/images/javascript-svgrepo-com.svg',
  cpp:     '/images/cpp-svgrepo-com.svg',
};

// ── Skills in exact display order ──
// Scratch = beginner gateway (no connections)
// VS Code = hub (connects to all others)
// C++ = standalone (only connects via VS Code)
const SKILLS = [
  { id: 'scratch', label: 'Scratch',    x: 8,  y: 50, related: [],                                    gateway: true },
  { id: 'vscode',  label: 'VS Code',    x: 38, y: 65, related: ['html', 'css', 'js', 'cpp'] },
  { id: 'html',    label: 'HTML',       x: 30, y: 25, related: ['css', 'js', 'vscode'] },
  { id: 'css',     label: 'CSS',        x: 50, y: 18, related: ['html', 'js', 'vscode'] },
  { id: 'js',      label: 'JavaScript', x: 62, y: 42, related: ['html', 'css', 'vscode'] },
  { id: 'cpp',     label: 'C++',        x: 82, y: 35, related: ['vscode'] },
];

// ── Default constellation lines (always visible at low opacity) ──
const DEFAULT_LINES = [
  // Web trio
  ['html', 'css'],
  ['css', 'js'],
  ['html', 'js'],
  // VS Code hub connections
  ['vscode', 'html'],
  ['vscode', 'css'],
  ['vscode', 'js'],
  ['vscode', 'cpp'],
];

export function initConstellation() {
  const container = document.querySelector('.constellation-map');
  const svgCanvas = document.querySelector('.constellation-svg');
  const nodesContainer = document.querySelector('.constellation-nodes');
  if (!container || !svgCanvas || !nodesContainer) return;

  const mapWidth = container.scrollWidth;
  const mapHeight = container.clientHeight;

  // ── Build SVG defs for glow filters ──
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svgCanvas.appendChild(defs);

  // ── Create default constellation lines ──
  const lineElements = {};
  const travelDots = {};

  DEFAULT_LINES.forEach(([fromId, toId]) => {
    const from = SKILLS.find((s) => s.id === fromId);
    const to = SKILLS.find((s) => s.id === toId);
    const key = [fromId, toId].sort().join('-');

    const x1 = (from.x / 100) * mapWidth;
    const y1 = (from.y / 100) * mapHeight;
    const x2 = (to.x / 100) * mapWidth;
    const y2 = (to.y / 100) * mapHeight;

    // Background line (always visible, faint)
    const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bgLine.setAttribute('x1', x1);
    bgLine.setAttribute('y1', y1);
    bgLine.setAttribute('x2', x2);
    bgLine.setAttribute('y2', y2);
    bgLine.setAttribute('class', 'const-line-bg');
    svgCanvas.appendChild(bgLine);

    // Active line (shown on hover with draw animation)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'const-line-active');
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    svgCanvas.appendChild(line);

    lineElements[key] = { line, bgLine, length, x1, y1, x2, y2 };

    // Traveling light dot
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '3');
    dot.setAttribute('class', 'const-travel-dot');
    dot.setAttribute('cx', x1);
    dot.setAttribute('cy', y1);
    svgCanvas.appendChild(dot);
    travelDots[key] = { dot, x1, y1, x2, y2 };
  });

  // ── Create skill nodes ──
  const nodeElements = {};

  SKILLS.forEach((skill, index) => {
    const node = document.createElement('div');
    node.className = 'const-node';
    node.dataset.skill = skill.id;
    node.style.left = `${skill.x}%`;
    node.style.top = `${skill.y}%`;
    node.dataset.index = index;

    const brand = BRAND_COLORS[skill.id];
    const color = brand.primary;
    const rgb = brand.rgb;
    const isGateway = skill.gateway === true;

    if (isGateway) {
      node.classList.add('const-node-gateway');
    }

    node.innerHTML = `
      <div class="const-node-aura" style="background: radial-gradient(circle, rgba(${rgb}, ${isGateway ? '0.3' : '0.25'}) 0%, transparent 70%);"></div>
      ${isGateway ? '<div class="const-gateway-orbit"></div>' : ''}
      <div class="const-node-ring" style="border-color: ${color}${isGateway ? '60' : '40'}; ${isGateway ? `box-shadow: 0 0 12px rgba(${rgb}, 0.2), inset 0 0 12px rgba(${rgb}, 0.1);` : ''}"></div>
      <div class="const-node-icon">
        <img src="${ICON_FILES[skill.id]}" alt="${skill.label}" style="filter: drop-shadow(0 0 6px rgba(${rgb}, 0.5));" />
      </div>
      <span class="const-node-label ${isGateway ? 'visible' : ''}" style="color: ${color}; text-shadow: 0 0 10px rgba(${rgb}, 0.5);">${skill.label}</span>
      ${isGateway ? '<span class="const-gateway-tag">START HERE</span>' : ''}
    `;

    node.dataset.color = color;
    node.dataset.rgb = rgb;

    nodesContainer.appendChild(node);
    nodeElements[skill.id] = node;
  });

  // ── Idle animations ──
  Object.values(nodeElements).forEach((node) => {
    const aura = node.querySelector('.const-node-aura');
    gsap.to(aura, {
      scale: 1.3,
      opacity: 0.15,
      duration: 2 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2,
    });

    gsap.to(node, {
      y: -3 + Math.random() * 6,
      duration: 3 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 3,
    });
  });

  Object.values(lineElements).forEach(({ bgLine }) => {
    gsap.to(bgLine, {
      opacity: 0.05 + Math.random() * 0.08,
      duration: 1.5 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 3,
    });
  });

  // ── Hover interactions ──
  Object.entries(nodeElements).forEach(([skillId, node]) => {
    const skill = SKILLS.find((s) => s.id === skillId);

    node.addEventListener('mouseenter', () => {
      const brand = BRAND_COLORS[skillId];
      const color = brand.primary;
      const rgb = brand.rgb;

      // Brighten hovered node
      gsap.to(node.querySelector('.const-node-icon'), {
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(2)',
      });
      gsap.to(node.querySelector('.const-node-icon img'), {
        filter: `drop-shadow(0 0 12px rgba(${rgb}, 0.9)) drop-shadow(0 0 24px rgba(${rgb}, 0.5))`,
        duration: 0.3,
      });
      gsap.to(node.querySelector('.const-node-aura'), {
        scale: 1.8,
        opacity: 0.6,
        duration: 0.4,
      });
      gsap.to(node.querySelector('.const-node-ring'), {
        scale: 1.3,
        opacity: 1,
        borderColor: color,
        boxShadow: `0 0 15px rgba(${rgb}, 0.3), inset 0 0 15px rgba(${rgb}, 0.1)`,
        duration: 0.3,
      });
      node.querySelector('.const-node-label').classList.add('visible');

      // Pulse related nodes
      skill.related.forEach((relId, i) => {
        const relNode = nodeElements[relId];
        if (!relNode) return;
        const relBrand = BRAND_COLORS[relId];

        relNode.querySelector('.const-node-label').classList.add('visible');

        gsap.to(relNode.querySelector('.const-node-aura'), {
          scale: 1.5,
          opacity: 0.4,
          duration: 0.4,
        });
        gsap.to(relNode.querySelector('.const-node-icon img'), {
          filter: `drop-shadow(0 0 10px rgba(${relBrand.rgb}, 0.7)) drop-shadow(0 0 20px rgba(${relBrand.rgb}, 0.4))`,
          duration: 0.4,
        });

        // Attention pulse
        gsap.fromTo(relNode.querySelector('.const-node-icon'), {
          scale: 1,
        }, {
          scale: 1.15,
          duration: 0.25,
          delay: i * 0.08,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      });

      // Draw constellation lines with beam + traveling dot
      skill.related.forEach((relId, i) => {
        const key = [skillId, relId].sort().join('-');
        const el = lineElements[key];
        if (!el) return;

        gsap.to(el.line, {
          strokeDashoffset: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
        });

        const td = travelDots[key];
        if (td) {
          const fromSkill = SKILLS.find((s) => s.id === skillId);
          const toSkill = SKILLS.find((s) => s.id === relId);
          const startX = (fromSkill.x / 100) * mapWidth;
          const startY = (fromSkill.y / 100) * mapHeight;
          const endX = (toSkill.x / 100) * mapWidth;
          const endY = (toSkill.y / 100) * mapHeight;

          gsap.set(td.dot, { attr: { cx: startX, cy: startY }, opacity: 0 });
          gsap.to(td.dot, {
            attr: { cx: endX, cy: endY },
            opacity: 1,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(td.dot, { opacity: 0, duration: 0.3 });
            },
          });
        }
      });

      // Dim unrelated nodes to 20%
      SKILLS.forEach((s) => {
        if (s.id !== skillId && !skill.related.includes(s.id)) {
          gsap.to(nodeElements[s.id], { opacity: 0.2, duration: 0.3 });
        }
      });
    });

    node.addEventListener('mouseleave', () => {
      const brand = BRAND_COLORS[skillId];
      const rgb = brand.rgb;

      gsap.to(node.querySelector('.const-node-icon'), {
        scale: 1,
        duration: 0.3,
      });
      gsap.to(node.querySelector('.const-node-icon img'), {
        filter: `drop-shadow(0 0 6px rgba(${rgb}, 0.5))`,
        duration: 0.3,
      });
      gsap.to(node.querySelector('.const-node-aura'), {
        scale: 1,
        opacity: 0.2,
        duration: 0.4,
      });
      gsap.to(node.querySelector('.const-node-ring'), {
        scale: 1,
        opacity: 0.4,
        borderColor: `${brand.primary}40`,
        boxShadow: 'none',
        duration: 0.3,
      });
      // Don't remove label from gateway node
      if (!skill.gateway) {
        node.querySelector('.const-node-label').classList.remove('visible');
      }

      // Reset related nodes
      skill.related.forEach((relId) => {
        const relNode = nodeElements[relId];
        const relBrand = BRAND_COLORS[relId];
        if (!relNode) return;

        const relSkill = SKILLS.find((s) => s.id === relId);
        if (!relSkill.gateway) {
          relNode.querySelector('.const-node-label').classList.remove('visible');
        }
        gsap.to(relNode.querySelector('.const-node-aura'), {
          scale: 1,
          opacity: 0.2,
          duration: 0.4,
        });
        gsap.to(relNode.querySelector('.const-node-icon img'), {
          filter: `drop-shadow(0 0 6px rgba(${relBrand.rgb}, 0.5))`,
          duration: 0.4,
        });
      });

      // Reset lines
      skill.related.forEach((relId) => {
        const key = [skillId, relId].sort().join('-');
        const el = lineElements[key];
        if (!el) return;
        gsap.to(el.line, {
          strokeDashoffset: el.length,
          duration: 0.4,
          ease: 'power2.in',
        });
      });

      // Restore all node opacity
      SKILLS.forEach((s) => {
        gsap.to(nodeElements[s.id], { opacity: 1, duration: 0.3 });
      });
    });
  });

  // ── Scroll-triggered entry animation ──
  const allNodes = document.querySelectorAll('.const-node');
  gsap.set(allNodes, { opacity: 0, scale: 0.3 });

  ScrollTrigger.create({
    trigger: '.chapter-2-wrapper',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to('.const-grid', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      });

      gsap.to(allNodes, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: {
          each: 0.15,
          from: 'start',
        },
        ease: 'back.out(1.5)',
        onComplete: () => {
          DEFAULT_LINES.forEach(([fromId, toId], i) => {
            const key = [fromId, toId].sort().join('-');
            const el = lineElements[key];
            const td = travelDots[key];
            if (!el) return;

            gsap.to(el.bgLine, {
              opacity: 0.12,
              duration: 0.4,
              delay: i * 0.08,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(el.bgLine, {
                  opacity: 0.06,
                  duration: 0.6,
                });
              },
            });

            if (td) {
              gsap.set(td.dot, { attr: { cx: el.x1, cy: el.y1 }, opacity: 0 });
              gsap.to(td.dot, {
                attr: { cx: el.x2, cy: el.y2 },
                opacity: 0.8,
                duration: 0.5,
                delay: 0.8 + i * 0.08,
                ease: 'power1.out',
                onComplete: () => {
                  gsap.to(td.dot, { opacity: 0, duration: 0.4 });
                },
              });
            }
          });
        },
      });
    },
  });

  // ── Horizontal scroll (GSAP pin) ──
  const wrapper = document.querySelector('.chapter-2-wrapper');
  const track = document.querySelector('.constellation-track');

  if (wrapper && track) {
    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

    gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${getScrollAmount() * 1.2}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}
