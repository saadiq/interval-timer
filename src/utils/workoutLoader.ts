import { WorkoutData, WorkoutDataMap } from '@/workouts/types';
import fs from 'fs';
import path from 'path';

// Import legacy workouts
import legacyWorkouts from '@/data/workouts.json';

const typedLegacyWorkouts = legacyWorkouts as unknown as WorkoutDataMap;

/**
 * Load a workout for a specific date
 * First checks for individual file, then falls back to legacy workouts.json
 */
export async function loadWorkout(date: string): Promise<WorkoutData | null> {
  // Parse date to get year, month, day
  const [year, month, day] = date.split('-');
  
  // Check for individual workout file
  const workoutPath = path.join(
    process.cwd(),
    'src',
    'data',
    'workouts',
    year,
    month,
    `${day}.json`
  );
  
  try {
    if (fs.existsSync(workoutPath)) {
      const fileContent = fs.readFileSync(workoutPath, 'utf-8');
      return JSON.parse(fileContent) as WorkoutData;
    }
  } catch (error) {
    console.error(`Error loading workout file for ${date}:`, error);
  }
  
  // Fall back to legacy workouts
  if (date in typedLegacyWorkouts) {
    return typedLegacyWorkouts[date];
  }
  
  return null;
}

/**
 * Get all available workout dates
 * Combines individual files and legacy workouts
 */
export async function getAllWorkoutDates(): Promise<string[]> {
  const allDates = new Set<string>();
  
  // Add legacy workout dates
  Object.keys(typedLegacyWorkouts).forEach(date => allDates.add(date));
  
  // Scan for individual workout files
  const workoutsDir = path.join(process.cwd(), 'src', 'data', 'workouts');
  
  try {
    // Check if workouts directory exists
    if (fs.existsSync(workoutsDir)) {
      // Scan year directories
      const years = fs.readdirSync(workoutsDir).filter(item => {
        const itemPath = path.join(workoutsDir, item);
        return fs.statSync(itemPath).isDirectory() && /^\d{4}$/.test(item);
      });
      
      for (const year of years) {
        const yearPath = path.join(workoutsDir, year);
        
        // Scan month directories
        const months = fs.readdirSync(yearPath).filter(item => {
          const itemPath = path.join(yearPath, item);
          return fs.statSync(itemPath).isDirectory() && /^\d{2}$/.test(item);
        });
        
        for (const month of months) {
          const monthPath = path.join(yearPath, month);
          
          // Scan day files
          const days = fs.readdirSync(monthPath).filter(item => {
            return item.endsWith('.json') && /^\d{2}\.json$/.test(item);
          });
          
          for (const dayFile of days) {
            const day = dayFile.replace('.json', '');
            const date = `${year}-${month}-${day}`;
            allDates.add(date);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error scanning workout directories:', error);
  }
  
  return Array.from(allDates).sort();
}

/**
 * Get all workouts with their data
 * Combines individual files and legacy workouts
 */
export async function getAllWorkouts(): Promise<WorkoutDataMap> {
  const allWorkouts: WorkoutDataMap = {};
  
  // Add legacy workouts
  Object.assign(allWorkouts, typedLegacyWorkouts);
  
  // Load individual workout files
  const dates = await getAllWorkoutDates();
  
  for (const date of dates) {
    if (!(date in allWorkouts)) {
      const workout = await loadWorkout(date);
      if (workout) {
        allWorkouts[date] = workout;
      }
    }
  }
  
  return allWorkouts;
}