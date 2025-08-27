// Centralized workout color configuration
// This file provides a single source of truth for all workout-related colors

export const WORKOUT_COLORS = {
  // Section type colors
  warmUp: 'bg-amber-400',
  coolDown: 'bg-amber-400',
  rest: 'bg-slate-300',
  
  // Workout type colors with multiple shades for visual variety - refined palette
  circuit: {
    primary: 'bg-indigo-500',
    secondary: 'bg-indigo-400',
    // Multiple shades for different exercises
    exercises: ['bg-indigo-500', 'bg-indigo-400', 'bg-blue-500', 'bg-indigo-600', 'bg-blue-400']
  },
  amrap: {
    primary: 'bg-teal-400',
    // Multiple shades for different exercises in AMRAP
    exercises: ['bg-teal-400', 'bg-teal-500', 'bg-cyan-400', 'bg-teal-400', 'bg-cyan-400']
  },
  tabata: {
    primary: 'bg-amber-500',
    // Multiple shades for different exercises in Tabata
    exercises: ['bg-amber-500', 'bg-amber-400', 'bg-orange-400', 'bg-amber-500', 'bg-orange-400']
  },
  emom: {
    primary: 'bg-violet-400',
    // Multiple shades for different exercises in EMOM
    exercises: ['bg-violet-400', 'bg-violet-300', 'bg-purple-300', 'bg-violet-400', 'bg-purple-300']
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