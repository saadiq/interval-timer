// Edge-compatible workout loader (no fs/path modules)
import { WorkoutDataMap } from '@/workouts/types';
import legacyWorkouts from '@/data/workouts.json';

const typedLegacyWorkouts = legacyWorkouts as unknown as WorkoutDataMap;

/**
 * Edge-compatible version that only uses legacy workouts
 * Individual workout files are not supported in Edge runtime
 */
export async function getAllWorkoutsEdge(): Promise<WorkoutDataMap> {
  return typedLegacyWorkouts;
}