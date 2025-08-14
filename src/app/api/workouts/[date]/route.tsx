// src/app/api/workouts/[date]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { loadWorkout, getAllWorkoutDates } from "@/utils/workoutLoader";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  // Await the params object before accessing its properties
  const { date } = await params;

  // Try to load the exact workout for the requested date
  const workout = await loadWorkout(date);
  
  if (workout) {
    // Return the exact workout for the requested date
    return NextResponse.json(workout);
  } else {
    // If no exact match, find the most recent workout before the requested date
    const allDates = await getAllWorkoutDates();
    const workoutDates = allDates.sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const mostRecentDate = workoutDates.find((d) => d <= date);

    if (mostRecentDate) {
      const recentWorkout = await loadWorkout(mostRecentDate);
      if (recentWorkout) {
        // Return the most recent workout with a note that it's not the exact date
        return NextResponse.json({
          ...recentWorkout,
          _note: `No workout found for ${date}. Showing workout for ${mostRecentDate} instead.`,
          _actualDate: mostRecentDate,
        });
      }
    }
    
    // No workout found before the requested date
    return NextResponse.json(
      { message: "No workout found for the given date or any previous date" },
      { status: 404 }
    );
  }
}
