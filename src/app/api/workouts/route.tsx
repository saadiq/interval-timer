import { NextResponse } from 'next/server';
import { getAllWorkouts } from '@/utils/workoutLoader';
import { CircuitWorkout, AMRAPWorkout, TabataWorkout, EMOMWorkout } from '@/workouts/types';

export async function GET() {
  // Get all available workouts
  const workouts = await getAllWorkouts();

  // Get all available workout dates
  const dates = Object.keys(workouts);

  // Sort dates in ascending order
  dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Create a map with workout details for each date
  const workoutDetails = dates.reduce(
    (acc, date) => {
      const workout = workouts[date];

      if (!workout) {
        return acc;
      }

      // Calculate total duration
      let totalDuration = 0;

      // Add warm-up duration
      workout.warmUp.forEach((section) => {
        totalDuration += section.duration;
      });

      // Add workout duration based on type
      if (workout.type === 'circuit') {
        const circuitWorkout = workout as CircuitWorkout;
        let roundDuration = 0;
        circuitWorkout.workout.exercises.forEach((exercise) => {
          roundDuration += exercise.duration || 0;
        });
        totalDuration += roundDuration * circuitWorkout.workout.rounds;
      } else if (workout.type === 'amrap') {
        const amrapWorkout = workout as AMRAPWorkout;
        totalDuration += amrapWorkout.workout.duration;
      } else if (workout.type === 'tabata') {
        const tabataWorkout = workout as TabataWorkout;
        totalDuration +=
          (tabataWorkout.workout.workDuration + tabataWorkout.workout.restDuration) *
          tabataWorkout.workout.rounds *
          tabataWorkout.workout.exercises.length;
      } else if (workout.type === 'emom') {
        const emomWorkout = workout as EMOMWorkout;
        // EMOM is typically 1 minute per exercise
        totalDuration += 60 * emomWorkout.workout.exercises.length * emomWorkout.workout.rounds;
      }

      // Add cool-down duration
      workout.coolDown.forEach((section) => {
        totalDuration += section.duration;
      });

      // Get all exercises
      let exercises: string[] = [];
      if (
        workout.type === 'circuit' ||
        workout.type === 'amrap' ||
        workout.type === 'tabata' ||
        workout.type === 'emom'
      ) {
        const workoutExercises =
          workout.type === 'circuit'
            ? (workout as CircuitWorkout).workout.exercises
            : workout.type === 'amrap'
              ? (workout as AMRAPWorkout).workout.exercises
              : workout.type === 'tabata'
                ? (workout as TabataWorkout).workout.exercises
                : (workout as EMOMWorkout).workout.exercises;

        // For EMOM workouts, extract the exercise name without the rep count
        if (workout.type === 'emom') {
          exercises = workoutExercises.map((ex) => {
            const name = ex.name;
            // Extract the exercise name without the rep count (e.g., "10 Kettlebell Swings" -> "Kettlebell Swings")
            const match = name.match(/^\d+\s+(.+)$/);
            return match?.[1] ?? name;
          });
        } else {
          exercises = workoutExercises.map((ex) => ex.name);
        }
      }

      acc[date] = {
        type: workout.type.toUpperCase(),
        totalDuration,
        exerciseCount:
          workout.type === 'circuit'
            ? (workout as CircuitWorkout).workout.exercises.length
            : workout.type === 'amrap'
              ? (workout as AMRAPWorkout).workout.exercises.length
              : workout.type === 'tabata'
                ? (workout as TabataWorkout).workout.exercises.length
                : (workout as EMOMWorkout).workout.exercises.length,
        primaryExercises: exercises,
      };

      return acc;
    },
    {} as Record<
      string,
      {
        type: string;
        totalDuration: number;
        exerciseCount: number;
        primaryExercises: string[];
      }
    >
  );

  return NextResponse.json({
    dates,
    count: dates.length,
    workoutDetails,
  });
}
