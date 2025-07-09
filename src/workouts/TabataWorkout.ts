// src/workouts/TabataWorkout.ts
import { TabataWorkout as TabataWorkoutData, BaseExercise, BaseSection } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '@/utils/colorUtils';

interface TabataSection extends BaseSection {
  isRest: boolean;
  exerciseIndex: number;
  color: string;
}

export class TabataWorkout extends Workout {
  readonly type = 'tabata';
  private tabataSections: TabataSection[];

  constructor(data: TabataWorkoutData, date: string) {
    const tabataSections = TabataWorkout.createTabataSections(data);
    const allSections = [
      ...data.warmUp,
      ...tabataSections,
      ...data.coolDown
    ];
    const coloredSections = TabataWorkout.assignTabataColors(allSections, data);
    super(data, coloredSections, date);
    
    this.validateWorkoutData(data);
    this.tabataSections = tabataSections.map((section, index) => ({
      ...section,
      color: coloredSections[data.warmUp.length + index].color
    }));
  }

  private validateWorkoutData(data: TabataWorkoutData): void {
    if (data.workout.workDuration === undefined) {
      throw new Error('Tabata work duration must be defined');
    }
    if (data.workout.restDuration === undefined) {
      throw new Error('Tabata rest duration must be defined');
    }
    if (data.workout.rounds === undefined) {
      throw new Error('Tabata rounds must be defined');
    }
    if (data.workout.exercises.length === 0) {
      throw new Error('Tabata workout must include at least one exercise');
    }
  }

  private static createTabataSections(data: TabataWorkoutData): TabataSection[] {
    const { workDuration, restDuration, rounds, exercises } = data.workout;
    const sections: TabataSection[] = [];

    for (let round = 0; round < rounds; round++) {
      exercises.forEach((exercise, index) => {
        sections.push({
          name: exercise.name,
          duration: workDuration,
          isRest: false,
          exerciseIndex: index,
          color: '' // This will be filled in later
        });
        sections.push({
          name: 'Rest',
          duration: restDuration,
          isRest: true,
          exerciseIndex: index,
          color: '' // This will be filled in later
        });
      });
    }

    return sections;
  }

  getTabataInfo(): { workDuration: number; restDuration: number; rounds: number; exercises: BaseExercise[] } {
    const tabataData = this.data.workout as TabataWorkoutData['workout'];
    return {
      workDuration: tabataData.workDuration,
      restDuration: tabataData.restDuration,
      rounds: tabataData.rounds,
      exercises: tabataData.exercises
    };
  }

  getTabataSections(): TabataSection[] {
    return this.tabataSections;
  }

  private static assignTabataColors(sections: (BaseSection | TabataSection)[], data: TabataWorkoutData): SectionWithColor[] {
    const colorsFromUtils = assignColorsToWorkout(data);
    
    return sections.map((section, index): SectionWithColor => {
      // Use colors from the centralized color system
      return { ...section, color: colorsFromUtils[index].color };
    });
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

  getCurrentRound(time: number): number {
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const coolDownDuration = this.data.coolDown.reduce((total, section) => total + (section.duration || 0), 0);
    const tabataDuration = this.duration - warmUpDuration - coolDownDuration;
    
    if (time < warmUpDuration) {
      return 0; // In warm-up phase
    } else if (time < warmUpDuration + tabataDuration) {
      const tabataTime = time - warmUpDuration;
      const { workDuration, restDuration, exercises } = this.getTabataInfo();
      const roundDuration = exercises.length * (workDuration + restDuration);
      return Math.floor(tabataTime / roundDuration) + 1;
    } else {
      return this.getTabataInfo().rounds; // In cool-down phase
    }
  }

  getRemainingRounds(time: number): number {
    const currentRound = this.getCurrentRound(time);
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const coolDownDuration = this.data.coolDown.reduce((total, section) => total + (section.duration || 0), 0);
    const tabataDuration = this.duration - warmUpDuration - coolDownDuration;
    
    if (time < warmUpDuration || time >= warmUpDuration + tabataDuration) {
      return 0; // Not in Tabata phase
    }
    
    const totalRounds = this.getTabataInfo().rounds;
    return Math.max(0, totalRounds - currentRound);
  }
}