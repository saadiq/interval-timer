// src/app/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkoutTimer } from './WorkoutTimer';
import { WorkoutData } from '../workouts/types';

const getNewYorkDate = (): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  const nyDate = new Date().toLocaleString('en-US', options);
  const [month, day, year] = nyDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

async function fetchWorkoutData(date: string): Promise<WorkoutData> {
  const response = await fetch(`/api/workouts/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch workout data');
  }
  const data = await response.json();
  return data as WorkoutData;
}

const WorkoutPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      try {
        const dateParam = searchParams.get('date');
        const date = dateParam || getNewYorkDate();
        const data = await fetchWorkoutData(date);
        setWorkoutData(data);
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

  if (!workoutData) {
    return <div>No workout available for the selected date.</div>;
  }

  return <WorkoutTimer workoutData={workoutData} />;
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkoutPageContent />
    </Suspense>
  );
}