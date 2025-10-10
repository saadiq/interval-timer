// src/workouts/CircuitWorkout.ts
import { CircuitWorkout as CircuitWorkoutData, isRepBasedExercise } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '@/utils/colorUtils';

export class CircuitWorkout extends Workout {
  readonly type = 'circuit';
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;
  readonly data: CircuitWorkoutData;  // Explicitly type the data property

  constructor(data: CircuitWorkoutData, date: string) {
    const sectionsWithColor = assignColorsToWorkout(data);
    super(data, sectionsWithColor, date);
    
    this.data = data;  // Assign the data to the class property
    this.validateWorkoutData(data);
    this.sections = sectionsWithColor;
    this.duration = this.calculateTotalDuration();
  }

  private validateWorkoutData(data: CircuitWorkoutData): void {
    // Validate warm-up sections (must have duration only)
    data.warmUp.forEach((section, index) => {
      if (section.duration === undefined) {
        throw new Error(
          `Warm-up section "${section.name}" at index ${index} must have duration`
        );
      }
    });

    // Validate workout exercises (must have duration OR reps, not neither, not both)
    data.workout.exercises.forEach((exercise, index) => {
      const hasDuration = exercise.duration !== undefined;
      const hasReps = exercise.reps !== undefined;

      if (!hasDuration && !hasReps) {
        throw new Error(
          `Workout exercise "${exercise.name}" at index ${index} must have either duration or reps`
        );
      }

      if (hasDuration && hasReps) {
        throw new Error(
          `Workout exercise "${exercise.name}" at index ${index} cannot have both duration and reps`
        );
      }
    });

    // Validate cool-down sections (must have duration only)
    data.coolDown.forEach((section, index) => {
      if (section.duration === undefined) {
        throw new Error(
          `Cool-down section "${section.name}" at index ${index} must have duration`
        );
      }
    });
  }

  protected calculateTotalDuration(): number {
    return this.sections.reduce((total, section) => total + this.getSectionDuration(section), 0);
  }

  protected getSectionAtTime(time: number): [SectionWithColor, number] {
    let elapsedTime = 0;
    for (const section of this.sections) {
      const sectionDuration = this.getSectionDuration(section);
      if (time < elapsedTime + sectionDuration) {
        return [section, time - elapsedTime];
      }
      elapsedTime += sectionDuration;
    }
    const lastSection = this.sections[this.sections.length - 1];
    return [lastSection, this.getSectionDuration(lastSection)];
  }

  getProgress(time: number): number {
    return Math.min(time / this.duration, 1);
  }

  protected getSectionDuration(section: SectionWithColor): number {
    if (section.duration === undefined) {
      return 1;  // Rep-based exercises occupy 1s for navigation
    }
    return section.duration;
  }
}