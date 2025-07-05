// Centralized workout color configuration
// This file provides a single source of truth for all workout-related colors

export const WORKOUT_COLORS = {
  // Section type colors
  warmUp: 'bg-yellow-300',
  coolDown: 'bg-yellow-300',
  rest: 'bg-gray-300',
  
  // Workout type colors with multiple shades for visual variety
  circuit: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-400',
    // Multiple shades for different exercises
    exercises: ['bg-blue-500', 'bg-blue-400', 'bg-blue-600', 'bg-blue-300', 'bg-blue-700']
  },
  amrap: {
    primary: 'bg-green-500',
    // Multiple shades for different exercises in AMRAP
    exercises: ['bg-green-500', 'bg-green-400', 'bg-green-600', 'bg-green-300', 'bg-green-700']
  },
  tabata: {
    primary: 'bg-red-500',
    // Multiple shades for different exercises in Tabata
    exercises: ['bg-red-500', 'bg-red-400', 'bg-red-600', 'bg-red-300', 'bg-red-700']
  },
  emom: {
    primary: 'bg-purple-500',
    // Multiple shades for different exercises in EMOM
    exercises: ['bg-purple-500', 'bg-purple-400', 'bg-purple-600', 'bg-purple-300', 'bg-purple-700']
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
      // Cycle through multiple shades of blue for circuit exercises
      return WORKOUT_COLORS.circuit.exercises[exerciseIndex % WORKOUT_COLORS.circuit.exercises.length];
    case 'amrap':
      // Cycle through multiple shades of green for AMRAP exercises
      return WORKOUT_COLORS.amrap.exercises[exerciseIndex % WORKOUT_COLORS.amrap.exercises.length];
    case 'tabata':
      // Cycle through multiple shades of red for Tabata exercises
      return WORKOUT_COLORS.tabata.exercises[exerciseIndex % WORKOUT_COLORS.tabata.exercises.length];
    case 'emom':
      // Cycle through multiple shades of purple for EMOM exercises
      return WORKOUT_COLORS.emom.exercises[exerciseIndex % WORKOUT_COLORS.emom.exercises.length];
    default:
      return 'bg-primary'; // Fallback color
  }
}