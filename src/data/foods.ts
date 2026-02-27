import { FoodItem } from '../types';

export const FOODS: FoodItem[] = [
  // Proteins
  { id: 'chicken_breast', name: 'Chicken Breast', servingSize: '100g', macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  { id: 'eggs', name: 'Whole Eggs', servingSize: '1 egg', macros: { calories: 78, protein: 6, carbs: 0.6, fat: 5 } },
  { id: 'egg_whites', name: 'Egg Whites', servingSize: '100g', macros: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2 } },
  { id: 'tuna', name: 'Tuna (canned)', servingSize: '100g', macros: { calories: 116, protein: 26, carbs: 0, fat: 1 } },
  { id: 'salmon', name: 'Salmon', servingSize: '100g', macros: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
  { id: 'beef_lean', name: 'Lean Beef', servingSize: '100g', macros: { calories: 218, protein: 26, carbs: 0, fat: 12 } },
  { id: 'whey_protein', name: 'Whey Protein Shake', servingSize: '1 scoop (30g)', macros: { calories: 120, protein: 25, carbs: 3, fat: 2 } },
  { id: 'greek_yogurt', name: 'Greek Yogurt', servingSize: '100g', macros: { calories: 97, protein: 10, carbs: 4, fat: 5 } },
  { id: 'cottage_cheese', name: 'Cottage Cheese', servingSize: '100g', macros: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 } },
  { id: 'turkey', name: 'Turkey Breast', servingSize: '100g', macros: { calories: 135, protein: 30, carbs: 0, fat: 1 } },

  // Carbs
  { id: 'oats', name: 'Oats', servingSize: '100g dry', macros: { calories: 389, protein: 17, carbs: 66, fat: 7 } },
  { id: 'white_rice', name: 'White Rice', servingSize: '100g cooked', macros: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { id: 'brown_rice', name: 'Brown Rice', servingSize: '100g cooked', macros: { calories: 123, protein: 2.6, carbs: 25, fat: 0.9 } },
  { id: 'sweet_potato', name: 'Sweet Potato', servingSize: '100g', macros: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 } },
  { id: 'banana', name: 'Banana', servingSize: '1 medium', macros: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 } },
  { id: 'bread_whole', name: 'Whole Wheat Bread', servingSize: '1 slice (30g)', macros: { calories: 80, protein: 4, carbs: 15, fat: 1 } },
  { id: 'pasta', name: 'Pasta', servingSize: '100g cooked', macros: { calories: 158, protein: 5.8, carbs: 31, fat: 0.9 } },
  { id: 'quinoa', name: 'Quinoa', servingSize: '100g cooked', macros: { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 } },

  // Fats
  { id: 'avocado', name: 'Avocado', servingSize: '100g', macros: { calories: 160, protein: 2, carbs: 9, fat: 15 } },
  { id: 'peanut_butter', name: 'Peanut Butter', servingSize: '2 tbsp (32g)', macros: { calories: 190, protein: 7, carbs: 7, fat: 16 } },
  { id: 'almonds', name: 'Almonds', servingSize: '30g', macros: { calories: 173, protein: 6, carbs: 6, fat: 15 } },
  { id: 'olive_oil', name: 'Olive Oil', servingSize: '1 tbsp (14g)', macros: { calories: 119, protein: 0, carbs: 0, fat: 14 } },

  // Vegetables
  { id: 'broccoli', name: 'Broccoli', servingSize: '100g', macros: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 } },
  { id: 'spinach', name: 'Spinach', servingSize: '100g', macros: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 } },
  { id: 'mixed_veggies', name: 'Mixed Vegetables', servingSize: '100g', macros: { calories: 40, protein: 2, carbs: 8, fat: 0.2 } },
];

export const DEFAULT_DIET_PLANS = {
  cut: { calories: 2000, protein: 180, carbs: 180, fat: 55 },
  bulk: { calories: 3000, protein: 200, carbs: 330, fat: 80 },
  maintain: { calories: 2500, protein: 180, carbs: 270, fat: 70 },
};
