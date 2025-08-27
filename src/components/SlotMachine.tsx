import React, { useState, useEffect, useRef, useCallback } from 'react';
import SlotReel from './SlotReel';
import './SlotMachine.css';

export interface SlotSymbol {
  id: string;
  name: string;
  value: number;
  rarity: number;
  emoji: string;
  color: string;
}

export interface PayLine {
  id: number;
  positions: number[][];
  name: string;
}

export interface SlotResult {
  reels: SlotSymbol[][];
  winningLines: number[];
  totalWin: number;
  multiplier: number;
  isJackpot: boolean;
}

export interface SlotMachineProps {
  onSpin?: (result: SlotResult) => void;
  onBalanceChange?: (newBalance: number) => void;
  initialBalance?: number;
  minBet?: number;
  maxBet?: number;
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', name: 'Cherry', value: 2, rarity: 0.3, emoji: '🍒', color: '#ff4757' },
  { id: 'lemon', name: 'Lemon', value: 3, rarity: 0.25, emoji: '🍋', color: '#ffa502' },
  { id: 'orange', name: 'Orange', value: 4, rarity: 0.2, emoji: '🍊', color: '#ff6348' },
  { id: 'plum', name: 'Plum', value: 5, rarity: 0.15, emoji: '🍇', color: '#a55eea' },
  { id: 'bell', name: 'Bell', value: 8, rarity: 0.1, emoji: '🔔', color: '#ffd700' },
  { id: 'bar', name: 'Bar', value: 10, rarity: 0.08, emoji: '📊', color: '#2f3542' },
  { id: 'seven', name: 'Lucky 7', value: 15, rarity: 0.05, emoji: '7️⃣', color: '#ff3838' },
  { id: 'diamond', name: 'Diamond', value: 25, rarity: 0.03, emoji: '💎', color: '#74b9ff' },
  { id: 'crown', name: 'Crown', value: 50, rarity: 0.02, emoji: '👑', color: '#fdcb6e' },
  { id: 'jackpot', name: 'Jackpot', value: 100, rarity: 0.01, emoji: '🎰', color: '#00b894' }
];

const PAYLINES: PayLine[] = [
  { id: 1, positions: [[1, 0], [1, 1], [1, 2]], name: 'Middle Row' },
  { id: 2, positions: [[0, 0], [0, 1], [0, 2]], name: 'Top Row' },
  { id: 3, positions: [[2, 0], [2, 1], [2, 2]], name: 'Bottom Row' },
  { id: 4, positions: [[0, 0], [1, 1], [2, 2]], name: 'Diagonal Down' },
  { id: 5, positions: [[2, 0], [1, 1], [0, 2]], name: 'Diagonal Up' },
  { id: 6, positions: [[0, 0], [1, 0], [2, 0]], name: 'First Column' },
  { id: 7, positions: [[0, 1], [1, 1], [2, 1]], name: 'Second Column' },
  { id: 8, positions: [[0, 2], [1, 2], [2, 2]], name: 'Third Column' },
  { id: 9, positions: [[1, 0], [0, 1], [1, 2]], name: 'V Shape' },
  { id: 10, positions: [[1, 0], [2, 1], [1, 2]], name: 'Inverted V' }
];

