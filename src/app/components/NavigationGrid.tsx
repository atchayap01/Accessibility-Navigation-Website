import React, { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

interface GridCell {
  x: number;
  y: number;
  hasObstacle: boolean;
  distance?: number;
}

interface NavigationGridProps {
  obstacles: GridCell[];
  userPosition: { x: number; y: number };
  gridSize: number;
  onCellDetected?: (cell: GridCell) => void;
}

export function NavigationGrid({ 
  obstacles, 
  userPosition, 
  gridSize,
  onCellDetected 
}: NavigationGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Detect obstacles near user position
    obstacles.forEach(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.x - userPosition.x, 2) + 
        Math.pow(obstacle.y - userPosition.y, 2)
      );
      
      if (distance <= 2 && onCellDetected) {
        onCellDetected({ ...obstacle, distance });
      }
    });
  }, [obstacles, userPosition, onCellDetected]);

  const getCellState = (x: number, y: number): 'user' | 'obstacle' | 'clear' | 'near-obstacle' => {
    if (x === userPosition.x && y === userPosition.y) return 'user';
    
    const hasObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
    if (hasObstacle) return 'obstacle';
    
    // Check if near obstacle
    const nearObstacle = obstacles.some(obs => {
      const dist = Math.sqrt(Math.pow(obs.x - x, 2) + Math.pow(obs.y - y, 2));
      return dist <= 1.5 && dist > 0;
    });
    
    return nearObstacle ? 'near-obstacle' : 'clear';
  };

  const getCellColor = (state: string): string => {
    switch (state) {
      case 'user':
        return 'bg-blue-500 border-blue-300 shadow-lg shadow-blue-500/50';
      case 'obstacle':
        return 'bg-red-600 border-red-400';
      case 'near-obstacle':
        return 'bg-yellow-600 border-yellow-400';
      default:
        return 'bg-green-700 border-green-500';
    }
  };

  const getDirectionToUser = (x: number, y: number): string => {
    const dx = userPosition.x - x;
    const dy = userPosition.y - y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Navigation className="w-6 h-6" />
        Navigation Grid Map
      </h3>
      
      <div className="bg-black/40 p-4 rounded-lg border-2 border-gray-600">
        <div 
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const state = getCellState(x, y);
            const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className={`
                  aspect-square border-2 rounded transition-all duration-200
                  ${getCellColor(state)}
                  ${isHovered ? 'scale-110 z-10' : ''}
                  cursor-pointer relative group
                `}
                onMouseEnter={() => setHoveredCell({ x, y })}
                onMouseLeave={() => setHoveredCell(null)}
                role="gridcell"
                aria-label={`Grid position ${x},${y}: ${state}`}
              >
                {state === 'user' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                )}
                
                {state === 'obstacle' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                )}

                {isHovered && state !== 'user' && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                    bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-20 
                    border border-gray-600">
                    Position: ({x}, {y})
                    <br />
                    Direction: {getDirectionToUser(x, y)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-300"></div>
          <span className="text-gray-300">Your Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded border-2 border-red-400"></div>
          <span className="text-gray-300">Obstacle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600 rounded border-2 border-yellow-400"></div>
          <span className="text-gray-300">Warning Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-700 rounded border-2 border-green-500"></div>
          <span className="text-gray-300">Clear Path</span>
        </div>
      </div>
    </Card>
  );
}
