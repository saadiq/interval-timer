import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { WorkoutSection, BaseSection } from '@/app/types';
import { AMRAPWorkout } from '@/app/AMRAPWorkout';
import { Workout } from '@/app/Workout';
import { SectionWithColor } from '@/util/colorUtils';

export const CountdownDisplay: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const currentSection = workout.getCurrentSection(time);
  const nextSection = workout.getNextSection(time);
  
  if (!currentSection) return <div>No current section found</div>;

  const timeRemaining = calculateTimeRemaining(workout, currentSection, time);

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

function isSectionWithColor(section: WorkoutSection): section is SectionWithColor {
  return 'color' in section;
}

const calculateTimeRemaining = (workout: Workout, section: WorkoutSection, currentTime: number): number => {
  if (!isSectionWithColor(section)) {
    console.warn('Section without color encountered:', section);
    return section.duration || 0;
  }

  if (workout instanceof AMRAPWorkout && workout.isAMRAPSection(section)) {
    const amrapSection = workout.getAMRAPSection();
    if (amrapSection) {
      const amrapStartTime = workout.sections
        .slice(0, workout.sections.indexOf(section))
        .reduce((total, s) => total + (s.duration || 0), 0);
      return Math.max(0, amrapSection.duration - (currentTime - amrapStartTime));
    }
  }
  
  const sectionStart = workout.sections
    .slice(0, workout.sections.indexOf(section))
    .reduce((total, s) => total + (s.duration || 0), 0);
  return Math.max(0, (section.duration || 0) - (currentTime - sectionStart));
};

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};