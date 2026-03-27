import type { Suggestion } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAdoptHabit?: (suggestion: Suggestion) => void;
}

export function SuggestionCard({ suggestion, onAdoptHabit }: SuggestionCardProps) {
  const icon = CATEGORY_ICONS[suggestion.category];
  const colorClass = CATEGORY_COLORS[suggestion.category];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-gray-800 dark:text-gray-200">{suggestion.text}</p>
          {suggestion.habitName && onAdoptHabit && (
            <button
              onClick={() => onAdoptHabit(suggestion)}
              className="mt-3 text-sm px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
            >
              + Add as habit: {suggestion.habitName}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
