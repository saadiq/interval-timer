import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { TabataWorkout } from '@/app/TabataWorkout';
import { CircuitWorkout } from '@/app/CircuitWorkout';
import { AMRAPWorkout } from '@/app/AMRAPWorkout';
import { Workout } from '@/app/Workout';
import { SectionWithColor } from '@/util/colorUtils';
import { BaseExercise } from '@/app/types';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const WorkoutSummary: React.FC = () => {
  const { workout, time } = useWorkoutContext();

  if (!workout) return null;

  const renderCircuitSummary = (circuitWorkout: CircuitWorkout) => {
    const { repetitions, exercises } = circuitWorkout.data.workout;
    const totalCircuitTime = exercises.reduce((total, ex) => total + (ex.duration || 0), 0) * repetitions;

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          Circuit ({repetitions}x): {formatTime(totalCircuitTime)}
        </h3>
        <div className="ml-4">
          <ul className="space-y-1">
            {exercises.map((exercise, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`section-color-indicator ${index % 2 === 0 ? 'bg-blue-300' : 'bg-green-400'} w-4 h-4 rounded-full inline-block mr-2`}></span>
                  <span>{exercise.name}</span>
                </div>
                <div>
                  {exercise.duration !== undefined && <span>{formatTime(exercise.duration)}</span>}
                  {exercise.reps !== undefined && <span>{exercise.reps} reps</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderTabataSummary = (tabataWorkout: TabataWorkout) => {
    const { workDuration, restDuration, rounds, exercises } = tabataWorkout.getTabataInfo();
    const totalTabataTime = (workDuration + restDuration) * rounds * exercises.length;
    const tabataSections = tabataWorkout.getTabataSections();

    const currentSectionIndex = tabataSections.findIndex(section => {
      const sectionStart = tabataWorkout.sections.slice(0, tabataWorkout.sections.indexOf(section as SectionWithColor)).reduce((total, s) => total + (s.duration || 0), 0);
      const sectionEnd = sectionStart + (section.duration || 0);
      return time >= sectionStart && time < sectionEnd;
    });

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          Tabata (x{rounds}): {formatTime(totalTabataTime)}
        </h3>
        <div className="ml-4">
          <ul className="space-y-1">
            {exercises.map((exercise, exerciseIndex) => (
              <React.Fragment key={exerciseIndex}>
                <li className={`flex items-center justify-between ${currentSectionIndex === exerciseIndex * 2 ? 'bg-gray-200' : ''}`}>
                  <div className="flex items-center">
                    <span className={`section-color-indicator ${tabataSections[exerciseIndex * 2].color} w-4 h-4 rounded-full inline-block mr-2`}></span>
                    <span>{exercise.name}</span>
                  </div>
                  <span>{formatTime(workDuration)}</span>
                </li>
                <li className={`flex items-center justify-between ${currentSectionIndex === exerciseIndex * 2 + 1 ? 'bg-gray-200' : ''}`}>
                  <div className="flex items-center">
                    <span className="section-color-indicator bg-gray-300 w-4 h-4 rounded-full inline-block mr-2"></span>
                    <span>Rest</span>
                  </div>
                  <span>{formatTime(restDuration)}</span>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderAMRAPSummary = (amrapWorkout: AMRAPWorkout) => {
    const amrapSection = amrapWorkout.getAMRAPSection();
    if (!amrapSection) return null;

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          AMRAP: {formatTime(amrapSection.duration)}
        </h3>
        <div className="ml-4">
          <p className="mb-2">As many rounds as possible of:</p>
          <ul className="space-y-1">
            {amrapSection.exercises.map((exercise, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`section-color-indicator bg-blue-300 w-4 h-4 rounded-full inline-block mr-2`}></span>
                  <span>{exercise.name}</span>
                </div>
                <div>
                  {exercise.reps !== undefined && <span>{exercise.reps} reps</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
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

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="font-bold text-2xl mb-4">Workout Summary</h2>
      {renderSectionGroup(workout.sections.filter(s => workout.data.warmUp.some(w => w.name === s.name)), 'Warm-up')}
      {workout instanceof CircuitWorkout
        ? renderCircuitSummary(workout)
        : workout instanceof TabataWorkout
        ? renderTabataSummary(workout)
        : workout instanceof AMRAPWorkout
        ? renderAMRAPSummary(workout)
        : renderSectionGroup(workout.sections.filter(s => !isWarmUpOrCoolDown(s, workout)), 'Workout')}
      {renderSectionGroup(workout.sections.filter(s => workout.data.coolDown.some(c => c.name === s.name)), 'Cool-down')}
    </div>
  );
};