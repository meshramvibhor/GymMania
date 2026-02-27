import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useWorkoutStore } from '../store/workoutStore';
import { useLogStore } from '../store/logStore';
import { EXERCISES, MUSCLE_GROUPS } from '../data/exercises';
import { WorkoutStackParamList } from '../navigation/WorkoutStackNavigator';
import { Exercise, PlannedExercise, LoggedExercise } from '../types';

type Route = RouteProp<WorkoutStackParamList, 'ExercisePicker'>;

export const ExercisePickerScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { day, mode, date } = route.params;
  const { addExercise } = useWorkoutStore();
  const { addExerciseToLog } = useLogStore();

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const filtered = EXERCISES.filter(ex => {
    const matchGroup = selectedGroup === 'All' || ex.muscleGroup === selectedGroup;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const handleSelect = (exercise: Exercise) => {
    if (mode === 'plan') {
      const planned: PlannedExercise = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetSets: 3,
        targetReps: 10,
      };
      addExercise(day, planned);
    } else if (mode === 'log' && date) {
      const logged: LoggedExercise = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
      };
      addExerciseToLog(date, logged);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises..."
        placeholderTextColor={Colors.textMuted}
      />

      {/* Muscle group filter */}
      <FlatList
        data={['All', ...MUSCLE_GROUPS]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        style={styles.filterList}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedGroup === item && styles.filterChipActive]}
            onPress={() => setSelectedGroup(item)}
          >
            <Text style={[styles.filterText, selectedGroup === item && styles.filterTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exItem} onPress={() => handleSelect(item)} activeOpacity={0.7}>
            <View style={styles.exInfo}>
              <Text style={styles.exName}>{item.name}</Text>
              <View style={styles.exTags}>
                <Text style={styles.exGroup}>{item.muscleGroup}</Text>
                <Text style={styles.exEquip}>{item.equipment}</Text>
              </View>
            </View>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  search: {
    backgroundColor: Colors.card,
    color: Colors.text,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterList: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  exItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exInfo: { flex: 1 },
  exName: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  exTags: { flexDirection: 'row', gap: 8 },
  exGroup: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: Colors.primaryDark + '40',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exEquip: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addIcon: { color: Colors.primary, fontSize: 24, fontWeight: '700', paddingLeft: 12 },
  separator: { height: 8 },
});
