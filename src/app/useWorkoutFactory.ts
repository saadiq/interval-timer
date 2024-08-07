// useWorkoutFactory.ts
import { useState, useEffect } from 'react';
import { WorkoutFactory } from './WorkoutFactory';
import { Workout } from './Workout';
import { WorkoutData } from './types';

export function useWorkoutFactory(workoutData: WorkoutData) {
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    setWorkout(WorkoutFactory.createWorkout(workoutData));
  }, [workoutData]);

  return workout;
}