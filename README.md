# 🚀 GALACTIC CHICKEN

> **DEFEND THE SECTOR. CLIMB THE RANKS.**

![Lobby Screen](screenshots/lobby.png)

<div align="center">

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi) ![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python) ![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)

</div>

## 🛸 Mission Briefing
**Galactic Chicken** is a high-octane, neon-soaked arcade shooter. Pilot your starship through infinite waves of interstellar poultry, upgrade your weaponry, and immortalize your name on the global leaderboard.

---

## ⚔️ The Arsenal (Progression)
As you level up, your ship evolves automatically:

| Level | Upgrade | Description |
| :--- | :--- | :--- |
| **Lvl 1** | **Standard Blaster** | Single stream plasma fire. |
| **Lvl 2** | **Dual Blasters** | Double the firepower. |
| **Lvl 4** | **Triple Threat** | Wide-spread crowd control. |
| **Lvl 6** | **Homing Missiles** | Auto-locks onto nearest enemy. Heavy damage. |
| **Lvl 8** | **Wingman Drones** | Two autonomous UFOs provide support fire. |
| **Lvl 12** | **Hyper Laser** | Random chance to fire a screen-clearing beam. |

---

## 🎯 Enemy Roster
Face diverse alien threats with unique behaviors:

| Enemy Type | Emoji | Behavior | Strength |
| :--- | :---: | :--- | :--- |
| **Normal Chicken** | 🐔 | Standard wiggle pattern | Balanced |
| **Fast Chicken** | 🐤 | High-speed straight attacks | Low HP, Quick |
| **Tank Chicken** | 🦃 | Zigzag movement, heavy armor | High HP, Slow |
| **Shooter Chicken** | 🦅 | Circular pattern, rapid fire | Medium, Aggressive |
| **Boss** | 👾 | Orbital movement, massive HP bar | Every 5 levels |

---

## ⚡ Power-Up System
Collect glowing power-ups (10% drop chance) for temporary advantages:

| Power-Up | Effect | Duration | Visual |
| :--- | :--- | :---: | :--- |
| **💊 Health** | Restore +30 HP | Instant | Magenta glow |
| **🛡️ Shield** | Invulnerability | 5 sec | Cyan bubble |
| **⚡ Rapid Fire** | 2x fire rate | 6 sec | Yellow pulse |
| **💎 Score Multiplier** | 2x points | 8 sec | Pink sparkles |

*Power-ups feature pulsing animations, dynamic glows, and sparkle particles for easy visibility!*

---

## 📸 Flight Recorder

### ⚔️ Intense Bullet-Hell Action
Fluid mouse-based movement, dynamic hitboxes, and particle explosions.
![Gameplay Action](screenshots/gameplay.png)

### 🏆 Global Leaderboard System
Compete for the top spot. Scores, kills, and levels are persisted permanently via a REST API.
![Mission Report](screenshots/gameover.png)

---

## ⚡ System Features

### 🎮 Core Gameplay
*   **🕹️ Arcade Physics:** Smooth "follow-cursor" movement with inertia.
*   **🔥 Dynamic Difficulty:** Progressive enemy spawn rates and bullet patterns.
*   **💪 Weapon Progression:** 6-tier upgrade system from single blaster to hyper laser.
*   **🎯 Enemy Variety:** 5 distinct enemy types with unique movement patterns.
*   **☄️ Environmental Hazards:** Asteroids spawn after level 3 for added chaos.
*   **📱 Responsive:** Automatically adjusts canvas size to fit any viewport.

### ⚡ Power-Up System
*   **4 Collectible Power-Ups:** Health, Shield, Rapid Fire, Score Multiplier
*   **Visual Feedback:** Pulsing animations, color-coded glows, sparkle particles
*   **Strategic Depth:** Risk/reward collection during intense combat

### 🔥 Combo & Scoring
*   **Kill Streak System:** Build combos for bonus points
*   **Combo Milestones:** 5X, 10X MEGA, 20X UNSTOPPABLE notifications
*   **Score Multipliers:** Stack with power-ups for massive point gains
*   **Combo Reset:** Taking damage resets your streak

### 🏆 Achievement System
*   **9 Unlockable Achievements:** Score, kills, combos, and special challenges
*   **Achievement Examples:**
    *   🏆 First 10K - Score 10,000 points
    *   ⚡ Combo King - Achieve 15x combo
    *   👾 Boss Hunter - Defeat 5 bosses
    *   🛡️ Untouchable - Score 5000+ with no damage
*   **Persistent Tracking:** Achievements saved to database

