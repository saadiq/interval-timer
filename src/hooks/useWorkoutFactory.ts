// src/hooks/useWorkoutFactory.ts
import { useMemo } from 'react';
import { Workout, WorkoutData, WorkoutFactory } from '@/workouts';

export function useWorkoutFactory(workoutData: WorkoutData, date: string): Workout {
  return useMemo(() => WorkoutFactory.createWorkout(workoutData, date), [workoutData, date]);
}
