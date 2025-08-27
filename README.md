# 🎰 CoinKrazy Casino - React Frontend

A modern, responsive casino application built with React, TypeScript, and connected to a Neon PostgreSQL database.

## 🚀 Features

- **Modern React App** with TypeScript and functional components
- **Casino Games Library** - Slots, Table Games, Live Casino, Instant Win
- **User Dashboard** - Balance tracking, VIP status, experience points
- **Dual Currency System** - Gold Coins (free play) & Sweeps Coins (prize eligible)
- **Game Providers Integration** - PragmaticPlay, NetEnt, Microgaming, Evolution Gaming
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Features** - Live balance updates, game sessions
- **Search & Filtering** - Find games by provider, category, or name
- **Progressive Web App** ready

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, CSS3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Database**: Neon PostgreSQL (connected via API)
- **Build Tool**: Create React App
- **Styling**: Custom CSS with CSS Grid and Flexbox

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coinkrazy/casino-frontend.git
   cd casino-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoints and configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run serve` - Build and serve production build locally

## 🎮 Database Integration

The app connects to your existing Neon PostgreSQL database with the following tables:

- **users** - User profiles, balances, VIP status
- **games** - Game catalog with metadata
- **transactions** - Deposits, withdrawals, bets, wins
- **game_sessions** - Active game sessions and history
- **game_providers** - Provider information
- **game_categories** - Game categorization

### Sample Database Schema

```sql
-- Users table
users (
  id, username, email, password_hash,
  gold_coins, sweeps_coins, vip_tier, level,
  experience_points, kyc_status, created_at
)

-- Games table  
games (
  id, name, slug, provider_id, category_id,
  game_type, min_bet, max_bet, rtp, volatility,
  has_jackpot, jackpot_amount, is_featured
)

-- Transactions table
transactions (
  id, user_id, type, amount, currency,
  status, created_at, updated_at
)
```

## 🌐 API Endpoints

The frontend expects these API endpoints from your Laravel backend:

```
GET  /api/games              - Get games list
GET  /api/games/featured     - Get featured games
GET  /api/user/profile       - Get user profile
GET  /api/user/balance       - Get user balance
POST /api/transactions/deposit - Create deposit
POST /api/game-sessions/start - Start game session
```

## 🎨 Customization

### Styling
- Main styles: `src/components/CasinoHomepage.css`
- Global styles: `src/App.css` and `src/index.css`
- Utility classes: Available in `src/App.css`

### Configuration
- API URLs: Set in `.env` file
- Feature flags: Configure in environment variables
- Game categories: Modify in `CasinoHomepage.tsx`

### Adding New Games
Games are loaded from your database. To add new games:

1. Insert into the `games` table in your database
2. Ensure proper `provider_id` and `category_id` relations
3. Set `is_active = true` to display the game

## 📱 Mobile Responsiveness

The app is fully responsive with breakpoints:
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px  
- **Mobile**: 320px - 767px

## 🔐 Authentication

User authentication is handled via JWT tokens:
- Login/Register through API
- Token stored in localStorage
- Automatic token refresh
- Logout clears all local data

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy Options
- **Netlify**: Connect GitHub repo for auto-deploy
- **Vercel**: Deploy with `vercel` command
- **AWS S3**: Upload build folder to S3 bucket
- **Static Hosting**: Any static file hosting service

### Environment Variables for Production
```
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## 🎯 Next Steps

1. **Connect to your Laravel API** - Update API endpoints in `.env`
2. **Test with real data** - Ensure database connection works
3. **Customize branding** - Update colors, logos, copy
4. **Add payment integration** - Implement deposit/withdrawal flows
5. **Set up analytics** - Add Google Analytics or similar
6. **Deploy to production** - Choose hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open GitHub issue for bugs or features
- **Email**: support@coinkrazycasino.com

## 🎮 Game Integration

Ready to integrate with major casino game providers:
- **PragmaticPlay** - Slot games and live casino
- **NetEnt** - Premium slot games  
- **Microgaming** - Classic and modern slots
- **Evolution Gaming** - Live dealer games

---

**🎰 Ready to launch your casino empire!** 

Your React frontend is now connected to your Neon PostgreSQL database and ready for players to enjoy an amazing casino experience.
