// src/app/WorkoutTimer.tsx
import React from "react";
import { WorkoutProvider, useWorkoutContext } from "./WorkoutContext";
import { CountdownDisplay } from "@/components/CountdownDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { ControlButtons } from "@/components/ControlButtons";
import { WorkoutSummary } from "@/components/WorkoutSummary";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
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
    // Error formatting date
    formattedDate = workout.date; // Fallback to raw date
  }

  return (
    <main className="workout-timer" aria-label="Workout timer application">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <section className="bg-card border border-border rounded-lg shadow-xl p-4 sm:p-6" aria-labelledby="workout-timer-title">
            <div className="flex flex-col min-h-[400px] justify-between">
              <h1 id="workout-timer-title" className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-center text-card-foreground">
                {formattedDate} Workout
              </h1>
              <CountdownDisplay />
              <ControlButtons />
              <ProgressBar />
            </div>
          </section>
        </div>
        <aside className="lg:col-span-1" aria-label="Workout details">
          <WorkoutSummary />
        </aside>
      </div>
      <KeyboardShortcuts />
    </main>
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
