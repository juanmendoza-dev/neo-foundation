
//please no steal code :(

// this actually took me so long do not touch 
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowPowerDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

//  performance thiingy
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// more functions for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// optimized animaitons 
function createAnimatedStarfield() {
    const starfieldContainer = document.createElement('div');
    starfieldContainer.className = 'animated-starfield';
    starfieldContainer.style.position = 'fixed';
    starfieldContainer.style.top = '0';
    starfieldContainer.style.left = '0';
    starfieldContainer.style.width = '100%';
    starfieldContainer.style.height = '100%';
    starfieldContainer.style.pointerEvents = 'none';
    starfieldContainer.style.zIndex = '-10';
    starfieldContainer.style.overflow = 'hidden';

    document.body.appendChild(starfieldContainer);

    // reduced star count for mobile devices DO NOT CHANGE THIS IT TOOK SOO LONG
    const starCount = isMobile ? 75 : isLowPowerDevice ? 100 : 150;
    const starsData = [];
    let starKeyframes = '';

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'floating-star';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * (isMobile ? 3 : 4) + 1;
        const opacity = Math.random() * 0.5 + 0.7;

        const animationDuration = Math.random() * (isMobile ? 6 : 4) + (isMobile ? 4 : 3);
        const animationDelay = Math.random() * 2;
        const moveDistance = Math.random() * (isMobile ? 30 : 40) + (isMobile ? 15 : 20);
        const rotationSpeed = Math.random() * 12 + 6;

        star.style.position = 'absolute';
        star.style.left = x + '%';
        star.style.top = y + '%';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.backgroundColor = '#ffffff';
        star.style.borderRadius = '50%';
        star.style.opacity = opacity;
        star.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity * 0.6})`;
        star.style.willChange = 'transform';
        star.style.transform = 'translateZ(0)';

        // better animations for mobile 
        if (isMobile) {
            star.style.animation = `starTwinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${animationDelay}s`;
        } else {
            star.style.animation = 
                `starFloat${i} ${animationDuration}s ease-in-out infinite ${animationDelay}s, ` +
                `starTwinkle ${Math.random() * 2 + 1.5}s ease-in-out infinite ${animationDelay}s, ` +
                `starRotate ${rotationSpeed}s linear infinite`;
        }

        if (!isMobile) {
            starKeyframes += `
                @keyframes starFloat${i} {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(${Math.random() * moveDistance - moveDistance / 2}px, ${Math.random() * moveDistance - moveDistance / 2}px) scale(${0.8 + Math.random() * 0.4}); }
                    50% { transform: translate(${Math.random() * moveDistance - moveDistance / 2}px, ${Math.random() * moveDistance - moveDistance / 2}px) scale(${1.1 + Math.random() * 0.3}); }
                    75% { transform: translate(${Math.random() * moveDistance - moveDistance / 2}px, ${Math.random() * moveDistance - moveDistance / 2}px) scale(${0.9 + Math.random() * 0.2}); }
                }`;
        }

        starfieldContainer.appendChild(star);
        starsData.push({ element: star, x, y, size, opacity });
    }

    // Batch all keyframes into a single style element instead of one per star
    if (starKeyframes) {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = starKeyframes;
        document.head.appendChild(styleSheet);
    }

    return starsData;
}

// better particle system
if (!window.ParticleSystemLoaded) {
    window.ParticleSystemLoaded = true;

    window.EnhancedParticleSystem = class {
        constructor(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            // particle system based on device 
            const baseParticleCount = isMobile ? 30 : isLowPowerDevice ? 50 : 75;

            this.config = {
                particleCount: options.particleCount || baseParticleCount,
                particleColor: options.particleColor || '#FFFFFF',
                particleSize: { min: 0.6, max: isMobile ? 1.0 : 1.2 },
                speed: options.speed || (isMobile ? 0.2 : 0.35),
                opacity: options.opacity || 1,
                interactive: options.interactive && !isMobile,
                ...options
            };

            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            this.isActive = true;
            this.lastFrame = 0;

            this.init();
        }

        init() {
            this.setupCanvas();
            this.createParticles();
            this.bindEvents();
            this.animate();
        }

        setupCanvas() {
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '-1';
            this.container.appendChild(this.canvas);
            this.resizeCanvas();
        }

        resizeCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = this.container.getBoundingClientRect();

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';

            this.ctx.scale(dpr, dpr);
        }

        createParticles() {
            for (let i = 0; i < this.config.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
                    speedX: (Math.random() - 0.5) * this.config.speed,
                    speedY: (Math.random() - 0.5) * this.config.speed,
                    opacity: Math.random() * this.config.opacity * 0.8 + 0.4
                });
            }
        }

        bindEvents() {
            const resizeHandler = debounce(() => this.resizeCanvas(), 250);
            window.addEventListener('resize', resizeHandler, { passive: true });

            if (this.config.interactive) {
                let isUpdating = false;
                const mouseMoveHandler = (e) => {
                    if (isUpdating) return;
                    isUpdating = true;

                    requestAnimationFrame(() => {
                        const rect = this.container.getBoundingClientRect();
                        this.mouse.x = e.clientX - rect.left;
                        this.mouse.y = e.clientY - rect.top;
                        isUpdating = false;
                    });
                };

                this.container.addEventListener('mousemove', mouseMoveHandler, { passive: true });
            }

            // pause all animations when the tab is not active (this was actually so smart on my part ngl)
            document.addEventListener('visibilitychange', () => {
                this.isActive = !document.hidden;
            });
        }

        animate() {
            if (!this.isActive || performanceModeActive) {
                requestAnimationFrame(() => this.animate());
                return;
            }

            const now = Date.now();
            if (now - this.lastFrame < 16) { // 60fps for smoother animations
                requestAnimationFrame(() => this.animate());
                return;
            }
            this.lastFrame = now;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;

                if (this.config.interactive && this.mouse.x && this.mouse.y) {
                    const dx = this.mouse.x - particle.x;
                    const dy = this.mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 60 && distance > 10) {
                        const force = Math.min((60 - distance) / 60, 0.5);
                        particle.x -= dx * 0.002 * force;
                        particle.y -= dy * 0.002 * force;
                    }
                }

                this.ctx.save();
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.fillStyle = this.config.particleColor;
                this.ctx.shadowBlur = particle.size * 2;
                this.ctx.shadowColor = this.config.particleColor;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });

            requestAnimationFrame(() => this.animate());
        }
    };
}

// Optimized title sparkles
function createTitleSparkles() {
    const mainTitle = document.querySelector('h1');
    if (!mainTitle) return;

    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'title-sparkle-container';
    sparkleContainer.style.position = 'absolute';
    sparkleContainer.style.top = '0';
    sparkleContainer.style.left = '0';
    sparkleContainer.style.width = '100%';
    sparkleContainer.style.height = '100%';
    sparkleContainer.style.pointerEvents = 'none';
    sparkleContainer.style.zIndex = '1';
    sparkleContainer.style.overflow = 'visible';

    mainTitle.style.position = 'relative';
    mainTitle.appendChild(sparkleContainer);

    const sparkleCount = isMobile ? 15 : 25;
    const sparkles = [];

    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'title-sparkle';

        const x = Math.random() * 120 - 10;
        const y = Math.random() * 120 - 10;
        const size = Math.random() * (isMobile ? 2 : 3) + (isMobile ? 1.5 : 2);
        const opacity = Math.random() * 0.6 + 0.4;
        const animationDelay = Math.random() * 3;
        const animationDuration = Math.random() * 2 + 2;

        sparkle.style.position = 'absolute';
        sparkle.style.left = x + '%';
        sparkle.style.top = y + '%';
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.backgroundColor = '#FFD700';
        sparkle.style.opacity = opacity;
        sparkle.style.borderRadius = '50%';
        sparkle.style.boxShadow = `0 0 ${size * 2}px rgba(255, 215, 0, 0.6)`;
        sparkle.style.willChange = 'transform, opacity';
        sparkle.style.transform = 'translateZ(0)';
        sparkle.style.animation = `sparkleFloat ${animationDuration}s ease-in-out infinite ${animationDelay}s, sparkleTwinkle ${animationDuration * 0.6}s ease-in-out infinite ${animationDelay}s`;

        if (Math.random() > 0.5) {
            sparkle.style.borderRadius = '0';
            sparkle.style.transform = 'rotate(45deg) translateZ(0)';
            sparkle.style.background = 'linear-gradient(45deg, #FFD700, #FFF, #FFD700)';
        }

        sparkleContainer.appendChild(sparkle);
        sparkles.push({ element: sparkle, baseX: x, baseY: y, size, baseOpacity: opacity });
    }

    // Optimized dynamic sparkle stuffy
    const createNewSparkle = throttle(() => {
        if (sparkleContainer.children.length > sparkleCount * 2) return;

        const sparkle = document.createElement('div');
        sparkle.className = 'title-sparkle dynamic-sparkle';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;

        sparkle.style.position = 'absolute';
        sparkle.style.left = x + '%';
        sparkle.style.top = y + '%';
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.backgroundColor = '#FFFFFF';
        sparkle.style.borderRadius = '50%';
        sparkle.style.opacity = '0';
        sparkle.style.boxShadow = `0 0 ${size * 3}px rgba(255, 255, 255, 0.6)`;
        sparkle.style.willChange = 'transform, opacity';
        sparkle.style.transform = 'translateZ(0)';

        sparkleContainer.appendChild(sparkle);

        sparkle.animate([
            { opacity: 0, transform: 'scale(0) rotate(0deg) translateZ(0)' },
            { opacity: 1, transform: 'scale(1) rotate(180deg) translateZ(0)', offset: 0.5 },
            { opacity: 0, transform: 'scale(0) rotate(360deg) translateZ(0)' }
        ], {
            duration: 1200,
            easing: 'ease-out'
        }).onfinish = () => sparkle.remove();
    }, 1000);

    setInterval(createNewSparkle, isMobile ? 1000 : 600);
    return sparkles;
}

// better shooting stars 
function createShootingStars() {
    if (isMobile) return; // turned off on mobbile for better performance 

    const shootingStarsContainer = document.createElement('div');
    shootingStarsContainer.className = 'shooting-stars-container';
    shootingStarsContainer.style.position = 'fixed';
    shootingStarsContainer.style.top = '0';
    shootingStarsContainer.style.left = '0';
    shootingStarsContainer.style.width = '100%';
    shootingStarsContainer.style.height = '100%';
    shootingStarsContainer.style.pointerEvents = 'none';
    shootingStarsContainer.style.zIndex = '1';
    shootingStarsContainer.style.overflow = 'hidden';

    document.body.appendChild(shootingStarsContainer);

    let activeStars = 0;
    const maxStars = 3;

    function createShootingStar() {
        if (activeStars >= maxStars) return;
        activeStars++;

        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';

        const side = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;

        switch (side) {
            case 0:
                startX = Math.random() * window.innerWidth;
                startY = -50;
                endX = Math.random() * window.innerWidth;
                endY = window.innerHeight + 50;
                break;
            case 1:
                startX = window.innerWidth + 50;
                startY = Math.random() * window.innerHeight;
                endX = -50;
                endY = Math.random() * window.innerHeight;
                break;
            case 2:
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + 50;
                endX = Math.random() * window.innerWidth;
                endY = -50;
                break;
            case 3:
                startX = -50;
                startY = Math.random() * window.innerHeight;
                endX = window.innerWidth + 50;
                endY = Math.random() * window.innerHeight;
                break;
        }

        const size = Math.random() * 2 + 1.5;
        const duration = Math.random() * 800 + 1200;
        const opacity = Math.random() * 0.3 + 0.6;

        shootingStar.style.position = 'absolute';
        shootingStar.style.width = size + 'px';
        shootingStar.style.height = size + 'px';
        shootingStar.style.backgroundColor = '#ffffff';
        shootingStar.style.borderRadius = '50%';
        shootingStar.style.left = startX + 'px';
        shootingStar.style.top = startY + 'px';
        shootingStar.style.opacity = opacity;
        shootingStar.style.boxShadow = `0 0 ${size * 3}px rgba(255, 255, 255, ${opacity})`;
        shootingStar.style.zIndex = '1';
        shootingStar.style.willChange = 'transform, opacity';
        shootingStar.style.transform = 'translateZ(0)';

        const trail = document.createElement('div');
        trail.style.position = 'absolute';
        trail.style.width = '20px';
        trail.style.height = '1px';
        trail.style.background = `linear-gradient(90deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 100%)`;
        trail.style.left = '-10px';
        trail.style.top = '50%';
        trail.style.transform = 'translateY(-50%)';
        shootingStar.appendChild(trail);

        shootingStarsContainer.appendChild(shootingStar);

        const animation = shootingStar.animate([
            { left: startX + 'px', top: startY + 'px', opacity: 0 },
            { left: startX + (endX - startX) * 0.1 + 'px', top: startY + (endY - startY) * 0.1 + 'px', opacity: opacity, offset: 0.1 },
            { left: startX + (endX - startX) * 0.9 + 'px', top: startY + (endY - startY) * 0.9 + 'px', opacity: opacity, offset: 0.9 },
            { left: endX + 'px', top: endY + 'px', opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        });

        animation.onfinish = () => {
            shootingStar.remove();
            activeStars--;
        };
    }

    function scheduleNextShootingStar() {
        const delay = Math.random() * 5000 + 3000;
        setTimeout(() => {
            createShootingStar();
            scheduleNextShootingStar();
        }, delay);
    }

    scheduleNextShootingStar();
}

// Stable mouse cursor system
if (!window.ModernCursorLoaded && !isMobile) {
    window.ModernCursorLoaded = true;

    window.ModernCursor = class {
        constructor() {
            this.cursor = null;
            this.follower = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.followerX = 0;
            this.followerY = 0;
            this.isVisible = false;
            this.lastUpdate = 0;
            this.rafId = null;

            this.init();
        }

        init() {
            this.createCursor();
            this.bindEvents();
            this.render();
        }

        createCursor() {
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            this.cursor.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
                transition: all 0.1s ease;
                opacity: 0;
                filter: blur(0px);
                will-change: transform, filter;
            `;
            document.body.appendChild(this.cursor);

            this.follower = document.createElement('div');
            this.follower.className = 'custom-cursor-follower';
            this.follower.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 40px;
                height: 40px;
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transition: all 0.3s ease;
                opacity: 0;
                filter: blur(0px);
                will-change: transform, filter;
            `;
            document.body.appendChild(this.follower);

            // Create motion blur trail elements
            this.trailElements = [];
            for (let i = 0; i < 5; i++) {
                const trail = document.createElement('div');
                trail.className = 'cursor-trail';
                trail.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: ${20 - i * 2}px;
                    height: ${20 - i * 2}px;
                    background: rgba(255, 255, 255, ${0.3 - i * 0.05});
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: ${9997 - i};
                    mix-blend-mode: difference;
                    opacity: 0;
                    filter: blur(${i * 0.5}px);
                    will-change: transform, opacity;
                `;
                document.body.appendChild(trail);
                this.trailElements.push({
                    element: trail,
                    x: 0,
                    y: 0,
                    delay: i * 2
                });
            }

            this.velocity = { x: 0, y: 0 };
            this.previousPosition = { x: 0, y: 0 };
        }

        bindEvents() {
            let isMoving = false;

            const updateMousePosition = (e) => {
                // Calculate velocity for motion blur with smoothing
                if (this.mouseX !== undefined && this.mouseY !== undefined) {
                    const newVelocityX = (e.clientX - this.mouseX) * 0.8;
                    const newVelocityY = (e.clientY - this.mouseY) * 0.8;

                    // Smooth velocity changes to reduce jitter
                    this.velocity.x = this.velocity.x * 0.7 + newVelocityX * 0.3;
                    this.velocity.y = this.velocity.y * 0.7 + newVelocityY * 0.3;
                }

                this.mouseX = e.clientX;
                this.mouseY = e.clientY;

                if (!this.isVisible) {
                    this.isVisible = true;
                    this.cursor.style.opacity = '1';
                    this.follower.style.opacity = '1';
                    // Show trail elements only if performance mode is off
                    if (!performanceModeActive) {
                        this.trailElements.forEach(trail => {
                            trail.element.style.opacity = '1';
                        });
                    }
                }

                if (!isMoving) {
                    isMoving = true;
                    requestAnimationFrame(() => {
                        isMoving = false;
                    });
                }
            };

            document.addEventListener('mousemove', updateMousePosition, { passive: true });

            document.addEventListener('mouseleave', () => {
                this.isVisible = false;
                this.cursor.style.opacity = '0';
                this.follower.style.opacity = '0';
                // Hide trail elements
                this.trailElements.forEach(trail => {
                    trail.element.style.opacity = '0';
                });
            }, { passive: true });

            document.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    this.cursor.style.transform += ' scale(0.8)';
                }
            }, { passive: true });

            document.addEventListener('mouseup', (e) => {
                if (e.button === 0) {
                    this.cursor.style.transform = this.cursor.style.transform.replace(' scale(0.8)', '');
                }
            }, { passive: true });

            this.setupHoverEffects();
        }

        setupHoverEffects() {
            const addHoverListeners = (selector, className) => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.addEventListener('mouseenter', () => {
                            this.cursor.classList.add(className);
                            this.follower.classList.add(className);
                        }, { passive: true });

                        element.addEventListener('mouseleave', () => {
                            this.cursor.classList.remove(className);
                            this.follower.classList.remove(className);
                        }, { passive: true });
                    });
                } catch (e) {
                    // Ignore invalid selectors
                }
            };

            addHoverListeners('button, [role="button"]', 'button-hover');
            addHoverListeners('a', 'hover');
            addHoverListeners('h1, h2, h3, p', 'text-hover');
        }

        render() {
            const now = performance.now();

            // Dynamic throttling - optimized for smooth cursor movement
            const targetFPS = performanceModeActive ? 60 : 144;
            const frameTime = 1000 / targetFPS;

            if (now - this.lastUpdate < frameTime) {
                this.rafId = requestAnimationFrame(() => this.render());
                return;
            }

            this.lastUpdate = now;

            if (this.mouseX !== undefined && this.mouseY !== undefined) {
                // Simplified cursor movement for optimal smoothness
                this.cursor.style.filter = 'none';
                this.cursor.style.transform = `translate3d(${this.mouseX - 10}px, ${this.mouseY - 10}px, 0)`;

                // Optimized follower movement for smooth tracking
                const followSpeed = performanceModeActive ? 0.15 : 0.12;
                const distance = Math.sqrt(
                    Math.pow(this.mouseX - this.followerX, 2) + 
                    Math.pow(this.mouseY - this.followerY, 2)
                );

                // Smooth interpolation with optimal precision
                if (distance > 0.05) {
                    this.followerX += (this.mouseX - this.followerX) * followSpeed;
                    this.followerY += (this.mouseY - this.followerY) * followSpeed;
                }

                // No blur effects for better performance
                this.follower.style.filter = 'none';

                this.follower.style.transform = `translate3d(${this.followerX - 20}px, ${this.followerY - 20}px, 0)`;

                // Trail elements disabled by default for smoothest experience
                // Enable only when performance mode is explicitly turned off
                this.trailElements.forEach(trail => {
                    trail.element.style.opacity = '0';
                });

                // Enhanced velocity decay for smoother motion blur
                const decayRate = performanceModeActive ? 0.88 : 0.94;
                this.velocity.x *= decayRate;
                this.velocity.y *= decayRate;
            }

            this.rafId = requestAnimationFrame(() => this.render());
        }

        destroy() {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            if (this.cursor) {
                this.cursor.remove();
            }
            if (this.follower) {
                this.follower.remove();
            }
            // Clean up trail elements
            if (this.trailElements) {
                this.trailElements.forEach(trail => {
                    trail.element.remove();
                });
            }
        }
    };
}

