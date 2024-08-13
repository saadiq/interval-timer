// useWorkoutFactory.ts
import { useState, useEffect } from 'react';
import { WorkoutFactory } from '@/workouts/WorkoutFactory';
import { Workout } from '@/workouts/Workout';
import { WorkoutData } from '@/workouts/types';

export function useWorkoutFactory(workoutData: WorkoutData, date: string) {
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    setWorkout(WorkoutFactory.createWorkout(workoutData, date));
  }, [workoutData, date]);

  return workout;
}