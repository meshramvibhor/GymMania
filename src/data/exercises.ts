import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench_press', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'incline_bench', name: 'Incline Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'decline_bench', name: 'Decline Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'dumbbell_fly', name: 'Dumbbell Fly', muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { id: 'cable_fly', name: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable' },
  { id: 'push_up', name: 'Push Up', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { id: 'chest_dip', name: 'Chest Dip', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { id: 'pec_deck', name: 'Pec Deck Machine', muscleGroup: 'Chest', equipment: 'Machine' },

  // Back
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'pull_up', name: 'Pull Up', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
  { id: 'bent_row', name: 'Bent-Over Row', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'seated_row', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable' },
  { id: 'tbar_row', name: 'T-Bar Row', muscleGroup: 'Back', equipment: 'Machine' },
  { id: 'face_pull', name: 'Face Pull', muscleGroup: 'Back', equipment: 'Cable' },
  { id: 'db_row', name: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbells' },

  // Shoulders
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { id: 'db_shoulder_press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'lateral_raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'front_raise', name: 'Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'arnold_press', name: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },

  // Arms
  { id: 'barbell_curl', name: 'Barbell Curl', muscleGroup: 'Arms', equipment: 'Barbell' },
  { id: 'db_curl', name: 'Dumbbell Curl', muscleGroup: 'Arms', equipment: 'Dumbbells' },
  { id: 'hammer_curl', name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbells' },
  { id: 'preacher_curl', name: 'Preacher Curl', muscleGroup: 'Arms', equipment: 'Machine' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cable' },
  { id: 'skull_crusher', name: 'Skull Crusher', muscleGroup: 'Arms', equipment: 'Barbell' },
  { id: 'overhead_tricep', name: 'Overhead Tricep Extension', muscleGroup: 'Arms', equipment: 'Dumbbells' },
  { id: 'tricep_dip', name: 'Tricep Dip', muscleGroup: 'Arms', equipment: 'Bodyweight' },

  // Legs
  { id: 'squat', name: 'Barbell Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'leg_press', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
  { id: 'lunges', name: 'Lunges', muscleGroup: 'Legs', equipment: 'Bodyweight' },
  { id: 'leg_extension', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine' },
  { id: 'leg_curl', name: 'Leg Curl', muscleGroup: 'Legs', equipment: 'Machine' },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'calf_raise', name: 'Calf Raise', muscleGroup: 'Legs', equipment: 'Machine' },
  { id: 'hip_thrust', name: 'Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'goblet_squat', name: 'Goblet Squat', muscleGroup: 'Legs', equipment: 'Dumbbells' },
  { id: 'sumo_deadlift', name: 'Sumo Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },

  // Core
  { id: 'crunch', name: 'Crunch', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'plank', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'leg_raise', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'russian_twist', name: 'Russian Twist', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Core', equipment: 'Equipment' },
  { id: 'cable_crunch', name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cable' },

  // Cardio
  { id: 'treadmill', name: 'Treadmill', muscleGroup: 'Cardio', equipment: 'Machine' },
  { id: 'cycling', name: 'Stationary Bike', muscleGroup: 'Cardio', equipment: 'Machine' },
  { id: 'jump_rope', name: 'Jump Rope', muscleGroup: 'Cardio', equipment: 'Equipment' },
  { id: 'burpees', name: 'Burpees', muscleGroup: 'Cardio', equipment: 'Bodyweight' },
  { id: 'stair_climber', name: 'Stair Climber', muscleGroup: 'Cardio', equipment: 'Machine' },
];

export const EXERCISES_BY_GROUP = EXERCISES.reduce((acc, ex) => {
  if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = [];
  acc[ex.muscleGroup].push(ex);
  return acc;
}, {} as Record<string, Exercise[]>);

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body',
] as const;
