// src/app/api/og/route.tsx
import { ImageResponse } from "@vercel/og";
import { NextRequest, NextResponse } from "next/server";
import workoutsData from "@/data/workouts.json";
import {
  WorkoutDataMap,
  WorkoutData,
  CircuitWorkout,
  AMRAPWorkout,
  TabataWorkout,
  EMOMWorkout,
} from "@/workouts/types";
import { WorkoutFactory } from "@/workouts/WorkoutFactory";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const runtime = "edge";

// Set cache revalidation time (in seconds)
export const revalidate = 3600; // Cache for 1 hour

const typedWorkoutsData = workoutsData as WorkoutDataMap;

const getLocalDate = (): string => {
  const now = new Date();
  const timezone = "America/New_York";
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, "yyyy-MM-dd");
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || getLocalDate();

  console.log("search param:", searchParams.get("date"));
  console.log("date:", date);

  const workoutDates = Object.keys(typedWorkoutsData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  const workoutDate = workoutDates.find((d) => d <= date) || date;

  // If a specific date was requested, we can cache longer
  const cacheMaxAge = searchParams.get("date") ? 86400 : 3600; // 24 hours for specific dates, 1 hour for current date

  try {
    const workoutData = typedWorkoutsData[workoutDate];
    if (!workoutData) {
      console.log("No workout found for date:", workoutDate);
      console.log("Available dates:", workoutDates);

      // Return a basic image with cache headers for not found
      const notFoundResponse = new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              fontSize: 60,
              color: "black",
              background: "white",
              width: "100%",
              height: "100%",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No workout found
          </div>
        ),
        { width: 1200, height: 630 }
      );

      // Add cache headers to the not found response
      const headers = new Headers(notFoundResponse.headers);
      headers.set(
        "Cache-Control",
        `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}, stale-while-revalidate=60`
      );

      return new Response(notFoundResponse.body, {
        status: notFoundResponse.status,
        headers,
      });
    }

    console.log("workout date:", workoutDate);
    console.log("workout data:", workoutData);

    const workout = WorkoutFactory.createWorkout(workoutData, workoutDate);

    const warmUpTime = workoutData.warmUp.reduce(
      (total: number, exercise: { duration: number }) =>
        total + exercise.duration,
      0
    );
    let mainWorkoutTime = 0;
    const coolDownTime = workoutData.coolDown.reduce(
      (total: number, exercise: { duration: number }) =>
        total + exercise.duration,
      0
    );

    switch (workoutData.type) {
      case "circuit":
        mainWorkoutTime =
          (workoutData as CircuitWorkout).workout.exercises.reduce(
            (total, exercise) => total + (exercise.duration || 0),
            0
          ) * (workoutData as CircuitWorkout).workout.rounds;
        break;
      case "amrap":
        mainWorkoutTime = (workoutData as AMRAPWorkout).workout.duration;
        break;
      case "tabata":
        mainWorkoutTime =
          ((workoutData as TabataWorkout).workout.workDuration +
            (workoutData as TabataWorkout).workout.restDuration) *
          (workoutData as TabataWorkout).workout.rounds *
          (workoutData as TabataWorkout).workout.exercises.length;
        break;
      case "emom":
        mainWorkoutTime =
          (workoutData as EMOMWorkout).workout.rounds *
          (workoutData as EMOMWorkout).workout.exercises.length *
          60; // 60 seconds per minute
        break;
    }

    const totalTime = warmUpTime + mainWorkoutTime + coolDownTime;

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    };

    const renderExercises = (
      exercises: any[],
      format: (exercise: any) => string
    ) =>
      exercises.map((exercise, index) => (
        <div
          key={index}
          style={{
            fontSize: 18,
            marginBottom: "5px",
            color: "rgb(31, 41, 55)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "10px", color: "rgb(59, 130, 246)" }}>
            •
          </span>
          {format(exercise)}
        </div>
      ));

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            height: "100%",
            backgroundColor: "rgb(255, 255, 255)",
            color: "rgb(0, 0, 0)",
            fontFamily: "Inter, sans-serif",
            padding: "40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: "bold",
              marginBottom: "20px",
              textAlign: "center",
              color: "rgb(74, 144, 226)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Bicep icon */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "10px" }}
            >
              <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
              <path d="M15 14a5 5 0 0 0-7.584 2" />
              <path d="M9.964 6.825C8.019 7.977 9.5 13 8 15" />
            </svg>
            Workout for {workout.date}
          </span>
          <span
            style={{
              fontSize: 36,
              marginBottom: "20px",
              textAlign: "center",
              color: "rgb(107, 114, 128)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Timer icon */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "10px" }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Total Time: {formatTime(totalTime)}
          </span>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            {workoutData.type === "circuit" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    marginTop: "10px",
                    marginBottom: "10px",
                    color: "rgb(59, 130, 246)",
                  }}
                >
                  Circuit
                  {(workoutData as CircuitWorkout).workout.rounds > 1
                    ? ` (${(workoutData as CircuitWorkout).workout.rounds}x)`
                    : ""}
                  :
                </span>
                {renderExercises(
                  (workoutData as CircuitWorkout).workout.exercises,
                  (exercise) =>
                    `${exercise.name} (${formatTime(exercise.duration || 0)})`
                )}
              </div>
            )}
            {workoutData.type === "amrap" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    marginTop: "10px",
                    marginBottom: "10px",
                    color: "rgb(59, 130, 246)",
                  }}
                >
                  AMRAP (
                  {formatTime((workoutData as AMRAPWorkout).workout.duration)}
                  ):
                </span>
                {renderExercises(
                  (workoutData as AMRAPWorkout).workout.exercises,
                  (exercise) => `${exercise.name} (${exercise.reps} reps)`
                )}
              </div>
            )}
            {workoutData.type === "tabata" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    marginTop: "10px",
                    marginBottom: "10px",
                    color: "rgb(59, 130, 246)",
                  }}
                >
                  Tabata
                  {(workoutData as TabataWorkout).workout.rounds > 1
                    ? ` (${
                        (workoutData as TabataWorkout).workout.rounds
                      } rounds)`
                    : ""}
                  :
                </span>
                <span
                  style={{
                    fontSize: 18,
                    marginBottom: "10px",
                    color: "rgb(31, 41, 55)",
                  }}
                >
                  Work:{" "}
                  {formatTime(
                    (workoutData as TabataWorkout).workout.workDuration
                  )}{" "}
                  / Rest:{" "}
                  {formatTime(
                    (workoutData as TabataWorkout).workout.restDuration
                  )}
                </span>
                {renderExercises(
                  (workoutData as TabataWorkout).workout.exercises,
                  (exercise) => exercise.name
                )}
              </div>
            )}
            {workoutData.type === "emom" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    marginTop: "10px",
                    marginBottom: "10px",
                    color: "rgb(59, 130, 246)",
                  }}
                >
                  EMOM
                  {(workoutData as EMOMWorkout).workout.rounds > 1
                    ? ` (${(workoutData as EMOMWorkout).workout.rounds} rounds)`
                    : ""}
                  :
                </span>
                {renderExercises(
                  (workoutData as EMOMWorkout).workout.exercises,
                  (exercise) => exercise.name
                )}
              </div>
            )}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Add cache headers to the response
    const headers = new Headers(imageResponse.headers);
    headers.set(
      "Cache-Control",
      `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}, stale-while-revalidate=60`
    );

    return new Response(imageResponse.body, {
      status: imageResponse.status,
      headers,
    });
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Return a fallback image with cache headers
    const fallbackResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "black",
            background: "white",
            width: "100%",
            height: "100%",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Interval Timer
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Add cache headers to the fallback response
    const headers = new Headers(fallbackResponse.headers);
    headers.set(
      "Cache-Control",
      `public, max-age=300, s-maxage=300, stale-while-revalidate=60`
    ); // Shorter cache for errors

    return new Response(fallbackResponse.body, {
      status: fallbackResponse.status,
      headers,
    });
  }
}
