// AMRAPWorkout.ts
import { AMRAPWorkout as AMRAPWorkoutData, BaseExercise, BaseSection, WorkoutSection, WorkoutData } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '../util/colorUtils';

interface AMRAPSection extends BaseSection {
  exercises: BaseExercise[];
}

export class AMRAPWorkout extends Workout {
  readonly type = 'amrap';
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;
  private amrapSection: (AMRAPSection & SectionWithColor) | null = null;

  constructor(data: AMRAPWorkoutData) {
    const sectionsWithColor = assignColorsToWorkout(data);
    super(data, sectionsWithColor);
    
    this.validateWorkoutData(data);
    const amrapSection: AMRAPSection = {
      name: 'AMRAP',
      duration: data.workout.duration,
      exercises: data.workout.exercises,
      description: this.generateAmrapDescription(data.workout.exercises)
    };
    this.sections = sectionsWithColor;
    this.amrapSection = sectionsWithColor.find(s => s.name === 'AMRAP') as (AMRAPSection & SectionWithColor) | null;
    if (this.amrapSection) {
      this.amrapSection.exercises = data.workout.exercises;
    }
    this.duration = this.calculateTotalDuration();
  }

  private validateWorkoutData(data: AMRAPWorkoutData): void {
    if (data.workout.duration === undefined) {
      throw new Error('AMRAP workout duration must be defined');
    }
    if (data.workout.exercises.length === 0) {
      throw new Error('AMRAP workout must include at least one exercise');
    }
    data.warmUp.concat(data.coolDown).forEach((section, index) => {
      if (section.duration === undefined) {
        throw new Error(`Section duration must be defined. Undefined duration found in ${index < data.warmUp.length ? 'warm-up' : 'cool-down'} section at index ${index % data.warmUp.length}`);
      }
    });
  }

  protected calculateTotalDuration(): number {
    return this.sections.reduce((total, section) => total + this.getSectionDuration(section), 0);
  }

  private generateAmrapDescription(exercises: BaseExercise[]): string {
    const exerciseList = exercises.map(ex => `${ex.reps} ${ex.name}`).join(', ');
    return `Perform as many rounds as possible of: ${exerciseList}`;
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

  getAMRAPSection(): (AMRAPSection & SectionWithColor) | null {
    return this.amrapSection;
  }

  isAMRAPSection(section: SectionWithColor): section is AMRAPSection & SectionWithColor {
    return section.name === 'AMRAP' && 'exercises' in section;
  }
}