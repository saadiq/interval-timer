// useWorkoutFactory.ts
import { useState, useEffect } from 'react';
import { WorkoutFactory } from '@/workouts/WorkoutFactory';
import { Workout } from '@/workouts/Workout';
import { WorkoutData } from '@/workouts/types';

export function useWorkoutFactory(workoutData: WorkoutData) {
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    setWorkout(WorkoutFactory.createWorkout(workoutData));
  }, [workoutData]);

  return workout;
}