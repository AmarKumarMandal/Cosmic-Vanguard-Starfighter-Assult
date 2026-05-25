'use client';
import { useState, useEffect, useRef } from 'react';
import { SHIPS } from '@/game/ships';

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

  const selectedShip = SHIPS.find(s => s.id === selectedShipId) || SHIPS[0];
  const isUnlocked = true; // All ships free for testing

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
    <div className="hangar-layout">
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
        <div style={{position: 'relative', width: '350px'}}>
           <div className="hangar-title">
             <h2>{selectedShip.name}</h2>
             <div className="subtitle">{selectedShip.type}</div>
             <div className="level">LVL {selectedShip.level}</div>
           </div>

           <div className="hangar-stats" style={{marginTop: 'auto'}}>
             <div className="stat-row">
               <div className="stat-label">POWER</div>
               <div className="stat-bar-bg">
                 <div className="stat-bar-fill" style={{width: `${((selectedShip.engineSpecs.damage / 2) / 100) * 100}%`}}></div>
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
        </div>

      </div>
    </div>
  );
}
