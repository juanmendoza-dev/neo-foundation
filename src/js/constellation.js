import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Skill data with positions on the star map ──
// Brand colors for each skill
const BRAND_COLORS = {
  scratch: { primary: '#4D97FF', rgb: '77,151,255' },
  html:    { primary: '#E34F26', rgb: '227,79,38' },
  css:     { primary: '#1572B6', rgb: '21,114,182' },
  js:      { primary: '#F7DF1E', rgb: '247,223,30' },
  cpp:     { primary: '#00599C', rgb: '0,89,156' },
  c:       { primary: '#A8B9CC', rgb: '168,185,204' },
  linux:   { primary: '#FCC624', rgb: '252,198,36' },
  vscode:  { primary: '#007ACC', rgb: '0,122,204' },
};

// Positions are percentages within the constellation viewport
// Scratch is separated to the far left as the "entry point" gateway
const SKILLS = [
  { id: 'scratch',    label: 'Scratch',    x: 6,  y: 50, related: [],                                          gateway: true },
  { id: 'html',       label: 'HTML',       x: 25, y: 30, related: ['css', 'js', 'vscode'] },
  { id: 'css',        label: 'CSS',        x: 35, y: 15, related: ['html', 'js', 'vscode'] },
  { id: 'js',         label: 'JavaScript', x: 48, y: 40, related: ['html', 'css', 'vscode'] },
  { id: 'cpp',        label: 'C++',        x: 72, y: 25, related: ['c', 'vscode'] },
  { id: 'c',          label: 'C',          x: 85, y: 45, related: ['cpp', 'vscode'] },
  { id: 'linux',      label: 'Linux',      x: 78, y: 68, related: ['cpp', 'c', 'vscode'] },
  { id: 'vscode',     label: 'VS Code',    x: 52, y: 72, related: ['html', 'css', 'js', 'cpp', 'c', 'linux'] },
];

// Default constellation lines (always visible at low opacity)
// These represent the meaningful relationships
const DEFAULT_LINES = [
  // Web trio
  ['html', 'css'],
  ['css', 'js'],
  ['html', 'js'],
  // Systems cluster
  ['cpp', 'c'],
  ['cpp', 'linux'],
  ['c', 'linux'],
  // VS Code hub connections
  ['vscode', 'html'],
  ['vscode', 'css'],
  ['vscode', 'js'],
  ['vscode', 'cpp'],
  ['vscode', 'c'],
  ['vscode', 'linux'],
];

