import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';
import { useWorkoutStore } from '../store/workoutStore';
import { useDietStore } from '../store/dietStore';
import { useLogStore } from '../store/logStore';
import { DayOfWeek } from '../types';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getTodayKey = (): { date: string; day: DayOfWeek } => {
  const now  = new Date();
  const date = now.toISOString().split('T')[0];
  const day  = now.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) as DayOfWeek;
  return { date, day };
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ── Section label ──────────────────────────────────────────
const SectionLabel = ({ text }: { text: string }) => (
  <Text style={s.sectionLabel}>{text}</Text>
);

// ── Stat cell ──────────────────────────────────────────────
const StatCell = ({ value, label, color }: { value: string; label: string; color?: string }) => (
  <View style={s.statCell}>
    <Text style={[s.statVal, color ? { color } : {}]}>{value}</Text>
    <Text style={s.statLbl}>{label}</Text>
  </View>
);

const Divider = () => <View style={s.divider} />;

export const HomeScreen = () => {
  const { plan: workoutPlan, loadPlan: loadWorkout } = useWorkoutStore();
  const { plan: dietPlan, loadPlan: loadDiet }       = useDietStore();
  const { loadLogs, getLog }                          = useLogStore();

  useEffect(() => {
    loadWorkout();
    loadDiet();
    loadLogs();
  }, []);

  const { date, day } = getTodayKey();
  const todayLog      = getLog(date);
  const workoutLog    = todayLog?.workoutLog;
  const dietLog       = todayLog?.dietLog;
  const todayDiet     = dietPlan.days.find(d => d.day === day);
  const todayWorkout  = workoutPlan.days.find(d => d.day === day);

  const caloriesEaten  = dietLog?.totalMacros.calories ?? 0;
  const caloriesTarget = todayDiet?.targetMacros.calories ?? 0;
  const caloriePct     = caloriesTarget > 0 ? Math.min((caloriesEaten / caloriesTarget) * 100, 100) : 0;
  const proteinEaten   = dietLog?.totalMacros.protein ?? 0;
  const carbsEaten     = dietLog?.totalMacros.carbs ?? 0;
  const fatEaten       = dietLog?.totalMacros.fat ?? 0;
  const proteinTarget  = todayDiet?.targetMacros.protein ?? 0;
  const carbsTarget    = todayDiet?.targetMacros.carbs ?? 0;
  const fatTarget      = todayDiet?.targetMacros.fat ?? 0;

  const exercisesDone = workoutLog?.exercises.length ?? 0;
  const completedSets = workoutLog?.exercises.reduce((a, e) => a + e.sets.filter(x => x.completed).length, 0) ?? 0;
  const totalVolume   = workoutLog?.exercises.reduce((a, e) => a + e.sets.filter(x => x.completed).reduce((b, x) => b + x.weight * x.reps, 0), 0) ?? 0;
  const workoutDone   = exercisesDone > 0;
  const isRestDay     = todayWorkout?.isRestDay ?? false;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <Text style={s.pageTitle}>GymMania</Text>
      <View style={s.header}>
        <Text style={s.greeting}>
          {greeting()} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
        <View style={s.goalPill}>
          <Text style={s.goalPillText}>{dietPlan.goal}</Text>
        </View>
      </View>

      {/* ── Calories Card ── */}
      <View style={s.card}>
        <SectionLabel text="CALORIES" />

        <View style={s.calRow}>
          <View>
            <Text style={s.calBig}>{caloriesEaten}</Text>
            {caloriesTarget > 0 && (
              <Text style={s.calTarget}>of {caloriesTarget} kcal goal</Text>
            )}
          </View>
          {caloriesTarget > 0 && (
            <View style={s.calRing}>
              <Text style={s.calRingPct}>{Math.round(caloriePct)}%</Text>
            </View>
          )}
        </View>

        {caloriesTarget > 0 && (
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${caloriePct}%` as any }]} />
          </View>
        )}

        <View style={s.macroRow}>
          <StatCell value={`${proteinEaten}g`} label={`Protein${proteinTarget > 0 ? ` / ${proteinTarget}g` : ''}`} color={Colors.primary} />
          <Divider />
          <StatCell value={`${carbsEaten}g`} label={`Carbs${carbsTarget > 0 ? ` / ${carbsTarget}g` : ''}`} color={Colors.info} />
          <Divider />
          <StatCell value={`${fatEaten}g`} label={`Fat${fatTarget > 0 ? ` / ${fatTarget}g` : ''}`} color={Colors.accent} />
        </View>
      </View>

      {/* ── Workout Card ── */}
      <View style={s.card}>
        <SectionLabel text="TODAY'S WORKOUT" />

        {isRestDay ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconBox}>
              <Text style={s.emptyIcon}>😴</Text>
            </View>
            <Text style={s.emptyTitle}>Rest Day</Text>
            <Text style={s.emptySub}>Recovery is part of the plan</Text>
          </View>
        ) : workoutDone ? (
          <>
            <View style={s.statsRow}>
              <StatCell value={String(exercisesDone)} label="Exercises" />
              <Divider />
              <StatCell value={String(completedSets)} label="Sets" />
              <Divider />
              <StatCell value={totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : '—'} label="Volume" color={Colors.primary} />
            </View>
            <View style={s.exList}>
              {workoutLog!.exercises.map(ex => {
                const best = ex.sets.filter(x => x.completed).reduce((b, x) => x.weight > b ? x.weight : b, 0);
                const reps = ex.sets.filter(x => x.completed).reduce((a, x) => a + x.reps, 0);
                return (
                  <View key={ex.exerciseId} style={s.exRow}>
                    <View style={s.exDot} />
                    <Text style={s.exName}>{ex.exerciseName}</Text>
                    <Text style={s.exMeta}>
                      {ex.sets.filter(x => x.completed).length} sets{best > 0 ? ` · ${best}kg` : ''}{reps > 0 ? ` · ${reps}r` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={s.emptyState}>
            <View style={s.emptyIconBox}>
              <Text style={s.emptyIcon}>🏋️</Text>
            </View>
            <Text style={s.emptyTitle}>Not started yet</Text>
            <Text style={s.emptySub}>Head to Workout to begin</Text>
          </View>
        )}
      </View>

      {/* ── Week Strip ── */}
      <View style={s.card}>
        <SectionLabel text="THIS WEEK" />
        <View style={s.weekRow}>
          {DAYS.map(d => {
            const wd      = workoutPlan.days.find(x => x.day === d);
            const isToday = d === day;
            const hasEx   = (wd?.exercises.length ?? 0) > 0;
            const isRest  = wd?.isRestDay;
            const color   = Colors.days[d];
            return (
              <View key={d} style={[s.dayChip, isToday && { borderColor: color, borderWidth: 1.5 }]}>
                <Text style={[s.dayChipLabel, isToday && { color }]}>{d}</Text>
                <View style={[s.dayDot, isRest ? s.dayDotRest : hasEx ? { backgroundColor: color } : s.dayDotEmpty]} />
              </View>
            );
          })}
        </View>
        <View style={s.weekLegend}>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.primary }]} /><Text style={s.legendText}>Workout</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.surfaceLight }]} /><Text style={s.legendText}>Rest</Text></View>
          <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.borderLight }]} /><Text style={s.legendText}>Empty</Text></View>
        </View>
      </View>

    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { paddingHorizontal: 20, paddingBottom: 40 },

  // header
  pageTitle:    { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, paddingTop: 20, marginBottom: 4 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting:     { fontSize: 14, color: Colors.textMuted },
  date:         { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  goalPill:     { backgroundColor: Colors.primaryGlow, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.primary + '40' },
  goalPillText: { color: Colors.primaryLight, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  // cards
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16,
  },

  // calories
  calRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calBig:        { fontSize: 48, fontWeight: '800', color: Colors.text, letterSpacing: -2 },
  calTarget:     { fontSize: 13, color: Colors.textMuted, marginTop: 4, fontWeight: '500' },
  calRing:       { width: 58, height: 58, borderRadius: 29, borderWidth: 3, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryGlow },
  calRingPct:    { color: Colors.primaryLight, fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: Colors.surfaceLight, borderRadius: 3, overflow: 'hidden', marginBottom: 20 },
  progressFill:  { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },

  macroRow:  { flexDirection: 'row', alignItems: 'center' },
  statCell:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLbl:   { fontSize: 11, color: Colors.textMuted, marginTop: 3, textAlign: 'center' },
  divider:   { width: 1, height: 40, backgroundColor: Colors.border },

  // workout
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  exList:   { gap: 10 },
  exRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 1 },
  exName:   { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' },
  exMeta:   { color: Colors.textMuted, fontSize: 12 },

  emptyState:  { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyIconBox:{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyIcon:   { fontSize: 28 },
  emptyTitle:  { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  emptySub:    { color: Colors.textMuted, fontSize: 13 },

  // week
  weekRow:    { flexDirection: 'row', gap: 6, marginBottom: 14 },
  dayChip:    { flex: 1, alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'transparent' },
  dayChipLabel:{ fontSize: 10, fontWeight: '700', color: Colors.textMuted, marginBottom: 6 },
  dayDot:     { width: 8, height: 8, borderRadius: 4 },
  dayDotRest: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.borderLight },
  dayDotEmpty:{ backgroundColor: Colors.borderLight },

  weekLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { color: Colors.textMuted, fontSize: 11 },
});
