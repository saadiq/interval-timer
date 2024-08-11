import { useRef, useCallback } from 'react';

export function useAudioCue() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency: number, duration: number, time: number) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(1, time + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(time);
    oscillator.stop(time + duration);
  }, []);

  const playAudioCue = useCallback((delay: number = 0, count: number = 3) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const now = audioContextRef.current.currentTime;
    const shortBeepDuration = 0.1;
    const longBeepDuration = 0.3;

    for (let i = 0; i < count - 1; i++) {
      playTone(440, shortBeepDuration, now + delay + i); // A4
    }
    playTone(523.25, longBeepDuration, now + delay + count - 1); // C5
  }, [playTone]);

  return playAudioCue;
}