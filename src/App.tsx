import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CasinoHomepage from './components/CasinoHomepage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CasinoHomepage />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
