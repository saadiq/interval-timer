import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { SectionWithColor } from '@/utils/colorUtils';
import { TabataWorkout } from '@/workouts';

export const ProgressBar: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const progress = workout.getProgress(time);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAllSections = (): SectionWithColor[] => {
    // Use consistent colors for all sections - matching WorkoutSummary
    const warmUpColor = 'bg-yellow-300';
    const coolDownColor = 'bg-yellow-300';
    const restColor = 'bg-gray-300'; // Consistent with WorkoutSummary
    
    const warmUpSections = workout.data.warmUp.map(s => ({ 
      ...s, 
      color: warmUpColor 
    }));
    
    const coolDownSections = workout.data.coolDown.map(s => ({ 
      ...s, 
      color: coolDownColor 
    }));

    // Get the main workout color based on workout type
    const getMainWorkoutColor = () => {
      switch (workout.data.type.toLowerCase()) {
        case 'circuit': return 'bg-workout-circuit';
        case 'amrap': return 'bg-workout-amrap';
        case 'tabata': return 'bg-workout-tabata';
        case 'emom': return 'bg-workout-emom';
        default: return 'bg-primary';
      }
    };

    const mainWorkoutColor = getMainWorkoutColor();

    let mainWorkoutSections: SectionWithColor[];
    if (workout instanceof TabataWorkout) {
      mainWorkoutSections = workout.getTabataSections().map(s => ({
        name: s.name,
        duration: s.duration,
        color: s.name.toLowerCase().includes('rest') ? restColor : mainWorkoutColor
      }));
    } else {
      mainWorkoutSections = workout.sections
        .filter(s => 
          !workout.data.warmUp.some(w => w.name === s.name) && 
          !workout.data.coolDown.some(c => c.name === s.name)
        )
        .map(s => ({
          ...s,
          color: s.name.toLowerCase().includes('rest') ? restColor : mainWorkoutColor
        }));
    }

    return [...warmUpSections, ...mainWorkoutSections, ...coolDownSections];
  };

  const sections = getAllSections();

  const currentSectionIndex = sections.findIndex(section => {
    const sectionStart = sections.slice(0, sections.indexOf(section)).reduce((total, s) => total + (s.duration || 0), 0);
    const sectionEnd = sectionStart + (section.duration || 0);
    return time >= sectionStart && time < sectionEnd;
  });

  return (
    <div className="mb-6 space-y-3" role="region" aria-labelledby="workout-progress">
      {/* Progress Header */}
      <div className="flex justify-between items-center">
        <div id="workout-progress" className="text-lg font-semibold text-foreground">
          Progress
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {formatTime(workout.duration - time)} remaining
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {Math.round(progress * 100)}% complete
        </span>
        <span className="text-muted-foreground">
          {formatTime(workout.duration)} total
        </span>
      </div>

      {/* Enhanced Progress Bar */}
      <div 
        className="relative h-8 rounded-lg overflow-hidden bg-secondary shadow-inner border border-border"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Workout progress: ${Math.round(progress * 100)}% complete, ${formatTime(workout.duration - time)} remaining`}
      >
        {/* Section Background */}
        {sections.map((section, index) => {
          const sectionStart = sections.slice(0, index).reduce((total, s) => total + (s.duration || 0), 0);
          const sectionWidth = ((section.duration || 0) / workout.duration) * 100;
          const isCurrentSection = index === currentSectionIndex;
          
          return (
            <div
              key={index}
              className={`absolute top-0 h-full transition-all duration-300 ${
                section.color
              } ${isCurrentSection ? 'brightness-110 shadow-md' : 'opacity-80'}`}
              style={{
                left: `${(sectionStart / workout.duration) * 100}%`,
                width: `${sectionWidth}%`
              }}
              aria-label={`${section.name} section`}
            />
          );
        })}

        {/* Progress Indicator */}
        <div
          className="absolute top-0 h-full bg-foreground/20 border-r-2 border-foreground transition-all duration-200 ease-out"
          style={{ 
            left: '0%',
            width: `${progress * 100}%`
          }}
          aria-hidden="true"
        />

        {/* Current Position Indicator */}
        <div
          className="absolute top-0 h-full w-1 bg-foreground shadow-lg transition-all duration-200 ease-out"
          style={{ left: `${progress * 100}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Section Labels */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          <span className="text-muted-foreground">Warm-up</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-full ${
            workout.data.type.toLowerCase() === 'circuit' ? 'bg-workout-circuit' :
            workout.data.type.toLowerCase() === 'amrap' ? 'bg-workout-amrap' :
            workout.data.type.toLowerCase() === 'tabata' ? 'bg-workout-tabata' :
            workout.data.type.toLowerCase() === 'emom' ? 'bg-workout-emom' :
            'bg-primary'
          }`}></div>
          <span className="text-muted-foreground">Exercise</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span className="text-muted-foreground">Rest</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          <span className="text-muted-foreground">Cool-down</span>
        </div>
      </div>
    </div>
  );
};