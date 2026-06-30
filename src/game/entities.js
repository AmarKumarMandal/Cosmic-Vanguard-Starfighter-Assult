// Pre-loaded Enemy Assets for all 10 levels (Client-side only)
const ENEMY_IMAGES = {};

if (typeof window !== 'undefined') {
  for (let lvl = 1; lvl <= 10; lvl++) {
    ENEMY_IMAGES[lvl] = {
      enemy: new Image(),
      wave_boss: new Image(),
      main_boss: new Image()
    };
    ENEMY_IMAGES[lvl].enemy.src = `/enemy/level_${lvl}_enemy.png`;
    ENEMY_IMAGES[lvl].wave_boss.src = `/enemy/level_${lvl}_wave_boss.png`;
    ENEMY_IMAGES[lvl].main_boss.src = `/enemy/level_${lvl}_main_boss.png`;
  }
}

const STING_MISSILE_IMG = typeof window !== 'undefined' ? new Image() : null;
if (STING_MISSILE_IMG) {
  STING_MISSILE_IMG.src = '/player craftship/sting_missile.png';
}


export class Player {
  constructor(canvas, config = null) {
    this.canvas = canvas;
    this.width = 83;
    this.height = 83;
    this.x = canvas.width / 2;
    this.y = canvas.height - 60;

    // Config defaults
    this.color = config?.color || '#66fcf1';
    this.speed = config?.engineSpecs?.rawSpeed || 300;
    this.maxHp = config?.engineSpecs?.rawHp || 100;
    this.shootCooldown = config?.engineSpecs?.fireRate || 150; // ms
    this.damageMultiplier = (config?.engineSpecs?.damage || 20) / 20;
    this.weaponStyle = config?.weaponStyle || 'default';
    this.drawPath = config?.draw;
    this.id = config?.id || 'starter';

    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.lastShotTime = 0;
  }

