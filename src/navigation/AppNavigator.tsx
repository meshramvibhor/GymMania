import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { LogWorkoutScreen } from '../screens/LogWorkoutScreen';
import { ExercisePickerScreen } from '../screens/ExercisePickerScreen';
import { DietDayScreen } from '../screens/DietDayScreen';
import { sharedHeaderOptions } from './WorkoutStackNavigator';
import { Colors } from '../theme/colors';
import { DayOfWeek } from '../types';

export type RootStackParamList = {
  Main: undefined;
  LogWorkout: { date: string; day: DayOfWeek };
  ExercisePicker: { day: DayOfWeek; mode: 'plan' | 'log'; date?: string };
  DietDay: { day: DayOfWeek };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          ...sharedHeaderOptions,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: 'Log Workout' }} />
        <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: 'Pick Exercise' }} />
        <Stack.Screen name="DietDay" component={DietDayScreen} options={({ route }) => ({ title: route.params.day + ' Diet Plan' })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