// Toast notification
function showToast(message) {
    // Remove existing toast if any
    const existing = document.querySelector('.neo-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'neo-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Optimized smooth scrolling
function initSmoothScrolling() {
    // Cache elements for better performance
    const elementsCache = {
        skills: null,
        impact: null,
        events: null,
        contact: null,
        team: null
    };

    // Function to get or cache elements
    const getElement = (key, selector) => {
        if (!elementsCache[key]) {
            elementsCache[key] = document.querySelector(selector);
        }
        return elementsCache[key];
    };

    const navLinks = document.querySelectorAll('nav a, .fixed a, footer a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            const linkText = link.textContent.trim().toLowerCase();
            let targetPosition = 0;
            let shouldScroll = false;

            // Instant visual feedback
            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = '';
            }, 100);

            switch (linkText) {
                case 'home':
                    targetPosition = 0;
                    shouldScroll = true;
                    break;
                case 'skills':
                    const skillsElement = getElement('skills', '#skills');
                    if (skillsElement) {
                        targetPosition = skillsElement.offsetTop - 80;
                        shouldScroll = true;
                    }
                    break;
                case 'impact':
                    const impactElement = getElement('impact', '#experience');
                    if (impactElement) {
                        targetPosition = impactElement.offsetTop - 80;
                        shouldScroll = true;
                    }
                    break;
                case 'upcoming events':
                    const eventsElement = getElement('events', '.neo-events-section');
                    if (eventsElement) {
                        targetPosition = eventsElement.offsetTop - 80;
                        shouldScroll = true;
                    }
                    break;
                case 'contact':
                    const contactElement = getElement('contact', '#contact');
                    if (contactElement) {
                        targetPosition = contactElement.offsetTop - 80;
                        shouldScroll = true;
                    }
                    break;
                case 'back to top':
                    targetPosition = 0;
                    shouldScroll = true;
                    break;
            }

            if (shouldScroll) {
                // Immediate scroll start with no delay
                smoothScrollTo(targetPosition);
            }
        }, { capture: true, passive: false });
    });

    // Instant button response with zero-delay handling
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const buttonText = button.textContent.trim();

        // Instant visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);

        if (buttonText.includes('Back to Top')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            // Instant scroll start
            smoothScrollTo(0);
        } else if (buttonText.includes('Suggest an Event')) {
            e.preventDefault();
            // Instant window open
            window.open('https://docs.google.com/forms/d/e/1FAIpQLScUPPaCJG-7jphLzcYpeKI40sQFh13iyG6PWCVCRht5f0fMCg/viewform?usp=dialog', '_blank');
        } else if (buttonText.includes('Register Now')) {
            e.preventDefault();
            // Instant window open
            window.open('https://docs.google.com/forms/d/e/1FAIpQLSeUiyniG11EnmR295nUgYSuJxr95QL5w3PdvM92lKQ0ukaeOw/viewform?usp=dialog', '_blank');
        } else if (buttonText.includes('Meet our Staff')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const teamElement = getElement('team', '#team');
            if (teamElement) {
                smoothScrollTo(teamElement.offsetTop - 80);
            }
        } else if (buttonText.includes('Join Us') || buttonText.includes('Learn More')) {
            e.preventDefault();
            showToast('Coming soon — check back later!');
        } else if (buttonText.includes('Explore More')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const skillsElement = getElement('skills', '#skills');
            if (skillsElement) {
                // Instant scroll start
                smoothScrollTo(skillsElement.offsetTop - 80);
            }
        }
    }, { capture: true, passive: false });
}

