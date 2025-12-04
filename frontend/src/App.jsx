import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameCanvas from './GameCanvas';
import Leaderboard from './Leaderboard';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('start');
  const [finalStats, setFinalStats] = useState({ score: 0, level: 1, kills: 0 });
  
  // Live HUD State
  const [stats, setStats] = useState({ score: 0, hp: 100, level: 1, kills: 0 });
  const [powerMsg, setPowerMsg] = useState(null);
  
  // Lobby Leaderboard State
  const [lobbyLeaders, setLobbyLeaders] = useState([]);

  // Dynamic API URL
  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

  // Load Font & Fetch Lobby Scores on Mount
  useEffect(() => {
    // 1. Load Font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // 2. Fetch Leaderboard for Lobby
    fetchLobbyLeaderboard();
  }, []);

  const fetchLobbyLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/leaderboard`);
      setLobbyLeaders(res.data);
    } catch (err) {
      console.error("Lobby leaderboard fetch failed", err);
    }
  };

  const handleGameOver = (results) => {
    setFinalStats(results);
    setGameState('gameover');
  };

  const handleExit = () => {
    handleGameOver({ 
        score: stats.score, 
        level: stats.level, 
        kills: stats.kills 
    });
  };

  const handleRestart = () => {
    fetchLobbyLeaderboard(); // Refresh scores when going back to game/lobby
    setGameState('playing');
  };

  const triggerPowerUp = (msg) => {
    setPowerMsg(msg);
    setTimeout(() => setPowerMsg(null), 2000);
  };

  return (
    <div className="game-container">
      <div className="stars"></div>
      
      {/* --- LOBBY SCREEN --- */}
      {gameState === 'start' && (
        <div className="menu-screen">
          <div className="menu-content">
            <h1 className="glitch-text">GALACTIC CHICKEN</h1>
            <p className="subtitle">DEFEND THE SECTOR</p>
            
            <button className="btn-neon" onClick={() => setGameState('playing')}>
              INITIATE MISSION
            </button>

            {/* LOBBY LEADERBOARD */}
            <div className="lobby-leaderboard">
              <h3>🏆 TOP ACES 🏆</h3>
              {lobbyLeaders.length === 0 ? (
                <p className="loading-text">LOADING ARCHIVES...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>PILOT</th>
                      <th>SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lobbyLeaders.map((l, i) => (
                      <tr key={i}>
                        <td>#{i + 1}</td>
                        <td className="name-col">{l.player_name}</td>
                        <td className="score-col">{l.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PLAYING SCREEN --- */}
      {gameState === 'playing' && (
        <>
          {/* HUD centered at top */}
          <div className="hud-top">
            <div className="hud-group">
              <div className="hud-item">
                <span className="label">SCORE</span>
                <span className="value">{stats.score.toLocaleString()}</span>
              </div>
              <div className="hud-item">
                <span className="label">THREAT</span>
                <span className="value text-red">{stats.level}</span>
              </div>
              <div className="hud-item">
                <span className="label">KILLS</span>
                <span className="value text-yellow">{stats.kills}</span>
              </div>
            </div>
            <button className="btn-exit" onClick={handleExit}>ABORT</button>
          </div>

          {/* Health Bar centered at bottom */}
          <div className="hud-health">
             <div className="health-bar-frame">
                <div 
                  className="health-fill" 
                  style={{width: `${Math.max(0, stats.hp)}%`}}
                />
             </div>
             <span className="hp-text">{Math.max(0, stats.hp)}% SHIELD</span>
          </div>

          {powerMsg && <div className="powerup-popup">{powerMsg}</div>}
          
          <GameCanvas 
            onGameOver={handleGameOver}
            onStatsUpdate={setStats}
            showPowerUp={triggerPowerUp}
          />
        </>
      )}

      {/* --- GAME OVER SCREEN --- */}
      {gameState === 'gameover' && (
        <Leaderboard 
            stats={finalStats} 
            onRestart={handleRestart} 
        />
      )}
    </div>
  );
}

export default App;