const SlotMachine: React.FC<SlotMachineProps> = ({
  onSpin,
  onBalanceChange,
  initialBalance = 1000,
  minBet = 1,
  maxBet = 100
}) => {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<SlotSymbol[][]>([[], [], []]);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [spinsCount, setSpinsCount] = useState(0);
  const [jackpot, setJackpot] = useState(50000);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayCount, setAutoPlayCount] = useState(0);
  const [maxAutoPlays, setMaxAutoPlays] = useState(10);
  
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const spinSoundRef = useRef<HTMLAudioElement>();
  const winSoundRef = useRef<HTMLAudioElement>();

  // Generate weighted random symbol
  const getRandomSymbol = useCallback((): SlotSymbol => {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const symbol of SYMBOLS) {
      cumulativeWeight += symbol.rarity;
      if (random <= cumulativeWeight) {
        return symbol;
      }
    }
    return SYMBOLS[0]; // Fallback
  }, []);

  // Initialize reels
  useEffect(() => {
    const initialReels = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => getRandomSymbol())
    );
    setReels(initialReels);
  }, [getRandomSymbol]);

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlay && autoPlayCount < maxAutoPlays && balance >= bet) {
      autoPlayRef.current = setTimeout(() => {
        spin();
      }, 2000);
    } else if (isAutoPlay && (autoPlayCount >= maxAutoPlays || balance < bet)) {
      setIsAutoPlay(false);
      setAutoPlayCount(0);
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, autoPlayCount, maxAutoPlays, balance, bet]);

  // Check for winning combinations
  const checkWins = useCallback((gameReels: SlotSymbol[][]): { winningLines: number[], totalWin: number, multiplier: number } => {
    const winningLines: number[] = [];
    let totalWin = 0;
    let multiplier = 1;

    PAYLINES.forEach(payline => {
      const symbols = payline.positions.map(([row, col]) => gameReels[row][col]);
      
      // Check for matching symbols
      const firstSymbol = symbols[0];
      const isWinningLine = symbols.every(symbol => symbol.id === firstSymbol.id);
      
      if (isWinningLine) {
        winningLines.push(payline.id);
        let lineWin = firstSymbol.value * bet;
        
        // Bonus multipliers
        if (firstSymbol.id === 'jackpot') {
          lineWin = jackpot;
          multiplier = Math.max(multiplier, 10);
        } else if (firstSymbol.id === 'crown') {
          multiplier = Math.max(multiplier, 5);
        } else if (firstSymbol.id === 'diamond') {
          multiplier = Math.max(multiplier, 3);
        } else if (firstSymbol.id === 'seven') {
          multiplier = Math.max(multiplier, 2);
        }
        
        totalWin += lineWin;
      }
    });

    return { winningLines, totalWin: totalWin * multiplier, multiplier };
  }, [bet, jackpot]);

  // Spin function
  const spin = useCallback(async () => {
    if (isSpinning || balance < bet) return;

    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    // Deduct bet from balance
    const newBalance = balance - bet;
    setBalance(newBalance);
    onBalanceChange?.(newBalance);

    // Play spin sound
    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(() => {});
    }

    // Generate new reels
    const newReels = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => getRandomSymbol())
    );

    // Simulate spinning delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setReels(newReels);

    // Check for wins
    const { winningLines, totalWin, multiplier } = checkWins(newReels);
    
    if (totalWin > 0) {
      setWinningLines(winningLines);
      setLastWin(totalWin);
      setTotalWins(prev => prev + totalWin);
      setBalance(prev => {
        const updatedBalance = prev + totalWin;
        onBalanceChange?.(updatedBalance);
        return updatedBalance;
      });

      // Play win sound
      if (winSoundRef.current) {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.play().catch(() => {});
      }
    }

    // Update jackpot
    setJackpot(prev => prev + bet * 0.01);
    setSpinsCount(prev => prev + 1);

    if (isAutoPlay) {
      setAutoPlayCount(prev => prev + 1);
    }

    // Call onSpin callback
    const result: SlotResult = {
      reels: newReels,
      winningLines,
      totalWin,
      multiplier,
      isJackpot: winningLines.length > 0 && newReels.some(reel => reel.some(symbol => symbol.id === 'jackpot'))
    };
    onSpin?.(result);

    setIsSpinning(false);
  }, [isSpinning, balance, bet, onBalanceChange, onSpin, checkWins, getRandomSymbol, isAutoPlay]);

  const handleBetChange = (newBet: number) => {
    if (!isSpinning && newBet >= minBet && newBet <= maxBet && newBet <= balance) {
      setBet(newBet);
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlay) {
      setIsAutoPlay(false);
      setAutoPlayCount(0);
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    } else {
      setIsAutoPlay(true);
      setAutoPlayCount(0);
    }
  };

  return (
    <div className="slot-machine">
      {/* Audio elements */}
      <audio ref={spinSoundRef} preload="auto">
        <source src="/sounds/spin.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={winSoundRef} preload="auto">
        <source src="/sounds/win.mp3" type="audio/mpeg" />
      </audio>

      {/* Machine Header */}
      <div className="slot-machine-header">
        <div className="jackpot-display">
          <span className="jackpot-label">🎰 JACKPOT</span>
          <span className="jackpot-amount">${jackpot.toLocaleString()}</span>
        </div>
        <div className="machine-title">
          <h2>🎰 Lucky Slots 777</h2>
        </div>
      </div>

      {/* Reels Container */}
      <div className="reels-container">
        <div className="paylines-overlay">
          {PAYLINES.slice(0, 5).map(payline => (
            <div
              key={payline.id}
              className={`payline payline-${payline.id} ${winningLines.includes(payline.id) ? 'winning' : ''}`}
            />
          ))}
        </div>
        
        <div className="reels">
          {reels.map((reel, index) => (
            <SlotReel
              key={index}
              symbols={reel}
              isSpinning={isSpinning}
              winningPositions={winningLines.flatMap(lineId => {
                const payline = PAYLINES.find(p => p.id === lineId);
                return payline ? payline.positions.filter(([, col]) => col === index).map(([row]) => row) : [];
              })}
              spinDelay={index * 200}
            />
          ))}
        </div>
      </div>

      {/* Win Display */}
      {lastWin > 0 && (
        <div className="win-display">
          <div className="win-amount">
            <span className="win-label">🎉 WIN!</span>
            <span className="win-value">${lastWin.toLocaleString()}</span>
          </div>
          {winningLines.length > 0 && (
            <div className="winning-lines">
              Lines: {winningLines.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="slot-controls">
        <div className="balance-display">
          <span className="balance-label">Balance:</span>
          <span className="balance-amount">${balance.toLocaleString()}</span>
        </div>

        <div className="bet-controls">
          <label htmlFor="bet-amount">Bet:</label>
          <button 
            onClick={() => handleBetChange(Math.max(minBet, bet - 1))}
            disabled={isSpinning || bet <= minBet}
            className="bet-button"
          >
            -
          </button>
          <input
            id="bet-amount"
            type="number"
            value={bet}
            onChange={(e) => handleBetChange(parseInt(e.target.value) || minBet)}
            min={minBet}
            max={Math.min(maxBet, balance)}
            disabled={isSpinning}
            className="bet-input"
          />
          <button 
            onClick={() => handleBetChange(Math.min(maxBet, Math.min(balance, bet + 1)))}
            disabled={isSpinning || bet >= maxBet || bet >= balance}
            className="bet-button"
          >
            +
          </button>
        </div>

        <div className="spin-controls">
          <button
            onClick={() => handleBetChange(maxBet)}
            disabled={isSpinning || balance < maxBet}
            className="max-bet-button"
          >
            MAX BET
          </button>
          
          <button
            onClick={spin}
            disabled={isSpinning || balance < bet}
            className={`spin-button ${isSpinning ? 'spinning' : ''}`}
          >
            {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN'}
          </button>

          <button
            onClick={toggleAutoPlay}
            disabled={balance < bet}
            className={`auto-play-button ${isAutoPlay ? 'active' : ''}`}
          >
            {isAutoPlay ? `AUTO (${autoPlayCount}/${maxAutoPlays})` : 'AUTO PLAY'}
          </button>
        </div>

        {isAutoPlay && (
          <div className="auto-play-settings">
            <label htmlFor="max-auto-plays">Max spins:</label>
            <input
              id="max-auto-plays"
              type="number"
              value={maxAutoPlays}
              onChange={(e) => setMaxAutoPlays(Math.max(1, parseInt(e.target.value) || 10))}
              min="1"
              max="1000"
              disabled={isAutoPlay}
              className="auto-play-input"
            />
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="slot-stats">
        <div className="stat">
          <span className="stat-label">Total Spins:</span>
          <span className="stat-value">{spinsCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Wins:</span>
          <span className="stat-value">${totalWins.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Win Rate:</span>
          <span className="stat-value">{spinsCount > 0 ? ((totalWins / (spinsCount * bet)) * 100).toFixed(1) : '0.0'}%</span>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
