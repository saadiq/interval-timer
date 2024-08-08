import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { TabataWorkout } from '@/app/TabataWorkout';
import { Workout } from '@/app/Workout';
import { SectionWithColor } from '@/util/colorUtils';
import { BaseExercise } from '@/app/types';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const tabataColors: string[] = [
  'bg-blue-500', 'bg-green-500',// 'bg-yellow-500', 
  'bg-red-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-indigo-500', 'bg-teal-500',
];

export const WorkoutSummary: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const renderTabataSummary = (tabataWorkout: TabataWorkout) => {
    const { workDuration, restDuration, rounds, exercises } = tabataWorkout.getTabataInfo();
    const totalTabataTime = (workDuration + restDuration) * rounds * exercises.length;
    const currentSection = tabataWorkout.getCurrentSection(time);
    const currentExerciseIndex = exercises.findIndex(ex => ex.name === currentSection.name);

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          Tabata: {formatTime(totalTabataTime)}
        </h3>
        <div className="ml-4">
          <p className="mb-2">
            Work: {formatTime(workDuration)}, Rest: {formatTime(restDuration)}, Rounds: {rounds}
          </p>
          <ul className="space-y-1">
            {exercises.map((exercise, index) => (
              <li
                key={index}
                className={`flex items-center ${currentExerciseIndex === index ? 'font-bold' : ''}`}
              >
                <span className={`section-color-indicator ${tabataColors[index % tabataColors.length]} w-4 h-4 rounded-full inline-block mr-2`}></span>
                {exercise.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="font-bold text-2xl mb-4">Workout Summary</h2>
      {renderSectionGroup(workout.sections.filter(s => workout.data.warmUp.some(w => w.name === s.name)), 'Warm-up')}
      {workout instanceof TabataWorkout
        ? renderTabataSummary(workout)
        : renderSectionGroup(workout.sections.filter(s => !isWarmUpOrCoolDown(s, workout)), 'Workout')}
      {renderSectionGroup(workout.sections.filter(s => workout.data.coolDown.some(c => c.name === s.name)), 'Cool-down')}
    </div>
  );
};

const renderSectionGroup = (sections: ReadonlyArray<SectionWithColor>, title: string) => {
  if (sections.length === 0) return null;

  const groupDuration = sections.reduce((total, section) => total + (section.duration || 0), 0);

  return (
    <div className="workout-section mt-4">
      <h3 className="font-bold text-xl mb-2">
        {title}: {formatTime(groupDuration)}
      </h3>
      <div className="ml-4">
        <ul className="space-y-1">
          {sections.map((section, index) => renderSection(section, index))}
        </ul>
      </div>
    </div>
  );
};

const renderSection = (section: SectionWithColor, index: number) => {
  return (
    <li key={index} className="flex items-center justify-between">
      <div className="flex items-center">
        <span className={`section-color-indicator ${section.color} w-4 h-4 rounded-full inline-block mr-2`}></span>
        <span>{section.name}</span>
      </div>
      <div>
        {section.duration !== undefined && <span>{formatTime(section.duration)}</span>}
        {'reps' in section && section.reps !== undefined && <span>{section.reps} reps</span>}
      </div>
    </li>
  );
};

const isWarmUpOrCoolDown = (section: SectionWithColor, workout: Workout): boolean => {
  return workout.data.warmUp.some(s => s.name === section.name) ||
    workout.data.coolDown.some(s => s.name === s.name);
};