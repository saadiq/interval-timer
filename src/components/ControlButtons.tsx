// src/components/ControlButtons.tsx
import React, { useEffect, useCallback } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScreenReader } from '@/hooks/useScreenReader';

export const ControlButtons: React.FC = () => {
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
    speakSectionInfo
  } = useWorkoutContext();

  const { announce } = useScreenReader();

  const handleStartStop = useCallback(() => {
    if (isPreWorkout && preWorkoutCountdown === null) {
      startPreWorkoutCountdown();
      announce("Starting workout countdown");
    } else {
      setIsRunning(!isRunning);
      announce(isRunning ? "Workout paused" : "Workout resumed");
    }
  }, [isPreWorkout, preWorkoutCountdown, isRunning, setIsRunning, startPreWorkoutCountdown, announce]);

  const handleReset = useCallback(() => {
    resetWorkout();
    announce("Workout reset");
  }, [resetWorkout, announce]);

  const handlePrevious = useCallback(() => {
    if (!workout) return;
    let newTime = time;
    for (let i = workout.sections.length - 1; i >= 0; i--) {
      const sectionStartTime = workout.sections.slice(0, i).reduce((total, s) => total + (s.duration ?? 0), 0);
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
    let newTime = time;
    for (let i = 0; i < workout.sections.length; i++) {
      const sectionEndTime = workout.sections.slice(0, i + 1).reduce((total, s) => total + (s.duration ?? 0), 0);
      if (sectionEndTime > time) {
        newTime = sectionEndTime;
        break;
      }
    }
    setTime(Math.min(newTime, workout.duration));
    setIsRunning(false);
    setIsPreWorkout(false);
  }, [workout, time, setTime, setIsRunning, setIsPreWorkout]);

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
          const newTime = time + 1;
          const currentSection = workout.getCurrentSection(time);
          const nextSection = workout.getNextSection(time);
          const sectionStartTime = workout.sections
            .slice(0, workout.sections.indexOf(currentSection))
            .reduce((total, s) => total + (s.duration ?? 0), 0);
          const sectionEndTime = sectionStartTime + (currentSection.duration ?? 0);

          // Play audio cue 2 seconds before the end of the section (reverted back)
          if (sectionEndTime - newTime === 2) {
            playAudioCue();
          }

          // Play audio cue at the end of the workout
          if (workout.duration - newTime === 2 && workout.duration - newTime > 0) {
            playAudioCue();
          }

          // Speak section info at the second second of each new section
          if (newTime === sectionStartTime + 1) {
            speakSectionInfo(currentSection.name, nextSection?.name ?? null);
            const sectionAnnouncement = nextSection 
              ? `Starting ${currentSection.name}. Next: ${nextSection.name}` 
              : `Starting ${currentSection.name}. Final exercise`;
            announce(sectionAnnouncement, 'assertive');
          }

          if (newTime >= workout.duration) {
            clearInterval(intervalId);
            setIsRunning(false);
            setTime(workout.duration);
            announce("Workout completed! Great job!", 'assertive');
          } else {
            setTime(newTime);
          }
        }, 1000);
      }
    }
    return () => clearInterval(intervalId);
  }, [isRunning, setTime, workout, setIsRunning, time, preWorkoutCountdown, setPreWorkoutCountdown, setIsPreWorkout, isPreWorkout, playAudioCue, speakSectionInfo, announce]);

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
    <div className="control-buttons flex justify-center space-x-6 mb-6">
      <button 
        onClick={handlePrevious} 
        className="control-button bg-gray-200 p-4 rounded-full"
        aria-label="Previous section"
        title="Previous section"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={handleStartStop} 
        className="control-button start-stop-button p-4 rounded-full"
        aria-label={isRunning ? "Pause workout" : "Start workout"}
        title={isRunning ? "Pause workout" : "Start workout"}
      >
        {isRunning ? <Pause size={32} /> : <Play size={32} />}
      </button>
      <button 
        onClick={handleNext} 
        className="control-button bg-gray-200 p-4 rounded-full"
        aria-label="Next section"
        title="Next section"
      >
        <ChevronRight size={32} />
      </button>
      <button 
        onClick={handleReset} 
        className="control-button reset-button p-4 rounded-full"
        aria-label="Reset workout"
        title="Reset workout"
      >
        <RotateCcw size={32} />
      </button>
    </div>
  );
};