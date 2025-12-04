import React, { useRef, useEffect } from 'react';

const GameCanvas = ({ onGameOver, onStatsUpdate, showPowerUp }) => {
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
      const size = 40;
      chickens.push({
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        speed: 2 + (level * 0.4),
        hp: 1 + Math.floor(level / 1.5), // HP scales with level
        type: level % 5 === 0 ? 'boss' : 'normal',
        wiggle: Math.random() * Math.PI * 2,
        wiggleSpeed: 0.02 + Math.random() * 0.05
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
      if (isMouseDown) {
        // A. Standard Blasters (Rate: Fast)
        if (frameCount % 7 === 0) {
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

      const spawnRate = Math.max(10, 60 - (level * 3));
      if (frameCount % spawnRate === 0) spawnChicken();

      // --- DRAWING ---

      // Draw Player
      ctx.font = "45px Arial";
      ctx.fillText("🚀", player.x, player.y + 40);

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

      // Draw Bullets
      bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 10; ctx.shadowColor = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
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
        c.y += c.speed;
        c.x += Math.sin(frameCount * c.wiggleSpeed + c.wiggle) * 3;

        ctx.font = c.type === 'boss' ? "70px Arial" : "40px Arial";
        ctx.fillText(c.type === 'boss' ? "👾" : "🐔", c.x, c.y + 40);

        // Enemy Shoot
        if (level >= 2 && Math.random() < 0.02) {
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
            score += c.type === 'boss' ? 500 : 50 * level;
            onStatsUpdate({ score, hp: currentHp, level, kills });
        }

        // Player Crash
        if (player.x < c.x + c.width && player.x + player.width > c.x &&
            player.y < c.y + c.height && player.y + player.height > c.y) {
            chickens.splice(i, 1);
            currentHp -= 20;
            createExplosion(player.x, player.y, '#ff0000', 20);
        }
        
        if (c.y > canvas.height) chickens.splice(i, 1);
      });

      // Enemy Bullets
      enemyBullets.forEach((eb, i) => {
          eb.x += eb.vx; eb.y += eb.vy;
          ctx.fillStyle = eb.color;
          ctx.beginPath(); ctx.arc(eb.x, eb.y, 7, 0, Math.PI*2); ctx.fill();

          if (eb.x > player.x && eb.x < player.x + player.width &&
              eb.y > player.y && eb.y < player.y + player.height) {
              enemyBullets.splice(i, 1);
              currentHp -= 10;
              createExplosion(player.x, player.y, '#ff0000');
          }
          if (eb.y > canvas.height) enemyBullets.splice(i, 1);
      });

      // Particles
      particles.forEach((p, i) => {
          p.x += p.vx; p.y += p.vy; p.life -= 0.05;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4);
          if (p.life <= 0) particles.splice(i, 1);
      });
      ctx.globalAlpha = 1.0;

      onStatsUpdate({ score, hp: currentHp, level, kills });

      if (currentHp <= 0) {
        cancelAnimationFrame(animationFrameId);
        onGameOver({ score, level, kills });
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