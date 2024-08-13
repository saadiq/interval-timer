// src/workouts/Workout.ts

import { WorkoutData, WorkoutSection } from './types';
import { SectionWithColor } from '../util/colorUtils';

export abstract class Workout {
  abstract readonly type: string;
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;
  readonly date: string;

  constructor(public readonly data: WorkoutData, sections: SectionWithColor[], date: string) {
    this.sections = sections;
    this.duration = this.calculateTotalDuration();
    this.date = date;
  }

  protected calculateTotalDuration(): number {
    return this.sections.reduce((total, section) => total + (section.duration || 0), 0);
  }

  getCurrentSection(time: number): SectionWithColor {
    return this.getSectionAtTime(time)[0];
  }

  getNextSection(time: number): SectionWithColor | null {
    const [currentSection, sectionTime] = this.getSectionAtTime(time);
    const currentIndex = this.sections.indexOf(currentSection);
    return currentIndex < this.sections.length - 1 ? this.sections[currentIndex + 1] : null;
  }

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