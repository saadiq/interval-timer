// WorkoutFactory.ts
import { Workout } from './Workout';
import { CircuitWorkout } from './CircuitWorkout';
import { AMRAPWorkout } from './AMRAPWorkout';
import { TabataWorkout } from './TabataWorkout';
import { WorkoutData } from './types';

export class WorkoutFactory {
  static createWorkout(data: WorkoutData): Workout {
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid workout data: ${JSON.stringify(data)}`);
    }

    switch (data.type) {
      case 'circuit':
        return new CircuitWorkout(data);
      case 'amrap':
        return new AMRAPWorkout(data);
      case 'tabata':
        return new TabataWorkout(data);
      default:
        throw new Error(`Unsupported workout type: ${(data as WorkoutData).type}`);
    }
  }
}