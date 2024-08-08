import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { SectionWithColor } from '@/util/colorUtils';

export const ProgressBar: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const progress = workout.getProgress(time);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4">
      <div className="font-bold mb-2">
        Progress: {formatTime(workout.duration - time)} left
      </div>
      <div className="progress-bar relative h-6 rounded-full overflow-hidden bg-gray-200">
        {workout.sections.map((section: SectionWithColor, index: number) => {
          const sectionStart = workout.sections.slice(0, index).reduce((total, s) => total + (s.duration || 0), 0);
          const sectionWidth = ((section.duration || 0) / workout.duration) * 100;
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
          className="progress-indicator absolute top-0 h-full bg-black opacity-75 w-1"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};