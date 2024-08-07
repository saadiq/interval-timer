// WorkoutSummary.tsx
import React, { useState } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkoutSection } from '@/app/types'; // Assuming you have this type defined

export const WorkoutSummary: React.FC = () => {
  const { workout, time } = useWorkoutContext();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!workout) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatTime = (seconds: number | undefined) => {
    if (seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSectionIndex = () => {
    let accumulatedTime = 0;
    for (let i = 0; i < workout.sections.length; i++) {
      accumulatedTime += workout.sections[i].duration ?? 0;
      if (time < accumulatedTime) {
        return i;
      }
    }
    return workout.sections.length - 1;
  };

  const getSectionClassName = (section: WorkoutSection, index: number) => {
    let className = 'section-item';
    if (index === getCurrentSectionIndex()) {
      className += ' section-item-active';
    }
    return className;
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
              className={getSectionClassName(section, index)}
            >
              <div className="flex items-center">
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