import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useLogStore } from '../store/logStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DayOfWeek } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAYS_BACK = 7;

const getDateRange = () => {
  const days: { date: string; day: DayOfWeek; label: string }[] = [];
  const today = new Date();
  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    const day = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) as DayOfWeek;
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ date, day, label });
  }
  return days;
};

export const DailyLogScreen = () => {
  const navigation = useNavigation<Nav>();
  const { logs } = useLogStore();
  const dateRange = getDateRange();
  const [selected, setSelected] = useState(dateRange[dateRange.length - 1]);

  const log = logs[selected.date];
  const workoutLog = log?.workoutLog;
  const dietLog = log?.dietLog;

  const totalSets = workoutLog?.exercises.reduce((a, e) => a + e.sets.length, 0) ?? 0;
  const completedSets = workoutLog?.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0) ?? 0;
  const totalVolume = workoutLog?.exercises.reduce(
    (a, e) => a + e.sets.filter(s => s.completed).reduce((sa, s) => sa + s.weight * s.reps, 0), 0
  ) ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Date Picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={styles.dateScrollContent}>
        {dateRange.map(d => (
          <TouchableOpacity
            key={d.date}
            style={[styles.datePill, selected.date === d.date && styles.datePillActive]}
            onPress={() => setSelected(d)}
          >
            <Text style={[styles.datePillDay, selected.date === d.date && styles.datePillTextActive]}>{d.day}</Text>
            <Text style={[styles.datePillLabel, selected.date === d.date && styles.datePillTextActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Body Weight */}
      {log?.bodyWeight ? (
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>⚖️ Body Weight</Text>
          <Text style={styles.statValue}>{log.bodyWeight} kg</Text>
        </View>
      ) : null}

      {/* Workout Log Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>💪 Workout Log</Text>
          <TouchableOpacity
            style={styles.openBtn}
            onPress={() => navigation.navigate('LogWorkout', { date: selected.date, day: selected.day })}
          >
            <Text style={styles.openBtnText}>{workoutLog ? 'Edit' : 'Log'}</Text>
          </TouchableOpacity>
        </View>

        {workoutLog && workoutLog.exercises.length > 0 ? (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{workoutLog.exercises.length}</Text>
                <Text style={styles.statBoxLabel}>Exercises</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{completedSets}/{totalSets}</Text>
                <Text style={styles.statBoxLabel}>Sets Done</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : '—'}</Text>
                <Text style={styles.statBoxLabel}>Volume</Text>
              </View>
              {workoutLog.mood ? (
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>{'😞😐🙂😊🔥'[workoutLog.mood - 1]}</Text>
                  <Text style={styles.statBoxLabel}>Mood</Text>
                </View>
              ) : null}
            </View>

            {workoutLog.exercises.map(ex => {
              const done = ex.sets.filter(s => s.completed).length;
              return (
                <View key={ex.exerciseId} style={styles.exSummary}>
                  <Text style={styles.exSummaryName}>{ex.exerciseName}</Text>
                  <View style={styles.exSummarySets}>
                    {ex.sets.map((s, i) => (
                      <View key={i} style={[styles.setDot, s.completed && styles.setDotDone]}>
                        <Text style={styles.setDotText}>{s.completed ? `${s.weight}×${s.reps}` : '—'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {workoutLog.notes ? (
              <Text style={styles.notesText}>📝 {workoutLog.notes}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.emptyText}>No workout logged for this day</Text>
        )}
      </View>

      {/* Diet Log Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🥗 Nutrition Log</Text>

        {dietLog && dietLog.meals.length > 0 ? (
          <>
            <View style={styles.macroSummary}>
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{dietLog.totalMacros.calories}</Text>
                <Text style={styles.macroLbl}>kcal</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{dietLog.totalMacros.protein}g</Text>
                <Text style={styles.macroLbl}>Protein</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{dietLog.totalMacros.carbs}g</Text>
                <Text style={styles.macroLbl}>Carbs</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroVal}>{dietLog.totalMacros.fat}g</Text>
                <Text style={styles.macroLbl}>Fat</Text>
              </View>
            </View>

            {dietLog.meals.map((meal, i) => (
              <View key={i} style={styles.mealRow}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
                <Text style={styles.mealItems}>
                  {meal.items.map(item => item.foodName).join(', ')}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyText}>No meals logged for this day</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  dateScroll: { maxHeight: 72 },
  dateScrollContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  datePill: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 64,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePillActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primary },
  datePillDay: { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },
  datePillLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  datePillTextActive: { color: Colors.primary },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: Colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textSecondary, fontSize: 14 },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: Colors.card, borderRadius: 16, margin: 16, marginTop: 0, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  openBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  openBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: 10, padding: 10, alignItems: 'center' },
  statBoxValue: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  statBoxLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  exSummary: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  exSummaryName: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  exSummarySets: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  setDot: { backgroundColor: Colors.surfaceLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  setDotDone: { backgroundColor: Colors.success + '25', borderWidth: 1, borderColor: Colors.success + '60' },
  setDotText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  notesText: { color: Colors.textMuted, fontSize: 13, marginTop: 10, fontStyle: 'italic' },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  macroSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  macroItem: { flex: 1, alignItems: 'center' },
  macroVal: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  macroLbl: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  macroDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  mealRow: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  mealType: { color: Colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  mealItems: { color: Colors.textSecondary, fontSize: 13 },
});
