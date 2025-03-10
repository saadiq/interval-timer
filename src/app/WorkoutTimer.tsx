// src/app/WorkoutTimer.tsx
import React from "react";
import { WorkoutProvider, useWorkoutContext } from "./WorkoutContext";
import { CountdownDisplay } from "@/components/CountdownDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { ControlButtons } from "@/components/ControlButtons";
import { WorkoutSummary } from "@/components/WorkoutSummary";
import { Workout } from "@/workouts";
import { useWakeLock } from "@/hooks/useWakeLock";
import { formatDateWithTimezone } from "@/utils/timezone";

interface WorkoutTimerProps {
  workout: Workout;
}

const WorkoutTimerContent: React.FC = () => {
  const { workout, isRunning } = useWorkoutContext();
  const { isSupported, request, release } = useWakeLock();

  React.useEffect(() => {
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

  // Format the date with timezone
  const formattedDate = formatDateWithTimezone(workout.date);

  return (
    <div className="workout-timer">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
            <div className="flex flex-col min-h-[400px] justify-between">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-center">
                {formattedDate} Workout
              </h1>
              <CountdownDisplay />
              <ControlButtons />
              <ProgressBar />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <WorkoutSummary />
        </div>
      </div>
    </div>
  );
};

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ workout }) => {
  return (
    <WorkoutProvider initialWorkout={workout}>
      <WorkoutTimerContent />
    </WorkoutProvider>
  );
};
