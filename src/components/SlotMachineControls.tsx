import React, { useState, useEffect } from 'react';
import './SlotMachineControls.css';

export interface AutoPlaySettings {
  isActive: boolean;
  spinsRemaining: number;
  maxSpins: number;
  stopOnWin: boolean;
  stopOnBigWin: boolean;
  stopOnBonusWin: boolean;
  stopOnLoss: number;
  stopOnSingleWin: number;
  maxLossLimit: number;
  currentLoss: number;
}

export interface BetSettings {
  currentBet: number;
  minBet: number;
  maxBet: number;
  coinValue: number;
  coinsPerLine: number;
  activeLines: number;
  maxLines: number;
}

export interface GameSettings {
  turboMode: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  quickSpin: boolean;
  showWinLines: boolean;
  showCelebrations: boolean;
  skipWinAnimations: boolean;
}

interface SlotMachineControlsProps {
  balance: number;
  betSettings: BetSettings;
  autoPlaySettings: AutoPlaySettings;
  gameSettings: GameSettings;
  isSpinning: boolean;
  onBetChange: (newBet: number) => void;
  onLinesChange: (newLines: number) => void;
  onSpin: () => void;
  onAutoPlayToggle: () => void;
  onAutoPlaySettingsChange: (settings: Partial<AutoPlaySettings>) => void;
  onGameSettingsChange: (settings: Partial<GameSettings>) => void;
  onMaxBet: () => void;
  winAmount?: number;
  lastWinAmount?: number;
  disabled?: boolean;
}

