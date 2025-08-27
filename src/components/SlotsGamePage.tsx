import React, { useState, useEffect } from 'react';
import SlotMachine from './SlotMachine';
import SlotMachineControls, { 
  AutoPlaySettings, 
  BetSettings, 
  GameSettings 
} from './SlotMachineControls';
import SlotGameEngine, { GameAnalytics } from '../services/slotGameMechanics';
import './SlotsGamePage.css';

interface SlotVariant {
  id: string;
  name: string;
  theme: string;
  description: string;
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  specialFeatures: string[];
  backgroundImage: string;
  jackpot: number;
  isPopular: boolean;
  isNew: boolean;
}

const SLOT_VARIANTS: SlotVariant[] = [
  {
    id: 'classic-777',
    name: 'Classic 777',
    theme: 'Traditional',
    description: 'Classic slot machine with traditional fruit symbols and lucky 7s',
    minBet: 1,
    maxBet: 100,
    rtp: 0.96,
    volatility: 'medium',
    specialFeatures: ['Wild Symbols', 'Scatter Pays', 'Double or Nothing'],
    backgroundImage: '/slots/classic-bg.jpg',
    jackpot: 25000,
    isPopular: true,
    isNew: false
  },
  {
    id: 'diamond-rush',
    name: 'Diamond Rush',
    theme: 'Luxury',
    description: 'High-stakes luxury slot with diamonds, gold, and massive payouts',
    minBet: 5,
    maxBet: 500,
    rtp: 0.94,
    volatility: 'high',
    specialFeatures: ['Progressive Jackpot', 'Free Spins', 'Multiplier Wilds', 'Bonus Rounds'],
    backgroundImage: '/slots/diamond-bg.jpg',
    jackpot: 100000,
    isPopular: true,
    isNew: false
  },
  {
    id: 'fruit-party',
    name: 'Fruit Party',
    theme: 'Casual',
    description: 'Fun and colorful fruit-themed slot perfect for casual players',
    minBet: 0.5,
    maxBet: 50,
    rtp: 0.97,
    volatility: 'low',
    specialFeatures: ['Cascading Reels', 'Fruit Combos', 'Party Mode'],
    backgroundImage: '/slots/fruit-bg.jpg',
    jackpot: 10000,
    isPopular: false,
    isNew: true
  },
  {
    id: 'mega-fortune',
    name: 'Mega Fortune',
    theme: 'Progressive',
    description: 'Massive progressive jackpot slot with life-changing prizes',
    minBet: 10,
    maxBet: 1000,
    rtp: 0.92,
    volatility: 'high',
    specialFeatures: ['Mega Progressive', 'Bonus Wheels', 'Free Spins', 'Random Wilds'],
    backgroundImage: '/slots/fortune-bg.jpg',
    jackpot: 2500000,
    isPopular: true,
    isNew: false
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    theme: 'Adventure',
    description: 'Explore the mysteries of ancient Egypt with pharaohs and treasures',
    minBet: 2,
    maxBet: 200,
    rtp: 0.95,
    volatility: 'medium',
    specialFeatures: ['Expanding Wilds', 'Tomb Bonus', 'Free Spins', 'Mummy Feature'],
    backgroundImage: '/slots/egypt-bg.jpg',
    jackpot: 50000,
    isPopular: false,
    isNew: true
  },
  {
    id: 'space-adventure',
    name: 'Space Adventure',
    theme: 'Sci-Fi',
    description: 'Journey through space with futuristic symbols and cosmic wins',
    minBet: 1,
    maxBet: 150,
    rtp: 0.96,
    volatility: 'medium',
    specialFeatures: ['Alien Wilds', 'Planet Bonus', 'Cosmic Spins', 'UFO Feature'],
    backgroundImage: '/slots/space-bg.jpg',
    jackpot: 75000,
    isPopular: false,
    isNew: true
  }
];

