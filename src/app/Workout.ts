// Workout.ts
import {WorkoutSection, WorkoutData} from './types';

export abstract class Workout {
  abstract type: string;
  abstract duration: number;
  abstract sections: WorkoutSection[];

  constructor(public data: WorkoutData) {}

  abstract getCurrentSection(time: number): WorkoutSection;
  abstract getNextSection(time: number): WorkoutSection | null;
  abstract getProgress(time: number): number;
}