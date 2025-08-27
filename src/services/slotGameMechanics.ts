import { SlotSymbol, PayLine, SlotResult } from '../components/SlotMachine';

export interface GameConfig {
  rtp: number; // Return to Player percentage (e.g., 0.96 for 96%)
  volatility: 'low' | 'medium' | 'high';
  maxWinMultiplier: number;
  bonusChance: number;
  jackpotSeed: number;
  minJackpotWin: number;
}

export interface WinCombination {
  symbols: string[];
  positions: number[][];
  multiplier: number;
  paylineId: number;
  isBonus: boolean;
  isJackpot: boolean;
}

export interface GameState {
  balance: number;
  totalWagered: number;
  totalWon: number;
  spinsPlayed: number;
  bigWins: number;
  bonusRounds: number;
  jackpotsWon: number;
  currentStreak: number;
  maxStreak: number;
  lastWinAmount: number;
  sessionTime: number;
}

export interface BonusRound {
  type: 'free_spins' | 'pick_bonus' | 'wheel_bonus' | 'multiplier_round';
  spinsRemaining?: number;
  multiplier?: number;
  picks?: number;
  prizes?: number[];
  isActive: boolean;
}

// Enhanced symbol definitions with more detailed properties
export const ENHANCED_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', name: 'Cherry', value: 2, rarity: 0.25, emoji: '🍒', color: '#ff4757' },
  { id: 'lemon', name: 'Lemon', value: 3, rarity: 0.22, emoji: '🍋', color: '#ffa502' },
  { id: 'orange', name: 'Orange', value: 4, rarity: 0.20, emoji: '🍊', color: '#ff6348' },
  { id: 'plum', name: 'Plum', value: 5, rarity: 0.17, emoji: '🍇', color: '#a55eea' },
  { id: 'watermelon', name: 'Watermelon', value: 6, rarity: 0.14, emoji: '🍉', color: '#26de81' },
  { id: 'bell', name: 'Bell', value: 8, rarity: 0.10, emoji: '🔔', color: '#ffd700' },
  { id: 'bar', name: 'Bar', value: 10, rarity: 0.08, emoji: '📊', color: '#2f3542' },
  { id: 'seven', name: 'Lucky 7', value: 15, rarity: 0.06, emoji: '7️⃣', color: '#ff3838' },
  { id: 'diamond', name: 'Diamond', value: 25, rarity: 0.04, emoji: '💎', color: '#74b9ff' },
  { id: 'crown', name: 'Crown', value: 50, rarity: 0.025, emoji: '👑', color: '#fdcb6e' },
  { id: 'star', name: 'Star', value: 75, rarity: 0.02, emoji: '⭐', color: '#ffd700' },
  { id: 'wild', name: 'Wild', value: 0, rarity: 0.03, emoji: '🃏', color: '#ff7675' },
  { id: 'scatter', name: 'Scatter', value: 0, rarity: 0.025, emoji: '💫', color: '#74b9ff' },
  { id: 'bonus', name: 'Bonus', value: 0, rarity: 0.02, emoji: '🎁', color: '#00b894' },
  { id: 'jackpot', name: 'Jackpot', value: 1000, rarity: 0.005, emoji: '🎰', color: '#e84393' }
];

