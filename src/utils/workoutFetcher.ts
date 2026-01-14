// src/utils/workoutFetcher.ts
import { Workout, WorkoutData, WorkoutFactory } from '@/workouts';

export interface WorkoutResponse {
  _note?: string;
  _actualDate?: string;
  type: string;
  warmUp: Array<{ name: string; duration: number; description?: string }>;
  workout: {
    exercises: Array<{ name: string; duration?: number; reps?: number; description?: string }>;
    rounds?: number;
    duration?: number;
    workDuration?: number;
    restDuration?: number;
  };
  coolDown: Array<{ name: string; duration: number; description?: string }>;
}

export interface FetchWorkoutResult {
  workout: Workout | null;
  actualDate?: string;
  note?: string;
}

export async function fetchWorkoutData(date: string): Promise<FetchWorkoutResult> {
  const response = await fetch(`/api/workouts/${date}`);

  if (!response.ok) {
    if (response.status === 404) {
      return { workout: null };
    }
    throw new Error('Failed to fetch workout data');
  }

  const data = (await response.json()) as WorkoutResponse;
  const actualDate = data._actualDate || date;

  const cleanWorkoutData: WorkoutData = {
    type: data.type,
    warmUp: data.warmUp,
    workout: data.workout,
    coolDown: data.coolDown,
  } as WorkoutData;

  return {
    workout: WorkoutFactory.createWorkout(cleanWorkoutData, actualDate),
    actualDate,
    note: data._note,
  };
}
