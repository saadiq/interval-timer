import React, { useState } from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkoutData, BaseSection, BaseExercise, WorkoutSection } from '@/app/types';
import { AMRAPWorkout } from '@/app/AMRAPWorkout';
import { SectionWithColor } from '@/util/colorUtils';

export const WorkoutSummary: React.FC = () => {
  const { workout } = useWorkoutContext();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!workout) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderSectionGroup = (sections: ReadonlyArray<SectionWithColor>, title: string) => {
    if (sections.length === 0) return null;

    const groupDuration = sections.reduce((total, section) => total + (section.duration || 0), 0);

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold mb-2">
          {title}: {formatTime(groupDuration)}
        </h3>
        {sections.map((section, index) => renderSection(section, index))}
      </div>
    );
  };

  const renderSection = (section: SectionWithColor, index: number) => {
    return (
      <div key={index} className="section-item flex items-center justify-between">
        <div className="flex items-center">
          <span className={`section-color-indicator ${section.color} w-4 h-4 rounded-full inline-block mr-2`}></span>
          <span>{section.name}</span>
        </div>
        <div>
          {section.duration !== undefined && <span>{formatTime(section.duration)}</span>}
          {'reps' in section && section.reps !== undefined && <span>{section.reps} reps</span>}
        </div>
      </div>
    );
  };

  const renderAMRAPSection = (amrapWorkout: AMRAPWorkout) => {
    const amrapSection = amrapWorkout.getAMRAPSection();
    if (!amrapSection) {
      return null; // or some fallback UI
    }
    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold mb-2">
          AMRAP: {formatTime(amrapSection.duration)}
        </h3>
        <p className="mb-2">Perform as many rounds as possible of:</p>
        {amrapSection.exercises && amrapSection.exercises.map((exercise, index) => 
          renderSection({ ...exercise, color: amrapSection.color }, index)
        )}
      </div>
    );
  };

  const isWarmUpOrCoolDown = (section: SectionWithColor): boolean => {
    return workout.data.warmUp.some(s => s.name === section.name) || 
           workout.data.coolDown.some(s => s.name === section.name);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <button onClick={toggleExpand} className="expand-button w-full flex justify-between items-center">
        <span className="font-bold">
          Full Workout ({workout.type}): {formatTime(workout.duration)}
        </span>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isExpanded && (
        <div className="expanded-view mt-4">
          {renderSectionGroup(workout.sections.filter(s => workout.data.warmUp.some(w => w.name === s.name)), 'Warm-up')}
          {workout instanceof AMRAPWorkout 
            ? renderAMRAPSection(workout) 
            : renderSectionGroup(workout.sections.filter(s => !isWarmUpOrCoolDown(s)), 'Workout')}
          {renderSectionGroup(workout.sections.filter(s => workout.data.coolDown.some(c => c.name === s.name)), 'Cool-down')}
        </div>
      )}
    </div>
  );
};