import React, { useEffect, useCallback } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionWithColor } from '@/util/colorUtils';

export const ControlButtons: React.FC = () => {
  const { workout, time, setTime, isRunning, setIsRunning } = useWorkoutContext();

  const handleStartStop = useCallback(() => {
    setIsRunning(!isRunning);
  }, [setIsRunning, isRunning]);

  const handleReset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
  }, [setTime, setIsRunning]);

  const handlePrevious = useCallback(() => {
    if (!workout) return;
    const currentSection = workout.getCurrentSection(time);
    if (currentSection) {
      const newTime = Math.max(0, time - (currentSection.duration ?? 0));
      setTime(newTime);
      setIsRunning(false);
    }
  }, [workout, time, setTime, setIsRunning]);

  const handleNext = useCallback(() => {
    if (!workout) return;
    const nextSection = workout.getNextSection(time);
    if (nextSection) {
      const newTime = workout.sections.reduce((total, section) => {
        if (workout.sections.indexOf(nextSection as SectionWithColor) > workout.sections.indexOf(section)) {
          return total + (section.duration ?? 0);
        }
        return total;
      }, 0);
      setTime(newTime);
    } else {
      setTime(workout.duration);
    }
    setIsRunning(false);
  }, [workout, time, setTime, setIsRunning]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning && workout) {
      intervalId = setInterval(() => {
        const newTime = time + 1;
        if (newTime >= workout.duration) {
          clearInterval(intervalId);
          setIsRunning(false);
          setTime(workout.duration);
        } else {
          setTime(newTime);
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, setTime, workout, setIsRunning, time]);

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