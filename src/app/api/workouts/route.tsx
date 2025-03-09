import { NextResponse } from 'next/server';
import workoutsData from '@/data/workouts.json';
import { WorkoutDataMap, WorkoutData } from '@/workouts/types';

// Type assertion to treat the imported JSON as WorkoutDataMap type
const workouts = workoutsData as unknown as WorkoutDataMap;

export async function GET() {
  // Get all available workout dates
  const dates = Object.keys(workouts);
  
  // Sort dates in ascending order
  dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // Create a map with workout details for each date
  const workoutDetails = dates.reduce((acc, date) => {
    const workout = workouts[date];
    
    // Calculate total duration
    let totalDuration = 0;
    
    // Add warm-up duration
    workout.warmUp.forEach(section => {
      totalDuration += section.duration;
    });
    
    // Add workout duration based on type
    if (workout.type === 'circuit') {
      const circuitWorkout = workout as any;
      let roundDuration = 0;
      circuitWorkout.workout.exercises.forEach((exercise: any) => {
        roundDuration += exercise.duration || 0;
      });
      totalDuration += roundDuration * circuitWorkout.workout.rounds;
    } else if (workout.type === 'amrap') {
      const amrapWorkout = workout as any;
      totalDuration += amrapWorkout.workout.duration;
    } else if (workout.type === 'tabata') {
      const tabataWorkout = workout as any;
      totalDuration += (tabataWorkout.workout.workDuration + tabataWorkout.workout.restDuration) * 
                       tabataWorkout.workout.rounds * 
                       tabataWorkout.workout.exercises.length;
    } else if (workout.type === 'emom') {
      const emomWorkout = workout as any;
      // EMOM is typically 1 minute per exercise
      totalDuration += 60 * emomWorkout.workout.exercises.length * emomWorkout.workout.rounds;
    }
    
    // Add cool-down duration
    workout.coolDown.forEach(section => {
      totalDuration += section.duration;
    });
    
    // Get all exercises
    let exercises: string[] = [];
    if (workout.type === 'circuit' || workout.type === 'amrap' || workout.type === 'tabata' || workout.type === 'emom') {
      const workoutExercises = (workout as any).workout.exercises;
      
      // For EMOM workouts, extract the exercise name without the rep count
      if (workout.type === 'emom') {
        exercises = workoutExercises.map((ex: any) => {
          const name = ex.name;
          // Extract the exercise name without the rep count (e.g., "10 Kettlebell Swings" -> "Kettlebell Swings")
          const match = name.match(/^\d+\s+(.+)$/);
          return match ? match[1] : name;
        });
      } else {
        exercises = workoutExercises.map((ex: any) => ex.name);
      }
    }
    
    acc[date] = {
      type: workout.type.toUpperCase(),
      totalDuration,
      exerciseCount: (workout as any).workout.exercises.length,
      primaryExercises: exercises,
    };
    
    return acc;
  }, {} as Record<string, {
    type: string;
    totalDuration: number;
    exerciseCount: number;
    primaryExercises: string[];
  }>);
  
  return NextResponse.json({ 
    dates,
    count: dates.length,
    workoutDetails
  });
} 