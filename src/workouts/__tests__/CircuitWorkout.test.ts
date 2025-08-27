import { describe, it, expect } from 'vitest';
import { CircuitWorkout } from '../CircuitWorkout';
import { CircuitWorkout as CircuitWorkoutData } from '../types';

describe('CircuitWorkout', () => {
  const mockWorkoutData: CircuitWorkoutData = {
    type: 'circuit',
    warmUp: [
      { name: 'Jumping Jacks', duration: 30 },
      { name: 'Arm Circles', duration: 20 },
    ],
    workout: {
      exercises: [
        { name: 'Push-ups', duration: 40 },
        { name: 'Rest', duration: 20 },
        { name: 'Squats', duration: 40 },
        { name: 'Rest', duration: 20 },
      ],
      rounds: 3,
    },
    coolDown: [
      { name: 'Stretching', duration: 60 },
    ],
  };

  it('should create a circuit workout instance', () => {
    const workout = new CircuitWorkout(mockWorkoutData, '2025-08-27');
    expect(workout).toBeInstanceOf(CircuitWorkout);
    expect(workout.type).toBe('circuit');
    expect(workout.date).toBe('2025-08-27');
  });

  it('should calculate total duration correctly', () => {
    const workout = new CircuitWorkout(mockWorkoutData, '2025-08-27');
    // Warm up: 30 + 20 = 50
    // Workout per round: 40 + 20 + 40 + 20 = 120
    // Total workout: 120 * 3 rounds = 360
    // Cool down: 60
    // Total: 50 + 360 + 60 = 470
    expect(workout.duration).toBe(470);
  });

  it('should return correct section at given time', () => {
    const workout = new CircuitWorkout(mockWorkoutData, '2025-08-27');
    
    // During warm-up
    const warmUpSection = workout.getCurrentSection(10);
    expect(warmUpSection?.name).toBe('Jumping Jacks');
    
    // During first exercise
    const firstExercise = workout.getCurrentSection(60);
    expect(firstExercise?.name).toBe('Push-ups');
    
    // During cool down
    const coolDown = workout.getCurrentSection(420);
    expect(coolDown?.name).toBe('Stretching');
  });

  it('should calculate progress correctly', () => {
    const workout = new CircuitWorkout(mockWorkoutData, '2025-08-27');
    
    expect(workout.getProgress(0)).toBe(0);
    expect(workout.getProgress(235)).toBe(0.5); // Half way through
    expect(workout.getProgress(470)).toBe(1); // Complete
    expect(workout.getProgress(500)).toBe(1); // Beyond duration
  });

  it('should handle multiple rounds correctly', () => {
    const workout = new CircuitWorkout(mockWorkoutData, '2025-08-27');
    
    // First round push-ups (after 50s warm-up)
    const firstRoundPushups = workout.getCurrentSection(50);
    expect(firstRoundPushups?.name).toBe('Push-ups');
    
    // Second round push-ups (after warm-up 50 + first round 120)
    const secondRoundPushups = workout.getCurrentSection(170);
    expect(secondRoundPushups?.name).toBe('Push-ups');
    
    // Third round push-ups (after warm-up 50 + two rounds 240)
    const thirdRoundPushups = workout.getCurrentSection(290);
    expect(thirdRoundPushups?.name).toBe('Push-ups');
  });

  it('should throw error for undefined durations', () => {
    const invalidData: CircuitWorkoutData = {
      type: 'circuit',
      warmUp: [
        { name: 'Invalid Exercise', duration: undefined as any },
      ],
      workout: {
        exercises: [],
        rounds: 1,
      },
      coolDown: [],
    };

    expect(() => new CircuitWorkout(invalidData, '2025-08-27')).toThrow();
  });

  it('should get next section correctly', () => {
    const workout = new CircuitWorkout(mockWorkoutData, '2025-08-27');
    
    // During first warm-up, next should be second warm-up
    const nextFromWarmup = workout.getNextSection(10);
    expect(nextFromWarmup?.name).toBe('Arm Circles');
    
    // During push-ups, next should be rest
    const nextFromPushups = workout.getNextSection(60);
    expect(nextFromPushups?.name).toBe('Rest');
    
    // During last section, should return null
    const nextFromCooldown = workout.getNextSection(420);
    expect(nextFromCooldown).toBeNull();
  });
});