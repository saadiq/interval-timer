// src/util/colorUtils.ts

import { WorkoutData, WorkoutSection } from '@/workouts/types';

export type SectionWithColor = WorkoutSection & { color: string };

export function assignColorsToWorkout(workoutData: WorkoutData): SectionWithColor[] {
  const warmUpColors = workoutData.warmUp.map(() => 'bg-yellow-300');
  const coolDownColors = workoutData.coolDown.map(() => 'bg-yellow-300');
  
  let mainWorkoutColors: string[];
  if (workoutData.type === 'amrap') {
    mainWorkoutColors = workoutData.workout.exercises.map(() => 'bg-blue-300');
  } else if (workoutData.type === 'circuit') {
    mainWorkoutColors = Array(workoutData.workout.rounds).fill(workoutData.workout.exercises.map((_, index) => 
      index % 2 === 0 ? 'bg-blue-300' : 'bg-green-400'
    )).flat();
  } else { // tabata
    // Remove Tabata-specific logic here, as it will be handled in the TabataWorkout class
    mainWorkoutColors = [];
  }

  const coloredSections: SectionWithColor[] = [
    ...workoutData.warmUp.map((section, index) => ({ ...section, color: warmUpColors[index] })),
    ...getMainWorkoutSections(workoutData).map((section, index) => ({ ...section, color: mainWorkoutColors[index] })),
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