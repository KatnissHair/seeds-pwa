export interface SleepData {
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface MealsData {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  healthyChoices: number;
}

export interface ExerciseData {
  minutes: number;
  type: string;
}

export interface WaterData {
  glasses: number;
}

export interface StressData {
  level: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface DailyLog {
  id?: number;
  date: string;
  sleep: SleepData;
  meals: MealsData;
  exercise: ExerciseData;
  water: WaterData;
  stress: StressData;
  createdAt: Date;
}

export interface Habit {
  id?: number;
  name: string;
  category: 'sleep' | 'eat' | 'exercise' | 'water' | 'stress';
  isFromSuggestion: boolean;
  completedDates: string[];
  goalPerWeek: number;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  category: 'sleep' | 'eat' | 'exercise' | 'water' | 'stress';
  text: string;
  habitName?: string;
}

export type Category = 'sleep' | 'eat' | 'exercise' | 'water' | 'stress';

export const CATEGORY_ICONS: Record<Category, string> = {
  sleep: '😴',
  eat: '🍎',
  exercise: '🏃',
  water: '💧',
  stress: '🧘',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  sleep: 'bg-indigo-500',
  eat: 'bg-green-500',
  exercise: 'bg-orange-500',
  water: 'bg-blue-500',
  stress: 'bg-purple-500',
};