const SlotsGamePage: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<SlotVariant>(SLOT_VARIANTS[0]);
  const [gameEngine] = useState(() => new SlotGameEngine({
    rtp: selectedVariant.rtp,
    volatility: selectedVariant.volatility
  }));
  
  const [balance, setBalance] = useState(5000);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [totalSessionWin, setTotalSessionWin] = useState(0);
  const [currentJackpot, setCurrentJackpot] = useState(selectedVariant.jackpot);

  // Bet settings state
  const [betSettings, setBetSettings] = useState<BetSettings>({
    currentBet: selectedVariant.minBet,
    minBet: selectedVariant.minBet,
    maxBet: selectedVariant.maxBet,
    coinValue: 0.25,
    coinsPerLine: 1,
    activeLines: 10,
    maxLines: 25
  });

  // Auto-play settings state
  const [autoPlaySettings, setAutoPlaySettings] = useState<AutoPlaySettings>({
    isActive: false,
    spinsRemaining: 0,
    maxSpins: 10,
    stopOnWin: false,
    stopOnBigWin: false,
    stopOnBonusWin: false,
    stopOnLoss: 0,
    stopOnSingleWin: 0,
    maxLossLimit: 0,
    currentLoss: 0
  });

  // Game settings state
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    turboMode: false,
    soundEnabled: true,
    animationsEnabled: true,
    quickSpin: false,
    showWinLines: true,
    showCelebrations: true,
    skipWinAnimations: false
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [currentReels, setCurrentReels] = useState<any[][]>([[], [], []]);

  // Update bet settings when variant changes
  useEffect(() => {
    setBetSettings(prev => ({
      ...prev,
      currentBet: selectedVariant.minBet,
      minBet: selectedVariant.minBet,
      maxBet: selectedVariant.maxBet
    }));
    setCurrentJackpot(selectedVariant.jackpot);
  }, [selectedVariant]);

  // Jackpot ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJackpot(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVariantSelect = (variant: SlotVariant) => {
    setSelectedVariant(variant);
    setShowVariantSelector(false);
    
    // Reset game engine with new settings
    gameEngine.adjustDifficulty(variant.rtp);
  };

  const handleSpin = async () => {
    if (isSpinning || balance < getTotalBet()) return;

    setIsSpinning(true);
    const totalBet = getTotalBet();
    
    // Deduct bet from balance
    setBalance(prev => prev - totalBet);

    // Generate reels and evaluate win
    const newReels = gameEngine.generateReels();
    const result = gameEngine.evaluateWin(newReels, totalBet, getActivePaylines());
    
    // Simulate spinning delay
    const spinDelay = gameSettings.turboMode ? 1000 : gameSettings.quickSpin ? 1500 : 2500;
    
    setTimeout(() => {
      setCurrentReels(newReels);
      
      if (result.totalWin > 0) {
        setBalance(prev => prev + result.totalWin);
        setLastWin(result.totalWin);
        setTotalSessionWin(prev => prev + result.totalWin);
        
        // Check for jackpot
        if (result.isJackpot) {
          setBalance(prev => prev + currentJackpot);
          setCurrentJackpot(selectedVariant.jackpot); // Reset jackpot
        }
      } else {
        setLastWin(0);
      }

      // Add to game history
      setGameHistory(prev => [...prev.slice(-49), {
        timestamp: Date.now(),
        bet: totalBet,
        win: result.totalWin,
        variant: selectedVariant.name,
        reels: newReels
      }]);

      setIsSpinning(false);

      // Handle auto-play
      if (autoPlaySettings.isActive) {
        handleAutoPlaySpin(result.totalWin, totalBet);
      }
    }, spinDelay);
  };

  const handleAutoPlaySpin = (winAmount: number, betAmount: number) => {
    const newSpinsRemaining = autoPlaySettings.spinsRemaining - 1;
    const newCurrentLoss = autoPlaySettings.currentLoss + (winAmount === 0 ? betAmount : -winAmount);
    
    let shouldStop = false;
    
    // Check stop conditions
    if (newSpinsRemaining <= 0) shouldStop = true;
    if (autoPlaySettings.stopOnWin && winAmount > 0) shouldStop = true;
    if (autoPlaySettings.stopOnBigWin && winAmount >= betAmount * 10) shouldStop = true;
    if (autoPlaySettings.stopOnSingleWin && winAmount >= autoPlaySettings.stopOnSingleWin) shouldStop = true;
    if (autoPlaySettings.maxLossLimit && newCurrentLoss >= autoPlaySettings.maxLossLimit) shouldStop = true;
    if (balance < getTotalBet()) shouldStop = true;

    if (shouldStop) {
      setAutoPlaySettings(prev => ({
        ...prev,
        isActive: false,
        spinsRemaining: 0,
        currentLoss: 0
      }));
    } else {
      setAutoPlaySettings(prev => ({
        ...prev,
        spinsRemaining: newSpinsRemaining,
        currentLoss: newCurrentLoss
      }));
    }
  };

  const getTotalBet = () => betSettings.currentBet * betSettings.activeLines;
  const getActivePaylines = () => Array.from({ length: betSettings.activeLines }, (_, i) => i + 1);

  const handleBetChange = (newBet: number) => {
    setBetSettings(prev => ({ ...prev, currentBet: newBet }));
  };

  const handleLinesChange = (newLines: number) => {
    setBetSettings(prev => ({ ...prev, activeLines: newLines }));
  };

  const handleMaxBet = () => {
    const maxAffordableBet = Math.floor(balance / betSettings.activeLines);
    const newBet = Math.min(betSettings.maxBet, maxAffordableBet);
    setBetSettings(prev => ({ ...prev, currentBet: newBet }));
  };

  const handleAutoPlayToggle = () => {
    if (autoPlaySettings.isActive) {
      setAutoPlaySettings(prev => ({ ...prev, isActive: false, spinsRemaining: 0 }));
    } else {
      setAutoPlaySettings(prev => ({
        ...prev,
        isActive: true,
        spinsRemaining: prev.maxSpins,
        currentLoss: 0
      }));
    }
  };

  const gameState = gameEngine.getGameState();
  const currentRTP = gameEngine.getCurrentRTP();

  return (
    <div className="slots-game-page">
      {/* Header */}
      <div className="slots-header">
        <div className="game-title">
          <h1>🎰 Premium Slots Casino</h1>
          <div className="subtitle">Choose your game and win big!</div>
        </div>
        
        <div className="jackpot-ticker">
          <div className="mega-jackpot">
            <span className="jackpot-label">🏆 MEGA JACKPOT</span>
            <span className="jackpot-amount">${currentJackpot.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Game Selection */}
      <div className="game-selection">
        <button
          onClick={() => setShowVariantSelector(!showVariantSelector)}
          className="variant-selector-button"
        >
          <div className="current-game">
            <span className="game-icon">🎰</span>
            <div className="game-info">
              <span className="game-name">{selectedVariant.name}</span>
              <span className="game-theme">{selectedVariant.theme}</span>
            </div>
          </div>
          <span className="selector-arrow">{showVariantSelector ? '▲' : '▼'}</span>
        </button>

        {showVariantSelector && (
          <div className="variant-grid">
            {SLOT_VARIANTS.map(variant => (
              <div
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                className={`variant-card ${selectedVariant.id === variant.id ? 'selected' : ''}`}
              >
                <div className="variant-header">
                  <h3>{variant.name}</h3>
                  <div className="variant-badges">
                    {variant.isNew && <span className="badge new">NEW</span>}
                    {variant.isPopular && <span className="badge popular">POPULAR</span>}
                  </div>
                </div>
                
                <div className="variant-info">
                  <p className="description">{variant.description}</p>
                  
                  <div className="variant-stats">
                    <div className="stat">
                      <span className="label">RTP:</span>
                      <span className="value">{(variant.rtp * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat">
                      <span className="label">Volatility:</span>
                      <span className={`value ${variant.volatility}`}>{variant.volatility.toUpperCase()}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Max Win:</span>
                      <span className="value">${variant.jackpot.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="features">
                    <span className="features-label">Features:</span>
                    <div className="feature-tags">
                      {variant.specialFeatures.map(feature => (
                        <span key={feature} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bet-range">
                    Bet: ${variant.minBet} - ${variant.maxBet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="main-game-area">
        <div className="game-container">
          <SlotMachine
            onSpin={() => {}}
            onBalanceChange={() => {}}
            initialBalance={balance}
            minBet={betSettings.minBet}
            maxBet={betSettings.maxBet}
          />
        </div>

        <div className="controls-container">
          <SlotMachineControls
            balance={balance}
            betSettings={betSettings}
            autoPlaySettings={autoPlaySettings}
            gameSettings={gameSettings}
            isSpinning={isSpinning}
            onBetChange={handleBetChange}
            onLinesChange={handleLinesChange}
            onSpin={handleSpin}
            onAutoPlayToggle={handleAutoPlayToggle}
            onAutoPlaySettingsChange={(settings) => 
              setAutoPlaySettings(prev => ({ ...prev, ...settings }))}
            onGameSettingsChange={(settings) => 
              setGameSettings(prev => ({ ...prev, ...settings }))}
            onMaxBet={handleMaxBet}
            winAmount={lastWin}
            lastWinAmount={lastWin}
            disabled={false}
          />
        </div>
      </div>

      {/* Game Statistics */}
      <div className="game-statistics">
        <div className="stats-section">
          <h3>🎯 Session Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Spins:</span>
              <span className="stat-value">{gameState.spinsPlayed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Wagered:</span>
              <span className="stat-value">${gameState.totalWagered.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Won:</span>
              <span className="stat-value">${gameState.totalWon.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Session Profit:</span>
              <span className={`stat-value ${totalSessionWin >= 0 ? 'positive' : 'negative'}`}>
                ${totalSessionWin.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current RTP:</span>
              <span className="stat-value">{GameAnalytics.formatPercentage(currentRTP)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Big Wins:</span>
              <span className="stat-value">{gameState.bigWins}</span>
            </div>
          </div>
        </div>

        <div className="recent-history">
          <h3>📈 Recent Spins</h3>
          <div className="history-list">
            {gameHistory.slice(-10).reverse().map((spin, index) => (
              <div key={spin.timestamp} className={`history-item ${spin.win > 0 ? 'win' : 'loss'}`}>
                <span className="spin-number">#{gameHistory.length - index}</span>
                <span className="spin-bet">${spin.bet}</span>
                <span className="spin-result">{spin.win > 0 ? `+$${spin.win}` : '-'}</span>
                <span className="spin-time">
                  {new Date(spin.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Info Panel */}
      <div className="game-info-panel">
        <div className="current-game-details">
          <h3>{selectedVariant.name}</h3>
          <p>{selectedVariant.description}</p>
          
          <div className="game-details">
            <div className="detail-row">
              <span>Return to Player (RTP):</span>
              <span>{(selectedVariant.rtp * 100).toFixed(1)}%</span>
            </div>
            <div className="detail-row">
              <span>Volatility:</span>
              <span className={selectedVariant.volatility}>{selectedVariant.volatility.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span>Max Jackpot:</span>
              <span>${selectedVariant.jackpot.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Paylines:</span>
              <span>Up to 25</span>
            </div>
          </div>

          <div className="special-features-info">
            <h4>Special Features:</h4>
            <ul>
              {selectedVariant.specialFeatures.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotsGamePage;