  update(dt, input) {
    // Input handling (Case-insensitive check for WASD and Arrow keys)
    const left = input.keys['ArrowLeft'] || input.keys['arrowleft'] || input.keys['a'] || input.keys['A'];
    const right = input.keys['ArrowRight'] || input.keys['arrowright'] || input.keys['d'] || input.keys['D'];
    const up = input.keys['ArrowUp'] || input.keys['arrowup'] || input.keys['w'] || input.keys['W'];
    const down = input.keys['ArrowDown'] || input.keys['arrowdown'] || input.keys['s'] || input.keys['S'];

    if (left) this.vx = -this.speed;
    else if (right) this.vx = this.speed;
    else this.vx = 0;

    if (up) this.vy = -this.speed;
    else if (down) this.vy = this.speed;
    else this.vy = 0;

    // Mobile touch overriding
    if (input.touchTarget) {
      const dx = input.touchTarget.x - this.x;
      const dy = input.touchTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Bounds
    const margin = this.width / 2;
    if (this.x < margin) this.x = margin;
    if (this.x > this.canvas.width - margin) this.x = this.canvas.width - margin;
    if (this.y < margin) this.y = margin;
    if (this.y > this.canvas.height - margin) this.y = this.canvas.height - margin;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.drawPath) {
      ctx.fillStyle = '#0b0c10';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      this.drawPath(ctx, this.width, this.height, this.color);
    } else {
      // Default Draw neon ship
      ctx.fillStyle = '#0b0c10';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;

      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.lineTo(0, this.height / 4);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Engine glow
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0055';
      ctx.beginPath();
      ctx.arc(0, this.height / 2 + Math.random() * 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating HP bar removed in favor of full-width bottom bar

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2.5,
      y: this.y - this.height / 2.5,
      w: this.width * 0.8,
      h: this.height * 0.8
    }
  }
}

export class Enemy {
  constructor(canvas, x, y, isBoss = false, wave = 1, isLevelBoss = false, level = 1) {
    this.canvas = canvas;
    this.isBoss = isBoss;
    this.isLevelBoss = isLevelBoss;
    this.level = level;
    this.wave = wave;
    this.x = x;
    this.y = y;

    const tier = level + Math.floor((wave - 1) / 5);

    const bossHPConfig = {
      1: { waveMin: 4000, waveMax: 6000, mainBoss: 8000, maxWave: 5 },
      2: { waveMin: 6000, waveMax: 16000, mainBoss: 25000, maxWave: 7 },
      3: { waveMin: 8000, waveMax: 25000, mainBoss: 40000, maxWave: 8 },
      4: { waveMin: 10000, waveMax: 45000, mainBoss: 70000, maxWave: 9 },
      5: { waveMin: 12000, waveMax: 70000, mainBoss: 100000, maxWave: 10 },
      6: { waveMin: 14000, waveMax: 100000, mainBoss: 150000, maxWave: 10 },
      7: { waveMin: 16000, waveMax: 125000, mainBoss: 200000, maxWave: 11 },
      8: { waveMin: 16000, waveMax: 150000, mainBoss: 250000, maxWave: 12 },
      9: { waveMin: 18000, waveMax: 150000, mainBoss: 300000, maxWave: 13 },
      10: { waveMin: 20000, waveMax: 200000, mainBoss: 500000, maxWave: 15 }
    };

    const BOSS_SPECIALS = {
      1: { homing: false, maxShields: 0, laser: false },
      2: { homing: true,  maxShields: 0, laser: false },
      3: { homing: true,  maxShields: 0, laser: false },
      4: { homing: false, maxShields: 5, laser: false },
      5: { homing: false, maxShields: 5, laser: false },
      6: { homing: false, maxShields: 0, laser: true  },
      7: { homing: false, maxShields: 0, laser: true  },
      8: { homing: true,  maxShields: 3, laser: false },
      9: { homing: true,  maxShields: 0, laser: true  },
      10:{ homing: true,  maxShields: 3, laser: true  }
    };

    if (this.isLevelBoss) {
      this.width = 400;
      this.height = 350;
      const config = bossHPConfig[this.level] || { mainBoss: 10000 };
      this.hp = config.mainBoss;
      this.speed = 60;
      this.color = '#ffcc00'; // Gold
      this.shootCooldown = 500; // Balanced delay for dodging

      // Special Boss Attack States
      const spec = BOSS_SPECIALS[this.level] || { homing: false, maxShields: 0, laser: false };
      this.hasHoming = spec.homing;
      this.maxShields = spec.maxShields;
      this.hasLaser = spec.laser;

      this.shieldActive = false;
      this.shieldTimer = 0;
      this.shieldsLeft = spec.maxShields;
      this.nextShieldCooldown = 6.0 + Math.random() * 4.0; // first shield after 6-10s

      this.laserActive = false;
      this.laserTimer = 0;
      this.laserStage = 'off'; // 'off', 'warning', 'firing'
      this.nextLaserCooldown = 4.0 + Math.random() * 3.0; // first laser after 4-7s
      this.laserDuration = 2.5;
      this.laserWarningDuration = 1.0;
    } else if (this.isBoss) {
      this.width = 280;
      this.height = 280;
      const config = bossHPConfig[this.level] || { waveMin: 2000, waveMax: 4000, maxWave: 5 };
      const maxW = config.maxWave;
      this.hp = config.waveMin + Math.round((wave - 1) * (config.waveMax - config.waveMin) / (maxW - 1 || 1));
      this.speed = 100;
      this.color = '#ff0055'; // neon red
      this.shootCooldown = Math.max(200, 800 - (wave * 60));
    } else {
      this.width = 120;
      this.height = 120;
      this.hp = tier * 100;
      const subWave = ((wave - 1) % 5) + 1;
      if (subWave <= 2) {
        // base hp already set
      } else if (subWave <= 4) {
        this.hp += 50;
      } else {
        this.hp += 100;
      }
      this.speed = 100 + (wave * 10);
      this.color = '#c5c6c7'; // grey/white
      this.shootCooldown = 1200;
    }

    this.maxHp = this.hp;
    this.vx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.vy = this.isLevelBoss ? 15 : (this.isBoss ? 20 : 40);

    this.lastShotTime = 0;
  }

