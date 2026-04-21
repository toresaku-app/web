import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "react-native";
import { SelectedExercise } from "../types/exercise";
import { EXERCISES } from "../constants/exercises";

interface HepState {
  selectedExercises: SelectedExercise[];
  sheetPurpose: string;
  addExercise: (exerciseId: string) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<SelectedExercise>) => void;
  reorderExercises: (exercises: SelectedExercise[]) => void;
  setSheetPurpose: (purpose: string) => void;
  clearAll: () => void;
}

const storeCreator: StateCreator<HepState> = (set) => ({
  selectedExercises: [],
  sheetPurpose: "",

  addExercise: (exerciseId: string) =>
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
        purpose: "",
        order: state.selectedExercises.length,
      };
      return { selectedExercises: [...state.selectedExercises, newExercise] };
    }),

  removeExercise: (exerciseId: string) =>
    set((state) => ({
      selectedExercises: state.selectedExercises
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, i) => ({ ...e, order: i })),
    })),

  updateExercise: (exerciseId: string, updates: Partial<SelectedExercise>) =>
    set((state) => ({
      selectedExercises: state.selectedExercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, ...updates } : e
      ),
    })),

  reorderExercises: (exercises: SelectedExercise[]) =>
    set({ selectedExercises: exercises.map((e, i) => ({ ...e, order: i })) }),

  setSheetPurpose: (purpose: string) => set({ sheetPurpose: purpose }),

  clearAll: () => set({ selectedExercises: [], sheetPurpose: "" }),
});

const isWeb = Platform.OS === "web";
const hasSessionStorage = typeof sessionStorage !== "undefined";

export const useHepStore =
  isWeb && hasSessionStorage
    ? create<HepState>()(
        persist(storeCreator, {
          name: "hep-store",
          storage: createJSONStorage(() => sessionStorage),
        })
      )
    : create<HepState>()(storeCreator);
