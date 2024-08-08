// Workout.ts

import { WorkoutSection, WorkoutData, BaseSection, BaseExercise } from './types';
import { assignColorsToWorkout, SectionWithColor } from '@/util/colorUtils';

export abstract class Workout {
  abstract readonly type: string;
  abstract readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;

  constructor(public readonly data: WorkoutData) {
    this.sections = assignColorsToWorkout(data);
  }

  abstract getCurrentSection(time: number): WorkoutSection;
  abstract getNextSection(time: number): WorkoutSection | null;

  getProgress(time: number): number {
    return Math.min(1, Math.max(0, time / this.duration));
  }

  protected getElapsedTime(time: number): number {
    return Math.min(time, this.duration);
  }

  protected getSectionAtTime(time: number): [WorkoutSection, number] {
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

  protected isBaseSection(section: WorkoutSection): section is BaseSection {
    return 'name' in section && 'duration' in section;
  }

  protected isBaseExercise(section: WorkoutSection): section is BaseExercise {
    return 'name' in section && ('duration' in section || 'reps' in section);
  }

  protected getSectionDuration(section: WorkoutSection): number {
    if (this.isBaseSection(section)) {
      return section.duration;
    } else if (this.isBaseExercise(section)) {
      return section.duration ?? this.getDefaultExerciseDuration();
    }
    return 0;
  }

  protected getDefaultExerciseDuration(): number {
    // You might want to adjust this value or make it configurable
    return 30; // Default to 30 seconds if duration is not specified
  }
}