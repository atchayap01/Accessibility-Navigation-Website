import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { BrailleTranslator } from '@/app/components/BrailleTranslator';
import { NavigationGrid } from '@/app/components/NavigationGrid';
import { ObstacleDetector, Obstacle } from '@/app/components/ObstacleDetector';
import { VoiceGuidance } from '@/app/components/VoiceGuidance';
import { 
  Eye, 
  Navigation2, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Accessibility 
} from 'lucide-react';

interface GridCell {
  x: number;
  y: number;
  hasObstacle: boolean;
}

export default function App() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('Welcome to the Navigation Assistant');
  const [userPosition, setUserPosition] = useState({ x: 5, y: 5 });
  const [obstacleGrid, setObstacleGrid] = useState<GridCell[]>([]);
  const [detectedObstacles, setDetectedObstacles] = useState<Obstacle[]>([]);
  const gridSize = 11;

  // Generate random obstacles on mount
  useEffect(() => {
    generateObstacles();
  }, []);

  const generateObstacles = () => {
    const obstacles: GridCell[] = [];
    const numberOfObstacles = 15;
    
    for (let i = 0; i < numberOfObstacles; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
      } while (
        (x === userPosition.x && y === userPosition.y) || 
        obstacles.some(obs => obs.x === x && obs.y === y)
      );
      
      obstacles.push({ x, y, hasObstacle: true });
    }
    
    setObstacleGrid(obstacles);
  };

  // Detect nearby obstacles
  useEffect(() => {
    const nearby = obstacleGrid
      .map(obs => {
        const dx = obs.x - userPosition.x;
        const dy = obs.y - userPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let direction = '';
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'RIGHT' : 'LEFT';
        } else {
          direction = dy > 0 ? 'DOWN' : 'UP';
        }
        
        if (dy > 0 && dx > 0) direction = 'FRONT-RIGHT';
        else if (dy > 0 && dx < 0) direction = 'FRONT-LEFT';
        else if (dy < 0 && dx > 0) direction = 'BACK-RIGHT';
        else if (dy < 0 && dx < 0) direction = 'BACK-LEFT';
        
        let severity: 'high' | 'medium' | 'low' = 'low';
        if (distance < 1.5) severity = 'high';
        else if (distance < 2.5) severity = 'medium';
        
        return {
          id: `${obs.x}-${obs.y}`,
          type: distance < 2 ? 'Wall' : 'Object',
          direction,
          distance,
          position: { x: obs.x, y: obs.y },
          severity,
        };
      })
      .filter(obs => obs.distance <= 3)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    setDetectedObstacles(nearby);
    
    // Update message based on obstacles
    if (nearby.length === 0) {
      setCurrentMessage('Path is clear ahead');
      if (voiceEnabled) speak('Path is clear ahead');
    } else {
      const closest = nearby[0];
      const message = `Obstacle detected ${closest.direction.toLowerCase()}, ${closest.distance.toFixed(1)} meters away`;
      setCurrentMessage(message);
      if (voiceEnabled && closest.severity === 'high') {
        speak(`Warning! ${message}`);
      }
    }
  }, [userPosition, obstacleGrid, voiceEnabled]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.volume = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const moveUser = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(gridSize - 1, userPosition.x + dx));
    const newY = Math.max(0, Math.min(gridSize - 1, userPosition.y + dy));
    
    // Check if new position has obstacle
    const hasObstacle = obstacleGrid.some(obs => obs.x === newX && obs.y === newY);
    
    if (hasObstacle) {
      const message = 'Cannot move - obstacle blocking path';
      setCurrentMessage(message);
      if (voiceEnabled) speak(message);
    } else {
      setUserPosition({ x: newX, y: newY });
      const direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
      const message = `Moved ${direction}`;
      setCurrentMessage(message);
      if (voiceEnabled) speak(message);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveUser(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveUser(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveUser(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveUser(1, 0);
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          setVoiceEnabled(prev => !prev);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          generateObstacles();
          setCurrentMessage('Environment reset');
          if (voiceEnabled) speak('Environment reset');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userPosition, obstacleGrid, voiceEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-gray-800/80 backdrop-blur-sm border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Accessibility className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  Accessible Navigation Assistant
                </h1>
                <p className="text-gray-300 mt-1">
                  Voice guidance, braille display, and obstacle detection for safe navigation
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                generateObstacles();
                setCurrentMessage('Environment reset');
                if (voiceEnabled) speak('Environment reset');
              }}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset Environment
            </Button>
          </div>
        </Card>

        {/* Voice Guidance */}
        <VoiceGuidance 
          isActive={voiceEnabled} 
          onToggle={() => setVoiceEnabled(!voiceEnabled)} 
        />

        {/* Braille Display */}
        <BrailleTranslator text={currentMessage} onSpeak={speak} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Navigation Grid */}
          <NavigationGrid
            obstacles={obstacleGrid}
            userPosition={userPosition}
            gridSize={gridSize}
            onCellDetected={() => {}}
          />

          {/* Obstacle Detector */}
          <ObstacleDetector obstacles={detectedObstacles} />
        </div>

        {/* Navigation Controls */}
        <Card className="p-6 bg-gray-800/80 backdrop-blur-sm border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Navigation2 className="w-6 h-6" />
            Navigation Controls
          </h3>
          
          <div className="flex flex-col items-center gap-4">
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm mb-2">Current Position</p>
              <p className="text-white text-2xl font-bold">
                ({userPosition.x}, {userPosition.y})
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div></div>
              <Button
                onClick={() => moveUser(0, -1)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-20 h-20"
                aria-label="Move up"
              >
                <ArrowUp className="w-8 h-8" />
              </Button>
              <div></div>

              <Button
                onClick={() => moveUser(-1, 0)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-20 h-20"
                aria-label="Move left"
              >
                <ArrowLeft className="w-8 h-8" />
              </Button>
              <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <Button
                onClick={() => moveUser(1, 0)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-20 h-20"
                aria-label="Move right"
              >
                <ArrowRight className="w-8 h-8" />
              </Button>

              <div></div>
              <Button
                onClick={() => moveUser(0, 1)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-20 h-20"
                aria-label="Move down"
              >
                <ArrowDown className="w-8 h-8" />
              </Button>
              <div></div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">Keyboard Shortcuts:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <span className="text-blue-400 font-mono">↑/W</span>
                  <span className="text-gray-300"> - Move Up</span>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <span className="text-blue-400 font-mono">↓/S</span>
                  <span className="text-gray-300"> - Move Down</span>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <span className="text-blue-400 font-mono">←/A</span>
                  <span className="text-gray-300"> - Move Left</span>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <span className="text-blue-400 font-mono">→/D</span>
                  <span className="text-gray-300"> - Move Right</span>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <span className="text-blue-400 font-mono">V</span>
                  <span className="text-gray-300"> - Toggle Voice</span>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <span className="text-blue-400 font-mono">R</span>
                  <span className="text-gray-300"> - Reset</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Accessibility Info */}
        <Card className="p-4 bg-green-900/20 border-green-700">
          <p className="text-green-300 text-sm text-center">
            <strong>Accessibility Features:</strong> High contrast design, keyboard navigation, 
            voice synthesis, braille output, and real-time obstacle detection for enhanced safety
          </p>
        </Card>
      </div>
    </div>
  );
}
