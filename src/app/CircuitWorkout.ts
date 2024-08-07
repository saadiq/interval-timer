// CircuitWorkout.ts
import { CircuitWorkout as CircuitWorkoutData, CircuitExercise, BaseSection } from './types';
import { Workout } from './Workout';

type WorkoutSection = BaseSection | CircuitExercise;

export class CircuitWorkout extends Workout {
  type = 'circuit';
  duration: number;
  sections: WorkoutSection[];

  constructor(data: CircuitWorkoutData) {
    super(data);
    this.sections = [
      ...data.warmUp,
      ...Array(data.workout.repetitions).fill(data.workout.exercises).flat(),
      ...data.coolDown
    ];
    this.duration = this.sections.reduce((total, section) => total + section.duration, 0);
  }

  getCurrentSection(time: number): WorkoutSection {
    let accumulatedTime = 0;
    for (const section of this.sections) {
      accumulatedTime += section.duration;
      if (time < accumulatedTime) {
        return section;
      }
    }
    return this.sections[this.sections.length - 1];
  }

  getNextSection(time: number): WorkoutSection | null {
    let accumulatedTime = 0;
    for (let i = 0; i < this.sections.length; i++) {
      accumulatedTime += this.sections[i].duration;
      if (time < accumulatedTime) {
        return i < this.sections.length - 1 ? this.sections[i + 1] : null;
      }
    }
    return null;
  }

  getProgress(time: number): number {
    return Math.min(time / this.duration, 1);
  }
}