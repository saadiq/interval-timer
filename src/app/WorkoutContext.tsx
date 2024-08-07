// WorkoutContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workout } from './Workout';
import { WorkoutData } from './types';
import { WorkoutFactory } from './WorkoutFactory';

interface WorkoutContextType {
  workout: Workout | null;
  workoutData: WorkoutData | null;
  setWorkoutData: (data: WorkoutData) => void;
  time: number;
  setTime: (time: number) => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
  initialWorkoutData?: WorkoutData;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children, initialWorkoutData }) => {
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(initialWorkoutData || null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (workoutData) {
      const newWorkout = WorkoutFactory.createWorkout(workoutData);
      setWorkout(newWorkout);
    }
  }, [workoutData]);

  return (
    <WorkoutContext.Provider 
      value={{ 
        workout, 
        workoutData, 
        setWorkoutData, 
        time, 
        setTime, 
        isRunning, 
        setIsRunning 
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider');
  }
  return context;
};