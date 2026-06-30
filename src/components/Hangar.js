'use client';
import { useState, useEffect, useRef } from 'react';
import { SHIPS } from '@/game/ships';

const HANGAR_ABILITY_INFO = {
  'starter': { 
    id: 'none', 
    name: 'None', 
    description: 'This starter craft does not have any active special power.' 
  },
  'z-51-gen-1': { 
    id: 'nano-blades', 
    name: 'Nano-Blade Orbiters', 
    description: 'Deploys a ring of 6 spinning blades that slice enemies and vaporize incoming projectiles.' 
  },
  'ship-1': { 
    id: 'cryo-shockwave', 
    name: 'Cryo-Shockwave', 
    description: 'Emits a freeze blast that freezes all screen enemies. Frozen targets take +50% extra damage from all attacks.' 
  },
  'z-51': { 
    id: 'lightning-chain', 
    name: 'Chain Lightning', 
    description: 'Instantly discharges an arc of lightning that links and damages all enemies on the screen.' 
  },
  'spectre': { 
    id: 'laser-beam', 
    name: 'Plasma Laser', 
    description: 'Fires a continuous thick plasma laser beam vertically, dealing high DPS to anything in its path.' 
  },
  'ship-3': { 
    id: 'phase-shift', 
    name: 'Quantum Decoy', 
    description: 'Teleports forward and leaves a holographic decoy that draws enemy fire and explodes when expiring.' 
  },
  'apex': { 
    id: 'chrono-slow', 
    name: 'Chrono Warp (Time-Slow)', 
    description: 'Slows down time for enemies and their bullets by 70% while you move and fire at normal speed.' 
  },
  'shadow-stealth-spectre': { 
    id: 'drone-helper', 
    name: 'Drone Helpers', 
    description: 'Summons two micro-drones flanking your craft that automatically target and fire at nearby targets.' 
  },
  'gold-eagle': { 
    id: 'deflector-shield', 
    name: 'Mirror Shield', 
    description: 'Generates a hexagonal deflector shield that reflects enemy bullets back at them with double damage.' 
  },
  'reaper': { 
    id: 'laser-beam', 
    name: 'Plasma Laser', 
    description: 'Fires a concentrated red plasma laser beam of death to melt anything in its way.' 
  },
  'ship-5': { 
    id: 'drone-helper', 
    name: 'Quad Heavy Drones', 
    description: 'Summons four heavy automated drones to hunt targets and clear your flanks.' 
  },
  'white-titan-vulcan': { 
    id: 'solar-flare', 
    name: 'Solar Flare (Orbital Strike)', 
    description: 'Calls down 8 staggered orbital fire strikes that devastate all targets on the screen.' 
  }
};

