import { describe, it, expect } from 'vitest';
import { AMRAPWorkout } from '../AMRAPWorkout';
import { AMRAPWorkout as AMRAPWorkoutData } from '../types';

describe('AMRAPWorkout', () => {
  const mockWorkoutData: AMRAPWorkoutData = {
    type: 'amrap',
    warmUp: [
      { name: 'Jumping Jacks', duration: 30 },
      { name: 'Arm Circles', duration: 20 },
    ],
    workout: {
      duration: 600, // 10 minutes
      exercises: [
        { name: '5 Push-ups', reps: "5" },
        { name: '10 Squats', reps: "10" },
        { name: '15 Sit-ups', reps: "15" },
      ],
    },
    coolDown: [
      { name: 'Stretching', duration: 60 },
    ],
  };

  it('should create an AMRAP workout instance', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    expect(workout).toBeInstanceOf(AMRAPWorkout);
    expect(workout.type).toBe('amrap');
    expect(workout.date).toBe('2025-08-27');
  });

  it('should calculate total duration correctly', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    // Warm up: 30 + 20 = 50
    // AMRAP: 600
    // Cool down: 60
    // Total: 50 + 600 + 60 = 710
    expect(workout.duration).toBe(710);
  });

  it('should create correct AMRAP section', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    const amrapSection = workout.getAMRAPSection();
    
    expect(amrapSection).toBeDefined();
    expect(amrapSection?.name).toBe('AMRAP');
    expect(amrapSection?.duration).toBe(600);
    expect(amrapSection?.description).toContain('5 Push-ups');
    expect(amrapSection?.description).toContain('10 Squats');
    expect(amrapSection?.description).toContain('15 Sit-ups');
  });

  it('should identify AMRAP section correctly', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    
    // Warm-up sections should not be AMRAP
    const warmupSection = workout.sections[0];
    expect(workout.isAMRAPSection(warmupSection)).toBe(false);
    
    // AMRAP section should be identified
    const amrapSection = workout.getAMRAPSection();
    if (amrapSection) {
      expect(workout.isAMRAPSection(amrapSection)).toBe(true);
    }
    
    // Cool-down sections should not be AMRAP
    const cooldownSection = workout.sections[workout.sections.length - 1];
    expect(workout.isAMRAPSection(cooldownSection)).toBe(false);
  });

  it('should return correct section at given time', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    const warmUpSection = workout.getCurrentSection(10);
    expect(warmUpSection?.name).toBe('Jumping Jacks');
    
    // During AMRAP
    const amrapSection = workout.getCurrentSection(300);
    expect(amrapSection?.name).toBe('AMRAP');
    
    // During cool down
    const coolDown = workout.getCurrentSection(660);
    expect(coolDown?.name).toBe('Stretching');
  });

  it('should calculate progress correctly', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    
    expect(workout.getProgress(0)).toBe(0);
    expect(workout.getProgress(355)).toBe(0.5); // Half way through
    expect(workout.getProgress(710)).toBe(1); // Complete
    expect(workout.getProgress(800)).toBe(1); // Beyond duration
  });

  it('should format exercise list correctly', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    const amrapSection = workout.getAMRAPSection();
    
    expect(amrapSection?.name).toBe('AMRAP');
    expect(amrapSection?.description).toBe('5 5 Push-ups, 10 10 Squats, 15 15 Sit-ups');
  });

  it('should handle single exercise AMRAP', () => {
    const singleExerciseData: AMRAPWorkoutData = {
      type: 'amrap',
      warmUp: [],
      workout: {
        duration: 300,
        exercises: [
          { name: 'Burpees', reps: "10" },
        ],
      },
      coolDown: [],
    };

    const workout = new AMRAPWorkout(singleExerciseData, '2025-08-27');
    const amrapSection = workout.getAMRAPSection();
    
    expect(amrapSection?.name).toBe('AMRAP');
    expect(amrapSection?.description).toBe('10 Burpees');
    expect(workout.duration).toBe(300);
  });

  it('should get next section correctly', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    
    // During first warm-up, next should be second warm-up
    const nextFromWarmup = workout.getNextSection(10);
    expect(nextFromWarmup?.name).toBe('Arm Circles');
    
    // During AMRAP, next should be cool down
    const nextFromAMRAP = workout.getNextSection(300);
    expect(nextFromAMRAP?.name).toBe('Stretching');
    
    // During last section, should return null
    const nextFromCooldown = workout.getNextSection(660);
    expect(nextFromCooldown).toBeNull();
  });

  it('should have correct description for AMRAP section', () => {
    const workout = new AMRAPWorkout(mockWorkoutData, '2025-08-27');
    const amrapSection = workout.getAMRAPSection();
    
    expect(amrapSection?.description).toBe('5 5 Push-ups, 10 10 Squats, 15 15 Sit-ups');
  });
});