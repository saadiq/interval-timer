// Centralized workout color configuration
// This file provides a single source of truth for all workout-related colors

export const WORKOUT_COLORS = {
  // Section type colors
  warmUp: 'bg-yellow-300',
  coolDown: 'bg-yellow-300',
  rest: 'bg-gray-300',
  
  // Workout type colors
  circuit: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-400',
    // For alternating exercises in circuit
    exercises: ['bg-blue-500', 'bg-blue-400']
  },
  amrap: {
    primary: 'bg-green-500',
    exercises: 'bg-green-500'
  },
  tabata: {
    primary: 'bg-red-500',
    // Use consistent color for all Tabata exercises
    exercises: 'bg-red-500'
  },
  emom: {
    primary: 'bg-purple-500',
    exercises: 'bg-purple-500'
  }
} as const;

export type WorkoutType = keyof typeof WORKOUT_COLORS;

export function getWarmUpColor(): string {
  return WORKOUT_COLORS.warmUp;
}

export function getCoolDownColor(): string {
  return WORKOUT_COLORS.coolDown;
}

export function getRestColor(): string {
  return WORKOUT_COLORS.rest;
}

export function getWorkoutColor(workoutType: string, exerciseIndex: number = 0): string {
  const type = workoutType.toLowerCase() as WorkoutType;
  
  switch (type) {
    case 'circuit':
      // Alternate between two shades of blue for circuit exercises
      return WORKOUT_COLORS.circuit.exercises[exerciseIndex % WORKOUT_COLORS.circuit.exercises.length];
    case 'amrap':
      return WORKOUT_COLORS.amrap.exercises;
    case 'tabata':
      return WORKOUT_COLORS.tabata.exercises;
    case 'emom':
      return WORKOUT_COLORS.emom.exercises;
    default:
      return 'bg-primary'; // Fallback color
  }
}