export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  iterations: number;
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  lifetime: { min: number; max: number };
  color: string[];
  shape: 'circle' | 'square' | 'star' | 'diamond' | 'heart';
  gravity: number;
  wind: number;
  fadeOut: boolean;
  bounce: boolean;
  trail: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: string;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  rotation: number;
  rotationSpeed: number;
}

export interface AnimationSequence {
  name: string;
  steps: Array<{
    target: string;
    animation: string;
    config: Partial<AnimationConfig>;
    delay?: number;
  }>;
}

class AnimationManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrame: number | null = null;
  private isRunning = false;
  private lastTime = 0;

  // Predefined animation sequences
  private sequences: { [key: string]: AnimationSequence } = {
    spinStart: {
      name: 'Spin Start',
      steps: [
        {
          target: '.slot-reel',
          animation: 'reelSpin',
          config: { duration: 2000, easing: 'ease-out' }
        },
        {
          target: '.paylines-overlay',
          animation: 'fadeOut',
          config: { duration: 300 },
          delay: 0
        }
      ]
    },
    winCelebration: {
      name: 'Win Celebration',
      steps: [
        {
          target: '.winning-symbols',
          animation: 'winPulse',
          config: { duration: 1000, iterations: 3 }
        },
        {
          target: '.paylines-overlay .winning',
          animation: 'paylineGlow',
          config: { duration: 2000, iterations: 2 },
          delay: 500
        },
        {
          target: '.win-display',
          animation: 'winReveal',
          config: { duration: 800, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
          delay: 300
        }
      ]
    },
    jackpotCelebration: {
      name: 'Jackpot Celebration',
      steps: [
        {
          target: '.slot-machine',
          animation: 'jackpotShake',
          config: { duration: 500, iterations: 2 }
        },
        {
          target: '.jackpot-banner',
          animation: 'jackpotReveal',
          config: { duration: 1000, easing: 'bounce' },
          delay: 200
        }
      ]
    },
    bonusTrigger: {
      name: 'Bonus Trigger',
      steps: [
        {
          target: '.bonus-symbols',
          animation: 'bonusGlow',
          config: { duration: 800, iterations: 3 }
        },
        {
          target: '.bonus-overlay',
          animation: 'bonusZoom',
          config: { duration: 1200, easing: 'ease-out' },
          delay: 400
        }
      ]
    }
  };

  // CSS Animation definitions
  private animations = `
    @keyframes reelSpin {
      0% { transform: translateY(0); }
      100% { transform: translateY(-100px); }
    }

    @keyframes winPulse {
      0%, 100% { 
        transform: scale(1); 
        filter: brightness(1) drop-shadow(0 0 0 rgba(255, 215, 0, 0));
      }
      50% { 
        transform: scale(1.1); 
        filter: brightness(1.3) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
      }
    }

    @keyframes paylineGlow {
      0%, 100% { 
        opacity: 0.6; 
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
      }
      50% { 
        opacity: 1; 
        box-shadow: 0 0 30px rgba(255, 215, 0, 1);
      }
    }

    @keyframes winReveal {
      0% { 
        transform: scale(0.8) translateY(20px); 
        opacity: 0; 
      }
      100% { 
        transform: scale(1) translateY(0); 
        opacity: 1; 
      }
    }

    @keyframes jackpotShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    @keyframes jackpotReveal {
      0% { 
        transform: scale(0.3) rotate(-10deg); 
        opacity: 0; 
      }
      50% { 
        transform: scale(1.1) rotate(5deg); 
      }
      100% { 
        transform: scale(1) rotate(0deg); 
        opacity: 1; 
      }
    }

    @keyframes bonusGlow {
      0%, 100% { 
        filter: brightness(1) hue-rotate(0deg);
        transform: scale(1);
      }
      50% { 
        filter: brightness(1.5) hue-rotate(90deg);
        transform: scale(1.05);
      }
    }

    @keyframes bonusZoom {
      0% { 
        transform: scale(0.5); 
        opacity: 0; 
        filter: blur(10px);
      }
      100% { 
        transform: scale(1); 
        opacity: 1; 
        filter: blur(0px);
      }
    }

    @keyframes symbolLand {
      0% { 
        transform: translateY(-50px) rotateY(180deg); 
        opacity: 0; 
      }
      50% { 
        transform: translateY(5px) rotateY(90deg); 
      }
      100% { 
        transform: translateY(0) rotateY(0deg); 
        opacity: 1; 
      }
    }

    @keyframes coinsFall {
      0% { 
        transform: translateY(-100px) rotate(0deg); 
        opacity: 1; 
      }
      100% { 
        transform: translateY(100vh) rotate(720deg); 
        opacity: 0; 
      }
    }

    @keyframes fireworksExplode {
      0% { 
        transform: scale(0.1); 
        opacity: 1; 
      }
      50% { 
        transform: scale(1.2); 
        opacity: 0.8; 
      }
      100% { 
        transform: scale(2); 
        opacity: 0; 
      }
    }

    @keyframes sparkleTrail {
      0% { 
        transform: scale(0) rotate(0deg); 
        opacity: 1; 
      }
      100% { 
        transform: scale(1.5) rotate(180deg); 
        opacity: 0; 
      }
    }

    /* Utility animations */
    .animate-spin-fast {
      animation: spin 0.5s linear infinite;
    }

    .animate-bounce-soft {
      animation: bounce 2s ease-in-out infinite;
    }

    .animate-glow {
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      0% { filter: drop-shadow(0 0 5px currentColor); }
      100% { filter: drop-shadow(0 0 20px currentColor); }
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .animate-shimmer {
      animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  constructor() {
    this.injectAnimations();
  }

  /**
   * Initialize the animation manager with canvas for particles
   */
  initialize(canvasContainer: HTMLElement): void {
    // Create canvas for particle effects
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';
    
    canvasContainer.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resizeCanvas();
    
    // Handle resize
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Start animation loop
    this.startAnimationLoop();
  }

  /**
   * Inject CSS animations into the page
   */
  private injectAnimations(): void {
    const styleElement = document.createElement('style');
    styleElement.textContent = this.animations;
    document.head.appendChild(styleElement);
  }

  /**
   * Resize canvas to match container
   */
  private resizeCanvas(): void {
    if (!this.canvas || !this.canvas.parentElement) return;
    
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      this.updateParticles(deltaTime);
      this.renderParticles();
      
      if (this.isRunning) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Stop the animation loop
   */
  stopAnimationLoop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Create particles
   */
  createParticles(x: number, y: number, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 20,
      size: { min: 3, max: 8 },
      speed: { min: 50, max: 150 },
      lifetime: { min: 1000, max: 3000 },
      color: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
      shape: 'circle',
      gravity: 100,
      wind: 0,
      fadeOut: true,
      bounce: false,
      trail: false
    };

    const finalConfig = { ...defaultConfig, ...config };

    for (let i = 0; i < finalConfig.count; i++) {
      const angle = (Math.PI * 2 * i) / finalConfig.count + (Math.random() - 0.5) * 0.5;
      const speed = finalConfig.speed.min + Math.random() * (finalConfig.speed.max - finalConfig.speed.min);
      const size = finalConfig.size.min + Math.random() * (finalConfig.size.max - finalConfig.size.min);
      const lifetime = finalConfig.lifetime.min + Math.random() * (finalConfig.lifetime.max - finalConfig.lifetime.min);
      const color = finalConfig.color[Math.floor(Math.random() * finalConfig.color.length)];

      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        color: color,
        shape: finalConfig.shape,
        alpha: 1,
        lifetime: lifetime,
        maxLifetime: lifetime,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };

      this.particles.push(particle);
    }
  }

  /**
   * Update particles
   */
  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx * (deltaTime / 1000);
      particle.y += particle.vy * (deltaTime / 1000);
      
      // Apply gravity
      particle.vy += 100 * (deltaTime / 1000);
      
      // Update rotation
      particle.rotation += particle.rotationSpeed * (deltaTime / 1000);
      
      // Update lifetime
      particle.lifetime -= deltaTime;
      
      // Update alpha based on lifetime
      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      particle.alpha = particle.lifetime / particle.maxLifetime;
      
      // Remove particles that are off-screen
      if (this.canvas && (
        particle.x < -particle.size || 
        particle.x > this.canvas.width + particle.size ||
        particle.y > this.canvas.height + particle.size
      )) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles
   */
  private renderParticles(): void {
    if (!this.ctx || !this.canvas) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (const particle of this.particles) {
      this.ctx.save();
      
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      
      this.ctx.fillStyle = particle.color;
      
      switch (particle.shape) {
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          break;
          
        case 'square':
          this.ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
          break;
          
        case 'star':
          this.drawStar(particle.size);
          break;
          
        case 'diamond':
          this.drawDiamond(particle.size);
          break;
          
        case 'heart':
          this.drawHeart(particle.size);
          break;
      }
      
      this.ctx.restore();
    }
  }

  /**
   * Draw star shape
   */
  private drawStar(size: number): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? size : size * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw diamond shape
   */
  private drawDiamond(size: number): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(size, 0);
    this.ctx.lineTo(0, size);
    this.ctx.lineTo(-size, 0);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw heart shape
   */
  private drawHeart(size: number): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(0, topCurveHeight);
    
    // Left curve
    this.ctx.bezierCurveTo(
      -size, -topCurveHeight,
      -size, topCurveHeight,
      0, size
    );
    
    // Right curve
    this.ctx.bezierCurveTo(
      size, topCurveHeight,
      size, -topCurveHeight,
      0, topCurveHeight
    );
    
    this.ctx.fill();
  }

  /**
   * Play animation sequence
   */
  playSequence(sequenceName: string, target?: HTMLElement): void {
    const sequence = this.sequences[sequenceName];
    if (!sequence) {
      console.warn(`Animation sequence not found: ${sequenceName}`);
      return;
    }

    sequence.steps.forEach((step, index) => {
      setTimeout(() => {
        const elements = target 
          ? target.querySelectorAll(step.target)
          : document.querySelectorAll(step.target);
        
        elements.forEach(element => {
          this.applyAnimation(element as HTMLElement, step.animation, step.config);
        });
      }, step.delay || 0);
    });
  }

  /**
   * Apply animation to element
   */
  applyAnimation(element: HTMLElement, animationName: string, config: Partial<AnimationConfig> = {}): void {
    const defaultConfig: AnimationConfig = {
      duration: 1000,
      easing: 'ease',
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both'
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    element.style.animation = `${animationName} ${finalConfig.duration}ms ${finalConfig.easing} ${finalConfig.delay}ms ${finalConfig.iterations} ${finalConfig.direction} ${finalConfig.fillMode}`;
  }

  /**
   * Create win celebration effect
   */
  createWinCelebration(element: HTMLElement, winAmount: number, betAmount: number): void {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const winMultiplier = winAmount / betAmount;
    
    if (winMultiplier >= 100) {
      // Mega jackpot celebration
      this.createParticles(centerX, centerY, {
        count: 100,
        size: { min: 8, max: 15 },
        speed: { min: 100, max: 300 },
        color: ['#FFD700', '#FFA500', '#FF1493', '#00FF00'],
        shape: 'star',
        lifetime: { min: 2000, max: 4000 }
      });
      
      this.playSequence('jackpotCelebration', element);
    } else if (winMultiplier >= 10) {
      // Big win celebration
      this.createParticles(centerX, centerY, {
        count: 50,
        size: { min: 5, max: 12 },
        speed: { min: 80, max: 200 },
        color: ['#FFD700', '#FFA500', '#FF6B6B'],
        shape: 'circle',
        lifetime: { min: 1500, max: 3000 }
      });
      
      this.playSequence('winCelebration', element);
    } else if (winAmount > 0) {
      // Small win celebration
      this.createParticles(centerX, centerY, {
        count: 20,
        size: { min: 3, max: 8 },
        speed: { min: 50, max: 120 },
        color: ['#FFD700', '#FFA500'],
        shape: 'circle',
        lifetime: { min: 1000, max: 2000 }
      });
    }
  }

  /**
   * Create bonus trigger effect
   */
  createBonusTrigger(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    this.createParticles(centerX, centerY, {
      count: 60,
      size: { min: 6, max: 12 },
      speed: { min: 70, max: 180 },
      color: ['#9B59B6', '#8E44AD', '#E74C3C', '#F39C12'],
      shape: 'diamond',
      lifetime: { min: 2000, max: 3500 }
    });
    
    this.playSequence('bonusTrigger', element);
  }

  /**
   * Create coin drop effect
   */
  createCoinDrop(container: HTMLElement, count: number = 20): void {
    const rect = container.getBoundingClientRect();
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const coin = document.createElement('div');
        coin.style.position = 'absolute';
        coin.style.width = '20px';
        coin.style.height = '20px';
        coin.style.backgroundColor = '#FFD700';
        coin.style.borderRadius = '50%';
        coin.style.left = Math.random() * rect.width + 'px';
        coin.style.top = '-20px';
        coin.style.zIndex = '1000';
        coin.style.animation = 'coinsFall 2s ease-in forwards';
        coin.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        
        container.appendChild(coin);
        
        setTimeout(() => {
          if (coin.parentElement) {
            coin.parentElement.removeChild(coin);
          }
        }, 2000);
      }, i * 100);
    }
  }

  /**
   * Add utility animation classes
   */
  addUtilityClass(element: HTMLElement, className: string, duration: number = 1000): void {
    element.classList.add(className);
    
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }

  /**
   * Clear all particles
   */
  clearParticles(): void {
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopAnimationLoop();
    this.clearParticles();
    
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    
    this.canvas = null;
    this.ctx = null;
  }
}

// Export singleton instance
const animationManager = new AnimationManager();
export default animationManager;

// Export utility functions
export const AnimationUtils = {
  /**
   * Create element with animation
   */
  createAnimatedElement(
    tag: string, 
    className: string, 
    parent: HTMLElement,
    animationName: string,
    config?: Partial<AnimationConfig>
  ): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    parent.appendChild(element);
    
    animationManager.applyAnimation(element, animationName, config);
    
    return element;
  },

  /**
   * Chain animations
   */
  chainAnimations(
    element: HTMLElement, 
    animations: Array<{ name: string; config?: Partial<AnimationConfig> }>
  ): void {
    let delay = 0;
    
    animations.forEach(anim => {
      setTimeout(() => {
        animationManager.applyAnimation(element, anim.name, anim.config);
      }, delay);
      
      delay += (anim.config?.duration || 1000) + (anim.config?.delay || 0);
    });
  },

  /**
   * Create text animation effect
   */
  animateText(element: HTMLElement, text: string, speed: number = 50): void {
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      setTimeout(() => {
        element.textContent += text[i];
      }, i * speed);
    }
  },

  /**
   * Create number counting animation
   */
  animateNumber(
    element: HTMLElement, 
    from: number, 
    to: number, 
    duration: number = 1000,
    formatter?: (num: number) => string
  ): void {
    const startTime = performance.now();
    const difference = to - from;
    
    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + (difference * easedProgress);
      
      element.textContent = formatter 
        ? formatter(Math.round(currentValue))
        : Math.round(currentValue).toString();
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    
    requestAnimationFrame(updateNumber);
  }
};