const SlotMachineControls: React.FC<SlotMachineControlsProps> = ({
  balance,
  betSettings,
  autoPlaySettings,
  gameSettings,
  isSpinning,
  onBetChange,
  onLinesChange,
  onSpin,
  onAutoPlayToggle,
  onAutoPlaySettingsChange,
  onGameSettingsChange,
  onMaxBet,
  winAmount = 0,
  lastWinAmount = 0,
  disabled = false
}) => {
  const [showAutoPlayMenu, setShowAutoPlayMenu] = useState(false);
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [showBetMenu, setShowBetMenu] = useState(false);
  const [quickSpinActive, setQuickSpinActive] = useState(false);

  // Quick bet presets
  const quickBetOptions = [1, 5, 10, 25, 50, 100];
  
  // Calculate total bet (bet per line * active lines)
  const totalBet = betSettings.currentBet * betSettings.activeLines;
  
  // Check if spin is possible
  const canSpin = balance >= totalBet && !disabled && !isSpinning;
  
  // Auto-play countdown display
  const autoPlayDisplay = autoPlaySettings.isActive 
    ? `AUTO (${autoPlaySettings.spinsRemaining}/${autoPlaySettings.maxSpins})`
    : 'AUTO PLAY';

  // Handle bet increase/decrease
  const adjustBet = (direction: 'up' | 'down') => {
    const step = betSettings.coinValue;
    const newBet = direction === 'up' 
      ? Math.min(betSettings.maxBet, betSettings.currentBet + step)
      : Math.max(betSettings.minBet, betSettings.currentBet - step);
    
    if (newBet * betSettings.activeLines <= balance) {
      onBetChange(newBet);
    }
  };

  // Handle lines change
  const adjustLines = (direction: 'up' | 'down') => {
    const newLines = direction === 'up' 
      ? Math.min(betSettings.maxLines, betSettings.activeLines + 1)
      : Math.max(1, betSettings.activeLines - 1);
    
    if (betSettings.currentBet * newLines <= balance) {
      onLinesChange(newLines);
    }
  };

  // Handle quick spin
  const handleQuickSpin = () => {
    if (gameSettings.quickSpin) {
      setQuickSpinActive(true);
      onSpin();
      setTimeout(() => setQuickSpinActive(false), 1000);
    } else {
      onSpin();
    }
  };

  // Turbo mode effect
  useEffect(() => {
    if (gameSettings.turboMode && autoPlaySettings.isActive && !isSpinning) {
      const turboDelay = setTimeout(onSpin, 500); // Faster auto-play in turbo mode
      return () => clearTimeout(turboDelay);
    }
  }, [gameSettings.turboMode, autoPlaySettings.isActive, isSpinning, onSpin]);

  return (
    <div className="slot-machine-controls">
      {/* Balance Display */}
      <div className="balance-section">
        <div className="balance-display">
          <span className="balance-label">Balance:</span>
          <span className="balance-amount">${balance.toLocaleString()}</span>
        </div>
        
        {winAmount > 0 && (
          <div className="win-display">
            <span className="win-label">Win:</span>
            <span className="win-amount">${winAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Bet Controls Section */}
      <div className="bet-controls-section">
        <div className="bet-display">
          <div className="bet-per-line">
            <label>Bet per Line:</label>
            <div className="bet-adjuster">
              <button 
                onClick={() => adjustBet('down')}
                disabled={betSettings.currentBet <= betSettings.minBet || isSpinning}
                className="bet-button decrease"
              >
                -
              </button>
              <span className="bet-value">${betSettings.currentBet}</span>
              <button 
                onClick={() => adjustBet('up')}
                disabled={betSettings.currentBet >= betSettings.maxBet || isSpinning}
                className="bet-button increase"
              >
                +
              </button>
            </div>
          </div>

          <div className="lines-control">
            <label>Lines:</label>
            <div className="lines-adjuster">
              <button 
                onClick={() => adjustLines('down')}
                disabled={betSettings.activeLines <= 1 || isSpinning}
                className="lines-button decrease"
              >
                -
              </button>
              <span className="lines-value">{betSettings.activeLines}</span>
              <button 
                onClick={() => adjustLines('up')}
                disabled={betSettings.activeLines >= betSettings.maxLines || isSpinning}
                className="lines-button increase"
              >
                +
              </button>
            </div>
          </div>

          <div className="total-bet">
            <label>Total Bet:</label>
            <span className="total-bet-amount">${totalBet}</span>
          </div>
        </div>

        {/* Quick Bet Options */}
        <div className="quick-bet-section">
          <label>Quick Bet:</label>
          <div className="quick-bet-buttons">
            {quickBetOptions.map(bet => (
              <button
                key={bet}
                onClick={() => onBetChange(bet)}
                disabled={bet > betSettings.maxBet || bet * betSettings.activeLines > balance || isSpinning}
                className={`quick-bet-button ${betSettings.currentBet === bet ? 'active' : ''}`}
              >
                ${bet}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={onMaxBet}
          disabled={!canSpin || betSettings.currentBet === betSettings.maxBet}
          className="max-bet-button"
        >
          MAX BET
        </button>

        <button
          onClick={handleQuickSpin}
          disabled={!canSpin}
          className={`spin-button ${isSpinning ? 'spinning' : ''} ${quickSpinActive ? 'quick-spin' : ''} ${gameSettings.turboMode ? 'turbo' : ''}`}
        >
          {isSpinning ? (
            gameSettings.turboMode ? '⚡ SPINNING...' : '🎰 SPINNING...'
          ) : (
            gameSettings.turboMode ? '⚡ TURBO SPIN' : '🎰 SPIN'
          )}
        </button>

        <div className="auto-play-container">
          <button
            onClick={onAutoPlayToggle}
            disabled={!canSpin && !autoPlaySettings.isActive}
            className={`auto-play-button ${autoPlaySettings.isActive ? 'active' : ''}`}
          >
            {autoPlayDisplay}
          </button>
          
          <button
            onClick={() => setShowAutoPlayMenu(!showAutoPlayMenu)}
            className="auto-play-menu-button"
            disabled={isSpinning}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Game Settings Toggle */}
      <div className="settings-row">
        <div className="game-mode-toggles">
          <button
            onClick={() => onGameSettingsChange({ turboMode: !gameSettings.turboMode })}
            className={`mode-button ${gameSettings.turboMode ? 'active' : ''}`}
            title="Turbo Mode - Faster spins"
          >
            ⚡ TURBO
          </button>
          
          <button
            onClick={() => onGameSettingsChange({ quickSpin: !gameSettings.quickSpin })}
            className={`mode-button ${gameSettings.quickSpin ? 'active' : ''}`}
            title="Quick Spin - Skip spin animations"
          >
            🚀 QUICK
          </button>
          
          <button
            onClick={() => onGameSettingsChange({ soundEnabled: !gameSettings.soundEnabled })}
            className={`mode-button ${gameSettings.soundEnabled ? 'active' : ''}`}
            title="Toggle Sound"
          >
            {gameSettings.soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <button
          onClick={() => setShowGameSettings(!showGameSettings)}
          className="settings-button"
        >
          ⚙️ SETTINGS
        </button>
      </div>

      {/* Auto-Play Menu */}
      {showAutoPlayMenu && (
        <div className="auto-play-menu">
          <div className="menu-header">
            <h3>Auto Play Settings</h3>
            <button 
              onClick={() => setShowAutoPlayMenu(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>
          
          <div className="auto-play-options">
            <div className="option-group">
              <label>Number of Spins:</label>
              <select
                value={autoPlaySettings.maxSpins}
                onChange={(e) => onAutoPlaySettingsChange({ maxSpins: parseInt(e.target.value) })}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={autoPlaySettings.stopOnWin}
                  onChange={(e) => onAutoPlaySettingsChange({ stopOnWin: e.target.checked })}
                />
                Stop on any win
              </label>
            </div>

            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={autoPlaySettings.stopOnBigWin}
                  onChange={(e) => onAutoPlaySettingsChange({ stopOnBigWin: e.target.checked })}
                />
                Stop on big win (10x+ bet)
              </label>
            </div>

            <div className="option-group">
              <label>Stop if single win exceeds:</label>
              <input
                type="number"
                value={autoPlaySettings.stopOnSingleWin}
                onChange={(e) => onAutoPlaySettingsChange({ stopOnSingleWin: parseInt(e.target.value) || 0 })}
                min="0"
                step="10"
              />
            </div>

            <div className="option-group">
              <label>Stop if loss exceeds:</label>
              <input
                type="number"
                value={autoPlaySettings.maxLossLimit}
                onChange={(e) => onAutoPlaySettingsChange({ maxLossLimit: parseInt(e.target.value) || 0 })}
                min="0"
                step="10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Settings Menu */}
      {showGameSettings && (
        <div className="game-settings-menu">
          <div className="menu-header">
            <h3>Game Settings</h3>
            <button 
              onClick={() => setShowGameSettings(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>
          
          <div className="settings-options">
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={gameSettings.animationsEnabled}
                  onChange={(e) => onGameSettingsChange({ animationsEnabled: e.target.checked })}
                />
                Enable animations
              </label>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={gameSettings.showWinLines}
                  onChange={(e) => onGameSettingsChange({ showWinLines: e.target.checked })}
                />
                Show winning lines
              </label>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={gameSettings.showCelebrations}
                  onChange={(e) => onGameSettingsChange({ showCelebrations: e.target.checked })}
                />
                Show win celebrations
              </label>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={gameSettings.skipWinAnimations}
                  onChange={(e) => onGameSettingsChange({ skipWinAnimations: e.target.checked })}
                />
                Skip win animations
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Game Statistics */}
      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Last Win:</span>
          <span className="stat-value">${lastWinAmount.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lines Active:</span>
          <span className="stat-value">{betSettings.activeLines}/{betSettings.maxLines}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Coin Value:</span>
          <span className="stat-value">${betSettings.coinValue}</span>
        </div>
      </div>
    </div>
  );
};

export default SlotMachineControls;
