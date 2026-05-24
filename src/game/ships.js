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
        const flicker = 0.8 + Math.random() * 0.4;
        const colors = getFlameColors(color || this.color);

        // 1. Draw outer flames BEHIND the ship
        ctx.save();
        const flameLengthOuter = height * 0.58 * flicker;
        const startYOuter = height * 0.40;
        const flameWidthOuter = width * 0.15;
        const nozzleOffset = width * 0.25; // Midpoint spread between flames

        const drawOuterFlame = (xPosition, yStart) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthOuter/2, yStart);
          ctx.quadraticCurveTo(xPosition - flameWidthOuter/4, yStart + flameLengthOuter, xPosition, yStart + flameLengthOuter * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthOuter/4, yStart + flameLengthOuter, xPosition + flameWidthOuter/2, yStart);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();
        };
        const xOffset = -width * 0.03; // Shifted both flames to the left

        drawOuterFlame(-nozzleOffset + xOffset, startYOuter + height * 0.19); // Left flame
        drawOuterFlame(nozzleOffset + xOffset, startYOuter + height * 0.19); // Right flame
        ctx.restore();

        // 2. Draw the ship image
        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);

        // 3. Draw the inner flames/cores ON TOP of the ship (emerging through the thrusters)
        ctx.save();
        const flameLengthInner = height * 0.18 * flicker;
        const startYInner = height * 0.55; // Matches the nozzle level on the sprite
        const flameWidthInner = width * 0.08;

        const drawInnerFlame = (xPosition, yStart) => {
          // Bright inner droplet
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/2, yStart);
          ctx.quadraticCurveTo(xPosition - flameWidthInner/4, yStart + flameLengthInner, xPosition, yStart + flameLengthInner * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthInner/4, yStart + flameLengthInner, xPosition + flameWidthInner/2, yStart);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();

          // White-hot core
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/3, yStart);
          ctx.quadraticCurveTo(xPosition, yStart + flameLengthInner * 0.6, xPosition + flameWidthInner/3, yStart);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        };

        drawInnerFlame(-nozzleOffset + xOffset, startYInner + height * 0.19); // Left flame
        drawInnerFlame(nozzleOffset + xOffset, startYInner + height * 0.19); // Right flame
        ctx.restore();
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
    stats: { power: 90, attack: 40, defense: 100, speed: 40 },
    engineSpecs: { rawHp: 500, rawSpeed: 400, fireRate: 200, damage: 40 },
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
    stats: { power: 130, attack: 50, defense: 60, speed: 90 },
    engineSpecs: { rawHp: 360, rawSpeed: 720, fireRate: 130, damage: 60 },
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
    stats: { power: 190, attack: 70, defense: 160, speed: 45 },
    engineSpecs: { rawHp: 900, rawSpeed: 460, fireRate: 250, damage: 80 },
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
    stats: { power: 220, attack: 80, defense: 140, speed: 80 },
    engineSpecs: { rawHp: 800, rawSpeed: 650, fireRate: 120, damage: 90 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Spectre.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        const flicker = 0.8 + Math.random() * 0.4;
        const colors = getFlameColors(color || this.color);

        // 1. Draw outer flames BEHIND the ship
        ctx.save();
        const flameLengthOuter = height * 0.60 * flicker;
        const startYOuter = height * 0.35;
        const flameWidthOuter = width * 0.14;

        const drawOuterFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthOuter/2, startYOuter);
          ctx.quadraticCurveTo(xPosition - flameWidthOuter/4, startYOuter + flameLengthOuter, xPosition, startYOuter + flameLengthOuter * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthOuter/4, startYOuter + flameLengthOuter, xPosition + flameWidthOuter/2, startYOuter);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();
        };

        drawOuterFlame(-width * 0.14);
        drawOuterFlame(width * 0.125);
        ctx.restore();

        // 2. Draw the ship image
        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);

        // 3. Draw the inner flames/cores ON TOP of the ship (emerging through the thrusters)
        ctx.save();
        const flameLengthInner = height * 0.18 * flicker;
        const startYInner = height * 0.61; // Shifted more downward (was 0.60)
        const flameWidthInner = width * 0.08;

        const drawInnerFlame = (xPosition) => {
          // Bright green inner droplet
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/2, startYInner);
          ctx.quadraticCurveTo(xPosition - flameWidthInner/4, startYInner + flameLengthInner, xPosition, startYInner + flameLengthInner * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthInner/4, startYInner + flameLengthInner, xPosition + flameWidthInner/2, startYInner);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();

          // White-hot core
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/3, startYInner);
          ctx.quadraticCurveTo(xPosition, startYInner + flameLengthInner * 0.6, xPosition + flameWidthInner/3, startYInner);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        };

        drawInnerFlame(-width * 0.14);
        drawInnerFlame(width * 0.125);
        ctx.restore();
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
    stats: { power: 240, attack: 90, defense: 100, speed: 85 },
    engineSpecs: { rawHp: 640, rawSpeed: 700, fireRate: 115, damage: 100 },
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
    stats: { power: 290, attack: 100, defense: 120, speed: 95 },
    engineSpecs: { rawHp: 760, rawSpeed: 780, fireRate: 90, damage: 110 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Apex.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        const flicker = 0.8 + Math.random() * 0.4;
        const colors = getFlameColors(color || this.color);

        // 1. Draw outer flames BEHIND the ship
        ctx.save();
        const flameLengthOuter = height * 0.76 * flicker; // Larger in height (was 0.68)
        const startYOuter = height * 0.35;
        const flameWidthOuter = width * 0.14;

        const drawOuterFlame = (xPosition, yStart) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthOuter/2, yStart);
          ctx.quadraticCurveTo(xPosition - flameWidthOuter/4, yStart + flameLengthOuter, xPosition, yStart + flameLengthOuter * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthOuter/4, yStart + flameLengthOuter, xPosition + flameWidthOuter/2, yStart);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();
        };

        drawOuterFlame(-width * 0.165, startYOuter - height * 0.02); // Shifted left flame upward
        drawOuterFlame(width * 0.125, startYOuter - height * 0.02); // Shifted right flame slightly upward
        ctx.restore();

        // 2. Draw the ship image
        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);

        // 3. Draw the inner flames/cores ON TOP of the ship (emerging through the thrusters)
        ctx.save();
        const flameLengthInner = height * 0.23 * flicker; // Larger in height (was 0.20)
        const startYInner = height * 0.58;
        const flameWidthInner = width * 0.08;

        const drawInnerFlame = (xPosition, yStart) => {
          // Bright orange inner droplet
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/2, yStart);
          ctx.quadraticCurveTo(xPosition - flameWidthInner/4, yStart + flameLengthInner, xPosition, yStart + flameLengthInner * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthInner/4, yStart + flameLengthInner, xPosition + flameWidthInner/2, yStart);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();

          // White-hot core
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/3, yStart);
          ctx.quadraticCurveTo(xPosition, yStart + flameLengthInner * 0.6, xPosition + flameWidthInner/3, yStart);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        };

        drawInnerFlame(-width * 0.165, startYInner - height * 0.02); // Shifted left flame upward
        drawInnerFlame(width * 0.125, startYInner - height * 0.02); // Shifted right flame slightly upward
        ctx.restore();
      }
    }
  },
  {
    id: 'shadow-stealth-spectre',
    name: 'Shadow Stealth-Spectre',
    type: 'SHADOW ASSASSIN',
    level: 95,
    color: '#7b2fff',
    cost: 1800000,
    weaponStyle: 'red-spread',
    stats: { power: 260, attack: 120, defense: 100, speed: 110 },
    engineSpecs: { rawHp: 700, rawSpeed: 820, fireRate: 100, damage: 130 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Shadow Stealth-Spectre.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        const flicker = 0.8 + Math.random() * 0.4;
        const colors = getFlameColors(color || this.color);

        // 1. Draw outer flames BEHIND the ship
        ctx.save();
        const flameLengthOuter = height * 0.62 * flicker;
        const startYOuter = height * 0.35;
        const flameWidthOuter = width * 0.14;

        const drawOuterFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthOuter/2, startYOuter);
          ctx.quadraticCurveTo(xPosition - flameWidthOuter/4, startYOuter + flameLengthOuter, xPosition, startYOuter + flameLengthOuter * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthOuter/4, startYOuter + flameLengthOuter, xPosition + flameWidthOuter/2, startYOuter);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();
        };

        drawOuterFlame(-width * 0.14);
        drawOuterFlame(width * 0.125);
        ctx.restore();

        // 2. Draw the ship image
        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);

        // 3. Draw the inner flames/cores ON TOP of the ship (emerging through the thrusters)
        ctx.save();
        const flameLengthInner = height * 0.19 * flicker;
        const startYInner = height * 0.61;
        const flameWidthInner = width * 0.08;

        const drawInnerFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/2, startYInner);
          ctx.quadraticCurveTo(xPosition - flameWidthInner/4, startYInner + flameLengthInner, xPosition, startYInner + flameLengthInner * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthInner/4, startYInner + flameLengthInner, xPosition + flameWidthInner/2, startYInner);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();

          // White-hot core
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/3, startYInner);
          ctx.quadraticCurveTo(xPosition, startYInner + flameLengthInner * 0.6, xPosition + flameWidthInner/3, startYInner);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        };

        drawInnerFlame(-width * 0.14);
        drawInnerFlame(width * 0.125);
        ctx.restore();
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
    stats: { power: 150, attack: 110, defense: 110, speed: 70 },
    engineSpecs: { rawHp: 580, rawSpeed: 550, fireRate: 150, damage: 120 },
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
    stats: { power: 175, attack: 130, defense: 120, speed: 65 },
    engineSpecs: { rawHp: 650, rawSpeed: 520, fireRate: 170, damage: 140 },
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
    stats: { power: 300, attack: 140, defense: 200, speed: 50 },
    engineSpecs: { rawHp: 1200, rawSpeed: 510, fireRate: 180, damage: 150 },
    draw: function(ctx, width, height, color) {
      if (!this._img) { this._img = new Image(); this._img.src = '/player craftship/Phantom 7.png'; }
      if (this._img.complete && this._img.naturalWidth > 0) {
        const flicker = 0.8 + Math.random() * 0.4;
        const colors = getFlameColors(color || this.color);

        // 1. Draw outer flames BEHIND the ship
        ctx.save();
        const flameLengthOuter = height * 0.58 * flicker;
        const startYOuter = height * 0.38; // Moved downward (was 0.35)
        const flameWidthOuter = width * 0.14;
        const nozzleOffset = width * 0.10;
        const xOffset = width * 0.028; // Shifted right
        const leftX = -nozzleOffset + xOffset + width * 0.015; // Shifted left flame slightly rightward
        const rightX = nozzleOffset + xOffset;

        const drawOuterFlame = (xPosition) => {
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthOuter/2, startYOuter);
          ctx.quadraticCurveTo(xPosition - flameWidthOuter/4, startYOuter + flameLengthOuter, xPosition, startYOuter + flameLengthOuter * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthOuter/4, startYOuter + flameLengthOuter, xPosition + flameWidthOuter/2, startYOuter);
          ctx.closePath();
          ctx.fillStyle = colors.outer;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.shadow;
          ctx.fill();
        };

        drawOuterFlame(leftX);
        drawOuterFlame(rightX);
        ctx.restore();

        // 2. Draw the ship image
        ctx.drawImage(this._img, -width * 1.0, -height * 1.0, width * 2.0, height * 2.0);

        // 3. Draw the inner flames/cores ON TOP of the ship (emerging through the thrusters)
        ctx.save();
        const flameLengthInner = height * 0.18 * flicker;
        const startYInner = height * 0.53; // Moved downward (was 0.50)
        const flameWidthInner = width * 0.08;

        const drawInnerFlame = (xPosition) => {
          // Bright green inner droplet
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/2, startYInner);
          ctx.quadraticCurveTo(xPosition - flameWidthInner/4, startYInner + flameLengthInner, xPosition, startYInner + flameLengthInner * 1.2);
          ctx.quadraticCurveTo(xPosition + flameWidthInner/4, startYInner + flameLengthInner, xPosition + flameWidthInner/2, startYInner);
          ctx.closePath();
          ctx.fillStyle = colors.inner;
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors.innerShadow;
          ctx.fill();

          // White-hot core
          ctx.beginPath();
          ctx.moveTo(xPosition - flameWidthInner/3, startYInner);
          ctx.quadraticCurveTo(xPosition, startYInner + flameLengthInner * 0.6, xPosition + flameWidthInner/3, startYInner);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        };

        drawInnerFlame(leftX);
        drawInnerFlame(rightX);
        ctx.restore();
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
    stats: { power: 300, attack: 150, defense: 220, speed: 40 },
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
