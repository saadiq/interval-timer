// src/components/ErrorDisplay.tsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = "Something went wrong",
  message,
  onRetry,
  showRetry = true
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-destructive/5 border border-destructive/20 rounded-xl animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="p-3 rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-destructive mb-3">{title}</h2>
      <p className="text-destructive/80 text-center mb-6 max-w-md leading-relaxed">{message}</p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-xl"
          aria-label="Retry loading"
        >
          <RefreshCw size={18} />
          <span className="font-medium">Try Again</span>
        </button>
      )}
    </div>
  );
};