// src/workouts/TabataWorkout.ts
import { TabataWorkout as TabataWorkoutData, BaseExercise, WorkoutSection, BaseSection } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '@/util/colorUtils';

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
    const warmUpColors = data.warmUp.map(() => 'bg-yellow-300');
    const coolDownColors = data.coolDown.map(() => 'bg-yellow-300');
    
    const exerciseColors: string[] = data.workout.exercises.map((_, index) => {
      const colors = ['bg-blue-300', 'bg-green-300', 'bg-red-300', 'bg-purple-300', 'bg-pink-300', 'bg-indigo-300', 'bg-teal-300'];
      return colors[index % colors.length];
    });
    
    return sections.map((section, index): SectionWithColor => {
      if (index < data.warmUp.length) {
        return { ...section, color: warmUpColors[index] };
      } else if (index >= sections.length - data.coolDown.length) {
        return { ...section, color: coolDownColors[index - (sections.length - data.coolDown.length)] };
      } else {
        const tabataSection = section as TabataSection;
        return { ...section, color: tabataSection.isRest ? 'bg-gray-300' : exerciseColors[tabataSection.exerciseIndex] };
      }
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
}