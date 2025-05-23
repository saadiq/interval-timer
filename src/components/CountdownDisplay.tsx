// src/components/CountdownDisplay.tsx
import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { AMRAPWorkout, Workout, WorkoutSection } from '@/workouts';
import { SectionWithColor } from '@/util/colorUtils';

export const CountdownDisplay: React.FC = () => {
  const { workout, time, isPreWorkout, preWorkoutCountdown } = useWorkoutContext();

  if (!workout) return null;

  const currentSection = workout.getCurrentSection(time);
  const nextSection = workout.getNextSection(time);
  
  if (!currentSection && !isPreWorkout) return <div>No current section found</div>;

  const timeRemaining = isPreWorkout ? 0 : calculateTimeRemaining(workout, currentSection!, time);
  const isLastSection = workout.sections[workout.sections.length - 1] === currentSection;
  const isWorkoutComplete = !isPreWorkout && isLastSection && timeRemaining <= 0;

  const formatTime = (seconds: number): string => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const renderPreWorkoutDisplay = () => {
    if (preWorkoutCountdown === null) {
      return "Ready?";
    } else if (preWorkoutCountdown === 0) {
      return "Go!";
    } else {
      return preWorkoutCountdown.toString();
    }
  };

  const renderTimeDisplay = () => {
    if (isPreWorkout) {
      return renderPreWorkoutDisplay();
    } else if (isWorkoutComplete) {
      return "Workout Complete";
    } else {
      // Always use formatTime for consistency during the workout
      return formatTime(timeRemaining);
    }
  };

  return (
    <div>
      <div className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 text-center">
        {renderTimeDisplay()}
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center">
        {isPreWorkout ? '\u00A0' : (isWorkoutComplete ? 'Great job! 🎉' : currentSection!.name)}
      </div>
      <div className="text-base sm:text-lg mb-2 text-center">
        {isPreWorkout ? '\u00A0' : (isWorkoutComplete ? '\u00A0' : currentSection!.description || '\u00A0')}
      </div>
      <div className="text-lg sm:text-xl lg:text-2xl text-gray-600 text-center">
        {isPreWorkout ? '\u00A0' : (isWorkoutComplete ? '\u00A0' : nextSection ? `Next: ${nextSection.name}` : '\u00A0')}
      </div>
    </div>
  );
};

function isSectionWithColor(section: WorkoutSection): section is SectionWithColor {
  return 'color' in section;
}

function isSectionWithDuration(section: WorkoutSection): section is WorkoutSection & { duration: number } {
  return 'duration' in section && typeof section.duration === 'number';
}

const calculateTimeRemaining = (workout: Workout, section: WorkoutSection, currentTime: number): number => {
  if (!isSectionWithColor(section) || !isSectionWithDuration(section)) {
    console.warn('Section without color or duration encountered:', section);
    return 0;
  }

  if (workout instanceof AMRAPWorkout && workout.isAMRAPSection(section)) {
    const amrapSection = workout.getAMRAPSection();
    if (amrapSection && isSectionWithDuration(amrapSection)) {
      const amrapStartTime = workout.sections
        .slice(0, workout.sections.indexOf(section))
        .reduce((total, s) => total + (isSectionWithDuration(s) ? s.duration : 0), 0);
      return Math.max(0, amrapSection.duration - (currentTime - amrapStartTime));
    }
  }
  
  const sectionStart = workout.sections
    .slice(0, workout.sections.indexOf(section))
    .reduce((total, s) => total + (isSectionWithDuration(s) ? s.duration : 0), 0);
  return Math.max(0, section.duration - (currentTime - sectionStart));
};