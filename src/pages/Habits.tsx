import { useState, useEffect } from 'react';
import { useHabits } from '../hooks/useDatabase';
import { HabitList } from '../components/HabitList';
import { SuggestionCard } from '../components/SuggestionCard';
import { aiService } from '../services/aiService';
import { getAllDailyLogs } from '../db/database';
import type { Suggestion, Category } from '../types';

export function Habits() {
  const { habits, createHabit, removeHabit, toggleCompletion, getStreak, getWeeklyProgress, getMotivationalMessage } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<Category>('sleep');
  const [newHabitGoal, setNewHabitGoal] = useState(7);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      const logs = await getAllDailyLogs();
      const newSuggestions = await aiService.getSuggestions(logs.slice(0, 7));
      setSuggestions(newSuggestions.filter(s => s.habitName));
    };
    loadSuggestions();
  }, []);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await createHabit({
      name: newHabitName.trim(),
      category: newHabitCategory,
      isFromSuggestion: false,
      goalPerWeek: newHabitGoal,
    });

    setNewHabitName('');
    setNewHabitGoal(7);
    setShowAddForm(false);
  };

  const handleAdoptSuggestion = async (suggestion: Suggestion) => {
    if (suggestion.habitName) {
      await createHabit({
        name: suggestion.habitName,
        category: suggestion.category,
        isFromSuggestion: true,
        goalPerWeek: 7,
      });
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    }
  };

  const totalGoalsCompleted = habits.filter(h => {
    const { percentage } = getWeeklyProgress(h);
    return percentage >= 100;
  }).length;

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          ✅ Habit Tracker
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Build healthy routines, one day at a time
        </p>
      </header>

      {/* Weekly Summary Card */}
      {habits.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">This Week</p>
              <p className="text-2xl font-bold">{totalGoalsCompleted}/{habits.length} Goals</p>
              <p className="text-emerald-100 text-sm">completed</p>
            </div>
            <div className="text-5xl">
              {totalGoalsCompleted === habits.length && habits.length > 0 
                ? '🏆' 
                : totalGoalsCompleted > 0 
                ? '💪' 
                : '🎯'}
            </div>
          </div>
          {totalGoalsCompleted === habits.length && habits.length > 0 && (
            <p className="mt-2 text-emerald-100 text-sm">
              Amazing! You've crushed all your goals this week! 🎉
            </p>
          )}
        </div>
      )}

      {/* Add Habit Button */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Habit'}
        </button>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
            showSuggestions
              ? 'bg-amber-500 text-white'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}
        >
          💡
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <form onSubmit={handleAddHabit} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Category
            </label>
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value as Category)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="sleep">😴 Sleep</option>
              <option value="eat">🍎 Eating</option>
              <option value="exercise">🏃 Exercise</option>
              <option value="water">💧 Water</option>
              <option value="stress">🧘 Stress</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Weekly Goal (days per week)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="7"
                value={newHabitGoal}
                onChange={(e) => setNewHabitGoal(parseInt(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
              <span className="w-12 text-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {newHabitGoal}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {newHabitGoal === 7 ? 'Every day' : newHabitGoal === 1 ? 'Once a week' : `${newHabitGoal} days per week`}
            </p>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Add Habit
          </button>
        </form>
      )}

      {/* Suggested Habits */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            💡 Suggested Habits
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAdoptHabit={handleAdoptSuggestion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Habit List */}
      <HabitList
        habits={habits}
        onToggle={toggleCompletion}
        onDelete={removeHabit}
        getStreak={getStreak}
        getWeeklyProgress={getWeeklyProgress}
        getMotivationalMessage={getMotivationalMessage}
      />
    </div>
  );
}
