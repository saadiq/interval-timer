// src/app/api/og/route.tsx
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import workoutsData from '@/data/workouts.json';
import { WorkoutDataMap, WorkoutData, CircuitWorkout, AMRAPWorkout, TabataWorkout, EMOMWorkout } from '@/workouts/types';
import { WorkoutFactory } from '@/workouts/WorkoutFactory';

export const runtime = 'edge';

const typedWorkoutsData = workoutsData as WorkoutDataMap;

const getLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || getLocalDate();

  console.log("search param:", searchParams.get('date'));
  console.log("date:", date);

  const workoutDates = Object.keys(typedWorkoutsData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const workoutDate = workoutDates.find(d => d <= date) || date;
  const workoutData = typedWorkoutsData[workoutDate];

  console.log("workout date:", workoutDate);
  console.log("workout data:", workoutData);

  if (!workoutData) {
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

  const workout = WorkoutFactory.createWorkout(workoutData, workoutDate);

  const warmUpTime = workout.data.warmUp.reduce((total, exercise) => total + exercise.duration, 0);
  let mainWorkoutTime = 0;
  const coolDownTime = workout.data.coolDown.reduce((total, exercise) => total + exercise.duration, 0);

  switch (workout.data.type) {
    case 'circuit':
      mainWorkoutTime = (workout.data as CircuitWorkout).workout.exercises.reduce((total, exercise) => total + (exercise.duration || 0), 0) * (workout.data as CircuitWorkout).workout.rounds;
      break;
    case 'amrap':
      mainWorkoutTime = (workout.data as AMRAPWorkout).workout.duration;
      break;
    case 'tabata':
      mainWorkoutTime = ((workout.data as TabataWorkout).workout.workDuration + (workout.data as TabataWorkout).workout.restDuration) * (workout.data as TabataWorkout).workout.rounds * (workout.data as TabataWorkout).workout.exercises.length;
      break;
    case 'emom':
      mainWorkoutTime = (workout.data as EMOMWorkout).workout.rounds * (workout.data as EMOMWorkout).workout.exercises.length * 60; // 60 seconds per minute
      break;
  }

  const totalTime = warmUpTime + mainWorkoutTime + coolDownTime;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderExercises = (exercises: any[], format: (exercise: any) => string) => (
    exercises.map((exercise, index) => (
      <div key={index} style={{ fontSize: 18, marginBottom: '5px', color: 'rgb(31, 41, 55)', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px', color: 'rgb(59, 130, 246)' }}>•</span>
        {format(exercise)}
      </div>
    ))
  );

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
            <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
            <path d="M15 14a5 5 0 0 0-7.584 2" />
            <path d="M9.964 6.825C8.019 7.977 9.5 13 8 15" />
          </svg>
          Workout for {workout.date}
        </span>
        <span style={{ fontSize: 36, marginBottom: '20px', textAlign: 'center', color: 'rgb(107, 114, 128)', display: 'flex', alignItems: 'center' }}>
          {/* Timer icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Total Time: {formatTime(totalTime)}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px' }}>
          {workout.data.type === 'circuit' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', color: 'rgb(59, 130, 246)' }}>
                Circuit{(workout.data as CircuitWorkout).workout.rounds > 1 ? ` (${(workout.data as CircuitWorkout).workout.rounds}x)` : ''}:
              </span>
              {renderExercises((workout.data as CircuitWorkout).workout.exercises, exercise => `${exercise.name} (${formatTime(exercise.duration || 0)})`)}
            </div>
          )}
          {workout.data.type === 'amrap' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', color: 'rgb(59, 130, 246)' }}>
                AMRAP ({formatTime((workout.data as AMRAPWorkout).workout.duration)}):
              </span>
              {renderExercises((workout.data as AMRAPWorkout).workout.exercises, exercise => `${exercise.name} (${exercise.reps} reps)`)}
            </div>
          )}
          {workout.data.type === 'tabata' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', color: 'rgb(59, 130, 246)' }}>
                Tabata{(workout.data as TabataWorkout).workout.rounds > 1 ? ` (${(workout.data as TabataWorkout).workout.rounds} rounds)` : ''}:
              </span>
              <span style={{ fontSize: 18, marginBottom: '10px', color: 'rgb(31, 41, 55)' }}>
                Work: {formatTime((workout.data as TabataWorkout).workout.workDuration)} / Rest: {formatTime((workout.data as TabataWorkout).workout.restDuration)}
              </span>
              {renderExercises((workout.data as TabataWorkout).workout.exercises, exercise => exercise.name)}
            </div>
          )}
          {workout.data.type === 'emom' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 24, marginTop: '10px', marginBottom: '10px', color: 'rgb(59, 130, 246)' }}>
                EMOM{(workout.data as EMOMWorkout).workout.rounds > 1 ? ` (${(workout.data as EMOMWorkout).workout.rounds} rounds)` : ''}:
              </span>
              {renderExercises((workout.data as EMOMWorkout).workout.exercises, exercise => exercise.name)}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}