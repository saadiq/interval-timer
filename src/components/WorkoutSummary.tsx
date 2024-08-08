import React, { useState } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkoutData, BaseSection, BaseExercise } from '@/app/types';

export const WorkoutSummary: React.FC = () => {
  const { workout, workoutData } = useWorkoutContext();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!workout || !workoutData) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderSectionGroup = (sections: BaseSection[] | BaseExercise[], title: string, repetitions?: number) => {
    if (sections.length === 0) return null;

    const groupDuration = sections.reduce((total, section) => total + (section.duration || 0), 0) * (repetitions || 1);

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold mb-2">
          {title}{repetitions && repetitions > 1 ? ` (x${repetitions})` : ''}: {formatTime(groupDuration)}
        </h3>
        {sections.map((section, index) => renderSection(section, index))}
      </div>
    );
  };

  const renderSection = (section: BaseSection | BaseExercise, index: number) => {
    return (
      <div key={index} className="section-item">
        <div className="flex items-center">
          <span className={`section-color-indicator ${getColorClass(section)}`}></span>
          <span className="ml-2">{section.name}</span>
        </div>
        <span>{formatTime(section.duration || 0)}</span>
      </div>
    );
  };

  const getColorClass = (section: BaseSection | BaseExercise): string => {
    if ('isWarmup' in section) return 'bg-yellow-300';
    if ('isCircuit' in section) return 'bg-blue-300';
    if ('isCooldown' in section) return 'bg-green-300';
    return 'bg-gray-300';
  };

  const getRepetitions = (workoutData: WorkoutData): number => {
    switch (workoutData.type) {
      case 'circuit':
        return workoutData.workout.repetitions;
      case 'tabata':
        return workoutData.workout.rounds;
      default:
        return 1;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <button onClick={toggleExpand} className="expand-button">
        <span className="font-bold">
          Full Workout ({workout.type}): {formatTime(workout.duration)}
        </span>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isExpanded && (
        <div className="expanded-view">
          {renderSectionGroup(workoutData.warmUp, 'Warm-up')}
          {renderSectionGroup(
            workoutData.workout.exercises, 
            workout.type.charAt(0).toUpperCase() + workout.type.slice(1),
            getRepetitions(workoutData)
          )}
          {renderSectionGroup(workoutData.coolDown, 'Cool-down')}
        </div>
      )}
    </div>
  );
};