import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutLog, LoggedExercise, LoggedSet, DietLog, MealLog, DailyLog, MacroNutrients } from '../types';

const STORAGE_KEY = '@gymmania_logs';

const sumMacros = (meals: MealLog[]): MacroNutrients => {
  const total: MacroNutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const meal of meals) {
    for (const item of meal.items) {
      total.calories += item.macros.calories * item.quantity;
      total.protein += item.macros.protein * item.quantity;
      total.carbs += item.macros.carbs * item.quantity;
      total.fat += item.macros.fat * item.quantity;
    }
  }
  return {
    calories: Math.round(total.calories),
    protein: Math.round(total.protein),
    carbs: Math.round(total.carbs),
    fat: Math.round(total.fat),
  };
};

interface LogStore {
  logs: Record<string, DailyLog>; // keyed by date YYYY-MM-DD
  isLoaded: boolean;
  loadLogs: () => Promise<void>;
  saveLogs: () => Promise<void>;
  getLog: (date: string) => DailyLog | undefined;

  // Workout logging
  saveWorkoutLog: (log: WorkoutLog) => void;
  addExerciseToLog: (date: string, exercise: LoggedExercise) => void;
  updateSetInLog: (date: string, exerciseId: string, setIndex: number, updates: Partial<LoggedSet>) => void;
  removeExerciseFromLog: (date: string, exerciseId: string) => void;
  setWorkoutDuration: (date: string, minutes: number) => void;
  setWorkoutMood: (date: string, mood: 1 | 2 | 3 | 4 | 5) => void;
  setWorkoutNotes: (date: string, notes: string) => void;

  // Diet logging
  saveDietLog: (log: DietLog) => void;
  addMealToLog: (date: string, meal: MealLog) => void;

  // Body weight
  setBodyWeight: (date: string, weight: number) => void;
  getRecentBodyWeights: (days: number) => { date: string; weight: number }[];
  getRecentWorkoutLogs: (days: number) => WorkoutLog[];
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const useLogStore = create<LogStore>((set, get) => ({
  logs: {},
  isLoaded: false,

  loadLogs: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ logs: JSON.parse(data), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  saveLogs: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().logs));
    } catch {}
  },

  getLog: (date) => get().logs[date],

  saveWorkoutLog: (log) => {
    set(state => ({
      logs: {
        ...state.logs,
        [log.date]: { ...state.logs[log.date], date: log.date, workoutLog: log },
      },
    }));
    get().saveLogs();
  },

  addExerciseToLog: (date, exercise) => {
    set(state => {
      const dayLog = state.logs[date] || { date };
      const workoutLog: WorkoutLog = dayLog.workoutLog || {
        id: `wl_${date}`,
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) as any,
        exercises: [],
      };
      const existingIdx = workoutLog.exercises.findIndex(e => e.exerciseId === exercise.exerciseId);
      const updatedExercises = existingIdx >= 0
        ? workoutLog.exercises.map((e, i) => i === existingIdx ? exercise : e)
        : [...workoutLog.exercises, exercise];
      return {
        logs: {
          ...state.logs,
          [date]: { ...dayLog, workoutLog: { ...workoutLog, exercises: updatedExercises } },
        },
      };
    });
    get().saveLogs();
  },

  updateSetInLog: (date, exerciseId, setIndex, updates) => {
    set(state => {
      const dayLog = state.logs[date];
      if (!dayLog?.workoutLog) return state;
      return {
        logs: {
          ...state.logs,
          [date]: {
            ...dayLog,
            workoutLog: {
              ...dayLog.workoutLog,
              exercises: dayLog.workoutLog.exercises.map(ex =>
                ex.exerciseId === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((s, i) => i === setIndex ? { ...s, ...updates } : s),
                    }
                  : ex
              ),
            },
          },
        },
      };
    });
    get().saveLogs();
  },

  removeExerciseFromLog: (date, exerciseId) => {
    set(state => {
      const dayLog = state.logs[date];
      if (!dayLog?.workoutLog) return state;
      return {
        logs: {
          ...state.logs,
          [date]: {
            ...dayLog,
            workoutLog: {
              ...dayLog.workoutLog,
              exercises: dayLog.workoutLog.exercises.filter(e => e.exerciseId !== exerciseId),
            },
          },
        },
      };
    });
    get().saveLogs();
  },

  setWorkoutDuration: (date, minutes) => {
    set(state => {
      const dayLog = state.logs[date];
      if (!dayLog?.workoutLog) return state;
      return {
        logs: {
          ...state.logs,
          [date]: { ...dayLog, workoutLog: { ...dayLog.workoutLog, durationMinutes: minutes } },
        },
      };
    });
    get().saveLogs();
  },

  setWorkoutMood: (date, mood) => {
    set(state => {
      const dayLog = state.logs[date];
      if (!dayLog?.workoutLog) return state;
      return {
        logs: {
          ...state.logs,
          [date]: { ...dayLog, workoutLog: { ...dayLog.workoutLog, mood } },
        },
      };
    });
    get().saveLogs();
  },

  setWorkoutNotes: (date, notes) => {
    set(state => {
      const dayLog = state.logs[date];
      if (!dayLog?.workoutLog) return state;
      return {
        logs: {
          ...state.logs,
          [date]: { ...dayLog, workoutLog: { ...dayLog.workoutLog, notes } },
        },
      };
    });
    get().saveLogs();
  },

  saveDietLog: (log) => {
    set(state => ({
      logs: {
        ...state.logs,
        [log.date]: { ...state.logs[log.date], date: log.date, dietLog: log },
      },
    }));
    get().saveLogs();
  },

  addMealToLog: (date, meal) => {
    set(state => {
      const dayLog = state.logs[date] || { date };
      const dietLog: DietLog = dayLog.dietLog || {
        id: `dl_${date}`,
        date,
        meals: [],
        totalMacros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      };
      const existingIdx = dietLog.meals.findIndex(m => m.mealType === meal.mealType);
      const updatedMeals = existingIdx >= 0
        ? dietLog.meals.map((m, i) => i === existingIdx ? meal : m)
        : [...dietLog.meals, meal];
      return {
        logs: {
          ...state.logs,
          [date]: {
            ...dayLog,
            dietLog: { ...dietLog, meals: updatedMeals, totalMacros: sumMacros(updatedMeals) },
          },
        },
      };
    });
    get().saveLogs();
  },

  setBodyWeight: (date, weight) => {
    set(state => ({
      logs: {
        ...state.logs,
        [date]: { ...state.logs[date], date, bodyWeight: weight },
      },
    }));
    get().saveLogs();
  },

  getRecentBodyWeights: (days) => {
    const logs = get().logs;
    const result: { date: string; weight: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (logs[key]?.bodyWeight) {
        result.push({ date: key, weight: logs[key].bodyWeight! });
      }
    }
    return result;
  },

  getRecentWorkoutLogs: (days) => {
    const logs = get().logs;
    const result: WorkoutLog[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (logs[key]?.workoutLog) {
        result.push(logs[key].workoutLog!);
      }
    }
    return result;
  },
}));
