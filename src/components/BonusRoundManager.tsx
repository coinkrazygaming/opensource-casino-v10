import React, { useState, useEffect, useCallback } from 'react';
import { SlotSymbol } from './SlotMachine';
import soundManager from '../services/soundManager';
import animationManager from '../services/animationManager';
import './BonusRoundManager.css';

export interface BonusRound {
  id: string;
  type: 'free_spins' | 'pick_bonus' | 'wheel_bonus' | 'cascading_reels' | 'expanding_wilds';
  name: string;
  description: string;
  isActive: boolean;
  progress: number;
  maxProgress: number;
  multiplier: number;
  spinsRemaining?: number;
  picks?: number;
  prizes?: number[];
  specialSymbols?: SlotSymbol[];
  backgroundMusic?: string;
  triggerSymbols: string[];
  minTriggerCount: number;
}

export interface BonusResult {
  type: string;
  totalWin: number;
  multiplier: number;
  spinsUsed: number;
  specialFeatures: string[];
  completed: boolean;
}

export interface PickBonusItem {
  id: string;
  value: number;
  type: 'coin' | 'multiplier' | 'extra_pick' | 'collect' | 'jackpot';
  icon: string;
  revealed: boolean;
  selected: boolean;
}

export interface WheelSegment {
  id: string;
  value: number;
  type: 'cash' | 'multiplier' | 'free_spins' | 'jackpot';
  color: string;
  probability: number;
  label: string;
}

