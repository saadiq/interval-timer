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

    if (time < warmUpDuration) {
      // In warm-up
      return super.getSectionAtTime(time);
    } else if (time < warmUpDuration + emomDuration) {
      // In EMOM - create a combined section for the current minute
      const emomTime = time - warmUpDuration;
      const timeInCurrentMinute = emomTime % 60;
      const currentRound = Math.floor(emomTime / 60) + 1;
      
      // Create a combined section with all exercises for this minute
      const exerciseNames = this.data.workout.exercises.map(ex => ex.name).join(', ');
      const combinedSection: SectionWithColor = {
        name: `Round ${currentRound} of ${this.rounds}`,
        duration: 60,
        description: exerciseNames,
        color: '#3B82F6' // Default blue color
      };
      
      return [combinedSection, timeInCurrentMinute];
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
    return this.rounds * 60;
  }

  getRounds(): number {
    return this.rounds;
  }

  getCurrentRound(time: number): number {
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const emomDuration = this.getEMOMDuration();
    
    if (time < warmUpDuration) {
      return 0; // In warm-up phase
    } else if (time < warmUpDuration + emomDuration) {
      const emomTime = time - warmUpDuration;
      const currentRound = Math.floor(emomTime / 60) + 1;
      return Math.min(currentRound, this.rounds);
    } else {
      return this.rounds; // In cool-down phase
    }
  }

  getRemainingRounds(time: number): number {
    const currentRound = this.getCurrentRound(time);
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const emomDuration = this.getEMOMDuration();
    
    if (time < warmUpDuration || time >= warmUpDuration + emomDuration) {
      return 0; // Not in EMOM phase
    }
    
    return Math.max(0, this.rounds - currentRound);
  }

  getNextSection(time: number): SectionWithColor | null {
    const warmUpDuration = this.data.warmUp.reduce((total, section) => total + (section.duration || 0), 0);
    const emomDuration = this.getEMOMDuration();
    
    if (time < warmUpDuration) {
      // In warm-up - check if next section is EMOM
      const nextSection = super.getNextSection(time);
      if (nextSection && time >= warmUpDuration - 60) { // Within 60 seconds of EMOM
        // Return the first EMOM round
        const exerciseNames = this.data.workout.exercises.map(ex => ex.name).join(', ');
        return {
          name: `Round 1 of ${this.rounds}`,
          duration: 60,
          description: exerciseNames,
          color: '#3B82F6'
        };
      }
      return nextSection;
    } else if (time < warmUpDuration + emomDuration) {
      // In EMOM - show next round or cool-down
      const emomTime = time - warmUpDuration;
      const currentRound = Math.floor(emomTime / 60) + 1;
      
      if (currentRound < this.rounds) {
        // Show next EMOM round
        const exerciseNames = this.data.workout.exercises.map(ex => ex.name).join(', ');
        return {
          name: `Round ${currentRound + 1} of ${this.rounds}`,
          duration: 60,
          description: exerciseNames,
          color: '#3B82F6'
        };
      } else {
        // Show cool-down
        return this.data.coolDown.length > 0 ? {
          name: this.data.coolDown[0].name,
          duration: this.data.coolDown[0].duration,
          description: this.data.coolDown[0].description,
          color: '#10B981' // Green for cool-down
        } : null;
      }
    } else {
      // In cool-down
      return super.getNextSection(time);
    }
  }
}