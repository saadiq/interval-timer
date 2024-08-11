// src/workouts/WorkoutFactory.ts
import {
  Workout,
  CircuitWorkout,
  AMRAPWorkout,
  TabataWorkout,
  EMOMWorkout,
  WorkoutData,
} from "./";

export class WorkoutFactory {
  static createWorkout(data: WorkoutData): Workout {
    if (!data || typeof data !== "object") {
      throw new Error(`Invalid workout data: ${JSON.stringify(data)}`);
    }

    switch (data.type) {
      case "circuit":
        return new CircuitWorkout(data);
      case "amrap":
        return new AMRAPWorkout(data);
      case "tabata":
        return new TabataWorkout(data);
      case "emom":
        return new EMOMWorkout(data);
      default:
        throw new Error(
          `Unsupported workout type: ${(data as WorkoutData).type}`
        );
    }
  }
}
