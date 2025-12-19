import React, { useRef, useEffect } from 'react';

const GameCanvas = ({ onGameOver, onStatsUpdate, showPowerUp, onAchievement }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // --- RESIZE HANDLER ---
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- GAME STATE ---
    let score = 0;
    let level = 1;
    let kills = 0;
    let frameCount = 0;
    let currentHp = 100;
    
    // Player Configuration
    let player = { 
      x: canvas.width / 2, 
      y: canvas.height - 100, 
      width: 50, 
      height: 50, 
      // Weapon States
      blasterLevel: 1, // 1=Single, 2=Double, 3=Triple
      hasMissiles: false,
      missileLevel: 0,
      hasDrones: false,
      hasLaser: false,
      laserActive: false,
      laserTimer: 0
    };

    // Entity Arrays
    let bullets = [];      // Standard blasters
    let missiles = [];     // Homing missiles
    let enemyBullets = []; // Chicken fire
    let chickens = [];
    let particles = [];
    let powerUps = [];     // Power-up drops
    let asteroids = [];    // Environmental hazards
    
    // Gameplay Systems
    let comboCounter = 0;
    let comboTimer = 0;
    let scoreMultiplier = 1;
    let multiplierTimer = 0;
    let rapidFireActive = false;
    let rapidFireTimer = 0;
    let shieldActive = false;
    let shieldTimer = 0;
    
    // Achievement tracking
    let achievements = [];
    let maxCombo = 0;
    let totalDamageTaken = 0;
    let bossesKilled = 0;
    
    const checkAchievements = () => {
      const unlock = (id, name) => {
        if (!achievements.includes(id)) {
          achievements.push(id);
          onAchievement(name);
        }
      };
      
      if (score >= 10000 && !achievements.includes('score_10k')) unlock('score_10k', '🏆 First 10K!');
      if (score >= 50000 && !achievements.includes('score_50k')) unlock('score_50k', '🏆 Score Master!');
      if (level >= 10 && !achievements.includes('level_10')) unlock('level_10', '🎯 Level 10 Reached!');
      if (kills >= 100 && !achievements.includes('kills_100')) unlock('kills_100', '🔫 Century Club!');
      if (kills >= 500 && !achievements.includes('kills_500')) unlock('kills_500', '🔫 Exterminator!');
      if (maxCombo >= 15 && !achievements.includes('combo_15')) unlock('combo_15', '⚡ Combo King!');
      if (maxCombo >= 30 && !achievements.includes('combo_30')) unlock('combo_30', '⚡ Unstoppable Force!');
      if (bossesKilled >= 5 && !achievements.includes('boss_5')) unlock('boss_5', '👾 Boss Hunter!');
      if (totalDamageTaken === 0 && score > 5000 && !achievements.includes('no_damage')) unlock('no_damage', '🛡️ Untouchable!');
    };

    // Mouse Input
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height - 100;
    let isMouseDown = false;

    const handleMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    const handleMouseDown = () => isMouseDown = true;
    const handleMouseUp = () => isMouseDown = false;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // --- HELPERS ---
    const getClosestEnemy = (x, y) => {
        let target = null;
        let minDist = 10000;
        chickens.forEach(c => {
            const dist = Math.hypot(c.x - x, c.y - y);
            if (dist < minDist && c.y > 0) { // Only target on-screen enemies
                minDist = dist;
                target = c;
            }
        });
        return target;
    };

    const createExplosion = (x, y, color, count = 10) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1.0,
          color: color
        });
      }
    };

    // --- SPAWN LOGIC ---
    const spawnChicken = () => {
      let size = 40;
      const rand = Math.random();
      let type = 'normal';
      let speed = 2 + (level * 0.4);
      let hp = 1 + Math.floor(level / 1.5);
      let shootRate = 0.02;
      let pattern = 'wiggle';
      let emoji = '🐔';
      
      // Boss every 5 levels
      if (level % 5 === 0 && frameCount % 300 === 0) {
        type = 'boss';
        hp = 20 + (level * 3);
        speed = 1.5;
        size = 80;
        shootRate = 0.05;
        emoji = '👾';
        pattern = 'orbit';
      }
      // Enemy variety (only after level 2)
      else if (level > 2) {
        if (rand < 0.15) { // Fast enemy
          type = 'fast';
          speed = 4 + (level * 0.6);
          hp = 1;
          emoji = '🐤';
          pattern = 'straight';
        } else if (rand < 0.30) { // Tanky enemy
          type = 'tank';
          speed = 1 + (level * 0.2);
          hp = 3 + Math.floor(level / 2);
          emoji = '🦃';
          pattern = 'zigzag';
        } else if (rand < 0.45 && level > 3) { // Shooter enemy
          type = 'shooter';
          speed = 1.5 + (level * 0.3);
          hp = 2;
          shootRate = 0.04;
          emoji = '🦅';
          pattern = 'circle';
        }
      }
      
      chickens.push({
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        speed,
        hp,
        maxHp: hp,
        type,
        shootRate,
        pattern,
        emoji,
        wiggle: Math.random() * Math.PI * 2,
        wiggleSpeed: 0.02 + Math.random() * 0.05,
        angle: 0
      });
    };
    
    const spawnPowerUp = (x, y) => {
      const types = ['health', 'shield', 'rapid', 'multiplier'];
      const type = types[Math.floor(Math.random() * types.length)];
      const emojis = { health: '💊', shield: '🛡️', rapid: '⚡', multiplier: '💎' };
      
      powerUps.push({
        x, y,
        type,
        emoji: emojis[type],
        vy: 2,
        size: 30
      });
    };
    
    const spawnAsteroid = () => {
      asteroids.push({
        x: Math.random() * canvas.width,
        y: -50,
        size: 30 + Math.random() * 40,
        speed: 1 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        hp: 3
      });
    };

    // --- MAIN RENDER LOOP ---
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Player Movement & Bounds
      player.x += (mouseX - player.width/2 - player.x) * 0.15;
      player.y += (mouseY - player.height/2 - player.y) * 0.15;
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

      // 2. WEAPON SYSTEMS
      const fireRate = rapidFireActive ? 4 : 7;
      if (isMouseDown) {
        // A. Standard Blasters (Rate: Fast)
        if (frameCount % fireRate === 0) {
            if (player.blasterLevel === 1) {
                bullets.push({ x: player.x + 22, y: player.y, vx: 0, vy: -18, color: '#00ffff' });
            } else if (player.blasterLevel === 2) {
                bullets.push({ x: player.x + 5, y: player.y + 10, vx: -1, vy: -18, color: '#00ffff' });
                bullets.push({ x: player.x + 40, y: player.y + 10, vx: 1, vy: -18, color: '#00ffff' });
            } else { // Triple
                bullets.push({ x: player.x + 22, y: player.y, vx: 0, vy: -18, color: '#00ffff' });
                bullets.push({ x: player.x, y: player.y + 10, vx: -3, vy: -16, color: '#00aaff' });
                bullets.push({ x: player.x + 45, y: player.y + 10, vx: 3, vy: -16, color: '#00aaff' });
            }

            // B. Drones (Fire alongside player)
            if (player.hasDrones) {
                bullets.push({ x: player.x - 30, y: player.y + 20, vx: 0, vy: -15, color: '#00ff00' });
                bullets.push({ x: player.x + 80, y: player.y + 20, vx: 0, vy: -15, color: '#00ff00' });
            }
        }

        // C. Homing Missiles (Rate: Slow)
        if (player.hasMissiles && frameCount % 30 === 0) {
            const count = player.missileLevel; // 1 or 2 missiles
            for(let i=0; i<count; i++) {
                missiles.push({
                    x: player.x + (i===0 ? 0 : 50),
                    y: player.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: -5,
                    target: null // Will find target in loop
                });
            }
        }

        // D. Laser Beam (Chance to trigger)
        if (player.hasLaser && !player.laserActive && Math.random() < 0.005) {
            player.laserActive = true;
            player.laserTimer = 60; // Duration in frames
            showPowerUp("LASER BEAM!");
        }
      }

      // 3. LEVEL UP LOGIC
      if (score > level * 1000) {
        level++;
        const msg = (txt) => showPowerUp(txt);

        if (level === 2) { player.blasterLevel = 2; msg("DOUBLE BLASTER"); }
        else if (level === 4) { player.blasterLevel = 3; msg("TRIPLE THREAT"); }
        else if (level === 6) { player.hasMissiles = true; player.missileLevel = 1; msg("HOMING MISSILES"); }
        else if (level === 8) { player.hasDrones = true; msg("DRONE SQUAD"); }
        else if (level === 10) { player.missileLevel = 2; msg("MISSILE UPGRADE"); }
        else if (level === 12) { player.hasLaser = true; msg("HYPER LASER UNLOCKED"); }
      }

      // Spawn enemies
      const spawnRate = Math.max(10, 60 - (level * 3));
      if (frameCount % spawnRate === 0) spawnChicken();
      
      // Spawn asteroids (after level 3)
      if (level > 3 && frameCount % 120 === 0 && Math.random() < 0.4) {
        spawnAsteroid();
      }
      
      // Update timers
      if (comboTimer > 0) comboTimer--;
      if (comboTimer === 0) comboCounter = 0;
      
      if (multiplierTimer > 0) {
        multiplierTimer--;
      } else {
        scoreMultiplier = 1;
      }
      
      if (rapidFireTimer > 0) {
        rapidFireTimer--;
      } else {
        rapidFireActive = false;
      }
      
      if (shieldTimer > 0) {
        shieldTimer--;
      } else {
        shieldActive = false;
      }

      // --- DRAWING ---

      // Draw Player
      ctx.font = "45px Arial";
      ctx.fillText("🚀", player.x, player.y + 40);
      
      // Draw Shield
      if (shieldActive) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(frameCount * 0.2) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + 25, player.y + 25, 40, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Drones
      if (player.hasDrones) {
          ctx.font = "30px Arial";
          // Drones float around player
          const hover = Math.sin(frameCount * 0.1) * 5;
          ctx.fillText("🛸", player.x - 45, player.y + 30 + hover);
          ctx.fillText("🛸", player.x + 65, player.y + 30 + hover);
      }

      // Draw Laser
      if (player.laserActive) {
          player.laserTimer--;
          if (player.laserTimer <= 0) player.laserActive = false;
          
          // Draw Beam
          ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.5 + 0.5})`;
          ctx.fillRect(player.x + 20, 0, 10, player.y);
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'red';
          
          // Laser Collision (Instantly hits everything in column)
          chickens.forEach((c, i) => {
              if (c.x < player.x + 30 && c.x + c.width > player.x + 20) {
                  c.hp -= 2; // High damage per frame
                  createExplosion(c.x + c.width/2, c.y + c.height/2, '#ff0000', 2);
              }
          });
          ctx.shadowBlur = 0;
      }

      // Draw Player Bullets (Cyan/Blue with trails)
      bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        
        // Player bullets - bright cyan with glow
        ctx.shadowBlur = 12; 
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath(); 
        ctx.arc(b.x, b.y, 5, 0, Math.PI*2); 
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); 
        ctx.arc(b.x, b.y, 2, 0, Math.PI*2); 
        ctx.fill();
        
        ctx.shadowBlur = 0;
        if (b.y < 0) bullets.splice(i, 1);
      });

      // Draw & Update Missiles
      missiles.forEach((m, i) => {
          // 1. Find Target if none
          if (!m.target || m.target.hp <= 0) {
              m.target = getClosestEnemy(m.x, m.y);
          }
          
          // 2. Physics (Steering)
          if (m.target) {
              const dx = m.target.x - m.x;
              const dy = m.target.y - m.y;
              const angle = Math.atan2(dy, dx);
              m.vx += Math.cos(angle) * 0.5; // Turn speed
              m.vy += Math.sin(angle) * 0.5;
          }
          
          // Cap speed
          const speed = Math.hypot(m.vx, m.vy);
          if (speed > 8) {
              m.vx = (m.vx / speed) * 8;
              m.vy = (m.vy / speed) * 8;
          }

          m.x += m.vx;
          m.y += m.vy;

          // Draw Missile
          ctx.fillStyle = '#ffaa00';
          ctx.beginPath(); ctx.arc(m.x, m.y, 6, 0, Math.PI*2); ctx.fill();
          
          // Smoke Trail
          if (frameCount % 4 === 0) {
              particles.push({x: m.x, y: m.y, vx: 0, vy: 0, life: 0.5, color: '#555'});
          }

          if (m.y < -50 || m.y > canvas.height + 50) missiles.splice(i, 1);
      });

      // Draw Chickens
      chickens.forEach((c, i) => {
        // Movement patterns
        c.y += c.speed;
        c.angle += 0.05;
        
        if (c.pattern === 'wiggle') {
          c.x += Math.sin(frameCount * c.wiggleSpeed + c.wiggle) * 3;
        } else if (c.pattern === 'zigzag') {
          c.x += Math.sin(frameCount * 0.05) * 5;
        } else if (c.pattern === 'circle') {
          c.x += Math.cos(c.angle) * 2;
        } else if (c.pattern === 'orbit') {
          c.x += Math.sin(frameCount * 0.02) * 4;
        }
        
        // Keep in bounds
        c.x = Math.max(0, Math.min(canvas.width - c.width, c.x));

        // Draw enemy
        const fontSize = c.type === 'boss' ? 80 : 40;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(c.emoji, c.x, c.y + 40);
        
        // HP bar for bosses and tanks
        if ((c.type === 'boss' || c.type === 'tank') && c.hp < c.maxHp) {
          const barWidth = c.width;
          ctx.fillStyle = '#333';
          ctx.fillRect(c.x, c.y - 10, barWidth, 5);
          ctx.fillStyle = c.type === 'boss' ? '#ff0000' : '#ff9900';
          ctx.fillRect(c.x, c.y - 10, barWidth * (c.hp / c.maxHp), 5);
        }

        // Enemy Shoot
        if (level >= 2 && Math.random() < c.shootRate) {
            enemyBullets.push({
                x: c.x + 20, y: c.y + 20,
                vx: (player.x - c.x) * 0.015, vy: 7,
                color: '#ff0055'
            });
        }

        // Collision: Standard Bullets
        bullets.forEach((b, bi) => {
            if (b.x > c.x && b.x < c.x + c.width && b.y > c.y && b.y < c.y + c.height) {
                bullets.splice(bi, 1);
                c.hp--;
                createExplosion(c.x, c.y, b.color, 5);
            }
        });

        // Collision: Missiles
        missiles.forEach((m, mi) => {
            if (m.x > c.x && m.x < c.x + c.width && m.y > c.y && m.y < c.y + c.height) {
                missiles.splice(mi, 1);
                c.hp -= 5; // Missiles do heavy damage
                createExplosion(c.x, c.y, '#ffaa00', 15); // Big boom
            }
        });

        // Death Check
        if (c.hp <= 0) {
            chickens.splice(i, 1);
            kills++;
            
            // Combo system
            comboCounter++;
            comboTimer = 120; // 2 seconds at 60fps
            
            // Score calculation
            let baseScore = 50 * level;
            if (c.type === 'boss') baseScore = 500;
            else if (c.type === 'tank') baseScore = 100;
            else if (c.type === 'fast') baseScore = 75;
            else if (c.type === 'shooter') baseScore = 85;
            
            const comboBonus = comboCounter > 3 ? Math.floor(comboCounter * 10) : 0;
            score += Math.floor((baseScore + comboBonus) * scoreMultiplier);
            
            // Track achievements
            if (c.type === 'boss') bossesKilled++;
            if (comboCounter > maxCombo) maxCombo = comboCounter;
            checkAchievements();
            
            // Combo milestone notifications
            if (comboCounter === 5) showPowerUp("5X COMBO!");
            if (comboCounter === 10) showPowerUp("10X MEGA COMBO!");
            if (comboCounter === 20) showPowerUp("20X UNSTOPPABLE!");
            
            // Power-up drop chance (10%)
            if (Math.random() < 0.10) {
              spawnPowerUp(c.x + c.width/2, c.y + c.height/2);
            }
            
            onStatsUpdate({ score, hp: currentHp, level, kills });
        }

        // Player Crash
        if (player.x < c.x + c.width && player.x + player.width > c.x &&
            player.y < c.y + c.height && player.y + player.height > c.y) {
            chickens.splice(i, 1);
            if (!shieldActive) {
              currentHp -= 20;
              totalDamageTaken += 20;
              createExplosion(player.x, player.y, '#ff0000', 20);
              comboCounter = 0; // Reset combo on hit
            } else {
              createExplosion(c.x, c.y, '#00ffff', 15);
            }
        }
        
        if (c.y > canvas.height) chickens.splice(i, 1);
      });

      // Enemy Bullets (Distinct Red/Orange with glow)
      enemyBullets.forEach((eb, i) => {
          eb.x += eb.vx; eb.y += eb.vy;
          
          // Draw glowing red enemy bullet
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff0000';
          
          // Outer glow
          ctx.fillStyle = '#ff3300';
          ctx.beginPath(); 
          ctx.arc(eb.x, eb.y, 9, 0, Math.PI*2); 
          ctx.fill();
          
          // Inner core
          ctx.fillStyle = '#ffff00';
          ctx.beginPath(); 
          ctx.arc(eb.x, eb.y, 4, 0, Math.PI*2); 
          ctx.fill();
          
          // Trail effect
          if (frameCount % 2 === 0) {
            particles.push({
              x: eb.x, 
              y: eb.y, 
              vx: -eb.vx * 0.2, 
              vy: -eb.vy * 0.2, 
              life: 0.4, 
              color: '#ff4400'
            });
          }
          
          ctx.shadowBlur = 0;

          if (eb.x > player.x && eb.x < player.x + player.width &&
              eb.y > player.y && eb.y < player.y + player.height) {
              enemyBullets.splice(i, 1);
              if (!shieldActive) {
                currentHp -= 10;
                totalDamageTaken += 10;
                createExplosion(player.x, player.y, '#ff0000');
                comboCounter = 0; // Reset combo on hit
              } else {
                createExplosion(player.x, player.y, '#00ffff', 8);
              }
          }
          if (eb.y > canvas.height) enemyBullets.splice(i, 1);
      });

      // Power-ups
      powerUps.forEach((p, i) => {
        p.y += p.vy;
        
        // Blinking and sparkling effect
        const pulse = Math.sin(frameCount * 0.15) * 0.5 + 0.5; // 0 to 1
        const scale = 1 + pulse * 0.3; // 1 to 1.3
        
        // Outer glow
        ctx.shadowBlur = 20 + pulse * 15;
        ctx.shadowColor = p.type === 'health' ? '#ff00ff' : 
                          p.type === 'shield' ? '#00ffff' :
                          p.type === 'rapid' ? '#ffff00' : '#ff00ff';
        
        // Draw pulsing emoji
        ctx.font = `${30 * scale}px Arial`;
        ctx.globalAlpha = 0.8 + pulse * 0.2;
        ctx.fillText(p.emoji, p.x - (scale - 1) * 15, p.y + (scale - 1) * 15);
        
        // Sparkle particles around power-up
        if (frameCount % 5 === 0) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 20 + Math.random() * 10;
          particles.push({
            x: p.x + 15 + Math.cos(angle) * distance,
            y: p.y + Math.sin(angle) * distance,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            life: 0.6,
            color: ctx.shadowColor
          });
        }
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        
        // Collection
        if (player.x < p.x + p.size && player.x + player.width > p.x &&
            player.y < p.y + p.size && player.y + player.height > p.y) {
          powerUps.splice(i, 1);
          
          if (p.type === 'health') {
            currentHp = Math.min(100, currentHp + 30);
            showPowerUp("HEALTH +30");
          } else if (p.type === 'shield') {
            shieldActive = true;
            shieldTimer = 300; // 5 seconds
            showPowerUp("SHIELD ACTIVATED");
          } else if (p.type === 'rapid') {
            rapidFireActive = true;
            rapidFireTimer = 360; // 6 seconds
            showPowerUp("RAPID FIRE!");
          } else if (p.type === 'multiplier') {
            scoreMultiplier = 2;
            multiplierTimer = 480; // 8 seconds
            showPowerUp("2X SCORE!");
          }
          
          createExplosion(p.x, p.y, '#00ff00', 10);
        }
        
        if (p.y > canvas.height) powerUps.splice(i, 1);
      });
      
      // Asteroids
      asteroids.forEach((a, i) => {
        a.y += a.speed;
        a.rotation += a.rotationSpeed;
        
        // Draw asteroid
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.fillStyle = '#666';
        ctx.beginPath();
        for(let j = 0; j < 8; j++) {
          const angle = (j / 8) * Math.PI * 2;
          const radius = a.size * (0.8 + Math.random() * 0.4);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Bullet collision
        bullets.forEach((b, bi) => {
          if (Math.hypot(b.x - a.x, b.y - a.y) < a.size) {
            bullets.splice(bi, 1);
            a.hp--;
            createExplosion(a.x, a.y, '#888', 3);
          }
        });
        
        // Missile collision
        missiles.forEach((m, mi) => {
          if (Math.hypot(m.x - a.x, m.y - a.y) < a.size) {
            missiles.splice(mi, 1);
            a.hp -= 3;
            createExplosion(a.x, a.y, '#ffaa00', 8);
          }
        });
        
        // Player collision
        if (Math.hypot(player.x + player.width/2 - a.x, player.y + player.height/2 - a.y) < a.size + 25) {
          if (!shieldActive) {
            currentHp -= 15;
            totalDamageTaken += 15;
            createExplosion(player.x, player.y, '#ff0000', 15);
            comboCounter = 0;
          }
          a.hp = 0;
        }
        
        if (a.hp <= 0) {
          asteroids.splice(i, 1);
          createExplosion(a.x, a.y, '#888', 20);
        }
        
        if (a.y > canvas.height + 50) asteroids.splice(i, 1);
      });
      
      // Particles
      particles.forEach((p, i) => {
          p.x += p.vx; p.y += p.vy; p.life -= 0.05;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4);
          if (p.life <= 0) particles.splice(i, 1);
      });
      ctx.globalAlpha = 1.0;
      
      // Draw combo counter
      if (comboCounter > 3) {
        ctx.font = "30px Arial";
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.fillText(`${comboCounter}X COMBO!`, canvas.width / 2 - 80, 100);
        ctx.shadowBlur = 0;
      }

      onStatsUpdate({ score, hp: currentHp, level, kills });

      if (currentHp <= 0) {
        cancelAnimationFrame(animationFrameId);
        onGameOver({ score, level, kills, achievements });
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default GameCanvas;