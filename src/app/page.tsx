// src/app/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkoutTimer } from './WorkoutTimer';
import { WorkoutData } from '../workouts/types';
import { WorkoutFactory } from '../workouts/WorkoutFactory';
import { Workout } from '@/workouts';

const getLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function fetchWorkoutData(date: string): Promise<Workout> {
  const response = await fetch(`/api/workouts/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch workout data');
  }
  const data = await response.json() as WorkoutData;
  return WorkoutFactory.createWorkout(data, date);
}

const WorkoutPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      try {
        const dateParam = searchParams.get('date');
        const date = dateParam || getLocalDate();
        const fetchedWorkout = await fetchWorkoutData(date);
        setWorkout(fetchedWorkout);
      } catch (err) {
        setError('Failed to load workout. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [searchParams]);

  if (isLoading) {
    return <div>Loading workout...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!workout) {
    return <div>No workout available for the selected date.</div>;
  }

  return <WorkoutTimer workout={workout} />;
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkoutPageContent />
    </Suspense>
  );
}