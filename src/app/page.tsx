'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import './globals.css';
import workoutsData from './workouts.json';

type WorkoutsData = {
  [date: string]: WorkoutData;
};

const typedWorkoutsData = workoutsData as WorkoutsData;

interface WorkoutSection {
  name: string;
  duration: number;
  color: string;
  description?: string;
  isCircuit?: boolean;
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
  const [circuitRepetitions, setCircuitRepetitions] = useState<number>(0);
  const [currentRepetition, setCurrentRepetition] = useState<number>(1);
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

    const circuit: WorkoutSection[] = workoutData.circuit.exercises.map((exercise, index) => ({
      ...exercise,
      color: index % 2 === 0 ? 'bg-blue-300' : 'bg-green-400',
      isCircuit: true
    }));

    const coolDown: WorkoutSection[] = workoutData.coolDown.map(exercise => ({
      ...exercise,
      color: 'bg-yellow-300'
    }));

    setCircuitRepetitions(workoutData.circuit.repetitions);

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
      setWorkoutTitle(`No workout found for ${dateParam}`);
      setWorkout([]);
    }
  }, [getWorkoutForDate, parseWorkout, searchParams]);

  const getWorkoutProgression = useCallback(() => {
    let progression: { section: WorkoutSection; isCircuit: boolean; repetition: number; startTime: number }[] = [];
    let circuitStartIndex = workout.findIndex(section => section.isCircuit);
    let circuitEndIndex = workout.findLastIndex(section => section.isCircuit);
    let accumulatedTime = 0;

    workout.forEach((section, index) => {
      if (index < circuitStartIndex || index > circuitEndIndex) {
        progression.push({ section, isCircuit: false, repetition: 1, startTime: accumulatedTime });
        accumulatedTime += section.duration;
      } else if (index === circuitStartIndex) {
        for (let rep = 1; rep <= circuitRepetitions; rep++) {
          for (let i = circuitStartIndex; i <= circuitEndIndex; i++) {
            progression.push({ section: workout[i], isCircuit: true, repetition: rep, startTime: accumulatedTime });
            accumulatedTime += workout[i].duration;
          }
        }
      }
    });

    return progression;
  }, [workout, circuitRepetitions]);

  const totalDuration: number = getWorkoutProgression().reduce((total, item) => total + item.section.duration, 0);

  const getCurrentSectionInfo = useCallback((currentTime: number) => {
    const progression = getWorkoutProgression();

    for (let i = 0; i < progression.length; i++) {
      const current = progression[i];
      const next = progression[i + 1];
      if (next && currentTime < next.startTime) {
        return {
          index: i,
          ...current,
          timeRemaining: next.startTime - currentTime
        };
      }
    }

    // If we're at the last section
    const last = progression[progression.length - 1];
    return {
      index: progression.length - 1,
      ...last,
      timeRemaining: Math.max(0, (last.startTime + last.section.duration) - currentTime)
    };
  }, [getWorkoutProgression]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          const currentInfo = getCurrentSectionInfo(newTime);
          if (currentInfo) {
            setCurrentSectionIndex(currentInfo.index);
            setCurrentRepetition(currentInfo.repetition);
          }
          return newTime < totalDuration ? newTime : totalDuration;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalDuration, getCurrentSectionInfo]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = (): void => {
    setIsRunning(!isRunning);
  };

  const handleReset = (): void => {
    setTime(0);
    setIsRunning(false);
    setCurrentSectionIndex(0);
    setCurrentRepetition(1);
  };

  const handlePrevious = (): void => {
    setTime((prevTime) => {
      const currentInfo = getCurrentSectionInfo(prevTime);
      if (currentInfo && currentInfo.index > 0) {
        const prevSection = getWorkoutProgression()[currentInfo.index - 1];
        setCurrentSectionIndex(currentInfo.index - 1);
        setCurrentRepetition(prevSection.repetition);
        return prevSection.startTime;
      }
      return 0; // If we're at the first section, go to the start of the workout
    });
  };

  const handleNext = (): void => {
    setTime((prevTime) => {
      const currentInfo = getCurrentSectionInfo(prevTime);
      const progression = getWorkoutProgression();
      if (currentInfo && currentInfo.index < progression.length - 1) {
        const nextSection = progression[currentInfo.index + 1];
        setCurrentSectionIndex(currentInfo.index + 1);
        setCurrentRepetition(nextSection.repetition);
        return nextSection.startTime;
      }
      return totalDuration; // If we're at the last section, go to the end of the workout
    });
  };

  const toggleWorkoutView = (): void => {
    setIsWorkoutViewExpanded(!isWorkoutViewExpanded);
  };

  const progressPercentage = (time / totalDuration) * 100;

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

  const getWorkoutSections = useCallback(() => {
    const circuitStartIndex = workout.findIndex(section => section.isCircuit);
    const circuitEndIndex = workout.findLastIndex(section => section.isCircuit);

    return {
      warmUp: workout.slice(0, circuitStartIndex),
      circuit: workout.slice(circuitStartIndex, circuitEndIndex + 1),
      coolDown: workout.slice(circuitEndIndex + 1)
    };
  }, [workout]);

  const getCurrentPosition = useCallback((currentTime: number) => {
    const { warmUp, circuit, coolDown } = getWorkoutSections();
    let accumulatedTime = 0;

    // Check warm-up
    for (let i = 0; i < warmUp.length; i++) {
      accumulatedTime += warmUp[i].duration;
      if (currentTime < accumulatedTime) {
        return { section: 'warmUp', index: i };
      }
    }

    // Check circuit
    const circuitDuration = circuit.reduce((total, exercise) => total + exercise.duration, 0);
    for (let rep = 0; rep < circuitRepetitions; rep++) {
      for (let i = 0; i < circuit.length; i++) {
        accumulatedTime += circuit[i].duration;
        if (currentTime < accumulatedTime) {
          return { section: 'circuit', index: i, repetition: rep + 1 };
        }
      }
    }

    // Check cool-down
    for (let i = 0; i < coolDown.length; i++) {
      accumulatedTime += coolDown[i].duration;
      if (currentTime < accumulatedTime) {
        return { section: 'coolDown', index: i };
      }
    }

    return { section: 'complete', index: -1 };
  }, [getWorkoutSections, circuitRepetitions]);

  return (
    <div className="workout-timer">
      <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-4 text-center">{workoutTitle}</h1>

      {workout.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 text-center">
                  {formatTime(getCurrentSectionInfo(time)?.timeRemaining || 0)}
                </div>

                <div className="mb-4 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {getCurrentSectionInfo(time)?.section.name}
                    {getCurrentSectionInfo(time)?.isCircuit && ` (Round ${currentRepetition}/${circuitRepetitions})`}
                  </div>
                  <div className="text-base sm:text-lg mb-2">
                    {getCurrentSectionInfo(time)?.section.description || 'Get it!'}
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">
                    Next: {currentSectionIndex < getWorkoutProgression().length - 1 ? getWorkoutProgression()[currentSectionIndex + 1].section.name : 'Workout Complete'}
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
                    {getWorkoutProgression().map((item, index) => (
                      <div
                        key={index}
                        className={`absolute top-0 h-full ${item.section.color}`}
                        style={{
                          left: `${(item.startTime / totalDuration) * 100}%`,
                          width: `${(item.section.duration / totalDuration) * 100}%`
                        }}
                      ></div>
                    ))}
                    <div
                      className="progress-indicator"
                      style={{ left: `${(time / totalDuration) * 100}%` }}
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
                  {(() => {
                    const { warmUp, circuit, coolDown } = getWorkoutSections();
                    const currentPosition = getCurrentPosition(time);

                    return (
                      <>
                        <div className="workout-section">
                          <h3 className="font-bold mb-2">Warm-up</h3>
                          {warmUp.map((section, index) => (
                            <div key={index} className={`section-item ${currentPosition.section === 'warmUp' && currentPosition.index === index ? 'section-item-active' : ''}`}>
                              <div className="flex items-center">
                                <span className={`section-color-indicator ${section.color}`}></span>
                                <span className="ml-2">{section.name}</span>
                              </div>
                              <span>{formatTime(section.duration)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="workout-section mt-4">
                          <h3 className="font-bold mb-2">Circuit (x{circuitRepetitions})</h3>
                          {circuit.map((section, index) => (
                            <div
                              key={index}
                              className={`section-item ${currentPosition.section === 'circuit' &&
                                currentPosition.index === index ?
                                'section-item-active' : ''
                                }`}
                            >
                              <div className="flex items-center">
                                <span className={`section-color-indicator ${section.color}`}></span>
                                <span className="ml-2">{section.name}</span>
                              </div>
                              <span>{formatTime(section.duration)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="workout-section mt-4">
                          <h3 className="font-bold mb-2">Cool-down</h3>
                          {coolDown.map((section, index) => (
                            <div key={index} className={`section-item ${currentPosition.section === 'coolDown' && currentPosition.index === index ? 'section-item-active' : ''}`}>
                              <div className="flex items-center">
                                <span className={`section-color-indicator ${section.color}`}></span>
                                <span className="ml-2">{section.name}</span>
                              </div>
                              <span>{formatTime(section.duration)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>No workout found for the selected date.</p>
      )}
    </div>
  );
}