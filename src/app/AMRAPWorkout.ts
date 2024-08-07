// AMRAPWorkout.ts
import { AMRAPWorkout as AMRAPWorkoutData, BaseExercise, BaseSection, WorkoutSection, WorkoutData } from './types';
import { Workout } from './Workout';

interface AMRAPExerciseSection extends BaseSection {
  exercises: BaseExercise[];
}

export class AMRAPWorkout extends Workout {
  readonly type = 'amrap';
  readonly duration: number;
  readonly sections: ReadonlyArray<WorkoutSection>;
  private amrapSection: AMRAPExerciseSection;

  constructor(data: AMRAPWorkoutData) {
    super(data);
    this.validateWorkoutData(data);
    this.amrapSection = {
      name: 'AMRAP',
      duration: data.workout.duration,
      exercises: data.workout.exercises
    };
    this.sections = [
      ...data.warmUp,
      this.amrapSection,
      ...data.coolDown
    ];
    this.duration = this.calculateTotalDuration();
  }

  private validateWorkoutData(data: AMRAPWorkoutData): void {
    if (data.workout.duration === undefined) {
      throw new Error('AMRAP workout duration must be defined');
    }
    data.warmUp.concat(data.coolDown).forEach((section, index) => {
      if (section.duration === undefined) {
        throw new Error(`Section duration must be defined. Undefined duration found in ${index < data.warmUp.length ? 'warm-up' : 'cool-down'} section at index ${index % data.warmUp.length}`);
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

  getCurrentExercise(time: number): BaseExercise | null {
    const currentSection = this.getCurrentSection(time);
    if (this.isAMRAPSection(currentSection)) {
      const [, sectionTime] = this.getSectionAtTime(time);
      const exerciseIndex = Math.floor(sectionTime / 60) % currentSection.exercises.length;
      return currentSection.exercises[exerciseIndex];
    }
    return null;
  }

  private isAMRAPSection(section: WorkoutSection): section is AMRAPExerciseSection {
    return section === this.amrapSection;
  }

  protected getSectionDuration(section: WorkoutSection): number {
    if (section.duration === undefined) {
      throw new Error(`Undefined duration found in section: ${section.name}`);
    }
    return section.duration;
  }
}