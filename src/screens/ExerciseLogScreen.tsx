import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useLogStore } from '../store/logStore';
import { WorkoutStackParamList } from '../navigation/WorkoutStackNavigator';
import { LoggedSet } from '../types';

type Route = RouteProp<WorkoutStackParamList, 'ExerciseLog'>;

const todayDate = () => new Date().toISOString().split('T')[0];

const formatSessionDate = (dateStr: string): string => {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diffMs   = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); // e.g. "14 Jan 2025"
};

const formatSubDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

// ── History Tile ──────────────────────────────────────────────────────────────

const HistoryTile = ({ dateStr, sets }: { dateStr: string; sets: LoggedSet[] }) => {
  const label    = formatSessionDate(dateStr);
  const subLabel = formatSubDate(dateStr);
  const vol      = sets.reduce((a, s) => a + s.weight * s.reps, 0);
  const best     = sets.reduce((b, s) => s.weight > b ? s.weight : b, 0);
  const isRecent = (() => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return diff < 7;
  })();

  return (
    <View style={s.historyCard}>
      {/* Date header */}
      <View style={s.historyHeader}>
        <View style={s.historyAccent} />
        <View style={s.historyHeaderText}>
          <Text style={s.historyLabel}>{label}</Text>
          {!isRecent && <Text style={s.historySub}>{subLabel}</Text>}
        </View>
        <View style={s.historyStats}>
          {best > 0 && (
            <View style={s.historyStat}>
              <Text style={s.historyStatVal}>{best}kg</Text>
              <Text style={s.historyStatLbl}>best</Text>
            </View>
          )}
          {vol > 0 && (
            <View style={s.historyStat}>
              <Text style={s.historyStatVal}>{vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}</Text>
              <Text style={s.historyStatLbl}>volume</Text>
            </View>
          )}
        </View>
      </View>

      {/* Sets chips */}
      <View style={s.setsChips}>
        {sets.length > 0 ? sets.map((hs, i) => (
          <View key={i} style={s.chip}>
            <Text style={s.chipNum}>Set {hs.setNumber}</Text>
            <Text style={s.chipVal}>{hs.weight}kg × {hs.reps}</Text>
          </View>
        )) : (
          <Text style={s.noSets}>No completed sets recorded</Text>
        )}
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export const ExerciseLogScreen = () => {
  const route = useRoute<Route>();
  const { exerciseId, exerciseName } = route.params;

  const { logs, addExerciseToLog, updateSetInLog } = useLogStore();
  const date = todayDate();

  const todayEx = logs[date]?.workoutLog?.exercises.find(e => e.exerciseId === exerciseId);
  const sets: LoggedSet[] = todayEx?.sets ?? [];

  const history = Object.keys(logs)
    .filter(d => d < date && logs[d]?.workoutLog?.exercises.some(e => e.exerciseId === exerciseId))
    .sort((a, b) => b.localeCompare(a))
    .map(d => ({
      date: d,
      sets: logs[d].workoutLog!.exercises.find(e => e.exerciseId === exerciseId)!.sets.filter(s => s.completed),
    }));

  const lastSession = history[0]?.sets ?? [];

  const calcStats = (s: LoggedSet[]) => ({
    volume:  s.reduce((a, x) => a + x.weight * x.reps, 0),
    reps:    s.reduce((a, x) => a + x.reps, 0),
    avgWeight: s.length > 0 ? s.reduce((a, x) => a + x.weight, 0) / s.length : 0,
  });

  const todayStats = calcStats(sets);
  const lastStats  = calcStats(lastSession);

  const delta = (curr: number, prev: number) => {
    if (prev === 0) return null;
    const diff = curr - prev;
    return { diff, pct: Math.round((diff / prev) * 100) };
  };

  const [addingSet, setAddingSet]   = useState(false);
  const [inputKg, setInputKg]       = useState('');
  const [inputReps, setInputReps]   = useState('');

  const handleConfirm = () => {
    const newSet: LoggedSet = {
      setNumber: sets.length + 1,
      weight: parseFloat(inputKg) || 0,
      reps:   parseInt(inputReps) || 0,
      completed: true,
    };
    addExerciseToLog(date, { exerciseId, exerciseName, sets: [...sets, newSet] });
    setInputKg(''); setInputReps(''); setAddingSet(false);
  };

  const handleRemove = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }));
    addExerciseToLog(date, { exerciseId, exerciseName, sets: newSets });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── Comparison card ── */}
      <View style={s.cmpCard}>
        <Text style={s.cmpTitle}>VS LAST SESSION</Text>
        {history.length === 0 ? (
          <Text style={s.cmpEmpty}>No previous session recorded yet</Text>
        ) : (
          <View style={s.cmpRow}>
            {[
              { label: 'Volume', unit: 'kg', curr: todayStats.volume,    prev: lastStats.volume,    d: delta(todayStats.volume,    lastStats.volume) },
              { label: 'Reps',   unit: '',   curr: todayStats.reps,      prev: lastStats.reps,      d: delta(todayStats.reps,      lastStats.reps) },
              { label: 'Avg Wt', unit: 'kg', curr: todayStats.avgWeight, prev: lastStats.avgWeight, d: delta(todayStats.avgWeight, lastStats.avgWeight) },
            ].map(({ label, unit, curr, prev, d }, idx) => (
              <React.Fragment key={label}>
              {idx > 0 && <View style={s.cmpDivider} />}
              <View style={s.cmpCell}>
                <Text style={s.cmpLabel}>{label}</Text>
                <Text style={s.cmpCurr}>
                  {curr > 0 ? `${Number.isInteger(curr) ? curr : curr.toFixed(1)}${unit}` : '—'}
                </Text>
                <Text style={s.cmpPrev}>
                  prev: {prev > 0 ? `${Number.isInteger(prev) ? prev : prev.toFixed(1)}${unit}` : '—'}
                </Text>
                {d !== null && curr > 0 && (
                  <View style={[s.deltaBadge, d.diff >= 0 ? s.deltaPos : s.deltaNeg]}>
                    <Text style={[s.deltaText, d.diff >= 0 ? s.deltaTextPos : s.deltaTextNeg]}>
                      {d.diff >= 0 ? '▲' : '▼'} {Math.abs(d.pct)}%
                    </Text>
                  </View>
                )}
              </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>

      {/* ── Day header ── */}
      <Text style={s.dayLabel}>{formatSessionDate(date)}</Text>

      {/* ── Log card ── */}
      <View style={s.logCard}>
        {sets.length > 0 && (
          <View style={s.colRow}>
            <Text style={[s.colLbl, { width: 32 }]} />
            <Text style={[s.colLbl, { flex: 1, textAlign: 'center' }]}>WEIGHT (KG)</Text>
            <Text style={{ width: 24 }} />
            <Text style={[s.colLbl, { flex: 1, textAlign: 'center' }]}>REPS</Text>
            <Text style={{ width: 28 }} />
          </View>
        )}
        {sets.map((set, i) => (
          <View key={i} style={s.setRow}>
            <Text style={s.setNum}>{set.setNumber}</Text>
            <View style={s.setField}>
              <TextInput
                style={s.setInput}
                value={set.weight > 0 ? String(set.weight) : ''}
                onChangeText={v => updateSetInLog(date, exerciseId, i, { weight: parseFloat(v) || 0 })}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <Text style={s.setX}>×</Text>
            <View style={s.setField}>
              <TextInput
                style={s.setInput}
                value={set.reps > 0 ? String(set.reps) : ''}
                onChangeText={v => updateSetInLog(date, exerciseId, i, { reps: parseInt(v) || 0 })}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <TouchableOpacity onPress={() => handleRemove(i)} style={s.removeBtn}>
              <Text style={s.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {addingSet && (
          <View style={s.addRow}>
            <Text style={s.setNum}>{sets.length + 1}</Text>
            <TextInput
              style={s.addInput}
              value={inputKg}
              onChangeText={setInputKg}
              keyboardType="decimal-pad"
              placeholder="kg"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <Text style={s.setX}>×</Text>
            <TextInput
              style={s.addInput}
              value={inputReps}
              onChangeText={setInputReps}
              keyboardType="numeric"
              placeholder="reps"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={s.okBtn} onPress={handleConfirm}>
              <Text style={s.okText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setAddingSet(false); setInputKg(''); setInputReps(''); }} style={s.removeBtn}>
              <Text style={s.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {sets.length === 0 && !addingSet && (
          <Text style={s.emptyHint}>Tap + below to add your first set</Text>
        )}
      </View>

      {/* FAB */}
      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn} onPress={() => setAddingSet(true)} activeOpacity={0.8}>
          <Text style={s.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ── History ── */}
      {history.length > 0 && (
        <>
          <Text style={s.historyHeading}>HISTORY</Text>
          {history.map(entry => (
            <HistoryTile key={entry.date} dateStr={entry.date} sets={entry.sets} />
          ))}
        </>
      )}

    </ScrollView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 20, paddingBottom: 60 },

  // comparison card
  cmpCard:     { backgroundColor: Colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  cmpTitle:    { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 },
  cmpEmpty:    { color: Colors.textMuted, fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  cmpRow:      { flexDirection: 'row' },
  cmpCell:     { flex: 1, alignItems: 'center', gap: 3 },
  cmpDivider:  { width: 1, backgroundColor: Colors.border },
  cmpLabel:    { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
  cmpCurr:     { fontSize: 22, fontWeight: '800', color: Colors.text },
  cmpPrev:     { fontSize: 11, color: Colors.textMuted },
  deltaBadge:  { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  deltaPos:    { backgroundColor: Colors.successGlow },
  deltaNeg:    { backgroundColor: Colors.errorGlow },
  deltaText:   { fontSize: 11, fontWeight: '800' },
  deltaTextPos:{ color: Colors.success },
  deltaTextNeg:{ color: Colors.error },

  dayLabel: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 12 },

  // log card
  logCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border },

  colRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  colLbl: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },

  setRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderRadius: 12, marginBottom: 6, paddingHorizontal: 4, backgroundColor: Colors.surfaceLight },
  setNum:    { color: Colors.textMuted, fontSize: 13, fontWeight: '700', width: 32, textAlign: 'center' },
  setField:  { flex: 1, alignItems: 'center' },
  setInput:  { color: Colors.text, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 4, fontSize: 17, fontWeight: '800', textAlign: 'center', width: 72, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  setX:      { color: Colors.textMuted, fontSize: 15, width: 24, textAlign: 'center' },
  removeBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  removeText:{ color: Colors.textMuted, fontSize: 14, fontWeight: '700' },

  addRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: Colors.primaryGlow, borderRadius: 14, padding: 12, gap: 6, borderWidth: 1, borderColor: Colors.primary + '50' },
  addInput: { flex: 1, backgroundColor: Colors.card, color: Colors.text, borderRadius: 10, padding: 10, fontSize: 16, fontWeight: '800', textAlign: 'center', borderWidth: 1, borderColor: Colors.border },
  okBtn:    { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11 },
  okText:   { color: Colors.white, fontWeight: '800', fontSize: 14 },

  emptyHint: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 28, fontStyle: 'italic' },

  fab:    { alignItems: 'center', marginVertical: 28 },
  fabBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  fabIcon:{ color: Colors.white, fontSize: 34, fontWeight: '300', lineHeight: 40 },

  // history
  historyHeading: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },

  historyCard:       { backgroundColor: Colors.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  historyHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14 },
  historyAccent:     { width: 3, alignSelf: 'stretch', backgroundColor: Colors.primary, borderRadius: 2, marginRight: 14 },
  historyHeaderText: { flex: 1 },
  historyLabel:      { color: Colors.text, fontSize: 15, fontWeight: '800' },
  historySub:        { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  historyStats:      { flexDirection: 'row', gap: 14 },
  historyStat:       { alignItems: 'flex-end' },
  historyStatVal:    { color: Colors.text, fontSize: 14, fontWeight: '800' },
  historyStatLbl:    { color: Colors.textMuted, fontSize: 10 },

  setsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  chip:      { backgroundColor: Colors.surfaceLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 76, borderWidth: 1, borderColor: Colors.border },
  chipNum:   { color: Colors.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  chipVal:   { color: Colors.text, fontSize: 13, fontWeight: '700' },
  noSets:    { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic', padding: 14 },
});
