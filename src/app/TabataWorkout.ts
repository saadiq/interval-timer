// TabataWorkout.ts
import { TabataWorkout as TabataWorkoutData, TabataExercise, BaseSection } from './types';
import { Workout } from './Workout';

type WorkoutSection = BaseSection | (TabataExercise & { duration: number, isRest: boolean });

export class TabataWorkout extends Workout {
  type = 'tabata';
  duration: number;
  sections: WorkoutSection[];

  constructor(data: TabataWorkoutData) {
    super(data);
    const tabataExercises = data.workout.exercises.flatMap(exercise => [
      { ...exercise, duration: data.workout.workDuration, isRest: false },
      { name: 'Rest', duration: data.workout.restDuration, isRest: true }
    ]);
    this.sections = [
      ...data.warmUp,
      ...Array(data.workout.rounds).fill(tabataExercises).flat(),
      ...data.coolDown
    ];
    this.duration = this.sections.reduce((total, section) => total + section.duration, 0);
  }

  getCurrentSection(time: number): WorkoutSection {
    let accumulatedTime = 0;
    for (const section of this.sections) {
      accumulatedTime += section.duration;
      if (time < accumulatedTime) {
        return section;
      }
    }
    return this.sections[this.sections.length - 1];
  }

  getNextSection(time: number): WorkoutSection | null {
    let accumulatedTime = 0;
    for (let i = 0; i < this.sections.length; i++) {
      accumulatedTime += this.sections[i].duration;
      if (time < accumulatedTime) {
        return i < this.sections.length - 1 ? this.sections[i + 1] : null;
      }
    }
    return null;
  }

  getProgress(time: number): number {
    return Math.min(time / this.duration, 1);
  }

  isRestPeriod(time: number): boolean {
    const currentSection = this.getCurrentSection(time);
    return 'isRest' in currentSection && currentSection.isRest;
  }
}