// Extended paylines for 3x3 grid (up to 27 possible lines)
export const ENHANCED_PAYLINES: PayLine[] = [
  // Horizontal lines
  { id: 1, positions: [[0, 0], [0, 1], [0, 2]], name: 'Top Row' },
  { id: 2, positions: [[1, 0], [1, 1], [1, 2]], name: 'Middle Row' },
  { id: 3, positions: [[2, 0], [2, 1], [2, 2]], name: 'Bottom Row' },
  
  // Vertical lines
  { id: 4, positions: [[0, 0], [1, 0], [2, 0]], name: 'Left Column' },
  { id: 5, positions: [[0, 1], [1, 1], [2, 1]], name: 'Center Column' },
  { id: 6, positions: [[0, 2], [1, 2], [2, 2]], name: 'Right Column' },
  
  // Diagonal lines
  { id: 7, positions: [[0, 0], [1, 1], [2, 2]], name: 'Diagonal Down' },
  { id: 8, positions: [[2, 0], [1, 1], [0, 2]], name: 'Diagonal Up' },
  
  // V-shaped lines
  { id: 9, positions: [[0, 0], [1, 1], [0, 2]], name: 'V Top' },
  { id: 10, positions: [[2, 0], [1, 1], [2, 2]], name: 'V Bottom' },
  { id: 11, positions: [[0, 0], [2, 1], [0, 2]], name: 'Inverted V Top' },
  { id: 12, positions: [[2, 0], [0, 1], [2, 2]], name: 'Inverted V Bottom' },
  
  // Zigzag lines
  { id: 13, positions: [[0, 0], [2, 1], [1, 2]], name: 'Zigzag 1' },
  { id: 14, positions: [[2, 0], [0, 1], [1, 2]], name: 'Zigzag 2' },
  { id: 15, positions: [[1, 0], [0, 1], [2, 2]], name: 'Zigzag 3' },
  { id: 16, positions: [[1, 0], [2, 1], [0, 2]], name: 'Zigzag 4' },
  
  // Corner patterns
  { id: 17, positions: [[0, 0], [0, 1], [1, 2]], name: 'L Shape 1' },
  { id: 18, positions: [[0, 0], [1, 0], [2, 1]], name: 'L Shape 2' },
  { id: 19, positions: [[2, 0], [2, 1], [1, 2]], name: 'L Shape 3' },
  { id: 20, positions: [[2, 2], [1, 2], [0, 1]], name: 'L Shape 4' },
  
  // Triple combinations (any 3 matching symbols)
  { id: 21, positions: [[0, 0], [1, 0], [2, 0]], name: 'Left Triple' },
  { id: 22, positions: [[0, 1], [1, 1], [2, 1]], name: 'Center Triple' },
  { id: 23, positions: [[0, 2], [1, 2], [2, 2]], name: 'Right Triple' },
  
  // Special patterns
  { id: 24, positions: [[0, 1], [1, 0], [1, 2]], name: 'T Shape' },
  { id: 25, positions: [[1, 0], [0, 1], [2, 1]], name: 'Cross Shape' }
];

export class SlotGameEngine {
  private config: GameConfig;
  private gameState: GameState;
  private bonusRound: BonusRound | null = null;
  private rng: () => number;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = {
      rtp: 0.96,
      volatility: 'medium',
      maxWinMultiplier: 1000,
      bonusChance: 0.05,
      jackpotSeed: 50000,
      minJackpotWin: 100000,
      ...config
    };

    this.gameState = {
      balance: 1000,
      totalWagered: 0,
      totalWon: 0,
      spinsPlayed: 0,
      bigWins: 0,
      bonusRounds: 0,
      jackpotsWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastWinAmount: 0,
      sessionTime: Date.now()
    };

