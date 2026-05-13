const drawSingleThruster = (ctx, width, height) => {
  ctx.save();
  const flicker = 0.8 + Math.random() * 0.4;
  const flameLength = height * 1.1 * flicker;
  const startY = height * 0.35; // Move up into the nozzle
  const flameWidth = width * 0.25; // Slightly narrower fitting

  // Outer Glow
  ctx.beginPath();
  ctx.moveTo(-flameWidth/2, startY);
  ctx.quadraticCurveTo(0, startY + flameLength * 1.1, flameWidth/2, startY);
  ctx.fillStyle = 'rgba(0, 100, 255, 0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#0055ff';
  ctx.fill();

  // Inner Flame
  ctx.beginPath();
  ctx.moveTo(-flameWidth/3, startY);
  ctx.quadraticCurveTo(0, startY + flameLength * 0.7, flameWidth/3, startY);
  ctx.fillStyle = 'rgba(0, 220, 255, 0.8)';
  ctx.fill();

  // Core
  ctx.beginPath();
  ctx.moveTo(-flameWidth/6, startY);
  ctx.quadraticCurveTo(0, startY + flameLength * 0.3, flameWidth/6, startY);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  
  ctx.restore();
};

export const SHIPS = [
  {
    id: 'starter',
    name: 'A1-CYAN',
    type: 'BASIC ATTACK',
    level: 1,
    color: '#66fcf1',
    cost: 0,
    weaponStyle: 'red-spread',
    stats: {
      power: 40,
      attack: 30, 
      defense: 40, 
      speed: 60, 
    },
    engineSpecs: {
      rawHp: 200,
      rawSpeed: 500,
      fireRate: 150, 
      damage: 20
    },
    draw: function(ctx, width, height, color) {
      if (!this._img) {
        this._img = new Image();
        this._img.src = '/Default space craft.png';
      }
      
      ctx.shadowBlur = 0; 

      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.42; 
        const startY = height * 0.6;
        const flameWidth = width * 0.25;

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#0055ff';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 220, 255, 0.9)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ffff';
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -height/2); 
        ctx.lineTo(width/2, height/2); 
        ctx.lineTo(0, height/4); 
        ctx.lineTo(-width/2, height/2); 
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  },
  {
    id: 'z-51-gen-1',
    name: 'Z-51 gen 1st',
    type: 'PROTOTYPE HEAVY',
    level: 20,
    color: '#cccccc',
    cost: 75000,
    weaponStyle: 'red-spread',
    stats: { power: 90, attack: 50, defense: 100, speed: 40 },
    engineSpecs: { rawHp: 500, rawSpeed: 400, fireRate: 200, damage: 45 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/Z-51 gen 1.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.drawImage(this._img, -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
      }
    }
  },
  {
    id: 'ship-1',
    name: 'X-1 LIGHTNING',
    type: 'SCOUT',
    level: 30,
    color: '#ffff00',
    cost: 250000,
    weaponStyle: 'red-spread',
    stats: { power: 130, attack: 75, defense: 60, speed: 90 },
    engineSpecs: { rawHp: 360, rawSpeed: 720, fireRate: 130, damage: 55 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/1.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        drawSingleThruster(ctx, width, height);
        ctx.drawImage(this._img, -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
      }
    }
  },
  {
    id: 'z-51',
    name: 'Z-51 gen 2nd',
    type: 'MAXIMUM OVERDRIVE',
    level: 50,
    color: '#e84545',
    cost: 500000,
    weaponStyle: 'red-spread',
    stats: { power: 190, attack: 110, defense: 160, speed: 45 },
    engineSpecs: { rawHp: 900, rawSpeed: 460, fireRate: 250, damage: 130 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/Z-51 gen 2.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.drawImage(this._img, -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
      }
    }
  },
  {
    id: 'ship-3',
    name: 'Ghost',
    type: 'STEALTH',
    level: 80,
    color: '#a020f0',
    cost: 850000,
    weaponStyle: 'red-spread',
    stats: { power: 240, attack: 135, defense: 100, speed: 85 },
    engineSpecs: { rawHp: 640, rawSpeed: 700, fireRate: 115, damage: 95 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/3.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.drawImage(this._img, -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
      }
    }
  },
  {
    id: 'red-scorpion',
    name: 'RED SCORPION',
    type: 'ELITE STRIKE',
    level: 100,
    color: '#ff0000',
    cost: 2000000,
    weaponStyle: 'red-spread',
    stats: { power: 290, attack: 150, defense: 120, speed: 95 },
    engineSpecs: { rawHp: 760, rawSpeed: 780, fireRate: 90, damage: 110 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/Red Scorpion.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.drawImage(this._img, -width * 0.8, -height * 0.8, width * 1.6, height * 1.6);
      }
    }
  },
  {
    id: 'ship-5',
    name: 'Phantom 7',
    type: 'BRAWLER',
    level: 100,
    color: '#00ff00',
    cost: 2500000,
    weaponStyle: 'red-spread',
    stats: { power: 300, attack: 150, defense: 200, speed: 50 },
    engineSpecs: { rawHp: 1200, rawSpeed: 510, fireRate: 180, damage: 150 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/5.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.drawImage(this._img, -width * 0.75, -height * 0.75, width * 1.5, height * 1.5);
      }
    }
  }
];
