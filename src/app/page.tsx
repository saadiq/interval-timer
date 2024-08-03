'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import './globals.css';

interface WorkoutSection {
  name: string;
  duration: number;
  color: string;
  description?: string;
}

const WorkoutTimer: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isWorkoutViewExpanded, setIsWorkoutViewExpanded] = useState<boolean>(true);

  const warmUp: WorkoutSection = { 
    name: 'Warm-Up', 
    duration: 180, 
    color: 'bg-yellow-300', 
    description: 'Dynamic stretches and light jump rope' 
  };

  const coolDown: WorkoutSection = { 
    name: 'Cool Down', 
    duration: 120, 
    color: 'bg-yellow-300', 
    description: 'Stretch: calves, hamstrings, shoulders, and arms' 
  };

  const circuitExercises: WorkoutSection[] = [
    { name: 'Jump Rope 1', duration: 40, color: 'bg-blue-300', description: 'Basic bounce or alternating foot jumps' },
    { name: 'Jumping Jacks', duration: 20, color: 'bg-green-400' },
    { name: 'Jump Rope 2', duration: 40, color: 'bg-blue-300', description: 'Boxer step or high knees' },
    { name: 'Lunges', duration: 20, color: 'bg-green-400', description: 'Alternating legs' },
    { name: 'Jump Rope 3', duration: 40, color: 'bg-blue-300', description: 'Criss-cross or side-to-side jumps' },
    { name: 'Tricep Dips', duration: 20, color: 'bg-green-400', description: 'Use a sturdy chair or bench' },
    { name: 'Jump Rope 4', duration: 40, color: 'bg-blue-300', description: 'Freestyle, mix in different jump styles' },
    { name: 'Bicycle Crunches', duration: 20, color: 'bg-green-400' },
    { name: 'Jump Rope 5', duration: 40, color: 'bg-blue-300', description: 'Double unders if you can' },
    { name: 'Mountain Climbers', duration: 20, color: 'bg-green-400' },
  ];

  const fullWorkout: WorkoutSection[] = [
    warmUp,
    ...Array(4).fill(circuitExercises).flat(),
    coolDown
  ];

  const totalDuration: number = fullWorkout.reduce((total, section) => total + section.duration, 0);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionIndex = useCallback((currentTime: number): number => {
    let accumulatedTime = 0;
    for (let i = 0; i < fullWorkout.length; i++) {
      accumulatedTime += fullWorkout[i].duration;
      if (currentTime < accumulatedTime) {
        return i;
      }
    }
    return fullWorkout.length - 1;
  }, [fullWorkout]);

  const getTimeLeftInSection = useCallback((currentTime: number): number => {
    const currentIndex = getCurrentSectionIndex(currentTime);
    const timeInPreviousSections = fullWorkout
      .slice(0, currentIndex)
      .reduce((total, section) => total + section.duration, 0);
    return fullWorkout[currentIndex].duration - (currentTime - timeInPreviousSections);
  }, [fullWorkout, getCurrentSectionIndex]);

  const getCurrentCircuitExerciseIndex = useCallback((currentTime: number): number => {
    if (currentSectionIndex <= 0 || currentSectionIndex >= fullWorkout.length - 1) {
      return -1; // Not in the main circuit
    }
    const circuitStartTime = warmUp.duration;
    const timeInCircuit = currentTime - circuitStartTime;
    const circuitRepetitionDuration = circuitExercises.reduce((total, exercise) => total + exercise.duration, 0);
    const currentRepetition = Math.floor(timeInCircuit / circuitRepetitionDuration);
    const timeInCurrentRepetition = timeInCircuit % circuitRepetitionDuration;
    
    let accumulatedTime = 0;
    for (let i = 0; i < circuitExercises.length; i++) {
      accumulatedTime += circuitExercises[i].duration;
      if (timeInCurrentRepetition < accumulatedTime) {
        return i;
      }
    }
    return circuitExercises.length - 1;
  }, [currentSectionIndex, fullWorkout, warmUp.duration, circuitExercises]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          setCurrentSectionIndex(getCurrentSectionIndex(newTime));
          return newTime < totalDuration ? newTime : totalDuration;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalDuration, getCurrentSectionIndex]);

  const handleStartStop = (): void => {
    setIsRunning(!isRunning);
  };

  const handleReset = (): void => {
    setTime(0);
    setIsRunning(false);
    setCurrentSectionIndex(0);
  };

  const handlePrevious = (): void => {
    if (currentSectionIndex > 0) {
      const newSection = currentSectionIndex - 1;
      setCurrentSectionIndex(newSection);
      setTime(fullWorkout.slice(0, newSection).reduce((total, section) => total + section.duration, 0));
    }
  };

  const handleNext = (): void => {
    if (currentSectionIndex < fullWorkout.length - 1) {
      const newSection = currentSectionIndex + 1;
      setCurrentSectionIndex(newSection);
      setTime(fullWorkout.slice(0, newSection).reduce((total, section) => total + section.duration, 0));
    }
  };

  const toggleWorkoutView = (): void => {
    setIsWorkoutViewExpanded(!isWorkoutViewExpanded);
  };

  // Calculate the progress percentage
  const progressPercentage = (time / totalDuration) * 100;

  const currentCircuitExerciseIndex = getCurrentCircuitExerciseIndex(time);

  return (
    <div className="workout-timer">
      <h1>20-Minute Bodyweight Full-Body Workout</h1>
      <div className="timer-display">{formatTime(getTimeLeftInSection(time))}</div>
      
      {/* Current and Next Activity Display */}
      <div className="mb-6 text-center">
        <div className="current-activity">
          {fullWorkout[currentSectionIndex].name}
        </div>
        <div className="next-activity">
          Next: {currentSectionIndex < fullWorkout.length - 1 ? fullWorkout[currentSectionIndex + 1].name : 'Workout Complete'}
        </div>
      </div>

      <div className="control-buttons">
        <button onClick={handlePrevious} className="control-button bg-gray-200">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleStartStop} className="control-button start-stop-button">
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={handleNext} className="control-button bg-gray-200">
          <ChevronRight size={24} />
        </button>
        <button onClick={handleReset} className="control-button reset-button">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="mb-4">
        <div className="font-bold mb-2">Progress:</div>
        <div className="progress-bar">
          {fullWorkout.map((section, index) => {
            const sectionStart = fullWorkout.slice(0, index).reduce((total, s) => total + s.duration, 0);
            const sectionWidth = (section.duration / totalDuration) * 100;
            return (
              <div
                key={index}
                className={`absolute top-0 h-full ${section.color}`}
                style={{
                  left: `${(sectionStart / totalDuration) * 100}%`,
                  width: `${sectionWidth}%`
                }}
              ></div>
            );
          })}
          <div 
            className="progress-indicator"
            style={{ left: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Collapsible Workout View */}
      <div className="mt-6">
        <button 
          onClick={toggleWorkoutView} 
          className="expand-button"
        >
          <span>Full Workout</span>
          {isWorkoutViewExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isWorkoutViewExpanded && (
          <div className="expanded-view">
            <div className={`section-item ${currentSectionIndex === 0 ? 'section-item-active' : ''}`}>
              <div className="flex items-center">
                <span className={`section-color-indicator ${warmUp.color}`}></span>
                <span className="ml-2">{warmUp.name}</span>
              </div>
              <span>{formatTime(warmUp.duration)}</span>
            </div>
            {warmUp.description && <div className="text-sm text-gray-600 ml-6 mb-2">{warmUp.description}</div>}
            
            <div className="font-bold mt-2 mb-1">Main Circuit (Repeat 4 times)</div>
            {circuitExercises.map((exercise, index) => (
              <div key={index}>
                <div className={`section-item ${index === currentCircuitExerciseIndex ? 'section-item-active' : ''}`}>
                  <div className="flex items-center">
                    <span className={`section-color-indicator ${exercise.color}`}></span>
                    <span className="ml-2">{exercise.name}</span>
                  </div>
                  <span>{formatTime(exercise.duration)}</span>
                </div>
                {exercise.description && <div className="text-sm text-gray-600 ml-6 mb-2">{exercise.description}</div>}
              </div>
            ))}
            
            <div className={`section-item ${currentSectionIndex === fullWorkout.length - 1 ? 'section-item-active' : ''}`}>
              <div className="flex items-center">
                <span className={`section-color-indicator ${coolDown.color}`}></span>
                <span className="ml-2">{coolDown.name}</span>
              </div>
              <span>{formatTime(coolDown.duration)}</span>
            </div>
            {coolDown.description && <div className="text-sm text-gray-600 ml-6 mb-2">{coolDown.description}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTimer;