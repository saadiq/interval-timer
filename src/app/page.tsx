'use client';

import React, { useState } from 'react';
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
  const [stage, setStage] = useState('warmup'); // stages: warmup, circuit, cooldown
  const [repeats, setRepeats] = useState(0);

  useInterval(() => {
    if (isActive && !isPaused) {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        if (stage === 'warmup') {
          if (currentInterval < warmupIntervals.length - 1) {
            setCurrentInterval(currentInterval + 1);
            setTimeLeft(warmupIntervals[currentInterval + 1].duration);
          } else {
            setStage('circuit');
            setCurrentInterval(0);
            setTimeLeft(circuitIntervals[0].duration);
          }
        } else if (stage === 'circuit') {
          if (currentInterval < circuitIntervals.length - 1) {
            setCurrentInterval(currentInterval + 1);
            setTimeLeft(circuitIntervals[currentInterval + 1].duration);
          } else if (repeats < 2) { // Repeat circuit 3 times
            setRepeats(repeats + 1);
            setCurrentInterval(0);
            setTimeLeft(circuitIntervals[0].duration);
          } else {
            setStage('cooldown');
            setCurrentInterval(0);
            setTimeLeft(cooldownIntervals[0].duration);
          }
        } else if (stage === 'cooldown') {
          if (currentInterval < cooldownIntervals.length - 1) {
            setCurrentInterval(currentInterval + 1);
            setTimeLeft(cooldownIntervals[currentInterval + 1].duration);
          } else {
            setIsActive(false);
            setCurrentInterval(0);
            setTimeLeft(warmupIntervals[0].duration);
            setStage('warmup');
            setRepeats(0);
          }
        }
      }
    }
  }, 1000);

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-4xl font-bold text-center mb-4">Interval Timer</h1>
        <h2 className="text-3xl font-semibold text-center mb-2">{getCurrentIntervalLabel()}</h2>
        <h3 className="text-2xl text-center mb-6">{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</h3>
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
        <h3 className="text-xl font-semibold mb-2">Warm-Up</h3>
        <ul className="mb-4">
          {warmupIntervals.map((interval, index) => (
            <li
              key={index}
              className={`text-lg ${stage === 'warmup' && currentInterval === index ? 'font-bold text-red-500' : ''}`}
            >
              {interval.label} - {Math.floor(interval.duration / 60)}:{String(interval.duration % 60).padStart(2, '0')}
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2">Workout Circuit (Repeat 3 times)</h3>
        <ul className="mb-4">
          {Array.from({ length: 3 }).map((_, repeatIndex) => (
            <React.Fragment key={repeatIndex}>
              {circuitIntervals.map((interval, index) => (
                <li
                  key={`${repeatIndex}-${index}`}
                  className={`text-lg ${stage === 'circuit' && repeats === repeatIndex && currentInterval === index ? 'font-bold text-red-500' : ''}`}
                >
                  {interval.label} - {Math.floor(interval.duration / 60)}:{String(interval.duration % 60).padStart(2, '0')}
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2">Cool Down</h3>
        <ul>
          {cooldownIntervals.map((interval, index) => (
            <li
              key={index}
              className={`text-lg ${stage === 'cooldown' && currentInterval === index ? 'font-bold text-red-500' : ''}`}
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
