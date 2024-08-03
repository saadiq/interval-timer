'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import './globals.css';

interface WorkoutSection {
  name: string;
  duration: number;
  color: string;
}

const WorkoutTimer: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isWorkoutViewExpanded, setIsWorkoutViewExpanded] = useState<boolean>(true);

  const workoutSections: WorkoutSection[] = [
    { name: 'Warm Up', duration: 300, color: 'bg-yellow-300' },
    { name: 'High Intensity', duration: 600, color: 'bg-red-500' },
    { name: 'Rest', duration: 120, color: 'bg-green-400' },
    { name: 'Moderate Intensity', duration: 600, color: 'bg-orange-400' },
    { name: 'Cool Down', duration: 180, color: 'bg-blue-300' },
  ];

  const totalDuration: number = workoutSections.reduce((total, section) => total + section.duration, 0);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionIndex = useCallback((currentTime: number): number => {
    let accumulatedTime = 0;
    for (let i = 0; i < workoutSections.length; i++) {
      accumulatedTime += workoutSections[i].duration;
      if (currentTime < accumulatedTime) {
        return i;
      }
    }
    return workoutSections.length - 1;
  }, [workoutSections]);

  const getTimeLeftInSection = useCallback((currentTime: number): number => {
    const currentSectionIndex = getCurrentSectionIndex(currentTime);
    const timeInPreviousSections = workoutSections
      .slice(0, currentSectionIndex)
      .reduce((total, section) => total + section.duration, 0);
    return workoutSections[currentSectionIndex].duration - (currentTime - timeInPreviousSections);
  }, [workoutSections, getCurrentSectionIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          setCurrentSection(getCurrentSectionIndex(newTime));
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
    setCurrentSection(0);
  };

  const handlePrevious = (): void => {
    if (currentSection > 0) {
      const newSection = currentSection - 1;
      setCurrentSection(newSection);
      setTime(workoutSections.slice(0, newSection).reduce((total, section) => total + section.duration, 0));
    }
  };

  const handleNext = (): void => {
    if (currentSection < workoutSections.length - 1) {
      const newSection = currentSection + 1;
      setCurrentSection(newSection);
      setTime(workoutSections.slice(0, newSection).reduce((total, section) => total + section.duration, 0));
    }
  };

  const toggleWorkoutView = (): void => {
    setIsWorkoutViewExpanded(!isWorkoutViewExpanded);
  };

  // Calculate the progress percentage
  const progressPercentage = (time / totalDuration) * 100;

  return (
    <div className="workout-timer">
      <h1>Workout Timer</h1>
      <div className="timer-display">{formatTime(getTimeLeftInSection(time))}</div>
      
      {/* Current and Next Activity Display */}
      <div className="mb-6 text-center">
        <div className="current-activity">
          {workoutSections[currentSection].name}
        </div>
        <div className="next-activity">
          Next: {currentSection < workoutSections.length - 1 ? workoutSections[currentSection + 1].name : 'Workout Complete'}
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
          {workoutSections.map((section, index) => {
            const sectionStart = workoutSections.slice(0, index).reduce((total, s) => total + s.duration, 0);
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
            {workoutSections.map((section, index) => (
              <div 
                key={index} 
                className={`section-item ${index === currentSection ? 'section-item-active' : ''}`}
              >
                <div className="flex items-center">
                  <span className={`section-color-indicator ${section.color}`}></span>
                  <span className="ml-2">{section.name}</span>
                </div>
                <span>{formatTime(section.duration)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTimer;