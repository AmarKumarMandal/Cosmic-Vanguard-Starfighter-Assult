'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from '@/game/game';
import Hangar from './Hangar';
import LevelMap from './LevelMap';
import { SHIPS } from '@/game/ships';
import AudioController from '@/audio/AudioController';
import soundManagerInstance from '@/audio/SoundManager';

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
  const [currentLevel, setCurrentLevel] = useState(1);
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
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isKeyboardDevice, setIsKeyboardDevice] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      const isMobileOrTablet = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
        || (window.innerWidth < 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
      setIsKeyboardDevice(!isMobileOrTablet);
    }
  }, []);
  
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

  const checkSaveData = () => {
    if (typeof window === 'undefined') return;
    const savedGame = localStorage.getItem('spaceWarSaveData');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed && parsed.status === 'ACTIVE') {
          setHasSaveData(true);
          return;
        }
      } catch (e) {
        console.error('Error parsing save data:', e);
      }
    }
    setHasSaveData(false);
  };

  const markSaveAsResolved = () => {
    if (typeof window === 'undefined') return;
    const savedGame = localStorage.getItem('spaceWarSaveData');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed) {
          parsed.status = 'RESOLVED';
          localStorage.setItem('spaceWarSaveData', JSON.stringify(parsed));
          checkSaveData();
          console.log("[SAVE] Save data marked as RESOLVED");
        }
      } catch (e) {
        console.error('Error resolving save data:', e);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const savedScore = localStorage.getItem('spaceWarHighScore');
    if (savedScore) setHighScore(parseInt(savedScore));
    
    checkSaveData();

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
    
    const savedLevel = localStorage.getItem('spaceWarCurrentLevel');
    if (savedLevel) setCurrentLevel(parseInt(savedLevel, 10));

    setBankLoaded(true);
  }, []);

  // Disable Tab-based navigation entirely to prioritize Arrow keys only
  useEffect(() => {
    const handleTabIntercept = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleTabIntercept, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleTabIntercept, { capture: true });
    };
  }, []);

  // Persist currentLevel to localStorage on every change (single source of truth)
  useEffect(() => {
    localStorage.setItem('spaceWarCurrentLevel', currentLevel.toString());
  }, [currentLevel]);

  // Handle auto-switching between menu music (tempest) and gameplay music (cyberpunk/overdrive)
  useEffect(() => {
    if (!soundManagerInstance) return;
    const isGameplay = gameState === 'playing';
    if (isGameplay) {
      const targetTrack = soundManagerInstance.lastGameplayTrack || 'cyberpunk';
      if (soundManagerInstance.currentTrackKey !== targetTrack) {
        soundManagerInstance.setTrack(targetTrack);
      }
      if (!soundManagerInstance.isMuted) {
        soundManagerInstance.play();
      }
    } else {
      if (soundManagerInstance.currentTrackKey !== 'tempest') {
        soundManagerInstance.setTrack('tempest');
      }
      if (!soundManagerInstance.isMuted) {
        soundManagerInstance.play();
      }
    }
  }, [gameState]);

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
      markSaveAsResolved();
    };

    const handleLevelComplete = (e) => {
      setGameState('levelcomplete');
      const levelBeat = e.detail.level;
      setFinalWave(levelBeat); // use finalWave state to store the level beaten for UI
      
      bankSessionMoney();
      markSaveAsResolved();

      // Advance and persist the level so returning to menu always shows the next level
      const nextLevel = levelBeat + 1;
      setCurrentLevel(nextLevel);

      setHighScore((prev) => {
        const currentHigh = Math.max(Number(prev) || 1, 1);
        const newUnlocked = Math.max(currentHigh, nextLevel);
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

  const startGame = (level = currentLevel) => {
    lockLandscape();
    // Do not call bankSessionMoney() here to prevent banking abandoned runs
    markSaveAsResolved(); // Invalidate any previous active save when starting a new run
    setGameState('playing');
    setCurrentLevel(level); // useEffect will persist this to localStorage
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
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.status === 'ACTIVE') {
          lockLandscape();
          gameRef.current.startFromLoad(data);
          setGameState('playing');
          if (parsed.level) {
            setCurrentLevel(parsed.level); // useEffect will persist this to localStorage
          }
        } else {
          alert('No active save data found!');
        }
      } catch (e) {
        console.error('Error loading save:', e);
      }
    }
  };

  const saveGame = () => {
    if (gameRef.current) {
      const data = gameRef.current.serialize();
      localStorage.setItem('spaceWarSaveData', data);
      checkSaveData();
      alert('Game Saved! Initializing cryogenic stasis...');
    }
  };

  const quitGameFromPause = () => {
    // Save-and-Quit keeps the money exactly as it was (do not call bankSessionMoney)
    if (gameRef.current) {
      gameRef.current.isRunning = false;
    }
    setHasActiveGame(false);
    setGameState('menu');
  };

  const quitGameFromGameOver = () => {
    // Session money is already banked on death (do not call bankSessionMoney)
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

  const getMenuOptions = useCallback(() => {
    const options = [];
    if (hasActiveGame) {
      options.push({ id: 'continue', label: 'CONTINUE', action: continueGame });
    }
    options.push({ id: 'start', label: 'START NEW GAME', action: () => startGame(1) });
    if (isMounted && currentLevel > 1) {
      options.push({ id: 'play', label: `PLAY LEVEL ${currentLevel}`, action: () => startGame(currentLevel) });
    }
    options.push({ id: 'levelmap', label: 'Select Level Map', action: () => setShowLevelSelect(true) });
    options.push({ id: 'load', label: 'LOAD GAME', action: loadGame, disabled: !hasSaveData });
    options.push({ id: 'hangar', label: 'Aircraft Hangar', action: () => setGameState('hangar') });
    if (isKeyboardDevice) {
      options.push({ id: 'controls', label: 'Controls', action: () => setShowControls(true) });
    }
    options.push({ id: 'exit', label: 'EXIT GAME', action: closeApp });
    return options;
  }, [hasActiveGame, continueGame, startGame, isMounted, currentLevel, hasSaveData, loadGame, closeApp, isKeyboardDevice]);

  const getPauseOptions = useCallback(() => {
    return [
      { id: 'continue', label: 'CONTINUE', action: continueGame },
      { id: 'save', label: 'SAVE GAME', action: saveGame },
      { id: 'load', label: 'LOAD GAME', action: loadGame, disabled: !hasSaveData },
      { id: 'quit', label: 'QUIT TO MENU', action: quitGameFromPause }
    ];
  }, [continueGame, saveGame, loadGame, hasSaveData, quitGameFromPause]);

  // Reset menu index when screen/mode changes
  useEffect(() => {
    setMenuSelectedIndex(0);
  }, [gameState, showLevelSelect, showControls]);

  // Keyboard navigation listener (Up/Down, Enter)
  useEffect(() => {
    const isMenu = gameState === 'menu' && !showLevelSelect && !showControls;
    const isPaused = gameState === 'paused';
    if (!isMenu && !isPaused) return;

    const options = isMenu ? getMenuOptions() : getPauseOptions();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();
        setMenuSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        setMenuSelectedIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedOption = options[menuSelectedIndex];
        if (selectedOption && !selectedOption.disabled) {
          selectedOption.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, showLevelSelect, showControls, menuSelectedIndex, getMenuOptions, getPauseOptions]);

  // Global actions shortcuts (M, Escape, Backspace, +/-, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // M key: Mute/Unmute
      if (key === 'm') {
        e.preventDefault();
        if (soundManagerInstance) {
          soundManagerInstance.toggleMute();
        }
        return;
      }

      // + or = key: Volume Up
      if (key === '+' || key === '=') {
        e.preventDefault();
        if (soundManagerInstance) {
          const currentVol = soundManagerInstance.volume;
          const newVol = Math.min(1.0, currentVol + 0.1);
          soundManagerInstance.setVolume(newVol);
        }
        return;
      }

      // - key: Volume Down
      if (key === '-') {
        e.preventDefault();
        if (soundManagerInstance) {
          const currentVol = soundManagerInstance.volume;
          const newVol = Math.max(0.0, currentVol - 0.1);
          soundManagerInstance.setVolume(newVol);
        }
        return;
      }

      // Enter key: Close controls if open
      if (e.key === 'Enter' && showControls) {
        e.preventDefault();
        setShowControls(false);
        return;
      }

      // Backspace or Escape: Back
      if (e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        if (showControls) {
          setShowControls(false);
          return;
        }
        if (gameState === 'hangar') {
          setGameState('menu');
        } else if (gameState === 'menu' && showLevelSelect) {
          setShowLevelSelect(false);
        } else if (gameState === 'playing') {
          window.dispatchEvent(new CustomEvent('toggle-pause'));
        } else if (gameState === 'paused') {
          continueGame();
        } else if (gameState === 'gameover' || gameState === 'levelcomplete') {
          quitGameFromGameOver();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState, showLevelSelect, showControls, continueGame, quitGameFromGameOver]);

  // Swipe touch gestures navigation
  useEffect(() => {
    const isMenu = gameState === 'menu' && !showLevelSelect && !showControls;
    const isPaused = gameState === 'paused';
    if (!isMenu && !isPaused) return;

    const options = isMenu ? getMenuOptions() : getPauseOptions();
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaY) > 30) {
        if (deltaY < 0) {
          // Swiped up -> move selection down
          setMenuSelectedIndex((prev) => (prev + 1) % options.length);
        } else {
          // Swiped down -> move selection up
          setMenuSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, showLevelSelect, showControls, getMenuOptions, getPauseOptions]);

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
        {gameState !== 'playing' && <AudioController inGame={false} />}
      
      {gameState === 'menu' && !showLevelSelect && (
        <div id="main-menu" className="ui-overlay">
          <div className="menu-left-wrapper">
            <div className="title-container">
              <img src="/Game Title.png" alt="Cosmic Vanguard: Starfighter Assault" className="game-title-img" />
            </div>
            <div className="menu-left-panel">
              {getMenuOptions().map((opt, idx) => {
                const isSelected = idx === menuSelectedIndex;
                
                // Base classes
                let btnClass = "menu-btn";
                if (opt.id === 'continue' || opt.id === 'start') {
                  btnClass += " menu-btn-primary";
                } else if (opt.id === 'exit') {
                  btnClass += " menu-btn-exit";
                } else {
                  btnClass += " menu-btn-neon";
                }
                
                if (isSelected) {
                  btnClass += " keyboard-selected";
                }

                // Hangar button has custom inner elements
                if (opt.id === 'hangar') {
                  return (
                    <button
                      key={opt.id}
                      onClick={opt.action}
                      onMouseEnter={() => setMenuSelectedIndex(idx)}
                      className={btnClass}
                      tabIndex="-1"
                    >
                      <div className="menu-btn-icon-container">
                        <div className="engine-flame left-flame"></div>
                        <div className="engine-flame right-flame"></div>
                        <img src="/player craftship/Gold_Eagle.png" alt="Aircraft Hangar" className="menu-btn-icon-img" />
                      </div>
                      Aircraft Hangar
                    </button>
                  );
                }

                 return (
                   <button
                     key={opt.id}
                     onClick={opt.action}
                     onMouseEnter={() => setMenuSelectedIndex(idx)}
                     className={btnClass}
                     disabled={opt.disabled}
                     tabIndex="-1"
                     style={opt.id === 'load' ? { opacity: hasSaveData ? 1 : 0.4, cursor: hasSaveData ? 'pointer' : 'not-allowed' } : undefined}
                   >
                     {opt.label}
                   </button>
                 );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === 'menu' && showControls && (
        <div id="controls-menu" className="ui-overlay">
          <div className="glass-panel controls-panel" style={{ maxWidth: '600px', width: '90%' }}>
            <h1 className="neon-text" style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 0 15px rgba(180, 0, 255, 0.7)' }}>KEYBOARD CONTROLS</h1>
            <div className="controls-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0', width: '100%' }}>
              <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="control-key" style={{ color: '#00ff88', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>W A S D / Arrows</span>
                <span className="control-desc" style={{ color: '#fff' }}>Move Starfighter</span>
              </div>
              <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="control-key" style={{ color: '#00ff88', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>Space / Shift / F / E</span>
                <span className="control-desc" style={{ color: '#fff' }}>Activate Special Ability</span>
              </div>
              <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="control-key" style={{ color: '#00ff88', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>Enter Key / Tap</span>
                <span className="control-desc" style={{ color: '#fff' }}>Confirm / Select Option</span>
              </div>
              <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="control-key" style={{ color: '#00ff88', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>Backspace / Escape</span>
                <span className="control-desc" style={{ color: '#fff' }}>Back / Pause Menu</span>
              </div>
              <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="control-key" style={{ color: '#00ff88', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>M Key</span>
                <span className="control-desc" style={{ color: '#fff' }}>Mute / Unmute Track</span>
              </div>
              <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="control-key" style={{ color: '#00ff88', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 136, 0.5)' }}>Plus (+) / Minus (-)</span>
                <span className="control-desc" style={{ color: '#fff' }}>Adjust Soundtrack Volume</span>
              </div>
            </div>
            <button 
              onClick={() => setShowControls(false)} 
              className="menu-btn menu-btn-primary keyboard-selected"
              tabIndex="-1"
              style={{ marginTop: '20px', width: '100%', cursor: 'pointer' }}
            >
              CLOSE
            </button>
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
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto', alignItems: 'flex-start'}}>
            <div className="level-tracker">Level: <span id="current-level">--</span></div>
            <div className="wave-tracker">Wave: <span id="current-wave">--</span></div>
            <div className="money-tracker" style={{marginTop: '4px'}}>
              $ <span id="current-money">0</span>
            </div>
          </div>

          {/* Boss HP Bar Container - top-centered, scaled with vh/vw clamp */}
          <div 
            id="boss-hp-container" 
            style={{
              position: 'absolute',
              top: 'clamp(8px, 2.5vh, 25px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(200px, 45vw, 600px)',
              display: 'none', // Managed programmatically by game.js updateHUD
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              zIndex: 99,
              pointerEvents: 'none'
            }}
          >
            <div 
              id="boss-hp-name" 
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(0.7rem, 1.8vh, 1.1rem)',
                fontWeight: '900',
                color: '#ff0055',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 10px rgba(255, 0, 85, 0.6)'
              }}
            >
              BOSS
            </div>
            <div 
              style={{
                width: '100%',
                height: 'clamp(12px, 2vh, 18px)',
                background: 'rgba(11, 12, 16, 0.85)',
                border: '2px solid rgba(255, 0, 85, 0.4)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 0 12px rgba(255, 0, 85, 0.2)',
                backdropFilter: 'blur(5px)',
                position: 'relative'
              }}
            >
              <div 
                id="boss-hp-bar" 
                style={{
                  height: '100%',
                  width: '100%',
                  background: 'linear-gradient(to right, #ff0055 0%, #ffcc00 100%)',
                  boxShadow: '0 0 8px #ff0055, 0 0 15px rgba(255, 204, 0, 0.4)',
                  transition: 'width 0.15s ease-out'
                }}
              ></div>
              <div 
                id="boss-hp-text" 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'monospace',
                  fontSize: 'clamp(0.6rem, 1.4vh, 0.8rem)',
                  fontWeight: '900',
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                }}
              >
                -- / --
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
          {/* Left Controls: Up (▲) and Down (▼) */}
          <div className="dpad-container dpad-left-vertical">
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

          {/* Right Controls: Left (◀) and Right (▶) */}
          <div className="dpad-container dpad-right-horizontal">
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

          <div className="hud-buttons-container">
            <button className="btn-secondary hud-btn" onClick={() => window.dispatchEvent(new CustomEvent('toggle-pause'))}>
              Pause
            </button>
            <AudioController inGame={true} />
          </div>
        </div>
      )}

      {gameState === 'paused' && (
        <div id="pause-menu" className="ui-overlay">
          <div className="glass-panel">
             <h1 className="neon-text" style={{fontSize: '3rem'}}>PAUSED</h1>
             <p>Press Esc to resume</p>
              <div className="menu-buttons">
                {getPauseOptions().map((opt, idx) => {
                  const isSelected = idx === menuSelectedIndex;
                  
                  let btnClass = "menu-btn";
                  if (opt.id === 'continue') {
                    btnClass += " menu-btn-primary";
                  } else if (opt.id === 'quit') {
                    btnClass += " menu-btn-exit";
                  } else {
                    btnClass += " menu-btn-neon";
                  }
                  
                  if (isSelected) {
                    btnClass += " keyboard-selected";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={opt.action}
                      onMouseEnter={() => setMenuSelectedIndex(idx)}
                      className={btnClass}
                      disabled={opt.disabled}
                      tabIndex="-1"
                      style={opt.id === 'load' ? { opacity: hasSaveData ? 1 : 0.4, cursor: hasSaveData ? 'pointer' : 'not-allowed' } : undefined}
                    >
                      {opt.label}
                    </button>
                  );
                })}
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
            <button onClick={() => startGame(currentLevel)} className="glow-on-hover retry-btn">REDEPLOY (LEVEL {currentLevel})</button>
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
            <button onClick={() => startGame(currentLevel)} className="glow-on-hover">START NEXT LEVEL ({currentLevel})</button>
            <button onClick={quitGameFromGameOver} className="btn-secondary" style={{display: 'block', marginTop: '15px', width: '100%'}}>RETURN TO BASE</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
