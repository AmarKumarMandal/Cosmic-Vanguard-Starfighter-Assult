import React from 'react';

const PATH_NODES = [
  { 
    id: 1, 
    x: 15, 
    y: 30, 
    planetName: "Mercury", 
    color: '#768a96',
    background: 'radial-gradient(circle at 35% 35%, #b5c7d3 0%, #768a96 50%, #3a4b54 95%)',
    sizeScale: 0.65 
  },
  { 
    id: 2, 
    x: 35, 
    y: 20, 
    planetName: "Venus", 
    color: '#d86c66',
    background: 'radial-gradient(circle at 35% 35%, #fca490 0%, #d86c66 50%, #7a2b27 95%)',
    sizeScale: 0.85 
  },
  { 
    id: 3, 
    x: 55, 
    y: 35, 
    planetName: "Earth", 
    color: '#1f94eb',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.85) 85%), radial-gradient(circle at 60% 40%, #76ff03 20%, transparent 22%), radial-gradient(circle at 35% 65%, #76ff03 25%, transparent 27%), #1f94eb',
    sizeScale: 0.95 
  },
  { 
    id: 4, 
    x: 30, 
    y: 65, 
    planetName: "Mars", 
    color: '#c43b23',
    background: 'radial-gradient(circle at 35% 35%, #ff7657 0%, #c43b23 55%, #591104 95%)',
    sizeScale: 0.75 
  },
  { 
    id: 5, 
    x: 50, 
    y: 80, 
    planetName: "Jupiter", 
    color: '#b57a70',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.8) 80%), linear-gradient(180deg, #d3a499 0%, #ecd0c9 15%, #b57a70 30%, #eab6aa 45%, #b57a70 60%, #ecd0c9 75%, #a5685e 100%)',
    sizeScale: 1.4 
  },
  { 
    id: 6, 
    x: 70, 
    y: 65, 
    planetName: "Saturn", 
    color: '#e29b7a',
    background: 'radial-gradient(circle at 35% 35%, #ffdcb3 0%, #e29b7a 50%, #76442c 95%)',
    sizeScale: 1.25,
    hasRings: true,
    ringStyle: { 
      width: '200%', 
      height: '40%', 
      border: '4px solid rgba(255, 255, 255, 0.8)', 
      borderRadius: '50%', 
      transform: 'rotate(-20deg)', 
      position: 'absolute', 
      top: '30%', 
      left: '-50%', 
      pointerEvents: 'none', 
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3), 0 0 10px rgba(0,0,0,0.2)' 
    }
  },
  { 
    id: 7, 
    x: 85, 
    y: 85, 
    planetName: "Uranus", 
    color: '#00acc1',
    background: 'radial-gradient(circle at 35% 35%, #e0f7fa 0%, #00acc1 55%, #006064 95%)',
    sizeScale: 1.1,
    hasRings: true,
    ringStyle: { 
      width: '160%', 
      height: '32%', 
      border: '2px solid rgba(255, 255, 255, 0.85)', 
      borderRadius: '50%', 
      transform: 'rotate(70deg)', 
      position: 'absolute', 
      top: '34%', 
      left: '-30%', 
      pointerEvents: 'none' 
    }
  },
  { 
    id: 8, 
    x: 90, 
    y: 50, 
    planetName: "Neptune", 
    color: '#0d47a1',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.8) 85%), linear-gradient(135deg, #0d47a1 25%, #29b6f6 30%, #0d47a1 35%, #0d47a1 65%, #29b6f6 70%, #0d47a1 75%)',
    sizeScale: 1.05 
  },
  { 
    id: 9, 
    x: 75, 
    y: 25, 
    planetName: "Pluto", 
    color: '#a3a9ae',
    background: 'radial-gradient(circle at 35% 35%, #e1e4e6 0%, #a4b2bc 50%, #465561 95%)',
    sizeScale: 0.6 
  },
  { 
    id: 10, 
    x: 90, 
    y: 15, 
    planetName: "The Sun", 
    color: '#ff8008',
    background: 'radial-gradient(circle at 35% 35%, #fffb8f 0%, #ff8008 45%, #d11919 80%, #630505 100%)',
    sizeScale: 1.55,
    isSun: true
  },
];