// SVG icon paths for each skill
const ICONS = {
  scratch: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 4.5c.83 0 1.5.67 1.5 1.5 0 .6-.35 1.11-.85 1.35.3.2.55.47.73.79.25-.1.52-.14.82-.14 1.38 0 2.5 1.12 2.5 2.5S14.08 15 12.7 15c-.37 0-.72-.08-1.03-.23-.26.45-.68.79-1.17.96V17c0 .55-.45 1-1 1s-1-.45-1-1v-1.27c-.6-.34-1-.99-1-1.73 0-1.1.9-2 2-2 .17 0 .33.02.49.06.04-.22.11-.43.21-.62-.45-.34-.75-.88-.75-1.44 0-.83.67-1.5 1.5-1.5z"/>`,
  html: `<path d="M3 2l1.5 17L12 22l7.5-3L21 2H3zm14.3 5.5H8.3l.2 2.5h8.6l-.7 8-4.4 1.5-4.4-1.5-.3-3.5h2.4l.2 1.8 2.1.7 2.1-.7.2-2.3H8l-.6-7h9.2l-.3 2.5z"/>`,
  css: `<path d="M3 2l1.5 17L12 22l7.5-3L21 2H3zm13.5 5.5l-.2 2.5H9.2l.2 2h7l-.7 7.5-3.7 1.3-3.7-1.3-.3-3h2.3l.1 1.5 1.6.5 1.6-.5.2-2.2H7.5l-.5-6h10.7l-.2 0z"/>`,
  js: `<path d="M3 3h18v18H3V3zm9.1 14.7c0 1.7-.9 2.5-2.4 2.5-1.3 0-2-.7-2.4-1.5l1.3-.8c.3.5.5.8 1.1.8.6 0 .9-.3.9-1.2V12h1.5v5.7zm3.5 2.5c-1.5 0-2.4-.7-2.9-1.6l1.3-.8c.3.6.8 1 1.6 1 .7 0 1.1-.3 1.1-.8 0-.6-.5-.8-1.3-1.1l-.4-.2c-1.3-.6-2.2-1.3-2.2-2.8 0-1.4 1.1-2.5 2.7-2.5 1.2 0 2 .4 2.6 1.5l-1.3.8c-.3-.5-.6-.8-1.2-.8-.5 0-.9.3-.9.8 0 .5.3.7 1.1 1l.4.2c1.5.7 2.4 1.3 2.4 2.9 0 1.6-1.3 2.5-3 2.5z"/>`,
  cpp: `<path d="M10.5 15.97l.03.03h.07l-.1-.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2H9v-1h2v-2h1v2h2v1h-2v2h-1zm5.5-2.5H15v-1h1.5v-2H18v2h1.5v1H18v2h-1.5v-2z"/>`,
  c: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.73c-2.78.47-5.33-1.36-5.8-4.14S8.56 7.26 11.34 6.8c1.5-.26 3 .18 4.13 1.14l-1.82 2.1A2.74 2.74 0 0011.5 9.2c-1.54.26-2.57 1.73-2.31 3.27s1.73 2.57 3.27 2.31c.79-.13 1.46-.6 1.87-1.23l2.1 1.45c-.93 1.36-2.48 2.23-4.14 2.5l.71-.77z"/>`,
  linux: `<path d="M12.5 2c-.7 0-1.3.2-1.8.6-.5.4-.9 1-1.1 1.7-.2.8-.1 1.6.1 2.4.1.4.3.7.5 1l-.3.5c-.4.7-.7 1.5-.8 2.3-.1.8 0 1.6.3 2.3-.8.5-1.5 1.2-2 2-.4.8-.6 1.7-.5 2.6.1.8.5 1.5 1 2 .6.5 1.3.8 2 .8h.6c.3.4.7.7 1.2.9.5.2 1.1.3 1.7.3s1.2-.1 1.7-.3c.5-.2.9-.5 1.2-.9h.6c.7 0 1.4-.3 2-.8.5-.5.9-1.2 1-2 .1-.9-.1-1.8-.5-2.6-.5-.8-1.2-1.5-2-2 .3-.7.4-1.5.3-2.3-.1-.8-.4-1.6-.8-2.3l-.3-.5c.2-.3.4-.6.5-1 .2-.8.3-1.6.1-2.4-.2-.7-.6-1.3-1.1-1.7-.5-.4-1.1-.6-1.8-.6zm-.6 2c.2-.1.4-.1.6-.1s.4 0 .6.1c.2.1.4.3.5.6.1.4.1.9 0 1.3-.1.3-.2.5-.3.6-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.8.3-.1-.1-.2-.3-.3-.6-.1-.4-.1-.9 0-1.3.1-.3.3-.5.5-.6z"/>`,
  vscode: `<path d="M17.6 2.3l-5 4.5-4.6-3.5L3 5.8v12.4l5 2.5 4.6-3.5 5 4.5 3.4-1.5V3.8l-3.4-1.5zM16 16.1l-4-3.1 4-3.1v6.2zM8 8l3.4 2.6L8 13.2V8z"/>`,
};

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
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: ${color}; filter: drop-shadow(0 0 6px rgba(${rgb}, 0.5));">
          ${ICONS[skill.id]}
        </svg>
      </div>
      <span class="const-node-label ${isGateway ? 'visible' : ''}" style="color: ${color}; text-shadow: 0 0 10px rgba(${rgb}, 0.5);">${skill.label}</span>
      ${isGateway ? `<span class="const-gateway-tag">START HERE</span>` : ''}
    `;

    // Store brand color on the node for hover reference
    node.dataset.color = color;
    node.dataset.rgb = rgb;

    nodesContainer.appendChild(node);
    nodeElements[skill.id] = node;
  });

  // ── Idle animations ──
  // Gentle node pulsing
  Object.values(nodeElements).forEach((node, i) => {
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

    // Subtle float
    gsap.to(node, {
      y: -3 + Math.random() * 6,
      duration: 3 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 3,
    });
  });

  // Faint line flickering
  Object.values(lineElements).forEach(({ bgLine }, i) => {
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

      // Pulse and brighten the hovered node with brand color glow
      gsap.to(node.querySelector('.const-node-icon'), {
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(2)',
      });
      gsap.to(node.querySelector('.const-node-icon svg'), {
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

      // Show labels on related nodes + pulse them to draw attention
      skill.related.forEach((relId, i) => {
        const relNode = nodeElements[relId];
        if (relNode) {
          relNode.querySelector('.const-node-label').classList.add('visible');
          const relBrand = BRAND_COLORS[relId];

          // Brighten aura
          gsap.to(relNode.querySelector('.const-node-aura'), {
            scale: 1.5,
            opacity: 0.4,
            duration: 0.4,
          });
          gsap.to(relNode.querySelector('.const-node-icon svg'), {
            filter: `drop-shadow(0 0 10px rgba(${relBrand.rgb}, 0.7)) drop-shadow(0 0 20px rgba(${relBrand.rgb}, 0.4))`,
            duration: 0.4,
          });

          // Attention pulse — scale up then settle
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
        }
      });

      // Animate constellation lines with beam effect
      skill.related.forEach((relId, i) => {
        const key = [skillId, relId].sort().join('-');
        const el = lineElements[key];
        if (!el) return;

        // Draw the line
        gsap.to(el.line, {
          strokeDashoffset: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
        });

        // Traveling light dot
        const td = travelDots[key];
        if (td) {
          // Determine direction: dot travels FROM hovered node
          const isFrom = SKILLS.find((s) => s.id === skillId);
          const startX = (isFrom.x / 100) * mapWidth;
          const startY = (isFrom.y / 100) * mapHeight;
          const relSkill = SKILLS.find((s) => s.id === relId);
          const endX = (relSkill.x / 100) * mapWidth;
          const endY = (relSkill.y / 100) * mapHeight;

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

      // Dim non-related nodes
      SKILLS.forEach((s) => {
        if (s.id !== skillId && !skill.related.includes(s.id)) {
          gsap.to(nodeElements[s.id], { opacity: 0.2, duration: 0.3 });
        }
      });
    });

    node.addEventListener('mouseleave', () => {
      const brand = BRAND_COLORS[skillId];
      const rgb = brand.rgb;

      // Reset hovered node
      gsap.to(node.querySelector('.const-node-icon'), {
        scale: 1,
        duration: 0.3,
      });
      gsap.to(node.querySelector('.const-node-icon svg'), {
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
      node.querySelector('.const-node-label').classList.remove('visible');

      // Reset related nodes
      skill.related.forEach((relId) => {
        const relNode = nodeElements[relId];
        const relBrand = BRAND_COLORS[relId];
        if (relNode) {
          relNode.querySelector('.const-node-label').classList.remove('visible');
          gsap.to(relNode.querySelector('.const-node-aura'), {
            scale: 1,
            opacity: 0.2,
            duration: 0.4,
          });
          gsap.to(relNode.querySelector('.const-node-icon svg'), {
            filter: `drop-shadow(0 0 6px rgba(${relBrand.rgb}, 0.5))`,
            duration: 0.4,
          });
        }
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
  // Staggered node appearance
  const allNodes = document.querySelectorAll('.const-node');
  gsap.set(allNodes, { opacity: 0, scale: 0.3 });

  ScrollTrigger.create({
    trigger: '.chapter-2-wrapper',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      // Fade in the grid first
      gsap.to('.const-grid', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      });

      // Stagger nodes in
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
          // After all nodes appear, draw default lines with traveling dots
          DEFAULT_LINES.forEach(([fromId, toId], i) => {
            const key = [fromId, toId].sort().join('-');
            const el = lineElements[key];
            const td = travelDots[key];
            if (!el) return;

            // Flash the line briefly then settle to idle
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

            // Send a signal dot along each line
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
    // Calculate total scroll distance dynamically from actual content
    const getScrollAmount = () => {
      return track.scrollWidth - window.innerWidth;
    };

    gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        // Extra multiplier (1.2) ensures the scroll duration is long enough
        // for the user to see the full map comfortably without rushing
        end: () => `+=${getScrollAmount() * 1.2}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}
