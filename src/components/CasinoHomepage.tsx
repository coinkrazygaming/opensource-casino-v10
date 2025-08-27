import React, { useState, useEffect } from 'react';
import './CasinoHomepage.css';

interface Game {
  id: number;
  name: string;
  slug: string;
  provider: string;
  category: string;
  gameType: 'slot' | 'table' | 'live' | 'instant';
  thumbnailUrl?: string;
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  hasJackpot: boolean;
  jackpotAmount?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
}

interface User {
  id: number;
  username: string;
  goldCoins: number;
  sweepsCoins: number;
  level: number;
  experiencePoints: number;
  vipTier: string;
  isAuthenticated: boolean;
}

export default function CasinoHomepage() {
  const [games, setGames] = useState<Game[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample casino data (in real app, this would come from your Neon database)
  const sampleGames: Game[] = [
    {
      id: 1,
      name: "Gold Rush Deluxe",
      slug: "gold-rush-deluxe",
      provider: "PragmaticPlay",
      category: "Slots",
      gameType: "slot",
      thumbnailUrl: "/api/placeholder/300/200",
      minBet: 0.01,
      maxBet: 100,
      rtp: 96.5,
      volatility: "high",
      hasJackpot: true,
      jackpotAmount: 50000,
      isActive: true,
      isFeatured: true,
      isNew: false,
      isPopular: true
    },
    {
      id: 2,
      name: "Diamond Dazzle",
      slug: "diamond-dazzle",
      provider: "NetEnt",
      category: "Slots",
      gameType: "slot",
      thumbnailUrl: "/api/placeholder/300/200",
      minBet: 0.10,
      maxBet: 200,
      rtp: 97.2,
      volatility: "medium",
      hasJackpot: false,
      isActive: true,
      isFeatured: false,
      isNew: true,
      isPopular: false
    },
    {
      id: 3,
      name: "Blackjack Pro",
      slug: "blackjack-pro",
      provider: "Evolution Gaming",
      category: "Table Games",
      gameType: "table",
      thumbnailUrl: "/api/placeholder/300/200",
      minBet: 1,
      maxBet: 1000,
      rtp: 99.5,
      volatility: "low",
      hasJackpot: false,
      isActive: true,
      isFeatured: true,
      isNew: false,
      isPopular: true
    },
    {
      id: 4,
      name: "European Roulette",
      slug: "european-roulette",
      provider: "Evolution Gaming",
      category: "Table Games",
      gameType: "table",
      thumbnailUrl: "/api/placeholder/300/200",
      minBet: 0.50,
      maxBet: 500,
      rtp: 97.3,
      volatility: "medium",
      hasJackpot: false,
      isActive: true,
      isFeatured: false,
      isNew: false,
      isPopular: true
    },
    {
      id: 5,
      name: "Lucky Seven 777",
      slug: "lucky-seven-777",
      provider: "Microgaming",
      category: "Slots",
      gameType: "slot",
      thumbnailUrl: "/api/placeholder/300/200",
      minBet: 0.25,
      maxBet: 75,
      rtp: 95.8,
      volatility: "high",
      hasJackpot: true,
      jackpotAmount: 25000,
      isActive: true,
      isFeatured: false,
      isNew: false,
      isPopular: false
    }
  ];

  const sampleUser: User = {
    id: 1,
    username: "CoinKrazy",
    goldCoins: 15000,
    sweepsCoins: 75,
    level: 12,
    experiencePoints: 8450,
    vipTier: "Silver",
    isAuthenticated: true
  };

  useEffect(() => {
    // Simulate API call to load data
    const loadData = async () => {
      setLoading(true);
      // In real app, fetch from your Neon PostgreSQL database
      // const gamesResponse = await fetch('/api/games');
      // const userResponse = await fetch('/api/user');
      
      setTimeout(() => {
        setGames(sampleGames);
        setUser(sampleUser);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const categories = ['all', 'slots', 'table', 'live', 'instant'];

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || 
                           game.gameType === selectedCategory ||
                           (selectedCategory === 'slots' && game.gameType === 'slot') ||
                           (selectedCategory === 'table' && game.gameType === 'table');
    
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch && game.isActive;
  });

  const handlePlayGame = (game: Game) => {
    console.log(`Playing game: ${game.name}`);
    // In real app, launch game or navigate to game page
    alert(`Launching ${game.name}! (Demo mode)`);
  };

  const handleDeposit = () => {
    console.log('Opening deposit modal');
    alert('Deposit functionality would open here');
  };

  if (loading) {
    return (
      <div className="casino-loading">
        <div className="loading-spinner"></div>
        <p>Loading Casino...</p>
      </div>
    );
  }

  return (
    <div className="casino-homepage">
      {/* Header */}
      <header className="casino-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>🎰 CoinKrazy Casino</h1>
            </div>
            
            {user && (
              <div className="user-info">
                <div className="user-welcome">
                  <span>Welcome back, <strong>{user.username}</strong>!</span>
                  <div className="vip-badge">{user.vipTier} VIP</div>
                </div>
                
                <div className="user-balance">
                  <div className="balance-item gold">
                    <span className="currency-icon">🪙</span>
                    <div>
                      <div className="amount">{user.goldCoins.toLocaleString()}</div>
                      <div className="label">Gold Coins</div>
                    </div>
                  </div>
                  
                  <div className="balance-item sweeps">
                    <span className="currency-icon">💎</span>
                    <div>
                      <div className="amount">{user.sweepsCoins}</div>
                      <div className="label">Sweeps Coins</div>
                    </div>
                  </div>
                  
                  <button className="deposit-btn" onClick={handleDeposit}>
                    + Add Coins
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Stats */}
      {user && (
        <section className="user-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <div className="stat-value">Level {user.level}</div>
                  <div className="stat-label">Player Level</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <div className="stat-value">{user.experiencePoints.toLocaleString()}</div>
                  <div className="stat-label">Experience Points</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-value">{games.filter(g => g.isPopular).length}</div>
                  <div className="stat-label">Popular Games</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Games */}
      <section className="featured-games">
        <div className="container">
          <h2>🔥 Featured Games</h2>
          <div className="featured-slider">
            {games.filter(game => game.isFeatured).map(game => (
              <div key={game.id} className="featured-game">
                <div className="game-image">
                  <img src={game.thumbnailUrl} alt={game.name} />
                  {game.hasJackpot && (
                    <div className="jackpot-badge">
                      💰 ${game.jackpotAmount?.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>{game.provider}</p>
                  <div className="game-stats">
                    <span>RTP: {game.rtp}%</span>
                    <span>{game.volatility} volatility</span>
                  </div>
                  <button 
                    className="play-btn featured"
                    onClick={() => handlePlayGame(game)}
                  >
                    🎮 Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Library */}
      <section className="game-library">
        <div className="container">
          <div className="library-header">
            <h2>🎮 Game Library</h2>
            
            <div className="library-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="category-filter">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="games-grid">
            {filteredGames.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-image">
                  <img src={game.thumbnailUrl} alt={game.name} />
                  
                  <div className="game-badges">
                    {game.isNew && <span className="badge new">NEW</span>}
                    {game.isPopular && <span className="badge popular">HOT</span>}
                    {game.hasJackpot && <span className="badge jackpot">JACKPOT</span>}
                  </div>
                  
                  <div className="game-overlay">
                    <button 
                      className="play-btn"
                      onClick={() => handlePlayGame(game)}
                    >
                      ▶ Play
                    </button>
                  </div>
                </div>
                
                <div className="game-details">
                  <h3 className="game-name">{game.name}</h3>
                  <p className="game-provider">{game.provider}</p>
                  
                  <div className="game-meta">
                    <span className="rtp">RTP: {game.rtp}%</span>
                    <span className="bet-range">
                      ${game.minBet} - ${game.maxBet}
                    </span>
                  </div>
                  
                  {game.hasJackpot && (
                    <div className="jackpot-amount">
                      💰 ${game.jackpotAmount?.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="no-games">
              <p>No games found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="casino-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🎰 CoinKrazy Casino</h4>
              <p>The ultimate social casino experience with exciting games and great rewards!</p>
            </div>
            
            <div className="footer-section">
              <h4>Game Providers</h4>
              <ul>
                <li>PragmaticPlay</li>
                <li>NetEnt</li>
                <li>Microgaming</li>
                <li>Evolution Gaming</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Responsible Gaming</li>
                <li>Terms & Conditions</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 CoinKrazy Casino. All rights reserved.</p>
            <p>Play responsibly. Must be 18+ to play.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
