// src/app/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

// Debug component to show timezone information
const TimezoneDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    try {
      const now = new Date();
      const localDate = getLocalDate();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = -now.getTimezoneOffset() / 60;
      const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;

      const info = `
        Current time (UTC): ${now.toISOString()}
        Browser timezone: ${timezone} (UTC${offsetStr})
        Local date: ${localDate}
        Formatted date: ${formatDateWithTimezone(localDate)}
      `;

      setDebugInfo(info);
    } catch (err) {
      setDebugInfo(`Error getting timezone info: ${err}`);
    }
  }, []);

  if (!debugInfo) return null;

  return (
    <div className="bg-gray-100 p-4 mb-4 font-mono text-xs whitespace-pre-wrap">
      <h3 className="font-bold mb-2">Debug Timezone Info:</h3>
      {debugInfo}
    </div>
  );
};

// Extended interface for the API response
interface WorkoutResponse {
  _note?: string;
  _actualDate?: string;
  type: string;
  warmUp: Array<{ name: string; duration: number; description?: string }>;
  workout: any; // This will vary based on workout type
  coolDown: Array<{ name: string; duration: number; description?: string }>;
}

async function fetchWorkoutData(
  date: string
): Promise<{ workout: Workout | null; actualDate?: string; note?: string }> {
  console.log("Fetching workout data for date:", date);

  const response = await fetch(`/api/workouts/${date}`);
  if (!response.ok) {
    if (response.status === 404) {
      console.log("No workout found for date:", date);
      return { workout: null };
    }
    throw new Error("Failed to fetch workout data");
  }

  const data = (await response.json()) as WorkoutResponse;
  console.log("Received workout data:", data);

  // Check if we got a different date's workout
  const actualDate = data._actualDate || date;
  const note = data._note;

  // Remove the metadata before creating the workout
  const { _note, _actualDate, ...workoutData } = data;

  return {
    workout: WorkoutFactory.createWorkout(
      workoutData as WorkoutData,
      actualDate
    ),
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
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isExplicitDate, setIsExplicitDate] = useState(false);
  const [dateNote, setDateNote] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState<string>("");

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      setNotFound(false);
      setDateNote(null);
      try {
        const dateParam = searchParams.get("date");
        const isDateExplicit = !!dateParam;
        setIsExplicitDate(isDateExplicit);

        // Get the date, ensuring consistent handling
        const date = dateParam || getLocalDate();
        console.log(
          "Loading workout for date:",
          date,
          "isExplicit:",
          isDateExplicit
        );
        setRequestedDate(date);

        const {
          workout: fetchedWorkout,
          actualDate,
          note,
        } = await fetchWorkoutData(date);

        if (fetchedWorkout === null) {
          setNotFound(true);
        } else {
          console.log("Setting workout with date:", actualDate || date);
          setWorkout(fetchedWorkout);
          setCurrentDate(actualDate || date);

          // If we got a different date's workout, set the note
          if (note) {
            setDateNote(note);
          }
        }
      } catch (err) {
        setError("Failed to load workout. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading workout...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
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
      <TimezoneDebug />
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
          Loading...
        </div>
      }
    >
      <WorkoutPageContent />
    </Suspense>
  );
}
