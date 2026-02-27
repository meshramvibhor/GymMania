import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useLogStore } from '../store/logStore';
import { useWorkoutStore } from '../store/workoutStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LoggedSet, WorkoutLog } from '../types';

type Route = RouteProp<RootStackParamList, 'LogWorkout'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── helpers ────────────────────────────────────────────────────────────────

const calcVolume = (log: WorkoutLog) =>
  log.exercises.reduce(
    (a, ex) => a + ex.sets.filter(s => s.completed).reduce((b, s) => b + s.weight * s.reps, 0),
    0,
  );

const calcTotalReps = (log: WorkoutLog) =>
  log.exercises.reduce(
    (a, ex) => a + ex.sets.filter(s => s.completed).reduce((b, s) => b + s.reps, 0),
    0,
  );

const calcTotalSets = (log: WorkoutLog) =>
  log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);

const bestSet = (log: WorkoutLog, exerciseId: string) => {
  const ex = log.exercises.find(e => e.exerciseId === exerciseId);
  if (!ex) return null;
  return ex.sets.filter(s => s.completed).reduce(
    (best, s) => (!best || s.weight > best.weight ? s : best),
    null as LoggedSet | null,
  );
};

const delta = (now: number, prev: number) => {
  if (prev === 0) return null;
  const d = now - prev;
  const pct = Math.round((d / prev) * 100);
  return { d, pct };
};

const Arrow = ({ now, prev }: { now: number; prev: number }) => {
  const d = delta(now, prev);
  if (!d || d.d === 0) return <Text style={cmp.neutral}>→ same</Text>;
  const up = d.d > 0;
  return (
    <Text style={up ? cmp.up : cmp.down}>
      {up ? '▲' : '▼'} {Math.abs(d.pct)}%
    </Text>
  );
};

// ─── comparison card ────────────────────────────────────────────────────────

