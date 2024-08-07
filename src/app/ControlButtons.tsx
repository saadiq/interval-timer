// ControlButtons.tsx
import React, { useState } from 'react';
import { useWorkoutContext } from './WorkoutContext';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export const ControlButtons: React.FC = () => {
  const { workout, time, setTime, isRunning, setIsRunning } = useWorkoutContext();
  const [countdownState, setCountdownState] = useState<'ready' | 'countdown' | 'go' | null>('ready');

  if (!workout) return null;

  const handleStartStop = () => {
    if (countdownState === 'ready') {
      setCountdownState('countdown');
    } else if (isRunning) {
      setIsRunning(false);
    } else if (time < workout.duration) {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setCountdownState('ready');
  };

  const handlePrevious = () => {
    const newTime = Math.max(0, time - workout.getCurrentSection(time).duration);
    setTime(newTime);
    setIsRunning(false);
  };

  const handleNext = () => {
    const nextSection = workout.getNextSection(time);
    if (nextSection) {
      const newTime = workout.sections.slice(0, workout.sections.indexOf(nextSection)).reduce((total, section) => total + section.duration, 0);
      setTime(newTime);
    } else {
      setTime(workout.duration);
    }
    setIsRunning(false);
  };

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
      <button onClick={handleReset} className="control-button reset-button p-4 rounded-full" disabled={countdownState === 'countdown'}>
        <RotateCcw size={32} />
      </button>
    </div>
  );
};