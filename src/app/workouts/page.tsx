'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { parseDate } from '@/utils/timezone';
import { WorkoutListSkeleton } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { generateWorkoutUrl } from '@/utils/dateUrls';

interface WorkoutDetails {
  type: string;
  totalDuration: number;
  exerciseCount: number;
  primaryExercises: string[];
}

interface WorkoutListResponse {
  dates: string[];
  count: number;
  workoutDetails: Record<string, WorkoutDetails>;
}

const WORKOUT_BADGE_CLASSES: Record<string, string> = {
  CIRCUIT: 'workout-badge-circuit',
  AMRAP: 'workout-badge-amrap',
  TABATA: 'workout-badge-tabata',
  EMOM: 'workout-badge-emom',
};

export default function WorkoutListPage() {
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [workoutDetails, setWorkoutDetails] = useState<Record<string, WorkoutDetails>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutDates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/workouts');
      if (!response.ok) {
        throw new Error('Failed to fetch workout dates');
      }
      const data = (await response.json()) as WorkoutListResponse;
      setWorkoutDates(data.dates);
      setWorkoutDetails(data.workoutDetails);
    } catch {
      setError('Failed to load workout dates. Please try again later.');
      // Error fetching workout dates
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkoutDates();
  }, [fetchWorkoutDates]);

  // Group workouts by month
  const workoutsByMonth = workoutDates.reduce<Record<string, string[]>>((acc, date) => {
    const monthKey = date.substring(0, 7); // "YYYY-MM"
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(date);
    return acc;
  }, {});

  function formatDate(dateString: string): string {
    return format(parseDate(dateString), 'MMMM d, yyyy');
  }

  function formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    if (!year || !month) return monthKey;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    return format(date, 'MMMM yyyy');
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  function getWorkoutTypeClass(type: string): string {
    return WORKOUT_BADGE_CLASSES[type] ?? 'bg-muted text-muted-foreground border-border';
  }

  if (isLoading) {
    return <WorkoutListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <ErrorDisplay message={error} onRetry={fetchWorkoutDates} />
      </div>
    );
  }

  if (workoutDates.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">No Workouts Available</h1>
        <p className="text-lg mb-4">There are currently no workouts available in the system.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 text-foreground">Available Workouts</h1>
        <p className="text-lg text-muted-foreground">
          Browse and select from {workoutDates.length} available workout
          {workoutDates.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-10">
        {Object.keys(workoutsByMonth)
          .sort()
          .reverse()
          .map((monthKey) => (
            <div key={monthKey} className="space-y-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-foreground">{formatMonth(monthKey)}</h2>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {workoutsByMonth[monthKey]?.length ?? 0} workout
                  {(workoutsByMonth[monthKey]?.length ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {workoutsByMonth[monthKey]?.map((date) => {
                  const details = workoutDetails[date];
                  if (!details) return null;
                  return (
                    <Link
                      href={generateWorkoutUrl(date)}
                      key={date}
                      className="group block p-6 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/20 transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                              {formatDate(date)}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {details.exerciseCount} exercises •{' '}
                              {formatDuration(details.totalDuration)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${getWorkoutTypeClass(
                                details.type
                              )}`}
                            >
                              {details.type}
                            </span>
                          </div>
                        </div>

                        {/* Exercise Preview */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <div className="flex items-start space-x-2">
                            <div className="text-sm font-medium text-muted-foreground min-w-0">
                              Featured exercises:
                            </div>
                            <div className="text-sm text-card-foreground font-medium">
                              {details.primaryExercises.slice(0, 3).join(', ')}
                              {details.primaryExercises.length > 3 && (
                                <span className="text-muted-foreground">
                                  {' '}
                                  and {details.primaryExercises.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
