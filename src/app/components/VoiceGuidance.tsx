import React, { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Volume2, VolumeX, Settings, Play, Pause } from 'lucide-react';
import { Slider } from '@/app/components/ui/slider';

interface VoiceGuidanceProps {
  isActive: boolean;
  onToggle: () => void;
}

export function VoiceGuidance({ isActive, onToggle }: VoiceGuidanceProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [rate, setRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance(
      'Voice guidance is now active. I will help you navigate safely.'
    );
    
    if (voices[selectedVoice]) {
      utterance.voice = voices[selectedVoice];
    }
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.pitch = pitch;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="p-6 bg-purple-950 border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-purple-100 flex items-center gap-2">
          {isActive ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          Voice Guidance System
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className="bg-purple-900 border-purple-700 text-purple-100 hover:bg-purple-800"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            onClick={onToggle}
            size="lg"
            className={`${
              isActive 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
            aria-label={isActive ? 'Disable voice guidance' : 'Enable voice guidance'}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            <span className="ml-2">{isActive ? 'Active' : 'Inactive'}</span>
          </Button>
        </div>
      </div>

      <div className="bg-purple-900/40 p-4 rounded-lg border-2 border-purple-700">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <p className="text-purple-100 font-medium">
            Status: {isActive ? 'Voice guidance enabled' : 'Voice guidance disabled'}
          </p>
        </div>
        
        <p className="text-purple-200 text-sm">
          {isActive 
            ? 'The system will provide spoken warnings and directions as you navigate.' 
            : 'Enable voice guidance to receive audio instructions and obstacle warnings.'}
        </p>
      </div>

      {showSettings && (
        <div className="mt-4 space-y-4 bg-purple-900/20 p-4 rounded-lg border border-purple-700">
          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">
              Voice Selection
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(Number(e.target.value))}
              className="w-full bg-purple-900 border-purple-700 text-purple-100 
                rounded-md px-3 py-2 text-sm"
            >
              {voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">
              Speech Rate: {rate.toFixed(1)}x
            </label>
            <Slider
              value={[rate]}
              onValueChange={([value]) => setRate(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">
              Volume: {Math.round(volume * 100)}%
            </label>
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">
              Pitch: {pitch.toFixed(1)}
            </label>
            <Slider
              value={[pitch]}
              onValueChange={([value]) => setPitch(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <Button
            onClick={testVoice}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test Voice Settings
          </Button>
        </div>
      )}
    </Card>
  );
}

// Export settings for use in main app
export const getVoiceSettings = () => {
  return {
    rate: 1,
    volume: 1,
    pitch: 1,
  };
};
