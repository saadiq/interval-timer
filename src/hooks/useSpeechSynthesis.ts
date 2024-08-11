// src/hooks/useSpeechSynthesis.ts
import { useCallback } from 'react';

export function useSpeechSynthesis() {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1; // Slightly faster than normal speech
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { speak };
}