const ComparisonCard = ({ currentLog, prevLog }: { currentLog: WorkoutLog | undefined; prevLog: WorkoutLog | null }) => {
  if (!prevLog) {
    return (
      <View style={cmp.card}>
        <Text style={cmp.title}>📊 vs Last Workout</Text>
        <Text style={cmp.noData}>No previous workout found to compare.</Text>
      </View>
    );
  }

  const prevDate = new Date(prevLog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const prevVol = calcVolume(prevLog);
  const prevReps = calcTotalReps(prevLog);
  const prevSets = calcTotalSets(prevLog);

  const nowVol = currentLog ? calcVolume(currentLog) : 0;
  const nowReps = currentLog ? calcTotalReps(currentLog) : 0;
  const nowSets = currentLog ? calcTotalSets(currentLog) : 0;

  // Per-exercise comparison — only exercises that appeared last time
  const sharedExercises = prevLog.exercises.filter(pex =>
    currentLog?.exercises.some(cex => cex.exerciseId === pex.exerciseId)
  );

  return (
    <View style={cmp.card}>
      <View style={cmp.headerRow}>
        <Text style={cmp.title}>📊 vs Last Workout</Text>
        <Text style={cmp.prevDate}>{prevDate}</Text>
      </View>

      {/* Overall stats */}
      <View style={cmp.statsRow}>
        <View style={cmp.statBox}>
          <Text style={cmp.statLabel}>Volume</Text>
          <Text style={cmp.statNow}>{nowVol > 0 ? `${(nowVol / 1000).toFixed(1)}t` : '—'}</Text>
          <Text style={cmp.statPrev}>{prevVol > 0 ? `${(prevVol / 1000).toFixed(1)}t` : '—'} prev</Text>
          {nowVol > 0 && <Arrow now={nowVol} prev={prevVol} />}
        </View>
        <View style={cmp.statDivider} />
        <View style={cmp.statBox}>
          <Text style={cmp.statLabel}>Total Reps</Text>
          <Text style={cmp.statNow}>{nowReps || '—'}</Text>
          <Text style={cmp.statPrev}>{prevReps} prev</Text>
          {nowReps > 0 && <Arrow now={nowReps} prev={prevReps} />}
        </View>
        <View style={cmp.statDivider} />
        <View style={cmp.statBox}>
          <Text style={cmp.statLabel}>Sets Done</Text>
          <Text style={cmp.statNow}>{nowSets || '—'}</Text>
          <Text style={cmp.statPrev}>{prevSets} prev</Text>
          {nowSets > 0 && <Arrow now={nowSets} prev={prevSets} />}
        </View>
      </View>

      {/* Per-exercise best set comparison */}
      {sharedExercises.length > 0 && (
        <>
          <View style={cmp.divider} />
          <Text style={cmp.exCompTitle}>Exercise Comparison</Text>
          {sharedExercises.map(pex => {
            const prevBest = bestSet(prevLog, pex.exerciseId);
            const nowBest = currentLog ? bestSet(currentLog, pex.exerciseId) : null;
            return (
              <View key={pex.exerciseId} style={cmp.exRow}>
                <Text style={cmp.exName} numberOfLines={1}>{pex.exerciseName}</Text>
                <View style={cmp.exCompare}>
                  <Text style={cmp.exPrev}>
                    {prevBest ? `${prevBest.weight}kg×${prevBest.reps}` : '—'}
                  </Text>
                  <Text style={cmp.exArrow}>→</Text>
                  <Text style={[cmp.exNow, nowBest && prevBest && nowBest.weight > prevBest.weight ? cmp.exImproved : null]}>
                    {nowBest ? `${nowBest.weight}kg×${nowBest.reps}` : '—'}
                  </Text>
                  {nowBest && prevBest && nowBest.weight !== prevBest.weight && (
                    <Text style={nowBest.weight > prevBest.weight ? cmp.up : cmp.down}>
                      {nowBest.weight > prevBest.weight ? ' 🔥' : ' ▼'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

// ─── exercise card ───────────────────────────────────────────────────────────

const ExerciseCard = ({
  exerciseId,
  exerciseName,
  sets,
  date,
  targetSets,
  targetReps,
  targetWeight,
}: {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
  date: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
}) => {
  const { updateSetInLog, removeExerciseFromLog, addExerciseToLog } = useLogStore();
  const [addingSet, setAddingSet] = useState(false);
  const [inputKg, setInputKg] = useState('');
  const [inputReps, setInputReps] = useState('');

  const handleConfirmSet = () => {
    const newSet: LoggedSet = {
      setNumber: sets.length + 1,
      weight: parseFloat(inputKg) || 0,
      reps: parseInt(inputReps) || 0,
      completed: false,
    };
    addExerciseToLog(date, { exerciseId, exerciseName, sets: [...sets, newSet] });
    setInputKg('');
    setInputReps('');
    setAddingSet(false);
  };

  const handleRemoveSet = (index: number) => {
    const newSets = sets
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    addExerciseToLog(date, { exerciseId, exerciseName, sets: newSets });
  };

  const completedCount = sets.filter(s => s.completed).length;

  return (
    <>
    <View style={styles.exCard}>
      <View style={styles.exCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exName}>{exerciseName}</Text>
          {(targetSets || targetReps || targetWeight) && (
            <Text style={styles.exTarget}>
              Target: {targetSets}×{targetReps}{targetWeight ? ` @ ${targetWeight}kg` : ''}
            </Text>
          )}
        </View>
        <View style={styles.exHeaderRight}>
          {sets.length > 0 && (
            <Text style={styles.completedBadge}>{completedCount}/{sets.length}</Text>
          )}
          <TouchableOpacity
            onPress={() => Alert.alert('Remove', `Remove ${exerciseName}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeExerciseFromLog(date, exerciseId) },
            ])}
          >
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sets.length > 0 && (
        <View style={styles.setsHeader}>
          <Text style={styles.setsHeaderText}>SET</Text>
          <Text style={[styles.setsHeaderText, { flex: 1, textAlign: 'center' }]}>KG</Text>
          <Text style={[styles.setsHeaderText, { flex: 1, textAlign: 'center' }]}>REPS</Text>
          <Text style={[styles.setsHeaderText, { width: 40, textAlign: 'center' }]}>✓</Text>
          <Text style={[styles.setsHeaderText, { width: 24 }]} />
        </View>
      )}

      {sets.map((s, i) => (
        <View key={i} style={[styles.setRow, s.completed && styles.setRowDone]}>
          <Text style={styles.setNum}>{s.setNumber}</Text>
          <View style={styles.setField}>
            <TextInput
              style={styles.setInput}
              value={s.weight > 0 ? String(s.weight) : ''}
              onChangeText={v => updateSetInLog(date, exerciseId, i, { weight: parseFloat(v) || 0 })}
              keyboardType="decimal-pad"
              placeholder="kg"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <Text style={styles.setX}>×</Text>
          <View style={styles.setField}>
            <TextInput
              style={styles.setInput}
              value={s.reps > 0 ? String(s.reps) : ''}
              onChangeText={v => updateSetInLog(date, exerciseId, i, { reps: parseInt(v) || 0 })}
              keyboardType="numeric"
              placeholder="reps"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={[styles.checkBtn, s.completed && styles.checkBtnDone]}
            onPress={() => updateSetInLog(date, exerciseId, i, { completed: !s.completed })}
          >
            <Text style={[styles.checkIcon, s.completed && styles.checkIconDone]}>
              {s.completed ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemoveSet(i)} style={styles.setRemoveBtn}>
            <Text style={styles.setRemoveText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {addingSet ? (
        <View style={styles.addSetRow}>
          <Text style={styles.addSetNum}>{sets.length + 1}</Text>
          <TextInput
            style={styles.addSetInput}
            value={inputKg}
            onChangeText={setInputKg}
            keyboardType="decimal-pad"
            placeholder="kg"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />
          <Text style={styles.setX}>×</Text>
          <TextInput
            style={styles.addSetInput}
            value={inputReps}
            onChangeText={setInputReps}
            keyboardType="numeric"
            placeholder="reps"
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.addSetOkBtn} onPress={handleConfirmSet}>
            <Text style={styles.addSetOkText}>OK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setAddingSet(false); setInputKg(''); setInputReps(''); }} style={styles.addSetCancelBtn}>
            <Text style={styles.addSetCancelText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

    </View>

    <View style={styles.addSetFab}>
      <TouchableOpacity style={styles.addSetFabBtn} onPress={() => setAddingSet(true)} activeOpacity={0.8}>
        <Text style={styles.addSetFabIcon}>+</Text>
      </TouchableOpacity>
    </View>
    </>
  );
};

// ─── main screen ─────────────────────────────────────────────────────────────

export const LogWorkoutScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { date, day } = route.params;
  const { getLog, logs } = useLogStore();
  const { plan } = useWorkoutStore();

  const todayLog = getLog(date);
  const workoutLog = todayLog?.workoutLog;
  const plannedDay = plan.days.find(d => d.day === day);


  const exercises = workoutLog?.exercises ?? [];
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  // Find last previous workout log (before today) that has at least one exercise
  const prevLog: WorkoutLog | null = (() => {
    const sorted = Object.keys(logs)
      .filter(d => d < date && logs[d]?.workoutLog?.exercises.length)
      .sort((a, b) => b.localeCompare(a));
    return sorted.length ? logs[sorted[0]].workoutLog! : null;
  })();

  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Date + progress */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{displayDate}</Text>
        {totalSets > 0 && (
          <Text style={styles.progressText}>{completedSets}/{totalSets} sets completed</Text>
        )}
      </View>

      {/* Comparison card */}
      <ComparisonCard currentLog={workoutLog} prevLog={prevLog} />

      {/* Exercises */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Exercises ({exercises.length})</Text>
          <TouchableOpacity
            style={styles.addExBtn}
            onPress={() => navigation.navigate('ExercisePicker', { day, mode: 'log', date })}
          >
            <Text style={styles.addExText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {exercises.length === 0 && plannedDay && !plannedDay.isRestDay && plannedDay.exercises.length > 0 ? (
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionTitle}>📋 Today's planned workout</Text>
            <Text style={styles.suggestionSub}>Tap to add to your log</Text>
            {plannedDay.exercises.map(pex => (
              <TouchableOpacity
                key={pex.exerciseId}
                style={styles.suggestionRow}
                onPress={() => {
                  useLogStore.getState().addExerciseToLog(date, {
                    exerciseId: pex.exerciseId,
                    exerciseName: pex.exerciseName,
                    sets: [],
                  });
                }}
              >
                <Text style={styles.suggestionExName}>{pex.exerciseName}</Text>
                <Text style={styles.suggestionExMeta}>
                  {pex.targetSets}×{pex.targetReps}{pex.targetWeight ? ` @ ${pex.targetWeight}kg` : ''}
                </Text>
                <Text style={styles.suggestionAdd}>+</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>No exercises logged yet</Text>
            <Text style={styles.emptySubText}>Tap "+ Add Exercise" to start</Text>
          </View>
        ) : null}

        {exercises.map(ex => {
          const planned = plannedDay?.exercises.find(p => p.exerciseId === ex.exerciseId);
          return (
            <ExerciseCard
              key={ex.exerciseId}
              exerciseId={ex.exerciseId}
              exerciseName={ex.exerciseName}
              sets={ex.sets}
              date={date}
              targetSets={planned?.targetSets}
              targetReps={planned?.targetReps}
              targetWeight={planned?.targetWeight}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  dateHeader: { marginBottom: 16 },
  dateText: { fontSize: 20, fontWeight: '800', color: Colors.text },
  progressText: { color: Colors.accent, fontSize: 14, marginTop: 4, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  weightInput: { backgroundColor: Colors.card, color: Colors.text, borderRadius: 12, padding: 14, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: Colors.border },
  addExBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  addExText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  exCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  exCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  exName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  exTarget: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  exHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  completedBadge: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  removeIcon: { color: Colors.error, fontSize: 16, fontWeight: '700' },
  setsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingHorizontal: 4 },
  setsHeaderText: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', width: 30 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8, marginBottom: 4 },
  setRowDone: { backgroundColor: Colors.success + '15' },
  setNum: { color: Colors.textMuted, fontSize: 13, fontWeight: '700', width: 30 },
  setField: { flex: 1, alignItems: 'center' },
  setInput: { backgroundColor: Colors.surfaceLight, color: Colors.text, borderRadius: 8, padding: 8, fontSize: 16, fontWeight: '700', textAlign: 'center', width: 64, borderWidth: 1, borderColor: Colors.border },
  setX: { color: Colors.textMuted, fontSize: 16, marginHorizontal: 6 },
  checkBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  checkBtnDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkIcon: { color: Colors.textMuted, fontSize: 16, fontWeight: '700' },
  checkIconDone: { color: Colors.white },
  setRemoveBtn: { width: 24, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  setRemoveText: { color: Colors.error, fontSize: 12, fontWeight: '700' },
  addSetFab: { alignItems: 'center', marginTop: 6, marginBottom: 20 },
  addSetFabBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  addSetFabIcon: { color: Colors.white, fontSize: 36, fontWeight: '300', lineHeight: 42 },
  addSetRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: Colors.surfaceLight, borderRadius: 10, padding: 8, gap: 6, borderWidth: 1, borderColor: Colors.primary },
  addSetNum: { color: Colors.textMuted, fontSize: 13, fontWeight: '700', width: 24, textAlign: 'center' },
  addSetInput: { flex: 1, backgroundColor: Colors.card, color: Colors.text, borderRadius: 8, padding: 8, fontSize: 15, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: Colors.border },
  addSetOkBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addSetOkText: { color: Colors.white, fontWeight: '800', fontSize: 13 },
  addSetCancelBtn: { padding: 6 },
  addSetCancelText: { color: Colors.textMuted, fontSize: 14, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 32, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  emptySubText: { color: Colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  suggestionBox: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  suggestionTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  suggestionSub: { color: Colors.textMuted, fontSize: 12, marginBottom: 12 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  suggestionExName: { flex: 1, color: Colors.text, fontSize: 14 },
  suggestionExMeta: { color: Colors.textSecondary, fontSize: 12, marginRight: 12 },
  suggestionAdd: { color: Colors.primary, fontSize: 22, fontWeight: '700' },
});

const cmp = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  prevDate: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  noData: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 50, backgroundColor: Colors.border },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statNow: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  statPrev: { color: Colors.textMuted, fontSize: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  exCompTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  exRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border + '60' },
  exName: { flex: 1, color: Colors.textSecondary, fontSize: 13, marginRight: 8 },
  exCompare: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exPrev: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  exArrow: { color: Colors.textMuted, fontSize: 12 },
  exNow: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  exImproved: { color: Colors.success },
  up: { color: Colors.success, fontSize: 11, fontWeight: '800' },
  down: { color: Colors.error, fontSize: 11, fontWeight: '800' },
  neutral: { color: Colors.textMuted, fontSize: 11 },
});
