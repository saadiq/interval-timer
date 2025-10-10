// src/components/CountdownDisplay.tsx
import React, { memo, useMemo } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { AMRAPWorkout, Workout, WorkoutSection } from '@/workouts';
import { SectionWithColor } from '@/utils/colorUtils';

export const CountdownDisplay: React.FC = memo(() => {
  const { workout, time, isPreWorkout, preWorkoutCountdown, hasRounds, getCurrentRound, getTotalRounds } = useWorkoutContext();

  if (!workout) return null;

  const currentSection = workout.getCurrentSection(time);
  const nextSection = workout.getNextSection(time);
  
  if (!currentSection && !isPreWorkout) return <div>No current section found</div>;

  const timeRemaining = isPreWorkout ? 0 : calculateTimeRemaining(workout, currentSection!, time);
  const isLastSection = workout.sections[workout.sections.length - 1] === currentSection;
  const isWorkoutComplete = !isPreWorkout && isLastSection && timeRemaining <= 0;

  const formatTime = useMemo(() => (seconds: number): string => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }, []);

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
    } else if (!isSectionWithDuration(currentSection!)) {
      // Rep-based exercise - show "REPS" as placeholder
      return "REPS";
    } else {
      // Always use formatTime for consistency during the workout
      return formatTime(timeRemaining);
    }
  };

  const isLowTime = !isPreWorkout && !isWorkoutComplete && timeRemaining <= 10;
  const isVeryLowTime = !isPreWorkout && !isWorkoutComplete && timeRemaining <= 3;

  return (
    <div role="timer" aria-live="polite" aria-label="Workout timer display" className="text-center space-y-4">
      {/* Main Timer Display */}
      <div className={`font-bold mb-6 transition-all duration-300 ${
        isVeryLowTime 
          ? 'text-8xl sm:text-9xl lg:text-10xl text-destructive animate-pulse-scale' 
          : isLowTime 
            ? 'text-7xl sm:text-8xl lg:text-9xl text-warning' 
            : 'text-7xl sm:text-8xl lg:text-9xl text-foreground'
      } leading-normal`} 
      aria-label={`Time remaining: ${renderTimeDisplay()}`}>
        <div className={`${isPreWorkout || isWorkoutComplete ? 'text-primary' : ''} py-4`}>
          {renderTimeDisplay()}
        </div>
      </div>

      {/* Current Exercise */}
      <div className="space-y-2">
        <div className={`font-bold transition-all duration-300 ${
          isWorkoutComplete 
            ? 'text-3xl sm:text-4xl lg:text-5xl text-success animate-fade-in-up' 
            : 'text-2xl sm:text-3xl lg:text-4xl text-foreground'
        }`} 
        aria-label={isPreWorkout ? "Pre-workout phase" : isWorkoutComplete ? "Workout completed" : `Current exercise: ${currentSection!.name}`}>
          {isPreWorkout ? (
            <div className="text-transparent">&nbsp;</div>
          ) : isWorkoutComplete ? (
            <div className="flex items-center justify-center space-x-2">
              <span>Great job!</span>
              <span className="text-4xl">🎉</span>
            </div>
          ) : (
            <div className="text-primary font-semibold">
              {currentSection!.name}
            </div>
          )}
        </div>

        {/* Exercise Description */}
        {!isPreWorkout && !isWorkoutComplete && currentSection?.description && (
          <div className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed" 
               aria-label={`Exercise description: ${currentSection.description}`}>
            {currentSection.description}
          </div>
        )}
      </div>

      {/* Rounds Display - only show for Tabata, not EMOM */}
      {!isPreWorkout && !isWorkoutComplete && hasRounds() && getCurrentRound() > 0 && workout?.type === 'tabata' && (
        <div className="pt-2 pb-2">
          <div className="text-base sm:text-lg text-muted-foreground/80 font-medium" 
               aria-label={`Round ${getCurrentRound()} of ${getTotalRounds()}`}>
            Round {getCurrentRound()} of {getTotalRounds()}
          </div>
        </div>
      )}

      {/* Next Exercise Preview */}
      {!isPreWorkout && !isWorkoutComplete && nextSection && (
        <div className="pt-4 border-t border-border/30">
          <div className="text-sm text-muted-foreground mb-1">Up Next</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-medium text-muted-foreground/80" 
               aria-label={`Next exercise: ${nextSection.name}`}>
            {nextSection.name}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isWorkoutComplete && (
        <div className="pt-6 space-y-2 animate-fade-in-up">
          <div className="text-lg text-muted-foreground">
            Workout completed! Time to rest and recover.
          </div>
        </div>
      )}
    </div>
  );
});

function isSectionWithColor(section: WorkoutSection): section is SectionWithColor {
  return 'color' in section;
}

function isSectionWithDuration(section: WorkoutSection): section is WorkoutSection & { duration: number } {
  return 'duration' in section && typeof section.duration === 'number';
}

const calculateTimeRemaining = (workout: Workout, section: WorkoutSection, currentTime: number): number => {
  if (!isSectionWithColor(section)) {
    // Section without color encountered
    return 0;
  }

  // Rep-based exercises don't have time remaining
  if (!isSectionWithDuration(section)) {
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

  const sectionStart = calculateElapsedTime(workout, section);
  return Math.max(0, section.duration - (currentTime - sectionStart));
};

const calculateElapsedTime = (workout: Workout, currentSection: WorkoutSection): number => {
  let elapsed = 0;
  for (const section of workout.sections) {
    if (section === currentSection) break;
    if (isSectionWithColor(section)) {
      elapsed += isSectionWithDuration(section) ? section.duration : 1;
    }
  }
  return elapsed;
};

CountdownDisplay.displayName = 'CountdownDisplay';