function smoothScrollTo(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;

    // Even faster duration for instant response
    const duration = Math.abs(distance) > 1000 ? 400 : 250;

    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    let startTime = null;
    let isAnimating = true;

    const animateScroll = (currentTime) => {
        if (!isAnimating) return;
        
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        const currentPosition = startPosition + (distance * easedProgress);
        window.scrollTo(0, currentPosition);

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        } else {
            isAnimating = false;
            // Ensure we land exactly on target
            window.scrollTo(0, targetPosition);
        }
    };

    requestAnimationFrame(animateScroll);
}

// Intersection Observer for better performance
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            createTitleSparkles();
            titleObserver.disconnect();
        }
    });
}, observerOptions);

// Initialize volunteer hours odometer
function initVolunteerHoursOdometer() {
    const volunteerHoursElement = document.getElementById('volunteer-hours');
    if (!volunteerHoursElement) return;

    // Wait for Odometer to be available
    const initOdometer = () => {
        if (typeof window.Odometer === 'undefined') {
            setTimeout(initOdometer, 100);
            return;
        }

        try {
            // Set initial value and ensure proper classes
            volunteerHoursElement.innerHTML = '0';
            volunteerHoursElement.classList.add('odometer');

            // Initialize odometer
            const odometer = new window.Odometer({
                el: volunteerHoursElement,
                value: 0,
                format: 'd',
                theme: 'default',
                duration: 2000,
                animation: 'count'
            });

            // Create intersection observer
            const volunteerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            // Start animation to 53
                            odometer.update(53);

                            // Add the "+" after animation completes
                            setTimeout(() => {
                                volunteerHoursElement.innerHTML = '53+';
                            }, 3000);
                        }, 800);
                        volunteerObserver.disconnect();
                    }
                });
            }, { threshold: 0.3 });

            volunteerObserver.observe(volunteerHoursElement);

            console.log('Odometer initialized successfully');
        } catch (error) {
            console.error('Odometer initialization failed:', error);
            // Fallback: animate manually
            setTimeout(() => {
                let count = 0;
                const target = 53;
                const increment = target / 53; // 53 steps
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        volunteerHoursElement.innerHTML = '53+';
                        clearInterval(timer);
                    } else {
                        volunteerHoursElement.innerHTML = Math.floor(count);
                    }
                }, 40); // 40ms per step = 2 second animation
            }, 800);
        }
    };

    initOdometer();
}

