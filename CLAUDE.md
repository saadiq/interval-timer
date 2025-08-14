# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15 interval timer application for workout routines. Displays daily workouts with timer functionality for Circuit, AMRAP, Tabata, and EMOM workout formats.

## Development Commands

```bash
# Development
bun dev           # Start development server on localhost:3000 (prefer bun over npm)
npm run dev       # Alternative if bun not available

# Build & Production
bun run build     # Production build
bun run start     # Start production server
npm run build:deploy  # Deploy build (disables ESLint warnings)

# Code Quality - IMPORTANT: Run these before marking tasks complete
bun run lint:dev      # Strict development linting (catches unused vars)
bun run lint:fix      # Auto-fix linting issues
bun run typecheck     # TypeScript type checking
bun run prebuild      # Run both strict lint and typecheck

# Standard linting (lenient for deployment)
bun run lint          # Standard Next.js linting
bun run lint:strict   # No warnings allowed
```

## Architecture

### Core Design Patterns
- **Factory Pattern**: `WorkoutFactory` creates workout instances based on type
- **Strategy Pattern**: Workout types (Circuit, AMRAP, Tabata, EMOM) implement `Workout` interface
- **Context API**: `WorkoutContext` manages global workout state

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom extended font sizes (text-10xl to text-13xl)
- **State Management**: React Context API
- **Icons**: Lucide React
- **TypeScript**: Path alias `@/*` maps to `./src/*`

### Directory Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - React UI components
- `/src/workouts/` - Workout logic classes implementing different workout types
- `/src/hooks/` - Custom hooks (audio, speech, wake lock)
- `/src/data/` - Workout JSON definitions

### API Routes
- `GET /api/workouts` - All available workouts
- `GET /api/workouts/[date]` - Specific date workout (YYYY-MM-DD)
- `GET /api/og` - Dynamic OpenGraph image generation

### URL Structure
- Clean URLs: `/2025/07/05` (preferred)
- Legacy: `/?date=2025-07-05` (backwards compatible)
- Workout list: `/workouts`

## Workout Type Implementations

**CRITICAL**: These mechanics must be implemented exactly as specified. Previous Claude instances have misunderstood these patterns.

### Circuit Workouts
- **Structure**: Exercises performed in sequence with specified durations
- **Rounds**: Multiple rounds repeat the ENTIRE circuit from start to finish
- **Duration**: Each exercise has a specific duration (e.g., 40 seconds)
- **Flow**: Round 1: [Ex1→Ex2→Ex3→Rest] → Round 2: [Ex1→Ex2→Ex3→Rest] → Round 3: [Ex1→Ex2→Ex3→Rest]
- **Example**: 3 rounds of [Push-ups 40s, Rest 20s, Squats 40s, Rest 20s]
- **Total Duration**: rounds × sum(all exercise durations)
- **Key Point**: Each round is a complete pass through ALL exercises

### AMRAP (As Many Rounds As Possible)
- **Structure**: Perform as many complete rounds of the exercise sequence as possible
- **Duration**: Fixed time limit (e.g., 10 minutes total)
- **Rounds**: User completes as many rounds as they can within the time limit
- **Flow**: Continuous repetition of exercise sequence until time expires
- **Example**: 10 minutes of [5 Push-ups, 10 Squats, 15 Sit-ups] - repeat entire sequence until time runs out
- **Implementation**: Single continuous section, no predefined rounds
- **Key Point**: User tracks their own round count, timer just counts down total time

### Tabata
- **Structure**: High-intensity interval training with strict work/rest cycles
- **Format**: Work duration (typically 20s) followed by rest duration (typically 10s)
- **Rounds**: Multiple rounds where each round cycles through ALL exercises with work/rest intervals
- **Flow**: Round 1: [Ex1 20s→Rest 10s→Ex2 20s→Rest 10s] → Round 2: [Ex1 20s→Rest 10s→Ex2 20s→Rest 10s]
- **Example**: 8 rounds of [Burpees 20s, Rest 10s, Mountain Climbers 20s, Rest 10s]
- **Total Duration**: rounds × (exercises × (work_duration + rest_duration))
- **Key Point**: EVERY exercise gets work/rest intervals, pattern repeats for specified rounds

### EMOM (Every Minute on the Minute)
- **Structure**: Perform ALL exercises within each minute, then rest for remaining time
- **Format**: Complete all exercises as fast as possible at the start of each minute
- **Rounds**: Each round = 1 minute, repeat for specified number of rounds
- **Flow**: Minute 1: [Do ALL exercises, rest remainder] → Minute 2: [Do ALL exercises, rest remainder]
- **Example**: 8 rounds (8 minutes) of [5 Burpees, 10 Squats, 8 Push-ups, 10 Mountain Climbers]
  - Minute 1: Do all 4 exercises (takes ~40s), rest 20s
  - Minute 2: Do all 4 exercises again (takes ~40s), rest 20s
  - Continue for 8 minutes total
- **Duration Calculation**: rounds × 60 seconds (e.g., 8 rounds = 8 minutes = 480 seconds)
- **Key Points**: 
  - ALL exercises are performed EVERY minute
  - Each minute is one complete round containing all exercises
  - If exercises take longer than 60s, user continues into next minute (advanced)

## Adding Workouts

Create JSON file in `/src/data/workouts/YYYY/MM/DD.json`:

```json
{
  "type": "circuit",
  "warmUp": [
    { "name": "Jumping Jacks", "duration": 30 }
  ],
  "workout": {
    "exercises": [
      { "name": "Push-ups", "duration": 45 },
      { "name": "Rest", "duration": 15 }
    ],
    "rounds": 3
  },
  "coolDown": [
    { "name": "Stretching", "duration": 60 }
  ]
}
```

## Development Guidelines

### ESLint Configurations
- **Production** (`.eslintrc.json`): Lenient for deployment
- **Development** (`.eslintrc.dev.json`): Strict, catches unused variables and any types
- Always use `bun run lint:dev` during development

### Before Completing Tasks
1. Run `bun run lint:dev` to catch all issues
2. Run `bun run typecheck` for type safety
3. Fix any errors before marking tasks complete

### Package Management
- **Preferred**: Use `bun` for all operations (faster)
- **Fallback**: `npm` if bun unavailable

### Testing
- No test framework currently configured
- Critical paths: workout state machines, timer functionality, state transitions