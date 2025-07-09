# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js interval timer application for workout routines. It displays daily workouts and provides timer functionality for various workout formats (Circuit, AMRAP, Tabata, EMOM).

## Development Commands

### Running the Application
```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

### Code Quality
```bash
npm run lint          # Run linting (lenient)
npm run lint:dev      # Run stricter development linting
npm run lint:fix      # Auto-fix linting issues
npm run typecheck     # Run TypeScript type checking
npm run prebuild      # Run both lint and typecheck (used before builds)
```

## Architecture

### Key Patterns
- **Factory Pattern**: `WorkoutFactory` in `/src/workouts/WorkoutFactory.ts` creates workout instances based on type
- **Strategy Pattern**: Different workout types (Circuit, AMRAP, Tabata, EMOM) implement common interfaces
- **Context API**: `WorkoutContext` manages workout state across components

### Directory Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - UI components (WorkoutTimer, CountdownDisplay, etc.)
- `/src/data/` - JSON workout definitions organized by date
- `/src/workouts/` - Core workout logic classes
- `/src/hooks/` - Custom React hooks for audio, speech, and wake lock

### API Routes
- `GET /api/workouts` - Returns all available workouts
- `GET /api/workouts/[date]` - Returns workout for specific date (YYYY-MM-DD format)
- `GET /api/og` - Generates Open Graph images for social sharing

### Adding New Workouts
1. Create JSON file in `/src/data/workouts/YYYY/MM/` with filename `DD.json`
2. Follow existing workout structure with type, warmUp, exercises, and coolDown
3. Supported types: "circuit", "amrap", "tabata", "emom"

### TypeScript Path Aliases
- `@/*` maps to `./src/*` - use this for imports (e.g., `import { Component } from '@/components/Component'`)

### Styling
- Uses Tailwind CSS with custom extended font sizes (text-10xl through text-13xl)
- Dynamic color classes are safelisted in tailwind.config.ts

### Testing Considerations
- No test framework is currently configured
- When adding tests, consider the workout state machine logic in the workout classes
- Timer functionality and state transitions are critical paths

## Workout Types Reference

### Circuit Workouts
- **Structure**: Exercises performed in sequence with specified durations
- **Rounds**: Multiple rounds repeat the entire circuit from start to finish
- **Duration**: Each exercise has a specific duration (e.g., 40 seconds)
- **Example**: 3 rounds of [Push-ups 40s, Rest 20s, Squats 40s, Rest 20s]
- **Implementation**: Sequential execution, total duration = rounds × circuit duration

### AMRAP (As Many Rounds As Possible)
- **Structure**: Perform as many complete rounds of the exercise sequence as possible
- **Duration**: Fixed time limit (e.g., 10 minutes)
- **Rounds**: User completes as many rounds as they can within the time limit
- **Example**: 10 minutes of [5 Push-ups, 10 Squats, 15 Sit-ups] - repeat until time runs out
- **Implementation**: Single continuous section, no predefined rounds

### Tabata
- **Structure**: High-intensity interval training with work/rest cycles
- **Format**: Work duration (e.g., 20s) followed by rest duration (e.g., 10s)
- **Rounds**: Multiple rounds cycle through all exercises with work/rest intervals
- **Example**: 8 rounds of [Squats 20s, Rest 10s, Push-ups 20s, Rest 10s]
- **Implementation**: Creates alternating work/rest sections for each exercise per round

### EMOM (Every Minute on the Minute)
- **Structure**: Perform ALL exercises within each minute, then rest for remaining time
- **Format**: Complete all exercises as fast as possible each minute
- **Rounds**: Each round = 1 minute, repeat for specified number of rounds
- **Example**: 8 rounds (8 minutes) of [5 Burpees, 10 Squats, 8 Push-ups, 10 Mountain Climbers] - do all 4 exercises in minute 1, rest, then all 4 in minute 2, etc.
- **Implementation**: Each minute is one complete round containing all exercises
- **Duration Calculation**: `rounds × 60` seconds (e.g., 8 rounds = 8 minutes = 480 seconds)

## Development Preferences

### Package Management
- Use Bun over npm for faster package management and script execution