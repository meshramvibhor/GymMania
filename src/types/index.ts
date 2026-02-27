export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  description?: string;
}

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Core'
  | 'Cardio'
  | 'Full Body';

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number; // kg
  notes?: string;
}

export interface WorkoutDay {
  day: DayOfWeek;
  name: string; // e.g. "Push Day", "Leg Day"
  exercises: PlannedExercise[];
  isRestDay: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  days: WorkoutDay[];
}

// Diet Types
export interface MacroNutrients {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
}

export interface FoodItem {
  id: string;
  name: string;
  macros: MacroNutrients;
  servingSize: string; // e.g. "100g", "1 cup"
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Pre-Workout' | 'Post-Workout';

export interface PlannedMeal {
  mealType: MealType;
  items: {
    foodId: string;
    foodName: string;
    quantity: number; // number of servings
    macros: MacroNutrients;
  }[];
}

export interface DietDay {
  day: DayOfWeek;
  meals: PlannedMeal[];
  targetCalories: number;
  targetMacros: MacroNutrients;
}

export interface DietPlan {
  id: string;
  name: string;
  goal: 'Cut' | 'Bulk' | 'Maintain';
  days: DietDay[];
}

// Daily Log Types
export interface LoggedSet {
  setNumber: number;
  weight: number; // kg
  reps: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  day: DayOfWeek;
  planName?: string;
  exercises: LoggedExercise[];
  durationMinutes?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface MealLog {
  mealType: MealType;
  items: {
    foodName: string;
    quantity: number;
    macros: MacroNutrients;
  }[];
}

export interface DietLog {
  id: string;
  date: string;
  meals: MealLog[];
  totalMacros: MacroNutrients;
  waterIntakeLiters?: number;
}

export interface DailyLog {
  date: string;
  workoutLog?: WorkoutLog;
  dietLog?: DietLog;
  bodyWeight?: number;
  notes?: string;
}
