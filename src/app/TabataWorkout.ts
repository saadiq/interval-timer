// TabataWorkout.ts
import { TabataWorkout as TabataWorkoutData, BaseExercise, BaseSection, WorkoutSection } from './types';
import { Workout } from './Workout';

type TabataSection = WorkoutSection & {
  isRest: boolean;
};

export class TabataWorkout extends Workout {
  readonly type = 'tabata';
  readonly duration: number;
  readonly sections: ReadonlyArray<WorkoutSection>;

  constructor(data: TabataWorkoutData) {
    super(data);
    this.validateWorkoutData(data);
    const tabataExercises: TabataSection[] = data.workout.exercises.flatMap(exercise => [
      { ...exercise, name: exercise.name, duration: data.workout.workDuration, isRest: false },
      { name: 'Rest', duration: data.workout.restDuration, isRest: true }
    ]);
    this.sections = [
      ...data.warmUp,
      ...Array(data.workout.rounds).fill(tabataExercises).flat(),
      ...data.coolDown
    ];
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

  getCurrentSection(time: number): WorkoutSection {
    return this.getSectionAtTime(time)[0];
  }

  getNextSection(time: number): WorkoutSection | null {
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

  protected getSectionDuration(section: WorkoutSection): number {
    if (section.duration === undefined) {
      throw new Error(`Undefined duration found in section: ${section.name}`);
    }
    return section.duration;
  }

  private isTabataSection(section: WorkoutSection): section is TabataSection {
    return 'isRest' in section;
  }
}