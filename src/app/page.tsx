'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInterval } from 'react-use';

const warmupIntervals = [
  { label: 'Dynamic Stretches', duration: 60 }, // 1 minute
  { label: 'Jump Rope Warm-Up', duration: 120 }, // 2 minutes
];

const circuitIntervals = [
  { label: 'Jump Rope', duration: 50 },
  { label: 'Rest', duration: 10 },
  { label: 'Push-Ups', duration: 30 },
  { label: 'Jump Rope', duration: 50 },
  { label: 'Rest', duration: 10 },
  { label: 'Squats', duration: 30 },
  { label: 'Jump Rope', duration: 50 },
  { label: 'Rest', duration: 10 },
  { label: 'Reverse Crunches', duration: 30 },
  { label: 'Jump Rope', duration: 50 },
  { label: 'Rest', duration: 10 },
  { label: 'Plank', duration: 30 },
];

const cooldownIntervals = [
  { label: 'Cool Down Stretches', duration: 120 } // 2 minutes
];

const IntervalTimer = () => {
  const [currentInterval, setCurrentInterval] = useState(0);
  const [timeLeft, setTimeLeft] = useState(warmupIntervals[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stage, setStage] = useState('warmup');
  const [repeats, setRepeats] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    audioRef.current = new Audio('/path-to-your-audio-file.mp3'); // Replace with your audio file path
  }, []);

  const playAudioCue = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => console.error('Audio playback failed', error));
    }
  };

  const getTotalDuration = () => {
    const warmupDuration = warmupIntervals.reduce((sum, interval) => sum + interval.duration, 0);
    const circuitDuration = circuitIntervals.reduce((sum, interval) => sum + interval.duration, 0) * 3;
    const cooldownDuration = cooldownIntervals.reduce((sum, interval) => sum + interval.duration, 0);
    return warmupDuration + circuitDuration + cooldownDuration;
  };

  const getCurrentIntervals = () => {
    switch (stage) {
      case 'warmup':
        return warmupIntervals;
      case 'circuit':
        return circuitIntervals;
      case 'cooldown':
        return cooldownIntervals;
      default:
        return [];
    }
  };

  const getNextActivity = () => {
    const intervals = getCurrentIntervals();
    if (currentInterval < intervals.length - 1) {
      return intervals[currentInterval + 1].label;
    } else if (stage === 'warmup') {
      return circuitIntervals[0].label;
    } else if (stage === 'circuit' && repeats < 2) {
      return circuitIntervals[0].label;
    } else if (stage === 'circuit' && repeats === 2) {
      return cooldownIntervals[0].label;
    } else {
      return 'Workout Complete';
    }
  };

  const calculateElapsedTime = (currentStage: string, currentRepeat: number, currentIntervalIndex: number) => {
    let elapsedTime = 0;
    
    if (currentStage === 'warmup') {
      elapsedTime = warmupIntervals.slice(0, currentIntervalIndex).reduce((sum, interval) => sum + interval.duration, 0);
    } else if (currentStage === 'circuit') {
      elapsedTime = warmupIntervals.reduce((sum, interval) => sum + interval.duration, 0);
      elapsedTime += currentRepeat * circuitIntervals.reduce((sum, interval) => sum + interval.duration, 0);
      elapsedTime += circuitIntervals.slice(0, currentIntervalIndex).reduce((sum, interval) => sum + interval.duration, 0);
    } else if (currentStage === 'cooldown') {
      elapsedTime = warmupIntervals.reduce((sum, interval) => sum + interval.duration, 0);
      elapsedTime += 3 * circuitIntervals.reduce((sum, interval) => sum + interval.duration, 0);
      elapsedTime += cooldownIntervals.slice(0, currentIntervalIndex).reduce((sum, interval) => sum + interval.duration, 0);
    }

    return elapsedTime;
  };

  const moveToNextInterval = () => {
    const intervals = getCurrentIntervals();
    if (currentInterval < intervals.length - 1) {
      setCurrentInterval(currentInterval + 1);
      setTimeLeft(intervals[currentInterval + 1].duration);
    } else if (stage === 'warmup') {
      setStage('circuit');
      setCurrentInterval(0);
      setTimeLeft(circuitIntervals[0].duration);
    } else if (stage === 'circuit' && repeats < 2) {
      setRepeats(repeats + 1);
      setCurrentInterval(0);
      setTimeLeft(circuitIntervals[0].duration);
    } else if (stage === 'circuit' && repeats === 2) {
      setStage('cooldown');
      setCurrentInterval(0);
      setTimeLeft(cooldownIntervals[0].duration);
    } else {
      setIsActive(false);
      setCurrentInterval(0);
      setTimeLeft(warmupIntervals[0].duration);
      setStage('warmup');
      setRepeats(0);
      setTotalElapsedTime(0);
      return;
    }
    
    const newElapsedTime = calculateElapsedTime(
      stage === 'warmup' && currentInterval === warmupIntervals.length - 1 ? 'circuit' : 
      stage === 'circuit' && currentInterval === circuitIntervals.length - 1 && repeats === 2 ? 'cooldown' : stage,
      stage === 'circuit' && currentInterval === circuitIntervals.length - 1 ? (repeats + 1) % 3 : repeats,
      currentInterval < getCurrentIntervals().length - 1 ? currentInterval + 1 : 0
    );
    setTotalElapsedTime(newElapsedTime);
  };

  const moveToPreviousInterval = () => {
    if (currentInterval > 0) {
      setCurrentInterval(currentInterval - 1);
      setTimeLeft(getCurrentIntervals()[currentInterval - 1].duration);
    } else if (stage === 'circuit' && repeats > 0) {
      setRepeats(repeats - 1);
      setCurrentInterval(circuitIntervals.length - 1);
      setTimeLeft(circuitIntervals[circuitIntervals.length - 1].duration);
    } else if (stage === 'circuit' && repeats === 0) {
      setStage('warmup');
      setCurrentInterval(warmupIntervals.length - 1);
      setTimeLeft(warmupIntervals[warmupIntervals.length - 1].duration);
    } else if (stage === 'cooldown') {
      setStage('circuit');
      setRepeats(2);
      setCurrentInterval(circuitIntervals.length - 1);
      setTimeLeft(circuitIntervals[circuitIntervals.length - 1].duration);
    } else {
      return; // If we're at the very beginning, do nothing
    }
    
    const newElapsedTime = calculateElapsedTime(
      stage === 'circuit' && currentInterval === 0 && repeats === 0 ? 'warmup' :
      stage === 'cooldown' && currentInterval === 0 ? 'circuit' : stage,
      stage === 'circuit' && currentInterval === 0 ? (repeats - 1 + 3) % 3 : repeats,
      currentInterval > 0 ? currentInterval - 1 : 
      stage === 'warmup' ? warmupIntervals.length - 1 :
      stage === 'circuit' ? circuitIntervals.length - 1 :
      cooldownIntervals.length - 1
    );
    setTotalElapsedTime(newElapsedTime);
  };

  useInterval(() => {
    if (isActive && !isPaused) {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
        setTotalElapsedTime(prev => prev + 1);
      } else {
        playAudioCue();
        moveToNextInterval();
      }
    }
  }, isClient ? 1000 : null);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentInterval(0);
    setTimeLeft(warmupIntervals[0].duration);
    setStage('warmup');
    setRepeats(0);
    setTotalElapsedTime(0);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const getCurrentIntervalLabel = () => {
    if (stage === 'warmup') {
      return warmupIntervals[currentInterval].label;
    } else if (stage === 'circuit') {
      return circuitIntervals[currentInterval].label;
    } else if (stage === 'cooldown') {
      return cooldownIntervals[currentInterval].label;
    }
  };

  const renderProgressBar = () => {
    const totalDuration = getTotalDuration();
    const warmupDuration = warmupIntervals.reduce((sum, interval) => sum + interval.duration, 0);
    const circuitDuration = circuitIntervals.reduce((sum, interval) => sum + interval.duration, 0) * 3;
    const cooldownDuration = cooldownIntervals.reduce((sum, interval) => sum + interval.duration, 0);

    return (
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-blue-500 inline-block" style={{width: `${(warmupDuration / totalDuration) * 100}%`}}></div>
        <div className="h-full inline-block" style={{width: `${(circuitDuration / totalDuration) * 100}%`}}>
          {circuitIntervals.map((interval, index) => (
            <div 
              key={index}
              className={`h-full inline-block ${interval.label === 'Rest' ? 'bg-gray-400' : 'bg-green-500'}`}
              style={{width: `${(interval.duration / circuitDuration) * 100}%`}}
            ></div>
          ))}
        </div>
        <div className="h-full bg-yellow-500 inline-block" style={{width: `${(cooldownDuration / totalDuration) * 100}%`}}></div>
        <div 
          className="h-full bg-red-500 transition-all duration-300 ease-in-out" 
          style={{width: `${(totalElapsedTime / totalDuration) * 100}%`, marginTop: '-100%'}}
        ></div>
      </div>
    );
  };

  if (!isClient) {
    return <div>Loading...</div>; // Or any loading indicator you prefer
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-4xl font-bold text-center mb-4">Interval Timer</h1>
        
        {/* Current Activity and Countdown */}
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-6 mb-4 flex items-center justify-between">
          <button onClick={moveToPreviousInterval} className="text-3xl">←</button>
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-2">{getCurrentIntervalLabel()}</h2>
            <h3 className="text-7xl font-bold">{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</h3>
          </div>
          <button onClick={moveToNextInterval} className="text-3xl">→</button>
        </div>
        
        {/* Next Activity */}
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 mb-4">
          <h2 className="text-2xl font-semibold text-center">Next: {getNextActivity()}</h2>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        <div className="flex justify-center mb-6">
          {!isActive ? (
            <button className="bg-blue-500 text-white py-2 px-4 rounded-lg text-2xl" onClick={startTimer}>Start</button>
          ) : (
            <>
              <button className="bg-red-500 text-white py-2 px-4 rounded-lg text-2xl mr-2" onClick={resetTimer}>Reset</button>
              <button className="bg-yellow-500 text-white py-2 px-4 rounded-lg text-2xl" onClick={pauseTimer}>{isPaused ? 'Resume' : 'Pause'}</button>
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4">Workout Plan</h2>
        <h3 className="text-xl font-semibold mb-2 text-blue-500">Warm-Up</h3>
        <ul className="mb-4">
          {warmupIntervals.map((interval, index) => (
            <li
              key={index}
              className={`text-lg text-blue-500 ${stage === 'warmup' && currentInterval === index ? 'font-bold' : ''}`}
            >
              {interval.label} - {Math.floor(interval.duration / 60)}:{String(interval.duration % 60).padStart(2, '0')}
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2 text-green-500">Workout Circuit (Repeat 3 times)</h3>
        <ul className="mb-4">
          {circuitIntervals.map((interval, index) => (
            <li
              key={index}
              className={`text-lg ${interval.label === 'Rest' ? 'text-gray-500' : 'text-green-500'} ${stage === 'circuit' && currentInterval === index ? 'font-bold' : ''}`}
            >
              {interval.label} - {Math.floor(interval.duration / 60)}:{String(interval.duration % 60).padStart(2, '0')}
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2 text-yellow-500">Cool Down</h3>
        <ul>
          {cooldownIntervals.map((interval, index) => (
            <li
              key={index}
              className={`text-lg text-yellow-500 ${stage === 'cooldown' && currentInterval === index ? 'font-bold' : ''}`}
            >
              {interval.label} - {Math.floor(interval.duration / 60)}:{String(interval.duration % 60).padStart(2, '0')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IntervalTimer;