import React from 'react';

const PATH_NODES = [
  { id: 1, x: 15, y: 30, color: '#3b82f6' }, 
  { id: 2, x: 35, y: 20, color: '#4ade80' }, 
  { id: 3, x: 55, y: 35, color: '#f59e0b' }, 
  { id: 4, x: 30, y: 65, color: '#ef4444' }, 
  { id: 5, x: 50, y: 80, color: '#a855f7' }, 
  { id: 6, x: 70, y: 65, color: '#ec4899' }, 
  { id: 7, x: 85, y: 85, color: '#14b8a6' }, 
  { id: 8, x: 90, y: 50, color: '#f97316' }, 
  { id: 9, x: 75, y: 25, color: '#0ea5e9' }, 
  { id: 10, x: 90, y: 15, color: '#eab308' },
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
              const isUnlocked = true; // node.id < maxUnlocked; // Line is unlocked if we've beaten the origin node
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
            const isUnlocked = true; // node.id <= maxUnlocked;
            const isCompleted = node.id < maxUnlocked;
            const isCurrent = node.id === maxUnlocked;
            
            return (
              <div 
                key={node.id}
                className={`level-node-wrapper ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => isUnlocked && onSelect(node.id)}
              >
                <div 
                  className="level-node"
                  style={isUnlocked ? {
                    background: `radial-gradient(circle at 30% 30%, #ffffff, ${node.color} 40%, #000000 90%)`,
                    boxShadow: isCompleted ? `0 0 25px ${node.color}, inset 0 0 10px rgba(255,255,255,0.5)` : `inset 0 0 10px rgba(255,255,255,0.5)`
                  } : {}}
                >
                  {!isUnlocked && <span className="node-lock">🔒</span>}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
