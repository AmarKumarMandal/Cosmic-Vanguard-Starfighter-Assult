import { Player, Enemy, Projectile, Particle, Star, Missile } from './entities.js';

export class Game {
  constructor(canvas, shipConfig = null) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.shipConfig = shipConfig;
    
    // Resize handling
    this.resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', this.resize);
    this.resize();

    // Input state
    this.input = {
      keys: {},
      touchTarget: null
    };

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !this.input.keys[e.key]) {
        window.dispatchEvent(new CustomEvent('toggle-pause'));
      }
      this.input.keys[e.key] = true;
    });
    window.addEventListener('keyup', e => this.input.keys[e.key] = false);

    // Touch support mapping for mobile
    this.canvas.addEventListener('touchstart', e => {
      this.input.touchTarget = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      this.input.touchTarget = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, {passive: false});
    window.addEventListener('touchend', e => {
      this.input.touchTarget = null;
    });

    this.reset();
  }

  reset(level = 1) {
    this.player = new Player(this.canvas, this.shipConfig);
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.missiles = [];
    this.stars = Array.from({length: 100}, () => new Star(this.canvas));
    
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
    this.player = new Player(this.canvas, this.shipConfig);
    Object.assign(this.player, data.player);

    // Restore enemies
    this.enemies = data.enemies.map(edata => {
      // Pass wave=1 just for initialization, we overwrite everything anyway
      const e = new Enemy(this.canvas, edata.x, edata.y, edata.isBoss, 1);
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
    this.stars = Array.from({length: 100}, () => new Star(this.canvas));
    
    this.updateHUD();
  }


  updateHUD() {
    console.log('updateHUD called, wave:', this.wave, 'money:', this.money);
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
      const x = Math.random() * (this.canvas.width - 80) + 40;
      this.enemies.push(new Enemy(this.canvas, x, -50, false, this.wave, false, this.level));
      this.enemiesSpawnedThisWave++;
    }

    // Boss appears when exactly 20 small enemies are left
    if (this.enemiesSpawnedThisWave === bossThreshold && !this.isBossSpawned) {
      this.isBossSpawned = true;
      this.enemies.push(new Enemy(this.canvas, this.canvas.width/2, -100, true, this.wave, false, this.level));
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

    // Add generic player crash with enemies
    this.enemies.forEach(enemy => {
        if(intersect(enemy.getHitbox(), playerRect)) {
            this.player.hp -= Math.max(1, this.player.maxHp * 0.5);
            enemy.hp -= 2;
            this.createExplosion(this.player.x, this.player.y, '#ff0000', 1);
            this.updateHUD();
            if(this.player.hp <= 0) this.stop();
        }
    });

    this.projectiles.forEach(proj => {
      const projRect = proj.getHitbox();
      if (proj.isEnemy) {
        if (intersect(projRect, playerRect)) {
          proj.markedForDeletion = true;
          // Dynamically strip exactly 1% from any size hull to prevent serialized bullet bugs
          this.player.hp -= proj.damage;
          this.createExplosion(proj.x, proj.y, this.player.color, 5);
          this.updateHUD();
          if (this.player.hp <= 0) this.stop();
        }
      } else {
        this.enemies.forEach(enemy => {
          if (intersect(projRect, enemy.getHitbox())) {
            proj.markedForDeletion = true;
            enemy.hp -= proj.damage;
            this.createExplosion(proj.x, proj.y, '#ffffff', 3);
            
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
                this.isRunning = false;
                window.dispatchEvent(new CustomEvent('level-complete', { detail: { level: this.level, money: this.money } }));
                return;
              }

              if (enemy.isBoss) {
                if (this.wave >= this.targetWave) {
                  if (!this.isLevelBossActive) {
                    // Final Wave Boss Defeated -> Spawn Level Boss
                    this.isLevelBossActive = true;
                    this.enemies = []; // wipe normal enemies
                    this.projectiles = []; // wipe normal projectiles
                    // Spawn Level Boss
                    this.enemies.push(new Enemy(this.canvas, this.canvas.width/2, -150, false, this.level, true, this.level));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 100); // big heal before boss
                    this.updateHUD();
                    return;
                  }
                }
                
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
        missile.markedForDeletion = true;
        this.player.hp -= missile.damage;
        this.createExplosion(missile.x, missile.y, '#ff2200', 40);
        this.updateHUD();
        if (this.player.hp <= 0) this.stop();
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

    // Enemy fire
    this.enemies.forEach(enemy => {
      if (time - enemy.lastShotTime > enemy.shootCooldown) {
        enemy.lastShotTime = time;
        const c = '#a020f0'; // Purple spread

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
              true, c, 10, 'spread'
            ));
          }
          // Homing missile on separate slow cooldown (Only for Level 2 and above)
          if (this.level > 1 && time - this.lastMissileTime > this.missileCooldown) {
            this.lastMissileTime = time;
            this.missiles.push(new Missile(enemy.x, enemy.y + 160, this.player));
          }
        } else if (enemy.isBoss) {
          if (bulletCount === 2) {
            this.projectiles.push(new Projectile(enemy.x - 30, enemy.y + 100, 0, 500, true, c, 5, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 30, enemy.y + 100, 0, 500, true, c, 5, 'spread'));
          } else {
            this.projectiles.push(new Projectile(enemy.x - 60, enemy.y + 100, 0, 500, true, c, 5, 'spread'));
            this.projectiles.push(new Projectile(enemy.x - 20, enemy.y + 100, 0, 500, true, c, 5, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 20, enemy.y + 100, 0, 500, true, c, 5, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 60, enemy.y + 100, 0, 500, true, c, 5, 'spread'));
          }
        } else {
          // Small enemy troops
          const speedY = 450 + (this.wave * 10);
          const enemyBulletCount = this.wave <= 4 ? 2 : 4;

          if (enemyBulletCount === 2) {
            this.projectiles.push(new Projectile(enemy.x - 15, enemy.y + 20, 0, speedY, true, c, 1, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 15, enemy.y + 20, 0, speedY, true, c, 1, 'spread'));
          } else {
            this.projectiles.push(new Projectile(enemy.x - 20, enemy.y + 20, 0, speedY, true, c, 1, 'spread'));
            this.projectiles.push(new Projectile(enemy.x - 7,  enemy.y + 20, 0, speedY, true, c, 1, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 7,  enemy.y + 20, 0, speedY, true, c, 1, 'spread'));
            this.projectiles.push(new Projectile(enemy.x + 20, enemy.y + 20, 0, speedY, true, c, 1, 'spread'));
          }
        }
      }
    });
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

      // Update
      this.stars.forEach(s => s.update(dt));
      if (this.player) this.player.update(dt, this.input);
      
      this.spawnEnemy(dt);
      
      this.enemies.forEach(e => e.update(dt));
      this.projectiles.forEach(p => p.update(dt));
      this.particles.forEach(p => p.update(dt));
      this.missiles.forEach(m => m.update(dt));

      this.fireProjectiles(dt);
      this.checkCollisions();
      this.checkMissileCollisions();

      // Cleanup dead entities
      this.enemies = this.enemies.filter(e => e.hp > 0 && e.y < this.canvas.height + 100);
      this.projectiles = this.projectiles.filter(p => !p.markedForDeletion && p.y > -50 && p.y < this.canvas.height + 50 && p.x > -50 && p.x < this.canvas.width + 50);
      this.particles = this.particles.filter(p => p.life > 0);
      this.missiles = this.missiles.filter(m => !m.markedForDeletion && m.y < this.canvas.height + 100);

      // Draw
      this.ctx.fillStyle = '#0b0c10';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.stars.forEach(s => s.draw(this.ctx));
      this.particles.forEach(p => p.draw(this.ctx));
      this.projectiles.forEach(p => p.draw(this.ctx));
      this.missiles.forEach(m => m.draw(this.ctx));
      this.enemies.forEach(e => e.draw(this.ctx));
      if (this.player) this.player.draw(this.ctx);



    } catch (e) {
      console.error('Game Loop Error:', e);
      this.ctx.fillStyle = 'red';
      this.ctx.font = '20px sans-serif';
      this.ctx.fillText(`ERROR: ${e.message}`, 20, 150);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}
