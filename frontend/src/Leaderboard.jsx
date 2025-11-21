import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = ({ score, onRestart }) => {
  const [name, setName] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Fetch Leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/leaderboard');
      setLeaders(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      await axios.post('http://127.0.0.1:8000/submit-score', {
        player_name: name,
        points: score
      });
      setSubmitted(true);
      fetchLeaderboard(); // Refresh list
    } catch (err) {
      console.error("Error submitting score", err);
    }
  };

  return (
    <div className="leaderboard">
      <h2>Game Over!</h2>
      <h3>Your Score: {score}</h3>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
          />
          <button type="submit">Save Score</button>
        </form>
      ) : (
        <p>Score Saved!</p>
      )}

      <div className="list">
        <h3>Top 10 Hunters</h3>
        <ul>
          {leaders.map((l, i) => (
            <li key={i}>
              {i+1}. <strong>{l.player_name}</strong> - {l.points}
            </li>
          ))}
        </ul>
      </div>
      
      <button className="btn restart" onClick={onRestart}>Play Again</button>
    </div>
  );
};

export default Leaderboard;