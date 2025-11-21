import React, { useRef, useEffect, useState } from 'react';

const GameCanvas = ({ onGameOver }) => {
  const canvasRef = useRef(null);
  
  // Game Constants
  const PLAYER_SIZE = 30;
  const BULLET_SPEED = 7;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Game State inside the loop
    let score = 0;
    let level = 1;
    let frameCount = 0;
    let hp = 3;
    
    // Entities
    let player = { x: 400, y: 550, width: PLAYER_SIZE, height: PLAYER_SIZE };
    let bullets = [];
    let chickens = [];
    
    // Input handling
    let keys = {};
    
    const handleKeyDown = (e) => keys[e.code] = true;
    const handleKeyUp = (e) => keys[e.code] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- GAME LOOP ---
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Level Logic
      // Every 500 points, level up (chickens get faster or spawn faster)
      if (score > level * 500) {
        level++;
      }
      
      // Spawn Chickens based on level difficulty
      // Higher level = lower modulus = frequent spawns
      const spawnRate = Math.max(20, 60 - (level * 5)); 
      if (frameCount % spawnRate === 0) {
        const size = 30 + (Math.random() * 20);
        chickens.push({
          x: Math.random() * (canvas.width - size),
          y: -50,
          width: size,
          height: size,
          speed: 1 + (level * 0.5), // Speed increases with level
          hp: 1 + Math.floor(level / 3) // HP increases every 3 levels
        });
      }

      // 2. Player Logic
      if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
      if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += 5;
      
      // Shooting (Spacebar) - Limit fire rate
      if (keys['Space'] && frameCount % 10 === 0) {
        bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10 });
      }

      // Draw Player
      ctx.fillStyle = '#00f';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // 3. Bullets Logic
      ctx.fillStyle = '#ff0';
      bullets.forEach((b, index) => {
        b.y -= BULLET_SPEED;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        // Remove off-screen
        if (b.y < 0) bullets.splice(index, 1);
      });

      // 4. Chicken Logic & Collision
      chickens.forEach((c, cIndex) => {
        c.y += c.speed;
        
        // Draw Chicken
        ctx.fillStyle = `rgb(${255 - (c.hp * 20)}, 0, 0)`; // Darker red if more HP
        ctx.fillRect(c.x, c.y, c.width, c.height);

        // Check Bullet Collision
        bullets.forEach((b, bIndex) => {
          if (
            b.x < c.x + c.width &&
            b.x + b.width > c.x &&
            b.y < c.y + c.height &&
            b.y + b.height > c.y
          ) {
            // Hit!
            bullets.splice(bIndex, 1);
            c.hp--;
            if (c.hp <= 0) {
              chickens.splice(cIndex, 1);
              score += 10 * level;
            }
          }
        });

        // Check Player Collision (Chicken hits player)
        if (
          player.x < c.x + c.width &&
          player.x + player.width > c.x &&
          player.y < c.y + c.height &&
          player.y + player.height > c.y
        ) {
          chickens.splice(cIndex, 1);
          hp--;
        }

        // Remove if off screen
        if (c.y > canvas.height) {
            chickens.splice(cIndex, 1);
            // Optional: Lose points if chicken escapes?
        }
      });

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(`Level: ${level}`, 10, 60);
      ctx.fillText(`HP: ${hp}`, 10, 90);

      // Game Over Check
      if (hp <= 0) {
        cancelAnimationFrame(animationFrameId);
        onGameOver(score);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      style={{ background: '#222', border: '2px solid white' }}
    />
  );
};

export default GameCanvas;