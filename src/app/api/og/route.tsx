// src/app/api/og/route.tsx
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import workoutsData from "@/data/workouts.json";
import {
  WorkoutDataMap,
  CircuitWorkout,
  AMRAPWorkout,
  TabataWorkout,
  EMOMWorkout,
} from "@/workouts/types";
import { WorkoutFactory } from "@/workouts/WorkoutFactory";
import { format } from "date-fns";
import {
  getLocalDate,
  formatDateWithTimezone,
  parseDate,
} from "@/utils/timezone";

export const runtime = "edge";

// Set cache revalidation time (in seconds)
export const revalidate = 3600; // Cache for 1 hour

const typedWorkoutsData = workoutsData as WorkoutDataMap;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isDateExplicitlyProvided = searchParams.has("date");
  const date = searchParams.get("date") || getLocalDate();


  // Get all available workout dates
  const workoutDates = Object.keys(typedWorkoutsData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // If a date is explicitly provided, check if it exists in our workouts
  // If not, we'll show a "not found" message
  // If no date is provided (using current date), find the most recent workout
  let workoutDate;
  if (isDateExplicitlyProvided) {
    // For explicitly provided dates, only use that exact date
    workoutDate = date in typedWorkoutsData ? date : null;
  } else {
    // For current date (not explicitly provided), find the most recent workout
    workoutDate = workoutDates.find((d) => d <= date) || null;
  }

  // If a specific date was requested, we can cache longer
  const cacheMaxAge = isDateExplicitlyProvided ? 86400 : 3600; // 24 hours for specific dates, 1 hour for current date

  try {
    // If no workout is found for the requested date
    if (!workoutDate) {

      // Return a basic image with cache headers for not found
      const notFoundResponse = new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 60,
              color: "black",
              background: "white",
              width: "100%",
              height: "100%",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div style={{ display: "flex", fontWeight: "bold" }}>
              No Workout Found
            </div>
            <div
              style={{ display: "flex", fontSize: "24px", marginTop: "10px" }}
            >
              {isDateExplicitlyProvided
                ? `No workout for ${format(parseDate(date), "MMMM d, yyyy")}`
                : "Try another date"}
            </div>
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

    const workoutData = typedWorkoutsData[workoutDate];

    WorkoutFactory.createWorkout(workoutData, workoutDate);

    // Calculate total time
    const warmUpTime = workoutData.warmUp.reduce(
      (total: number, exercise: { duration: number }) =>
        total + exercise.duration,
      0
    );

    let mainWorkoutTime = 0;

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

    const coolDownTime = workoutData.coolDown.reduce(
      (total: number, exercise: { duration: number }) =>
        total + exercise.duration,
      0
    );

    const totalTime = warmUpTime + mainWorkoutTime + coolDownTime;

    // Format time helper
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    };

    // Format the date for display in OG image
    // Only show timezone if the date was not explicitly provided
    let formattedDate;
    if (isDateExplicitlyProvided) {
      // For explicitly provided dates, use simple formatting without timezone
      formattedDate = format(parseDate(workoutDate), "MMMM d, yyyy");
    } else {
      // For derived dates (current date), show the timezone
      formattedDate = formatDateWithTimezone(workoutDate, "MMMM d, yyyy", true);
    }

    // Get workout type color
    const getWorkoutTypeColor = (type: string) => {
      switch (type) {
        case "circuit":
          return "rgb(59, 130, 246)"; // Blue
        case "amrap":
          return "rgb(16, 185, 129)"; // Green
        case "tabata":
          return "rgb(239, 68, 68)"; // Red
        case "emom":
          return "rgb(139, 92, 246)"; // Purple
        default:
          return "rgb(107, 114, 128)"; // Gray
      }
    };

    // Get exercise count
    const getExerciseCount = () => {
      switch (workoutData.type) {
        case "circuit":
          return (workoutData as CircuitWorkout).workout.exercises.filter(
            (ex) => ex.name !== "Rest"
          ).length;
        case "amrap":
          return (workoutData as AMRAPWorkout).workout.exercises.length;
        case "tabata":
          return (workoutData as TabataWorkout).workout.exercises.length;
        case "emom":
          return (workoutData as EMOMWorkout).workout.exercises.length;
        default:
          return 0;
      }
    };

    // Get rounds info
    const getRoundsInfo = () => {
      switch (workoutData.type) {
        case "circuit":
          return (workoutData as CircuitWorkout).workout.rounds > 1
            ? `${(workoutData as CircuitWorkout).workout.rounds} Rounds`
            : "1 Round";
        case "tabata":
          return (workoutData as TabataWorkout).workout.rounds > 1
            ? `${(workoutData as TabataWorkout).workout.rounds} Rounds`
            : "1 Round";
        case "emom":
          return (workoutData as EMOMWorkout).workout.rounds > 1
            ? `${(workoutData as EMOMWorkout).workout.rounds} Minutes`
            : "1 Minute";
        case "amrap":
          return `${formatTime(
            (workoutData as AMRAPWorkout).workout.duration
          )}`;
        default:
          return "";
      }
    };

    // Get exercise list
    const getExerciseDetails = () => {
      let exercises = [];

      switch (workoutData.type) {
        case "circuit":
          exercises = (workoutData as CircuitWorkout).workout.exercises
            .filter((ex) => ex.name !== "Rest")
            .map((ex, i) => ({
              name: ex.name,
              detail: `${ex.duration}s`,
              index: i + 1,
            }));
          break;
        case "amrap":
          exercises = (workoutData as AMRAPWorkout).workout.exercises.map(
            (ex, i) => ({
              name: ex.name,
              detail: `${ex.reps} reps`,
              index: i + 1,
            })
          );
          break;
        case "tabata":
          exercises = (workoutData as TabataWorkout).workout.exercises.map(
            (ex, i) => ({
              name: ex.name,
              detail: `${
                (workoutData as TabataWorkout).workout.workDuration
              }s work / ${
                (workoutData as TabataWorkout).workout.restDuration
              }s rest`,
              index: i + 1,
            })
          );
          break;
        case "emom":
          exercises = (workoutData as EMOMWorkout).workout.exercises.map(
            (ex, i) => ({
              name: ex.name,
              detail: "Every minute",
              index: i + 1,
            })
          );
          break;
      }

      return exercises;
    };

    const exercises = getExerciseDetails();
    const maxExercisesToShow = 6; // Increased from 5 to 6 exercises

    // Create a super simple OG image
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            padding: "30px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* App title */}
          <div
            style={{
              display: "flex",
              fontSize: "20px",
              color: "rgb(107, 114, 128)",
              marginBottom: "10px",
            }}
          >
            Interval Timer
          </div>

          {/* Workout title */}
          <div
            style={{
              display: "flex",
              fontSize: "42px",
              fontWeight: "bold",
              color: "rgb(17, 24, 39)",
              marginBottom: "10px",
            }}
          >
            Workout for {formattedDate}
          </div>

          {/* Workout type */}
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              fontWeight: "bold",
              color: getWorkoutTypeColor(workoutData.type),
              marginBottom: "15px",
            }}
          >
            {workoutData.type.toUpperCase()} • {getRoundsInfo()}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgb(249, 250, 251)",
                padding: "10px 20px",
                borderRadius: "8px",
                marginRight: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  color: "rgb(107, 114, 128)",
                }}
              >
                TOTAL TIME
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {formatTime(totalTime)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgb(249, 250, 251)",
                padding: "10px 20px",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  color: "rgb(107, 114, 128)",
                }}
              >
                EXERCISES
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {getExerciseCount()}
              </div>
            </div>
          </div>

          {/* Exercise list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "rgb(17, 24, 39)",
              }}
            >
              Exercises
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              {/* Exercise cards - 2 columns of 3 exercises each */}
              {exercises.slice(0, maxExercisesToShow).map((exercise, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "48%",
                    backgroundColor: "rgb(249, 250, 251)",
                    padding: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: getWorkoutTypeColor(workoutData.type),
                      color: "white",
                      marginRight: "12px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {exercise.index}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        display: "flex",
                        fontWeight: "600",
                        fontSize: "18px",
                      }}
                    >
                      {exercise.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: "14px",
                        color: "rgb(107, 114, 128)",
                      }}
                    >
                      {exercise.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* More exercises indicator */}
            {exercises.length > maxExercisesToShow && (
              <div
                style={{
                  display: "flex",
                  fontSize: "14px",
                  color: "rgb(107, 114, 128)",
                  marginTop: "12px",
                }}
              >
                +{exercises.length - maxExercisesToShow} more exercises
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              fontSize: "12px",
              color: "rgb(107, 114, 128)",
              marginTop: "auto",
            }}
          >
            Interval Timer • Get moving
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
    // Error generating OG image

    // Return a fallback image with cache headers
    const fallbackResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 60,
            color: "black",
            background: "white",
            width: "100%",
            height: "100%",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "rgb(107, 114, 128)",
              marginBottom: "10px",
            }}
          >
            Interval Timer
          </div>
          <div style={{ display: "flex", fontWeight: "bold" }}>
            Workout of the Day
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Add cache headers to the fallback response
    const headers = new Headers(fallbackResponse.headers);
    headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=60"
    ); // Shorter cache for errors

    return new Response(fallbackResponse.body, {
      status: fallbackResponse.status,
      headers,
    });
  }
}
