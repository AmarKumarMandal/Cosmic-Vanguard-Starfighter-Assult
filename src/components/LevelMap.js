import React from 'react';

const PATH_NODES = [
  { 
    id: 1, 
    x: 15, 
    y: 30, 
    planetName: "Mercury", 
    color: '#8c8c8c',
    background: 'radial-gradient(circle at 30% 30%, #dcdcdc, #8c8c8c 50%, #2f2f2f 95%)',
    sizeScale: 0.65 
  },
  { 
    id: 2, 
    x: 35, 
    y: 20, 
    planetName: "Venus", 
    color: '#e6a15c',
    background: 'radial-gradient(circle at 30% 30%, #ffe9b3, #e6a15c 50%, #522d05 95%)',
    sizeScale: 0.85 
  },
  { 
    id: 3, 
    x: 55, 
    y: 35, 
    planetName: "Earth", 
    color: '#2b82c9',
    background: 'radial-gradient(circle at 30% 30%, #a3e2ff, #2b82c9 45%, #186326 65%, #051a08 95%)',
    sizeScale: 0.95 
  },
  { 
    id: 4, 
    x: 30, 
    y: 65, 
    planetName: "Mars", 
    color: '#c1440e',
    background: 'radial-gradient(circle at 30% 30%, #f07f43, #c1440e 55%, #7a0000 70%, #290000 95%)',
    sizeScale: 0.75 
  },
  { 
    id: 5, 
    x: 50, 
    y: 80, 
    planetName: "Jupiter", 
    color: '#d4a373',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.8) 80%), linear-gradient(180deg, #7c5835, #d4a373 20%, #e8bc8c 40%, #a67b56 60%, #d4a373 80%, #7c5835)',
    sizeScale: 1.4 
  },
  { 
    id: 6, 
    x: 70, 
    y: 65, 
    planetName: "Saturn", 
    color: '#e2c391',
    background: 'radial-gradient(circle at 30% 30%, #fff0d4, #e2c391 50%, #4f3b20 95%)',
    sizeScale: 1.25,
    hasRings: true,
    ringStyle: { 
      width: '200%', 
      height: '40%', 
      border: '4px solid rgba(226, 195, 145, 0.7)', 
      borderRadius: '50%', 
      transform: 'rotate(-15deg)', 
      position: 'absolute', 
      top: '30%', 
      left: '-50%', 
      pointerEvents: 'none', 
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)' 
    }
  },
  { 
    id: 7, 
    x: 85, 
    y: 85, 
    planetName: "Uranus", 
    color: '#4bcfd9',
    background: 'radial-gradient(circle at 30% 30%, #b3f7fc, #4bcfd9 50%, #0d4a52 95%)',
    sizeScale: 1.1,
    hasRings: true,
    ringStyle: { 
      width: '160%', 
      height: '32%', 
      border: '2px solid rgba(179, 247, 252, 0.5)', 
      borderRadius: '50%', 
      transform: 'rotate(75deg)', 
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
    color: '#274687',
    background: 'radial-gradient(circle at 30% 30%, #7d9fe6, #274687 55%, #050d24 95%)',
    sizeScale: 1.05 
  },
  { 
    id: 9, 
    x: 75, 
    y: 25, 
    planetName: "Pluto", 
    color: '#a39992',
    background: 'radial-gradient(circle at 30% 30%, #e5dfda, #a39992 50%, #302b28 95%)',
    sizeScale: 0.6 
  },
  { 
    id: 10, 
    x: 90, 
    y: 15, 
    planetName: "The Sun", 
    color: '#ff4500',
    background: 'radial-gradient(circle at 45% 45%, #ffffff 0%, #ffea00 20%, #ff8c00 50%, #ff0000 85%, #660000 100%)',
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
                  style={isUnlocked ? {
                    background: node.background,
                    boxShadow: isCompleted 
                      ? `0 0 25px ${node.color}, inset 0 0 10px rgba(255,255,255,0.5)` 
                      : (node.isSun ? `0 0 35px #ff5500, 0 0 70px rgba(255,100,0,0.5), inset 0 0 10px rgba(255,255,255,0.5)` : `inset 0 0 10px rgba(255,255,255,0.5)`)
                  } : {}}
                >
                  {!isUnlocked && <span className="node-lock">🔒</span>}
                  
                  {/* Saturn/Uranus Rings */}
                  {isUnlocked && node.hasRings && (
                    <div style={node.ringStyle}></div>
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
