import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietPlan, DietDay, PlannedMeal, DayOfWeek, MacroNutrients } from '../types';

const STORAGE_KEY = '@gymmania_diet_plan';

const DEFAULT_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const createDefaultPlan = (): DietPlan => ({
  id: 'default',
  name: 'My Diet Plan',
  goal: 'Maintain',
  days: DEFAULT_DAYS.map(day => ({
    day,
    meals: [],
    targetCalories: 2500,
    targetMacros: { calories: 2500, protein: 180, carbs: 270, fat: 70 },
  })),
});

interface DietStore {
  plan: DietPlan;
  isLoaded: boolean;
  loadPlan: () => Promise<void>;
  savePlan: () => Promise<void>;
  setGoal: (goal: DietPlan['goal']) => void;
  setDayTargets: (day: DayOfWeek, targets: MacroNutrients) => void;
  addMeal: (day: DayOfWeek, meal: PlannedMeal) => void;
  updateMeal: (day: DayOfWeek, mealType: string, meal: PlannedMeal) => void;
  removeMeal: (day: DayOfWeek, mealType: string) => void;
  getDay: (day: DayOfWeek) => DietDay;
  getDayTotalMacros: (day: DayOfWeek) => MacroNutrients;
}

export const useDietStore = create<DietStore>((set, get) => ({
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

  setGoal: (goal) => {
    const targets: Record<string, MacroNutrients> = {
      Cut: { calories: 2000, protein: 180, carbs: 180, fat: 55 },
      Bulk: { calories: 3000, protein: 200, carbs: 330, fat: 80 },
      Maintain: { calories: 2500, protein: 180, carbs: 270, fat: 70 },
    };
    const target = targets[goal];
    set(state => ({
      plan: {
        ...state.plan,
        goal,
        days: state.plan.days.map(d => ({
          ...d,
          targetCalories: target.calories,
          targetMacros: target,
        })),
      },
    }));
    get().savePlan();
  },

  setDayTargets: (day, targets) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day
            ? { ...d, targetCalories: targets.calories, targetMacros: targets }
            : d
        ),
      },
    }));
    get().savePlan();
  },

  addMeal: (day, meal) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day ? { ...d, meals: [...d.meals, meal] } : d
        ),
      },
    }));
    get().savePlan();
  },

  updateMeal: (day, mealType, meal) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day
            ? { ...d, meals: d.meals.map(m => m.mealType === mealType ? meal : m) }
            : d
        ),
      },
    }));
    get().savePlan();
  },

  removeMeal: (day, mealType) => {
    set(state => ({
      plan: {
        ...state.plan,
        days: state.plan.days.map(d =>
          d.day === day
            ? { ...d, meals: d.meals.filter(m => m.mealType !== mealType) }
            : d
        ),
      },
    }));
    get().savePlan();
  },

  getDay: (day) => get().plan.days.find(d => d.day === day)!,

  getDayTotalMacros: (day) => {
    const dietDay = get().getDay(day);
    const total: MacroNutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of dietDay.meals) {
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
  },
}));