### ✨ Visual Enhancements
*   **Distinct Projectiles:** Cyan player bullets vs red-orange enemy fireballs
*   **Particle Effects:** Explosions, smoke trails, sparkles
*   **Neon Aesthetics:** Custom CSS glassmorphism, glowing HUDs, "Orbitron" typography
*   **HP Bars:** Boss and tank enemies display health status
*   **Shield Effects:** Visual bubble animation during invulnerability

### 💾 Backend Features
*   **Persistent Data:** SQLite database tracks scores, levels, kills, and achievements
*   **REST API:** FastAPI backend with CORS support
*   **Global Leaderboard:** Real-time ranking system

---

## 🛠️ Deployment Protocols

### Prerequisites
*   Node.js & npm
*   Python 3.8+
*   `uv` (Python package manager) - *Optional but recommended*

### 1. Backend Setup (Mission Control)
The backend handles the database and leaderboard API.

```bash
cd backend

# Install dependencies using uv
uv sync

# Run the server (accessible via local network)
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup (Cockpit)
The frontend is the game client built with React.

```bash
cd frontend

# Install packages
npm install

# Launch the game
npm run dev 

# Access the game via local network
npm run dev -- --host
```

Open your browser to the link provided by Vite (usually http://localhost:5173 or your Network IP).

---

## 🎮 Flight Manual

| Control | Action |
|---------|--------|
| Mouse | Pilot Ship (Follows cursor) |
| Left Click (Hold) | Fire Weapons |
| Button: Abort | Emergency Exit (Saves current score) |

### 💡 Pro Tips
*   **Maintain Combos:** Avoid damage to keep your kill streak multiplier
*   **Power-Up Priority:** Shield > Multiplier > Rapid Fire > Health
*   **Boss Strategy:** Learn orbital patterns and use homing missiles
*   **Asteroid Avoidance:** They take 3 hits to destroy - sometimes better to dodge
*   **Achievement Hunting:** "Untouchable" requires flawless early-game execution

---

## 📂 Project Structure

```text
chicken-shooter/
├── backend/               # FastAPI Server
│   ├── main.py            # API Endpoints & Logic
│   ├── models.py          # SQLAlchemy Database Models
│   ├── database.py        # SQLite Connection Setup
│   ├── pyproject.toml     # Python Dependencies (uv)
│   └── leaderboard.db     # Database (Auto-generated)
│
└── frontend/              # React Client
    ├── src/
    │   ├── App.jsx        # Main UI Controller & HUD
    │   ├── GameCanvas.jsx # Game Engine (Canvas API)
    │   ├── Leaderboard.jsx# Leaderboard UI & API Calls
    │   └── App.css        # Cyberpunk/Neon Styling
    └── package.json       # Frontend Dependencies


## 🛰️ Join the Fleet

Ready to upgrade the ship's systems? We welcome all pilots to contribute to the Galactic Chicken project!

### 🚀 Deployment Protocol

1. **Fork the Repository** - Clone your own copy of the mothership
2. **Create Feature Branch** - `git checkout -b feature/new-weapon-system`
3. **Commit Your Changes** - Document your engineering modifications
4. **Push to Branch** - Transmit your updates to the fleet
5. **Open Pull Request** - Request clearance for docking with the main vessel

### 🎯 Mission Objectives
Looking for ways to contribute? Here are some key areas:
- **Weapon Systems**: New power-ups and attack patterns
- **Enemy AI**: Smarter chicken flight patterns and behaviors  
- **Visual Enhancements**: Particle effects, animations, and UI improvements
- **Performance Optimization**: Boost FPS and reduce latency
- **Multiplayer Support**: Co-op and competitive modes
- **Mobile Controls**: Touch-based movement and firing
- **Sound Effects**: Audio feedback for combat and achievements

---

## 🎮 Latest Updates (v2.0)

### New Features
- ✨ **Enemy Variety**: 5 enemy types with unique behaviors
- ⚡ **Power-Up System**: 4 collectible buffs with visual effects
- 🔥 **Combo System**: Kill streaks with bonus scoring
- ☄️ **Environmental Hazards**: Destructible asteroids
- 🏆 **Achievement System**: 9 unlockable achievements
- 👾 **Boss Encounters**: Special battles every 5 levels

### Visual Improvements
- 💫 Power-ups now feature pulsing, glowing, and sparkle effects
- 🎯 Player bullets (cyan) vs Enemy bullets (red-orange fireballs)
- 💥 Enhanced particle effects and explosions
- 📊 HP bars for bosses and tank enemies
- 🛡️ Shield bubble animation

### Gameplay Enhancements
- Progressive difficulty scaling
- Score multiplier system
- Combo milestone notifications
- Achievement tracking in database
- Improved visual feedback for all game elements

*All contributions must pass our flight readiness review before deployment!*
<div align="center">
<sub>Built with 🐔 by S0L0L0B0</sub>
</div>
