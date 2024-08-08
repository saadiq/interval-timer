import { TabataWorkout as TabataWorkoutData, BaseExercise, BaseSection, WorkoutSection } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '@/util/colorUtils';

type TabataSection = SectionWithColor & {
  isRest: boolean;
};

export class TabataWorkout extends Workout {
  readonly type = 'tabata';
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;

  constructor(data: TabataWorkoutData) {
    super(data);
    this.validateWorkoutData(data);
    const tabataExercises: WorkoutSection[] = data.workout.exercises.flatMap(exercise => [
      { ...exercise, name: exercise.name, duration: data.workout.workDuration, isRest: false },
      { name: 'Rest', duration: data.workout.restDuration, isRest: true }
    ]);
    const sectionsWithoutColor = [
      ...data.warmUp,
      ...Array(data.workout.rounds).fill(tabataExercises).flat(),
      ...data.coolDown
    ];
    this.sections = assignColorsToWorkout(data) as ReadonlyArray<SectionWithColor>;
    this.duration = this.calculateTotalDuration();
  }

  private validateWorkoutData(data: TabataWorkoutData): void {
    if (data.workout.workDuration === undefined) {
      throw new Error('Tabata work duration must be defined');
    }
    if (data.workout.restDuration === undefined) {
      throw new Error('Tabata rest duration must be defined');
    }
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

  private calculateTotalDuration(): number {
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

  isRestPeriod(time: number): boolean {
    const currentSection = this.getCurrentSection(time);
    return this.isTabataSection(currentSection) && currentSection.isRest;
  }

  protected getSectionDuration(section: SectionWithColor): number {
    if (section.duration === undefined) {
      throw new Error(`Undefined duration found in section: ${section.name}`);
    }
    return section.duration;
  }

  private isTabataSection(section: SectionWithColor): section is TabataSection {
    return 'isRest' in section;
  }
}