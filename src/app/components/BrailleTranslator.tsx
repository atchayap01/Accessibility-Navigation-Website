import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Volume2 } from 'lucide-react';

interface BrailleTranslatorProps {
  text: string;
  onSpeak?: (text: string) => void;
}

// Simple braille mapping for English alphabet and common characters
const brailleMap: { [key: string]: string } = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
  'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
  'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
  'y': '⠽', 'z': '⠵',
  '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑',
  '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚',
  ' ': '⠀', '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦', '-': '⠤',
  'obstacle': '⠕⠃⠎⠞⠁⠉⠇⠑',
  'clear': '⠉⠇⠑⠁⠗',
  'path': '⠏⠁⠞⠓',
  'warning': '⠺⠁⠗⠝⠊⠝⠛',
  'ahead': '⠁⠓⠑⠁⠙',
  'left': '⠇⠑⠋⠞',
  'right': '⠗⠊⠛⠓⠞',
  'front': '⠋⠗⠕⠝⠞',
};

export function BrailleTranslator({ text, onSpeak }: BrailleTranslatorProps) {
  const textToBraille = (input: string): string => {
    const lowercaseInput = input.toLowerCase();
    
    // Check for whole word matches first
    for (const [word, braille] of Object.entries(brailleMap)) {
      if (word.length > 1 && lowercaseInput.includes(word)) {
        return lowercaseInput
          .split(' ')
          .map(w => brailleMap[w] || w.split('').map(c => brailleMap[c] || c).join(''))
          .join('⠀');
      }
    }
    
    // Character by character translation
    return lowercaseInput
      .split('')
      .map(char => brailleMap[char] || char)
      .join('');
  };

  const brailleText = textToBraille(text);

  return (
    <Card className="p-6 bg-blue-950 border-blue-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-blue-100 mb-2">Braille Display</h3>
          <div className="bg-black/30 p-4 rounded-lg border-2 border-blue-600 min-h-[80px]">
            <p className="text-5xl text-blue-100 font-mono leading-relaxed tracking-wider break-words">
              {brailleText}
            </p>
          </div>
          <div className="mt-3 text-sm text-blue-300">
            <p>Original: {text}</p>
          </div>
        </div>
        {onSpeak && (
          <Button
            onClick={() => onSpeak(text)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Speak text aloud"
          >
            <Volume2 className="w-6 h-6" />
          </Button>
        )}
      </div>
    </Card>
  );
}
