import { useState } from 'react';
import { useWeeklyLogs } from '../hooks/useDatabase';
import { WeeklyChart } from '../components/WeeklyChart';

export function Analysis() {
  const [weekOffset, setWeekOffset] = useState(0);
  
  const referenceDate = new Date();
  referenceDate.setDate(referenceDate.getDate() - weekOffset * 7);
  
  const { logs, loading, weekDates } = useWeeklyLogs(referenceDate);

  const weekStart = weekDates[0] ? new Date(weekDates[0]).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) : '';
  const weekEnd = weekDates[6] ? new Date(weekDates[6]).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) : '';

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          📊 Weekly Analysis
        </h1>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Previous
          </button>
          <p className="text-gray-500 dark:text-gray-400">
            {weekStart} - {weekEnd}
          </p>
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className={`p-2 ${
              weekOffset === 0 
                ? 'text-gray-300 dark:text-gray-600' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Next →
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-500 dark:text-gray-400">No data for this week.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Start logging daily to see your trends!
          </p>
        </div>
      ) : (
        <WeeklyChart logs={logs} weekDates={weekDates} />
      )}

      {/* Weekly Insights */}
      {logs.length > 0 && (
        <section className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
            💡 Weekly Insights
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {logs.length < 7 && (
              <li>• You logged {logs.length}/7 days this week. Try to log every day!</li>
            )}
            {logs.some(l => l.sleep.hours < 7) && (
              <li>• Some nights had less than 7 hours of sleep. Prioritize rest!</li>
            )}
            {logs.some(l => l.water.glasses < 6) && (
              <li>• Stay hydrated! Aim for 8+ glasses daily.</li>
            )}
            {logs.filter(l => l.exercise.minutes > 0).length >= 5 && (
              <li>• Great job staying active this week! 💪</li>
            )}
            {logs.every(l => l.stress.level <= 2) && (
              <li>• Your stress levels are well managed! Keep it up! 🧘</li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
