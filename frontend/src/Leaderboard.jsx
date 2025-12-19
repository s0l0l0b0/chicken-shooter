import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = ({ stats, onRestart }) => {
  const [name, setName] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [status, setStatus] = useState('idle');
  
  const API_URL = `http://${window.location.hostname}:8000`;

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/leaderboard`);
      setLeaders(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setStatus('loading');
    try {
      await axios.post(`${API_URL}/submit-score`, {
        player_name: name,
        points: stats.score,
        level: stats.level,
        kills: stats.kills,
        achievements: stats.achievements || []
      });
      setStatus('success');
      fetchLeaderboard();
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="overlay">
      <div className="panel">
        <h2 className="title-red">MISSION FAILED</h2>
        
        <div className="stats-grid">
          <div className="stat-box">
            <label>SCORE</label>
            <div>{stats.score}</div>
          </div>
          <div className="stat-box">
            <label>LEVEL</label>
            <div>{stats.level}</div>
          </div>
          <div className="stat-box">
            <label>KILLS</label>
            <div>{stats.kills}</div>
          </div>
        </div>
        
        {stats.achievements && stats.achievements.length > 0 && (
          <div style={{
            background: 'rgba(0, 255, 136, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(0, 255, 136, 0.3)'
          }}>
            <div style={{ color: '#00ff88', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>
              🏆 ACHIEVEMENTS UNLOCKED ({stats.achievements.length})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.6' }}>
              {stats.achievements.slice(0, 5).map((achievement, i) => (
                <div key={i}>• {achievement.replace('_', ' ').toUpperCase()}</div>
              ))}
            </div>
          </div>
        )}

        {status !== 'success' ? (
          <div className="input-row">
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="PILOT NAME"
              maxLength={8}
            />
            <button onClick={handleSave} disabled={status === 'loading' || !name}>
              {status === 'loading' ? '...' : 'SAVE'}
            </button>
          </div>
        ) : <div className="success">DATA UPLOADED</div>}

        {status === 'error' && <p className="error">SERVER OFFLINE</p>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>PILOT</th>
                <th>LVL</th>
                <th>KILLS</th>
                <th>SCORE</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l, i) => (
                <tr key={i} className={l.player_name === name ? 'me' : ''}>
                  <td>{i+1}</td>
                  <td className="name-col">{l.player_name}</td>
                  <td>{l.level || 1}</td>
                  <td>{l.kills || 0}</td>
                  <td className="score-col">{l.points.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-restart" onClick={onRestart}>REDEPLOY</button>
      </div>
    </div>
  );
};

export default Leaderboard;