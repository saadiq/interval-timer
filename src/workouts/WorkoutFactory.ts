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
  static createWorkout(data: WorkoutData, date: string): Workout {
    if (!data || typeof data !== "object") {
      throw new Error(`Invalid workout data: ${JSON.stringify(data)}`);
    }

    switch (data.type) {
      case "circuit":
        return new CircuitWorkout(data, date);
      case "amrap":
        return new AMRAPWorkout(data, date);
      case "tabata":
        return new TabataWorkout(data, date);
      case "emom":
        return new EMOMWorkout(data, date);
      default:
        throw new Error(
          `Unsupported workout type: ${(data as WorkoutData).type}`
        );
    }
  }
}