// Initialize currently volunteers odometer
function initCurrentlyVolunteersOdometer() {
    const currentlyVolunteersElement = document.getElementById('currently-volunteers');
    if (!currentlyVolunteersElement) return;

    // Wait for Odometer to be available
    const initOdometer = () => {
        if (typeof window.Odometer === 'undefined') {
            setTimeout(initOdometer, 100);
            return;
        }

        try {
            // Set initial value and ensure proper classes
            currentlyVolunteersElement.innerHTML = '0';
            currentlyVolunteersElement.classList.add('odometer');

            // Initialize odometer
            const odometer = new window.Odometer({
                el: currentlyVolunteersElement,
                value: 0,
                format: 'd',
                theme: 'default',
                duration: 2000,
                animation: 'count'
            });

            // Create intersection observer
            const currentlyVolunteersObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            // Start animation to 11
                            odometer.update(11);
                        }, 800); // Same timing as volunteer hours
                        currentlyVolunteersObserver.disconnect();
                    }
                });
            }, { threshold: 0.3 });

            currentlyVolunteersObserver.observe(currentlyVolunteersElement);

            console.log('Currently Volunteers Odometer initialized successfully');
        } catch (error) {
            console.error('Currently Volunteers Odometer initialization failed:', error);
            // Fallback: animate manually
            setTimeout(() => {
                let count = 0;
                const target = 11;
                const increment = target / 22; // 22 steps for smoother animation
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        currentlyVolunteersElement.innerHTML = '11';
                        clearInterval(timer);
                    } else {
                        currentlyVolunteersElement.innerHTML = Math.floor(count);
                    }
                }, 40); // 40ms per step
            }, 800);
        }
    };

    initOdometer();
}

