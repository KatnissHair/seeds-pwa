import type { Habit } from '../types';
import { CATEGORY_ICONS } from '../types';
import { getDateString } from '../hooks/useDatabase';

interface HabitListProps {
  habits: Habit[];
  onToggle: (habitId: number) => void;
  onDelete: (habitId: number) => void;
  getStreak: (habit: Habit) => number;
  getWeeklyProgress: (habit: Habit) => { completed: number; goal: number; percentage: number };
  getMotivationalMessage: (habit: Habit) => { message: string; emoji: string };
}

export function HabitList({ habits, onToggle, onDelete, getStreak, getWeeklyProgress, getMotivationalMessage }: HabitListProps) {
  const today = getDateString();

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🌱</p>
        <p className="text-gray-500 dark:text-gray-400">No habits yet.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Add a habit or adopt a suggestion to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const isCompletedToday = habit.completedDates.includes(today);
        const streak = getStreak(habit);
        const icon = CATEGORY_ICONS[habit.category];
        const { completed, goal, percentage } = getWeeklyProgress(habit);
        const { message, emoji } = getMotivationalMessage(habit);

        return (
          <div
            key={habit.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 transition-all ${
              isCompletedToday ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => habit.id && onToggle(habit.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompletedToday
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {isCompletedToday ? '✓' : icon}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {habit.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    {habit.category}
                  </span>
                  {habit.isFromSuggestion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      suggested
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {streak > 0 && (
                  <p className="text-lg font-bold text-orange-500">
                    🔥 {streak}
                  </p>
                )}
              </div>

              <button
                onClick={() => habit.id && onDelete(habit.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                🗑️
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Weekly Goal</span>
                <span>{completed}/{goal} days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    percentage >= 100
                      ? 'bg-emerald-500'
                      : percentage >= 50
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Motivational Message */}
            <div className={`flex items-center gap-2 text-sm ${
              percentage >= 100 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : percentage >= 50 
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              <span>{emoji}</span>
              <span>{message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
