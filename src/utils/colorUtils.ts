// src/utils/colorUtils.ts

import { WorkoutData, WorkoutSection } from '@/workouts/types';
import { getWarmUpColor, getCoolDownColor, getRestColor, getWorkoutColor } from './workoutColors';

export type SectionWithColor = WorkoutSection & { color: string };

export function assignColorsToWorkout(workoutData: WorkoutData): SectionWithColor[] {
  const warmUpColors = workoutData.warmUp.map(() => getWarmUpColor());
  const coolDownColors = workoutData.coolDown.map(() => getCoolDownColor());
  
  let mainWorkoutColors: string[];
  if (workoutData.type === 'amrap') {
    // AMRAP should create multiple sections for visual variety
    mainWorkoutColors = workoutData.workout.exercises.map((_, index) => getWorkoutColor('amrap', index));
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
    // EMOM uses different colors for each exercise across all rounds
    mainWorkoutColors = Array(workoutData.workout.rounds).fill(
      workoutData.workout.exercises.map((_, index) => getWorkoutColor('emom', index))
    ).flat();
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
      // Create individual sections for each exercise for visual variety
      const exerciseDuration = Math.floor(workoutData.workout.duration / workoutData.workout.exercises.length);
      return workoutData.workout.exercises.map((exercise, index) => ({
        ...exercise,
        duration: index === workoutData.workout.exercises.length - 1 
          ? workoutData.workout.duration - (exerciseDuration * index) // Last exercise gets remaining time
          : exerciseDuration
      }));
    case 'circuit':
      return Array(workoutData.workout.rounds).fill(workoutData.workout.exercises).flat();
    case 'tabata':
      return Array(workoutData.workout.rounds).fill(
        workoutData.workout.exercises.flatMap(exercise => [
          { ...exercise, duration: workoutData.workout.workDuration },
          { name: 'Rest', duration: workoutData.workout.restDuration }
        ])
      ).flat();
    case 'emom':
      // Create sections for each exercise with 60-second duration
      return Array(workoutData.workout.rounds).fill(
        workoutData.workout.exercises.map(exercise => ({
          ...exercise,
          duration: 60 // Each EMOM exercise takes exactly one minute
        }))
      ).flat();
    default:
      return [];
  }
}