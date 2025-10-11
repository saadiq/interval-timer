// src/workouts/types.ts

export interface BaseSection {
  name: string;
  duration: number;
  description?: string;
}

export interface BaseExercise {
  name: string;
  duration?: number;
  reps?: string; // String to support ranges like "8-10" or "8 per arm"
  description?: string;
}

// WorkoutSection can be either a BaseSection (warmup/cooldown with required duration)
// or BaseExercise (workout exercise with optional duration and/or reps)
export type WorkoutSection = BaseSection | BaseExercise;

export interface BaseWorkout {
  type: string;
  warmUp: BaseSection[];
  coolDown: BaseSection[];
}

export interface CircuitWorkout extends BaseWorkout {
  type: 'circuit';
  workout: {
    rounds: number;
    exercises: BaseExercise[];
  };
}

export interface AMRAPWorkout extends BaseWorkout {
  type: 'amrap';
  workout: {
    duration: number;
    exercises: BaseExercise[];
  };
}

export interface TabataWorkout extends BaseWorkout {
  type: 'tabata';
  workout: {
    rounds: number;
    workDuration: number;
    restDuration: number;
    exercises: BaseExercise[];
  };
}

export interface EMOMWorkout extends BaseWorkout {
  type: 'emom';
  workout: {
    rounds: number;
    exercises: BaseExercise[];
  };
}

export type WorkoutData = CircuitWorkout | AMRAPWorkout | TabataWorkout | EMOMWorkout;

export type WorkoutDataMap = {
  [date: string]: WorkoutData;
};

// Type guard functions
export function isRepBasedExercise(exercise: BaseExercise): boolean {
  return exercise.reps !== undefined && exercise.duration === undefined;
}

export function isTimedExercise(exercise: BaseExercise): boolean {
  return exercise.duration !== undefined;
}