function AbilityIcon({ type, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const drawIcon = () => {
      ctx.clearRect(0, 0, 100, 100);
      ctx.save();
      ctx.translate(50, 50);

      // Draw background glow/circle
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillStyle = 'rgba(11, 12, 16, 0.6)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      angle += 0.03;

      switch (type) {
        case 'none':
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-12, -12);
          ctx.lineTo(12, 12);
          ctx.stroke();
          break;

        case 'drone-helper':
          // 2 drones orbiting
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.stroke();

          for (let i = 0; i < 2; i++) {
            const a = angle + i * Math.PI;
            const dx = Math.cos(a) * 24;
            const dy = Math.sin(a) * 24;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(dx, dy, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(dx, dy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;

        case 'gravity-singularity':
          ctx.lineWidth = 3;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.arc(0, 0, 15 + Math.sin(angle * 4) * 3, 0, Math.PI * 2);
          ctx.stroke();

          for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(angle + (i * Math.PI * 2 / 3));
            ctx.beginPath();
            ctx.arc(10, 0, 12, 0, Math.PI, false);
            ctx.stroke();
            ctx.restore();
          }
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'cryo-shockwave':
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -30);
            ctx.moveTo(-6, -20);
            ctx.lineTo(0, -26);
            ctx.lineTo(6, -20);
          }
          ctx.stroke();
          break;

        case 'lightning-chain':
          ctx.lineWidth = 3;
          ctx.beginPath();
          let cy = -28;
          let cx = 0;
          ctx.moveTo(cx, cy);
          const points = [
            [-8, -10],
            [10, -5],
            [-10, 10],
            [4, 15],
            [-4, 28]
          ];
          points.forEach(p => {
            ctx.lineTo(p[0] + (Math.random() - 0.5) * 2, p[1]);
          });
          ctx.stroke();
          break;

        case 'laser-beam':
          ctx.lineWidth = 14 + Math.sin(angle * 10) * 3;
          ctx.beginPath();
          ctx.moveTo(0, -32);
          ctx.lineTo(0, 32);
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
          ctx.stroke();
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          break;

        case 'phase-shift':
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.4 + Math.random() * 0.3;
          ctx.beginPath();
          ctx.moveTo(0, -25);
          ctx.lineTo(18, 15);
          ctx.lineTo(0, 5);
          ctx.lineTo(-18, 15);
          ctx.closePath();
          ctx.stroke();

          ctx.globalAlpha = 1.0;
          ctx.save();
          ctx.translate(0, -10);
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.lineTo(15, 12);
          ctx.lineTo(0, 4);
          ctx.lineTo(-15, 12);
          ctx.closePath();
          ctx.fillStyle = '#0b0c10';
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          break;

        case 'chrono-slow':
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 28, 0, Math.PI * 2);
          ctx.stroke();

          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle * 0.15) * 22, Math.sin(angle * 0.15) * 22);
          ctx.stroke();
          break;

        case 'nano-blades':
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 31, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.stroke();

          for (let i = 0; i < 6; i++) {
            const a = angle * 2.5 + (i * Math.PI * 2 / 6);
            const bx = Math.cos(a) * 31;
            const by = Math.sin(a) * 31;
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -4.2);
            ctx.lineTo(2, 1.3);
            ctx.lineTo(0, 0);
            ctx.lineTo(-2, 1.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          break;

        case 'deflector-shield':
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = (i * Math.PI * 2 / 6) + angle * 0.5;
            const hx = Math.cos(a) * 26;
            const hy = Math.sin(a) * 26;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
          break;

        case 'solar-flare':
          for (let i = 0; i < 3; i++) {
            const offset = -20 + i * 20;
            const h = 25 + Math.sin(angle * 5 + i) * 10;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(offset, -h);
            ctx.lineTo(offset, h);
            ctx.stroke();
          }
          break;
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(drawIcon);
    };

    drawIcon();
    return () => cancelAnimationFrame(animationFrameId);
  }, [type, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={100} 
      className="ability-icon-canvas"
      style={{
        '--icon-color': color
      }}
    ></canvas>
  );
}

