// ProgressBar.tsx
import React, { useMemo } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { WorkoutSection, BaseSection } from '@/app/types';

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const ProgressBar: React.FC = () => {
  const { workout, workoutData, time } = useWorkoutContext();

  if (!workout || !workoutData) return null;

  const progress = workout.getProgress(time);

  const getSectionColor = useMemo(() => {
    const warmUpColors = workoutData.warmUp.map(() => 'bg-yellow-300');
    const coolDownColors = workoutData.coolDown.map(() => 'bg-yellow-300');
    let mainWorkoutColors: string[];
    
    if (workoutData.type === 'amrap') {
      mainWorkoutColors = workoutData.workout.exercises.map(() => 'bg-blue-300');
    } else if (workoutData.type === 'circuit') {
      mainWorkoutColors = workoutData.workout.exercises.map((_, index) => 
        index % 2 === 0 ? 'bg-blue-300' : 'bg-green-400'
      );
    } else { // tabata
      mainWorkoutColors = workoutData.workout.exercises.flatMap(() => ['bg-blue-300', 'bg-red-300']);
    }

    return (section: WorkoutSection, index: number): string => {
      if (workoutData.warmUp.includes(section as BaseSection)) {
        return warmUpColors[workoutData.warmUp.indexOf(section as BaseSection)];
      } else if (workoutData.coolDown.includes(section as BaseSection)) {
        return coolDownColors[workoutData.coolDown.indexOf(section as BaseSection)];
      } else {
        return mainWorkoutColors[index % mainWorkoutColors.length];
      }
    };
  }, [workoutData]);

  return (
    <div className="mb-4">
      <div className="font-bold mb-2">
        Progress: {formatTime(workout.duration - time)} left
      </div>
      <div className="progress-bar relative h-6 rounded-full overflow-hidden bg-gray-200">
        {workout.sections.map((section, index) => {
          const sectionStart = workout.sections.slice(0, index).reduce((total, s) => total + (s.duration || 0), 0);
          const sectionWidth = (section.duration || 0) / workout.duration * 100;
          const color = getSectionColor(section, index);
          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${color}`}
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