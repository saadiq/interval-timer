// src/app/WorkoutContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Workout, WorkoutData, WorkoutFactory } from '@/workouts';
import { useAudioCue } from '@/hooks/useAudioCue';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

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
  speakSectionInfo: (currentSection: string, nextSection: string | null) => void;
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
  const { speak } = useSpeechSynthesis();

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

  const speakSectionInfo = useCallback((currentSection: string, nextSection: string | null) => {
    const message = nextSection
      ? `${currentSection}. Next up, ${nextSection}.`
      : `${currentSection}. This is the final section.`;
    console.log('Speaking message:', message);
    speak(message);
  }, [speak]);

  // Add this useEffect to check if speech synthesis is supported
  useEffect(() => {
    if ('speechSynthesis' in window) {
      console.log('Speech synthesis is supported');
    } else {
      console.warn('Speech synthesis is not supported in this browser');
    }
  }, []);

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
        playAudioCue,
        speakSectionInfo
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