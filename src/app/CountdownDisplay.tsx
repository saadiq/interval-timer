// CountdownDisplay.tsx
import React from 'react';
import { useWorkoutContext } from './WorkoutContext';

export const CountdownDisplay: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const currentSection = workout.getCurrentSection(time);
  const nextSection = workout.getNextSection(time);
  const timeRemaining = currentSection.duration - (time % currentSection.duration);

  return (
    <div>
      <div className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 text-center">
        {formatTime(timeRemaining)}
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center">
        {currentSection.name}
      </div>
      <div className="text-base sm:text-lg mb-2 text-center">
        {currentSection.description || '\u00A0'}
      </div>
      <div className="text-lg sm:text-xl lg:text-2xl text-gray-600 text-center">
        {nextSection ? `Next: ${nextSection.name}` : 'Workout Complete'}
      </div>
    </div>
  );
};

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};