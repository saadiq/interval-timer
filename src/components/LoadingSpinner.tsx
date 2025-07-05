// src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in" role="status" aria-live="polite">
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} border-4 border-muted border-t-primary rounded-full animate-spin`}
          aria-hidden="true"
        />
        <div 
          className={`${sizeClasses[size]} border-4 border-transparent border-b-primary/30 rounded-full animate-spin absolute top-0 left-0`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          aria-hidden="true"
        />
      </div>
      <div className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>
        {message}
      </div>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

// Skeleton components for different content types
export const WorkoutCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-card border border-border rounded-xl animate-pulse">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted/70 rounded w-24"></div>
          </div>
          <div className="h-6 bg-muted rounded w-16"></div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted/60 rounded w-20"></div>
            <div className="h-4 bg-muted/60 rounded w-full"></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-muted/60 rounded w-24"></div>
          <div className="h-4 bg-muted/60 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
};

export const WorkoutListSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header skeleton */}
      <div className="text-center mb-10">
        <div className="h-10 bg-gradient-primary/20 rounded-lg w-64 mx-auto mb-3"></div>
        <div className="h-6 bg-muted/70 rounded w-80 mx-auto"></div>
      </div>

      {/* Month sections skeleton */}
      <div className="space-y-10">
        {[1, 2].map((month) => (
          <div key={month} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-8 bg-muted rounded w-32"></div>
              <div className="flex-1 h-px bg-border"></div>
              <div className="h-6 bg-muted rounded-full w-20"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((card) => (
                <WorkoutCardSkeleton key={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};