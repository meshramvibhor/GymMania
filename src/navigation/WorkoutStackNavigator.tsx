import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutPlanScreen } from '../screens/WorkoutPlanScreen';
import { WorkoutDayScreen } from '../screens/WorkoutDayScreen';
import { ExerciseLogScreen } from '../screens/ExerciseLogScreen';
import { ExercisePickerScreen } from '../screens/ExercisePickerScreen';
import { Colors } from '../theme/colors';
import { DayOfWeek } from '../types';

export const sharedHeaderOptions = {
  headerStyle:        { backgroundColor: Colors.surface },
  headerTintColor:    Colors.text,
  headerTitleStyle:   { color: Colors.text, fontWeight: '800' as const, fontSize: 18 },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

export type WorkoutStackParamList = {
  WorkoutPlan: undefined;
  WorkoutDay: { day: DayOfWeek };
  ExerciseLog: {
    exerciseId: string;
    exerciseName: string;
    day: DayOfWeek;
    targetSets?: number;
    targetReps?: number;
    targetWeight?: number;
  };
  ExercisePicker: { day: DayOfWeek; mode: 'plan' | 'log'; date?: string };
};

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export const WorkoutStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...sharedHeaderOptions,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="WorkoutPlan"
        component={WorkoutPlanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutDay"
        component={WorkoutDayScreen}
        options={({ route }) => ({ title: route.params.day + ' Workout' })}
      />
      <Stack.Screen
        name="ExerciseLog"
        component={ExerciseLogScreen}
        options={({ route }) => ({ title: route.params.exerciseName })}
      />
      <Stack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{ title: 'Pick Exercise' }}
      />
    </Stack.Navigator>
  );
};
