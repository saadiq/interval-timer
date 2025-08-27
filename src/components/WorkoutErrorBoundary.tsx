'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
}

const WorkoutErrorFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full p-6 bg-card border border-border rounded-lg shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-warning" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-card-foreground">
          Workout Loading Error
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          We couldn&apos;t load this workout. The workout data might be corrupted or unavailable.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Today&apos;s Workout
          </Link>
          <Link
            href="/workouts"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            View All Workouts
          </Link>
        </div>
      </div>
    </div>
  );
};

export const WorkoutErrorBoundary: React.FC<Props> = ({ children }) => {
  return <ErrorBoundary fallback={<WorkoutErrorFallback />}>{children}</ErrorBoundary>;
};
