import { create } from "zustand";
import { SelectedExercise } from "../types/exercise";
import { EXERCISES } from "../constants/exercises";

interface HepState {
  selectedExercises: SelectedExercise[];
  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<SelectedExercise>) => void;
  reorderExercises: (exercises: SelectedExercise[]) => void;
  clearAll: () => void;
}

export const useHepStore = create<HepState>((set) => ({
  selectedExercises: [],

  addExercise: (exerciseId) =>
    set((state) => {
      if (state.selectedExercises.some((e) => e.exerciseId === exerciseId)) {
        return state;
      }
      const exercise = EXERCISES.find((e) => e.id === exerciseId);
      if (!exercise) return state;

      const newExercise: SelectedExercise = {
        exerciseId,
        reps: exercise.defaultReps,
        sets: exercise.defaultSets,
        holdSeconds: exercise.defaultHoldSeconds,
        frequency: "1日2〜3回",
        notes: "",
        order: state.selectedExercises.length,
      };
      return { selectedExercises: [...state.selectedExercises, newExercise] };
    }),

  removeExercise: (exerciseId) =>
    set((state) => ({
      selectedExercises: state.selectedExercises
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, i) => ({ ...e, order: i })),
    })),

  updateExercise: (exerciseId, updates) =>
    set((state) => ({
      selectedExercises: state.selectedExercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, ...updates } : e
      ),
    })),

  reorderExercises: (exercises) => set({ selectedExercises: exercises }),

  clearAll: () => set({ selectedExercises: [] }),
}));
