// AMRAPWorkout.ts
import { AMRAPWorkout as AMRAPWorkoutData, AMRAPExercise, BaseSection } from './types';
import { Workout } from './Workout';

type WorkoutSection = BaseSection | { name: string; duration: number; exercises: AMRAPExercise[] };

export class AMRAPWorkout extends Workout {
  type = 'amrap';
  duration: number;
  sections: WorkoutSection[];

  constructor(data: AMRAPWorkoutData) {
    super(data);
    this.duration = data.warmUp.reduce((total, section) => total + section.duration, 0) +
                    data.workout.duration +
                    data.coolDown.reduce((total, section) => total + section.duration, 0);
    this.sections = [
      ...data.warmUp,
      { name: 'AMRAP', duration: data.workout.duration, exercises: data.workout.exercises },
      ...data.coolDown
    ];
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

  getCurrentExercise(time: number): AMRAPExercise | null {
    const currentSection = this.getCurrentSection(time);
    if ('exercises' in currentSection) {
      const elapsedTime = time - this.sections.slice(0, this.sections.indexOf(currentSection)).reduce((total, s) => total + s.duration, 0);
      const exerciseIndex = Math.floor(elapsedTime / 60) % currentSection.exercises.length;
      return currentSection.exercises[exerciseIndex];
    }
    return null;
  }
}