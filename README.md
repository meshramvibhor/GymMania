# GymMania 💪

A personal gym companion app built with **React Native** for tracking workouts and staying consistent.

---

## Features

- **Workout Plan** — Set up your weekly workout schedule (Mon–Sun), add exercises per day with target sets, reps, and weight
- **Exercise Logging** — Tap any exercise to log your sets with weight and reps. Each set is added one by one
- **Session History** — View your previous logged sessions per exercise with best weight, volume, and individual sets
- **Performance Comparison** — Compare your current session against your last session (volume, reps, avg weight) with delta indicators
- **Home Dashboard** — See today's workout summary, calorie overview, weekly strip at a glance
- **Diet & Progress** — Coming soon

---

## Tech Stack

| | |
|---|---|
| Framework | React Native 0.84 (CLI) |
| Language | TypeScript |
| Navigation | React Navigation (Bottom Tabs + Native Stack) |
| State Management | Zustand |
| Persistence | AsyncStorage |
| Platform | Android |

---

## Screens

```
Home          — Daily snapshot (workout done, calories, week overview)
Workout Plan  — Weekly day tiles with exercise count
Workout Day   — Exercise list for a specific day (add / edit / remove)
Exercise Log  — Log sets for a single exercise + history
Exercise Picker — Browse and add exercises to a day or log
Diet          — Coming soon
Progress      — Coming soon
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Android Studio + Android SDK
- JDK 17
- React Native CLI

### Install & Run

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android (in a separate terminal)
npm run android
```

> Make sure an Android emulator is running or a physical device is connected via USB with Developer Mode enabled.

---

## Project Structure

```
src/
├── navigation/
│   ├── AppNavigator.tsx          # Root stack navigator
│   ├── BottomTabNavigator.tsx    # Bottom tab bar
│   └── WorkoutStackNavigator.tsx # Workout nested stack
├── screens/
│   ├── HomeScreen.tsx
│   ├── WorkoutPlanScreen.tsx
│   ├── WorkoutDayScreen.tsx
│   ├── ExerciseLogScreen.tsx
│   └── ExercisePickerScreen.tsx
├── store/
│   ├── workoutStore.ts           # Zustand — workout plan state
│   ├── logStore.ts               # Zustand — daily logs state
│   └── dietStore.ts              # Zustand — diet plan state
├── theme/
│   └── colors.ts                 # Dark theme color palette
├── types/
│   └── index.ts                  # TypeScript interfaces
└── data/
    ├── exercises.ts              # Exercise library seed data
    └── foods.ts                  # Food items seed data
```

---

## Color Palette

The app uses a refined dark theme with indigo as the primary accent:

| Token | Value | Usage |
|---|---|---|
| `background` | `#09090C` | Screen backgrounds |
| `card` | `#16161D` | Card surfaces |
| `primary` | `#6366F1` | Buttons, active states, highlights |
| `accent` | `#EC4899` | Contrast highlights |
| `success` | `#22C55E` | Positive deltas |
| `error` | `#EF4444` | Negative deltas, remove actions |

---

## License

MIT
