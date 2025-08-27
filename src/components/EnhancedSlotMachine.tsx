import React, { useState, useEffect, useCallback } from 'react';
import SlotMachine, { SlotResult } from './SlotMachine';
import SlotMachineControls, { 
  AutoPlaySettings, 
  BetSettings, 
  GameSettings 
} from './SlotMachineControls';
import { useUser } from '../context/UserContext';
import transactionService from '../services/transactionService';
import SlotGameEngine from '../services/slotGameMechanics';
import './EnhancedSlotMachine.css';

interface EnhancedSlotMachineProps {
  gameId: string;
  gameName: string;
  variant?: string;
  minBet?: number;
  maxBet?: number;
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  onGameComplete?: (result: SlotResult) => void;
}

const EnhancedSlotMachine: React.FC<EnhancedSlotMachineProps> = ({
  gameId,
  gameName,
  variant = 'classic',
  minBet = 1,
  maxBet = 100,
  rtp = 0.96,
  volatility = 'medium',
  onGameComplete
}) => {
  const { 
    state: userState, 
    placeBet, 
    recordWin, 
    recordGameSpin, 
    canAfford 
  } = useUser();

  const [gameEngine] = useState(() => new SlotGameEngine({
    rtp,
    volatility,
    maxWinMultiplier: 1000,
    bonusChance: 0.05
  }));

  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SlotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    spins: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
    bigWins: 0,
    longestWinStreak: 0,
    currentWinStreak: 0
  });

  // Bet settings state
  const [betSettings, setBetSettings] = useState<BetSettings>({
    currentBet: minBet,
    minBet,
    maxBet,
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
    soundEnabled: userState.profile?.preferences.soundEnabled ?? true,
    animationsEnabled: userState.profile?.preferences.animationsEnabled ?? true,
    quickSpin: false,
    showWinLines: true,
    showCelebrations: true,
    skipWinAnimations: false
  });

  // Update bet limits when user balance changes
  useEffect(() => {
    const maxAffordableBet = Math.floor(userState.balance.real / betSettings.activeLines);
    const newMaxBet = Math.min(maxBet, maxAffordableBet);
    
    setBetSettings(prev => ({
      ...prev,
      maxBet: newMaxBet,
      currentBet: Math.min(prev.currentBet, newMaxBet)
    }));
  }, [userState.balance.real, betSettings.activeLines, maxBet]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlaySettings.isActive && autoPlaySettings.spinsRemaining > 0 && !isSpinning) {
      const delay = gameSettings.turboMode ? 500 : 2000;
      const timer = setTimeout(() => {
        handleSpin();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoPlaySettings.isActive, autoPlaySettings.spinsRemaining, isSpinning, gameSettings.turboMode]);

  // Main spin handler
  const handleSpin = useCallback(async () => {
    if (isSpinning) return;

    const totalBet = getTotalBet();
    
    // Check if user can afford the bet
    if (!canAfford(totalBet)) {
      setError('Insufficient balance for this bet');
      if (autoPlaySettings.isActive) {
        setAutoPlaySettings(prev => ({ ...prev, isActive: false, spinsRemaining: 0 }));
      }
      return;
    }

    setIsSpinning(true);
    setError(null);

    try {
      // Place bet transaction
      const betTransaction = await placeBet(
        totalBet,
        gameId,
        gameName,
        {
          variant,
          paylines: betSettings.activeLines,
          betPerLine: betSettings.currentBet,
          coinValue: betSettings.coinValue,
          gameEngine: 'enhanced_slots_v2'
        }
      );

      // Generate game result
      const reels = gameEngine.generateReels();
      const gameResult = gameEngine.evaluateWin(reels, totalBet, getActivePaylines());

      // Simulate spinning delay
      const spinDelay = gameSettings.quickSpin ? 1000 : gameSettings.turboMode ? 1500 : 2500;
      
      setTimeout(async () => {
        try {
          // Process win if applicable
          if (gameResult.totalWin > 0) {
            await recordWin(
              gameResult.totalWin,
              gameId,
              gameName,
              {
                variant,
                paylines: betSettings.activeLines,
                betPerLine: betSettings.currentBet,
                multiplier: gameResult.multiplier,
                winningLines: gameResult.winningLines,
                jackpot: gameResult.isJackpot,
                bonusRound: false
              }
            );
          }

          // Record game spin
          recordGameSpin(gameId, totalBet, gameResult.totalWin);

          // Update session statistics
          const isBigWin = gameResult.totalWin >= totalBet * 10;
          const isWin = gameResult.totalWin > 0;
          
          setSessionStats(prev => ({
            spins: prev.spins + 1,
            totalWagered: prev.totalWagered + totalBet,
            totalWon: prev.totalWon + gameResult.totalWin,
            netProfit: (prev.totalWon + gameResult.totalWin) - (prev.totalWagered + totalBet),
            bigWins: prev.bigWins + (isBigWin ? 1 : 0),
            currentWinStreak: isWin ? prev.currentWinStreak + 1 : 0,
            longestWinStreak: isWin ? Math.max(prev.longestWinStreak, prev.currentWinStreak + 1) : prev.longestWinStreak
          }));

          // Set result for UI
          setLastResult(gameResult);

          // Handle auto-play continuation/stopping
          if (autoPlaySettings.isActive) {
            handleAutoPlayLogic(gameResult, totalBet);
          }

          // Call completion callback
          onGameComplete?.(gameResult);

          setIsSpinning(false);
        } catch (error) {
          console.error('Error processing win:', error);
          setError('Error processing game result');
          setIsSpinning(false);
        }
      }, spinDelay);

    } catch (error) {
      console.error('Error placing bet:', error);
      setError(error instanceof Error ? error.message : 'Error placing bet');
      setIsSpinning(false);
    }
  }, [
    isSpinning, 
    gameId, 
    gameName, 
    variant, 
    betSettings, 
    gameSettings, 
    autoPlaySettings,
    canAfford,
    placeBet,
    recordWin,
    recordGameSpin,
    gameEngine,
    onGameComplete
  ]);

  // Auto-play logic
  const handleAutoPlayLogic = (result: SlotResult, betAmount: number) => {
    const newSpinsRemaining = autoPlaySettings.spinsRemaining - 1;
    const newCurrentLoss = autoPlaySettings.currentLoss + (result.totalWin === 0 ? betAmount : -result.totalWin);
    
    let shouldStop = false;
    
    // Check all stop conditions
    if (newSpinsRemaining <= 0) shouldStop = true;
    if (autoPlaySettings.stopOnWin && result.totalWin > 0) shouldStop = true;
    if (autoPlaySettings.stopOnBigWin && result.totalWin >= betAmount * 10) shouldStop = true;
    if (autoPlaySettings.stopOnSingleWin && result.totalWin >= autoPlaySettings.stopOnSingleWin) shouldStop = true;
    if (autoPlaySettings.maxLossLimit && newCurrentLoss >= autoPlaySettings.maxLossLimit) shouldStop = true;
    if (!canAfford(getTotalBet())) shouldStop = true;

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

  // Utility functions
  const getTotalBet = () => betSettings.currentBet * betSettings.activeLines;
  const getActivePaylines = () => Array.from({ length: betSettings.activeLines }, (_, i) => i + 1);

  // Control handlers
  const handleBetChange = (newBet: number) => {
    if (isSpinning) return;
    setBetSettings(prev => ({ ...prev, currentBet: newBet }));
  };

  const handleLinesChange = (newLines: number) => {
    if (isSpinning) return;
    setBetSettings(prev => ({ ...prev, activeLines: newLines }));
  };

  const handleMaxBet = () => {
    if (isSpinning) return;
    const maxAffordableBet = Math.floor(userState.balance.real / betSettings.activeLines);
    const newBet = Math.min(betSettings.maxBet, maxAffordableBet);
    setBetSettings(prev => ({ ...prev, currentBet: newBet }));
  };

  const handleAutoPlayToggle = () => {
    if (autoPlaySettings.isActive) {
      setAutoPlaySettings(prev => ({ ...prev, isActive: false, spinsRemaining: 0 }));
    } else {
      if (!canAfford(getTotalBet())) {
        setError('Insufficient balance for auto-play');
        return;
      }
      setAutoPlaySettings(prev => ({
        ...prev,
        isActive: true,
        spinsRemaining: prev.maxSpins,
        currentLoss: 0
      }));
    }
  };

  // Clear error when user makes changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="enhanced-slot-machine">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="error-close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Game Header */}
      <div className="game-header">
        <div className="game-info">
          <h2>{gameName}</h2>
          <div className="game-details">
            <span className="variant">{variant}</span>
            <span className="rtp">RTP: {(rtp * 100).toFixed(1)}%</span>
            <span className="volatility">Volatility: {volatility.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="session-stats">
          <div className="stat">
            <span className="label">Spins:</span>
            <span className="value">{sessionStats.spins}</span>
          </div>
          <div className="stat">
            <span className="label">Net:</span>
            <span className={`value ${sessionStats.netProfit >= 0 ? 'positive' : 'negative'}`}>
              ${sessionStats.netProfit.toFixed(2)}
            </span>
          </div>
          <div className="stat">
            <span className="label">Streak:</span>
            <span className="value">{sessionStats.currentWinStreak}</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="game-content">
        <div className="slot-machine-container">
          <SlotMachine
            onSpin={() => {}} // We handle spins through the enhanced component
            onBalanceChange={() => {}} // Balance is managed by context
            initialBalance={userState.balance.real}
            minBet={betSettings.minBet}
            maxBet={betSettings.maxBet}
          />
          
          {/* Win Display Overlay */}
          {lastResult && lastResult.totalWin > 0 && !isSpinning && (
            <div className="win-overlay">
              <div className="win-amount">
                <span className="win-label">🎉 WIN!</span>
                <span className="win-value">${lastResult.totalWin.toLocaleString()}</span>
                {lastResult.multiplier > 1 && (
                  <span className="multiplier">x{lastResult.multiplier}</span>
                )}
                {lastResult.isJackpot && (
                  <span className="jackpot-badge">🎰 JACKPOT!</span>
                )}
              </div>
              {lastResult.winningLines.length > 0 && (
                <div className="winning-lines">
                  Lines: {lastResult.winningLines.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="controls-panel">
          <SlotMachineControls
            balance={userState.balance.real}
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
            winAmount={lastResult?.totalWin || 0}
            lastWinAmount={lastResult?.totalWin || 0}
            disabled={!userState.isLoggedIn}
          />
        </div>
      </div>

      {/* Game Statistics */}
      <div className="enhanced-game-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🎲</span>
            <div className="stat-info">
              <span className="stat-label">Total Spins</span>
              <span className="stat-value">{sessionStats.spins}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-label">Total Wagered</span>
              <span className="stat-value">${sessionStats.totalWagered.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-info">
              <span className="stat-label">Total Won</span>
              <span className="stat-value">${sessionStats.totalWon.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-label">Big Wins</span>
              <span className="stat-value">{sessionStats.bigWins}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">{sessionStats.longestWinStreak}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">💎</span>
            <div className="stat-info">
              <span className="stat-label">Hit Rate</span>
              <span className="stat-value">
                {sessionStats.spins > 0 ? ((sessionStats.totalWon / sessionStats.totalWagered) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User not logged in overlay */}
      {!userState.isLoggedIn && (
        <div className="login-overlay">
          <div className="login-prompt">
            <h3>Please Log In</h3>
            <p>You need to be logged in to play the slots</p>
            <button className="login-button">Log In</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSlotMachine;
