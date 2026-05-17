// Global Enemy Assets Pre-loaded for performance (Client-side only)
let ENEMY_SMALL_IMG = null;
let ENEMY_BOSS_IMG = null;
let ENEMY_LEVEL_BOSS_IMG = null;

if (typeof window !== 'undefined') {
  ENEMY_SMALL_IMG = new Image();
  ENEMY_SMALL_IMG.src = '/enemy spmall trrops ship.png';
  ENEMY_BOSS_IMG = new Image();
  ENEMY_BOSS_IMG.src = '/wave 1 boss.png';
  ENEMY_LEVEL_BOSS_IMG = new Image();
  ENEMY_LEVEL_BOSS_IMG.src = '/enemy/level 1 boss.png';
}

export class Player {
  constructor(canvas, config = null) {
    this.canvas = canvas;
    this.width = 90;
    this.height = 90;
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

    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.lastShotTime = 0;
  }

  update(dt, input) {
    // Input handling
    if (input.keys['ArrowLeft'] || input.keys['a']) this.vx = -this.speed;
    else if (input.keys['ArrowRight'] || input.keys['d']) this.vx = this.speed;
    else this.vx = 0;

    if (input.keys['ArrowUp'] || input.keys['w']) this.vy = -this.speed;
    else if (input.keys['ArrowDown'] || input.keys['s']) this.vy = this.speed;
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
  constructor(canvas, x, y, isBoss = false, wave = 1, isLevelBoss = false) {
    this.canvas = canvas;
    this.isBoss = isBoss;
    this.isLevelBoss = isLevelBoss;
    this.x = x;
    this.y = y;

    if (this.isLevelBoss) {
      this.width = 400;
      this.height = 300;
      this.hp = 5000 + (wave * 2000); // 'wave' will be passed as the level number
      this.speed = 60;
      this.color = '#ffcc00'; // Gold
      this.shootCooldown = 150;
    } else if (this.isBoss) {
      this.width = 280;
      this.height = 200;
      this.hp = 1500 + (wave * 500);
      this.speed = 100;
      this.color = '#ff0055'; // neon red
      this.shootCooldown = Math.max(200, 800 - (wave * 60));
    } else {
      this.width = 85;
      this.height = 85;
      this.hp = 50 + (wave * 50);
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
    this.x += this.vx * dt;
    this.y += this.vy * dt;

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

    if (this.isLevelBoss) {
      if (ENEMY_LEVEL_BOSS_IMG && ENEMY_LEVEL_BOSS_IMG.complete && ENEMY_LEVEL_BOSS_IMG.naturalWidth > 0) {
        ctx.drawImage(ENEMY_LEVEL_BOSS_IMG, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        // Fallback: gold rectangle
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffcc00';
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
    } else if (this.isBoss) {
      if (ENEMY_BOSS_IMG && ENEMY_BOSS_IMG.complete && ENEMY_BOSS_IMG.naturalWidth > 0) {
        ctx.drawImage(ENEMY_BOSS_IMG, -140, -100, 280, 200);
      } else {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 4;
        ctx.strokeRect(-140, -100, 280, 200);
      }
    } else {
      if (ENEMY_SMALL_IMG && ENEMY_SMALL_IMG.complete && ENEMY_SMALL_IMG.naturalWidth > 0) {
        ctx.drawImage(ENEMY_SMALL_IMG, -this.width / 2, -this.height / 2, this.width, this.height);
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

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-this.width / 2, -this.height / 2 - 15, this.width, 5);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(-this.width / 2, -this.height / 2 - 15, this.width * Math.max(0, this.hp / this.maxHp), 5);

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

export class Projectile {
  constructor(x, y, vx, vy, isEnemy, color = null, damageMultiplier = 1, style = 'default') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = (style === 'red-spread' || style === 'spread') ? 18 : 6;
    this.height = (style === 'red-spread' || style === 'spread') ? 30 : 16;
    this.isEnemy = isEnemy;
    this.color = color || (isEnemy ? '#ff0055' : '#66fcf1');
    this.damage = (isEnemy ? 1 : 10) * damageMultiplier;
    this.style = style;
    this.markedForDeletion = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);

    if (this.style === 'red-spread' || this.style === 'spread') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;

      // Tail
      for (let i = 1; i <= 6; i++) {
        const size = 5 - i * 0.7;
        const yOffset = i * 4;

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
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Head Core
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Side specks
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-6, 2, 2, 2);
      ctx.fillRect(4, 2, 2, 2);
      ctx.fillRect(-4, 7, 1.5, 1.5);
      ctx.fillRect(3, 7, 1.5, 1.5);
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
  constructor(x, y, targetRef) {
    this.x = x;
    this.y = y;
    this.targetRef = targetRef; // live reference to player object
    this.width = 16;
    this.height = 28;
    this.speed = 320;
    this.hp = 3;           // takes 3 player hits to destroy
    this.maxHp = 3;
    this.damage = 30;      // big hit if it reaches player
    this.isEnemy = true;
    this.isMissile = true;
    this.markedForDeletion = false;
    this.vx = 0;
    this.vy = this.speed;
    this.trail = [];
    this.age = 0;
  }

  update(dt) {
    this.age += dt;
    // Trail
    this.trail.push({ x: this.x, y: this.y, age: 0 });
    this.trail.forEach(t => t.age += dt);
    if (this.trail.length > 12) this.trail.shift();

    // Home toward player
    const target = this.targetRef;
    if (target && target.hp > 0) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const desiredVx = (dx / dist) * this.speed;
        const desiredVy = (dy / dist) * this.speed;
        const turnRate = 3.5;
        this.vx += (desiredVx - this.vx) * turnRate * dt;
        this.vy += (desiredVy - this.vy) * turnRate * dt;
        const v = Math.hypot(this.vx, this.vy);
        this.vx = (this.vx / v) * this.speed;
        this.vy = (this.vy / v) * this.speed;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();

    // Flame trail
    this.trail.forEach((t, i) => {
      const alpha = (i / this.trail.length) * 0.6;
      const size = (i / this.trail.length) * 8;
      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(0.1, size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
      ctx.fill();
    });

    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);

    // Engine flame flicker
    const flicker = 6 + Math.random() * 6;
    ctx.beginPath();
    ctx.ellipse(0, 10 + flicker / 2, 5, Math.max(1, flicker / 2), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6600';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Body
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff2200';
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, 10);
    ctx.closePath();
    ctx.fill();

    // Core highlight
    ctx.fillStyle = '#ff6644';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, -4, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // HP dots (unrotate first)
    const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
    ctx.rotate(-angle);
    for (let i = 0; i < this.maxHp; i++) {
      ctx.beginPath();
      ctx.arc(-8 + i * 8, -22, 3, 0, Math.PI * 2);
      ctx.fillStyle = i < this.hp ? '#ff4400' : '#333';
      ctx.shadowBlur = 0;
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
