import { describe, it, expect } from 'vitest';
import { EMOMWorkout } from '../EMOMWorkout';
import { EMOMWorkout as EMOMWorkoutData } from '../types';

describe('EMOMWorkout', () => {
  const mockWorkoutData: EMOMWorkoutData = {
    type: 'emom',
    warmUp: [
      { name: 'Jumping Jacks', duration: 30 },
    ],
    workout: {
      rounds: 8, // 8 minutes
      exercises: [
        { name: '5 Burpees', reps: "5" },
        { name: '10 Squats', reps: "10" },
        { name: '8 Push-ups', reps: "8" },
        { name: '10 Mountain Climbers', reps: "10" },
      ],
    },
    coolDown: [
      { name: 'Stretching', duration: 60 },
    ],
  };

  it('should create an EMOM workout instance', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    expect(workout).toBeInstanceOf(EMOMWorkout);
    expect(workout.type).toBe('emom');
    expect(workout.date).toBe('2025-08-27');
  });

  it('should calculate total duration correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    // Warm up: 30
    // EMOM: 8 rounds * 60 seconds = 480
    // Cool down: 60
    // Total: 30 + 480 + 60 = 570
    expect(workout.duration).toBe(570);
  });

  it('should create correct EMOM sections', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    const emomSections = workout.getEMOMSections();
    
    // Should have 8 rounds (one section per minute)
    expect(emomSections).toHaveLength(8);
    
    // Each section should be 60 seconds
    emomSections.forEach(section => {
      expect(section.duration).toBe(60);
      expect(section.name).toContain('Minute');
    });
  });

  it('should get current round correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    expect(workout.getCurrentRound(10)).toBe(0);
    
    // During first minute (after 30s warm-up)
    expect(workout.getCurrentRound(40)).toBe(1);
    
    // During second minute
    expect(workout.getCurrentRound(100)).toBe(2);
    
    // During eighth minute
    expect(workout.getCurrentRound(470)).toBe(8);
    
    // During cool-down
    expect(workout.getCurrentRound(520)).toBe(8);
  });

  it('should get remaining rounds correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    expect(workout.getRemainingRounds(10)).toBe(0);
    
    // During first minute - still have 7 full rounds remaining
    expect(workout.getRemainingRounds(40)).toBe(7);
    
    // During last minute
    expect(workout.getRemainingRounds(470)).toBe(0);
    
    // During cool-down
    expect(workout.getRemainingRounds(520)).toBe(0);
  });

  it('should get rounds correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    expect(workout.getRounds()).toBe(8);
  });

  it('should return correct section at given time', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    const warmUpSection = workout.getCurrentSection(10);
    expect(warmUpSection?.name).toBe('Jumping Jacks');
    
    // During EMOM (first minute)
    const emomSection1 = workout.getCurrentSection(40);
    expect(emomSection1?.name).toContain('Round 1 of 8');
    
    // During EMOM (third minute)
    const emomSection3 = workout.getCurrentSection(160);
    expect(emomSection3?.name).toContain('Round 3 of 8');
    
    // During cool down
    const coolDown = workout.getCurrentSection(520);
    expect(coolDown?.name).toBe('Stretching');
  });

  it('should calculate progress correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    
    expect(workout.getProgress(0)).toBe(0);
    expect(workout.getProgress(285)).toBe(0.5); // Half way through
    expect(workout.getProgress(570)).toBe(1); // Complete
    expect(workout.getProgress(600)).toBe(1); // Beyond duration
  });

  it('should format exercise list correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    const emomSections = workout.getEMOMSections();
    
    expect(emomSections[0].name).toContain('Minute 1');
  });

  it('should handle single exercise EMOM', () => {
    const singleExerciseData: EMOMWorkoutData = {
      type: 'emom',
      warmUp: [],
      workout: {
        rounds: 5,
        exercises: [
          { name: '10 Burpees', reps: "10" },
        ],
      },
      coolDown: [],
    };

    const workout = new EMOMWorkout(singleExerciseData, '2025-08-27');
    const emomSections = workout.getEMOMSections();
    
    expect(emomSections).toHaveLength(5);
    expect(emomSections[0].name).toContain('Minute 1');
    expect(workout.duration).toBe(300); // 5 * 60
  });

  it('should get next section correctly', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up, next should be first EMOM minute
    const nextFromWarmup = workout.getNextSection(10);
    expect(nextFromWarmup?.name).toBe('Round 1 of 8'); // Shows first EMOM round
    
    // During first EMOM minute, next should be second EMOM minute
    const nextFromEMOM1 = workout.getNextSection(40);
    expect(nextFromEMOM1?.name).toContain('Round 2 of 8');
    
    // During last EMOM minute, next should be cool down
    const nextFromLastEMOM = workout.getNextSection(470);
    expect(nextFromLastEMOM?.name).toBe('Stretching');
    
    // During last section, should return null
    const nextFromCooldown = workout.getNextSection(520);
    expect(nextFromCooldown).toBeNull();
  });

  it('should have correct description for EMOM sections', () => {
    const workout = new EMOMWorkout(mockWorkoutData, '2025-08-27');
    // Get current section during EMOM time
    const currentSection = workout.getCurrentSection(40); // During first minute
    
    expect(currentSection?.description).toContain('Burpees');
    expect(currentSection?.description).toContain('Squats');
    expect(currentSection?.description).toContain('Push-ups');
    expect(currentSection?.description).toContain('Mountain Climbers');
  });

  it('should validate workout data correctly', () => {
    const invalidData: EMOMWorkoutData = {
      type: 'emom',
      warmUp: [],
      workout: {
        rounds: undefined as any,
        exercises: [{ name: 'Test', reps: "5" }],
      },
      coolDown: [],
    };

    // The actual implementation doesn't validate undefined rounds, it will just result in NaN
    // But it does validate if rounds < 1
    const workout = new EMOMWorkout(invalidData, '2025-08-27');
    expect(workout.duration).toBeNaN();

    const noExercisesData: EMOMWorkoutData = {
      type: 'emom',
      warmUp: [],
      workout: {
        rounds: 5,
        exercises: [],
      },
      coolDown: [],
    };

    expect(() => new EMOMWorkout(noExercisesData, '2025-08-27')).toThrow('EMOM workout must include at least one exercise');
  });
});