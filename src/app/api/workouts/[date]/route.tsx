// src/app/api/workouts/[date]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import workoutsData from "@/data/workouts.json";
import { WorkoutDataMap } from "@/workouts/types";

// Type assertion to treat the imported JSON as WorkoutDataMap type
const workouts = workoutsData as unknown as WorkoutDataMap;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  // Await the params object before accessing its properties
  const { date } = await params;

  // Check if there's an exact match for the requested date
  if (date in workouts) {
    // Return the exact workout for the requested date
    return NextResponse.json(workouts[date]);
  } else {
    // If no exact match, find the most recent workout before the requested date
    const workoutDates = Object.keys(workouts).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const mostRecentDate = workoutDates.find((d) => d <= date);

    if (mostRecentDate) {
      // Return the most recent workout with a note that it's not the exact date
      return NextResponse.json({
        ...workouts[mostRecentDate],
        _note: `No workout found for ${date}. Showing workout for ${mostRecentDate} instead.`,
        _actualDate: mostRecentDate,
      });
    } else {
      // No workout found before the requested date
      return NextResponse.json(
        { message: "No workout found for the given date or any previous date" },
        { status: 404 }
      );
    }
  }
}
