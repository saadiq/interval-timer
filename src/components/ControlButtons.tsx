// src/components/ControlButtons.tsx
import React, { useEffect, useCallback } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

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
    playAudioCue
  } = useWorkoutContext();

  const handleStartStop = useCallback(() => {
    if (isPreWorkout && preWorkoutCountdown === null) {
      startPreWorkoutCountdown();
    } else {
      setIsRunning(!isRunning);
    }
  }, [isPreWorkout, preWorkoutCountdown, isRunning, setIsRunning, startPreWorkoutCountdown]);

  const handleReset = useCallback(() => {
    resetWorkout();
  }, [resetWorkout]);

  const handlePrevious = useCallback(() => {
    if (!workout) return;
    let newTime = time;
    for (let i = workout.sections.length - 1; i >= 0; i--) {
      const section = workout.sections[i];
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
      const section = workout.sections[i];
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
              // Start the 3-tone sequence when countdown is at 3
              // This will make the first tone play when the display shows "2"
              playAudioCue();
            }
            setPreWorkoutCountdown(preWorkoutCountdown - 1);
          } else {
            setPreWorkoutCountdown(null);
            setIsPreWorkout(false);
          }
        }, 1000);
      } else if (workout && !isPreWorkout) {
        intervalId = setInterval(() => {
          const newTime = time + 1;
          const currentSection = workout.getCurrentSection(time);
          const sectionEndTime = workout.sections
            .slice(0, workout.sections.indexOf(currentSection) + 1)
            .reduce((total, s) => total + (s.duration ?? 0), 0);

          if (sectionEndTime - newTime === 2) {
            playAudioCue(); // Start the 3-tone sequence 2 seconds before the end of the section
          }

          if (newTime >= workout.duration) {
            clearInterval(intervalId);
            setIsRunning(false);
            setTime(workout.duration);
          } else {
            setTime(newTime);
          }
        }, 1000);
      }
    }
    return () => clearInterval(intervalId);
  }, [isRunning, setTime, workout, setIsRunning, time, preWorkoutCountdown, setPreWorkoutCountdown, setIsPreWorkout, isPreWorkout, playAudioCue]);

  if (!workout) return null;

  return (
    <div className="control-buttons flex justify-center space-x-6 mb-6">
      <button onClick={handlePrevious} className="control-button bg-gray-200 p-4 rounded-full">
        <ChevronLeft size={32} />
      </button>
      <button onClick={handleStartStop} className="control-button start-stop-button p-4 rounded-full">
        {isRunning ? <Pause size={32} /> : <Play size={32} />}
      </button>
      <button onClick={handleNext} className="control-button bg-gray-200 p-4 rounded-full">
        <ChevronRight size={32} />
      </button>
      <button onClick={handleReset} className="control-button reset-button p-4 rounded-full">
        <RotateCcw size={32} />
      </button>
    </div>
  );
};