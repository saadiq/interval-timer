// WorkoutSummary.tsx
import React, { useState } from 'react';
import { useWorkoutContext } from './WorkoutContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const WorkoutSummary: React.FC = () => {
  const { workout, time } = useWorkoutContext();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!workout) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionIndex = () => {
    let accumulatedTime = 0;
    for (let i = 0; i < workout.sections.length; i++) {
      accumulatedTime += workout.sections[i].duration;
      if (time < accumulatedTime) {
        return i;
      }
    }
    return workout.sections.length - 1;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <button
        onClick={toggleExpand}
        className="expand-button"
      >
        <span className="font-bold">
          Full Workout: {formatTime(workout.duration)}
        </span>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isExpanded && (
        <div className="expanded-view">
          {workout.sections.map((section, index) => (
            <div 
              key={index} 
              className={`section-item ${index === getCurrentSectionIndex() ? 'section-item-active' : ''}`}
            >
              <div className="flex items-center">
                <span className={`section-color-indicator ${section.color}`}></span>
                <span className="ml-2">{section.name}</span>
              </div>
              <span>{formatTime(section.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};