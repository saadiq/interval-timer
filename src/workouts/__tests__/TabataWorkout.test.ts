import { describe, it, expect } from 'vitest';
import { TabataWorkout } from '../TabataWorkout';
import { TabataWorkout as TabataWorkoutData } from '../types';

describe('TabataWorkout', () => {
  const mockWorkoutData: TabataWorkoutData = {
    type: 'tabata',
    warmUp: [
      { name: 'Jumping Jacks', duration: 30 },
    ],
    workout: {
      workDuration: 20,
      restDuration: 10,
      rounds: 8,
      exercises: [
        { name: 'Burpees' },
        { name: 'Mountain Climbers' },
      ],
    },
    coolDown: [
      { name: 'Stretching', duration: 60 },
    ],
  };

  it('should create a tabata workout instance', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    expect(workout).toBeInstanceOf(TabataWorkout);
    expect(workout.type).toBe('tabata');
    expect(workout.date).toBe('2025-08-27');
  });

  it('should calculate total duration correctly', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    // Warm up: 30
    // Each round: (20 work + 10 rest) * 2 exercises = 60 seconds
    // Total workout: 60 * 8 rounds = 480
    // Cool down: 60
    // Total: 30 + 480 + 60 = 570
    expect(workout.duration).toBe(570);
  });

  it('should create correct tabata sections', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    const tabataSections = workout.getTabataSections();
    
    // Should have 8 rounds * 2 exercises * 2 (work + rest) = 32 sections
    expect(tabataSections).toHaveLength(32);
    
    // First section should be Burpees work
    expect(tabataSections[0].name).toBe('Burpees');
    expect(tabataSections[0].isRest).toBe(false);
    expect(tabataSections[0].duration).toBe(20);
    
    // Second section should be rest
    expect(tabataSections[1].name).toBe('Rest');
    expect(tabataSections[1].isRest).toBe(true);
    expect(tabataSections[1].duration).toBe(10);
    
    // Third section should be Mountain Climbers
    expect(tabataSections[2].name).toBe('Mountain Climbers');
    expect(tabataSections[2].isRest).toBe(false);
    expect(tabataSections[2].duration).toBe(20);
  });

  it('should get current round correctly', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    expect(workout.getCurrentRound(10)).toBe(0);
    
    // During first round (after 30s warm-up)
    expect(workout.getCurrentRound(40)).toBe(1);
    
    // During second round (after warm-up 30 + first round 60)
    expect(workout.getCurrentRound(100)).toBe(2);
    
    // During eighth round
    expect(workout.getCurrentRound(470)).toBe(8);
    
    // During cool-down
    expect(workout.getCurrentRound(520)).toBe(8);
  });

  it('should get remaining rounds correctly', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    expect(workout.getRemainingRounds(10)).toBe(0);
    
    // During first round
    expect(workout.getRemainingRounds(40)).toBe(7);
    
    // During last round
    expect(workout.getRemainingRounds(470)).toBe(0);
    
    // During cool-down
    expect(workout.getRemainingRounds(520)).toBe(0);
  });

  it('should get tabata info correctly', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    const info = workout.getTabataInfo();
    
    expect(info.workDuration).toBe(20);
    expect(info.restDuration).toBe(10);
    expect(info.rounds).toBe(8);
    expect(info.exercises).toHaveLength(2);
    expect(info.exercises[0].name).toBe('Burpees');
  });

  it('should throw error for invalid tabata data', () => {
    const invalidData1: TabataWorkoutData = {
      type: 'tabata',
      warmUp: [],
      workout: {
        workDuration: undefined as any,
        restDuration: 10,
        rounds: 8,
        exercises: [{ name: 'Test' }],
      },
      coolDown: [],
    };

    expect(() => new TabataWorkout(invalidData1, '2025-08-27')).toThrow('Tabata work duration must be defined');

    const invalidData2: TabataWorkoutData = {
      type: 'tabata',
      warmUp: [],
      workout: {
        workDuration: 20,
        restDuration: undefined as any,
        rounds: 8,
        exercises: [{ name: 'Test' }],
      },
      coolDown: [],
    };

    expect(() => new TabataWorkout(invalidData2, '2025-08-27')).toThrow('Tabata rest duration must be defined');

    const invalidData3: TabataWorkoutData = {
      type: 'tabata',
      warmUp: [],
      workout: {
        workDuration: 20,
        restDuration: 10,
        rounds: 8,
        exercises: [],
      },
      coolDown: [],
    };

    expect(() => new TabataWorkout(invalidData3, '2025-08-27')).toThrow('Tabata workout must include at least one exercise');
  });

  it('should handle section timing correctly', () => {
    const workout = new TabataWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    const warmupSection = workout.getCurrentSection(15);
    expect(warmupSection?.name).toBe('Jumping Jacks');
    
    // During first burpees (after 30s warm-up)
    const burpeesSection = workout.getCurrentSection(35);
    expect(burpeesSection?.name).toBe('Burpees');
    
    // During first rest (after warm-up 30 + burpees 20)
    const restSection = workout.getCurrentSection(52);
    expect(restSection?.name).toBe('Rest');
    
    // During cool-down
    const cooldownSection = workout.getCurrentSection(520);
    expect(cooldownSection?.name).toBe('Stretching');
  });
});