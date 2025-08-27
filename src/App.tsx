import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CasinoHomepage from './components/CasinoHomepage';
import SlotsGamePage from './components/SlotsGamePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CasinoHomepage />} />
          <Route path="/casino" element={<CasinoHomepage />} />
          <Route path="/games" element={<CasinoHomepage />} />
          <Route path="/games/:category" element={<CasinoHomepage />} />
          <Route path="/slots" element={<SlotsGamePage />} />
          <Route path="/slots/:variant" element={<SlotsGamePage />} />
          <Route path="/play/slots" element={<SlotsGamePage />} />
          <Route path="/play/:gameSlug" element={<CasinoHomepage />} />
          <Route path="/profile" element={<CasinoHomepage />} />
          <Route path="/rewards" element={<CasinoHomepage />} />
          <Route path="/vip" element={<CasinoHomepage />} />
          <Route path="/support" element={<CasinoHomepage />} />
          {/* Redirect any unknown routes to homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
