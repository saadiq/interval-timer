// src/app/WorkoutPageWithDate.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WorkoutTimer } from './WorkoutTimer';
import { WorkoutData } from '../workouts/types';
import { WorkoutFactory } from '../workouts/WorkoutFactory';
import { Workout } from '@/workouts';
import { formatDateWithTimezone, parseDate } from '@/utils/timezone';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';

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
    throw new Error('Failed to fetch workout data');
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
    coolDown: data.coolDown,
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
    return format(parseDate(dateString), 'MMMM d, yyyy');
  } else {
    // For derived dates (current date), show with timezone context
    return formatDateWithTimezone(dateString);
  }
};

interface WorkoutPageWithDateProps {
  date: string;
  isExplicitDate?: boolean;
}

export default function WorkoutPageWithDate({
  date,
  isExplicitDate = true,
}: WorkoutPageWithDateProps) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [dateNote, setDateNote] = useState<string | null>(null);

  const loadWorkout = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    setDateNote(null);
    setError(null);

    try {
      const { workout: fetchedWorkout, note } = await fetchWorkoutData(date);

      if (fetchedWorkout === null) {
        setNotFound(true);
      } else {
        setWorkout(fetchedWorkout);

        // If we got a different date's workout, set the note
        if (note) {
          setDateNote(note);
        }
      }
    } catch {
      setError('Failed to load workout. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner message="Loading workout..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-background">
        <ErrorDisplay message={error} onRetry={loadWorkout} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🏃‍♂️</div>
          <h1 className="text-3xl font-bold text-foreground">No Workout Found</h1>
          <p className="text-lg text-muted-foreground">
            There is no workout available for{' '}
            <span className="font-semibold text-foreground">
              {formatDate(date, isExplicitDate)}
            </span>
            .
          </p>
          <Link
            href="/workouts"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Available Workouts
          </Link>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <p className="text-lg text-muted-foreground">
            No workout available for the selected date.
          </p>
        </div>
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
}
