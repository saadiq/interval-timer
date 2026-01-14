// src/workouts/AMRAPWorkout.ts
import { AMRAPWorkout as AMRAPWorkoutData, BaseExercise, BaseSection } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '../utils/colorUtils';

interface AMRAPSection extends BaseSection {
  exercises: BaseExercise[];
}

export class AMRAPWorkout extends Workout {
  readonly type = 'amrap';
  private readonly amrapSection: AMRAPSection & SectionWithColor;

  constructor(data: AMRAPWorkoutData, date: string) {
    const sectionsWithColor = assignColorsToWorkout(data);
    super(data, sectionsWithColor, date);
    this.validateWorkoutData(data);

    // Find the AMRAP section from the colored sections
    const amrapSectionIndex = data.warmUp.length;
    const amrapSectionWithColor = sectionsWithColor[amrapSectionIndex];

    this.amrapSection = {
      name: 'AMRAP',
      duration: data.workout.duration,
      exercises: data.workout.exercises,
      description: this.generateAmrapDescription(data.workout.exercises),
      color: amrapSectionWithColor.color,
    };
  }

  private validateWorkoutData(data: AMRAPWorkoutData): void {
    if (data.workout.duration === undefined) {
      throw new Error('AMRAP workout duration must be defined');
    }
    if (data.workout.exercises.length === 0) {
      throw new Error('AMRAP workout must include at least one exercise');
    }
  }

  private generateAmrapDescription(exercises: BaseExercise[]): string {
    return exercises.map((ex) => `${ex.reps} ${ex.name}`).join(', ');
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
    return [lastSection, this.duration - elapsedTime];
  }

  getAMRAPSection(): AMRAPSection & SectionWithColor {
    return this.amrapSection;
  }

  isAMRAPSection(section: SectionWithColor): section is AMRAPSection & SectionWithColor {
    return section.name === 'AMRAP' && 'exercises' in section;
  }
}