interface BonusRoundManagerProps {
  gameId: string;
  currentBet: number;
  onBonusComplete: (result: BonusResult) => void;
  onBonusStart?: () => void;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

const BonusRoundManager: React.FC<BonusRoundManagerProps> = ({
  gameId,
  currentBet,
  onBonusComplete,
  onBonusStart,
  soundEnabled,
  animationsEnabled
}) => {
  const [activeBonusRound, setActiveBonusRound] = useState<BonusRound | null>(null);
  const [bonusResult, setBonusResult] = useState<BonusResult | null>(null);
  const [pickBonusItems, setPickBonusItems] = useState<PickBonusItem[]>([]);
  const [wheelSegments] = useState<WheelSegment[]>([
    { id: '1', value: 100, type: 'cash', color: '#FFD700', probability: 0.3, label: '$100' },
    { id: '2', value: 200, type: 'cash', color: '#FFA500', probability: 0.25, label: '$200' },
    { id: '3', value: 500, type: 'cash', color: '#FF6B6B', probability: 0.15, label: '$500' },
    { id: '4', value: 2, type: 'multiplier', color: '#4ECDC4', probability: 0.15, label: '2x' },
    { id: '5', value: 5, type: 'multiplier', color: '#95E1D3', probability: 0.1, label: '5x' },
    { id: '6', value: 10, type: 'free_spins', color: '#A8E6CF', probability: 0.03, label: '10 FS' },
    { id: '7', value: 1000, type: 'jackpot', color: '#FF1493', probability: 0.02, label: 'JACKPOT' }
  ]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);

  // Predefined bonus rounds
  const availableBonusRounds: { [key: string]: Omit<BonusRound, 'id' | 'isActive' | 'progress'> } = {
    free_spins_classic: {
      type: 'free_spins',
      name: 'Free Spins Bonus',
      description: 'Get free spins with enhanced multipliers!',
      maxProgress: 10,
      multiplier: 3,
      spinsRemaining: 10,
      triggerSymbols: ['scatter'],
      minTriggerCount: 3,
      backgroundMusic: 'free_spins'
    },
    pick_treasure: {
      type: 'pick_bonus',
      name: 'Treasure Pick',
      description: 'Pick treasure chests to reveal prizes!',
      maxProgress: 3,
      multiplier: 1,
      picks: 3,
      triggerSymbols: ['bonus'],
      minTriggerCount: 3
    },
    fortune_wheel: {
      type: 'wheel_bonus',
      name: 'Fortune Wheel',
      description: 'Spin the wheel of fortune for mega prizes!',
      maxProgress: 1,
      multiplier: 1,
      triggerSymbols: ['wild', 'bonus'],
      minTriggerCount: 2
    },
    cascading_wins: {
      type: 'cascading_reels',
      name: 'Cascading Wins',
      description: 'Winning symbols disappear for new chances!',
      maxProgress: 5,
      multiplier: 1,
      triggerSymbols: ['diamond'],
      minTriggerCount: 4
    },
    wild_expansion: {
      type: 'expanding_wilds',
      name: 'Expanding Wilds',
      description: 'Wild symbols expand to cover entire reels!',
      maxProgress: 3,
      multiplier: 2,
      triggerSymbols: ['wild'],
      minTriggerCount: 2
    }
  };

  // Check for bonus trigger
  const checkBonusTrigger = useCallback((reels: SlotSymbol[][]): string | null => {
    const allSymbols = reels.flat();
    
    for (const [bonusId, bonusConfig] of Object.entries(availableBonusRounds)) {
      for (const triggerSymbol of bonusConfig.triggerSymbols) {
        const count = allSymbols.filter(symbol => symbol.id === triggerSymbol).length;
        if (count >= bonusConfig.minTriggerCount) {
          return bonusId;
        }
      }
    }
    
    return null;
  }, [availableBonusRounds]);

  // Start bonus round
  const startBonusRound = useCallback((bonusId: string) => {
    const bonusConfig = availableBonusRounds[bonusId];
    if (!bonusConfig) return;

    const newBonusRound: BonusRound = {
      id: bonusId,
      ...bonusConfig,
      isActive: true,
      progress: 0
    };

    setActiveBonusRound(newBonusRound);
    
    // Play bonus trigger sound
    if (soundEnabled) {
      soundManager.play('bonus_trigger');
    }

    // Start bonus animation
    if (animationsEnabled) {
      const container = document.querySelector('.bonus-round-container');
      if (container) {
        animationManager.createBonusTrigger(container as HTMLElement);
      }
    }

    // Initialize bonus-specific data
    if (bonusConfig.type === 'pick_bonus') {
      initializePickBonus();
    }

    onBonusStart?.();
  }, [availableBonusRounds, soundEnabled, animationsEnabled, onBonusStart]);

  // Initialize pick bonus items
  const initializePickBonus = () => {
    const items: PickBonusItem[] = [];
    const prizes = [50, 100, 150, 200, 300, 500, 1000, 2000];
    const types: PickBonusItem['type'][] = ['coin', 'coin', 'coin', 'multiplier', 'coin', 'extra_pick', 'coin', 'collect'];
    
    for (let i = 0; i < 12; i++) {
      items.push({
        id: `pick_${i}`,
        value: prizes[Math.floor(Math.random() * prizes.length)],
        type: types[Math.floor(Math.random() * types.length)],
        icon: getPickItemIcon(types[Math.floor(Math.random() * types.length)]),
        revealed: false,
        selected: false
      });
    }
    
    setPickBonusItems(items);
  };

  // Get pick item icon
  const getPickItemIcon = (type: PickBonusItem['type']): string => {
    const icons = {
      coin: '💰',
      multiplier: '✨',
      extra_pick: '🎁',
      collect: '💎',
      jackpot: '🎰'
    };
    return icons[type];
  };

  // Handle pick bonus item selection
  const handlePickItem = (itemId: string) => {
    if (!activeBonusRound || activeBonusRound.type !== 'pick_bonus') return;
    if (!activeBonusRound.picks || activeBonusRound.picks <= 0) return;

    setPickBonusItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, revealed: true, selected: true }
        : item
    ));

    const selectedItem = pickBonusItems.find(item => item.id === itemId);
    if (!selectedItem) return;

    // Play pick sound
    if (soundEnabled) {
      soundManager.play('button_click');
    }

    // Update bonus round progress
    setActiveBonusRound(prev => {
      if (!prev) return null;
      
      const newProgress = prev.progress + 1;
      const remainingPicks = (prev.picks || 0) - 1;
      
      // Check if bonus should end
      if (remainingPicks <= 0 || selectedItem.type === 'collect' || newProgress >= prev.maxProgress) {
        setTimeout(() => completeBonusRound(), 1000);
      }
      
      return {
        ...prev,
        progress: newProgress,
        picks: remainingPicks
      };
    });
  };

  // Handle wheel spin
  const handleWheelSpin = () => {
    if (!activeBonusRound || activeBonusRound.type !== 'wheel_bonus' || isWheelSpinning) return;

    setIsWheelSpinning(true);
    
    // Play wheel spin sound
    if (soundEnabled) {
      soundManager.play('reel_spin');
    }

    // Calculate random rotation (multiple full rotations + final position)
    const finalRotation = wheelRotation + 1440 + Math.random() * 360; // 4 full rotations + random
    setWheelRotation(finalRotation);

    // Determine winning segment
    setTimeout(() => {
      const normalizedRotation = finalRotation % 360;
      const segmentAngle = 360 / wheelSegments.length;
      const winningIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % wheelSegments.length;
      const winningSegment = wheelSegments[winningIndex];
      
      setSelectedSegment(winningSegment);
      setIsWheelSpinning(false);
      
      // Play win sound
      if (soundEnabled) {
        if (winningSegment.type === 'jackpot') {
          soundManager.play('jackpot');
        } else {
          soundManager.play('big_win');
        }
      }
      
      setTimeout(() => completeBonusRound(), 2000);
    }, 3000);
  };

  // Complete bonus round
  const completeBonusRound = () => {
    if (!activeBonusRound) return;

    let totalWin = 0;
    let multiplier = activeBonusRound.multiplier;
    const spinsUsed = activeBonusRound.maxProgress - (activeBonusRound.spinsRemaining || 0);
    const specialFeatures: string[] = [];

    // Calculate bonus result based on type
    switch (activeBonusRound.type) {
      case 'pick_bonus':
        const selectedItems = pickBonusItems.filter(item => item.selected);
        totalWin = selectedItems.reduce((sum, item) => {
          if (item.type === 'coin') {
            return sum + item.value * currentBet;
          } else if (item.type === 'multiplier') {
            multiplier *= item.value;
            specialFeatures.push(`${item.value}x Multiplier`);
          }
          return sum;
        }, 0);
        break;
        
      case 'wheel_bonus':
        if (selectedSegment) {
          if (selectedSegment.type === 'cash') {
            totalWin = selectedSegment.value * currentBet;
          } else if (selectedSegment.type === 'multiplier') {
            multiplier = selectedSegment.value;
            totalWin = currentBet * multiplier;
            specialFeatures.push(`${selectedSegment.value}x Multiplier`);
          } else if (selectedSegment.type === 'jackpot') {
            totalWin = selectedSegment.value * currentBet;
            specialFeatures.push('Jackpot Win!');
          }
        }
        break;
        
      case 'free_spins':
        // Free spins result would be calculated by the main game engine
        totalWin = currentBet * multiplier * (activeBonusRound.progress || 1);
        specialFeatures.push(`${activeBonusRound.progress} Free Spins`);
        break;
        
      default:
        totalWin = currentBet * multiplier;
    }

    const result: BonusResult = {
      type: activeBonusRound.type,
      totalWin: Math.floor(totalWin),
      multiplier,
      spinsUsed,
      specialFeatures,
      completed: true
    };

    setBonusResult(result);
    
    // Play completion sound
    if (soundEnabled) {
      soundManager.play('coins_drop');
    }

    // Show result for a few seconds then complete
    setTimeout(() => {
      onBonusComplete(result);
      setActiveBonusRound(null);
      setBonusResult(null);
      setPickBonusItems([]);
      setSelectedSegment(null);
      setWheelRotation(0);
    }, 3000);
  };

  if (!activeBonusRound && !bonusResult) {
    return null;
  }

  return (
    <div className="bonus-round-container">
      <div className="bonus-overlay">
        {/* Bonus content would be rendered here */}
        <div className="bonus-placeholder">
          <h2>Bonus Round: {activeBonusRound?.name}</h2>
          <p>{activeBonusRound?.description}</p>
          {bonusResult && (
            <div className="bonus-result">
              <h3>Bonus Complete!</h3>
              <p>Total Win: ${bonusResult.totalWin}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BonusRoundManager;

// Export utility functions
export const BonusUtils = {
  calculateTriggerProbability(symbolCount: number, totalSymbols: number, minRequired: number): number {
    if (symbolCount < minRequired) return 0;
    return Math.pow(symbolCount / totalSymbols, minRequired);
  },

  generateRandomMultiplier(min: number = 1, max: number = 10): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  calculateBonusWin(baseBet: number, multiplier: number, bonusValue: number): number {
    return Math.floor(baseBet * multiplier * bonusValue);
  },

  getBonusRarity(triggerProbability: number): string {
    if (triggerProbability >= 0.1) return 'Common';
    if (triggerProbability >= 0.05) return 'Uncommon';
    if (triggerProbability >= 0.02) return 'Rare';
    if (triggerProbability >= 0.01) return 'Epic';
    return 'Legendary';
  }
};
