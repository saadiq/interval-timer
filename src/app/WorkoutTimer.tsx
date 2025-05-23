// src/app/WorkoutTimer.tsx
import React from "react";
import { WorkoutProvider, useWorkoutContext } from "./WorkoutContext";
import { CountdownDisplay } from "@/components/CountdownDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { ControlButtons } from "@/components/ControlButtons";
import { WorkoutSummary } from "@/components/WorkoutSummary";
import { Workout } from "@/workouts";
import { useWakeLock } from "@/hooks/useWakeLock";
import { formatDateWithTimezone, parseDate } from "@/utils/timezone";
import { format } from "date-fns";

interface WorkoutTimerProps {
  workout: Workout;
  isExplicitDate?: boolean;
}

interface WorkoutContextExtendedProps {
  isExplicitDate?: boolean;
}

const WorkoutTimerContent: React.FC<WorkoutContextExtendedProps> = ({
  isExplicitDate = false,
}) => {
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

  // Format the date with or without timezone based on whether it's an explicit date
  let formattedDate;
  try {
    if (isExplicitDate) {
      // For explicitly provided dates, use simple formatting without timezone
      formattedDate = format(parseDate(workout.date), "MMMM d, yyyy");
    } else {
      // For derived dates (current date), show with timezone context
      formattedDate = formatDateWithTimezone(workout.date);
    }
  } catch (err) {
    console.error("Error formatting date:", err);
    formattedDate = workout.date; // Fallback to raw date
  }

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

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  workout,
  isExplicitDate = false,
}) => {
  return (
    <WorkoutProvider initialWorkout={workout}>
      <WorkoutTimerContent isExplicitDate={isExplicitDate} />
    </WorkoutProvider>
  );
};
