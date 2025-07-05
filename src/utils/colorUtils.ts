// src/utils/colorUtils.ts

import { WorkoutData, WorkoutSection } from '@/workouts/types';
import { getWarmUpColor, getCoolDownColor, getRestColor, getWorkoutColor } from './workoutColors';

export type SectionWithColor = WorkoutSection & { color: string };

export function assignColorsToWorkout(workoutData: WorkoutData): SectionWithColor[] {
  const warmUpColors = workoutData.warmUp.map(() => getWarmUpColor());
  const coolDownColors = workoutData.coolDown.map(() => getCoolDownColor());
  
  let mainWorkoutColors: string[];
  if (workoutData.type === 'amrap') {
    // AMRAP has a single section with all exercises
    mainWorkoutColors = [getWorkoutColor('amrap')];
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
    // Tabata alternates between exercise and rest
    mainWorkoutColors = Array(workoutData.workout.rounds).fill(
      workoutData.workout.exercises.flatMap((_, index) => [
        getWorkoutColor('tabata', index),
        getRestColor()
      ])
    ).flat();
  } else if (workoutData.type === 'emom') {
    // EMOM uses consistent color for all exercises
    const emomSections = workoutData.workout.exercises || [];
    mainWorkoutColors = emomSections.map(() => getWorkoutColor('emom'));
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
    case 'amrap':
      return [{ name: 'AMRAP', duration: workoutData.workout.duration }];
    case 'circuit':
      return Array(workoutData.workout.rounds).fill(workoutData.workout.exercises).flat();
    case 'tabata':
      return Array(workoutData.workout.rounds).fill(
        workoutData.workout.exercises.flatMap(exercise => [
          { ...exercise, duration: workoutData.workout.workDuration },
          { name: 'Rest', duration: workoutData.workout.restDuration }
        ])
      ).flat();
    default:
      return [];
  }
}