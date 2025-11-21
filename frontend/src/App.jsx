import React, { useState, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import Leaderboard from './Leaderboard';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [finalScore, setFinalScore] = useState(0);

  return (
    <div className="app-container">
      <h1>🐔 Chicken Defender 🐔</h1>
      
      {gameState === 'start' && (
        <button className="btn" onClick={() => setGameState('playing')}>Start Game</button>
      )}

      {gameState === 'playing' && (
        <GameCanvas 
          onGameOver={(score) => {
            setFinalScore(score);
            setGameState('gameover');
          }} 
        />
      )}

      {gameState === 'gameover' && (
        <Leaderboard score={finalScore} onRestart={() => setGameState('playing')} />
      )}
    </div>
  );
}

export default App;