function ShipThumbnail({ ship, isActive, isLocked, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, 150, 150);
        ctx.save();
        ctx.translate(75, 75); 
        ctx.scale(2.15, 2.15); // Balanced middle-ground scale for 150x150 canvas
        // Reduce overall glow/brightness for thumbnail display
        ctx.filter = 'brightness(0.72)';
        ship.draw(ctx, 40, 40, ship.color);
        ctx.restore();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [ship]);

  return (
    <div 
      className={`ship-thumbnail ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
      onClick={onClick}
    >
      <canvas ref={canvasRef} width={150} height={150}></canvas>
    </div>
  );
}

function ShipDisplay({ ship }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, 800, 800);
        ctx.save();
        // Translate to accommodate scale and optical compensation for bottom-heavy flames
        ctx.translate(400, 280);
        ctx.scale(6.5, 6.5);
        ship.draw(ctx, 40, 40, ship.color);
        ctx.restore();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [ship]);

  return <canvas ref={canvasRef} width={800} height={800}></canvas>;
}

export default function Hangar({ globalMoney, setGlobalMoney, unlockedShips, setUnlockedShips, activeShipId, setActiveShipId, onBack }) {
  const [selectedShipId, setSelectedShipId] = useState(activeShipId);
  const hangarRef = useRef(null);
  const [scale, setScale] = useState(1);

  const selectedShip = SHIPS.find(s => s.id === selectedShipId) || SHIPS[0];
  const isUnlocked = true; // All ships free for testing

  useEffect(() => {
    const handleResize = () => {
      let width = window.innerWidth;
      let height = window.innerHeight;
      
      // Check if the device is in portrait mode and the parent container is rotated 90 degrees.
      // In portrait rotation, layout width is screen height and height is screen width.
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      if (isPortrait) {
        width = window.innerHeight;
        height = window.innerWidth;
      }
      
      const scaleX = width / 1600;
      const scaleY = height / 900;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePurchase = () => {
    if (!isUnlocked && globalMoney >= selectedShip.cost) {
      setGlobalMoney(prev => prev - selectedShip.cost);
      setUnlockedShips(prev => [...prev, selectedShip.id]);
    }
  };

  const handleDeploy = () => {
    if (isUnlocked) {
      setActiveShipId(selectedShip.id);
      onBack(); // go back to menu
    }
  };

  return (
    <div className="hangar-backdrop">
      <div 
        ref={hangarRef}
        className="hangar-layout"
      style={{
        transform: `translate(-50%, -50%) scale(${scale})`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '1600px',
        height: '900px',
        transformOrigin: 'center center'
      }}
    >
      {/* Top bar */}
      <div className="hangar-topbar">
        <button className="btn-back" onClick={onBack}></button>
        <div className="hangar-currencies">
          <div className="currency-badge gold">
            🪙 {globalMoney}
          </div>
        </div>
      </div>

      <div className="hangar-content">
        {/* Left Sidebar */}
        <div className="hangar-sidebar-left">
          {SHIPS.map(ship => (
            <ShipThumbnail 
              key={ship.id}
              ship={ship}
              isActive={selectedShipId === ship.id}
              isLocked={false}
              onClick={() => setSelectedShipId(ship.id)}
            />
          ))}
        </div>

        {/* Center Display */}
        <div className="hangar-center">
          <ShipDisplay ship={selectedShip} />
          
          <div className="hangar-purchase">
            {isUnlocked ? (
               <button className="btn-purchase deploy" onClick={handleDeploy}>DEPLOY SHIP</button>
            ) : (
               <button 
                  className="btn-purchase" 
                  onClick={handlePurchase}
                  style={{opacity: globalMoney >= selectedShip.cost ? 1 : 0.5}}
               >
                 🪙 {selectedShip.cost}
               </button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hangar-sidebar-right">
           <div className="hangar-title">
             <h2>{selectedShip.name}</h2>
             <div className="subtitle">{selectedShip.type}</div>
             <div className="level">LVL {selectedShip.level}</div>
           </div>

           <div className="hangar-stats" style={{marginTop: '20px'}}>
             <div className="stat-row">
               <div className="stat-label">POWER</div>
               <div className="stat-bar-bg">
                 <div className="stat-bar-fill" style={{width: `${((selectedShip.engineSpecs.damage / 2) / 150) * 100}%`}}></div>
               </div>
               <div className="stat-value">{selectedShip.engineSpecs.damage / 2}</div>
             </div>
             <div className="stat-row">
               <div className="stat-label">ATTACK</div>
               <div className="stat-bar-bg">
                 <div className="stat-bar-fill" style={{width: `${(selectedShip.stats.attack/200)*100}%`}}></div>
               </div>
               <div className="stat-value">{selectedShip.stats.attack}</div>
             </div>
             <div className="stat-row">
               <div className="stat-label">DEFENCE</div>
               <div className="stat-bar-bg">
                 <div className="stat-bar-fill" style={{width: `${(selectedShip.stats.defense/220)*100}%`}}></div>
               </div>
               <div className="stat-value">{selectedShip.stats.defense}</div>
             </div>
             <div className="stat-row">
               <div className="stat-label">HP</div>
               <div className="stat-bar-bg">
                 <div className="stat-bar-fill" style={{width: `${(selectedShip.engineSpecs.rawHp/1500)*100}%`}}></div>
               </div>
               <div className="stat-value">{selectedShip.engineSpecs.rawHp}</div>
             </div>
             <div className="stat-row">
               <div className="stat-label">SPEED</div>
               <div className="stat-bar-bg">
                 <div className="stat-bar-fill" style={{width: `${(selectedShip.stats.speed/110)*100}%`}}></div>
               </div>
               <div className="stat-value">{selectedShip.stats.speed}</div>
             </div>
           </div>

           {/* Special Ability Section */}
            {(() => {
              const abilityInfo = HANGAR_ABILITY_INFO[selectedShip.id] || { id: 'none', name: 'None', description: 'No active power available.' };
              const hasPower = abilityInfo.id !== 'none';
              return (
                <>
                  <div className={`hangar-ability-section ${hasPower ? 'has-power' : 'no-power'}`}>
                    <AbilityIcon type={abilityInfo.id} color={hasPower ? selectedShip.color : 'rgba(255, 255, 255, 0.3)'} />
                    <div className="hangar-ability-info">
                      <h4 className="hangar-ability-tag">Active Power</h4>
                      <h3 
                        className="hangar-ability-title" 
                        style={{
                          color: hasPower ? selectedShip.color : 'rgba(255, 255, 255, 0.4)',
                          textShadow: hasPower ? `0 0 10px ${selectedShip.color}4d` : 'none'
                        }}
                      >
                        {abilityInfo.name}
                      </h3>
                      <p className="hangar-ability-desc">{abilityInfo.description}</p>
                    </div>
                  </div>


                </>
              );
            })()}
        </div>

      </div>
      </div>
    </div>
  );
}
