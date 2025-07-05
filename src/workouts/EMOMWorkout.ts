// src/workouts/EMOMWorkout.ts
import { EMOMWorkout as EMOMWorkoutData } from './types';
import { Workout } from './Workout';
import { SectionWithColor, assignColorsToWorkout } from '@/utils/colorUtils';

export class EMOMWorkout extends Workout {
  readonly type = 'emom';
  readonly duration: number;
  readonly sections: ReadonlyArray<SectionWithColor>;
  private readonly rounds: number;

  constructor(data: EMOMWorkoutData, date: string) {
    const sectionsWithColor = EMOMWorkout.createEMOMSections(data);
    super(data, sectionsWithColor, date);
    
    this.validateWorkoutData(data);
    this.sections = sectionsWithColor;
    this.rounds = data.workout.rounds;
    this.duration = this.calculateTotalDuration();
  }

  private validateWorkoutData(data: EMOMWorkoutData): void {
    if (data.workout.exercises.length === 0) {
      throw new Error('EMOM workout must include at least one exercise');
    }
    if (data.workout.rounds < 1) {
      throw new Error('EMOM workout must have at least one round');
    }
  }

  private static createEMOMSections(data: EMOMWorkoutData): SectionWithColor[] {
    // Use the centralized color assignment system
    const sectionsWithColors = assignColorsToWorkout(data);
    return sectionsWithColors;
  }

  protected calculateTotalDuration(): number {
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const coolDownDuration = this.data.coolDown.reduce((total, section) => total + (section.duration || 0), 0);
    const emomDuration = this.getEMOMDuration();
    return warmUpDuration + emomDuration + coolDownDuration;
  }

  protected getSectionAtTime(time: number): [SectionWithColor, number] {
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const emomDuration = this.getEMOMDuration();
    const emomSections = this.getEMOMSections();

    if (time < warmUpDuration) {
      // In warm-up
      return super.getSectionAtTime(time);
    } else if (time < warmUpDuration + emomDuration) {
      // In EMOM
      const emomTime = time - warmUpDuration;
      const roundDuration = emomSections.length * 60;
      const timeInRound = emomTime % roundDuration;
      const sectionIndex = Math.floor(timeInRound / 60);
      return [emomSections[sectionIndex], timeInRound % 60];
    } else {
      // In cool-down
      return super.getSectionAtTime(time);
    }
  }

  getEMOMSections(): SectionWithColor[] {
    return this.sections.filter(section => 
      !this.data.warmUp.some(w => w.name === section.name) && 
      !this.data.coolDown.some(c => c.name === section.name)
    );
  }

  getEMOMDuration(): number {
    return this.getEMOMSections().length * 60 * this.rounds;
  }

  getRounds(): number {
    return this.rounds;
  }
}