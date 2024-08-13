// src/workouts/types.ts

export interface BaseSection {
  name: string;
  duration: number;
  description?: string;
}

export interface BaseExercise {
  name: string;
  duration?: number;
  reps?: number;
  description?: string;
}

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