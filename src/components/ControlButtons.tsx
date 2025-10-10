// src/components/ControlButtons.tsx
import React, { useEffect, useCallback, memo } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScreenReader } from '@/hooks/useScreenReader';
import { WorkoutSection } from '@/workouts';

/**
 * Get the effective duration of a section for timer calculations.
 * Rep-based exercises (duration === undefined) occupy 1 second for navigation.
 * This matches the logic in CircuitWorkout.getSectionDuration().
 */
const getEffectiveDuration = (section: WorkoutSection): number => {
  return section.duration ?? 1;
};

export const ControlButtons: React.FC = memo(() => {
  const {
    workout,
    time,
    setTime,
    isRunning,
    setIsRunning,
    isPreWorkout,
    setIsPreWorkout,
    preWorkoutCountdown,
    setPreWorkoutCountdown,
    startPreWorkoutCountdown,
    resetWorkout,
    playAudioCue,
    speakSectionInfo,
  } = useWorkoutContext();

  const { announce } = useScreenReader();

  const handleStartStop = useCallback(() => {
    if (isPreWorkout && preWorkoutCountdown === null) {
      startPreWorkoutCountdown();
      announce('Starting workout countdown');
    } else {
      setIsRunning(!isRunning);
      announce(isRunning ? 'Workout paused' : 'Workout resumed');
    }
  }, [
    isPreWorkout,
    preWorkoutCountdown,
    isRunning,
    setIsRunning,
    startPreWorkoutCountdown,
    announce,
  ]);

  const handleReset = useCallback(() => {
    resetWorkout();
    announce('Workout reset');
  }, [resetWorkout, announce]);

  const handlePrevious = useCallback(() => {
    if (!workout) return;
    let newTime = time;
    for (let i = workout.sections.length - 1; i >= 0; i--) {
      const sectionStartTime = workout.sections
        .slice(0, i)
        .reduce((total, s) => total + getEffectiveDuration(s), 0);
      if (sectionStartTime < time) {
        newTime = sectionStartTime;
        break;
      }
    }
    setTime(Math.max(0, newTime));
    setIsRunning(false);
    setIsPreWorkout(false);
  }, [workout, time, setTime, setIsRunning, setIsPreWorkout]);

  const handleNext = useCallback(() => {
    if (!workout) return;

    // Check if currently in a rep-based exercise
    const currentSection = workout.getCurrentSection(time);
    const isInRepExercise = currentSection.duration === undefined;
    const wasRunning = isRunning;

    let newTime = time;
    for (let i = 0; i < workout.sections.length; i++) {
      const sectionEndTime = workout.sections
        .slice(0, i + 1)
        .reduce((total, s) => total + getEffectiveDuration(s), 0);
      if (sectionEndTime > time) {
        newTime = sectionEndTime;
        break;
      }
    }
    setTime(Math.min(newTime, workout.duration));

    // If we were in a rep exercise and timer was running, keep it running
    // Otherwise, pause (existing behavior for manual skip)
    if (isInRepExercise && wasRunning) {
      // Keep timer running when advancing from rep exercise
      setIsRunning(true);
    } else {
      // Pause for manual skips during timed exercises
      setIsRunning(false);
    }

    setIsPreWorkout(false);
  }, [workout, time, isRunning, setTime, setIsRunning, setIsPreWorkout]);

  // Track which sections we've announced to avoid repeating announcements
  const announcedSectionRef = React.useRef<number | null>(null);

  // Reset announced section ref when workout resets
  useEffect(() => {
    if (!isRunning && time === 0) {
      announcedSectionRef.current = null;
    }
  }, [isRunning, time]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      if (preWorkoutCountdown !== null) {
        intervalId = setInterval(() => {
          if (preWorkoutCountdown > 0) {
            if (preWorkoutCountdown === 3) {
              playAudioCue();
            }
            setPreWorkoutCountdown(preWorkoutCountdown - 1);
          } else {
            setPreWorkoutCountdown(null);
            setIsPreWorkout(false);
            // The first section will be announced by the main workout loop
          }
        }, 1000);
      } else if (workout && !isPreWorkout) {
        intervalId = setInterval(() => {
          const currentSection = workout.getCurrentSection(time);
          const nextSection = workout.getNextSection(time);
          const sectionStartTime = workout.sections
            .slice(0, workout.sections.indexOf(currentSection))
            .reduce((total, s) => total + getEffectiveDuration(s), 0);
          const sectionEndTime = sectionStartTime + getEffectiveDuration(currentSection);

          // Check if we're in a rep-based exercise
          const isInRepExercise = currentSection.duration === undefined;

          const newTime = time + 1;
          const isAtSectionEnd = newTime >= sectionEndTime;
          const hasPassedScheduledTime = newTime >= workout.duration;

          // For timed exercises, play audio cue before transition
          if (!isInRepExercise && sectionEndTime - newTime === 2) {
            playAudioCue();
          }

          // Play audio cue at the end of the workout
          if (workout.duration - newTime === 2 && workout.duration - newTime > 0) {
            playAudioCue();
          }

          // Speak section info when entering a new section
          // Track announcements using ref to avoid depending on time increments
          const currentSectionIndex = workout.sections.indexOf(currentSection);
          const shouldAnnounce = announcedSectionRef.current !== currentSectionIndex;

          if (shouldAnnounce) {
            announcedSectionRef.current = currentSectionIndex;
            speakSectionInfo(currentSection.name, nextSection?.name ?? null);
            const sectionAnnouncement = nextSection
              ? `Starting ${currentSection.name}. Next: ${nextSection.name}`
              : `Starting ${currentSection.name}. Final exercise`;
            announce(sectionAnnouncement, 'assertive');
          }

          // Auto-advance logic:
          // - For TIMED exercises: auto-advance when reaching section end
          // - For REP exercises: NEVER auto-advance, freeze time at section start
          if (isInRepExercise) {
            // Rep exercise: Keep time frozen at sectionStartTime
            // User must manually click Next to advance
            // DO NOT increment time, DO NOT check isAtSectionEnd
            // Time stays frozen until user manually advances
          } else {
            // Timed exercise logic
            if (isAtSectionEnd) {
              // Timed exercise reached end: check if workout is complete or continue
              if (hasPassedScheduledTime) {
                clearInterval(intervalId);
                setIsRunning(false);
                setTime(workout.duration);
                announce('Workout completed! Great job!', 'assertive');
              } else {
                // Continue to next section automatically
                setTime(newTime);
              }
            } else {
              // Timed exercise still running: increment time
              setTime(newTime);
            }
          }
        }, 1000);
      }
    }
    return () => clearInterval(intervalId);
  }, [
    isRunning,
    setTime,
    workout,
    setIsRunning,
    time,
    preWorkoutCountdown,
    setPreWorkoutCountdown,
    setIsPreWorkout,
    isPreWorkout,
    playAudioCue,
    speakSectionInfo,
    announce,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keys when not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ': // Spacebar for play/pause
        case 'k': // 'k' for play/pause (common in video players)
          event.preventDefault();
          handleStartStop();
          break;
        case 'ArrowLeft':
        case 'j': // 'j' for previous (common in video players)
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
        case 'l': // 'l' for next (common in video players)
          event.preventDefault();
          handleNext();
          break;
        case 'r': // 'r' for reset
          event.preventDefault();
          handleReset();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleStartStop, handlePrevious, handleNext, handleReset]);

  if (!workout) return null;

  return (
    <div className="control-buttons flex justify-center items-center space-x-3 sm:space-x-4 mb-8 px-4">
      <button
        onClick={handlePrevious}
        className="control-button group bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground p-3 sm:p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-xl touch-target"
        aria-label="Previous section"
        title="Previous section (J)"
        style={{ touchAction: 'manipulation' }}
      >
        <ChevronLeft size={28} className="transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={handleStartStop}
        className={`control-button start-stop-button group p-4 sm:p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-xl touch-target ${
          isRunning
            ? 'bg-warning hover:bg-warning/90 text-warning-foreground'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
        aria-label={isRunning ? 'Pause workout' : 'Start workout'}
        title={isRunning ? 'Pause workout (Space/K)' : 'Start workout (Space/K)'}
        style={{ touchAction: 'manipulation' }}
      >
        {isRunning ? (
          <Pause size={36} className="transition-transform group-hover:scale-110" />
        ) : (
          <Play size={36} className="transition-transform group-hover:scale-110 translate-x-0.5" />
        )}
      </button>

      <button
        onClick={handleNext}
        className="control-button group bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground p-3 sm:p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-xl touch-target"
        aria-label="Next section"
        title="Next section (L)"
        style={{ touchAction: 'manipulation' }}
      >
        <ChevronRight size={28} className="transition-transform group-hover:translate-x-0.5" />
      </button>

      <button
        onClick={handleReset}
        className="control-button group bg-destructive hover:bg-destructive/90 text-destructive-foreground p-3 sm:p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-xl touch-target"
        aria-label="Reset workout"
        title="Reset workout (R)"
        style={{ touchAction: 'manipulation' }}
      >
        <RotateCcw size={28} className="transition-transform group-hover:rotate-12" />
      </button>
    </div>
  );
});

ControlButtons.displayName = 'ControlButtons';
