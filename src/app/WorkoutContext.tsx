import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workout, WorkoutData, WorkoutFactory } from '@/workouts';
import { useAudioCue } from '@/hooks/useAudioCue';

interface WorkoutContextType {
  workout: Workout | null;
  workoutData: WorkoutData | null;
  setWorkoutData: (data: WorkoutData) => void;
  time: number;
  setTime: (time: number) => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  isPreWorkout: boolean;
  setIsPreWorkout: (isPreWorkout: boolean) => void;
  preWorkoutCountdown: number | null;
  setPreWorkoutCountdown: (countdown: number | null) => void;
  startPreWorkoutCountdown: () => void;
  resetWorkout: () => void;
  playAudioCue: (delay?: number) => void;
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
  const [isPreWorkout, setIsPreWorkout] = useState(true);
  const [preWorkoutCountdown, setPreWorkoutCountdown] = useState<number | null>(null);
  const playAudioCue = useAudioCue();

  useEffect(() => {
    if (workoutData) {
      const newWorkout = WorkoutFactory.createWorkout(workoutData);
      setWorkout(newWorkout);
    }
  }, [workoutData]);

  const startPreWorkoutCountdown = () => {
    setPreWorkoutCountdown(3);
    setIsRunning(true);
  };

  const resetWorkout = () => {
    setTime(0);
    setIsRunning(false);
    setIsPreWorkout(true);
    setPreWorkoutCountdown(null);
  };

  return (
    <WorkoutContext.Provider 
      value={{ 
        workout, 
        workoutData, 
        setWorkoutData, 
        time, 
        setTime, 
        isRunning, 
        setIsRunning,
        isPreWorkout,
        setIsPreWorkout,
        preWorkoutCountdown,
        setPreWorkoutCountdown,
        startPreWorkoutCountdown,
        resetWorkout,
        playAudioCue
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