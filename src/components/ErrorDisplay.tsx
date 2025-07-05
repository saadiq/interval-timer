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
      className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-red-700 mb-2">{title}</h2>
      <p className="text-red-600 text-center mb-4 max-w-md">{message}</p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Retry loading"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};