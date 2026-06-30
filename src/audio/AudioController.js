'use client';

import { useEffect, useState, useRef } from 'react';
import soundManagerInstance from './SoundManager';

export default function AudioController({ inGame = false }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('cyberpunk');
  const containerRef = useRef(null);

  // Sync state with SoundManager on mount and via custom events
  useEffect(() => {
    const syncState = (e) => {
      const detail = e ? e.detail : null;
      if (detail) {
        setIsPlaying(detail.isPlaying);
        setIsMuted(detail.isMuted);
        setVolume(detail.volume);
        setCurrentTrack(detail.currentTrack);
      } else if (soundManagerInstance) {
        if (soundManagerInstance.audioCtx) {
          setIsPlaying(soundManagerInstance.isPlaying);
        } else {
          setIsPlaying(true);
        }
        setIsMuted(soundManagerInstance.isMuted);
        setVolume(soundManagerInstance.volume);
        setCurrentTrack(soundManagerInstance.currentTrackKey);
      }
    };

    syncState();

    window.addEventListener('sound-manager-state', syncState);
    return () => {
      window.removeEventListener('sound-manager-state', syncState);
    };
  }, []);

  // When context changes (menu <-> gameplay), ensure active track is valid for that context
  useEffect(() => {
    if (!soundManagerInstance) return;
    const track = soundManagerInstance.currentTrackKey;
    if (inGame && track === 'tempest') {
      // Switched to gameplay but tempest is playing — switch to cyberpunk
      soundManagerInstance.setTrack('cyberpunk');
    } else if (!inGame && track !== 'tempest') {
      // Switched to menu but a gameplay track is playing — switch to tempest
      soundManagerInstance.setTrack('tempest');
    }
  }, [inGame]);

  // Try autoplaying immediately and fallback to interaction listeners if blocked
  useEffect(() => {
    if (!soundManagerInstance) return;

    let cleanupListeners = null;

    const startAudio = () => {
      // If it's already playing, or if it's muted, we don't need to force play
      if (soundManagerInstance.isPlaying || soundManagerInstance.isMuted) {
        if (cleanupListeners) cleanupListeners();
        return;
      }
      soundManagerInstance.play();
    };

    const handleInteraction = () => {
      startAudio();
    };

    const setupListeners = () => {
      window.addEventListener('click', handleInteraction);
      window.addEventListener('mousedown', handleInteraction);
      window.addEventListener('pointerdown', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
    };

    cleanupListeners = () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    // Clean up interaction listeners once sound starts playing
    const handleStateChange = (e) => {
      if (e.detail && e.detail.isPlaying) {
        if (cleanupListeners) cleanupListeners();
        window.removeEventListener('sound-manager-state', handleStateChange);
      }
    };
    window.addEventListener('sound-manager-state', handleStateChange);

    // 1. Try playing immediately on mount
    startAudio();

    // 2. Add interaction listeners as a fallback if autoplay is blocked
    setupListeners();

    return () => {
      if (cleanupListeners) cleanupListeners();
      window.removeEventListener('sound-manager-state', handleStateChange);
    };
  }, []);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (!soundManagerInstance) return;
    if (isPlaying) {
      soundManagerInstance.stop();
    } else {
      soundManagerInstance.play();
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    if (!soundManagerInstance) return;
    soundManagerInstance.toggleMute();
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    if (!soundManagerInstance) return;
    const newVol = parseFloat(e.target.value);
    soundManagerInstance.setVolume(newVol);
    // Auto-unmute when volume is manually increased
    if (newVol > 0 && soundManagerInstance.isMuted) {
      soundManagerInstance.toggleMute();
    }
  };

  const handleTrackChange = (e) => {
    e.stopPropagation();
    if (!soundManagerInstance) return;
    soundManagerInstance.setTrack(e.target.value);
  };

  // Prevent event propagation so mouse click doesn't trigger shooter game canvas actions
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Prevent key events from bubbling up (e.g. arrow keys/spacebar on components shouldn't move the ship)
  const handleKeyDown = (e) => {
    e.stopPropagation();
  };

  // Select appropriate volume icon
  const renderSpeakerIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="audio-icon">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="22" y1="9" x2="16" y2="15"></line>
          <line x1="16" y1="9" x2="22" y2="15"></line>
        </svg>
      );
    }
    if (volume < 0.3) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="audio-icon">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      );
    }
    if (volume < 0.7) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="audio-icon">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="audio-icon">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        <path d="M22.5 1.5a15 15 0 0 1 0 21"></path>
      </svg>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`audio-controller-row-container ${inGame ? 'in-game' : ''}`}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onKeyDown={handleKeyDown}
    >
      {!isPlaying && !isMuted && (
        <span 
          className="audio-start-prompt"
          onClick={(e) => {
            e.stopPropagation();
            if (soundManagerInstance) soundManagerInstance.play();
          }}
        >
          TAP ANYWHERE TO PLAY MUSIC 🔊
        </span>
      )}
      {inGame && (
        <button 
          className={`audio-control-btn ${isPlaying ? 'playing' : 'paused'}`} 
          onClick={handleTogglePlay}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
              <rect x="6" y="4" width="4" height="16" rx="1"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
      )}

      {inGame && (
        <div className="audio-track-select-container">
          <select 
            className="audio-track-select"
            value={currentTrack}
            onChange={handleTrackChange}
            title="Choose Soundtrack"
          >
            <option value="cyberpunk">Cyberpunk</option>
            <option value="overdrive">Nebula Overdrive</option>
          </select>
        </div>
      )}

      <div className="audio-volume-wrapper">
        <button 
          className={`audio-control-btn ${isMuted ? 'muted' : 'unmuted'}`} 
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Music' : 'Mute Music'}
        >
          {renderSpeakerIcon()}
        </button>
        <div className="audio-slider-popover">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={isMuted ? 0 : volume} 
            onChange={handleVolumeChange} 
            className="audio-volume-slider"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
}