    // Seeded random number generator for better RTP control
    this.rng = this.createSeededRNG();
  }

  private createSeededRNG(): () => number {
    let seed = Date.now() % 2147483647;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  public getSymbolByRarity(forcedRarity?: number): SlotSymbol {
    const random = forcedRarity !== undefined ? forcedRarity : this.rng();
    let cumulativeWeight = 0;
    
    // Adjust probabilities based on RTP and game state
    const rtpAdjustment = this.calculateRTPAdjustment();
    
    for (const symbol of ENHANCED_SYMBOLS) {
      const adjustedRarity = symbol.rarity * rtpAdjustment;
      cumulativeWeight += adjustedRarity;
      
      if (random <= cumulativeWeight) {
        return symbol;
      }
    }
    
    return ENHANCED_SYMBOLS[0]; // Fallback to most common symbol
  }

  private calculateRTPAdjustment(): number {
    const targetRTP = this.config.rtp;
    const currentRTP = this.gameState.totalWagered > 0 
      ? this.gameState.totalWon / this.gameState.totalWagered 
      : targetRTP;
    
    // If we're paying out too much, make wins less likely
    // If we're paying out too little, make wins more likely
    const rtpDifference = targetRTP - currentRTP;
    const adjustment = 1 + (rtpDifference * 0.5); // Moderate adjustment
    
    return Math.max(0.5, Math.min(2.0, adjustment)); // Clamp between 0.5x and 2x
  }

  public generateReels(): SlotSymbol[][] {
    const reels: SlotSymbol[][] = [];
    
    for (let reel = 0; reel < 3; reel++) {
      const reelSymbols: SlotSymbol[] = [];
      
      for (let position = 0; position < 3; position++) {
        // Apply volatility-based randomness
        let symbol: SlotSymbol;
        
        if (this.config.volatility === 'high' && this.rng() < 0.1) {
          // High volatility: occasional high-value symbols
          symbol = this.getHighValueSymbol();
        } else if (this.config.volatility === 'low' && this.rng() < 0.3) {
          // Low volatility: more frequent low-value symbols
          symbol = this.getLowValueSymbol();
        } else {
          // Normal generation
          symbol = this.getSymbolByRarity();
        }
        
        reelSymbols.push(symbol);
      }
      
      reels.push(reelSymbols);
    }
    
    return reels;
  }

  private getHighValueSymbol(): SlotSymbol {
    const highValueSymbols = ENHANCED_SYMBOLS.filter(s => s.value >= 25);
    const randomIndex = Math.floor(this.rng() * highValueSymbols.length);
    return highValueSymbols[randomIndex];
  }

  private getLowValueSymbol(): SlotSymbol {
    const lowValueSymbols = ENHANCED_SYMBOLS.filter(s => s.value <= 10 && s.value > 0);
    const randomIndex = Math.floor(this.rng() * lowValueSymbols.length);
    return lowValueSymbols[randomIndex];
  }

  public evaluateWin(reels: SlotSymbol[][], bet: number, activePaylines: number[] = []): SlotResult {
    const winCombinations: WinCombination[] = [];
    const paylinesToCheck = activePaylines.length > 0 
      ? ENHANCED_PAYLINES.filter(p => activePaylines.includes(p.id))
      : ENHANCED_PAYLINES.slice(0, 10); // Use first 10 paylines by default
    
    let totalWin = 0;
    let winningLines: number[] = [];
    let multiplier = 1;
    let isJackpot = false;

    // Check each payline for winning combinations
    for (const payline of paylinesToCheck) {
      const symbols = payline.positions.map(([row, col]) => reels[row][col]);
      const winResult = this.checkPaylineWin(symbols, payline, bet);
      
      if (winResult) {
        winCombinations.push(winResult);
        winningLines.push(payline.id);
        totalWin += winResult.multiplier * bet;
        
        if (winResult.isJackpot) {
          isJackpot = true;
          multiplier = Math.max(multiplier, 100);
        }
      }
    }

    // Check for scatter pays (anywhere on reels)
    const scatterWin = this.checkScatterWin(reels, bet);
    if (scatterWin > 0) {
      totalWin += scatterWin;
      multiplier = Math.max(multiplier, 2);
    }

    // Check for bonus triggers
    const bonusTriggered = this.checkBonusFeatures(reels);
    if (bonusTriggered) {
      this.triggerBonusRound(bonusTriggered);
    }

    // Apply wild substitutions
    const wildMultiplier = this.calculateWildMultiplier(reels, winningLines);
    multiplier *= wildMultiplier;

    // Apply final multiplier
    totalWin *= multiplier;

    // Big win detection
    if (totalWin >= bet * 10) {
      this.gameState.bigWins++;
    }

    // Update game state
    this.updateGameState(bet, totalWin);

    return {
      reels,
      winningLines,
      totalWin: Math.floor(totalWin),
      multiplier,
      isJackpot
    };
  }

  private checkPaylineWin(symbols: SlotSymbol[], payline: PayLine, bet: number): WinCombination | null {
    // Check for exact matches
    const firstSymbol = symbols[0];
    let isWinningLine = false;
    let winMultiplier = 0;

    if (symbols.every(symbol => symbol.id === firstSymbol.id || symbol.id === 'wild')) {
      // All symbols match (including wilds)
      isWinningLine = true;
      winMultiplier = firstSymbol.value;
    } else if (symbols.filter(s => s.id === 'wild').length >= 2) {
      // Two or more wilds
      isWinningLine = true;
      winMultiplier = 5; // Base wild value
    }

    if (isWinningLine) {
      return {
        symbols: symbols.map(s => s.id),
        positions: payline.positions,
        multiplier: winMultiplier,
        paylineId: payline.id,
        isBonus: firstSymbol.id === 'bonus',
        isJackpot: firstSymbol.id === 'jackpot'
      };
    }

    return null;
  }

  private checkScatterWin(reels: SlotSymbol[][], bet: number): number {
    const allSymbols = reels.flat();
    const scatterCount = allSymbols.filter(s => s.id === 'scatter').length;
    
    if (scatterCount >= 3) {
      // 3+ scatters anywhere pays
      return bet * (scatterCount * 5);
    }
    
    return 0;
  }

  private checkBonusFeatures(reels: SlotSymbol[][]): string | null {
    const allSymbols = reels.flat();
    const bonusCount = allSymbols.filter(s => s.id === 'bonus').length;
    const scatterCount = allSymbols.filter(s => s.id === 'scatter').length;
    
    if (bonusCount >= 3) {
      return 'pick_bonus';
    } else if (scatterCount >= 3) {
      return 'free_spins';
    } else if (this.rng() < this.config.bonusChance) {
      return 'wheel_bonus';
    }
    
    return null;
  }

  private calculateWildMultiplier(reels: SlotSymbol[][], winningLines: number[]): number {
    let wildMultiplier = 1;
    const allSymbols = reels.flat();
    const wildCount = allSymbols.filter(s => s.id === 'wild').length;
    
    if (wildCount > 0 && winningLines.length > 0) {
      wildMultiplier = 1 + (wildCount * 0.5); // Each wild adds 50% multiplier
    }
    
    return wildMultiplier;
  }

  private triggerBonusRound(bonusType: string): void {
    this.gameState.bonusRounds++;
    
    switch (bonusType) {
      case 'free_spins':
        this.bonusRound = {
          type: 'free_spins',
          spinsRemaining: 10 + Math.floor(this.rng() * 15), // 10-24 free spins
          multiplier: 2 + Math.floor(this.rng() * 3), // 2x-4x multiplier
          isActive: true
        };
        break;
        
      case 'pick_bonus':
        this.bonusRound = {
          type: 'pick_bonus',
          picks: 3,
          prizes: this.generatePickBonusPrizes(),
          isActive: true
        };
        break;
        
      case 'wheel_bonus':
        this.bonusRound = {
          type: 'wheel_bonus',
          multiplier: this.getWheelBonusMultiplier(),
          isActive: true
        };
        break;
    }
  }

  private generatePickBonusPrizes(): number[] {
    const baseValues = [50, 100, 200, 500, 1000, 2000];
    return baseValues.map(value => value + Math.floor(this.rng() * value));
  }

  private getWheelBonusMultiplier(): number {
    const multipliers = [2, 3, 5, 10, 25, 50, 100];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.05, 0.03, 0.02];
    
    const random = this.rng();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < multipliers.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return multipliers[i];
      }
    }
    
    return multipliers[0];
  }

  private updateGameState(bet: number, totalWin: number): void {
    this.gameState.totalWagered += bet;
    this.gameState.totalWon += totalWin;
    this.gameState.spinsPlayed++;
    this.gameState.lastWinAmount = totalWin;
    
    if (totalWin > 0) {
      this.gameState.currentStreak++;
      this.gameState.maxStreak = Math.max(this.gameState.maxStreak, this.gameState.currentStreak);
    } else {
      this.gameState.currentStreak = 0;
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getBonusRound(): BonusRound | null {
    return this.bonusRound ? { ...this.bonusRound } : null;
  }

  public completeBonusRound(): number {
    if (!this.bonusRound) return 0;
    
    let bonusWin = 0;
    
    switch (this.bonusRound.type) {
      case 'pick_bonus':
        bonusWin = this.bonusRound.prizes?.[0] || 0;
        break;
      case 'wheel_bonus':
        bonusWin = (this.bonusRound.multiplier || 1) * 100;
        break;
    }
    
    this.bonusRound = null;
    return bonusWin;
  }

  public getCurrentRTP(): number {
    return this.gameState.totalWagered > 0 
      ? this.gameState.totalWon / this.gameState.totalWagered 
      : 0;
  }

  public getVolatilityMetrics(): { variance: number; hitFrequency: number } {
    const wins = this.gameState.totalWon;
    const spins = this.gameState.spinsPlayed;
    const avgWin = spins > 0 ? wins / spins : 0;
    
    // Simplified variance calculation
    const variance = avgWin * 2.5; // Approximate variance
    const hitFrequency = spins > 0 ? (this.gameState.bigWins + this.gameState.bonusRounds) / spins : 0;
    
    return { variance, hitFrequency };
  }

  public adjustDifficulty(targetRTP: number): void {
    this.config.rtp = targetRTP;
  }

  public reset(): void {
    this.gameState = {
      balance: 1000,
      totalWagered: 0,
      totalWon: 0,
      spinsPlayed: 0,
      bigWins: 0,
      bonusRounds: 0,
      jackpotsWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastWinAmount: 0,
      sessionTime: Date.now()
    };
    this.bonusRound = null;
  }
}

// Utility functions for game analysis
export const GameAnalytics = {
  calculateExpectedValue(bet: number, rtp: number): number {
    return bet * rtp;
  },
  
  calculateSessionProfit(gameState: GameState): number {
    return gameState.totalWon - gameState.totalWagered;
  },
  
  calculateWinFrequency(gameState: GameState): number {
    return gameState.spinsPlayed > 0 ? gameState.bigWins / gameState.spinsPlayed : 0;
  },
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },
  
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }
};

export default SlotGameEngine;
