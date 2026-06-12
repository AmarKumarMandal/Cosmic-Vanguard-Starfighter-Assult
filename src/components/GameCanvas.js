'use client';
import { useEffect, useRef, useState } from 'react';
import { Game } from '@/game/game';
import Hangar from './Hangar';
import LevelMap from './LevelMap';
import { SHIPS } from '@/game/ships';

const abilityConfig = {
  'starter': { name: 'None', color: 'rgba(255, 255, 255, 0.2)' },
  'z-51-gen-1': { name: 'Blades', color: '#ffd700' },
  'ship-1': { name: 'Freeze', color: '#00e5ff' },
  'z-51': { name: 'Chain', color: '#00e5ff' },
  'spectre': { name: 'Laser', color: '#00ff00' },
  'ship-3': { name: 'Decoy', color: '#a020f0' },
  'apex': { name: 'Warp', color: '#ff6600' },
  'shadow-stealth-spectre': { name: 'Drones', color: '#7b2fff' },
  'gold-eagle': { name: 'Shield', color: '#ffd700' },
  'reaper': { name: 'Solar', color: '#ff0033' },
  'ship-5': { name: 'Drones', color: '#00ff00' },
  'white-titan-vulcan': { name: 'Solar', color: '#ffffff' }
};

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover', 'paused'
  const [highScore, setHighScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  
  const [globalMoney, setGlobalMoney] = useState(0);
  const [unlockedShips, setUnlockedShips] = useState(['starter']);
  const [activeShipId, setActiveShipId] = useState('starter');
  const [isMounted, setIsMounted] = useState(false);
  const [bankLoaded, setBankLoaded] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [startingWave, setStartingWave] = useState(1);
  
  const currentAbility = abilityConfig[activeShipId] || { name: 'Power', color: '#66fcf1' };
  const hasAbility = currentAbility.name !== 'None';
  const gameRef = useRef(null);
  const activeKeysRef = useRef({});

  const handleControlStart = (e, key) => {
    e.preventDefault();
    if (!activeKeysRef.current[key]) {
      activeKeysRef.current[key] = true;
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    }
  };

  const handleControlEnd = (e, key) => {
    e.preventDefault();
    if (activeKeysRef.current[key]) {
      activeKeysRef.current[key] = false;
      window.dispatchEvent(new KeyboardEvent('keyup', { key }));
    }
  };

  const bankSessionMoney = () => {
    if (gameRef.current && gameRef.current.money > 0) {
      const amount = Number(gameRef.current.money);
      setGlobalMoney(prev => {
        const newTotal = (Number(prev) || 0) + amount;
        console.log(`[BANK] Transferring $${amount} to bank. Previous: ${prev}, New: ${newTotal}`);
        return newTotal;
      });
      gameRef.current.money = 0; // Reset session money after banking
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const savedScore = localStorage.getItem('spaceWarHighScore');
    if (savedScore) setHighScore(parseInt(savedScore));
    
    const savedGame = localStorage.getItem('spaceWarSaveData');
    if (savedGame) setHasSaveData(true);

    const savedBank = localStorage.getItem('spaceWarBank');
    if (savedBank !== null) {
      const parsed = parseInt(savedBank);
      if (!isNaN(parsed)) {
        setGlobalMoney(parsed);
        console.log(`[LOAD] Bank initialized from disk: ${parsed}`);
      }
    }

    const savedUnlocked = localStorage.getItem('spaceWarUnlocked');
    if (savedUnlocked) setUnlockedShips(JSON.parse(savedUnlocked));

    const savedActiveShip = localStorage.getItem('spaceWarActiveShip');
    if (savedActiveShip) setActiveShipId(savedActiveShip);
    
    setBankLoaded(true);
  }, []);

  useEffect(() => {
    if (bankLoaded) {
      localStorage.setItem('spaceWarBank', globalMoney.toString());
      console.log(`[SAVE] Bank persisted to disk: ${globalMoney}`);
    }
  }, [globalMoney, bankLoaded]);

  useEffect(() => {
    if (bankLoaded) {
      localStorage.setItem('spaceWarUnlocked', JSON.stringify(unlockedShips));
    }
  }, [unlockedShips, bankLoaded]);

  useEffect(() => {
    if (bankLoaded) {
      localStorage.setItem('spaceWarActiveShip', activeShipId);
    }
  }, [activeShipId, bankLoaded]);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      const shipConfig = SHIPS.find(s => s.id === activeShipId) || SHIPS[0];
      gameRef.current = new Game(canvasRef.current, shipConfig);
    } else if (gameRef.current) {
      gameRef.current.shipConfig = SHIPS.find(s => s.id === activeShipId) || SHIPS[0];
    }
  }, [activeShipId]);

  useEffect(() => {
    const handleGameOver = (e) => {
      setGameState('gameover');
      setFinalWave(e.detail.wave);
      bankSessionMoney();
    };

    const handleLevelComplete = (e) => {
      setGameState('levelcomplete');
      const levelBeat = e.detail.level;
      setFinalWave(levelBeat); // use finalWave state to store the level beaten for UI
      
      bankSessionMoney();

      setHighScore((prev) => {
        const currentHigh = Math.max(Number(prev) || 1, 1);
        const newUnlocked = Math.max(currentHigh, levelBeat + 1);
        localStorage.setItem('spaceWarHighScore', newUnlocked.toString());
        return newUnlocked;
      });
    };

    const handleTogglePause = () => {
      setGameState(prev => {
        if (prev === 'playing') {
          gameRef.current?.pause();
          return 'paused';
        } else if (prev === 'paused') {
          gameRef.current?.resume();
          return 'playing';
        }
        return prev;
      });
    };
    
    window.addEventListener('game-over', handleGameOver);
    window.addEventListener('level-complete', handleLevelComplete);
    window.addEventListener('toggle-pause', handleTogglePause);
    return () => {
      window.removeEventListener('game-over', handleGameOver);
      window.removeEventListener('level-complete', handleLevelComplete);
      window.removeEventListener('toggle-pause', handleTogglePause);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && gameRef.current) {
      setTimeout(() => gameRef.current.updateHUD(), 0);
    }
  }, [gameState]);

  const lockLandscape = () => {
    const isTouchDevice = typeof window !== 'undefined' && 
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);

    if (!isTouchDevice) return;

    try {
      const docEl = document.documentElement;
      const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(docEl).catch(() => {});
      }

      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
          console.warn('Screen orientation lock failed:', err);
        });
      }
    } catch (e) {
      console.warn('Screen orientation lock error:', e);
    }
  };

  const startGame = (level = 1) => {
    lockLandscape();
    bankSessionMoney();
    setGameState('playing');
    if (gameRef.current) {
      gameRef.current.start(level);
    }
  };

  const continueGame = () => {
    lockLandscape();
    setGameState('playing');
    if (gameRef.current) gameRef.current.resume();
  };

  const loadGame = () => {
    const data = localStorage.getItem('spaceWarSaveData');
    if (data && gameRef.current) {
      lockLandscape();
      gameRef.current.startFromLoad(data);
      setGameState('playing');
    }
  };

  const saveGame = () => {
    if (gameRef.current) {
      const data = gameRef.current.serialize();
      localStorage.setItem('spaceWarSaveData', data);
      setHasSaveData(true);
      alert('Game Saved! Initializing cryogenic stasis...');
    }
  };

  const quitGameFromPause = () => {
    bankSessionMoney();
    setHasActiveGame(false);
    setGameState('menu');
  };

  const quitGameFromGameOver = () => {
    bankSessionMoney(); 
    setHasActiveGame(false);
    setGameState('menu');
  };

  const closeApp = () => {
    if (window.confirm("Are you sure you want to exit to desktop/home screen?")) {
      window.close();
      // Fallback for some mobile browsers if window.close() is blocked
      window.location.href = "about:blank";
    }
  };

  return (
    <div className="game-wrapper">
      {/* Landscape orientation requirement overlay for mobile/tablet devices */}
      <div className="rotate-device-overlay">
        <div className="rotate-icon">🔄</div>
        <h2>Rotate Your Device</h2>
        <p>Please rotate your device to horizontal (landscape) orientation to join the space battle.</p>
      </div>

      <div className="game-container">
        <canvas ref={canvasRef} id="game-canvas" />
      
      {gameState === 'menu' && !showLevelSelect && (
        <div id="main-menu" className="ui-overlay">
          <div className="glass-panel">
             <h1 className="neon-text">SPACE WAR</h1>
              <div className="menu-buttons">
                 <>
                   {hasActiveGame && <button onClick={continueGame} className="glow-on-hover">CONTINUE</button>}
                   <button onClick={() => startGame(1)} className={hasActiveGame ? "btn-secondary" : "glow-on-hover"}>START NEW GAME</button>
                   <button onClick={() => setShowLevelSelect(true)} className="btn-secondary">SELECT LEVEL</button>
                   <button 
                     onClick={loadGame} 
                     className="btn-secondary" 
                     disabled={!hasSaveData} 
                     style={{ opacity: hasSaveData ? 1 : 0.4, cursor: hasSaveData ? 'pointer' : 'not-allowed' }}
                   >
                     LOAD GAME
                   </button>
                   <button onClick={() => setGameState('hangar')} className="btn-secondary">HANGAR</button>
                   <button onClick={closeApp} className="retry-btn glow-on-hover" style={{marginTop: '10px'}}>EXIT GAME</button>
                 </>
             </div>
          </div>
        </div>
      )}

      {gameState === 'menu' && showLevelSelect && (
         <LevelMap 
           highScore={highScore}
           onSelect={(level) => {
             setShowLevelSelect(false);
             startGame(level);
           }}
           onBack={() => setShowLevelSelect(false)}
         />
      )}

      {gameState === 'hangar' && (
        <Hangar 
          globalMoney={globalMoney} setGlobalMoney={setGlobalMoney}
          unlockedShips={unlockedShips} setUnlockedShips={setUnlockedShips}
          activeShipId={activeShipId} setActiveShipId={setActiveShipId}
          onBack={() => setGameState('menu')}
        />
      )}

      {gameState === 'playing' && (
        <div id="hud">
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px', pointerEvents: 'auto'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <div className="wave-tracker">Wave: <span id="current-wave"></span></div>
              <div className="money-tracker" style={{fontSize: '1.5rem', color: '#ffd700', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>
                $ <span id="current-money"></span>
              </div>
            </div>
          </div>
          {/* Bottom Fixed Full-Width HP Bar */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '8px',
            background: 'rgba(255, 0, 51, 0.1)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            zIndex: 90,
            pointerEvents: 'none'
          }}>
            <div 
              id="hp-bar" 
              style={{
                height: '100%',
                width: '100%',
                background: 'linear-gradient(to right, #00ff88, #66fcf1)',
                boxShadow: '0 0 10px #00ff88, 0 0 20px rgba(102, 252, 241, 0.5)',
                transition: 'width 0.15s ease-out'
              }}
            ></div>
          </div>
          {/* Centered HP Text Readout just above bottom bar */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 91,
            pointerEvents: 'none',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            fontWeight: '800',
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px rgba(255,255,255,0.5)',
            letterSpacing: '1px'
          }}>
            HP: <span id="hp-text">-- / --</span>
          </div>
          
          {/* On-screen Directional Controls (Split Left and Right) */}
          {/* Left Controls: Left (◀) and Down (▼) */}
          <div className="dpad-container dpad-left">
            <div></div><div></div><div></div>
            
            <button 
              className="dpad-btn"
              onTouchStart={(e) => handleControlStart(e, 'ArrowLeft')}
              onTouchEnd={(e) => handleControlEnd(e, 'ArrowLeft')}
              onTouchCancel={(e) => handleControlEnd(e, 'ArrowLeft')}
              onMouseDown={(e) => handleControlStart(e, 'ArrowLeft')}
              onMouseUp={(e) => handleControlEnd(e, 'ArrowLeft')}
              onMouseLeave={(e) => handleControlEnd(e, 'ArrowLeft')}
            >
              ◀
            </button>
            <div></div><div></div>

            <div></div>
            <button 
              className="dpad-btn"
              onTouchStart={(e) => handleControlStart(e, 'ArrowDown')}
              onTouchEnd={(e) => handleControlEnd(e, 'ArrowDown')}
              onTouchCancel={(e) => handleControlEnd(e, 'ArrowDown')}
              onMouseDown={(e) => handleControlStart(e, 'ArrowDown')}
              onMouseUp={(e) => handleControlEnd(e, 'ArrowDown')}
              onMouseLeave={(e) => handleControlEnd(e, 'ArrowDown')}
            >
              ▼
            </button>
            <div></div>
          </div>

          {/* Active Ability Button Left */}
          {hasAbility && (
            <button 
              className="ability-btn ability-btn-left"
              style={{
                '--ability-color': currentAbility.color
              }}
              onClick={() => window.dispatchEvent(new CustomEvent('activate-ability'))}
            >
              {currentAbility.name}
              <span id="ability-cooldown-left" className="ability-btn-cooldown-overlay"></span>
            </button>
          )}

          {/* Right Controls: Up (▲) and Right (▶) */}
          <div className="dpad-container dpad-right">
            <div></div>
            <button 
              className="dpad-btn"
              onTouchStart={(e) => handleControlStart(e, 'ArrowUp')}
              onTouchEnd={(e) => handleControlEnd(e, 'ArrowUp')}
              onTouchCancel={(e) => handleControlEnd(e, 'ArrowUp')}
              onMouseDown={(e) => handleControlStart(e, 'ArrowUp')}
              onMouseUp={(e) => handleControlEnd(e, 'ArrowUp')}
              onMouseLeave={(e) => handleControlEnd(e, 'ArrowUp')}
            >
              ▲
            </button>
            <div></div>

            <div></div><div></div>
            <button 
              className="dpad-btn"
              onTouchStart={(e) => handleControlStart(e, 'ArrowRight')}
              onTouchEnd={(e) => handleControlEnd(e, 'ArrowRight')}
              onTouchCancel={(e) => handleControlEnd(e, 'ArrowRight')}
              onMouseDown={(e) => handleControlStart(e, 'ArrowRight')}
              onMouseUp={(e) => handleControlEnd(e, 'ArrowRight')}
              onMouseLeave={(e) => handleControlEnd(e, 'ArrowRight')}
            >
              ▶
            </button>

            <div></div><div></div><div></div>
          </div>

          {/* Active Ability Button Right */}
          {hasAbility && (
            <button 
              className="ability-btn ability-btn-right"
              style={{
                '--ability-color': currentAbility.color
              }}
              onClick={() => window.dispatchEvent(new CustomEvent('activate-ability'))}
            >
              {currentAbility.name}
              <span id="ability-cooldown-right" className="ability-btn-cooldown-overlay"></span>
            </button>
          )}

          <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
            <button className="btn-secondary" style={{padding: '5px 15px', height: 'fit-content', opacity: 0.7, zIndex: 10, pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)'}} onClick={() => window.dispatchEvent(new CustomEvent('toggle-pause'))}>
              Pause (Esc)
            </button>
            <button className="btn-secondary" style={{padding: '5px 15px', height: 'fit-content', opacity: 0.7, zIndex: 10, pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)'}} onClick={saveGame}>
              Quick Save
            </button>
          </div>
        </div>
      )}

      {gameState === 'paused' && (
        <div id="pause-menu" className="ui-overlay">
          <div className="glass-panel">
             <h1 className="neon-text" style={{fontSize: '3rem'}}>PAUSED</h1>
             <p>Press Esc to resume</p>
             <div className="menu-buttons">
               <button onClick={continueGame} className="glow-on-hover">CONTINUE</button>
               <button onClick={saveGame} className="btn-secondary">SAVE GAME</button>
               <button onClick={loadGame} className="btn-secondary">LOAD GAME</button>
               <button onClick={quitGameFromPause} className="retry-btn glow-on-hover" style={{marginTop: '10px'}}>QUIT TO MENU</button>
             </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div id="game-over" className="ui-overlay">
          <div className="glass-panel">
            <h1 className="neon-text red">MISSION FAILED</h1>
            <p>You survived until Wave: <span className="highlight" id="final-wave">{finalWave}</span></p>
            <p>Highest Level Unlocked: <span className="highlight">{Math.max(highScore, 1)}</span></p>
            <button onClick={() => startGame(1)} className="glow-on-hover retry-btn">REDEPLOY (LEVEL 1)</button>
            <button onClick={quitGameFromGameOver} className="btn-secondary" style={{display: 'block', marginTop: '15px', width: '100%'}}>MAIN MENU</button>
          </div>
        </div>
      )}

      {gameState === 'levelcomplete' && (
        <div id="level-complete" className="ui-overlay">
          <div className="glass-panel">
            <h1 className="neon-text" style={{color: '#00ff88', textShadow: '0 0 20px #00ff88'}}>MISSION ACCOMPLISHED</h1>
            <p>Level <span className="highlight">{finalWave}</span> Cleared!</p>
            <p>All hostiles eliminated.</p>
            <button onClick={() => startGame(finalWave + 1)} className="glow-on-hover">START NEXT LEVEL</button>
            <button onClick={quitGameFromGameOver} className="btn-secondary" style={{display: 'block', marginTop: '15px', width: '100%'}}>RETURN TO BASE</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
