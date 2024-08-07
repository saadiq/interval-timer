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
          background: 'rgb(0, 0, 0)',
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
        backgroundColor: 'rgb(255, 255, 255)',
        color: 'rgb(0, 0, 0)',
        fontFamily: 'Inter, sans-serif',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 48, fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: 'rgb(74, 144, 226)', display: 'flex', alignItems: 'center' }}>
          {/* Bicep icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1"/>
            <path d="M15 14a5 5 0 0 0-7.584 2"/>
            <path d="M9.964 6.825C8.019 7.977 9.5 13 8 15"/>
          </svg>
          Workout for {workoutDate}
        </span>
        <span style={{ fontSize: 36, marginBottom: '20px', textAlign: 'center', color: 'rgb(107, 114, 128)', display: 'flex', alignItems: 'center' }}>
          {/* Timer icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Total Time: {formatTime(totalTime)}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px' }}>

          <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', textAlign: 'center', color: 'rgb(59, 130, 246)' }}>
            Circuit ({workout.circuit.repetitions}x):
          </span>
          {workout.circuit.exercises.map((exercise, index) => (
            <span key={index} style={{ fontSize: 18, marginBottom: '5px', textAlign: 'center', color: 'rgb(31, 41, 55)' }}>
              {exercise.name} ({formatTime(exercise.duration)})
            </span>
          ))}

        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}