export default function LevelMap({ highScore, onSelect, onBack }) {
  const maxUnlocked = Math.max(highScore, 1);

  return (
    <div className="ui-overlay level-map-overlay">
      {/* Background elements to make it look like space/landscape */}
      <div className="map-background"></div>

      <div className="level-map-container">
        <button onClick={onBack} className="btn-secondary map-back-btn">
          RETURN TO BASE
        </button>
        
        <div className="map-content">
          <svg className="map-paths">
            {PATH_NODES.map((node, i) => {
              if (i === PATH_NODES.length - 1) return null;
              const nextNode = PATH_NODES[i + 1];
              const isUnlocked = true; // Line is unlocked if we've beaten the origin node
              return (
                <line
                  key={`path-${node.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${nextNode.x}%`}
                  y2={`${nextNode.y}%`}
                  className={`path-line ${isUnlocked ? 'unlocked' : 'locked'}`}
                />
              );
            })}
          </svg>

          {PATH_NODES.map((node) => {
            const isUnlocked = node.id <= maxUnlocked;
            const isCompleted = node.id < maxUnlocked;
            const isCurrent = node.id === maxUnlocked;
            
            return (
              <div 
                key={node.id}
                className={`level-node-wrapper ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                style={{ 
                  left: `${node.x}%`, 
                  top: `${node.y}%`,
                  '--node-scale': 1.45
                }}
                onClick={() => isUnlocked && onSelect(node.id)}
              >
                <div 
                  className="level-node"
                  style={{
                    background: node.background,
                    boxShadow: isUnlocked 
                      ? (isCompleted 
                          ? `0 0 25px ${node.color}, inset 0 0 10px rgba(255,255,255,0.5)` 
                          : (node.isSun ? `0 0 35px #ff5500, 0 0 70px rgba(255,100,0,0.5), inset 0 0 10px rgba(255,255,255,0.5)` : `inset 0 0 10px rgba(255,255,255,0.5)`)
                        )
                      : `inset 0 0 10px rgba(0,0,0,0.8)`,
                    filter: isUnlocked ? 'none' : 'grayscale(60%) brightness(0.4)'
                  }}
                >
                  {!isUnlocked && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" className="node-lock-svg">
                      <defs>
                        <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="50%" stopColor="#0284c7" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 28 50 L 28 32 A 22 22 0 0 1 72 32 L 72 50" 
                        fill="none" 
                        stroke="#000000" 
                        strokeWidth="11" 
                        strokeLinecap="round"
                      />
                      <rect x="12" y="48" width="76" height="20" rx="7" ry="7" fill="url(#barGrad)" />
                      <rect x="12" y="72" width="76" height="20" rx="7" ry="7" fill="url(#barGrad)" />
                      <rect x="12" y="96" width="76" height="20" rx="7" ry="7" fill="url(#barGrad)" />
                      <path 
                        d="M 50 66 A 9 9 0 0 0 43.5 81 C 43.5 83, 46 84, 46 92 L 54 92 C 54 84, 56.5 83, 56.5 81 A 9 9 0 0 0 50 66 Z" 
                        fill="#000000" 
                        stroke="#ffffff" 
                        strokeWidth="3.5" 
                        strokeLinejoin="miter"
                      />
                    </svg>
                  )}
                  
                  {/* Saturn/Uranus Rings */}
                  {node.hasRings && (
                    <div style={{
                      ...node.ringStyle,
                      opacity: isUnlocked ? 1.0 : 0.4
                    }}></div>
                  )}
                </div>
                {isUnlocked && <div className="node-ring"></div>}
                
                {isUnlocked && (
                  <div className="level-badge">
                    <div className="level-badge-num">{node.id}</div>
                    <div className={`level-badge-stars ${isCompleted ? 'completed' : 'empty'}`}>
                      <span>★</span><span>★</span><span>★</span>
                    </div>
                  </div>
                )}

                {/* Planet Label */}
                <div className="planet-label">
                  {node.planetName}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
