import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { DailyLog } from '../types';

interface WeeklyChartProps {
  logs: DailyLog[];
  weekDates: string[];
}

export function WeeklyChart({ logs, weekDates }: WeeklyChartProps) {
  const chartData = weekDates.map((date) => {
    const log = logs.find((l) => l.date === date);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      date: dayName,
      sleep: log?.sleep.hours || 0,
      sleepQuality: log?.sleep.quality || 0,
      water: log?.water.glasses || 0,
      exercise: log?.exercise.minutes || 0,
      stress: log?.stress.level || 0,
      healthyEating: log?.meals.healthyChoices || 0,
    };
  });

  const avgSleep = logs.length ? (logs.reduce((sum, l) => sum + l.sleep.hours, 0) / logs.length).toFixed(1) : '0';
  const avgWater = logs.length ? (logs.reduce((sum, l) => sum + l.water.glasses, 0) / logs.length).toFixed(1) : '0';
  const avgExercise = logs.length ? Math.round(logs.reduce((sum, l) => sum + l.exercise.minutes, 0) / logs.length) : 0;
  const avgStress = logs.length ? (logs.reduce((sum, l) => sum + l.stress.level, 0) / logs.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">😴</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{avgSleep}h</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Sleep</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">💧</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgWater}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Glasses</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🏃</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{avgExercise}m</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Exercise</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🧘</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{avgStress}/5</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Stress</p>
        </div>
      </div>

      {/* Sleep Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Sleep Hours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis domain={[0, 12]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Bar dataKey="sleep" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Water & Exercise Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Water & Exercise</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Line
              type="monotone"
              dataKey="water"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
              name="Water (glasses)"
            />
            <Line
              type="monotone"
              dataKey="exercise"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ fill: '#F97316' }}
              name="Exercise (min)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Stress Level</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#A855F7"
              strokeWidth={2}
              dot={{ fill: '#A855F7' }}
              name="Stress Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
