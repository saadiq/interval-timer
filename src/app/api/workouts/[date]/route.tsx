// src/app/api/workouts/[date]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import workoutsData from '@/data/workouts.json';
import { WorkoutDataMap } from '@/workouts/types';

// Type assertion to treat the imported JSON as WorkoutDataMap type
const workouts = workoutsData as unknown as WorkoutDataMap;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  // Await the params object before accessing its properties
  const { date } = await params;

  if (date in workouts) {
    return NextResponse.json(workouts[date]);
  } else {
    return NextResponse.json(
      { message: 'Workout not found for the given date' },
      { status: 404 }
    );
  }
}