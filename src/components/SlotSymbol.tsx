import React, { useEffect, useState } from 'react';
import { SlotSymbol as ISlotSymbol } from './SlotMachine';

interface SlotSymbolProps {
  symbol: ISlotSymbol;
  isWinning: boolean;
  isSpinning: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

const SlotSymbol: React.FC<SlotSymbolProps> = ({
  symbol,
  isWinning,
  isSpinning,
  size = 'medium',
  showValue = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('');

  // Winning animation effect
  useEffect(() => {
    if (isWinning && !isSpinning) {
      setAnimationClass('winning-pulse');
      
      // Create a pulsing effect
      const pulseInterval = setInterval(() => {
        setIsVisible(prev => !prev);
      }, 300);

      // Stop pulsing after 2 seconds
      const stopPulse = setTimeout(() => {
        clearInterval(pulseInterval);
        setIsVisible(true);
        setAnimationClass('winning-glow');
      }, 2000);

      return () => {
        clearInterval(pulseInterval);
        clearTimeout(stopPulse);
        setAnimationClass('');
      };
    }
  }, [isWinning, isSpinning]);

  // Spinning animation effect
  useEffect(() => {
    if (isSpinning) {
      setAnimationClass('spinning-symbol');
    } else {
      setAnimationClass('');
    }
  }, [isSpinning]);

  // Get symbol rarity class for styling
  const getRarityClass = () => {
    if (symbol.rarity <= 0.01) return 'legendary';
    if (symbol.rarity <= 0.03) return 'epic';
    if (symbol.rarity <= 0.1) return 'rare';
    if (symbol.rarity <= 0.2) return 'uncommon';
    return 'common';
  };

  // Get symbol glow effect based on value
  const getGlowIntensity = () => {
    if (symbol.value >= 50) return 'glow-intense';
    if (symbol.value >= 25) return 'glow-high';
    if (symbol.value >= 10) return 'glow-medium';
    if (symbol.value >= 5) return 'glow-low';
    return '';
  };

  return (
    <div 
      className={`
        slot-symbol 
        size-${size} 
        rarity-${getRarityClass()} 
        ${animationClass}
        ${isWinning ? 'winning' : ''}
        ${isSpinning ? 'spinning' : ''}
        ${getGlowIntensity()}
      `}
      style={{
        '--symbol-color': symbol.color,
        '--symbol-glow': `${symbol.color}40`,
        opacity: isVisible ? 1 : 0.3
      } as React.CSSProperties}
    >
      {/* Symbol background with rarity effect */}
      <div className="symbol-background">
        <div className="symbol-border"></div>
        {symbol.rarity <= 0.05 && (
          <div className="rarity-sparkles">
            <span className="sparkle">✨</span>
            <span className="sparkle">⭐</span>
            <span className="sparkle">✨</span>
          </div>
        )}
      </div>

      {/* Main symbol display */}
      <div className="symbol-content">
        <div className="symbol-emoji">
          {symbol.emoji}
        </div>
        
        {showValue && (
          <div className="symbol-value">
            x{symbol.value}
          </div>
        )}
        
        {symbol.id === 'jackpot' && (
          <div className="jackpot-indicator">
            JACKPOT!
          </div>
        )}
      </div>

      {/* Winning effects */}
      {isWinning && !isSpinning && (
        <>
          <div className="winning-particles">
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className={`particle particle-${index}`}
                style={{
                  '--delay': `${index * 0.1}s`
                } as React.CSSProperties}
              >
                ⭐
              </div>
            ))}
          </div>
          
          <div className="winning-rays">
            {Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={index} 
                className={`ray ray-${index}`}
                style={{
                  '--rotation': `${index * 45}deg`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </>
      )}

      {/* Special symbol effects */}
      {symbol.id === 'diamond' && (
        <div className="diamond-shine">
          <div className="shine-line"></div>
        </div>
      )}

      {symbol.id === 'crown' && (
        <div className="crown-glow">
          <div className="glow-pulse"></div>
        </div>
      )}

      {symbol.id === 'seven' && (
        <div className="lucky-aura">
          <div className="aura-ring"></div>
        </div>
      )}

      {/* Symbol name tooltip */}
      <div className="symbol-tooltip">
        <div className="tooltip-content">
          <div className="tooltip-name">{symbol.name}</div>
          <div className="tooltip-value">Value: x{symbol.value}</div>
          <div className="tooltip-rarity">
            Rarity: {(symbol.rarity * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotSymbol;
