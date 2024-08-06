import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import workoutsData from '@/app/workouts.json';

export const runtime = 'edge';

interface Exercise {
  name: string;
  duration: number;
}

interface WorkoutData {
  warmUp: Exercise[];
  circuit: {
    repetitions: number;
    exercises: Exercise[];
  };
  coolDown: Exercise[];
}

interface WorkoutsData {
  [date: string]: WorkoutData;
}

const typedWorkoutsData = workoutsData as WorkoutsData;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const workoutDates = Object.keys(typedWorkoutsData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const workoutDate = workoutDates.find(d => d <= date);
  const workout = workoutDate ? typedWorkoutsData[workoutDate] : null;

  if (!workout) {
    return new ImageResponse(
      (
        <div style={{
          display: 'flex',
          fontSize: 60,
          color: 'white',
          background: 'black',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          No workout found for {date}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const warmUpTime = workout.warmUp.reduce((total, exercise) => total + exercise.duration, 0);
  const circuitTime = workout.circuit.exercises.reduce((total, exercise) => total + exercise.duration, 0) * workout.circuit.repetitions;
  const coolDownTime = workout.coolDown.reduce((total, exercise) => total + exercise.duration, 0);
  const totalTime = warmUpTime + circuitTime + coolDownTime;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        backgroundColor: '#4a90e2',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '20px',
      }}>
        <span style={{ fontSize: 48, marginBottom: '10px', textAlign: 'center' }}>
          Workout for {workoutDate}
        </span>
        <span style={{ fontSize: 36, marginBottom: '20px', textAlign: 'center' }}>
          Total Time: {formatTime(totalTime)}
        </span>
        
        <span style={{ fontSize: 24, marginBottom: '10px', textAlign: 'center' }}>
          Warm-up: {formatTime(warmUpTime)}
        </span>

        <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
          Circuit ({workout.circuit.repetitions}x):
        </span>
        {workout.circuit.exercises.map((exercise, index) => (
          <span key={index} style={{ fontSize: 18, marginBottom: '5px', textAlign: 'center' }}>
            {exercise.name} ({formatTime(exercise.duration)})
          </span>
        ))}

        <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
          Cool-down: {formatTime(coolDownTime)}
        </span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}