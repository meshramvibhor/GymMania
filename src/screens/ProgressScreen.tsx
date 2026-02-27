import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useLogStore } from '../store/logStore';
import { WorkoutLog } from '../types';

const RANGES = [7, 14, 30] as const;
type Range = typeof RANGES[number];

const WeightChart = ({ data }: { data: { date: string; weight: number }[] }) => {
  if (data.length < 2) return (
    <Text style={chart.empty}>Not enough data yet. Log your body weight daily.</Text>
  );

  const min = Math.min(...data.map(d => d.weight)) - 2;
  const max = Math.max(...data.map(d => d.weight)) + 2;
  const range = max - min || 1;
  const chartH = 80;

  return (
    <View style={chart.container}>
      <View style={chart.bars}>
        {data.map((d, i) => {
          const h = ((d.weight - min) / range) * chartH;
          return (
            <View key={d.date} style={chart.barCol}>
              <Text style={chart.barVal}>{d.weight}</Text>
              <View style={[chart.bar, { height: h || 4 }]} />
              <Text style={chart.barDate}>{d.date.slice(5)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const ProgressScreen = () => {
  const { loadLogs, getRecentBodyWeights, getRecentWorkoutLogs, logs } = useLogStore();
  const [range, setRange] = useState<Range>(7);

  useEffect(() => {
    loadLogs();
  }, []);

  const bodyWeights = getRecentBodyWeights(range);
  const workoutLogs = getRecentWorkoutLogs(range);

  const totalWorkouts = workoutLogs.length;
  const totalSets = workoutLogs.reduce((a, l) => a + l.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).length, 0), 0);
  const totalVolume = workoutLogs.reduce(
    (a, l) => a + l.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.weight * s.reps, 0), 0),
    0
  );

  const streakDays = (() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (logs[key]?.workoutLog?.exercises.length) streak++;
      else if (i > 0) break;
    }
    return streak;
  })();

  const allLogDates = Object.keys(logs)
    .filter(date => logs[date]?.workoutLog?.exercises.length)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, range);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Range Selector */}
      <View style={styles.rangeRow}>
        {RANGES.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>{r}D</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalSets}</Text>
          <Text style={styles.statLabel}>Sets Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>{streakDays}🔥</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : '—'}</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
      </View>

      {/* Body Weight Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚖️ Body Weight</Text>
        {bodyWeights.length > 0 ? (
          <>
            <WeightChart data={bodyWeights} />
            <View style={styles.weightStats}>
              <Text style={styles.weightStat}>
                Start: <Text style={styles.weightStatVal}>{bodyWeights[0]?.weight}kg</Text>
              </Text>
              <Text style={styles.weightStat}>
                Latest: <Text style={styles.weightStatVal}>{bodyWeights[bodyWeights.length - 1]?.weight}kg</Text>
              </Text>
              {bodyWeights.length >= 2 && (
                <Text style={styles.weightStat}>
                  Change:{' '}
                  <Text style={[styles.weightStatVal, {
                    color: bodyWeights[bodyWeights.length - 1].weight < bodyWeights[0].weight
                      ? Colors.success : Colors.error,
                  }]}>
                    {(bodyWeights[bodyWeights.length - 1].weight - bodyWeights[0].weight).toFixed(1)}kg
                  </Text>
                </Text>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Log your body weight in the Log tab to track progress</Text>
        )}
      </View>

      {/* Workout History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Workout History</Text>
        {allLogDates.length === 0 ? (
          <Text style={styles.emptyText}>No workouts logged yet</Text>
        ) : (
          allLogDates.map(date => {
            const wl = logs[date]?.workoutLog!;
            const sets = wl.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
            const vol = wl.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.weight * s.reps, 0), 0);
            const displayDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <View key={date} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>{displayDate}</Text>
                  <Text style={styles.historyExercises}>
                    {wl.exercises.map(e => e.exerciseName).slice(0, 2).join(', ')}
                    {wl.exercises.length > 2 ? ` +${wl.exercises.length - 2} more` : ''}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyMeta}>{sets} sets</Text>
                  {vol > 0 && <Text style={styles.historyMeta}>{(vol / 1000).toFixed(1)}t</Text>}
                  {wl.mood ? <Text style={styles.historyMood}>{'😞😐🙂😊🔥'[wl.mood - 1]}</Text> : null}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Best Lifts */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Best Lifts (All Time)</Text>
        {(() => {
          const bests: Record<string, { name: string; weight: number; reps: number }> = {};
          Object.values(logs).forEach(log => {
            log.workoutLog?.exercises.forEach(ex => {
              ex.sets.forEach(s => {
                if (s.completed && s.weight > 0) {
                  if (!bests[ex.exerciseId] || s.weight > bests[ex.exerciseId].weight) {
                    bests[ex.exerciseId] = { name: ex.exerciseName, weight: s.weight, reps: s.reps };
                  }
                }
              });
            });
          });
          const sorted = Object.values(bests).sort((a, b) => b.weight - a.weight).slice(0, 8);
          return sorted.length === 0 ? (
            <Text style={styles.emptyText}>Complete sets to track your best lifts</Text>
          ) : (
            sorted.map((b, i) => (
              <View key={i} style={styles.bestRow}>
                <Text style={styles.bestRank}>{['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`}</Text>
                <Text style={styles.bestName}>{b.name}</Text>
                <Text style={styles.bestWeight}>{b.weight}kg × {b.reps}</Text>
              </View>
            ))
          );
        })()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rangeBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  rangeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rangeBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  rangeBtnTextActive: { color: Colors.white },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  weightStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  weightStat: { color: Colors.textSecondary, fontSize: 12 },
  weightStatVal: { color: Colors.text, fontWeight: '700' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  historyLeft: { flex: 1 },
  historyDate: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  historyExercises: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 2 },
  historyMeta: { color: Colors.textSecondary, fontSize: 12 },
  historyMood: { fontSize: 14 },
  bestRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, gap: 10 },
  bestRank: { fontSize: 18, width: 30 },
  bestName: { flex: 1, color: Colors.text, fontSize: 13, fontWeight: '600' },
  bestWeight: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
});

const chart = StyleSheet.create({
  container: { marginTop: 8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barVal: { color: Colors.textSecondary, fontSize: 9, marginBottom: 2 },
  bar: { width: '70%', backgroundColor: Colors.primary, borderRadius: 3, minHeight: 4 },
  barDate: { color: Colors.textMuted, fontSize: 8, marginTop: 4 },
  empty: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});
