export type Posture = "臥位" | "側臥位" | "座位" | "立位";
export type Category = "筋トレ" | "ストレッチ" | "体幹";
export type BodyPart = "下肢" | "体幹" | "上肢";

export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  target: string;
  posture: Posture;
  category: Category;
  bodyPart: BodyPart;
  defaultReps: number;
  defaultSets: number;
  defaultHoldSeconds?: number;
  description: string;
  keyPoints: string[];
  illustration?: string; // asset path
}

export interface SelectedExercise {
  exerciseId: string;
  reps: number;
  sets: number;
  holdSeconds?: number;
  frequency: string;
  notes: string;
  order: number;
}

export interface HepSheet {
  id: string;
  name: string;
  exercises: SelectedExercise[];
  createdAt: string;
  updatedAt: string;
}
