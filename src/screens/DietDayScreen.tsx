import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, FlatList,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useDietStore } from '../store/dietStore';
import { FOODS } from '../data/foods';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MealType, PlannedMeal, FoodItem } from '../types';

type Route = RouteProp<RootStackParamList, 'DietDay'>;

const MEAL_TYPES: MealType[] = ['Breakfast', 'Pre-Workout', 'Lunch', 'Post-Workout', 'Dinner', 'Snack'];

const AddFoodModal = ({
  mealType,
  onAdd,
  onClose,
}: {
  mealType: MealType;
  onAdd: (foodId: string, foodName: string, qty: number) => void;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState('1');

  const filtered = FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  if (selected) {
    const macros = {
      calories: Math.round(selected.macros.calories * parseFloat(qty || '1')),
      protein: Math.round(selected.macros.protein * parseFloat(qty || '1')),
      carbs: Math.round(selected.macros.carbs * parseFloat(qty || '1')),
      fat: Math.round(selected.macros.fat * parseFloat(qty || '1')),
    };
    return (
      <Modal visible transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={modal.backBtn}>← Back to list</Text>
            </TouchableOpacity>
            <Text style={modal.title}>{selected.name}</Text>
            <Text style={modal.servingSize}>Per serving: {selected.servingSize}</Text>

            <Text style={modal.label}>Quantity (servings)</Text>
            <TextInput
              style={modal.input}
              value={qty}
              onChangeText={setQty}
              keyboardType="decimal-pad"
              autoFocus
            />

            <View style={modal.macroPreview}>
              <View style={modal.macroItem}><Text style={modal.macroVal}>{macros.calories}</Text><Text style={modal.macroLbl}>kcal</Text></View>
              <View style={modal.macroItem}><Text style={modal.macroVal}>{macros.protein}g</Text><Text style={modal.macroLbl}>Protein</Text></View>
              <View style={modal.macroItem}><Text style={modal.macroVal}>{macros.carbs}g</Text><Text style={modal.macroLbl}>Carbs</Text></View>
              <View style={modal.macroItem}><Text style={modal.macroVal}>{macros.fat}g</Text><Text style={modal.macroLbl}>Fat</Text></View>
            </View>

            <View style={modal.btnRow}>
              <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modal.saveBtn}
                onPress={() => {
                  onAdd(selected.id, selected.name, parseFloat(qty) || 1);
                  onClose();
                }}
              >
                <Text style={modal.saveText}>Add to {mealType}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={[modal.sheet, { maxHeight: '80%' }]}>
          <Text style={modal.title}>Add Food — {mealType}</Text>
          <TextInput
            style={modal.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search foods..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={modal.foodRow} onPress={() => setSelected(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={modal.foodName}>{item.name}</Text>
                  <Text style={modal.foodMeta}>{item.servingSize} · {item.macros.calories}kcal · {item.macros.protein}g P</Text>
                </View>
                <Text style={modal.foodAdd}>+</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border }} />}
          />
          <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
            <Text style={modal.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const DietDayScreen = () => {
  const route = useRoute<Route>();
  const { day } = route.params;
  const { getDay, addMeal, updateMeal, removeMeal, getDayTotalMacros } = useDietStore();
  const dayData = getDay(day);
  const totalMacros = getDayTotalMacros(day);
  const target = dayData.targetMacros;

  const [addingMealType, setAddingMealType] = useState<MealType | null>(null);

  const handleAddFood = (mealType: MealType, foodId: string, foodName: string, qty: number) => {
    const food = FOODS.find(f => f.id === foodId)!;
    const newItem = {
      foodId,
      foodName,
      quantity: qty,
      macros: food.macros,
    };
    const existingMeal = dayData.meals.find(m => m.mealType === mealType);
    if (existingMeal) {
      updateMeal(day, mealType, {
        ...existingMeal,
        items: [...existingMeal.items, newItem],
      });
    } else {
      addMeal(day, { mealType, items: [newItem] });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Macro Summary */}
      <View style={styles.macroCard}>
        <View style={styles.macroRow}>
          <View style={styles.calBox}>
            <Text style={styles.calValue}>{totalMacros.calories}</Text>
            <Text style={styles.calLabel}>of {target.calories} kcal</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroMini}>
            <Text style={[styles.macroMiniVal, { color: Colors.primary }]}>{totalMacros.protein}g</Text>
            <Text style={styles.macroMiniLabel}>Protein</Text>
            <Text style={styles.macroMiniTarget}>/{target.protein}g</Text>
          </View>
          <View style={styles.macroMini}>
            <Text style={[styles.macroMiniVal, { color: Colors.accent }]}>{totalMacros.carbs}g</Text>
            <Text style={styles.macroMiniLabel}>Carbs</Text>
            <Text style={styles.macroMiniTarget}>/{target.carbs}g</Text>
          </View>
          <View style={styles.macroMini}>
            <Text style={[styles.macroMiniVal, { color: Colors.info }]}>{totalMacros.fat}g</Text>
            <Text style={styles.macroMiniLabel}>Fat</Text>
            <Text style={styles.macroMiniTarget}>/{target.fat}g</Text>
          </View>
        </View>

        {/* Progress bars */}
        {[
          { label: 'Calories', val: totalMacros.calories, max: target.calories, color: Colors.text },
          { label: 'Protein', val: totalMacros.protein, max: target.protein, color: Colors.primary },
          { label: 'Carbs', val: totalMacros.carbs, max: target.carbs, color: Colors.accent },
          { label: 'Fat', val: totalMacros.fat, max: target.fat, color: Colors.info },
        ].map(item => (
          <View key={item.label} style={styles.progressRow}>
            <Text style={styles.progressLabel}>{item.label}</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(item.val / item.max * 100, 100)}%` as any, backgroundColor: item.color }]} />
            </View>
            <Text style={styles.progressPct}>{Math.round(item.val / item.max * 100)}%</Text>
          </View>
        ))}
      </View>

      {/* Meals */}
      {MEAL_TYPES.map(mealType => {
        const meal = dayData.meals.find(m => m.mealType === mealType);
        const mealMacros = meal?.items.reduce(
          (acc, item) => ({
            calories: acc.calories + item.macros.calories * item.quantity,
            protein: acc.protein + item.macros.protein * item.quantity,
            carbs: acc.carbs + item.macros.carbs * item.quantity,
            fat: acc.fat + item.macros.fat * item.quantity,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return (
          <View key={mealType} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{mealType}</Text>
              <View style={styles.mealHeaderRight}>
                {mealMacros && (
                  <Text style={styles.mealCalories}>{Math.round(mealMacros.calories)} kcal</Text>
                )}
                <TouchableOpacity
                  style={styles.addFoodBtn}
                  onPress={() => setAddingMealType(mealType)}
                >
                  <Text style={styles.addFoodText}>+ Add Food</Text>
                </TouchableOpacity>
              </View>
            </View>

            {meal && meal.items.length > 0 ? (
              meal.items.map((item, i) => (
                <View key={i} style={styles.foodItem}>
                  <Text style={styles.foodName}>{item.foodName}</Text>
                  <Text style={styles.foodQty}>×{item.quantity}</Text>
                  <Text style={styles.foodCal}>{Math.round(item.macros.calories * item.quantity)} kcal</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updated = { ...meal, items: meal.items.filter((_, idx) => idx !== i) };
                      if (updated.items.length === 0) {
                        removeMeal(day, mealType);
                      } else {
                        updateMeal(day, mealType, updated);
                      }
                    }}
                  >
                    <Text style={styles.removeFood}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyMeal}>No foods added</Text>
            )}
          </View>
        );
      })}

      {addingMealType && (
        <AddFoodModal
          mealType={addingMealType}
          onAdd={(foodId, foodName, qty) => handleAddFood(addingMealType, foodId, foodName, qty)}
          onClose={() => setAddingMealType(null)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  macroCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  macroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  calBox: { alignItems: 'center', flex: 1.2 },
  calValue: { color: Colors.text, fontSize: 28, fontWeight: '800' },
  calLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  macroDivider: { width: 1, height: 40, backgroundColor: Colors.border, marginHorizontal: 8 },
  macroMini: { flex: 1, alignItems: 'center' },
  macroMiniVal: { fontSize: 16, fontWeight: '800' },
  macroMiniLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  macroMiniTarget: { color: Colors.textMuted, fontSize: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  progressLabel: { width: 54, color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  progressBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { width: 34, color: Colors.textMuted, fontSize: 10, textAlign: 'right' },
  mealCard: { backgroundColor: Colors.card, borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: Colors.surfaceLight },
  mealTitle: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  mealHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealCalories: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  addFoodBtn: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  addFoodText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  foodItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, gap: 6 },
  foodName: { flex: 1, color: Colors.text, fontSize: 13 },
  foodQty: { color: Colors.textMuted, fontSize: 12 },
  foodCal: { color: Colors.accent, fontSize: 12, fontWeight: '600', width: 60, textAlign: 'right' },
  removeFood: { color: Colors.error, fontSize: 14, paddingLeft: 8 },
  emptyMeal: { color: Colors.textMuted, fontSize: 12, padding: 12, fontStyle: 'italic' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  backBtn: { color: Colors.primary, fontSize: 14, marginBottom: 12 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  servingSize: { color: Colors.textMuted, fontSize: 13, marginBottom: 16 },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.card, color: Colors.text, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  searchInput: { backgroundColor: Colors.card, color: Colors.text, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  macroPreview: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginBottom: 20 },
  macroItem: { flex: 1, alignItems: 'center' },
  macroVal: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  macroLbl: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', marginTop: 8 },
  cancelText: { color: Colors.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { color: Colors.white, fontWeight: '700' },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  foodName: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  foodMeta: { color: Colors.textMuted, fontSize: 12 },
  foodAdd: { color: Colors.primary, fontSize: 24, fontWeight: '700', paddingLeft: 12 },
});
