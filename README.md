# Interval Timer

A customizable workout interval timer application built with Next.js that supports various workout formats including circuits, AMRAP (As Many Rounds As Possible), Tabata, and EMOM (Every Minute On the Minute).

## Description

This application helps you time and track different types of workouts with customizable intervals. It includes:

- Support for multiple workout formats:
  - **Circuit workouts**: Perform exercises in sequence for a set number of rounds
  - **AMRAP workouts**: Complete as many rounds as possible in a set time
  - **Tabata workouts**: High-intensity intervals with short rest periods
  - **EMOM workouts**: Perform a specific exercise at the start of each minute
- Pre-loaded workout plans
- Kettlebell-specific workouts
- Visual timers and progress tracking
- Mobile-friendly design
- Comprehensive workout calendar with detailed workout information

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/interval-timer.git
   cd interval-timer
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How to Use

### Navigating the Application

- **Home Page**: Shows today's workout by default
- **All Workouts**: Access the complete list of available workouts organized by month

### Selecting a Workout

1. Navigate to the "All Workouts" page to see all available workout dates.
2. Each workout card displays:
   - Date of the workout
   - Workout type (Circuit, AMRAP, Tabata, or EMOM)
   - Total duration
   - Number of exercises
   - List of primary exercises
3. Click on a workout card to select that workout.
4. Review the workout details including type, exercises, and duration.
5. If a workout doesn't exist for a specific date, you'll be directed to the "All Workouts" page.

### During a Workout

1. Press the "Start" button to begin the workout.
2. The timer will guide you through:
   - Warm-up sections
   - Main workout with appropriate intervals based on the workout type
   - Cool-down sections
3. For each exercise:
   - The current exercise name is prominently displayed
   - A progress bar shows time remaining
   - Audio cues signal transitions between exercises

### Workout Types

- **Circuit**: Follow the sequence of exercises for the specified number of rounds
- **AMRAP**: Complete as many rounds as possible within the time limit
- **Tabata**: Perform exercises for short work intervals (typically 20 seconds) followed by brief rest periods (typically 10 seconds)
- **EMOM**: Perform the specified exercise at the beginning of each minute, then rest for the remainder of the minute

### Adding Custom Workouts

Custom workouts can be added by modifying the `src/data/workouts.json` file. Follow the existing format for each workout type.

## Development

### Project Structure

- `src/app`: Next.js application pages and API routes
- `src/components`: React components for the UI
- `src/data`: Workout data in JSON format
- `src/workouts`: TypeScript classes for different workout types
- `src/styles`: CSS and styling

### API Routes

- `GET /api/workouts`: Returns all available workout dates with detailed information
- `GET /api/workouts/[date]`: Returns workout details for a specific date

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)

# Linting and Code Quality

This project uses ESLint for code quality and TypeScript for type checking. There are two ESLint configurations:

1. **Production Configuration** (`.eslintrc.json`): A lenient configuration that allows the build to pass even with some warnings or unused variables. This is used for deployment.

2. **Development Configuration** (`.eslintrc.dev.json`): A stricter configuration that catches more issues during development, including unused variables and any types.

## Linting Commands

- `npm run lint`: Run the standard Next.js linting
- `npm run lint:strict`: Run linting with no warnings allowed
- `npm run lint:fix`: Automatically fix linting issues where possible
- `npm run lint:dev`: Run linting with the stricter development configuration
- `npm run typecheck`: Run TypeScript type checking
- `npm run prebuild`: Run both linting and type checking (used before build)

## VS Code Integration

The VS Code settings are configured to use the development ESLint configuration and show linting errors in real-time. This helps catch issues early during development.

## Deployment

For deployment, the production ESLint configuration is used, which is more lenient to allow the build to pass. If you want to deploy with strict linting, you can run `npm run lint:strict` before deploying to catch any issues.
