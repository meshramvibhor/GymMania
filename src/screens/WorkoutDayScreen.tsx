import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useWorkoutStore } from '../store/workoutStore';
import { WorkoutStackParamList } from '../navigation/WorkoutStackNavigator';
import { PlannedExercise } from '../types';

type Route = RouteProp<WorkoutStackParamList, 'WorkoutDay'>;
type Nav = NativeStackNavigationProp<WorkoutStackParamList>;

const EditExerciseModal = ({
  exercise,
  onSave,
  onClose,
}: {
  exercise: PlannedExercise;
  onSave: (updates: Partial<PlannedExercise>) => void;
  onClose: () => void;
}) => {
  const [sets, setSets] = useState(String(exercise.targetSets));
  const [reps, setReps] = useState(String(exercise.targetReps));
  const [weight, setWeight] = useState(String(exercise.targetWeight ?? ''));
  const [notes, setNotes] = useState(exercise.notes ?? '');

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>{exercise.exerciseName}</Text>

          <View style={modal.row}>
            <View style={modal.field}>
              <Text style={modal.label}>Sets</Text>
              <TextInput
                style={modal.input}
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={modal.field}>
              <Text style={modal.label}>Reps</Text>
              <TextInput
                style={modal.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={modal.field}>
              <Text style={modal.label}>Weight (kg)</Text>
              <TextInput
                style={modal.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <Text style={modal.label}>Notes</Text>
          <TextInput
            style={[modal.input, modal.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />

          <View style={modal.btnRow}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modal.saveBtn}
              onPress={() => {
                onSave({
                  targetSets: parseInt(sets) || 3,
                  targetReps: parseInt(reps) || 10,
                  targetWeight: weight ? parseFloat(weight) : undefined,
                  notes: notes || undefined,
                });
                onClose();
              }}
            >
              <Text style={modal.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const WorkoutDayScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { day } = route.params;
  const { plan, updateDayName, toggleRestDay, removeExercise, updateExercise } = useWorkoutStore();
  const dayData = plan.days.find(d => d.day === day)!;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(dayData.name);
  const [editingExercise, setEditingExercise] = useState<PlannedExercise | null>(null);

  const handleSaveName = () => {
    updateDayName(day, nameInput);
    setEditingName(false);
  };

  const handleRemove = (exerciseId: string, name: string) => {
    Alert.alert('Remove Exercise', `Remove "${name}" from ${day}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeExercise(day, exerciseId) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Day Name */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Day Label</Text>
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Push Day, Leg Day..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <TouchableOpacity style={styles.saveNameBtn} onPress={handleSaveName}>
              <Text style={styles.saveNameText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.nameRow} onPress={() => setEditingName(true)}>
            <Text style={[styles.nameText, !dayData.name && styles.namePlaceholder]}>
              {dayData.name || 'Tap to set day name...'}
            </Text>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rest Day Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.restToggle, dayData.isRestDay && styles.restToggleActive]}
          onPress={() => toggleRestDay(day)}
        >
          <Text style={styles.restToggleIcon}>😴</Text>
          <View>
            <Text style={[styles.restToggleLabel, dayData.isRestDay && styles.restToggleLabelActive]}>
              Rest Day
            </Text>
            <Text style={styles.restToggleSub}>
              {dayData.isRestDay ? 'Marked as rest day — tap to remove' : 'Tap to mark as rest day'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Exercises */}
      {!dayData.isRestDay && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Exercises ({dayData.exercises.length})</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('ExercisePicker', { day, mode: 'plan' })}
            >
              <Text style={styles.addBtnText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {dayData.exercises.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyText}>No exercises yet</Text>
              <Text style={styles.emptySubText}>Tap "+ Add Exercise" to build your workout</Text>
            </View>
          ) : (
            dayData.exercises.map((ex, index) => (
              <TouchableOpacity
                key={ex.exerciseId}
                style={styles.exCard}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('ExerciseLog', {
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName,
                  day,
                  targetSets: ex.targetSets,
                  targetReps: ex.targetReps,
                  targetWeight: ex.targetWeight,
                })}
              >
                <View style={styles.exCardLeft}>
                  <Text style={styles.exIndex}>{index + 1}</Text>
                </View>
                <View style={styles.exCardContent}>
                  <Text style={styles.exName}>{ex.exerciseName}</Text>
                  <View style={styles.exMetaRow}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{ex.targetSets} sets</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{ex.targetReps} reps</Text>
                    </View>
                    {ex.targetWeight ? (
                      <View style={[styles.metaChip, styles.metaChipAccent]}>
                        <Text style={[styles.metaChipText, styles.metaChipTextAccent]}>{ex.targetWeight}kg</Text>
                      </View>
                    ) : null}
                  </View>
                  {ex.notes ? <Text style={styles.exNotes}>{ex.notes}</Text> : null}
                </View>
                <View style={styles.exCardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => setEditingExercise(ex)}
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(ex.exerciseId, ex.exerciseName)}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {editingExercise && (
        <EditExerciseModal
          exercise={editingExercise}
          onClose={() => setEditingExercise(null)}
          onSave={(updates) => {
            updateExercise(day, editingExercise.exerciseId, updates);
            setEditingExercise(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 22 },
  sectionLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  nameText: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '600' },
  namePlaceholder: { color: Colors.textMuted, fontStyle: 'italic' },
  editIcon: { fontSize: 14 },
  nameEditRow: { flexDirection: 'row', gap: 8 },
  nameInput: { flex: 1, backgroundColor: Colors.card, color: Colors.text, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: Colors.primary, fontSize: 15 },
  saveNameBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  saveNameText: { color: Colors.white, fontWeight: '700' },
  restToggle: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  restToggleActive: { borderColor: Colors.info + '60', backgroundColor: Colors.info + '10' },
  restToggleIcon: { fontSize: 24 },
  restToggleLabel: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  restToggleLabelActive: { color: Colors.info },
  restToggleSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 36, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  emptySubText: { color: Colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  exCard: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  exCardLeft: { width: 44, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  exIndex: { color: Colors.textMuted, fontSize: 14, fontWeight: '800' },
  exCardContent: { flex: 1, padding: 14 },
  exName: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  exMetaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip: { backgroundColor: Colors.surfaceLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  metaChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  metaChipAccent: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary + '40' },
  metaChipTextAccent: { color: Colors.primaryLight },
  exNotes: { color: Colors.textMuted, fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  exCardActions: { justifyContent: 'center', paddingRight: 10, gap: 8 },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: 14 },
  removeBtn: { padding: 6 },
  removeBtnText: { color: Colors.textMuted, fontSize: 16, fontWeight: '700' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 22 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  field: { flex: 1 },
  label: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: Colors.card, color: Colors.text, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: Colors.border, fontSize: 16, fontWeight: '700' },
  notesInput: { height: 80, textAlignVertical: 'top', fontWeight: '400', marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: Colors.surfaceLight, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { color: Colors.white, fontWeight: '700' },
});
