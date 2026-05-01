import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameState {
  score: number;
  isGameOver: boolean;
  level: number;
  health: number;
  maxHealth: number;
}

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface PowerUp extends Entity {
  type: 'health' | 'rapid' | 'shield';
  active: boolean;
}

interface Bullet extends Entity {
  active: boolean;
  isPower?: boolean;
}

interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  type: 'standard' | 'fast' | 'tank' | 'interceptor';
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    level: 1,
    health: 3,
    maxHealth: 3,
  });

  const [shieldActive, setShieldActive] = useState(false);
  const [rapidFire, setRapidFire] = useState(false);

  const requestRef = useRef<number>();
  const playerRef = useRef<Entity>({ x: 0, y: 0, width: 44, height: 44, speed: 7 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const lastShotTime = useRef<number>(0);
  const lastEnemySpawn = useRef<number>(0);
  const lastPowerUpSpawn = useRef<number>(0);

  // Audio refs (Placeholder logic)
  const playSound = (type: 'shoot' | 'explosion' | 'powerup' | 'damage') => {
    const urls = {
      shoot: 'https://assets.mixkit.co/active_storage/sfx/1706/1706-preview.mp3',
      explosion: 'https://assets.mixkit.co/active_storage/sfx/1697/1697-preview.mp3',
      powerup: 'https://assets.mixkit.co/active_storage/sfx/1715/1715-preview.mp3',
      damage: 'https://assets.mixkit.co/active_storage/sfx/1722/1722-preview.mp3',
    };
    const audio = new Audio(urls[type]);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    playerRef.current = {
      x: canvas.width / 2 - 22,
      y: canvas.height - 100,
      width: 44,
      height: 44,
      speed: 8,
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    setGameState({ score: 0, isGameOver: false, level: 1, health: 3, maxHealth: 3 });
    setShieldActive(false);
    setRapidFire(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keysPressed.current[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keysPressed.current[e.key] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 800;
      initGame();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [initGame]);

  const spawnEnemy = useCallback((now: number) => {
    const spawnRate = Math.max(400, 1800 - (gameState.level * 150));
    if (now - lastEnemySpawn.current > spawnRate) {
      const rand = Math.random();
      let enemy: Enemy;
      const x = Math.random() * (600 - 40);

      if (rand > 0.9 && gameState.level > 2) {
        enemy = { x, y: -60, width: 60, height: 60, speed: 1.5, health: 5, maxHealth: 5, type: 'tank', color: '#00FF00' };
      } else if (rand > 0.7 && gameState.level > 3) {
        enemy = { x, y: -40, width: 30, height: 30, speed: 5, health: 1, maxHealth: 1, type: 'fast', color: '#FFFF00' };
      } else {
        enemy = { x, y: -40, width: 40, height: 40, speed: 2.5 + (gameState.level * 0.3), health: 1, maxHealth: 1, type: 'standard', color: '#FF00FF' };
      }

      enemiesRef.current.push(enemy);
      lastEnemySpawn.current = now;
    }
  }, [gameState.level]);

  const spawnPowerUp = useCallback((now: number) => {
    if (now - lastPowerUpSpawn.current > 10000) { // Every 10 seconds
      const types: PowerUp['type'][] = ['health', 'rapid', 'shield'];
      powerUpsRef.current.push({
        x: Math.random() * (600 - 30),
        y: -40,
        width: 30,
        height: 30,
        speed: 2,
        type: types[Math.floor(Math.random() * types.length)],
        active: true,
      });
      lastPowerUpSpawn.current = now;
    }
  }, []);

  const shoot = useCallback((now: number) => {
    const cooldown = rapidFire ? 100 : 250;
    if (keysPressed.current[' '] && now - lastShotTime.current > cooldown) {
      if (rapidFire) {
         // Double shots
         bulletsRef.current.push({
          x: playerRef.current.x + 5,
          y: playerRef.current.y,
          width: 4,
          height: 15,
          speed: 12,
          active: true,
          isPower: true
        });
        bulletsRef.current.push({
          x: playerRef.current.x + playerRef.current.width - 9,
          y: playerRef.current.y,
          width: 4,
          height: 15,
          speed: 12,
          active: true,
          isPower: true
        });
      } else {
        bulletsRef.current.push({
          x: playerRef.current.x + playerRef.current.width / 2 - 2,
          y: playerRef.current.y,
          width: 4,
          height: 15,
          speed: 11,
          active: true,
        });
      }
      playSound('shoot');
      lastShotTime.current = now;
    }
  }, [rapidFire]);

  const createExplosion = (x: number, y: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 1.0,
          color,
        });
      }
  };

  const update = useCallback((now: number) => {
    if (gameState.isGameOver) return;

    // Player Movement
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
      playerRef.current.x = Math.max(0, playerRef.current.x - playerRef.current.speed);
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
      playerRef.current.x = Math.min(600 - playerRef.current.width, playerRef.current.x + playerRef.current.speed);
    }

    shoot(now);
    spawnEnemy(now);
    spawnPowerUp(now);

    // Update Bullets
    bulletsRef.current.forEach((b) => {
      b.y -= b.speed;
      if (b.y < -20) b.active = false;
    });
    bulletsRef.current = bulletsRef.current.filter(b => b.active);

    // Update PowerUps
    powerUpsRef.current.forEach((p) => {
      p.y += p.speed;
      // Collision with player
      if (
        p.x < playerRef.current.x + playerRef.current.width &&
        p.x + p.width > playerRef.current.x &&
        p.y < playerRef.current.y + playerRef.current.height &&
        p.y + p.height > playerRef.current.y
      ) {
        p.active = false;
        playSound('powerup');
        if (p.type === 'health') {
          setGameState(prev => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + 1) }));
        } else if (p.type === 'rapid') {
          setRapidFire(true);
          setTimeout(() => setRapidFire(false), 5000);
        } else if (p.type === 'shield') {
          setShieldActive(true);
          setTimeout(() => setShieldActive(false), 8000);
        }
      }
      if (p.y > 800) p.active = false;
    });
    powerUpsRef.current = powerUpsRef.current.filter(p => p.active);

    // Update Enemies
    enemiesRef.current.forEach((e, ei) => {
      e.y += e.speed;
      
      // Collision with Player
      if (
        e.x < playerRef.current.x + playerRef.current.width &&
        e.x + e.width > playerRef.current.x &&
        e.y < playerRef.current.y + playerRef.current.height &&
        e.y + e.height > playerRef.current.y
      ) {
        if (!shieldActive) {
          setGameState(prev => {
            const nextHealth = prev.health - 1;
            if (nextHealth <= 0) {
              playSound('explosion');
              createExplosion(playerRef.current.x + 22, playerRef.current.y + 22, '#00FFFF', 40);
              return { ...prev, health: 0, isGameOver: true };
            }
            playSound('damage');
            return { ...prev, health: nextHealth };
          });
        } else {
            playSound('explosion');
        }
        createExplosion(e.x + e.width/2, e.y + e.height/2, e.color);
        enemiesRef.current.splice(ei, 1);
      }

      // Off screen
      if (e.y > 800) {
        setGameState(prev => {
          const nextHealth = prev.health - 1;
          if (nextHealth <= 0) return { ...prev, health: 0, isGameOver: true };
          return { ...prev, health: nextHealth };
        });
        enemiesRef.current.splice(ei, 1);
      }
    });

    // Bullet-Enemy Collision
    bulletsRef.current.forEach(b => {
      enemiesRef.current.forEach((e, ei) => {
        if (
          b.x < e.x + e.width &&
          b.x + b.width > e.x &&
          b.y < e.y + e.height &&
          b.y + b.height > e.y
        ) {
          b.active = false;
          e.health -= 1;
          if (e.health <= 0) {
            playSound('explosion');
            createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color, e.type === 'tank' ? 30 : 15);
            setGameState(prev => {
              const newScore = prev.score + (e.type === 'tank' ? 50 : 10);
              const newLevel = Math.min(10, Math.floor(newScore / 250) + 1);
              return { ...prev, score: newScore, level: newLevel };
            });
            enemiesRef.current.splice(ei, 1);
          }
        }
      });
    });

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

  }, [gameState.isGameOver, gameState.level, shoot, spawnEnemy, spawnPowerUp, shieldActive]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 600, 800);

    // Stars Parallax Effect
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.45) + 1) * 300;
        const y = (Math.cos(i * 543.21) + 1) * 400 + (Date.now() / (20 + (i % 5)*10)) % 800;
        ctx.globalAlpha = 0.2 + (i % 5) / 10;
        ctx.fillRect(x, y % 800, 1.5, 1.5);
    }
    ctx.globalAlpha = 1.0;

    // Draw Shield
    if (shieldActive && !gameState.isGameOver) {
      ctx.beginPath();
      ctx.arc(playerRef.current.x + 22, playerRef.current.y + 22, 40, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00FFFF';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Player
    const p = playerRef.current;
    if (!gameState.isGameOver) {
      ctx.strokeStyle = '#00FFFF';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 22, p.y);
      ctx.lineTo(p.x, p.y + 44);
      ctx.lineTo(p.x + 10, p.y + 35);
      ctx.lineTo(p.x + 34, p.y + 35);
      ctx.lineTo(p.x + 44, p.y + 44);
      ctx.closePath();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00FFFF';
      ctx.stroke();
      ctx.fill();
      
      // Engines
      ctx.fillStyle = '#FF00FF';
      ctx.shadowColor = '#FF00FF';
      const engY = p.y + 35 + (Math.random() * 10);
      ctx.fillRect(p.x + 12, engY, 6, 8);
      ctx.fillRect(p.x + 26, engY, 6, 8);
      ctx.shadowBlur = 0;
    }

    // Draw Bullets
    bulletsRef.current.forEach(b => {
      ctx.fillStyle = b.isPower ? '#FF00FF' : '#00FFFF';
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });
    ctx.shadowBlur = 0;

    // Draw PowerUps
    powerUpsRef.current.forEach(pow => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(pow.x, pow.y, pow.width, pow.height);
      
      ctx.fillStyle = pow.type === 'health' ? '#00FF00' : pow.type === 'rapid' ? '#FFFF00' : '#00FFFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pow.type[0].toUpperCase(), pow.x + 15, pow.y + 20);
    });
    ctx.shadowBlur = 0;

    // Draw Enemies
    enemiesRef.current.forEach(e => {
        ctx.strokeStyle = e.color;
        ctx.fillStyle = e.color + '33';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = e.color;
        
        ctx.beginPath();
        if (e.type === 'tank') {
            ctx.rect(e.x, e.y, e.width, e.height);
        } else if (e.type === 'fast') {
            ctx.moveTo(e.x + 15, e.y);
            ctx.lineTo(e.x, e.y + 30);
            ctx.lineTo(e.x + 30, e.y + 30);
        } else {
            // Hexagon for standard
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const x = e.x + e.width/2 + Math.cos(angle) * (e.width/2);
                const y = e.y + e.height/2 + Math.sin(angle) * (e.height/2);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Health bar for tank
        if (e.type === 'tank') {
            ctx.fillStyle = '#333';
            ctx.fillRect(e.x, e.y - 10, e.width, 4);
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x, e.y - 10, (e.health / e.maxHealth) * e.width, 4);
        }
    });
    ctx.shadowBlur = 0;

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

  }, [gameState.isGameOver, shieldActive]);

  const loop = useCallback((time: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      update(time);
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  const [levelUpMessage, setLevelUpMessage] = useState(false);

  useEffect(() => {
    if (gameState.level > 1) {
      setLevelUpMessage(true);
      const timer = setTimeout(() => setLevelUpMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.level]);

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {levelUpMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/4 z-30 pointer-events-none"
          >
            <h3 className="text-4xl font-bold glitch-text text-[#FF00FF] uppercase tracking-[0.5em] animate-pulse" data-text="THREAT_LEVEL_INCREASED">
              THREAT_LEVEL_INCREASED
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start font-mono uppercase tracking-widest">
        <div className="flex flex-col gap-2 glass-panel p-3 border-[#00FFFF]/30">
          <div className="flex gap-4 items-center justify-between min-w-[140px]">
            <span className="text-[10px] text-white/50">SCORE</span>
            <span className="text-[#00FFFF] font-bold text-lg">{gameState.score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex gap-4 items-center justify-between">
             <span className="text-[10px] text-white/50">THREAT</span>
             <span className="text-[#FF00FF] font-bold">{gameState.level}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 glass-panel p-3 border-[#FF00FF]/30 min-w-[180px]">
           <div className="flex items-center justify-between mb-1">
             <span className="text-[10px] text-white/50">HULL_INTEGRITY</span>
             <span className={`text-xs ${gameState.health === 1 ? 'text-red-500 animate-pulse' : 'text-[#00FFFF]'}`}>
               {Math.round((gameState.health / gameState.maxHealth) * 100)}%
             </span>
           </div>
           <div className="flex gap-1">
             {[...Array(gameState.maxHealth)].map((_, i) => (
               <div 
                key={i} 
                className={`h-2 flex-1 transition-all duration-500 ${i < gameState.health ? 'bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]' : 'bg-white/10'}`} 
               />
             ))}
           </div>
           {shieldActive && (
             <div className="text-[9px] text-[#00FFFF] mt-1 animate-pulse">
               SHIELD_ACTIVE [ON]
             </div>
           )}
           {rapidFire && (
             <div className="text-[9px] text-[#FFFF00] mt-1 animate-pulse">
               RAPID_FIRE [ACTIVE]
             </div>
           )}
        </div>
      </div>

      <div className="neon-border bg-[#050505] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">
        <canvas 
          ref={canvasRef} 
          className="block cursor-none"
        />
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />
      </div>

      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md z-40"
          >
            <div className="text-center p-10 glass-panel border-[#FF00FF] max-w-sm relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#FF00FF]" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#FF00FF]" />
              
              <h2 className="text-5xl font-bold glitch-text mb-2 text-[#FF00FF]" data-text="TERMINATED">
                TERMINATED
              </h2>
              <p className="text-[10px] font-mono mb-10 text-[#00FFFF]/70 uppercase tracking-[0.3em]">
                CRITICAL_SYSTEM_FAILURE // UPLINK_LOST
              </p>
              
              <div className="mb-10 space-y-4">
                <div className="border-y border-white/10 py-4">
                  <div className="text-[10px] text-white/40 uppercase mb-1">DATA_EXTRACTED</div>
                  <div className="text-4xl font-bold text-[#00FFFF] tracking-tighter">{gameState.score}</div>
                </div>
                <div className="text-[10px] text-white/40 uppercase">MAX_THREAT: LEVEL_{gameState.level}</div>
              </div>

              <button 
                onClick={initGame}
                className="w-full py-4 bg-transparent border-2 border-[#FF00FF] text-[#FF00FF] font-bold uppercase tracking-[0.2em] hover:bg-[#FF00FF] hover:text-[#050505] transition-all duration-300 relative overflow-hidden group"
                id="restart-btn"
              >
                <span className="relative z-10">REBOOT_SENTINEL</span>
                <div className="absolute inset-0 bg-[#FF00FF]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex gap-8 items-center">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
          [A/D] NAVIGATE_VOID
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
          [SPACE] DISCHARGE_PLASMA
        </div>
      </div>
    </div>
  );
}
