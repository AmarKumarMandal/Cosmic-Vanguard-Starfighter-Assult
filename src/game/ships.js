const getFlameColors = (color) => {
  if (!color) return {
    outer: 'rgba(0, 100, 255, 0.6)',
    inner: 'rgba(0, 220, 255, 0.8)',
    shadow: '#0055ff',
    innerShadow: '#00ffff'
  };

  const hex = color.toLowerCase();

  let outer = 'rgba(0, 100, 255, 0.6)';
  let inner = 'rgba(0, 220, 255, 0.8)';
  let shadow = '#0055ff';
  let innerShadow = '#00ffff';

  if (hex === '#ffff00' || hex === '#ffd700' || hex === 'yellow' || hex === 'gold') {
    outer = 'rgba(255, 100, 0, 0.6)';
    inner = 'rgba(255, 220, 0, 0.8)';
    shadow = '#ff5500';
    innerShadow = '#ffff00';
  } else if (hex === '#e84545' || hex === '#ff0000' || hex === '#ff0033' || hex === 'red') {
    outer = 'rgba(220, 20, 0, 0.6)';
    inner = 'rgba(255, 120, 0, 0.8)';
    shadow = '#ff0000';
    innerShadow = '#ffaa00';
  } else if (hex === '#a020f0' || hex === '#8a2be2' || hex === 'purple') {
    outer = 'rgba(120, 0, 220, 0.6)';
    inner = 'rgba(220, 0, 255, 0.8)';
    shadow = '#a020f0';
    innerShadow = '#ff00ff';
  } else if (hex === '#00ff00' || hex === '#00ff88' || hex === 'green') {
    outer = 'rgba(0, 220, 80, 0.6)';
    inner = 'rgba(100, 255, 100, 0.8)';
    shadow = '#00cc00';
    innerShadow = '#00ff88';
  } else if (hex === '#ff6600' || hex === '#ff4500' || hex === 'orange') {
    outer = 'rgba(255, 80, 0, 0.6)';
    inner = 'rgba(255, 160, 0, 0.8)';
    shadow = '#ff5500';
    innerShadow = '#ffcc00';
  } else if (hex === '#66fcf1' || hex === '#00e5ff' || hex === 'cyan' || hex === 'blue') {
    outer = 'rgba(0, 100, 255, 0.7)';
    inner = 'rgba(0, 220, 255, 0.9)';
    shadow = '#0055ff';
    innerShadow = '#00ffff';
  } else if (hex === '#ffffff' || hex === 'white') {
    outer = 'rgba(200, 235, 255, 0.7)';
    inner = 'rgba(255, 255, 255, 0.9)';
    shadow = '#b0e2ff';
    innerShadow = '#ffffff';
  }

  return { outer, inner, shadow, innerShadow };
};

