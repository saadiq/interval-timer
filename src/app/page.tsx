// page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { WorkoutTimer } from './WorkoutTimer';
import { WorkoutData } from './types';

async function fetchWorkoutData(date: string): Promise<WorkoutData> {
  const response = await fetch(`/api/workouts/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch workout data');
  }
  const data = await response.json();
  console.log('Fetched workout data:', data); // Debugging log
  return data as WorkoutData;
}

export default function WorkoutPage() {
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      try {
        const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
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
  }, []);

  if (isLoading) {
    return <div>Loading workout...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!workoutData) {
    return <div>No workout available for today.</div>;
  }

  return <WorkoutTimer workoutData={workoutData} />;
}