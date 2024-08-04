'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import './globals.css';
import workoutsData from './workouts.json';

// Add this type definition
type WorkoutsData = {
  [date: string]: WorkoutData;
};

// Cast the imported data to our new type
const typedWorkoutsData = workoutsData as WorkoutsData;

interface WorkoutSection {
  name: string;
  duration: number;
  color: string;
  description?: string;
}

interface WorkoutData {
  warmUp: {
    name: string;
    duration: number;
    description?: string;
  }[];
  circuit: {
    repetitions: number;
    exercises: {
      name: string;
      duration: number;
      description?: string;
    }[];
  };
  coolDown: {
    name: string;
    duration: number;
    description?: string;
  }[];
}

export default function Home() {
  const searchParams = useSearchParams();
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isWorkoutViewExpanded, setIsWorkoutViewExpanded] = useState<boolean>(true);
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const [workout, setWorkout] = useState<WorkoutSection[]>([]);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const workoutViewRef = useRef<HTMLDivElement>(null);

  const getWorkoutForDate = useCallback((targetDate: string): [WorkoutData, string] | null => {
    const dates = Object.keys(typedWorkoutsData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const workoutDate = dates.find(d => d <= targetDate);
    if (workoutDate) {
      return [typedWorkoutsData[workoutDate], workoutDate];
    }
    return null;
  }, []);

  const parseWorkout = useCallback((workoutData: WorkoutData): WorkoutSection[] => {
    const warmUp: WorkoutSection[] = workoutData.warmUp.map(exercise => ({
      ...exercise,
      color: 'bg-yellow-300'
    }));

    const circuit: WorkoutSection[] = Array(workoutData.circuit.repetitions).fill(workoutData.circuit.exercises).flat().map((exercise, index) => ({
      ...exercise,
      color: index % 2 === 0 ? 'bg-blue-300' : 'bg-green-400'
    }));

    const coolDown: WorkoutSection[] = workoutData.coolDown.map(exercise => ({
      ...exercise,
      color: 'bg-yellow-300'
    }));

    return [...warmUp, ...circuit, ...coolDown];
  }, []);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const targetDate = dateParam || new Date().toISOString().split('T')[0];
    const workoutResult = getWorkoutForDate(targetDate);
    if (workoutResult) {
      const [workoutData, workoutDate] = workoutResult;
      const parsedWorkout = parseWorkout(workoutData);
      setWorkout(parsedWorkout);
      setWorkoutTitle(`${workoutDate}`);
    } else {
      setWorkoutTitle("No workout found for the specified date");
      setWorkout([]);
    }
  }, [getWorkoutForDate, parseWorkout, searchParams]);

  const totalDuration: number = workout.reduce((total, section) => total + section.duration, 0);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionIndex = useCallback((currentTime: number): number => {
    if (workout.length === 0) {
      return -1; // Return -1 if there's no workout
    }

    let accumulatedTime = 0;
    for (let i = 0; i < workout.length; i++) {
      accumulatedTime += workout[i].duration;
      if (currentTime < accumulatedTime) {
        return i;
      }
    }
    return workout.length - 1;
  }, [workout]);

  const getTimeLeftInSection = useCallback((currentTime: number): number => {
    if (workout.length === 0) {
      return 0; // Return 0 if there's no workout
    }

    const currentIndex = getCurrentSectionIndex(currentTime);
    const timeInPreviousSections = workout
      .slice(0, currentIndex)
      .reduce((total, section) => total + section.duration, 0);

    // Check if currentIndex is valid
    if (currentIndex >= 0 && currentIndex < workout.length) {
      return workout[currentIndex].duration - (currentTime - timeInPreviousSections);
    } else {
      return 0; // Return 0 if currentIndex is out of bounds
    }
  }, [workout, getCurrentSectionIndex]);

  const getCurrentCircuitExerciseIndex = useCallback((currentTime: number): number => {
    if (currentSectionIndex <= 0 || currentSectionIndex >= workout.length - 1) {
      return -1; // Not in the main circuit
    }
    const circuitStartTime = workout[0].duration;
    const timeInCircuit = currentTime - circuitStartTime;
    const circuitExercises = workout.slice(1, -1);
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
  }, [currentSectionIndex, workout]);

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
      setTime(workout.slice(0, newSection).reduce((total, section) => total + section.duration, 0));
    }
  };

  const handleNext = (): void => {
    if (currentSectionIndex < workout.length - 1) {
      const newSection = currentSectionIndex + 1;
      setCurrentSectionIndex(newSection);
      setTime(workout.slice(0, newSection).reduce((total, section) => total + section.duration, 0));
    }
  };

  const toggleWorkoutView = (): void => {
    setIsWorkoutViewExpanded(!isWorkoutViewExpanded);
  };

  const progressPercentage = (time / totalDuration) * 100;

  const currentCircuitExerciseIndex = getCurrentCircuitExerciseIndex(time);

  useEffect(() => {
    const checkOverflow = () => {
      if (workoutViewRef.current) {
        const isOverflowing = workoutViewRef.current.scrollHeight > workoutViewRef.current.clientHeight;
        setShouldScroll(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [isWorkoutViewExpanded]);

  return (
    <div className="workout-timer">
      <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-4 text-center">{workoutTitle}</h1>

      {workout.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 text-center">
                  {formatTime(getTimeLeftInSection(time))}
                </div>

                <div className="mb-4 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {workout[currentSectionIndex]?.name}
                  </div>
                  <div className="text-base sm:text-lg mb-2">
                    {workout[currentSectionIndex]?.description || 'Get it!'}
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">
                    Next: {currentSectionIndex < workout.length - 1 ? workout[currentSectionIndex + 1]?.name : 'Workout Complete'}
                  </div>
                </div>

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

                <div className="mb-4">
                  <div className="font-bold mb-2">Progress:</div>
                  <div className="progress-bar">
                    {workout.map((section, index) => {
                      const sectionStart = workout.slice(0, index).reduce((total, s) => total + s.duration, 0);
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
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <button
                onClick={toggleWorkoutView}
                className="expand-button"
              >
                <span className="font-bold">Full Workout</span>
                {isWorkoutViewExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
              {isWorkoutViewExpanded && (
                <div
                  ref={workoutViewRef}
                  className={`expanded-view ${shouldScroll ? 'max-h-[60vh] overflow-y-auto' : ''}`}
                >
                  {workout.map((section, index) => (
                    <div key={index}>
                      <div className={`section-item ${index === currentSectionIndex ? 'section-item-active' : ''}`}>
                        <div className="flex items-center">
                          <span className={`section-color-indicator ${section.color}`}></span>
                          <span className="ml-2">{section.name}</span>
                        </div>
                        <span>{formatTime(section.duration)}</span>
                      </div>
                      {section.description && <div className="text-sm text-gray-600 ml-6 mb-2">{section.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>No workout available for the specified date. Try a different date!</p>
      )}
    </div>
  );
}