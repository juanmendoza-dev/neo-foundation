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
// VS Code = hub, connects to everything
// HTML/CSS/JS = web trio, connect to each other only
// C++ = connects to VS Code only
// Scratch = beginner gateway, no connections
const SKILLS = [
  { id: 'scratch', label: 'Scratch',    x: 8,  y: 50, related: [],                                      gateway: true },
  { id: 'vscode',  label: 'VS Code',    x: 38, y: 65, related: ['scratch', 'html', 'css', 'js', 'cpp'] },
  { id: 'html',    label: 'HTML',       x: 30, y: 25, related: ['css', 'js'] },
  { id: 'css',     label: 'CSS',        x: 50, y: 18, related: ['html', 'js'] },
  { id: 'js',      label: 'JavaScript', x: 62, y: 42, related: ['html', 'css'] },
  { id: 'cpp',     label: 'C++',        x: 82, y: 35, related: ['vscode'] },
];

// ── Constellation lines (always visible at low opacity) ──
const DEFAULT_LINES = [
  // Web trio
  ['html', 'css'],
  ['css', 'js'],
  ['html', 'js'],
  // VS Code hub connections
  ['vscode', 'scratch'],
  ['vscode', 'html'],
  ['vscode', 'css'],
  ['vscode', 'js'],
  ['vscode', 'cpp'],
];

// Callback for when constellation layout is complete (pin registered)
let _onReadyCallback = null;

export function initConstellation(onReady) {
  _onReadyCallback = onReady || null;
  requestAnimationFrame(() => _buildConstellation());
}