// Performance mode functionality
let performanceModeActive = false;

function createStarExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 12 stars for explosion
    for (let i = 0; i < 12; i++) {
        const star = document.createElement('div');
        star.className = 'explosion-star';

        // Random direction and distance
        const angle = (i * 30) + Math.random() * 30; // Distribute evenly with some randomness
        const distance = 60 + Math.random() * 40; // Random distance
        const radian = angle * (Math.PI / 180);

        const endX = centerX + Math.cos(radian) * distance;
        const endY = centerY + Math.sin(radian) * distance;

        star.style.left = centerX + 'px';
        star.style.top = centerY + 'px';
        star.style.zIndex = '10001';

        document.body.appendChild(star);

        // Animate to final position
        const animation = star.animate([
            { 
                left: centerX + 'px', 
                top: centerY + 'px',
                opacity: 1,
                transform: 'scale(0) rotate(0deg)'
            },
            { 
                left: endX + 'px', 
                top: endY + 'px',
                opacity: 0,
                transform: 'scale(1) rotate(360deg)'
            }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        animation.onfinish = () => {
            star.remove();
        };
    }
}

function togglePerformanceMode() {
    performanceModeActive = !performanceModeActive;

    const toggles = document.querySelectorAll('#performance-toggle, #performance-toggle-fixed, #performance-toggle-mobile');
    const containers = document.querySelectorAll('.performance-toggle-container');
    const indicator = document.getElementById('performance-indicator');

    toggles.forEach(toggle => {
        if (performanceModeActive) {
            toggle.classList.add('active');
            createStarExplosion(toggle);
        } else {
            toggle.classList.remove('active');
        }
    });

    containers.forEach(container => {
        if (performanceModeActive) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    });

    if (indicator) {
        if (performanceModeActive) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }

    // Apply performance optimizations
    if (performanceModeActive) {
        // Reduce animations and effects
        const style = document.createElement('style');
        style.id = 'performance-mode-styles';
        style.textContent = `
            /* Hide decorative particle/star elements */
            .animated-starfield,
            .shooting-stars-container,
            .title-sparkle-container,
            .floating-star,
            .dreams-star,
            .shooting-star,
            .neo-floating-orbs,
            .neo-orb {
                display: none !important;
            }

            /* Only slow down decorative animations, not UI interactions */
            .spinning {
                animation-duration: 30s !important;
            }

            .glow-border,
            .animate-spotlight,
            .animate-spin-slow,
            .animate-pulse-slow,
            .animate-reverse-spin,
            .animate-float-1,
            .animate-float-2,
            .animate-float-3 {
                animation: none !important;
            }

            /* Remove expensive backdrop blur — replace with solid bg */
            .backdrop-blur-xl,
            .backdrop-blur-\\[5px\\],
            .backdrop-blur-\\[1\\.25px\\] {
                backdrop-filter: none !important;
                background-color: rgba(0, 0, 0, 0.7) !important;
            }

            /* Simplify glow filters */
            .drop-shadow-glow,
            .hover\\:drop-shadow-glow:hover {
                filter: none !important;
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.3) !important;
            }

            /* Disable box-shadow glow effects on skill cards */
            .glowhtml, .glowcss, .glowjs, .glowtw,
            .glowreact, .glownext, .glowvercel,
            .glowfigma, .glowps {
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        // Remove performance optimizations
        const existingStyle = document.getElementById('performance-mode-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
    }
}

function initPerformanceToggle() {
    const toggles = document.querySelectorAll('#performance-toggle, #performance-toggle-fixed, #performance-toggle-mobile');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePerformanceMode();
        });

        // Add hover effects
        toggle.addEventListener('mouseenter', () => {
            if (!performanceModeActive) {
                toggle.style.transform = 'scale(1.05)';
            }
        });

        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
        });
    });
}

// Mobile menu
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
        }
    });
}

// Show/hide fixed nav on scroll
function initFixedNavScroll() {
    const fixedNav = document.querySelector('.fixed.top-10');
    if (!fixedNav) return;

    fixedNav.style.transition = 'transform 0.3s ease';

    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 300) {
            fixedNav.style.transform = 'translateY(0) translateZ(0)';
        } else {
            fixedNav.style.transform = 'translateY(-100px) translateZ(0)';
        }
    }, 100), { passive: true });
}

// Active nav indicator based on scroll position
function initActiveNavIndicator() {
    const sections = document.querySelectorAll('#home, #team, #skills, #experience, #events, #contact');
    const navLinks = document.querySelectorAll('nav a[href^="#"], .fixed.top-10 a[href^="#"]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('nav-active');
                    const href = link.getAttribute('href');
                    if (href === '#' + id) {
                        link.classList.add('nav-active');
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    sections.forEach(section => sectionObserver.observe(section));
}

// Scroll reveal animations
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize based on device capabilities
    if (!isMobile && window.ModernCursor) {
        new window.ModernCursor();
    }

    initSmoothScrolling();
    initPerformanceToggle();
    initMobileMenu();
    initFixedNavScroll();
    initActiveNavIndicator();
    initScrollReveal();

    // delay fat animations for better initial load
    setTimeout(() => {
        createAnimatedStarfield();
        createShootingStars();

        const mainTitle = document.querySelector('h1');
        if (mainTitle) {
            titleObserver.observe(mainTitle);
        }

        // initialize particles
        const particleContainer = document.getElementById('particles-hero');
        if (particleContainer && window.EnhancedParticleSystem) {
            new window.EnhancedParticleSystem('particles-hero', {
                particleCount: isMobile ? 30 : 75,
                particleColor: '#FFFFFF',
                speed: isMobile ? 0.2 : 0.35
            });
        }

        // Initialize volunteer hours odometer
        initVolunteerHoursOdometer();

        // Initialize currently volunteers odometer
        initCurrentlyVolunteersOdometer();
    }, 100);
});

// touch device optimizations
if (isMobile) {
    document.addEventListener('touchstart', function() { }, { passive: true });
    document.addEventListener('touchmove', function() { }, { passive: true });

    // reduce motion and other stuff for mobile yayayay
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation-duration: 0.5s !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.3s !important;
        }
        .spinning {
            animation-duration: 30s !important;
        }
    `;
    document.head.appendChild(style);
}
