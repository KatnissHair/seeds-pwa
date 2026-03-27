import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDailyLog, useHabits, getDateString } from '../hooks/useDatabase';
import { aiService } from '../services/aiService';
import { SuggestionCard } from '../components/SuggestionCard';
import type { Suggestion } from '../types';
import { getAllDailyLogs } from '../db/database';

export function Home() {
  const today = getDateString();
  const { log } = useDailyLog(today);
  const { habits, createHabit, toggleCompletion, getStreak } = useHabits();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoadingSuggestions(true);
      const logs = await getAllDailyLogs();
      const recentLogs = logs.slice(0, 7);
      const newSuggestions = await aiService.getSuggestions(recentLogs);
      setSuggestions(newSuggestions);
      setLoadingSuggestions(false);
    };
    loadSuggestions();
  }, []);

  const handleAdoptHabit = async (suggestion: Suggestion) => {
    if (suggestion.habitName) {
      await createHabit({
        name: suggestion.habitName,
        category: suggestion.category,
        isFromSuggestion: true,
        goalPerWeek: 7,
      });
    }
  };

  const todayHabits = habits.slice(0, 3);
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          🌱 SEEDS
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </header>

      {/* Today's Status */}
      <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 mb-6 text-white">
        <h2 className="font-semibold mb-3">Today's Progress</h2>
        {log ? (
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="text-2xl">😴</p>
              <p className="text-lg font-bold">{log.sleep.hours}h</p>
            </div>
            <div>
              <p className="text-2xl">🍎</p>
              <p className="text-lg font-bold">{log.meals.healthyChoices}/10</p>
            </div>
            <div>
              <p className="text-2xl">🏃</p>
              <p className="text-lg font-bold">{log.exercise.minutes}m</p>
            </div>
            <div>
              <p className="text-2xl">💧</p>
              <p className="text-lg font-bold">{log.water.glasses}</p>
            </div>
            <div>
              <p className="text-2xl">🧘</p>
              <p className="text-lg font-bold">{log.stress.level}/5</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-3 opacity-90">You haven't logged today yet</p>
            <Link
              to="/log"
              className="inline-block px-6 py-2 bg-white text-emerald-600 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
            >
              Log Now
            </Link>
          </div>
        )}
      </section>

      {/* Quick Habits */}
      {todayHabits.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-white">Today's Habits</h2>
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              {completedToday}/{habits.length} done
            </span>
          </div>
          <div className="space-y-2">
            {todayHabits.map((habit) => {
              const isCompleted = habit.completedDates.includes(today);
              const streak = getStreak(habit);
              return (
                <button
                  key={habit.id}
                  onClick={() => habit.id && toggleCompletion(habit.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-700'
                  }`}>
                    {isCompleted ? '✓' : ''}
                  </span>
                  <span className={`flex-1 text-left ${isCompleted ? 'line-through opacity-60' : ''}`}>
                    {habit.name}
                  </span>
                  {streak > 0 && (
                    <span className="text-sm text-orange-500">🔥{streak}</span>
                  )}
                </button>
              );
            })}
          </div>
          <Link
            to="/habits"
            className="block text-center text-sm text-emerald-600 dark:text-emerald-400 mt-2"
          >
            View all habits →
          </Link>
        </section>
      )}

      {/* Suggestions */}
      <section>
        <h2 className="font-semibold text-gray-800 dark:text-white mb-3">
          💡 Suggestions for You
        </h2>
        {loadingSuggestions ? (
          <div className="text-center py-8">
            <div className="animate-spin text-3xl mb-2">⏳</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading suggestions...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAdoptHabit={handleAdoptHabit}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