const drawSingleThruster = (ctx, width, height, color) => {
  ctx.save();
  const flicker = 0.8 + Math.random() * 0.4;
  const flameLength = height * 1.1 * flicker;
  const startY = height * 0.35; // Move up into the nozzle
  const flameWidth = width * 0.25; // Slightly narrower fitting

  const colors = getFlameColors(color);

  // Outer Glow
  ctx.beginPath();
  ctx.moveTo(-flameWidth/2, startY);
  ctx.quadraticCurveTo(0, startY + flameLength * 1.1, flameWidth/2, startY);
  ctx.fillStyle = colors.outer;
  ctx.shadowBlur = 20;
  ctx.shadowColor = colors.shadow;
  ctx.fill();

  // Inner Flame
  ctx.beginPath();
  ctx.moveTo(-flameWidth/3, startY);
  ctx.quadraticCurveTo(0, startY + flameLength * 0.7, flameWidth/3, startY);
  ctx.fillStyle = colors.inner;
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
        this._img.src = '/player craftship/A1-cyan.png';
      }
      
      ctx.shadowBlur = 0; 

      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.55 * flicker;
        const nozzleOffset = width * 0.22;
        const startY = height * 0.55;
        const flameWidth = width * 0.15;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
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
    color: '#ffd700',
    cost: 75000,
    weaponStyle: 'red-spread',
    stats: { power: 90, attack: 50, defense: 100, speed: 40 },
    engineSpecs: { rawHp: 500, rawSpeed: 400, fireRate: 200, damage: 45 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Z-51 gen 1.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'ship-1',
    name: 'Lightning Ice Storm',
    type: 'ICE STORM SCOUT',
    level: 30,
    color: '#00e5ff',
    cost: 250000,
    weaponStyle: 'red-spread',
    stats: { power: 130, attack: 75, defense: 60, speed: 90 },
    engineSpecs: { rawHp: 360, rawSpeed: 720, fireRate: 130, damage: 55 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { 
        this._img = new Image(); 
        this._img.src = '/player craftship/Lightning_Ice_storm.png'; 
      }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
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
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Z-51 gen 2.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'spectre',
    name: 'Spectre',
    type: 'PLASMA FIGHTER',
    level: 60,
    color: '#00ff00',
    cost: 1200000,
    weaponStyle: 'red-spread',
    stats: { power: 220, attack: 130, defense: 140, speed: 80 },
    engineSpecs: { rawHp: 800, rawSpeed: 650, fireRate: 120, damage: 110 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Spectre.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.40 * flicker; // Shorter flame length to keep it at 38px visible length
        const nozzleOffset = width * 0.14; // Matches the requested 0.14 spacing
        const startY = height * 0.60; // Moved near the nozzle exit mouth to eliminate any gap
        const flameWidth = width * 0.14; // Flame width matches the nozzle mouth (12px)

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'ship-3',
    name: 'Ghost',
    type: 'STEALTH',
    level: 70,
    color: '#a020f0',
    cost: 850000,
    weaponStyle: 'red-spread',
    stats: { power: 240, attack: 135, defense: 100, speed: 85 },
    engineSpecs: { rawHp: 640, rawSpeed: 700, fireRate: 115, damage: 95 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Ghost.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'apex',
    name: 'Apex',
    type: 'ELITE STRIKE',
    level: 80,
    color: '#ff6600',
    cost: 2000000,
    weaponStyle: 'red-spread',
    stats: { power: 290, attack: 150, defense: 120, speed: 95 },
    engineSpecs: { rawHp: 760, rawSpeed: 780, fireRate: 90, damage: 110 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Apex.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.125;
        const startY = height * 0.45;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'gold-eagle',
    name: 'Gold Eagle',
    type: 'ELITE INTERCEPTOR',
    level: 90,
    color: '#ffd700',
    cost: 650000,
    weaponStyle: 'red-spread',
    stats: { power: 150, attack: 85, defense: 110, speed: 70 },
    engineSpecs: { rawHp: 580, rawSpeed: 550, fireRate: 150, damage: 70 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Gold_Eagle.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'reaper',
    name: 'Reaper',
    type: 'DEATH ASSAULT',
    level: 100,
    color: '#ff0033',
    cost: 750000,
    weaponStyle: 'red-spread',
    stats: { power: 175, attack: 100, defense: 120, speed: 65 },
    engineSpecs: { rawHp: 650, rawSpeed: 520, fireRate: 170, damage: 85 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Reaper.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
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
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Phantom 7.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.55 * flicker;
        const nozzleOffset = width * 0.10;
        const startY = height * 0.50;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  },
  {
    id: 'white-titan-vulcan',
    name: 'White Titan Vulcan',
    type: 'HEAVY DREADNOUGHT',
    level: 100,
    color: '#ffffff',
    cost: 3000000,
    weaponStyle: 'red-spread',
    stats: { power: 300, attack: 160, defense: 220, speed: 40 },
    engineSpecs: { rawHp: 1500, rawSpeed: 450, fireRate: 200, damage: 160 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/White_Titan_Vulcan.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        ctx.save();
        const flicker = 0.8 + Math.random() * 0.4;
        const flameLength = height * 0.6 * flicker;
        const nozzleOffset = width * 0.12;
        const startY = height * 0.35;
        const flameWidth = width * 0.14;

        const colors = getFlameColors(color || this.color);

        const drawFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/2, startY);
          ctx.quadraticCurveTo(xPosition - flameWidth/4, startY + flameLength, xPosition, startY + flameLength * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidth/4, startY + flameLength, xPosition + flameWidth/2, startY);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidth/3, startY);
          ctx.quadraticCurveTo(xPosition, startY + flameLength * 0.8, xPosition + flameWidth/3, startY);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();
        };

        drawFlame(-nozzleOffset);
        drawFlame(nozzleOffset);
        ctx.restore();

        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);
      }
    }
  }
];
