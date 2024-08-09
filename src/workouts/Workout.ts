// Workout.ts

import { WorkoutData, WorkoutSection } from './types';
import { SectionWithColor } from '../util/colorUtils';

export abstract class Workout {
  abstract readonly type: string;
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;

  constructor(public readonly data: WorkoutData, sections: SectionWithColor[]) {
    this.sections = sections;
    this.duration = this.calculateTotalDuration();
  }

  protected calculateTotalDuration(): number {
    return this.sections.reduce((total, section) => total + (section.duration || 0), 0);
  }

  abstract getCurrentSection(time: number): WorkoutSection;
  abstract getNextSection(time: number): WorkoutSection | null;

  getProgress(time: number): number {
    return Math.min(1, Math.max(0, time / this.duration));
  }

  protected getSectionAtTime(time: number): [SectionWithColor, number] {
    let elapsedTime = 0;
    for (const section of this.sections) {
      const sectionDuration = section.duration || 0;
      if (time < elapsedTime + sectionDuration) {
        return [section, time - elapsedTime];
      }
      elapsedTime += sectionDuration;
    }
    const lastSection = this.sections[this.sections.length - 1];
    return [lastSection, (lastSection.duration || 0)];
  }
}