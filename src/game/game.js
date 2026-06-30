import { Player, Enemy, Projectile, Particle, Star, Missile } from './entities.js';
import soundManagerInstance from '../audio/SoundManager';

export class Game {
  constructor(canvas, shipConfig = null) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.shipConfig = shipConfig;
    
    // Fixed Virtual Resolution setup (1600x900 coordinate space)
    this.width = 1600;
    this.height = 900;
    this.virtualCanvas = {
      width: this.width,
      height: this.height,
      getBoundingClientRect: () => this.canvas.getBoundingClientRect()
    };
    
    // Resize handler (buffer matches physical resolution * devicePixelRatio for Retina/High-DPI sharpness)
    this.resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = rect.width || window.innerWidth || 1600;
      const targetHeight = rect.height || window.innerHeight || 900;
      
      this.canvas.width = targetWidth * dpr;
      this.canvas.height = targetHeight * dpr;
    };
    this.resize();
    window.addEventListener('resize', this.resize);

    // Input state
    this.input = {
      keys: {},
      touchTarget: null
    };

    window.addEventListener('keydown', e => {
      const key = e.key;
      const lowerKey = key.toLowerCase();
      const upperKey = key.toUpperCase();
      
      if (lowerKey === 'escape' && !this.input.keys['Escape']) {
        window.dispatchEvent(new CustomEvent('toggle-pause'));
      }
      if ((lowerKey === ' ' || lowerKey === 'spacebar' || lowerKey === 'shift' || lowerKey === 'f' || lowerKey === 'e') && this.isRunning && !this.isPaused) {
        // Prevent page scrolling on Spacebar
        if (lowerKey === ' ') e.preventDefault();
        this.activateAbility();
      }
      
      this.input.keys[key] = true;
      this.input.keys[lowerKey] = true;
      this.input.keys[upperKey] = true;
    });
    window.addEventListener('keyup', e => {
      const key = e.key;
      const lowerKey = key.toLowerCase();
      const upperKey = key.toUpperCase();
      
      this.input.keys[key] = false;
      this.input.keys[lowerKey] = false;
      this.input.keys[upperKey] = false;
    });

    window.addEventListener('blur', () => {
      this.input.keys = {};
    });

    // Custom window listener for mobile buttons
    window.addEventListener('activate-ability', () => {
      if (this.isRunning && !this.isPaused) {
        this.activateAbility();
      }
    });

    const getTouchTarget = (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const isPortrait = window.innerHeight > window.innerWidth;
      
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;

      if (isPortrait) {
        // Rotated 90deg clockwise mapping:
        // localX = clientY
        // localY = rect.width - clientX
        const localX = clientY;
        const localY = rect.width - clientX;
        return {
          x: (localX / rect.height) * 1600,
          y: (localY / rect.width) * 900
        };
      } else {
        return {
          x: (clientX / rect.width) * 1600,
          y: (clientY / rect.height) * 900
        };
      }
    };

    // Touch support mapping for mobile
    this.canvas.addEventListener('touchstart', e => {
      this.input.touchTarget = getTouchTarget(e);
    });
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      this.input.touchTarget = getTouchTarget(e);
    }, {passive: false});
    window.addEventListener('touchend', e => {
      this.input.touchTarget = null;
    });

    this.reset();
  }

  reset(level = 1) {
    this.player = new Player(this.virtualCanvas, this.shipConfig);
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.missiles = [];
    this.stars = Array.from({length: 100}, () => new Star(this.virtualCanvas));
    
    this.level = level;
    this.wave = 1;
    const waveCounts = {
      1: 5,
      2: 7,
      3: 8,
      4: 9,
      5: 10,
      6: 10,
      7: 11,
      8: 12,
      9: 13,
      10: 15
    };
    this.targetWave = waveCounts[level] || (level * 5);
    this.score = 0;
    this.money = 0;
    this.lastTime = performance.now();
    this.isRunning = false;
    this.enemySpawnTimer = 0;
    this.enemiesSpawnedThisWave = 0;
    this.isBossSpawned = false;
    this.isLevelBossActive = false;
    this.isPaused = false;
    this.missileCooldown = 4000;   // ms between missile launches
    this.lastMissileTime = 0;

    // Configure active ability based on ship theme and name
    const abilityMap = {
      'starter': { id: 'none', name: 'None', cd: 0, dur: 0, color: 'transparent' },
      'z-51-gen-1': { id: 'nano-blades', name: 'Nano-Blades', cd: 13, dur: 10, color: '#ffd700' },
      'ship-1': { id: 'cryo-shockwave', name: 'Cryo-Shockwave', cd: 10, dur: 6, color: '#00e5ff' },
      'z-51': { id: 'lightning-chain', name: 'Chain Lightning', cd: 10, dur: 0.5, color: '#00e5ff' },
      'spectre': { id: 'laser-beam', name: 'Plasma Laser', cd: 10, dur: 5, color: '#00ff00' },
      'ship-3': { id: 'phase-shift', name: 'Quantum Decoy', cd: 10, dur: 5, color: '#a020f0' },
      'apex': { id: 'chrono-slow', name: 'Chrono Warp', cd: 14, dur: 7, color: '#ff6600' },
      'shadow-stealth-spectre': { id: 'drone-helper', name: 'Drone Helpers', cd: 12, dur: 10, color: '#7b2fff' },
      'gold-eagle': { id: 'deflector-shield', name: 'Mirror Shield', cd: 12, dur: 5, color: '#ffd700' },
      'reaper': { id: 'laser-beam', name: 'Plasma Laser', cd: 10, dur: 5, color: '#ff0033' },
      'ship-5': { id: 'drone-helper', name: 'Quad Heavy Drones', cd: 12, dur: 10, color: '#00ff00' },
      'white-titan-vulcan': { id: 'solar-flare', name: 'Solar Flare', cd: 15, dur: 2.5, color: '#ffffff' }
    };
    
    const config = abilityMap[this.player.id] || { id: 'drone-helper', name: 'Drone Helpers', cd: 20, dur: 8, color: '#66fcf1' };
    this.abilityType = config.id;
    this.abilityName = config.name;
    this.abilityMaxCooldown = config.cd;
    this.abilityDuration = config.dur;
    this.abilityColor = config.color;
    
    this.abilityCooldown = 0;
    this.abilityActiveTimer = 0;
    this.abilityActive = false;
    this.abilityState = {};

    this.updateHUD();
  }

  start(level = 1) {
    this.reset(level);
    this.isRunning = true;
    this.isPaused = false;
    requestAnimationFrame((t) => this.loop(t));
  }

  startFromLoad(jsonData) {
    this.deserialize(jsonData);
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }


  stop() {
    this.isRunning = false;
    // Stop boss alarm if it was playing (player died during a boss fight)
    if (soundManagerInstance) soundManagerInstance.stopBossAlarm();
    window.dispatchEvent(new CustomEvent('game-over', { detail: { wave: this.wave, money: this.money } }));
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now(); // prevent huge dt
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  serialize() {
    // Only save essential state variables
    return JSON.stringify({
      status: 'ACTIVE',
      level: this.level || 1,
      targetWave: this.targetWave || 5,
      wave: this.wave,
      score: this.score,
      money: this.money,
      enemySpawnTimer: this.enemySpawnTimer,
      enemiesSpawnedThisWave: this.enemiesSpawnedThisWave,
      isBossSpawned: this.isBossSpawned,
      isLevelBossActive: this.isLevelBossActive,
      player: {
        x: this.player.x, y: this.player.y,
        hp: this.player.hp, maxHp: this.player.maxHp,
        lastShotTime: this.player.lastShotTime
      },
      enemies: this.enemies.map(e => ({
        x: e.x, y: e.y,
        vx: e.vx, vy: e.vy,
        hp: e.hp, maxHp: e.maxHp,
        isBoss: e.isBoss,
        width: e.width, height: e.height,
        color: e.color,
        speed: e.speed,
        shootCooldown: e.shootCooldown,
        lastShotTime: e.lastShotTime
      })),
      projectiles: this.projectiles.map(p => ({
        x: p.x, y: p.y,
        vx: p.vx, vy: p.vy,
        isEnemy: p.isEnemy, color: p.color, damage: p.damage, style: p.style
      }))
    });
  }

  deserialize(jsonData) {
    const data = JSON.parse(jsonData);
    this.level = data.level || 1;
    this.targetWave = data.targetWave || 5;
    this.wave = data.wave;
    this.score = data.score;
    this.money = data.money || 0;
    this.enemySpawnTimer = data.enemySpawnTimer;
    this.enemiesSpawnedThisWave = data.enemiesSpawnedThisWave || 0;
    this.isBossSpawned = data.isBossSpawned || false;
    this.isLevelBossActive = data.isLevelBossActive || false;
    
    // Restore player
    this.player = new Player(this.virtualCanvas, this.shipConfig);
    Object.assign(this.player, data.player);

    // Restore enemies
    this.enemies = data.enemies.map(edata => {
      // Pass wave=1 just for initialization, we overwrite everything anyway
      const e = new Enemy(this.virtualCanvas, edata.x, edata.y, edata.isBoss, 1);
      Object.assign(e, edata);
      return e;
    });

    // Restore projectiles
    this.projectiles = data.projectiles.map(pdata => {
      const p = new Projectile(pdata.x, pdata.y, pdata.vx, pdata.vy, pdata.isEnemy, pdata.color, 1, pdata.style);
      Object.assign(p, pdata);
      return p;
    });

    // Clear and restore visual only elements
    this.particles = [];
    this.stars = Array.from({length: 100}, () => new Star(this.virtualCanvas));
    
    this.updateHUD();
  }


  updateHUD() {
    console.log('updateHUD called, level:', this.level, 'wave:', this.wave, 'money:', this.money);
    const levelEl = document.getElementById('current-level');
    if (levelEl) levelEl.textContent = this.level || '1';

    const waveEl = document.getElementById('current-wave');
    if (waveEl) waveEl.textContent = this.wave || '1';

    const moneyEl = document.getElementById('current-money');
    if (moneyEl) moneyEl.textContent = this.money || '0';
    
    const hpFill = document.getElementById('hp-bar');
    const hpText = document.getElementById('hp-text');
    if (hpFill) {
      const percentage = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      hpFill.style.width = `${percentage}%`;
      if (hpText) hpText.textContent = `${Math.max(0, Math.round(this.player.hp))} / ${this.player.maxHp}`;
    }

    // Boss HP bar updates
    const activeBoss = this.enemies.find(e => e.hp > 0 && (e.isLevelBoss || e.isBoss));
    const bossContainer = document.getElementById('boss-hp-container');
    const bossFill = document.getElementById('boss-hp-bar');
    const bossText = document.getElementById('boss-hp-text');
    const bossName = document.getElementById('boss-hp-name');

    if (activeBoss) {
      if (bossContainer) {
        bossContainer.style.display = 'flex';
      }
      if (bossName) {
        bossName.textContent = activeBoss.isLevelBoss ? `LEVEL ${this.level} BOSS` : `WAVE ${this.wave} BOSS`;
      }
      if (bossFill) {
        const pct = Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100);
        bossFill.style.width = `${pct}%`;
      }
      if (bossText) {
        bossText.textContent = `${Math.max(0, Math.round(activeBoss.hp))} / ${activeBoss.maxHp}`;
      }
    } else {
      if (bossContainer) {
        bossContainer.style.display = 'none';
      }
    }
  }

  spawnEnemy(dt) {
    if (this.isLevelBossActive) return;

    const totalEnemies = 50 + Math.floor((this.wave - 1) / 2) * 5;
    const bossThreshold = Math.max(1, totalEnemies - 20); // Boss spawns for the last 20 enemies

    if (this.enemiesSpawnedThisWave >= totalEnemies && this.isBossSpawned) return;

    this.enemySpawnTimer += dt;
    
    // Spawn normal enemies
    if (this.enemiesSpawnedThisWave < totalEnemies && this.enemySpawnTimer > Math.max(0.5, 2.0 - (this.wave * 0.15))) {
      this.enemySpawnTimer = 0;
      const x = Math.random() * (this.width - 80) + 40;
      this.enemies.push(new Enemy(this.virtualCanvas, x, -50, false, this.wave, false, this.level));
      this.enemiesSpawnedThisWave++;
    }

    // Boss appears when exactly 20 small enemies are left
    if (this.enemiesSpawnedThisWave === bossThreshold && !this.isBossSpawned) {
      this.isBossSpawned = true;
      this.enemies.push(new Enemy(this.virtualCanvas, this.width/2, -100, true, this.wave, false, this.level));
      this.updateHUD();
      // Play boss warning alarm MP3
      if (soundManagerInstance && !soundManagerInstance.isMuted) {
        soundManagerInstance.playBossAlarm();
      }
    }
  }

  checkCollisions() {
    // AABB Collision
    const intersect = (r1, r2) => {
      return !(r2.x > r1.x + r1.w || 
               r2.x + r2.w < r1.x || 
               r2.y > r1.y + r1.h ||
               r2.y + r2.h < r1.y);
    };

    const playerRect = this.player.getHitbox();
    const isShieldActive = this.abilityActive && this.abilityType === 'deflector-shield';

    // Add generic player crash with enemies
    this.enemies.forEach(enemy => {
        if(intersect(enemy.getHitbox(), playerRect)) {
            if (this.player.isInvulnerable || isShieldActive) {
              enemy.hp -= 50 * this.player.damageMultiplier;
              this.createExplosion(enemy.x, enemy.y, this.abilityColor, 10);
            } else {
              this.player.hp -= Math.max(1, this.player.maxHp * 0.5);
              enemy.hp -= 2;
              this.createExplosion(this.player.x, this.player.y, '#ff0000', 1);
              this.updateHUD();
              if(this.player.hp <= 0) this.stop();
            }
        }
    });

    // Check Level Boss Laser damage to Player
    this.enemies.forEach(enemy => {
      if (enemy.isLevelBoss && enemy.laserStage === 'firing') {
        const time = performance.now();
        if (!enemy.lastLaserDamageTime || time - enemy.lastLaserDamageTime > 100) {
          enemy.lastLaserDamageTime = time;
          const laserOffsets = [-120, 120];
          const laserWidth = 45;
          let hit = false;
          laserOffsets.forEach(offset => {
            const lx = enemy.x + offset;
            if (Math.abs(this.player.x - lx) < (laserWidth/2 + this.player.width/2.5) && this.player.y > enemy.y + 50) {
              hit = true;
            }
          });
          if (hit && !this.player.isInvulnerable) {
            const dmg = Math.max(1, Math.round(this.level / 2));
            this.player.hp -= dmg;
            this.createExplosion(this.player.x, this.player.y - 20, '#ff0033', 3);
            this.updateHUD();
            if (this.player.hp <= 0) this.stop();
          }
        }
      }
    });

    this.projectiles.forEach(proj => {
      const projRect = proj.getHitbox();
      if (proj.isEnemy) {
        // Check if shield deflects it (projects close to player)
        if (isShieldActive && Math.hypot(proj.x - this.player.x, proj.y - this.player.y) < 75) {
          proj.isEnemy = false;
          proj.vy = -Math.abs(proj.vy) * 1.25; // deflect upward
          proj.vx = -proj.vx + (Math.random() - 0.5) * 80; // scatter slightly
          proj.damage = proj.damage * 2.0; // double damage!
          proj.color = '#ffd700'; // mirror shield gold
          this.createExplosion(proj.x, proj.y, '#ffd700', 3);
        } else if (intersect(projRect, playerRect)) {
          if (this.player.isInvulnerable) {
            proj.markedForDeletion = true;
          } else {
            proj.markedForDeletion = true;
            this.player.hp -= proj.damage;
            this.createExplosion(proj.x, proj.y, this.player.color, 5);
            this.updateHUD();
            if (this.player.hp <= 0) this.stop();
          }
        }
      } else {
        this.enemies.forEach(enemy => {
          if (intersect(projRect, enemy.getHitbox())) {
            proj.markedForDeletion = true;
            if (enemy.isLevelBoss && enemy.isShieldActive) {
              this.createExplosion(proj.x, proj.y, '#00e5ff', 3);
              return;
            }
            const finalDamage = enemy.isFrozen ? proj.damage * 1.5 : proj.damage;
            enemy.hp -= finalDamage;
            this.createExplosion(proj.x, proj.y, enemy.isFrozen ? '#00e5ff' : '#ffffff', 3);
            
            if (enemy.hp <= 0 && !enemy.isDead) {
              enemy.isDead = true;
              if (enemy.isLevelBoss) {
                this.money += 2000;
              } else if (enemy.isBoss) {
                if (this.wave <= 2) {
                  this.money += 500;
                } else if (this.wave <= 4) {
                  this.money += 750;
                } else {
                  this.money += 1000;
                }
              } else {
                this.score++;
                this.money += 100;
              }
              this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 100 : 15);
              this.updateHUD(); // Update immediately

              if (enemy.isLevelBoss) {
                // Level Boss Defeated -> Level Complete
                // Stop the looping alarm immediately
                if (soundManagerInstance) soundManagerInstance.stopBossAlarm();
                this.isRunning = false;
                window.dispatchEvent(new CustomEvent('level-complete', { detail: { level: this.level, money: this.money } }));
                return;
              }

              if (enemy.isBoss) {
                if (this.wave >= this.targetWave) {
                  if (!this.isLevelBossActive) {
                    // Final Wave Boss Defeated -> Spawn Level Boss
                    // Stop wave boss alarm — level boss spawn will restart it
                    if (soundManagerInstance) soundManagerInstance.stopBossAlarm();
                    this.isLevelBossActive = true;
                    this.enemies = []; // wipe normal enemies
                    this.projectiles = []; // wipe normal projectiles
                    // Spawn Level Boss
                    this.enemies.push(new Enemy(this.virtualCanvas, this.width/2, -150, false, this.level, true, this.level));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 100); // big heal before boss
                    this.updateHUD();
                    // Play boss warning alarm MP3
                    if (soundManagerInstance && !soundManagerInstance.isMuted) {
                      soundManagerInstance.playBossAlarm();
                    }
                    return;
                  }
                }
                
                // Wave boss defeated (non-final wave) — stop alarm, next wave begins
                if (soundManagerInstance) soundManagerInstance.stopBossAlarm();
                this.wave++;
                this.enemiesSpawnedThisWave = 0;
                this.isBossSpawned = false;
                this.score = 0; // reset local wave score
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50); // Heal
                this.updateHUD();
                
                // Clear remaining projectiles
                this.projectiles = this.projectiles.filter(p => !p.isEnemy);
              }
            }
          }
        });
      }
    });
  }

  checkMissileCollisions() {
    const intersect = (r1, r2) =>
      !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);

    const playerRect = this.player.getHitbox();

    this.missiles.forEach(missile => {
      if (missile.markedForDeletion) return;

      // Player bullet hits missile → reduce missile HP
      this.projectiles.forEach(proj => {
        if (proj.isEnemy || proj.markedForDeletion) return;
        if (intersect(proj.getHitbox(), missile.getHitbox())) {
          proj.markedForDeletion = true;
          missile.hp -= 1;
          this.createExplosion(proj.x, proj.y, '#ff6600', 5);
          if (missile.hp <= 0) {
            missile.markedForDeletion = true;
            this.createExplosion(missile.x, missile.y, '#ff4400', 30);
          }
        }
      });

      // Missile hits player
      if (!missile.markedForDeletion && intersect(missile.getHitbox(), playerRect)) {
        if (this.abilityActive && this.abilityType === 'deflector-shield') {
          // Deflect missile back as a player bullet!
          missile.markedForDeletion = true;
          this.projectiles.push(new Projectile(
            missile.x, missile.y,
            0, -600,
            false, '#ffd700',
            this.player.damageMultiplier * 6.0,
            'spread'
          ));
          this.createExplosion(missile.x, missile.y, '#ffd700', 25);
        } else if (this.player.isInvulnerable) {
          missile.markedForDeletion = true;
          this.createExplosion(missile.x, missile.y, '#ffffff', 10);
        } else {
          missile.markedForDeletion = true;
          this.player.hp -= missile.damage;
          this.createExplosion(missile.x, missile.y, '#ff2200', 40);
          this.updateHUD();
          if (this.player.hp <= 0) this.stop();
        }
      }
    });
  }


  createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  fireProjectiles(dt) {
    const time = performance.now();
    const bulletCount = this.wave <= 2 ? 2 : 4; // waves 1-2: 2 bullets, waves 3-4: 4 bullets
    
    // Player fire
    if (time - this.player.lastShotTime > this.player.shootCooldown) {
      this.player.lastShotTime = time;

      // Play synthesized shooting sound effect (whenever globally unmuted)
      if (soundManagerInstance && soundManagerInstance.audioCtx && !soundManagerInstance.isMuted) {
        soundManagerInstance.createLaserShoot();
      }

      const d = this.player.damageMultiplier;
      const color = this.player.color;
      const style = 'spread';
      const speed = 700;

      if (this.wave <= 2) {
        // 3 bullets: Left, Center, Right with spread
        const angles = [-15, 0, 15];
        const offsets = [-20, 0, 20];
        for (let i = 0; i < 3; i++) {
          const rad = (angles[i] - 90) * Math.PI / 180;
          this.projectiles.push(new Projectile(this.player.x + offsets[i], this.player.y - 20, Math.cos(rad) * speed, Math.sin(rad) * speed, false, color, d, style));
        }
      } else {
        // 5 bullets: -24, -12, 0, 12, 24 deg
        const angles = [-24, -12, 0, 12, 24];
        const offsets = [-30, -15, 0, 15, 30];
        for (let i = 0; i < 5; i++) {
          const rad = (angles[i] - 90) * Math.PI / 180;
          this.projectiles.push(new Projectile(this.player.x + offsets[i], this.player.y - 20, Math.cos(rad) * speed, Math.sin(rad) * speed, false, color, d, style));
        }
      }
    }

    // Reaper wing-mounted missiles (Fired slower, travels slower, with independent cooldown)
    if (this.player.id === 'reaper') {
      if (typeof this.player.lastMissileTime === 'undefined') {
        this.player.lastMissileTime = 0;
      }
      const missileCooldown = 800; // ms between missile shots (delays)
      if (time - this.player.lastMissileTime > missileCooldown) {
        this.player.lastMissileTime = time;
        const d = this.player.damageMultiplier;
        const color = this.player.color;
        // Launch 2 sting missiles spaced 100px apart (50px from center in each direction), with slower speed (-450 velocity)
        this.projectiles.push(new Projectile(this.player.x - 50, this.player.y - 10, 0, -450, false, color, d, 'sting_missile'));
        this.projectiles.push(new Projectile(this.player.x + 50, this.player.y - 10, 0, -450, false, color, d, 'sting_missile'));
      }
    }

    // Enemy fire
    this.enemies.forEach(enemy => {
      if (time - enemy.lastShotTime > enemy.shootCooldown) {
        enemy.lastShotTime = time;
        const c = '#a020f0'; // Purple spread

        // Scale enemy bullet damage dynamically based on current level
        let smallDmg = 1;
        let waveBossDmg = 5;
        let levelBossDmg = 10;

        const lvl = enemy.level || this.level || 1;
        if (lvl >= 8) {
          smallDmg = 5;
          waveBossDmg = 10;
          levelBossDmg = 20;
        } else if (lvl >= 4) {
          smallDmg = 3;
          waveBossDmg = 8;
          levelBossDmg = 15;
        }

        if (enemy.isLevelBoss) {
          // 5-bullet downward V-spread (mirrors player's upward spread pattern)
          const angles = [-24, -12, 0, 12, 24];
          const offsets = [-30, -15, 0, 15, 30];
          const bossSpeed = 500;
          for (let i = 0; i < 5; i++) {
            const rad = (angles[i] + 90) * Math.PI / 180;
            this.projectiles.push(new Projectile(
              enemy.x + offsets[i], enemy.y + 140,
              Math.cos(rad) * bossSpeed, Math.sin(rad) * bossSpeed,
              true, c, levelBossDmg, 'spread'
            ));
          }
          // Homing missile based on boss config
          if (enemy.hasHoming && time - this.lastMissileTime > this.missileCooldown) {
            this.lastMissileTime = time;
            this.missiles.push(new Missile(enemy.x, enemy.y + 160, this.player));
          }
        } else if (enemy.isBoss) {
          // Custom Wave Boss rules based on level and current wave (early: 2 bullets, mid: 3 bullets, final: 3 bullets + homing missile)
          const waveBossConfigs = {
            1: { early: [1, 2], mid: [3, 4], final: [5, 5], dmg: 5 },
            2: { early: [1, 3], mid: [4, 6], final: [7, 7], dmg: 7 },
            3: { early: [1, 3], mid: [4, 6], final: [7, 8], dmg: 7 },
            4: { early: [1, 3], mid: [4, 6], final: [7, 9], dmg: 8 },
            5: { early: [1, 4], mid: [5, 8], final: [9, 10], dmg: 9 },
            6: { early: [1, 4], mid: [5, 8], final: [9, 10], dmg: 10 },
            7: { early: [1, 4], mid: [5, 8], final: [9, 11], dmg: 11 },
            8: { early: [1, 5], mid: [6, 9], final: [10, 12], dmg: 12 },
            9: { early: [1, 5], mid: [6, 9], final: [10, 13], dmg: 13 },
            10: { early: [1, 5], mid: [6, 10], final: [11, 15], dmg: 15 }
          };

          const lvl = enemy.level || this.level || 1;
          const currentWave = enemy.wave || this.wave || 1;
          const cfg = waveBossConfigs[lvl] || { early: [1, 2], mid: [3, 4], final: [5, 5], dmg: 5 };
          const waveBossDmg = cfg.dmg;

          // Determine pattern: 'early', 'mid', or 'final'
          let pattern = 'early';
          if (currentWave >= cfg.early[0] && currentWave <= cfg.early[1]) {
            pattern = 'early';
          } else if (currentWave >= cfg.mid[0] && currentWave <= cfg.mid[1]) {
            pattern = 'mid';
          } else if (currentWave >= cfg.final[0] && currentWave <= cfg.final[1]) {
            pattern = 'final';
          }

          if (pattern === 'early') {
            // 2 bullets: parallel downward
            this.projectiles.push(new Projectile(enemy.x - 30, enemy.y + 100, 0, 500, true, c, waveBossDmg, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 30, enemy.y + 100, 0, 500, true, c, waveBossDmg, 'spread'));
          } else {
            // 'mid' or 'final': 3 bullets downward V-spread
            const angles = [-15, 0, 15];
            const offsets = [-30, 0, 30];
            const bossSpeed = 500;
            for (let i = 0; i < 3; i++) {
              const rad = (angles[i] + 90) * Math.PI / 180;
              this.projectiles.push(new Projectile(
                enemy.x + offsets[i], enemy.y + 100,
                Math.cos(rad) * bossSpeed, Math.sin(rad) * bossSpeed,
                true, c, waveBossDmg, 'spread'
              ));
            }

            // 'final' also fires a homing missile with matching damage (except Level 1)
            if (pattern === 'final' && lvl > 1) {
              this.missiles.push(new Missile(enemy.x, enemy.y + 120, this.player, waveBossDmg));
            }
          }
        } else {
          // Small enemy troops
          const speedY = 450 + (this.wave * 10);
          const enemyBulletCount = this.wave <= 4 ? 2 : 4;

          if (enemyBulletCount === 2) {
            this.projectiles.push(new Projectile(enemy.x - 15, enemy.y + 20, 0, speedY, true, c, smallDmg, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 15, enemy.y + 20, 0, speedY, true, c, smallDmg, 'spread'));
          } else {
            this.projectiles.push(new Projectile(enemy.x - 20, enemy.y + 20, 0, speedY, true, c, smallDmg, 'spread'));
            this.projectiles.push(new Projectile(enemy.x - 7,  enemy.y + 20, 0, speedY, true, c, smallDmg, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 7,  enemy.y + 20, 0, speedY, true, c, smallDmg, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 20, enemy.y + 20, 0, speedY, true, c, smallDmg, 'spread'));
          }
        }
      }
    });
  }

  activateAbility() {
    if (this.abilityCooldown > 0 || this.abilityActive) return;
    if (!this.abilityType || this.abilityType === 'none') return;

    this.abilityActive = true;
    this.abilityActiveTimer = this.abilityDuration;

    switch (this.abilityType) {
      case 'lightning-chain': {
        // Build the chain of enemies starting from the player ship's center/weapon muzzle
        const remaining = [...this.enemies].filter(e => e.hp > 0 && e.y > -50 && e.y < 950);
        const targetChain = [];
        let currentPoint = { x: this.player.x, y: this.player.y - 20 };
        
        while (remaining.length > 0) {
          let closestIdx = -1;
          let closestDist = Infinity;
          for (let i = 0; i < remaining.length; i++) {
            const dx = remaining[i].x - currentPoint.x;
            const dy = remaining[i].y - currentPoint.y;
            const dist = dx * dx + dy * dy;
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = i;
            }
          }
          if (closestIdx !== -1) {
            const nextEnemy = remaining.splice(closestIdx, 1)[0];
            targetChain.push(nextEnemy);
            currentPoint = { x: nextEnemy.x, y: nextEnemy.y };
          } else {
            break;
          }
        }

        this.abilityState = {
          targets: targetChain,
          timer: 0.5
        };

        targetChain.forEach(enemy => {
          enemy.hp -= 300;
          this.createExplosion(enemy.x, enemy.y, this.abilityColor, 15);
          if (enemy.hp <= 0 && !enemy.isDead) {
            enemy.isDead = true;
            this.score += enemy.isLevelBoss ? 0 : (enemy.isBoss ? 0 : 1);
            this.money += enemy.isLevelBoss ? 2000 : (enemy.isBoss ? 500 : 100);
          }
        });
        this.updateHUD();
        this.abilityActive = false;
        this.abilityCooldown = this.abilityMaxCooldown;
        break;
      }

      case 'laser-beam': {
        this.abilityState = { damageTimer: 0 };
        break;
      }

      case 'drone-helper': {
        this.abilityState = {
          drones: [
            // Left side — front and rear
            { offset: { x: -90,  y: -30 }, lastShot: 0, angle: 0 },
            { offset: { x: -115, y:  35 }, lastShot: 0, angle: Math.PI },
            // Right side — front and rear
            { offset: { x:  90,  y: -30 }, lastShot: 0, angle: 0 },
            { offset: { x:  115, y:  35 }, lastShot: 0, angle: Math.PI }
          ]
        };
        break;
      }

      case 'chrono-slow': {
        break;
      }

      case 'gravity-singularity': {
        const startX = this.player.x;
        const startY = this.player.y - 30;
        const targetX = this.width / 2;
        const targetY = this.height / 2 - 100;
        this.abilityState = {
          stage: 'projectile',
          x: startX,
          y: startY,
          vx: (targetX - startX) * 1.5,
          vy: (targetY - startY) * 1.5,
          targetX: targetX,
          targetY: targetY,
          timer: 0.66,
          singularityTimer: 4.0,
          pullRadius: 180,
          damageTimer: 0
        };
        break;
      }

      case 'deflector-shield': {
        break;
      }

      case 'nano-blades': {
        this.abilityState = {
          angle: 0,
          bladesCount: 6,
          radius: 100,
          contacts: {}
        };
        break;
      }

      case 'phase-shift': {
        const startX = this.player.x;
        const startY = this.player.y;
        this.player.y = Math.max(this.player.height/2 + 20, this.player.y - 180);
        this.abilityState = {
          decoyX: startX,
          decoyY: startY,
          timer: 3.0,
          exploded: false
        };
        this.player.isInvulnerable = true;
        break;
      }

      case 'cryo-shockwave': {
        this.abilityState = {
          radius: 0,
          maxRadius: Math.max(this.width, this.height),
          speed: 1500
        };
        this.enemies.forEach(enemy => {
          enemy.isFrozen = true;
          enemy.freezeTimer = 4.0;
        });
        break;
      }

      case 'solar-flare': {
        const strikes = [];
        for (let i = 0; i < 8; i++) {
          const targetX = Math.random() * (this.width - 100) + 50;
          strikes.push({
            x: targetX,
            delay: 0.3 + i * 0.25,
            struck: false,
            strikeDuration: 0.4
          });
        }
        this.abilityState = {
          strikes: strikes,
          timer: 2.5
        };
        break;
      }
    }

    this.createExplosion(this.player.x, this.player.y, this.abilityColor, 30);
  }

  updateAbility(dt) {
    if (this.abilityCooldown > 0) {
      this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
      const cdLeft = document.getElementById('ability-cooldown-left');
      const cdRight = document.getElementById('ability-cooldown-right');
      const text = this.abilityCooldown > 0 ? Math.ceil(this.abilityCooldown) : '';
      if (cdLeft) cdLeft.textContent = text;
      if (cdRight) cdRight.textContent = text;
    }

    if (!this.abilityActive) return;

    this.abilityActiveTimer = Math.max(0, this.abilityActiveTimer - dt);
    
    // Custom check for instant/special abilities to end active phase
    if (this.abilityActiveTimer <= 0 && this.abilityType !== 'gravity-singularity' && this.abilityType !== 'solar-flare' && this.abilityType !== 'cryo-shockwave') {
      this.abilityActive = false;
      this.abilityCooldown = this.abilityMaxCooldown;
      if (this.abilityType === 'phase-shift') {
        this.player.isInvulnerable = false;
      }
      return;
    }

    const time = performance.now();

    switch (this.abilityType) {
      case 'laser-beam': {
        this.abilityState.damageTimer += dt;
        if (this.abilityState.damageTimer >= 0.1) {
          this.abilityState.damageTimer = 0;
          const laserX = this.player.x;
          const laserWidth = 45;
          this.enemies.forEach(enemy => {
            if (Math.abs(enemy.x - laserX) < (enemy.width/2 + laserWidth/2) && enemy.y < this.player.y) {
              enemy.hp -= 50 * this.player.damageMultiplier;
              this.createExplosion(enemy.x, enemy.y + enemy.height/4, '#ffffff', 2);
              if (enemy.hp <= 0 && !enemy.isDead) {
                enemy.isDead = true;
                this.score += enemy.isLevelBoss ? 0 : (enemy.isBoss ? 0 : 1);
                this.money += enemy.isLevelBoss ? 2000 : (enemy.isBoss ? 500 : 100);
              }
            }
          });
          this.updateHUD();
        }
        break;
      }

      case 'drone-helper': {
        const drones = this.abilityState.drones;
        drones.forEach(drone => {
          drone.angle += dt * 3;
          if (time - drone.lastShot > 250) {
            drone.lastShot = time;
            let nearestEnemy = null;
            let minDist = 99999;
            this.enemies.forEach(enemy => {
              if (enemy.hp > 0 && enemy.y > 0 && enemy.y < this.height) {
                const dist = Math.hypot(enemy.x - (this.player.x + drone.offset.x), enemy.y - (this.player.y - drone.offset.y));
                if (dist < minDist) {
                  minDist = dist;
                  nearestEnemy = enemy;
                }
              }
            });
            if (nearestEnemy) {
              const dx = nearestEnemy.x - (this.player.x + drone.offset.x);
              const dy = nearestEnemy.y - (this.player.y - drone.offset.y);
              const dist = Math.hypot(dx, dy);
              const speed = 800;
              const vx = (dx / dist) * speed;
              const vy = (dy / dist) * speed;
              this.projectiles.push(new Projectile(
                this.player.x + drone.offset.x,
                this.player.y - drone.offset.y,
                vx, vy, false, this.abilityColor, this.player.damageMultiplier * 1.5, 'default'
              ));
            }
          }
        });
        break;
      }

      case 'nano-blades': {
        this.abilityState.angle += dt * 5;
        const angle = this.abilityState.angle;
        const bladesCount = this.abilityState.bladesCount;
        const radius = this.abilityState.radius;
        const contacts = this.abilityState.contacts;

        this.projectiles.forEach(proj => {
          if (proj.isEnemy) {
            for (let i = 0; i < bladesCount; i++) {
              const bAngle = angle + (i * Math.PI * 2 / bladesCount);
              const bX = this.player.x + Math.cos(bAngle) * radius;
              const bY = this.player.y + Math.sin(bAngle) * radius;
              if (Math.hypot(proj.x - bX, proj.y - bY) < 25) {
                proj.markedForDeletion = true;
                this.createExplosion(proj.x, proj.y, this.abilityColor, 3);
                break;
              }
            }
          }
        });

        this.enemies.forEach(enemy => {
          const enemyRect = enemy.getHitbox();
          for (let i = 0; i < bladesCount; i++) {
            const bAngle = angle + (i * Math.PI * 2 / bladesCount);
            const bX = this.player.x + Math.cos(bAngle) * radius;
            const bY = this.player.y + Math.sin(bAngle) * radius;
            if (bX > enemyRect.x && bX < enemyRect.x + enemyRect.w &&
                bY > enemyRect.y && bY < enemyRect.y + enemyRect.h) {
              const cid = `${enemy.x}_${enemy.y}_${i}`;
              if (!contacts[cid] || time - contacts[cid] > 200) {
                contacts[cid] = time;
                enemy.hp -= 150 * this.player.damageMultiplier;
                this.createExplosion(bX, bY, this.abilityColor, 5);
                if (enemy.hp <= 0 && !enemy.isDead) {
                  enemy.isDead = true;
                  this.score += enemy.isLevelBoss ? 0 : (enemy.isBoss ? 0 : 1);
                  this.money += enemy.isLevelBoss ? 2000 : (enemy.isBoss ? 500 : 100);
                }
              }
            }
          }
        });
        this.updateHUD();
        break;
      }

      case 'gravity-singularity': {
        const state = this.abilityState;
        if (state.stage === 'projectile') {
          state.x += state.vx * dt;
          state.y += state.vy * dt;
          state.timer -= dt;
          if (state.timer <= 0) {
            state.stage = 'singularity';
            state.x = state.targetX;
            state.y = state.targetY;
            this.createExplosion(state.x, state.y, this.abilityColor, 40);
          }
        } else if (state.stage === 'singularity') {
          state.singularityTimer -= dt;
          this.enemies.forEach(enemy => {
            if (!enemy.isLevelBoss && !enemy.isBoss) {
              const dx = state.x - enemy.x;
              const dy = state.y - enemy.y;
              const dist = Math.hypot(dx, dy);
              if (dist < state.pullRadius) {
                const force = (1 - dist / state.pullRadius) * 250;
                enemy.x += (dx / dist) * force * dt;
                enemy.y += (dy / dist) * force * dt;
              }
            }
          });
          this.projectiles.forEach(proj => {
            if (proj.isEnemy) {
              const dx = state.x - proj.x;
              const dy = state.y - proj.y;
              const dist = Math.hypot(dx, dy);
              if (dist < state.pullRadius) {
                const force = (1 - dist / state.pullRadius) * 400;
                proj.x += (dx / dist) * force * dt;
                proj.y += (dy / dist) * force * dt;
                if (dist < 30) {
                  proj.markedForDeletion = true;
                  this.createExplosion(proj.x, proj.y, this.abilityColor, 2);
                }
              }
            }
          });
          state.damageTimer += dt;
          if (state.damageTimer >= 0.1) {
            state.damageTimer = 0;
            this.enemies.forEach(enemy => {
              const dist = Math.hypot(state.x - enemy.x, state.y - enemy.y);
              if (dist < 100) {
                enemy.hp -= 25 * this.player.damageMultiplier;
                this.createExplosion(enemy.x, enemy.y, this.abilityColor, 2);
                if (enemy.hp <= 0 && !enemy.isDead) {
                  enemy.isDead = true;
                  this.score += enemy.isLevelBoss ? 0 : (enemy.isBoss ? 0 : 1);
                  this.money += enemy.isLevelBoss ? 2000 : (enemy.isBoss ? 500 : 100);
                }
              }
            });
            this.updateHUD();
          }
          if (state.singularityTimer <= 0) {
            this.abilityActive = false;
            this.abilityCooldown = this.abilityMaxCooldown;
          }
        }
        break;
      }

      case 'phase-shift': {
        const state = this.abilityState;
        state.timer -= dt;
        if (state.timer <= 0 && !state.exploded) {
          state.exploded = true;
          this.createExplosion(state.decoyX, state.decoyY, this.abilityColor, 60);
          this.enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - state.decoyX, enemy.y - state.decoyY);
            if (dist < 150) {
              enemy.hp -= 400 * this.player.damageMultiplier;
              if (enemy.hp <= 0 && !enemy.isDead) {
                enemy.isDead = true;
                this.score += enemy.isLevelBoss ? 0 : (enemy.isBoss ? 0 : 1);
                this.money += enemy.isLevelBoss ? 2000 : (enemy.isBoss ? 500 : 100);
              }
            }
          });
          this.projectiles.forEach(proj => {
            if (proj.isEnemy) {
              const dist = Math.hypot(proj.x - state.decoyX, proj.y - state.decoyY);
              if (dist < 150) {
                proj.markedForDeletion = true;
              }
            }
          });
          this.updateHUD();
          this.player.isInvulnerable = false;
          this.abilityActive = false;
          this.abilityCooldown = this.abilityMaxCooldown;
        }
        break;
      }

      case 'cryo-shockwave': {
        const state = this.abilityState;
        state.radius += state.speed * dt;
        if (state.radius >= state.maxRadius) {
          this.abilityActive = false;
          this.abilityCooldown = this.abilityMaxCooldown;
        }
        break;
      }

      case 'solar-flare': {
        const state = this.abilityState;
        state.timer -= dt;
        state.strikes.forEach(strike => {
          if (!strike.struck) {
            strike.delay -= dt;
            if (strike.delay <= 0) {
              strike.struck = true;
              const laserX = strike.x;
              const laserWidth = 75;
              this.enemies.forEach(enemy => {
                if (Math.abs(enemy.x - laserX) < (enemy.width/2 + laserWidth/2)) {
                  enemy.hp -= 600 * this.player.damageMultiplier;
                  this.createExplosion(enemy.x, enemy.y, '#ffd700', 30);
                  if (enemy.hp <= 0 && !enemy.isDead) {
                    enemy.isDead = true;
                    this.score += enemy.isLevelBoss ? 0 : (enemy.isBoss ? 0 : 1);
                    this.money += enemy.isLevelBoss ? 2000 : (enemy.isBoss ? 500 : 100);
                  }
                }
              });
              this.projectiles.forEach(proj => {
                if (proj.isEnemy && Math.abs(proj.x - laserX) < laserWidth) {
                  proj.markedForDeletion = true;
                }
              });
              this.updateHUD();
            }
          } else {
            strike.strikeDuration -= dt;
          }
        });
        if (state.timer <= 0) {
          this.abilityActive = false;
          this.abilityCooldown = this.abilityMaxCooldown;
        }
        break;
      }
    }
  }

  drawAbility(ctx, dt) {
    if (this.abilityState && this.abilityType === 'lightning-chain' && this.abilityState.timer > 0) {
      this.abilityState.timer -= dt;
      const targets = this.abilityState.targets;
      if (targets && targets.length > 0) {
        ctx.save();
        
        // Helper to draw a single jagged line between two points
        const drawLightningLine = (x1, y1, x2, y2, displace = 30) => {
          const points = [{x: x1, y: y1}];
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.hypot(dx, dy);
          const segments = Math.max(5, Math.floor(dist / 35));
          
          for (let i = 1; i < segments; i++) {
            const ratio = i / segments;
            const px = x1 + dx * ratio;
            const py = y1 + dy * ratio;
            const perpX = -dy / dist;
            const perpY = dx / dist;
            
            // Random displacement that peaks in the middle and tapers off near endpoints
            const factor = Math.sin(ratio * Math.PI);
            const offset = (Math.random() - 0.5) * displace * factor;
            points.push({
              x: px + perpX * offset,
              y: py + perpY * offset
            });
          }
          points.push({x: x2, y: y2});
          
          // Draw the calculated path
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
          
          return points;
        };

        const drawBolt = (x1, y1, x2, y2) => {
          // 1. Draw outer cyan glow
          ctx.strokeStyle = '#00f0ff';
          ctx.shadowColor = '#00aeff';
          ctx.shadowBlur = 25;
          ctx.lineWidth = 6;
          const mainPoints = drawLightningLine(x1, y1, x2, y2, 45);
          
          // Draw branching sub-arcs branching off from random points on the main path
          mainPoints.forEach((p, idx) => {
            if (idx > 0 && idx < mainPoints.length - 1 && Math.random() < 0.25) {
              const angle = Math.random() * Math.PI * 2;
              const branchLength = 20 + Math.random() * 40;
              const bx = p.x + Math.cos(angle) * branchLength;
              const by = p.y + Math.sin(angle) * branchLength;
              
              ctx.save();
              ctx.lineWidth = 3.5;
              ctx.strokeStyle = '#00c3ff';
              drawLightningLine(p.x, p.y, bx, by, 15);
              ctx.restore();
            }
          });
          
          // 2. Draw inner white core
          ctx.strokeStyle = '#ffffff';
          ctx.shadowBlur = 0; // Turn off shadows for the core to make it look sharp
          ctx.lineWidth = 2;
          drawLightningLine(x1, y1, x2, y2, 45);
        };

        // Draw lightning bolts chaining from player to targets in sequence (Chain topology)
        let currentX = this.player.x;
        let currentY = this.player.y - 20;

        targets.forEach(target => {
          drawBolt(currentX, currentY, target.x, target.y);
          
          // Draw an additional parallel chaotic bolt for an intense electric display
          if (Math.random() < 0.5) {
            drawBolt(currentX, currentY, target.x + (Math.random() - 0.5) * 20, target.y + (Math.random() - 0.5) * 20);
          }

          // Advance chain starting point to current target
          currentX = target.x;
          currentY = target.y;
        });
        
        ctx.restore();
      }
    }

    if (!this.abilityActive) return;

    switch (this.abilityType) {
      case 'laser-beam': {
        // Laser is drawn BEFORE the player in the main loop so the ship renders on top.
        // Nothing to draw here.
        break;
      }

      case 'drone-helper': {
        if (!this.abilityState.drones) break;
        ctx.save();

        if (!this.droneImage) {
          this.droneImage = new Image();
          this.droneImage.src = '/player craftship/Drone.png';
        }

        this.abilityState.drones.forEach(drone => {
          const droneX = this.player.x + drone.offset.x;
          const droneY = this.player.y - drone.offset.y;

          if (this.droneImage.complete && this.droneImage.naturalWidth > 0) {
            // Draw a small thruster flame below the drone image
            ctx.fillStyle = '#ff5500';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff5500';
            ctx.beginPath();
            ctx.arc(droneX, droneY + 18 + Math.random() * 3, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset shadows for the image
            ctx.shadowBlur = 0;

            // Draw the Drone image (40x40) centered at (droneX, droneY)
            ctx.drawImage(this.droneImage, droneX - 20, droneY - 20, 40, 40);
          } else {
            // Fallback to original vector shapes if image is loading
            ctx.fillStyle = '#0b0c10';
            ctx.strokeStyle = this.abilityColor;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.abilityColor;
            ctx.beginPath();
            ctx.arc(droneX, droneY, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(droneX, droneY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0055';
            ctx.beginPath();
            ctx.arc(droneX, droneY + 12 + Math.random()*3, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
        break;
      }

      case 'chrono-slow': {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 102, 255, 0.12)';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.width/2, this.height/2, 100 + (Math.sin(performance.now() / 200) * 20), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'gravity-singularity': {
        const state = this.abilityState;
        ctx.save();
        if (state.stage === 'projectile') {
          ctx.fillStyle = '#ffd700';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ffaa00';
          ctx.beginPath();
          ctx.arc(state.x, state.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(state.x, state.y, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (state.stage === 'singularity') {
          const rad = 70 + Math.sin(performance.now() / 100) * 15;
          const grad = ctx.createRadialGradient(state.x, state.y, 10, state.x, state.y, rad);
          grad.addColorStop(0, '#000000');
          grad.addColorStop(0.3, '#7b2fff');
          grad.addColorStop(0.7, '#ff0055');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(state.x, state.y, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(state.x, state.y, 30, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 'deflector-shield': {
        ctx.save();
        ctx.strokeStyle = this.abilityColor;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.abilityColor;
        ctx.beginPath();
        const sides = 6;
        const radius = 65;
        for (let i = 0; i <= sides; i++) {
          const angle = (i * Math.PI * 2 / sides) + (performance.now() / 1000);
          const sx = this.player.x + Math.cos(angle) * radius;
          const sy = this.player.y + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'nano-blades': {
        const state = this.abilityState;
        ctx.save();
        const bladesCount = state.bladesCount;
        const angle = state.angle;
        const radius = state.radius;
        for (let i = 0; i < bladesCount; i++) {
          const bAngle = angle + (i * Math.PI * 2 / bladesCount);
          const bX = this.player.x + Math.cos(bAngle) * radius;
          const bY = this.player.y + Math.sin(bAngle) * radius;
          ctx.fillStyle = this.abilityColor;
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.abilityColor;
          ctx.save();
          ctx.translate(bX, bY);
          ctx.rotate(bAngle + Math.PI/2);
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(4, 3);
          ctx.lineTo(0, 0);
          ctx.lineTo(-4, 3);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, -3, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
        break;
      }

      case 'phase-shift': {
        const state = this.abilityState;
        ctx.save();
        ctx.strokeStyle = 'rgba(123, 47, 255, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(state.decoyX, state.decoyY);
        ctx.lineTo(this.player.x, this.player.y);
        ctx.stroke();
        ctx.globalAlpha = 0.4 + Math.random() * 0.3;
        ctx.translate(state.decoyX, state.decoyY);
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.abilityColor;
        if (this.player.drawPath) {
          this.player.drawPath(ctx, this.player.width, this.player.height, this.abilityColor);
        } else {
          ctx.strokeStyle = this.abilityColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -this.player.height / 2);
          ctx.lineTo(this.player.width / 2, this.player.height / 2);
          ctx.lineTo(0, this.player.height / 4);
          ctx.lineTo(-this.player.width / 2, this.player.height / 2);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 'cryo-shockwave': {
        const state = this.abilityState;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
        ctx.lineWidth = 6;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00e5ff';
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, state.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'solar-flare': {
        const state = this.abilityState;
        ctx.save();
        state.strikes.forEach(strike => {
          if (!strike.struck) {
            ctx.strokeStyle = 'rgba(255, 0, 50, 0.8)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0033';
            const x = strike.x;
            const pulse = 10 + Math.sin(performance.now() / 50) * 5;
            ctx.beginPath();
            ctx.moveTo(x - pulse, 0);
            ctx.lineTo(x - pulse, this.height);
            ctx.moveTo(x + pulse, 0);
            ctx.lineTo(x + pulse, this.height);
            ctx.stroke();
          } else if (strike.strikeDuration > 0) {
            const width = 60 * (strike.strikeDuration / 0.4);
            const grad = ctx.createLinearGradient(strike.x - width/2, 0, strike.x + width/2, 0);
            grad.addColorStop(0, 'rgba(255, 50, 0, 0)');
            grad.addColorStop(0.3, '#ffaa00');
            grad.addColorStop(0.5, '#ffffff');
            grad.addColorStop(0.7, '#ffaa00');
            grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = grad;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff3300';
            ctx.fillRect(strike.x - width/2, 0, width, this.height);
          }
        });
        ctx.restore();
        break;
      }
    }
  }

  loop(timestamp) {
    if (!this.isRunning || this.isPaused) return;

    if (!this.lastTime || isNaN(this.lastTime)) this.lastTime = performance.now();
    let dt = (timestamp - this.lastTime) / 1000;
    if (isNaN(dt) || dt < 0) dt = 0.016;
    if (dt > 0.1) dt = 0.1; // Cap dt for lagging
    this.lastTime = timestamp;

    try {
      // Emergency canvas size fallback
      if (!this.canvas.width || this.canvas.width === 0) {
        this.resize();
      }

      // Check if time-slow (Chrono Warp) is active
      const isSlow = this.abilityActive && this.abilityType === 'chrono-slow';
      const enemyDt = isSlow ? dt * 0.3 : dt;

      // Update
      this.stars.forEach(s => s.update(dt));
      if (this.player) this.player.update(dt, this.input);
      
      this.spawnEnemy(enemyDt);
      
      this.enemies.forEach(e => e.update(enemyDt));
      this.projectiles.forEach(p => p.update(p.isEnemy ? enemyDt : dt, this.enemies));
      this.particles.forEach(p => p.update(dt));
      
      // Pass decoy reference to missile update if active
      const decoyTarget = (this.abilityActive && this.abilityType === 'phase-shift' && this.abilityState && !this.abilityState.exploded) ? {
        x: this.abilityState.decoyX,
        y: this.abilityState.decoyY,
        hp: 1,
        width: 80,
        height: 80
      } : null;
      this.missiles.forEach(m => m.update(enemyDt, decoyTarget));

      // Update active ability states and countdowns
      this.updateAbility(dt);

      this.fireProjectiles(dt);
      this.checkCollisions();
      this.checkMissileCollisions();

      // Cleanup dead entities using logical coordinates
      this.enemies = this.enemies.filter(e => e.hp > 0 && e.y < this.height + 100);
      this.projectiles = this.projectiles.filter(p => !p.markedForDeletion && p.y > -50 && p.y < this.height + 50 && p.x > -50 && p.x < this.width + 50);
      this.particles = this.particles.filter(p => p.life > 0);
      this.missiles = this.missiles.filter(m => !m.markedForDeletion && m.y < this.height + 100);

      // Draw - First clear the entire physical canvas
      this.ctx.fillStyle = '#0b0c10';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Save context state and scale for logical drawing
      this.ctx.save();
      const scaleX = this.canvas.width / this.width;
      const scaleY = this.canvas.height / this.height;
      this.ctx.scale(scaleX, scaleY);

      this.stars.forEach(s => s.draw(this.ctx));
      this.particles.forEach(p => p.draw(this.ctx));
      this.projectiles.forEach(p => p.draw(this.ctx));
      this.missiles.forEach(m => m.draw(this.ctx));
      this.enemies.forEach(e => e.draw(this.ctx));
      // Draw laser-beam BEHIND the player so the ship sits on top of it
      if (this.abilityActive && this.abilityType === 'laser-beam' && this.player) {
        const ctx = this.ctx;
        ctx.save();
        const laserX = this.player.x;
        // Dynamic offset to match the ship's nose tip (reaper has more padding at the top of its PNG)
        const offset = this.player.id === 'reaper' ? 30 : 75;
        const startY = this.player.y - offset;
        const laserWidth = 35 + Math.random() * 15;

        // Dynamic color support based on active ship color (green for Spectre, red for Reaper)
        const baseColor = this.abilityColor || '#00ff00';
        let glowColor = 'rgba(0, 255, 0, 0.3)';
        if (baseColor.startsWith('#')) {
          const r = parseInt(baseColor.slice(1, 3), 16);
          const g = parseInt(baseColor.slice(3, 5), 16);
          const b = parseInt(baseColor.slice(5, 7), 16);
          glowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
        }

        ctx.fillStyle = glowColor;
        ctx.shadowBlur = 30;
        ctx.shadowColor = baseColor;
        ctx.fillRect(laserX - laserWidth / 2, 0, laserWidth, startY);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fillRect(laserX - laserWidth / 4, 0, laserWidth / 2, startY);
        ctx.restore();
      }

      if (this.player) this.player.draw(this.ctx);

      // Draw all other ability visual effects on top of the player
      this.drawAbility(this.ctx, dt);

      // Restore drawing context state
      this.ctx.restore();

    } catch (e) {
      console.error('Game Loop Error:', e);
      this.ctx.fillStyle = 'red';
      this.ctx.font = '20px sans-serif';
      this.ctx.fillText(`ERROR: ${e.message}`, 20, 150);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}
