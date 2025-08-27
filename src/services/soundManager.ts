export interface SoundConfig {
  volume: number;
  enabled: boolean;
  crossfade: boolean;
  spatialAudio: boolean;
}

export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
  category: 'ui' | 'game' | 'ambient' | 'win' | 'bonus';
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private config: SoundConfig;
  private gainNode: GainNode | null = null;
  private initialized = false;

  // Sound effect definitions
  private soundEffects: SoundEffect[] = [
    // UI Sounds
    {
      id: 'button_click',
      name: 'Button Click',
      url: '/sounds/ui/button_click.mp3',
      volume: 0.3,
      loop: false,
      category: 'ui'
    },
    {
      id: 'button_hover',
      name: 'Button Hover',
      url: '/sounds/ui/button_hover.mp3',
      volume: 0.2,
      loop: false,
      category: 'ui'
    },
    {
      id: 'menu_open',
      name: 'Menu Open',
      url: '/sounds/ui/menu_open.mp3',
      volume: 0.4,
      loop: false,
      category: 'ui'
    },
    {
      id: 'menu_close',
      name: 'Menu Close',
      url: '/sounds/ui/menu_close.mp3',
      volume: 0.4,
      loop: false,
      category: 'ui'
    },
    {
      id: 'error',
      name: 'Error Sound',
      url: '/sounds/ui/error.mp3',
      volume: 0.5,
      loop: false,
      category: 'ui'
    },

    // Game Sounds
    {
      id: 'reel_spin',
      name: 'Reel Spinning',
      url: '/sounds/game/reel_spin.mp3',
      volume: 0.4,
      loop: true,
      fadeIn: 200,
      fadeOut: 300,
      category: 'game'
    },
    {
      id: 'reel_stop',
      name: 'Reel Stop',
      url: '/sounds/game/reel_stop.mp3',
      volume: 0.5,
      loop: false,
      category: 'game'
    },
    {
      id: 'symbol_land',
      name: 'Symbol Landing',
      url: '/sounds/game/symbol_land.mp3',
      volume: 0.3,
      loop: false,
      category: 'game'
    },
    {
      id: 'payline_highlight',
      name: 'Payline Highlight',
      url: '/sounds/game/payline_highlight.mp3',
      volume: 0.4,
      loop: false,
      category: 'game'
    },

    // Win Sounds
    {
      id: 'small_win',
      name: 'Small Win',
      url: '/sounds/wins/small_win.mp3',
      volume: 0.6,
      loop: false,
      category: 'win'
    },
    {
      id: 'medium_win',
      name: 'Medium Win',
      url: '/sounds/wins/medium_win.mp3',
      volume: 0.7,
      loop: false,
      category: 'win'
    },
    {
      id: 'big_win',
      name: 'Big Win',
      url: '/sounds/wins/big_win.mp3',
      volume: 0.8,
      loop: false,
      fadeIn: 100,
      category: 'win'
    },
    {
      id: 'mega_win',
      name: 'Mega Win',
      url: '/sounds/wins/mega_win.mp3',
      volume: 0.9,
      loop: false,
      fadeIn: 200,
      category: 'win'
    },
    {
      id: 'jackpot',
      name: 'Jackpot',
      url: '/sounds/wins/jackpot.mp3',
      volume: 1.0,
      loop: false,
      fadeIn: 300,
      category: 'win'
    },
    {
      id: 'coins_drop',
      name: 'Coins Dropping',
      url: '/sounds/wins/coins_drop.mp3',
      volume: 0.5,
      loop: false,
      category: 'win'
    },

    // Bonus Sounds
    {
      id: 'bonus_trigger',
      name: 'Bonus Triggered',
      url: '/sounds/bonus/bonus_trigger.mp3',
      volume: 0.8,
      loop: false,
      fadeIn: 150,
      category: 'bonus'
    },
    {
      id: 'free_spins',
      name: 'Free Spins',
      url: '/sounds/bonus/free_spins.mp3',
      volume: 0.7,
      loop: false,
      category: 'bonus'
    },
    {
      id: 'scatter_land',
      name: 'Scatter Landing',
      url: '/sounds/bonus/scatter_land.mp3',
      volume: 0.6,
      loop: false,
      category: 'bonus'
    },
    {
      id: 'wild_expand',
      name: 'Wild Expanding',
      url: '/sounds/bonus/wild_expand.mp3',
      volume: 0.6,
      loop: false,
      category: 'bonus'
    },

    // Ambient Sounds
    {
      id: 'casino_ambient',
      name: 'Casino Ambience',
      url: '/sounds/ambient/casino_ambient.mp3',
      volume: 0.2,
      loop: true,
      fadeIn: 1000,
      fadeOut: 1000,
      category: 'ambient'
    },
    {
      id: 'slot_machine_hum',
      name: 'Slot Machine Hum',
      url: '/sounds/ambient/slot_hum.mp3',
      volume: 0.15,
      loop: true,
      fadeIn: 500,
      fadeOut: 500,
      category: 'ambient'
    }
  ];

  constructor(config: Partial<SoundConfig> = {}) {
    this.config = {
      volume: 0.7,
      enabled: true,
      crossfade: true,
      spatialAudio: false,
      ...config
    };
  }

  /**
   * Initialize the sound manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.config.volume;

      // Load all sound effects
      await this.loadSounds();
      
      this.initialized = true;
      console.log('Sound Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sound Manager:', error);
      this.config.enabled = false;
    }
  }

  /**
   * Load all sound effects
   */
  private async loadSounds(): Promise<void> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const loadPromises = this.soundEffects.map(async (soundEffect) => {
      try {
        // For demo purposes, we'll create synthetic sounds instead of loading files
        const buffer = this.createSyntheticSound(soundEffect);
        this.sounds.set(soundEffect.id, buffer);
      } catch (error) {
        console.warn(`Failed to load sound: ${soundEffect.name}`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${this.sounds.size} sound effects`);
  }

  /**
   * Create synthetic sound for demo purposes
   */
  private createSyntheticSound(soundEffect: SoundEffect): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const duration = soundEffect.loop ? 2 : 0.5; // 2 seconds for loops, 0.5 for one-shots
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate different types of sounds based on category
    switch (soundEffect.category) {
      case 'ui':
        this.generateUISound(data, soundEffect.id);
        break;
      case 'game':
        this.generateGameSound(data, soundEffect.id);
        break;
      case 'win':
        this.generateWinSound(data, soundEffect.id);
        break;
      case 'bonus':
        this.generateBonusSound(data, soundEffect.id);
        break;
      case 'ambient':
        this.generateAmbientSound(data, soundEffect.id);
        break;
    }

    return buffer;
  }

  /**
   * Generate UI sounds
   */
  private generateUISound(data: Float32Array, soundId: string): void {
    const length = data.length;
    
    switch (soundId) {
      case 'button_click':
        // Sharp click sound
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const envelope = Math.exp(-t * 20);
          data[i] = envelope * Math.sin(2 * Math.PI * 800 * t) * 0.3;
        }
        break;
        
      case 'button_hover':
        // Soft hover sound
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const envelope = Math.exp(-t * 10);
          data[i] = envelope * Math.sin(2 * Math.PI * 600 * t) * 0.2;
        }
        break;
        
      case 'error':
        // Error beep
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const envelope = Math.exp(-t * 8);
          data[i] = envelope * Math.sin(2 * Math.PI * 400 * t) * 0.4;
        }
        break;
    }
  }

  /**
   * Generate game sounds
   */
  private generateGameSound(data: Float32Array, soundId: string): void {
    const length = data.length;
    
    switch (soundId) {
      case 'reel_spin':
        // Mechanical spinning sound
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const noise = (Math.random() - 0.5) * 0.1;
          const mechanical = Math.sin(2 * Math.PI * 60 * t) * 0.1;
          data[i] = noise + mechanical;
        }
        break;
        
      case 'reel_stop':
        // Stopping sound
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const envelope = Math.exp(-t * 15);
          data[i] = envelope * Math.sin(2 * Math.PI * 200 * t) * 0.3;
        }
        break;
        
      case 'symbol_land':
        // Symbol landing thud
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const envelope = Math.exp(-t * 25);
          const thud = Math.sin(2 * Math.PI * 100 * t);
          data[i] = envelope * thud * 0.4;
        }
        break;
    }
  }

  /**
   * Generate win sounds
   */
  private generateWinSound(data: Float32Array, soundId: string): void {
    const length = data.length;
    
    switch (soundId) {
      case 'small_win':
        // Simple ascending chime
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const freq = 440 + (t * 220); // Rise from 440Hz to 660Hz
          const envelope = Math.exp(-t * 8);
          data[i] = envelope * Math.sin(2 * Math.PI * freq * t) * 0.4;
        }
        break;
        
      case 'big_win':
        // Complex celebratory sound
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const freq1 = 440 * Math.pow(2, t); // Exponential rise
          const freq2 = 660 * Math.pow(2, t * 0.5);
          const envelope = Math.exp(-t * 3);
          data[i] = envelope * (
            Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
            Math.sin(2 * Math.PI * freq2 * t) * 0.2
          );
        }
        break;
        
      case 'jackpot':
        // Epic jackpot fanfare
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const fanfare = Math.sin(2 * Math.PI * 523 * t) + // C
                         Math.sin(2 * Math.PI * 659 * t) + // E
                         Math.sin(2 * Math.PI * 784 * t);  // G
          const envelope = Math.exp(-t * 2);
          data[i] = envelope * fanfare * 0.2;
        }
        break;
        
      case 'coins_drop':
        // Metallic coin sounds
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const noise = (Math.random() - 0.5) * 0.3;
          const metallic = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10);
          data[i] = (noise + metallic) * 0.3;
        }
        break;
    }
  }

  /**
   * Generate bonus sounds
   */
  private generateBonusSound(data: Float32Array, soundId: string): void {
    const length = data.length;
    
    switch (soundId) {
      case 'bonus_trigger':
        // Magical bonus trigger
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const sparkle = Math.sin(2 * Math.PI * 1000 * t * t) * Math.exp(-t * 5);
          const bass = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 3);
          data[i] = (sparkle * 0.4 + bass * 0.3);
        }
        break;
        
      case 'free_spins':
        // Swirling free spins sound
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const swirl = Math.sin(2 * Math.PI * 440 * t + Math.sin(2 * Math.PI * 5 * t));
          const envelope = Math.exp(-t * 4);
          data[i] = envelope * swirl * 0.4;
        }
        break;
    }
  }

  /**
   * Generate ambient sounds
   */
  private generateAmbientSound(data: Float32Array, soundId: string): void {
    const length = data.length;
    
    switch (soundId) {
      case 'casino_ambient':
        // Subtle casino atmosphere
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const noise = (Math.random() - 0.5) * 0.1;
          const distant = Math.sin(2 * Math.PI * 220 * t) * 0.05;
          data[i] = noise + distant;
        }
        break;
        
      case 'slot_machine_hum':
        // Electrical hum
        for (let i = 0; i < length; i++) {
          const t = i / length;
          const hum = Math.sin(2 * Math.PI * 60 * t) * 0.05;
          const variation = Math.sin(2 * Math.PI * 0.1 * t) * 0.02;
          data[i] = hum + variation;
        }
        break;
    }
  }

  /**
   * Play a sound effect
   */
  async play(soundId: string, options: { 
    volume?: number; 
    playbackRate?: number; 
    loop?: boolean;
    fadeIn?: number;
  } = {}): Promise<void> {
    if (!this.config.enabled || !this.initialized || !this.audioContext || !this.gainNode) {
      return;
    }

    const buffer = this.sounds.get(soundId);
    if (!buffer) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    // Resume audio context if suspended (required for some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Create source node
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    // Create gain node for this specific sound
    const soundGain = this.audioContext.createGain();
    soundGain.connect(this.gainNode);
    source.connect(soundGain);

    // Apply options
    const soundEffect = this.soundEffects.find(s => s.id === soundId);
    const finalVolume = (options.volume ?? soundEffect?.volume ?? 1) * this.config.volume;
    source.playbackRate.value = options.playbackRate ?? 1;
    source.loop = options.loop ?? soundEffect?.loop ?? false;

    // Apply fade in
    const fadeInDuration = options.fadeIn ?? soundEffect?.fadeIn ?? 0;
    if (fadeInDuration > 0) {
      soundGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      soundGain.gain.linearRampToValueAtTime(
        finalVolume, 
        this.audioContext.currentTime + (fadeInDuration / 1000)
      );
    } else {
      soundGain.gain.value = finalVolume;
    }

    // Store active source for potential stopping
    this.activeSources.set(soundId, source);

    // Handle source end
    source.onended = () => {
      this.activeSources.delete(soundId);
    };

    // Start playing
    source.start();
  }

  /**
   * Stop a sound effect
   */
  stop(soundId: string, fadeOut: number = 0): void {
    const source = this.activeSources.get(soundId);
    if (!source || !this.audioContext) return;

    if (fadeOut > 0) {
      const soundGain = source.connect as any; // Get the gain node
      if (soundGain && soundGain.gain) {
        soundGain.gain.linearRampToValueAtTime(
          0, 
          this.audioContext.currentTime + (fadeOut / 1000)
        );
        setTimeout(() => source.stop(), fadeOut);
      }
    } else {
      source.stop();
    }

    this.activeSources.delete(soundId);
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.activeSources.forEach((source, soundId) => {
      source.stop();
    });
    this.activeSources.clear();
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.config.volume;
    }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SoundConfig {
    return { ...this.config };
  }

  /**
   * Get available sound effects
   */
  getSoundEffects(): SoundEffect[] {
    return [...this.soundEffects];
  }

  /**
   * Play win sound based on win amount
   */
  playWinSound(winAmount: number, betAmount: number): void {
    const winMultiplier = winAmount / betAmount;
    
    if (winMultiplier >= 100) {
      this.play('jackpot');
    } else if (winMultiplier >= 50) {
      this.play('mega_win');
    } else if (winMultiplier >= 10) {
      this.play('big_win');
    } else if (winMultiplier >= 5) {
      this.play('medium_win');
    } else if (winAmount > 0) {
      this.play('small_win');
    }
  }

  /**
   * Play sequence of sounds
   */
  async playSequence(sounds: Array<{ id: string; delay: number; options?: any }>): Promise<void> {
    for (const sound of sounds) {
      await new Promise(resolve => setTimeout(resolve, sound.delay));
      await this.play(sound.id, sound.options);
    }
  }

  /**
   * Create audio visualization data (for visual effects)
   */
  createAnalyzer(): AnalyserNode | null {
    if (!this.audioContext || !this.gainNode) return null;

    const analyzer = this.audioContext.createAnalyser();
    analyzer.fftSize = 256;
    this.gainNode.connect(analyzer);
    
    return analyzer;
  }
}

// Export singleton instance
const soundManager = new SoundManager();
export default soundManager;

// Export utility functions
export const SoundUtils = {
  /**
   * Preload essential sounds for better UX
   */
  async preloadEssentialSounds(): Promise<void> {
    await soundManager.initialize();
  },

  /**
   * Create sound preset configurations
   */
  getPreset(preset: 'silent' | 'minimal' | 'full' | 'immersive'): Partial<SoundConfig> {
    switch (preset) {
      case 'silent':
        return { enabled: false, volume: 0 };
      case 'minimal':
        return { enabled: true, volume: 0.3, crossfade: false };
      case 'full':
        return { enabled: true, volume: 0.7, crossfade: true };
      case 'immersive':
        return { enabled: true, volume: 0.9, crossfade: true, spatialAudio: true };
      default:
        return {};
    }
  },

  /**
   * Check if Web Audio API is supported
   */
  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  },

  /**
   * Get audio context state
   */
  getAudioContextState(): string {
    return soundManager['audioContext']?.state || 'not-initialized';
  }
};
