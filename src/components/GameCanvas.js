'use client';
import { useEffect, useRef, useState } from 'react';
import { Game } from '@/game/game';
import Hangar from './Hangar';
import LevelMap from './LevelMap';
import { SHIPS } from '@/game/ships';

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
  
  const gameRef = useRef(null);

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

  const startGame = (level = 1) => {
    bankSessionMoney();
    setGameState('playing');
    if (gameRef.current) {
      gameRef.current.start(level);
    }
  };

  const continueGame = () => {
    setGameState('playing');
    if (gameRef.current) gameRef.current.resume();
  };

  const loadGame = () => {
    const data = localStorage.getItem('spaceWarSaveData');
    if (data && gameRef.current) {
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
          <div className="hp-bar-container" style={{position: 'absolute', bottom: '40px', left: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div id="hp-bar" style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}></div>
            <span id="hp-text" style={{position: 'relative', zIndex: 2, fontSize: '0.9rem', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>-- / --</span>
          </div>
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
  );
}
