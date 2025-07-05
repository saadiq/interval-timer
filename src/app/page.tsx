// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WorkoutTimer } from "./WorkoutTimer";
import { WorkoutData } from "../workouts/types";
import { WorkoutFactory } from "../workouts/WorkoutFactory";
import { Workout } from "@/workouts";
import {
  getLocalDate,
  formatDateWithTimezone,
  parseDate,
} from "@/utils/timezone";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorDisplay } from "@/components/ErrorDisplay";

// Extended interface for the API response
interface WorkoutResponse {
  _note?: string;
  _actualDate?: string;
  type: string;
  warmUp: Array<{ name: string; duration: number; description?: string }>;
  workout: {
    exercises: Array<{ name: string; duration?: number; reps?: number; description?: string }>;
    rounds?: number;
    duration?: number;
    workDuration?: number;
    restDuration?: number;
  };
  coolDown: Array<{ name: string; duration: number; description?: string }>;
}

async function fetchWorkoutData(
  date: string
): Promise<{ workout: Workout | null; actualDate?: string; note?: string }> {
  const response = await fetch(`/api/workouts/${date}`);
  if (!response.ok) {
    if (response.status === 404) {
      return { workout: null };
    }
    throw new Error("Failed to fetch workout data");
  }

  const data = (await response.json()) as WorkoutResponse;

  // Check if we got a different date's workout
  const actualDate = data._actualDate || date;
  const note = data._note;

  // Create a clean workout data object without metadata
  const cleanWorkoutData: WorkoutData = {
    type: data.type,
    warmUp: data.warmUp,
    workout: data.workout,
    coolDown: data.coolDown
  } as WorkoutData;

  return {
    workout: WorkoutFactory.createWorkout(cleanWorkoutData, actualDate),
    actualDate,
    note,
  };
}

// Format date for display
const formatDate = (dateString: string, isExplicitDate: boolean = false) => {
  if (isExplicitDate) {
    // For explicitly provided dates, use simple formatting without timezone
    // Use parseDate to ensure consistent date handling
    return format(parseDate(dateString), "MMMM d, yyyy");
  } else {
    // For derived dates (current date), show with timezone context
    return formatDateWithTimezone(dateString);
  }
};

const WorkoutPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isExplicitDate, setIsExplicitDate] = useState(false);
  const [dateNote, setDateNote] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState<string>("");

  const loadWorkout = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    setDateNote(null);
    setError(null);
    try {
      const dateParam = searchParams.get("date");
      const isDateExplicit = !!dateParam;
      setIsExplicitDate(isDateExplicit);

      // Get the date, ensuring consistent handling
      const date = dateParam || getLocalDate();
      setRequestedDate(date);

      const {
        workout: fetchedWorkout,
        note,
      } = await fetchWorkoutData(date);

      if (fetchedWorkout === null) {
        setNotFound(true);
      } else {
        setWorkout(fetchedWorkout);

        // If we got a different date's workout, set the note
        if (note) {
          setDateNote(note);
        }
      }
    } catch (err) {
      setError("Failed to load workout. Please try again later.");
      // Error loading workout
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading workout..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <ErrorDisplay 
          message={error}
          onRetry={loadWorkout}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">No Workout Found</h1>
        <p className="text-lg mb-4">
          There is no workout available for{" "}
          {formatDate(requestedDate, isExplicitDate)}.
        </p>
        <Link
          href="/workouts"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          View All Available Workouts
        </Link>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No workout available for the selected date.
      </div>
    );
  }

  return (
    <>
      {dateNote && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{dateNote}</p>
        </div>
      )}
      <WorkoutTimer workout={workout} isExplicitDate={isExplicitDate} />
    </>
  );
};

export default function WorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner message="Loading..." size="large" />
        </div>
      }
    >
      <WorkoutPageContent />
    </Suspense>
  );
}
