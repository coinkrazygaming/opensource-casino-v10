import React, { useEffect, useState, useRef } from 'react';
import SlotSymbol from './SlotSymbol';
import { SlotSymbol as ISlotSymbol } from './SlotMachine';

interface SlotReelProps {
  symbols: ISlotSymbol[];
  isSpinning: boolean;
  winningPositions: number[];
  spinDelay?: number;
}

const SlotReel: React.FC<SlotReelProps> = ({
  symbols,
  isSpinning,
  winningPositions,
  spinDelay = 0
}) => {
  const [displaySymbols, setDisplaySymbols] = useState<ISlotSymbol[]>(symbols);
  const [isAnimating, setIsAnimating] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Extended symbol list for smooth spinning animation
  const extendedSymbols = [
    ...symbols,
    ...symbols,
    ...symbols,
    ...symbols,
    ...symbols
  ];

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      // Start spinning animation with delay
      const startAnimation = () => {
        setIsAnimating(true);
        
        // Generate random symbols for spinning effect
        const spinSymbols = () => {
          const randomSymbols = Array(3).fill(null).map(() => ({
            id: Math.random().toString(),
            name: 'Spinning',
            value: 0,
            rarity: 1,
            emoji: ['🍒', '🍋', '🍊', '🍇', '🔔', '📊', '7️⃣', '💎', '👑', '🎰'][Math.floor(Math.random() * 10)],
            color: '#ffffff'
          }));
          setDisplaySymbols(randomSymbols);
        };

        // Spin animation
        let spinCount = 0;
        const maxSpins = 20;
        const spinInterval = setInterval(() => {
          spinSymbols();
          spinCount++;
          
          if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            // Settle on final symbols
            setTimeout(() => {
              setDisplaySymbols(symbols);
              setIsAnimating(false);
            }, 100);
          }
        }, 100);
      };

      if (spinDelay > 0) {
        setTimeout(startAnimation, spinDelay);
      } else {
        startAnimation();
      }
    }
  }, [isSpinning, symbols, spinDelay, isAnimating]);

  // Reset animation state when not spinning
  useEffect(() => {
    if (!isSpinning) {
      setIsAnimating(false);
      setDisplaySymbols(symbols);
    }
  }, [isSpinning, symbols]);

  // Scroll animation effect
  useEffect(() => {
    if (isAnimating && reelRef.current) {
      const reel = reelRef.current;
      let scrollPosition = 0;
      const scrollSpeed = 10;
      
      const animate = () => {
        scrollPosition += scrollSpeed;
        if (scrollPosition >= reel.scrollHeight / 2) {
          scrollPosition = 0;
        }
        reel.scrollTop = scrollPosition;
        
        if (isAnimating) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  return (
    <div className={`slot-reel ${isAnimating ? 'spinning' : ''}`}>
      <div 
        ref={reelRef}
        className="reel-container"
      >
        {/* Extended symbols for scrolling effect during animation */}
        {isAnimating ? (
          <div className="symbol-scroll">
            {extendedSymbols.map((symbol, index) => (
              <div key={`${symbol.id}-${index}`} className="symbol-slot">
                <SlotSymbol
                  symbol={{
                    ...symbol,
                    emoji: ['🍒', '🍋', '🍊', '🍇', '🔔', '📊', '7️⃣', '💎', '👑', '🎰'][index % 10]
                  }}
                  isWinning={false}
                  isSpinning={true}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Final settled symbols */
          <div className="symbol-grid">
            {displaySymbols.map((symbol, index) => (
              <div key={`${symbol.id}-${index}`} className="symbol-slot">
                <SlotSymbol
                  symbol={symbol}
                  isWinning={winningPositions.includes(index)}
                  isSpinning={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reel border and effects */}
      <div className="reel-border"></div>
      
      {/* Winning effect overlay */}
      {winningPositions.length > 0 && !isAnimating && (
        <div className="winning-overlay">
          {winningPositions.map(position => (
            <div
              key={position}
              className={`winning-glow position-${position}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SlotReel;
