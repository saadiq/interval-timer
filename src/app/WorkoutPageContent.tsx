// src/app/WorkoutPageContent.tsx
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { WorkoutTimer } from './WorkoutTimer';
import { Workout } from '@/workouts';
import { getLocalDate, formatDateWithTimezone, parseDate } from '@/utils/timezone';
import { fetchWorkoutData } from '@/utils/workoutFetcher';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';

function formatDisplayDate(dateString: string, isExplicitDate: boolean): string {
  if (isExplicitDate) {
    return format(parseDate(dateString), 'MMMM d, yyyy');
  }
  return formatDateWithTimezone(dateString);
}

const WorkoutPageContentInner: React.FC = () => {
  const searchParams = useSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isExplicitDate, setIsExplicitDate] = useState(false);
  const [dateNote, setDateNote] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState<string>('');

  const loadWorkout = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    setDateNote(null);
    setError(null);
    try {
      const dateParam = searchParams.get('date');
      const isDateExplicit = !!dateParam;
      setIsExplicitDate(isDateExplicit);

      // Get the date, ensuring consistent handling
      const date = dateParam || getLocalDate();
      setRequestedDate(date);

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
              {formatDisplayDate(requestedDate, isExplicitDate)}
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
};

export default function WorkoutPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner message="Loading..." size="large" />
        </div>
      }
    >
      <WorkoutPageContentInner />
    </Suspense>
  );
}
