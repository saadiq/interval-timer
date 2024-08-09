// WorkoutTimer.tsx
import React, { useEffect } from 'react';
import { WorkoutProvider, useWorkoutContext } from './WorkoutContext';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { ProgressBar } from '@/components/ProgressBar';
import { ControlButtons } from '@/components/ControlButtons';
import { WorkoutSummary } from '@/components/WorkoutSummary';
import { WorkoutData } from '@/workouts';
import { useWakeLock } from '@/hooks/useWakeLock';

interface WorkoutTimerProps {
  workoutData: WorkoutData;
}

const WorkoutTimerContent: React.FC = () => {
  const { workout, isRunning } = useWorkoutContext();
  const { isSupported, request, release } = useWakeLock();

  useEffect(() => {
    if (isSupported) {
      if (isRunning) {
        request();
      } else {
        release();
      }
    }
  }, [isRunning, isSupported, request, release]);

  if (!workout) {
    return <div>Loading workout...</div>;
  }

  return (
    <div className="workout-timer">
      <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-4 text-center">
      {workout.type === "amrap" 
        ? "AMRAP Workout"
        : `${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} Workout`}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 h-full flex flex-col justify-between">
            <CountdownDisplay />
            <ControlButtons />
            <ProgressBar />
          </div>
        </div>
        <div className="lg:col-span-1">
          <WorkoutSummary />
        </div>
      </div>
    </div>
  );
};

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ workoutData }) => {
  return (
    <WorkoutProvider initialWorkoutData={workoutData}>
      <WorkoutTimerContent />
    </WorkoutProvider>
  );
};