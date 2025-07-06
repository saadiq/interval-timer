// src/utils/colorUtils.ts

import { WorkoutData, WorkoutSection } from '@/workouts/types';
import { getWarmUpColor, getCoolDownColor, getRestColor, getWorkoutColor } from './workoutColors';

export type SectionWithColor = WorkoutSection & { color: string };

export function assignColorsToWorkout(workoutData: WorkoutData): SectionWithColor[] {
  const warmUpColors = workoutData.warmUp.map(() => getWarmUpColor());
  const coolDownColors = workoutData.coolDown.map(() => getCoolDownColor());
  
  let mainWorkoutColors: string[];
  if (workoutData.type === 'amrap') {
    // AMRAP is a single section with one color
    mainWorkoutColors = [getWorkoutColor('amrap', 0)];
  } else if (workoutData.type === 'circuit') {
    // Circuit alternates between exercise colors, with rest periods
    mainWorkoutColors = Array(workoutData.workout.rounds).fill(
      workoutData.workout.exercises.map((exercise, index) => {
        // Check if this is a rest period
        if (exercise.name.toLowerCase().includes('rest')) {
          return getRestColor();
        }
        return getWorkoutColor('circuit', index);
      })
    ).flat();
  } else if (workoutData.type === 'tabata') {
    // Tabata alternates between exercise and rest, with different colors for each exercise
    mainWorkoutColors = Array(workoutData.workout.rounds).fill(
      workoutData.workout.exercises.flatMap((_, index) => [
        getWorkoutColor('tabata', index),
        getRestColor()
      ])
    ).flat();
  } else if (workoutData.type === 'emom') {
    // EMOM uses different colors for each minute
    mainWorkoutColors = Array.from({ length: workoutData.workout.rounds }, (_, index) => 
      getWorkoutColor('emom', index)
    );
  } else {
    mainWorkoutColors = [];
  }

  const coloredSections: SectionWithColor[] = [
    ...workoutData.warmUp.map((section, index) => ({ ...section, color: warmUpColors[index] })),
    ...getMainWorkoutSections(workoutData).map((section, index) => ({ ...section, color: mainWorkoutColors[index] || 'bg-primary' })),
    ...workoutData.coolDown.map((section, index) => ({ ...section, color: coolDownColors[index] }))
  ];

  return coloredSections;
}

function getMainWorkoutSections(workoutData: WorkoutData): WorkoutSection[] {
  switch (workoutData.type) {
    case 'amrap': {
      // AMRAP is a single continuous section where exercises are cycled through
      return [{
        name: 'AMRAP',
        duration: workoutData.workout.duration,
        description: workoutData.workout.exercises.map(ex => `${ex.reps} ${ex.name}`).join(', ')
      }];
    }
    case 'circuit':
      return Array(workoutData.workout.rounds).fill(workoutData.workout.exercises).flat();
    case 'tabata':
      return Array(workoutData.workout.rounds).fill(
        workoutData.workout.exercises.flatMap(exercise => [
          { ...exercise, duration: workoutData.workout.workDuration },
          { name: 'Rest', duration: workoutData.workout.restDuration }
        ])
      ).flat();
    case 'emom': {
      // Create one section per minute, each containing all exercises
      const exerciseList = workoutData.workout.exercises.map(ex => 
        ex.name.replace(/^\d+\s+/, '') // Remove leading numbers from exercise names
      ).join(', ');
      return Array.from({ length: workoutData.workout.rounds }, (_, index) => ({
        name: `Minute ${index + 1}`,
        duration: 60,
        description: exerciseList
      }));
    }
    default:
      return [];
  }
}