// src/app/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WorkoutTimer } from "./WorkoutTimer";
import { WorkoutData } from "../workouts/types";
import { WorkoutFactory } from "../workouts/WorkoutFactory";
import { Workout } from "@/workouts";
import { getLocalDate, formatDateWithTimezone } from "@/utils/timezone";

async function fetchWorkoutData(date: string): Promise<Workout | null> {
  const response = await fetch(`/api/workouts/${date}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch workout data");
  }
  const data = (await response.json()) as WorkoutData;
  return WorkoutFactory.createWorkout(data, date);
}

// Format date for display
const formatDate = (dateString: string) => {
  return formatDateWithTimezone(dateString);
};

const WorkoutPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const dateParam = searchParams.get("date");
        const date = dateParam || getLocalDate();
        setCurrentDate(date);
        const fetchedWorkout = await fetchWorkoutData(date);

        if (fetchedWorkout === null) {
          setNotFound(true);
        } else {
          setWorkout(fetchedWorkout);
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
          There is no workout available for {formatDate(currentDate)}.
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

  return <WorkoutTimer workout={workout} />;
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
