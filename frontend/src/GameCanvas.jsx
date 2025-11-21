import React, { useRef, useEffect } from 'react';

const GameCanvas = ({ onGameOver, onStatsUpdate, showPowerUp }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // --- DYNAMIC RESIZE ---
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize(); // Initial sizing

    // --- GAME STATE ---
    let score = 0;
    let level = 1;
    let kills = 0;
    let frameCount = 0;
    let currentHp = 100;
    
    // Entities
    let player = { x: canvas.width / 2, y: canvas.height - 100, width: 50, height: 50, powerLevel: 1 };
    let bullets = [];
    let enemyBullets = [];
    let chickens = [];
    let particles = [];

    // Mouse Tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height - 100;
    let isMouseDown = false;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseDown = () => isMouseDown = true;
    const handleMouseUp = () => isMouseDown = false;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // --- SPAWN LOGIC ---
    const spawnChicken = () => {
      const size = 40;
      chickens.push({
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        speed: 2 + (level * 0.5), // Slightly faster
        hp: 1 + Math.floor(level / 2),
        type: level % 3 === 0 ? 'boss' : 'normal',
        wiggle: Math.random() * Math.PI * 2
      });
    };

    const createExplosion = (x, y, color) => {
      for (let i = 0; i < 12; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1.0,
          color: color
        });
      }
    };

    // --- RENDER LOOP ---
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Player Logic (Smooth Follow)
      player.x += (mouseX - player.width/2 - player.x) * 0.15;
      player.y += (mouseY - player.height/2 - player.y) * 0.15;

      // Keep player on screen
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

      // Shooting (Rate: every 7 frames)
      if (isMouseDown && frameCount % 7 === 0) {
        if (player.powerLevel === 1) {
            bullets.push({ x: player.x + 22, y: player.y, vx: 0, vy: -18 });
        } else if (player.powerLevel === 2) {
            bullets.push({ x: player.x + 5, y: player.y + 10, vx: -1, vy: -18 });
            bullets.push({ x: player.x + 40, y: player.y + 10, vx: 1, vy: -18 });
        } else {
            bullets.push({ x: player.x + 22, y: player.y, vx: 0, vy: -18 });
            bullets.push({ x: player.x, y: player.y + 10, vx: -2, vy: -16 });
            bullets.push({ x: player.x + 45, y: player.y + 10, vx: 2, vy: -16 });
        }
      }

      // --- BALANCE UPDATES ---
      // Level up every 800 points (Faster progression)
      if (score > level * 800) {
        level++;
        // Powerups come earlier now
        if (level === 2) { player.powerLevel = 2; showPowerUp("DUAL BLASTERS!"); }
        if (level === 4) { player.powerLevel = 3; showPowerUp("TRIPLE THREAT!"); }
      }

      // Spawn Rate
      const spawnRate = Math.max(10, 50 - (level * 4));
      if (frameCount % spawnRate === 0) spawnChicken();

      // Draw Player
      ctx.font = "45px Arial";
      ctx.fillText("🚀", player.x, player.y + 40);

      // 2. Bullets
      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI*2); ctx.fill();
        if (b.y < 0) bullets.splice(i, 1);
      });
      ctx.shadowBlur = 0;

      // 3. Chickens
      chickens.forEach((c, i) => {
        c.y += c.speed;
        c.x += Math.sin(frameCount * 0.05 + c.wiggle) * 3;

        ctx.font = c.type === 'boss' ? "60px Arial" : "40px Arial";
        ctx.fillText(c.type === 'boss' ? "👾" : "🐔", c.x, c.y + 35);

        // Enemy Shoot
        if (level >= 2 && Math.random() < 0.02) {
            enemyBullets.push({
                x: c.x + 20, y: c.y + 20,
                vx: (player.x - c.x) * 0.015, vy: 7,
                color: '#ff0055'
            });
        }

        // Bullet Hit Chicken
        bullets.forEach((b, bi) => {
            if (b.x > c.x && b.x < c.x + c.width && b.y > c.y && b.y < c.y + c.height) {
                bullets.splice(bi, 1);
                c.hp--;
                createExplosion(c.x, c.y, '#ffaa00');
                if (c.hp <= 0) {
                    chickens.splice(i, 1);
                    kills++;
                    score += 50 * level; 
                }
            }
        });

        // Chicken Hit Player
        if (player.x < c.x + c.width && player.x + player.width > c.x &&
            player.y < c.y + c.height && player.y + player.height > c.y) {
            chickens.splice(i, 1);
            currentHp -= 20;
            createExplosion(player.x, player.y, '#ff0000');
        }
        
        if (c.y > canvas.height) chickens.splice(i, 1);
      });

      // 4. Enemy Bullets
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

      // 5. Particles
      particles.forEach((p, i) => {
          p.x += p.vx; p.y += p.vy; p.life -= 0.04;
          ctx.globalAlpha = Math.max(0, p.life); 
          ctx.fillStyle = p.color; 
          ctx.fillRect(p.x, p.y, 5, 5);
          if (p.life <= 0) particles.splice(i, 1);
      });
      ctx.globalAlpha = 1.0;

      // Stats Update
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

  // Canvas now fills the screen via CSS, but we set attributes in JS
  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default GameCanvas;