function _buildConstellation() {
  const container = document.querySelector('.constellation-map');
  const svgCanvas = document.querySelector('.constellation-svg');
  const nodesContainer = document.querySelector('.constellation-nodes');
  if (!container || !svgCanvas || !nodesContainer) return;

  const rect = container.getBoundingClientRect();

  // Guard: if dimensions aren't ready yet, retry next frame
  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(() => _buildConstellation());
    return;
  }

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

  // ── Create skill nodes first (so we can measure their real positions) ──
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

  // ── Helper: get node center relative to the SVG/container ──
  function getNodeCenter(skillId) {
    const node = nodeElements[skillId];
    const nodeRect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return {
      x: nodeRect.left + nodeRect.width / 2 - containerRect.left,
      y: nodeRect.top + nodeRect.height / 2 - containerRect.top,
    };
  }

  // ── Create constellation lines from real DOM positions ──
  const lineElements = {};
  const travelDots = {};

  function buildLines() {
    // Clear existing lines
    Object.values(lineElements).forEach(({ line, bgLine }) => {
      line.remove();
      bgLine.remove();
    });
    Object.values(travelDots).forEach(({ dot }) => {
      dot.remove();
    });
    Object.keys(lineElements).forEach((k) => delete lineElements[k]);
    Object.keys(travelDots).forEach((k) => delete travelDots[k]);

    DEFAULT_LINES.forEach(([fromId, toId]) => {
      const key = [fromId, toId].sort().join('-');
      const from = getNodeCenter(fromId);
      const to = getNodeCenter(toId);

      // Background line (always visible, faint)
      const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      bgLine.setAttribute('x1', from.x);
      bgLine.setAttribute('y1', from.y);
      bgLine.setAttribute('x2', to.x);
      bgLine.setAttribute('y2', to.y);
      bgLine.setAttribute('class', 'const-line-bg');
      svgCanvas.appendChild(bgLine);

      // Active line (shown on hover with draw animation)
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('class', 'const-line-active');
      const length = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      svgCanvas.appendChild(line);

      lineElements[key] = { line, bgLine, length };

      // Traveling light dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3');
      dot.setAttribute('class', 'const-travel-dot');
      dot.setAttribute('cx', from.x);
      dot.setAttribute('cy', from.y);
      svgCanvas.appendChild(dot);
      travelDots[key] = { dot };
    });

    // Restart idle line flicker for new elements
    startLineIdleAnimations();
  }

  // ── Idle line flicker tweens (tracked so we can pause/resume) ──
  let lineIdleTweens = [];

  function startLineIdleAnimations() {
    // Kill previous
    lineIdleTweens.forEach((tw) => tw.kill());
    lineIdleTweens = [];

    Object.values(lineElements).forEach(({ bgLine }) => {
      const tw = gsap.to(bgLine, {
        opacity: 0.05 + Math.random() * 0.08,
        duration: 1.5 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 3,
      });
      lineIdleTweens.push(tw);
    });
  }

  // Build lines after nodes are in the DOM
  buildLines();

  // ── ResizeObserver — recalculate line positions on layout shift ──
  const resizeObserver = new ResizeObserver(() => {
    buildLines();
  });
  resizeObserver.observe(container);

  // ── Idle node animations (tracked for pause/resume) ──
  const idleTweens = {}; // { skillId: [tween, tween] }

  Object.entries(nodeElements).forEach(([skillId, node]) => {
    const aura = node.querySelector('.const-node-aura');
    const tweens = [];

    tweens.push(gsap.to(aura, {
      scale: 1.3,
      opacity: 0.15,
      duration: 2 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2,
    }));

    tweens.push(gsap.to(node, {
      y: -3 + Math.random() * 6,
      duration: 3 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 3,
    }));

    idleTweens[skillId] = tweens;
  });

  // ── Global reset function — returns EVERYTHING to default ──
  function resetConstellation() {
    // Kill all in-flight hover tweens on nodes/lines/dots
    gsap.killTweensOf('.const-node-icon');
    gsap.killTweensOf('.const-node-icon img');
    gsap.killTweensOf('.const-node-aura');
    gsap.killTweensOf('.const-node-ring');

    // Reset ALL active lines and travel dots
    Object.values(lineElements).forEach(({ line, length }) => {
      gsap.to(line, {
        strokeDashoffset: length,
        duration: 0.3,
        ease: 'power2.in',
        overwrite: true,
      });
    });

    Object.values(travelDots).forEach(({ dot }) => {
      gsap.killTweensOf(dot);
      gsap.to(dot, { opacity: 0, duration: 0.2, overwrite: true });
    });

    // Reset ALL nodes to default state
    SKILLS.forEach((skill) => {
      const node = nodeElements[skill.id];
      const brand = BRAND_COLORS[skill.id];
      const rgb = brand.rgb;

      // Restore opacity
      gsap.to(node, { opacity: 1, duration: 0.3, overwrite: 'auto' });

      // Reset icon scale
      gsap.to(node.querySelector('.const-node-icon'), {
        scale: 1,
        duration: 0.3,
        overwrite: true,
      });

      // Reset icon glow
      gsap.to(node.querySelector('.const-node-icon img'), {
        filter: `drop-shadow(0 0 6px rgba(${rgb}, 0.5))`,
        duration: 0.3,
        overwrite: true,
      });

      // Reset aura
      gsap.to(node.querySelector('.const-node-aura'), {
        scale: 1,
        opacity: 0.2,
        duration: 0.3,
        overwrite: true,
      });

      // Reset ring
      gsap.to(node.querySelector('.const-node-ring'), {
        scale: 1,
        opacity: 0.4,
        borderColor: `${brand.primary}40`,
        boxShadow: 'none',
        duration: 0.3,
        overwrite: true,
      });

      // Hide labels (except gateway)
      if (!skill.gateway) {
        node.querySelector('.const-node-label').classList.remove('visible');
      }
    });

    // Resume ALL idle tweens
    Object.values(idleTweens).forEach((tweens) => {
      tweens.forEach((tw) => tw.resume());
    });
    lineIdleTweens.forEach((tw) => tw.resume());
  }

  // ── Hover interactions ──
  Object.entries(nodeElements).forEach(([skillId, node]) => {
    const skill = SKILLS.find((s) => s.id === skillId);

    node.addEventListener('mouseenter', () => {
      // First: reset everything cleanly (handles fast hover transitions)
      resetConstellation();

      const brand = BRAND_COLORS[skillId];
      const color = brand.primary;
      const rgb = brand.rgb;

      // Pause idle tweens for hovered node and its related nodes
      const affectedIds = [skillId, ...skill.related];
      affectedIds.forEach((id) => {
        if (idleTweens[id]) {
          idleTweens[id].forEach((tw) => tw.pause());
        }
      });
      // Pause line idle flicker during hover
      lineIdleTweens.forEach((tw) => tw.pause());

      // Brighten hovered node
      gsap.to(node.querySelector('.const-node-icon'), {
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(2)',
        overwrite: true,
      });
      gsap.to(node.querySelector('.const-node-icon img'), {
        filter: `drop-shadow(0 0 12px rgba(${rgb}, 0.9)) drop-shadow(0 0 24px rgba(${rgb}, 0.5))`,
        duration: 0.3,
        overwrite: true,
      });
      gsap.to(node.querySelector('.const-node-aura'), {
        scale: 1.8,
        opacity: 0.6,
        duration: 0.4,
        overwrite: true,
      });
      gsap.to(node.querySelector('.const-node-ring'), {
        scale: 1.3,
        opacity: 1,
        borderColor: color,
        boxShadow: `0 0 15px rgba(${rgb}, 0.3), inset 0 0 15px rgba(${rgb}, 0.1)`,
        duration: 0.3,
        overwrite: true,
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
          overwrite: true,
        });
        gsap.to(relNode.querySelector('.const-node-icon img'), {
          filter: `drop-shadow(0 0 10px rgba(${relBrand.rgb}, 0.7)) drop-shadow(0 0 20px rgba(${relBrand.rgb}, 0.4))`,
          duration: 0.4,
          overwrite: true,
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
          overwrite: true,
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
          overwrite: true,
        });

        const td = travelDots[key];
        if (td) {
          const fromPos = getNodeCenter(skillId);
          const toPos = getNodeCenter(relId);

          gsap.killTweensOf(td.dot);
          gsap.set(td.dot, { attr: { cx: fromPos.x, cy: fromPos.y }, opacity: 0 });
          gsap.to(td.dot, {
            attr: { cx: toPos.x, cy: toPos.y },
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
          gsap.to(nodeElements[s.id], { opacity: 0.2, duration: 0.3, overwrite: 'auto' });
        }
      });
    });

    node.addEventListener('mouseleave', () => {
      resetConstellation();
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

            const from = getNodeCenter(fromId);
            const to = getNodeCenter(toId);

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
              gsap.set(td.dot, { attr: { cx: from.x, cy: from.y }, opacity: 0 });
              gsap.to(td.dot, {
                attr: { cx: to.x, cy: to.y },
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

  // Pin is now registered — refresh and notify main.js
  ScrollTrigger.refresh();
  if (_onReadyCallback) _onReadyCallback();
}
