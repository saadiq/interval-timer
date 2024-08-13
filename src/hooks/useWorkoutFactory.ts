// src/hooks/useWorkoutFactory.ts
import { useState, useEffect } from 'react';
import { Workout, WorkoutData, WorkoutFactory } from '@/workouts';

export function useWorkoutFactory(workoutData: WorkoutData, date: string) {
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    setWorkout(WorkoutFactory.createWorkout(workoutData, date));
  }, [workoutData, date]);

  return workout;
}