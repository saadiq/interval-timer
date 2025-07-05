import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { SectionWithColor } from '@/utils/colorUtils';
import { TabataWorkout } from '@/workouts';

export const ProgressBar: React.FC = () => {
  const { workout, time, isPreWorkout } = useWorkoutContext();

  if (!workout) return null;

  const progress = workout.getProgress(time);

  const getAllSections = (): SectionWithColor[] => {
    // Use the actual colors from workout.sections
    // These colors are already assigned by the centralized color system
    return workout.sections;
  };

  const sections = getAllSections();

  // Helper function to determine if a section starts a new round
  const isNewRound = (sectionIndex: number): boolean => {
    if (sectionIndex === 0) return false; // First section is never a new round
    
    const warmUpLength = workout.data.warmUp.length;
    const coolDownLength = workout.data.coolDown.length;
    
    // Only apply round indicators to main workout sections
    if (sectionIndex < warmUpLength || sectionIndex >= sections.length - coolDownLength) {
      return false;
    }
    
    const mainWorkoutIndex = sectionIndex - warmUpLength;
    
    if (workout.data.type === 'circuit') {
      // For circuit workouts, new round starts every exercises.length sections
      return mainWorkoutIndex % workout.data.workout.exercises.length === 0;
    } else if (workout.data.type === 'tabata') {
      // For tabata workouts, new round starts every (exercises.length * 2) sections
      const sectionsPerRound = workout.data.workout.exercises.length * 2; // work + rest for each exercise
      return mainWorkoutIndex % sectionsPerRound === 0;
    } else if (workout.data.type === 'emom') {
      // For EMOM workouts, new round starts every exercises.length sections
      return mainWorkoutIndex % workout.data.workout.exercises.length === 0;
    }
    
    return false;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentSectionIndex = sections.findIndex(section => {
    const sectionStart = sections.slice(0, sections.indexOf(section)).reduce((total, s) => total + (s.duration || 0), 0);
    const sectionEnd = sectionStart + (section.duration || 0);
    return time >= sectionStart && time < sectionEnd;
  });

  return (
    <div className="mb-6 space-y-3" role="region" aria-labelledby="workout-progress">
      {/* Progress Header */}
      <div className="flex justify-between items-center">
        <div id="workout-progress" className="text-lg font-semibold text-foreground">
          Progress
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {formatTime(workout.duration - time)} remaining
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {Math.round(progress * 100)}% complete
        </span>
        <span className="text-muted-foreground">
          {formatTime(workout.duration)} total
        </span>
      </div>

      {/* Enhanced Progress Bar */}
      <div 
        className="relative h-8 rounded-lg overflow-hidden bg-secondary shadow-inner border border-border"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Workout progress: ${Math.round(progress * 100)}% complete, ${formatTime(workout.duration - time)} remaining`}
      >
        {/* Section Background with Labels */}
        {sections.map((section, index) => {
          const sectionStart = sections.slice(0, index).reduce((total, s) => total + (s.duration || 0), 0);
          const sectionWidth = ((section.duration || 0) / workout.duration) * 100;
          const isCurrentSection = index === currentSectionIndex && !isPreWorkout;
          
          // Check if this is the start of a new round for visual indicators
          const isRoundStart = isNewRound(index);
          
          // Show labels if section is wide enough (at least 8% of total width)
          const showLabel = sectionWidth >= 8;
          
          return (
            <div
              key={index}
              className={`absolute top-0 h-full transition-all duration-300 ${
                section.color
              } ${isCurrentSection ? 'brightness-110 shadow-md' : 'opacity-80'} ${
                isRoundStart ? 'border-l-2 border-foreground/30' : ''
              } flex items-center justify-center overflow-hidden`}
              style={{
                left: `${(sectionStart / workout.duration) * 100}%`,
                width: `${sectionWidth}%`
              }}
              aria-label={`${section.name} section`}
            >
              {showLabel && (
                <span className="text-xs font-medium text-white/90 px-1 text-center truncate hidden md:block">
                  {section.name}
                </span>
              )}
            </div>
          );
        })}

        {/* Progress Indicator */}
        <div
          className="absolute top-0 h-full bg-foreground/20 border-r-2 border-foreground transition-all duration-200 ease-out"
          style={{ 
            left: '0%',
            width: `${progress * 100}%`
          }}
          aria-hidden="true"
        />

        {/* Current Position Indicator */}
        <div
          className="absolute top-0 h-full w-1 bg-foreground shadow-lg transition-all duration-200 ease-out"
          style={{ left: `${progress * 100}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Section Labels */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          <span className="text-muted-foreground">Warm-up</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-full ${
            workout.data.type.toLowerCase() === 'circuit' ? 'bg-blue-500' :
            workout.data.type.toLowerCase() === 'amrap' ? 'bg-green-500' :
            workout.data.type.toLowerCase() === 'tabata' ? 'bg-red-500' :
            workout.data.type.toLowerCase() === 'emom' ? 'bg-purple-500' :
            'bg-primary'
          }`}></div>
          <span className="text-muted-foreground">Exercise</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span className="text-muted-foreground">Rest</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          <span className="text-muted-foreground">Cool-down</span>
        </div>
      </div>
    </div>
  );
};