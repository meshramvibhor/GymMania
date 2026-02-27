import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutStackNavigator } from './WorkoutStackNavigator';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const icons: Record<string, string> = {
  Home: '🏠',
  Workout: '💪',
  Diet: '🥗',
  Progress: '📈',
};

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icons[name]}</Text>
  </View>
);

const ComingSoon = ({ title }: { title: string }) => (
  <View style={styles.comingSoon}>
    <Text style={styles.pageTitle}>{title}</Text>
    <View style={styles.comingSoonBody}>
      <Text style={styles.comingSoonIcon}>🚧</Text>
      <Text style={styles.comingSoonSub}>Coming soon</Text>
    </View>
  </View>
);

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Workout" focused={focused} /> }}
      />
      <Tab.Screen
        name="Diet"
        children={() => <ComingSoon title="Diet Plan" />}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Diet" focused={focused} /> }}
      />
      <Tab.Screen
        name="Progress"
        children={() => <ComingSoon title="Progress" />}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Progress" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon:      { alignItems: 'center', justifyContent: 'center' },
  tabEmoji:     { fontSize: 20, opacity: 0.5 },
  tabEmojiActive: { opacity: 1 },

  // shared page title style (matches HomeScreen & WorkoutPlanScreen)
  pageTitle:    { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, backgroundColor: Colors.background },

  comingSoon:   { flex: 1, backgroundColor: Colors.background },
  comingSoonBody: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  comingSoonIcon: { fontSize: 48 },
  comingSoonSub:  { fontSize: 14, color: Colors.textMuted },
});
