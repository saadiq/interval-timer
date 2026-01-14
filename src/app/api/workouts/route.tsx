import { NextResponse } from 'next/server';
import { getAllWorkouts } from '@/utils/workoutLoader';
import { WorkoutData, BaseExercise } from '@/workouts/types';

function getWorkoutExercises(workout: WorkoutData): BaseExercise[] {
  return workout.workout.exercises;
}

function calculateMainWorkoutDuration(workout: WorkoutData): number {
  switch (workout.type) {
    case 'circuit': {
      const roundDuration = workout.workout.exercises.reduce(
        (total, ex) => total + (ex.duration ?? 0),
        0
      );
      return roundDuration * workout.workout.rounds;
    }
    case 'amrap':
      return workout.workout.duration;
    case 'tabata': {
      const { workDuration, restDuration, rounds, exercises } = workout.workout;
      return (workDuration + restDuration) * rounds * exercises.length;
    }
    case 'emom':
      return 60 * workout.workout.exercises.length * workout.workout.rounds;
  }
}

export async function GET() {
  // Get all available workouts
  const workouts = await getAllWorkouts();

  // Get all available workout dates
  const dates = Object.keys(workouts);

  // Sort dates in descending order (newest first)
  dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Create a map with workout details for each date
  const workoutDetails = dates.reduce(
    (acc, date) => {
      const workout = workouts[date];
      if (!workout) return acc;

      // Calculate total duration: warm-up + main workout + cool-down
      const warmUpDuration = workout.warmUp.reduce((sum, s) => sum + s.duration, 0);
      const coolDownDuration = workout.coolDown.reduce((sum, s) => sum + s.duration, 0);
      const totalDuration =
        warmUpDuration + calculateMainWorkoutDuration(workout) + coolDownDuration;

      // Get exercise names (EMOM exercises may have rep counts prefixed)
      const workoutExercises = getWorkoutExercises(workout);
      const exercises = workoutExercises.map((ex) => {
        if (workout.type === 'emom') {
          const match = ex.name.match(/^\d+\s+(.+)$/);
          return match?.[1] ?? ex.name;
        }
        return ex.name;
      });

      acc[date] = {
        type: workout.type.toUpperCase(),
        totalDuration,
        exerciseCount: workoutExercises.length,
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
