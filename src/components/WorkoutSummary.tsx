// src/components/WorkoutSummary.tsx
import React from 'react';
import { useWorkoutContext } from '@/app/WorkoutContext';
import { TabataWorkout, CircuitWorkout, AMRAPWorkout, EMOMWorkout, Workout, BaseExercise } from '@/workouts';
import { SectionWithColor } from '@/util/colorUtils';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ClickableMovementName: React.FC<{ name: string }> = ({ name }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const searchQuery = encodeURIComponent(`${name}`);
    window.open(`https://www.perplexity.ai?q=${searchQuery}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="text-inherit hover:bg-gray-100 rounded px-1 py-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      title={`Click to learn more about ${name}`}
    >
      {name}
    </button>
  );
};

export const WorkoutSummary: React.FC = () => {
  const { workout, time, isPreWorkout } = useWorkoutContext();

  if (!workout) return null;

  const isWorkoutStarted = !isPreWorkout;
  const currentSection = isWorkoutStarted ? workout.getCurrentSection(time) : null;

  // Helper function to check if a section is active
  const isSectionActive = (section: SectionWithColor, index: number) => {
    if (!isWorkoutStarted || !currentSection) return false;
    return section.name === currentSection.name && 
           workout.sections.indexOf(currentSection) === index;
  };

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
            {exercises.map((exercise, index) => {
              const sectionIndex = workout.data.warmUp.length + index;
              const sectionWithColor = workout.sections[sectionIndex] as SectionWithColor;
              return (
                <li key={index} className={`flex items-center justify-between ${isSectionActive(sectionWithColor, sectionIndex) ? 'bg-yellow-100' : ''}`}>
                  <div className="flex items-center">
                    <span className={`section-color-indicator ${sectionWithColor.color} w-4 h-4 rounded-full inline-block mr-2`}></span>
                    <ClickableMovementName name={exercise.name} />
                  </div>
                  <div>
                    {exercise.duration !== undefined && <span>{formatTime(exercise.duration)}</span>}
                    {exercise.reps !== undefined && <span>{exercise.reps} reps</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  const renderTabataSummary = (tabataWorkout: TabataWorkout) => {
    const { workDuration, restDuration, rounds, exercises } = tabataWorkout.getTabataInfo();
    const totalTabataTime = (workDuration + restDuration) * rounds * exercises.length;
    const tabataSections = tabataWorkout.getTabataSections();

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          Tabata (x{rounds}): {formatTime(totalTabataTime)}
        </h3>
        <div className="ml-4">
          <ul className="space-y-1">
            {exercises.map((exercise, exerciseIndex) => (
              <React.Fragment key={exerciseIndex}>
                <li className={`flex items-center justify-between ${isSectionActive(tabataSections[exerciseIndex * 2], workout.data.warmUp.length + exerciseIndex * 2) ? 'bg-yellow-100' : ''}`}>
                  <div className="flex items-center">
                    <span className={`section-color-indicator ${tabataSections[exerciseIndex * 2].color} w-4 h-4 rounded-full inline-block mr-2`}></span>
                    <ClickableMovementName name={exercise.name} />
                  </div>
                  <span>{formatTime(workDuration)}</span>
                </li>
                <li className={`flex items-center justify-between ${isSectionActive(tabataSections[exerciseIndex * 2 + 1], workout.data.warmUp.length + exerciseIndex * 2 + 1) ? 'bg-yellow-100' : ''}`}>
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
            {amrapSection.exercises.map((exercise: BaseExercise, index: number) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`section-color-indicator bg-blue-300 w-4 h-4 rounded-full inline-block mr-2`}></span>
                  <ClickableMovementName name={exercise.name} />
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

  const renderEMOMSummary = (emomWorkout: EMOMWorkout) => {
    const emomSections = emomWorkout.getEMOMSections();
    const totalEMOMTime = emomWorkout.getEMOMDuration();
    const rounds = emomWorkout.getRounds();
  
    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          EMOM: {formatTime(totalEMOMTime)} ({rounds} round{rounds > 1 ? 's' : ''})
        </h3>
        <div className="ml-4">
          <p className="mb-2">Every minute on the minute, perform:</p>
          <ul className="space-y-1">
            {emomSections.map((section, index) => (
              <li key={index} className={`flex items-center justify-between ${isSectionActive(section, workout.data.warmUp.length + index) ? 'bg-yellow-100' : ''}`}>
                <div className="flex items-center">
                  <span className={`section-color-indicator ${section.color} w-4 h-4 rounded-full inline-block mr-2`}></span>
                  <ClickableMovementName name={section.name} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderSectionGroup = (sections: ReadonlyArray<SectionWithColor>, title: string, startIndex: number) => {
    if (sections.length === 0) return null;

    const groupDuration = sections.reduce((total, section) => total + (section.duration || 0), 0);

    return (
      <div className="workout-section mt-4">
        <h3 className="font-bold text-xl mb-2">
          {title}: {formatTime(groupDuration)}
        </h3>
        <div className="ml-4">
          <ul className="space-y-1">
            {sections.map((section, index) => renderSection(section, startIndex + index, isSectionActive(section, startIndex + index)))}
          </ul>
        </div>
      </div>
    );
  };

  const renderSection = (section: SectionWithColor, index: number, isActive: boolean) => {
    return (
      <li key={index} className={`flex items-center justify-between ${isActive ? 'bg-yellow-100' : ''}`}>
        <div className="flex items-center">
          <span className={`section-color-indicator ${section.color} w-4 h-4 rounded-full inline-block mr-2`}></span>
          <ClickableMovementName name={section.name} />
        </div>
        <div>
          {section.duration !== undefined && <span>{formatTime(section.duration)}</span>}
          {'reps' in section && section.reps !== undefined && <span>{section.reps} reps</span>}
        </div>
      </li>
    );
  };

  // Function to get warm-up sections
  const getWarmUpSections = (): ReadonlyArray<SectionWithColor> => {
    return workout.sections.slice(0, workout.data.warmUp.length);
  };

  // Function to get cool-down sections
  const getCoolDownSections = (): ReadonlyArray<SectionWithColor> => {
    return workout.sections.slice(-workout.data.coolDown.length);
  };

  // Function to get main workout sections
  const getMainWorkoutSections = (): ReadonlyArray<SectionWithColor> => {
    return workout.sections.slice(
      workout.data.warmUp.length,
      workout.sections.length - workout.data.coolDown.length
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="font-bold text-2xl mb-4">Workout Summary</h2>
      {renderSectionGroup(getWarmUpSections(), 'Warm-up', 0)}
      {workout instanceof CircuitWorkout
        ? renderCircuitSummary(workout)
        : workout instanceof TabataWorkout
          ? renderTabataSummary(workout)
          : workout instanceof AMRAPWorkout
            ? renderAMRAPSummary(workout)
            : workout instanceof EMOMWorkout
              ? renderEMOMSummary(workout)
              : renderSectionGroup(getMainWorkoutSections(), 'Workout', workout.data.warmUp.length)}
      {renderSectionGroup(getCoolDownSections(), 'Cool-down', workout.sections.length - workout.data.coolDown.length)}
    </div>
  );
};