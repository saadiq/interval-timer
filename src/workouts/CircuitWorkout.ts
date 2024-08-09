// CircuitWorkout.ts
import { CircuitWorkout as CircuitWorkoutData, BaseExercise, WorkoutSection, WorkoutData } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '@/util/colorUtils';

export class CircuitWorkout extends Workout {
  readonly type = 'circuit';
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;
  readonly data: CircuitWorkoutData;  // Explicitly type the data property

  constructor(data: CircuitWorkoutData) {
    const sectionsWithColor = assignColorsToWorkout(data);
    super(data, sectionsWithColor);
    
    this.data = data;  // Assign the data to the class property
    this.validateWorkoutData(data);
    this.sections = sectionsWithColor;
    this.duration = this.calculateTotalDuration();
  }

  private validateWorkoutData(data: CircuitWorkoutData): void {
    const allSections = [
      ...data.warmUp,
      ...data.workout.exercises,
      ...data.coolDown
    ];
    allSections.forEach((section, index) => {
      if (section.duration === undefined) {
        throw new Error(`Section duration must be defined. Undefined duration found at index ${index}`);
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

  getCurrentSection(time: number): SectionWithColor {
    return this.getSectionAtTime(time)[0];
  }

  getNextSection(time: number): SectionWithColor | null {
    const [currentSection, sectionTime] = this.getSectionAtTime(time);
    const currentIndex = this.sections.indexOf(currentSection);
    return currentIndex < this.sections.length - 1 ? this.sections[currentIndex + 1] : null;
  }

  getProgress(time: number): number {
    return Math.min(time / this.duration, 1);
  }

  protected getSectionDuration(section: SectionWithColor): number {
    if (section.duration === undefined) {
      throw new Error(`Undefined duration found in section: ${section.name}`);
    }
    return section.duration;
  }
}