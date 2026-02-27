import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlan, WorkoutDay, PlannedExercise, DayOfWeek } from '../types';

const STORAGE_KEY = '@gymmania_workout_plan';

const DEFAULT_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const createDefaultPlan = (): WorkoutPlan => ({
  id: 'default',
  name: 'My Workout Plan',
  days: DEFAULT_DAYS.map(day => ({
    day,
    name: '',
    exercises: [],
    isRestDay: day === 'Sun',
  })),
});

interface WorkoutStore {
  plan: WorkoutPlan;
  isLoaded: boolean;
  loadPlan: () => Promise<void>;
  savePlan: () => Promise<void>;
  updateDayName: (day: DayOfWeek, name: string) => void;
  toggleRestDay: (day: DayOfWeek) => void;
  addExercise: (day: DayOfWeek, exercise: PlannedExercise) => void;
  updateExercise: (day: DayOfWeek, exerciseId: string, updates: Partial<PlannedExercise>) => void;
  removeExercise: (day: DayOfWeek, exerciseId: string) => void;
  reorderExercises: (day: DayOfWeek, exercises: PlannedExercise[]) => void;
  getDay: (day: DayOfWeek) => WorkoutDay;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  plan: createDefaultPlan(),
  isLoaded: false,

  loadPlan: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ plan: JSON.parse(data), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  savePlan: async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().plan));
    } catch {}
  },

  updateDayName: (day, name) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d => d.day === day ? { ...d, name } : d),
      },
    }));
    get().savePlan();
  },

  toggleRestDay: (day) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day ? { ...d, isRestDay: !d.isRestDay, exercises: [] } : d
        ),
      },
    }));
    get().savePlan();
  },

  addExercise: (day, exercise) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day ? { ...d, exercises: [...d.exercises, exercise] } : d
        ),
      },
    }));
    get().savePlan();
  },

  updateExercise: (day, exerciseId, updates) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day
            ? {
                ...d,
                exercises: d.exercises.map(ex =>
                  ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
                ),
              }
            : d
        ),
      },
    }));
    get().savePlan();
  },

  removeExercise: (day, exerciseId) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day
            ? { ...d, exercises: d.exercises.filter(ex => ex.exerciseId !== exerciseId) }
            : d
        ),
      },
    }));
    get().savePlan();
  },

  reorderExercises: (day, exercises) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d => d.day === day ? { ...d, exercises } : d),
      },
    }));
    get().savePlan();
  },

  getDay: (day) => {
    return get().plan.days.find(d => d.day === day)!;
  },
}));
