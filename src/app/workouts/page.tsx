'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WorkoutDetails {
  type: string;
  totalDuration: number;
  exerciseCount: number;
  primaryExercises: string[];
}

interface WorkoutListResponse {
  dates: string[];
  count: number;
  workoutDetails: Record<string, WorkoutDetails>;
}

export default function WorkoutListPage() {
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [workoutDetails, setWorkoutDetails] = useState<Record<string, WorkoutDetails>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkoutDates = async () => {
      try {
        const response = await fetch('/api/workouts');
        if (!response.ok) {
          throw new Error('Failed to fetch workout dates');
        }
        const data = await response.json() as WorkoutListResponse;
        setWorkoutDates(data.dates);
        setWorkoutDetails(data.workoutDetails);
      } catch (err) {
        setError('Failed to load workout dates. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutDates();
  }, []);

  // Group workouts by month
  const workoutsByMonth: Record<string, string[]> = {};
  workoutDates.forEach(date => {
    const [year, month] = date.split('-');
    const monthKey = `${year}-${month}`;
    if (!workoutsByMonth[monthKey]) {
      workoutsByMonth[monthKey] = [];
    }
    workoutsByMonth[monthKey].push(date);
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    // Create a new date object with the date string
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create date using local timezone (months are 0-indexed in JS Date)
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format month for display
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  };

  // Get workout type badge color
  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'CIRCUIT':
        return 'bg-blue-100 text-blue-800';
      case 'AMRAP':
        return 'bg-green-100 text-green-800';
      case 'TABATA':
        return 'bg-red-100 text-red-800';
      case 'EMOM':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading available workouts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (workoutDates.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">No Workouts Available</h1>
        <p className="text-lg mb-4">There are currently no workouts available in the system.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Workouts</h1>
      
      {Object.keys(workoutsByMonth).sort().reverse().map(monthKey => (
        <div key={monthKey} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{formatMonth(monthKey)}</h2>
          <div className="grid grid-cols-1 gap-4">
            {workoutsByMonth[monthKey].map(date => {
              const details = workoutDetails[date];
              return (
                <Link 
                  href={`/?date=${date}`} 
                  key={date}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="font-medium text-lg mb-1">
                        {formatDate(date)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getWorkoutTypeColor(details.type)}`}>
                          {details.type}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">
                          {formatDuration(details.totalDuration)}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">
                          {details.exerciseCount} exercises
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="text-sm">
                        <span className="font-medium">Exercises:</span>{' '}
                        <span className="text-gray-700">{details.primaryExercises.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 