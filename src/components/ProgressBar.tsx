// ProgressBar.tsx
import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const ProgressBar: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const progress = workout.getProgress(time);

  return (
    <div className="mb-4">
      <div className="font-bold mb-2">
        Progress: {formatTime(workout.duration - time)} left
      </div>
      <div className="progress-bar">
        {workout.sections.map((section, index) => {
          const sectionStart = workout.sections.slice(0, index).reduce((total, s) => total + s.duration, 0);
          const sectionWidth = section.duration / workout.duration * 100;
          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${section.color}`}
              style={{
                left: `${(sectionStart / workout.duration) * 100}%`,
                width: `${sectionWidth}%`
              }}
            />
          );
        })}
        <div
          className="progress-indicator"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};
