import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

export interface Obstacle {
  id: string;
  type: string;
  direction: string;
  distance: number;
  position: { x: number; y: number };
  severity: 'high' | 'medium' | 'low';
}

interface ObstacleDetectorProps {
  obstacles: Obstacle[];
}

export function ObstacleDetector({ obstacles }: ObstacleDetectorProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600 hover:bg-red-600 text-white border-red-400';
      case 'medium':
        return 'bg-yellow-600 hover:bg-yellow-600 text-white border-yellow-400';
      case 'low':
        return 'bg-blue-600 hover:bg-blue-600 text-white border-blue-400';
      default:
        return 'bg-gray-600 hover:bg-gray-600 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          Obstacle Detection
        </h3>
        <Badge 
          variant="outline" 
          className="text-lg px-3 py-1 bg-gray-800 text-white border-gray-600"
        >
          {obstacles.length} Detected
        </Badge>
      </div>

      {obstacles.length === 0 ? (
        <div className="bg-green-900/30 border-2 border-green-600 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <p className="text-green-300 text-lg font-medium">Path is Clear</p>
          <p className="text-green-400 text-sm mt-2">No obstacles detected in your vicinity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 
                hover:border-gray-500 transition-colors"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getSeverityIcon(obstacle.severity)}
                    <h4 className="text-lg font-semibold text-white">{obstacle.type}</h4>
                    <Badge className={getSeverityColor(obstacle.severity)}>
                      {obstacle.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-gray-300">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-blue-400">Direction:</span>
                      <span className="text-white uppercase tracking-wide">{obstacle.direction}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-blue-400">Distance:</span>
                      <span className="text-white">{obstacle.distance.toFixed(1)} meters</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-blue-400">Position:</span>
                      <span className="text-white">
                        ({obstacle.position.x}, {obstacle.position.y})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {obstacle.severity === 'high' && (
                <div className="mt-3 pt-3 border-t border-red-800">
                  <p className="text-red-300 font-medium text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    CAUTION: Immediate obstacle ahead - Please stop or change direction
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
