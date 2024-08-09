// workouts/index.ts

export { Workout } from './Workout';
export { CircuitWorkout } from './CircuitWorkout';
export { AMRAPWorkout } from './AMRAPWorkout';
export { TabataWorkout } from './TabataWorkout';
export { WorkoutFactory } from './WorkoutFactory';

// You can also export types if they're defined in these files
export type { WorkoutData, WorkoutSection, BaseSection, BaseExercise } from './types';