  update(dt) {
    if (this.isFrozen) {
      if (typeof this.freezeTimer === 'undefined') this.freezeTimer = 4.0;
      this.freezeTimer -= dt;
      if (this.freezeTimer <= 0) {
        this.isFrozen = false;
      }
      return; // Skip updates (movement/shooting) when frozen
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.isLevelBoss) {
      // 1. Update Shield State
      if (this.shieldActive) {
        this.shieldTimer -= dt;
        if (this.shieldTimer <= 0) {
          this.shieldActive = false;
          this.nextShieldCooldown = 12.0 + Math.random() * 4.0; // 12-16s between shields
        }
      } else if (this.shieldsLeft > 0) {
        this.nextShieldCooldown -= dt;
        if (this.nextShieldCooldown <= 0) {
          this.shieldActive = true;
          this.shieldTimer = 3.5;
          this.shieldsLeft--;
        }
      }

      // 2. Update Laser State
      if (this.laserStage === 'warning') {
        this.laserTimer -= dt;
        if (this.laserTimer <= 0) {
          this.laserStage = 'firing';
          this.laserTimer = this.laserDuration;
        }
      } else if (this.laserStage === 'firing') {
        this.laserTimer -= dt;
        if (this.laserTimer <= 0) {
          this.laserStage = 'off';
          this.nextLaserCooldown = 8.0 + Math.random() * 3.0; // 8-11s between lasers
        }
      } else if (this.hasLaser) {
        this.nextLaserCooldown -= dt;
        if (this.nextLaserCooldown <= 0) {
          this.laserStage = 'warning';
          this.laserTimer = this.laserWarningDuration;
        }
      }
    }

    if (this.isLevelBoss || this.isBoss) {
      if (this.x < this.width / 2 || this.x > this.canvas.width - this.width / 2) {
        this.vx *= -1;
        this.x = Math.max(this.width / 2, Math.min(this.x, this.canvas.width - this.width / 2));
      }
      const yStop = this.isLevelBoss ? 200 : 150;
      if (this.y > yStop) this.vy = 0;
    } else {
      if (this.x < this.width / 2 || this.x > this.canvas.width - this.width / 2) {
        this.vx *= -1;
        this.x = Math.max(this.width / 2, Math.min(this.x, this.canvas.width - this.width / 2));
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Pick image set based on level
    let imgType = 'enemy';
    if (this.isLevelBoss) imgType = 'main_boss';
    else if (this.isBoss) imgType = 'wave_boss';

    const enemyImg = ENEMY_IMAGES[this.level]?.[imgType];

    if (this.isLevelBoss) {
      if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
        ctx.drawImage(enemyImg, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        // Fallback: gold rectangle
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffcc00';
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
    } else if (this.isBoss) {
      if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
        ctx.drawImage(enemyImg, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 4;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
    } else {
      if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
        ctx.drawImage(enemyImg, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.fillStyle = '#0b0c10';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, -this.height / 2);
        ctx.lineTo(0, this.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    if (!this.isBoss && !this.isLevelBoss) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-this.width / 2, -this.height / 2 - 15, this.width, 5);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(-this.width / 2, -this.height / 2 - 15, this.width * Math.max(0, this.hp / this.maxHp), 5);
    }

    if (this.isFrozen) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00e5ff';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    }

    // Draw Boss Special Attacks
    if (this.isLevelBoss) {
      // Shield effect
      if (this.shieldActive) {
        ctx.save();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00e5ff';
        ctx.fillStyle = 'rgba(0, 229, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(0, 0, 230 + Math.sin(performance.now() / 150) * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Shield remaining dots
      if (this.maxShields > 0) {
        ctx.save();
        const total = this.maxShields;
        const active = this.shieldsLeft + (this.shieldActive ? 1 : 0);
        for (let i = 0; i < total; i++) {
          ctx.beginPath();
          ctx.arc(-30 + i * 15, -this.height / 2 - 25, 4, 0, Math.PI * 2);
          ctx.fillStyle = i < active ? '#00e5ff' : '#333';
          ctx.shadowBlur = i < active ? 8 : 0;
          ctx.shadowColor = '#00e5ff';
          ctx.fill();
        }
        ctx.restore();
      }

      // Laser beams
      if (this.laserStage === 'warning') {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 50, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const laserOffsets = [-120, 120];
        laserOffsets.forEach(offset => {
          ctx.beginPath();
          ctx.moveTo(offset, 100);
          ctx.lineTo(offset, 1500);
          ctx.stroke();
        });
        ctx.restore();
      } else if (this.laserStage === 'firing') {
        ctx.save();
        const laserWidth = 45;
        const laserOffsets = [-120, 120];
        laserOffsets.forEach(offset => {
          ctx.fillStyle = 'rgba(255, 0, 50, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ff0033';
          ctx.fillRect(offset - laserWidth / 2, 100, laserWidth, 1500);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.fillRect(offset - laserWidth / 4, 100, laserWidth / 2, 1500);
        });
        ctx.restore();
      }
    }

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height
    }
  }

  get isShieldActive() {
    return this.shieldActive || false;
  }
}

export class Projectile {
  constructor(x, y, vx, vy, isEnemy, color = null, damageMultiplier = 1, style = 'default') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    if (style === 'sting_missile') {
      this.width = 20;
      this.height = 55;
    } else {
      this.width = (style === 'red-spread' || style === 'spread') ? 10 : 4;
      this.height = (style === 'red-spread' || style === 'spread') ? 18 : 10;
    }
    this.isEnemy = isEnemy;
    this.color = color || (isEnemy ? '#ff0055' : '#66fcf1');
    this.damage = (isEnemy ? 1 : 10) * damageMultiplier;
    this.style = style;
    this.markedForDeletion = false;
  }

  update(dt, enemies) {
    if (this.style === 'sting_missile' && !this.isEnemy && enemies && enemies.length > 0) {
      // Find the nearest active enemy
      let nearestEnemy = null;
      let minDistance = Infinity;
      enemies.forEach(enemy => {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          nearestEnemy = enemy;
        }
      });

      if (nearestEnemy) {
        // Calculate the vector to the target
        const dx = nearestEnemy.x - this.x;
        const dy = nearestEnemy.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          // Desired velocity vector (normalized to missile speed)
          const missileSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 450;
          const targetVx = (dx / dist) * missileSpeed;
          const targetVy = (dy / dist) * missileSpeed;

          // Homing interpolation (smooth steering / turning rate)
          const steerForce = 6.0; // Higher = tighter turns, lower = sluggish turns
          this.vx += (targetVx - this.vx) * steerForce * dt;
          this.vy += (targetVy - this.vy) * steerForce * dt;

          // Normalize actual velocity to the missileSpeed to keep it constant
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (currentSpeed > 0) {
            this.vx = (this.vx / currentSpeed) * missileSpeed;
            this.vy = (this.vy / currentSpeed) * missileSpeed;
          }
        }
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);

    if (this.style === 'sting_missile') {
      if (STING_MISSILE_IMG && STING_MISSILE_IMG.complete && STING_MISSILE_IMG.naturalWidth > 0) {
        ctx.drawImage(STING_MISSILE_IMG, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff6600';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
    } else if (this.style === 'red-spread' || this.style === 'spread') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;

      // Tail
      for (let i = 1; i <= 6; i++) {
        const size = 3 - i * 0.4;
        const yOffset = i * 2.5;

        ctx.beginPath();
        ctx.arc(0, yOffset, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, yOffset, size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Head Halo Ring
      ctx.beginPath();
      ctx.arc(0, -1, 5, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Head Core
      ctx.beginPath();
      ctx.arc(0, -1, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Side specks
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-4, 1, 1.5, 1.5);
      ctx.fillRect(2.5, 1, 1.5, 1.5);
      ctx.fillRect(-3, 4, 1, 1);
      ctx.fillRect(2, 4, 1, 1);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;

      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height
    }
  }
}

export class Missile {
  constructor(x, y, targetRef, damage = 30) {
    this.x = x;
    this.y = y;
    this.targetRef = targetRef; // live reference to player object
    this.width = 24;            // Increased width for visibility and realistic size
    this.height = 42;           // Increased height
    this.speed = 320;
    this.hp = 3;           // takes 3 player hits to destroy
    this.maxHp = 3;
    this.damage = damage;      // Configurable damage (fixed per level for Wave Boss, defaults to 30 for Level Boss)
    this.isEnemy = true;
    this.isMissile = true;
    this.markedForDeletion = false;
    this.vx = 0;
    this.vy = this.speed;
    this.trail = [];
    this.age = 0;
  }

  update(dt, decoy = null) {
    this.age += dt;
    // Trail
    this.trail.push({ x: this.x, y: this.y, age: 0 });
    this.trail.forEach(t => t.age += dt);
    if (this.trail.length > 25) this.trail.shift(); // Denser trail length

    // Home toward player or decoy (with a 0.6s delayed start and 3.0s tracking limit)
    const target = decoy || this.targetRef;
    if (target && target.hp > 0 && this.age > 0.6 && this.age < 3.0) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const desiredVx = (dx / dist) * this.speed;
        const desiredVy = (dy / dist) * this.speed;
        const turnRate = 1.8; // Lower turn rate for realistic wider turn radius
        this.vx += (desiredVx - this.vx) * turnRate * dt;
        this.vy += (desiredVy - this.vy) * turnRate * dt;
        const v = Math.hypot(this.vx, this.vy);
        this.vx = (this.vx / v) * this.speed;
        this.vy = (this.vy / v) * this.speed;
      }
    } else if (this.age <= 0.6) {
      // Fly straight down initially
      this.vx = 0;
      this.vy = this.speed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();

    // Dense Exhaust plume (smoke and fire trail)
    this.trail.forEach((t, i) => {
      const ratio = i / this.trail.length;
      const alpha = ratio * 0.8;
      const size = ratio * 14; // Larger trail size
      
      // Outer fiery smoke
      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(0.1, size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 60, 0, ${alpha * 0.4})`;
      ctx.fill();
      
      // Inner hot core of the trail
      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(0.1, size * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
      ctx.fill();
    });

    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);

    // Engine flame flicker (exhaust flame)
    const flicker = 10 + Math.random() * 12;
    ctx.beginPath();
    ctx.ellipse(0, 15 + flicker / 2, 8, Math.max(1, flicker / 2), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff88';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffaa00';
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0; // Reset shadow

    // 1. Tail fins (drawn first/behind main body)
    ctx.fillStyle = '#ffaa00'; // Orange fins
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(-14, 15);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.lineTo(14, 15);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();

    // 2. Main Missile Body (Metallic grey/silver cylinder with red highlights)
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff2200';
    ctx.fillStyle = '#e5e9f0'; // Light silver/white body
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(6, -12);
    ctx.lineTo(6, 10);
    ctx.lineTo(-6, 10);
    ctx.closePath();
    ctx.fill();

    // 3. Nose Cone (Red, pointed tip)
    ctx.fillStyle = '#d01c1c'; // Deep Red
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.quadraticCurveTo(0, -28, 0, -32); // pointier tip
    ctx.quadraticCurveTo(0, -28, 6, -12);
    ctx.closePath();
    ctx.fill();

    // 4. Panel lines / details on the body (red bands)
    ctx.fillStyle = '#d01c1c';
    ctx.fillRect(-6, -4, 12, 4); // Red band in the middle
    
    // 5. Blinking warning light (LED) at the center
    const blink = Math.sin(performance.now() / 100) > 0;
    if (blink) {
      ctx.beginPath();
      ctx.arc(0, -3, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88'; // glowing green LED
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
      ctx.fill();
    }

    // HP bar (unrotate first)
    const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
    ctx.rotate(-angle);
    ctx.shadowBlur = 0; // Disable shadows for health bar
    
    const barW = 24;
    const barH = 4;
    const hpX = -barW / 2;
    const hpY = -28;
    
    // Draw health bar container
    ctx.fillStyle = '#333';
    ctx.fillRect(hpX, hpY, barW, barH);
    // Draw active HP
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(hpX, hpY, barW * (this.hp / this.maxHp), barH);

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height
    };
  }
}


export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 300;
    this.vy = (Math.random() - 0.5) * 300;
    this.life = 1.0;
    this.decay = Math.random() * 2 + 1;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= this.decay * dt;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Star {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2;
    this.speed = (Math.random() * 50) + 20;
    this.alpha = Math.random();
  }
  update(dt) {
    this.y += this.speed * dt;
    if (this.y > this.canvas.height) {
      this.y = 0;
      this.x = Math.random() * this.canvas.width;
    }
  }
  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
