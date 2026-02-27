import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useWorkoutStore } from '../store/workoutStore';
import { WorkoutStackParamList } from '../navigation/WorkoutStackNavigator';
import { DayOfWeek } from '../types';

type Nav = NativeStackNavigationProp<WorkoutStackParamList>;

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FULL_NAMES: Record<DayOfWeek, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const getTodayDay = (): DayOfWeek =>
  new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) as DayOfWeek;

export const WorkoutPlanScreen = () => {
  const navigation = useNavigation<Nav>();
  const { plan }   = useWorkoutStore();
  const today      = getTodayDay();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Workout Plan</Text>

      {DAYS.map(day => {
        const dayData = plan.days.find(d => d.day === day)!;
        const isToday = day === today;
        const color   = Colors.days[day];
        const count   = dayData.exercises.length;

        return (
          <TouchableOpacity
            key={day}
            style={[styles.card, isToday && styles.cardToday]}
            onPress={() => navigation.navigate('WorkoutDay', { day })}
            activeOpacity={0.7}
          >
            {/* Colored left bar */}
            <View style={[styles.bar, { backgroundColor: color }]} />

            {/* Day icon badge */}
            <View style={[styles.iconBadge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.iconBadgeText, { color }]}>
                {day.slice(0, 2).toUpperCase()}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.body}>
              <Text style={[styles.dayFull, isToday && { color }]}>{FULL_NAMES[day]}</Text>
              {dayData.name ? (
                <Text style={styles.planName}>{dayData.name}</Text>
              ) : null}
              {!dayData.isRestDay && (
                <Text style={styles.exCount}>
                  {count > 0 ? `${count} exercise${count > 1 ? 's' : ''}` : 'No exercises yet'}
                </Text>
              )}
            </View>

            {/* Right side */}
            <View style={styles.right}>
              {isToday && (
                <View style={[styles.todayBadge, { backgroundColor: color + '22', borderColor: color + '60' }]}>
                  <Text style={[styles.todayText, { color }]}>TODAY</Text>
                </View>
              )}
              {dayData.isRestDay && (
                <View style={styles.restBadge}>
                  <Text style={styles.restText}>REST</Text>
                </View>
              )}
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { paddingHorizontal: 20, paddingBottom: 32 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, paddingTop: 20, marginBottom: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 72,
  },
  cardToday: {
    backgroundColor: Colors.card,
    borderColor: Colors.borderLight,
  },

  bar: { width: 3, alignSelf: 'stretch' },

  iconBadge:     { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 14 },
  iconBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  body:     { flex: 1, paddingHorizontal: 14, paddingVertical: 16 },
  dayFull:  { fontSize: 17, fontWeight: '800', color: Colors.text, letterSpacing: -0.2 },
  planName: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  exCount:  { fontSize: 12, color: Colors.textSecondary, marginTop: 3, fontWeight: '600' },

  right:      { flexDirection: 'row', alignItems: 'center', paddingRight: 14, gap: 8 },
  todayBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  todayText:  { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  restBadge:  { backgroundColor: Colors.surfaceLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  restText:   { color: Colors.textMuted, fontSize: 9, fontWeight: '800' },
  chevron:    { color: Colors.textMuted, fontSize: 22 },
});
