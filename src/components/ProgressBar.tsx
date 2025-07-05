import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { SectionWithColor } from '@/utils/colorUtils';
import { TabataWorkout } from '@/workouts';

export const ProgressBar: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const progress = workout.getProgress(time);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAllSections = (): SectionWithColor[] => {
    const warmUpSections = workout.data.warmUp.map(s => ({ ...s, color: 'bg-yellow-300' }));
    const coolDownSections = workout.data.coolDown.map(s => ({ ...s, color: 'bg-yellow-300' }));

    let mainWorkoutSections: SectionWithColor[];
    if (workout instanceof TabataWorkout) {
      mainWorkoutSections = workout.getTabataSections().map(s => ({
        name: s.name,
        duration: s.duration,
        color: s.color
      }));
    } else {
      mainWorkoutSections = workout.sections.filter(s => 
        !workout.data.warmUp.some(w => w.name === s.name) && 
        !workout.data.coolDown.some(c => c.name === s.name)
      );
    }

    return [...warmUpSections, ...mainWorkoutSections, ...coolDownSections];
  };

  const sections = getAllSections();

  return (
    <div className="mb-4" role="region" aria-labelledby="workout-progress">
      <div id="workout-progress" className="font-bold mb-2">
        Progress: {formatTime(workout.duration - time)} left
      </div>
      <div 
        className="progress-bar relative h-6 rounded-full overflow-hidden bg-gray-200"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Workout progress: ${Math.round(progress * 100)}% complete, ${formatTime(workout.duration - time)} remaining`}
      >
        {sections.map((section, index) => {
          const sectionStart = sections.slice(0, index).reduce((total, s) => total + (s.duration || 0), 0);
          const sectionWidth = ((section.duration || 0) / workout.duration) * 100;
          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${section.color}`}
              style={{
                left: `${(sectionStart / workout.duration) * 100}%`,
                width: `${sectionWidth}%`
              }}
              aria-label={`${section.name} section`}
            />
          );
        })}
        <div
          className="progress-indicator absolute top-0 h-full bg-black opacity-75 w-1"
          style={{ left: `${progress * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};