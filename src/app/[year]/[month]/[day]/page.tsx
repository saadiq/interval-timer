// src/app/[year]/[month]/[day]/page.tsx
import { Metadata } from 'next';
import { format } from 'date-fns';
import { parseDate } from '@/utils/timezone';
import { notFound } from 'next/navigation';
import { urlSegmentsToDate } from '@/utils/dateUrls';
import WorkoutPageWithDate from '@/app/WorkoutPageWithDate';

// Extended interface for the API response
interface WorkoutResponse {
  _note?: string;
  _actualDate?: string;
  type: string;
  warmUp: Array<{ name: string; duration: number; description?: string }>;
  workout: {
    exercises: Array<{ name: string; duration?: number; reps?: number; description?: string }>;
    rounds?: number;
    duration?: number;
    workDuration?: number;
    restDuration?: number;
  };
  coolDown: Array<{ name: string; duration: number; description?: string }>;
}

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
}


async function fetchWorkoutForMetadata(date: string): Promise<WorkoutResponse | null> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'production'
      ? 'https://interval-timer-rho.vercel.app'
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/workouts/${date}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching workout for metadata:', error);
    return null;
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function calculateWorkoutTime(workoutData: WorkoutResponse): number {
  // Calculate warm-up time
  const warmUpTime = workoutData.warmUp.reduce((total, exercise) => total + exercise.duration, 0);
  
  // Calculate cool-down time
  const coolDownTime = workoutData.coolDown.reduce((total, exercise) => total + exercise.duration, 0);
  
  // Calculate main workout time
  let mainWorkoutTime = 0;
  switch (workoutData.type) {
    case 'circuit':
      mainWorkoutTime = workoutData.workout.exercises.reduce((total, exercise) => total + (exercise.duration || 0), 0) * (workoutData.workout.rounds || 1);
      break;
    case 'amrap':
      mainWorkoutTime = workoutData.workout.duration || 0;
      break;
    case 'tabata':
      mainWorkoutTime = ((workoutData.workout.workDuration || 0) + (workoutData.workout.restDuration || 0)) * (workoutData.workout.rounds || 1) * workoutData.workout.exercises.length;
      break;
    case 'emom':
      mainWorkoutTime = (workoutData.workout.rounds || 1) * workoutData.workout.exercises.length * 60;
      break;
  }
  
  return warmUpTime + mainWorkoutTime + coolDownTime;
}

function getExerciseCount(workoutData: WorkoutResponse): number {
  switch (workoutData.type) {
    case 'circuit':
      return workoutData.workout.exercises.filter(ex => ex.name !== 'Rest').length;
    default:
      return workoutData.workout.exercises.length;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month, day } = await params;
  
  // Validate date format
  const formattedDate = urlSegmentsToDate(year, month, day);
  if (!formattedDate) {
    return {
      title: 'Invalid Date - Interval Timer',
      description: 'The requested date is not valid.',
    };
  }
  
  // Fetch workout data for metadata
  const workoutData = await fetchWorkoutForMetadata(formattedDate);
  
  if (!workoutData) {
    // No workout found
    const displayDate = format(parseDate(formattedDate), 'MMMM d, yyyy');
    
    return {
      title: `No Workout Found - ${displayDate} | Interval Timer`,
      description: `No workout available for ${displayDate}. Browse other available workouts in the Interval Timer app.`,
      openGraph: {
        title: `No Workout Found - ${displayDate}`,
        description: `No workout available for ${displayDate}`,
        images: [`/api/og?date=${formattedDate}`],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `No Workout Found - ${displayDate}`,
        description: `No workout available for ${displayDate}`,
        images: [`/api/og?date=${formattedDate}`],
      },
    };
  }
  
  // Format date for display
  const displayDate = format(parseDate(formattedDate), 'MMMM d, yyyy');
  
  // Calculate workout stats
  const totalTime = calculateWorkoutTime(workoutData);
  const exerciseCount = getExerciseCount(workoutData);
  const workoutType = workoutData.type.toUpperCase();
  
  // Generate title and description
  const title = `${workoutType} Workout - ${displayDate} | Interval Timer`;
  const description = `${workoutType} workout with ${exerciseCount} exercises, ${formatTime(totalTime)} total duration. Get moving with this ${workoutData.type} training session.`;
  
  // Generate OpenGraph image URL
  const ogImageUrl = `/api/og?date=${formattedDate}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function DateWorkoutPage({ params }: PageProps) {
  const { year, month, day } = await params;
  
  // Validate date format
  const formattedDate = urlSegmentsToDate(year, month, day);
  if (!formattedDate) {
    notFound();
  }
  
  // Render the workout page with the specific date
  return <WorkoutPageWithDate date={formattedDate} isExplicitDate={true} />;
}