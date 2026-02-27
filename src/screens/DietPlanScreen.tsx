import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useDietStore } from '../store/dietStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DayOfWeek } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getTodayDay = (): DayOfWeek => {
  const name = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  return name.slice(0, 3) as DayOfWeek;
};

const GOAL_COLORS = {
  Cut: Colors.error,
  Bulk: Colors.success,
  Maintain: Colors.info,
};

const MacroCircle = ({ label, value, target, color }: { label: string; value: number; target: number; color: string }) => {
  const pct = Math.min(Math.round((value / target) * 100), 100);
  return (
    <View style={circle.container}>
      <Text style={[circle.value, { color }]}>{value}g</Text>
      <Text style={circle.label}>{label}</Text>
      <Text style={circle.target}>/{target}g</Text>
    </View>
  );
};

export const DietPlanScreen = () => {
  const navigation = useNavigation<Nav>();
  const { plan, setGoal } = useDietStore();
  const today = getTodayDay();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Goal Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Goal</Text>
        <View style={styles.goalRow}>
          {(['Cut', 'Bulk', 'Maintain'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.goalBtn, plan.goal === g && { backgroundColor: GOAL_COLORS[g] + '30', borderColor: GOAL_COLORS[g] }]}
              onPress={() => setGoal(g)}
            >
              <Text style={[styles.goalBtnText, plan.goal === g && { color: GOAL_COLORS[g] }]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Macro Overview */}
      {plan.days.map(dayData => {
        const isToday = dayData.day === today;
        const totalMacros = useDietStore.getState().getDayTotalMacros(dayData.day);
        const target = dayData.targetMacros;
        const mealCount = dayData.meals.length;
        const calPct = Math.min(Math.round((totalMacros.calories / target.calories) * 100), 100);

        return (
          <TouchableOpacity
            key={dayData.day}
            style={[styles.dayCard, isToday && styles.dayCardToday]}
            onPress={() => navigation.navigate('DietDay', { day: dayData.day })}
            activeOpacity={0.75}
          >
            <View style={styles.dayTop}>
              <View style={styles.dayTitleRow}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{dayData.day}</Text>
                {isToday && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>TODAY</Text></View>}
              </View>
              <View style={styles.calRow}>
                <Text style={styles.calValue}>{totalMacros.calories}</Text>
                <Text style={styles.calSep}>/</Text>
                <Text style={styles.calTarget}>{target.calories}</Text>
                <Text style={styles.calUnit}>kcal</Text>
              </View>
            </View>

            {/* Calorie Progress Bar */}
            <View style={styles.calBar}>
              <View style={[styles.calBarFill, { width: `${calPct}%` as any, backgroundColor: isToday ? Colors.primary : Colors.accent }]} />
            </View>

            {/* Macros */}
            <View style={styles.macroRowSmall}>
              <Text style={styles.macroSmall}>🥩 {totalMacros.protein}g / {target.protein}g P</Text>
              <Text style={styles.macroSmall}>🌾 {totalMacros.carbs}g / {target.carbs}g C</Text>
              <Text style={styles.macroSmall}>🧈 {totalMacros.fat}g / {target.fat}g F</Text>
            </View>

            <View style={styles.dayBottom}>
              <Text style={styles.mealCount}>{mealCount} meals planned</Text>
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
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  goalRow: { flexDirection: 'row', gap: 10 },
  goalBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  goalBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  dayCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  dayCardToday: { borderColor: Colors.primary, backgroundColor: '#1F1010' },
  dayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayLabel: { fontSize: 18, fontWeight: '800', color: Colors.text },
  dayLabelToday: { color: Colors.primary },
  todayBadge: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  todayBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  calRow: { flexDirection: 'row', alignItems: 'baseline' },
  calValue: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  calSep: { color: Colors.textMuted, fontSize: 14, marginHorizontal: 2 },
  calTarget: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  calUnit: { color: Colors.textMuted, fontSize: 11, marginLeft: 3 },
  calBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  calBarFill: { height: '100%', borderRadius: 2 },
  macroRowSmall: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  macroSmall: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  dayBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealCount: { color: Colors.textMuted, fontSize: 12 },
  chevron: { color: Colors.textMuted, fontSize: 20 },
});

const circle = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  target: { color: Colors.textMuted, fontSize: 10 },
});
