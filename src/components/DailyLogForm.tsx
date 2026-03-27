import { useState, useEffect } from 'react';
import type { DailyLog, SleepData, MealsData, ExerciseData, WaterData, StressData } from '../types';

interface DailyLogFormProps {
  initialData?: DailyLog | null;
  onSave: (data: Omit<DailyLog, 'id' | 'date' | 'createdAt'>) => void;
  parsedSpeechData?: Record<string, unknown>;
}

const defaultSleep: SleepData = { hours: 7, quality: 3 };
const defaultMeals: MealsData = { breakfast: false, lunch: false, dinner: false, healthyChoices: 5 };
const defaultExercise: ExerciseData = { minutes: 0, type: '' };
const defaultWater: WaterData = { glasses: 0 };
const defaultStress: StressData = { level: 3, notes: '' };

export function DailyLogForm({ initialData, onSave, parsedSpeechData }: DailyLogFormProps) {
  const [sleep, setSleep] = useState<SleepData>(initialData?.sleep || defaultSleep);
  const [meals, setMeals] = useState<MealsData>(initialData?.meals || defaultMeals);
  const [exercise, setExercise] = useState<ExerciseData>(initialData?.exercise || defaultExercise);
  const [water, setWater] = useState<WaterData>(initialData?.water || defaultWater);
  const [stress, setStress] = useState<StressData>(initialData?.stress || defaultStress);

  useEffect(() => {
    if (initialData) {
      setSleep(initialData.sleep);
      setMeals(initialData.meals);
      setExercise(initialData.exercise);
      setWater(initialData.water);
      setStress(initialData.stress);
    }
  }, [initialData]);

  useEffect(() => {
    if (parsedSpeechData) {
      if (parsedSpeechData.sleepHours !== undefined) {
        setSleep(s => ({ ...s, hours: parsedSpeechData.sleepHours as number }));
      }
      if (parsedSpeechData.waterGlasses !== undefined) {
        setWater({ glasses: parsedSpeechData.waterGlasses as number });
      }
      if (parsedSpeechData.exerciseMinutes !== undefined) {
        setExercise(e => ({ ...e, minutes: parsedSpeechData.exerciseMinutes as number }));
      }
      if (parsedSpeechData.exerciseType !== undefined) {
        setExercise(e => ({ ...e, type: parsedSpeechData.exerciseType as string }));
      }
      if (parsedSpeechData.breakfast) setMeals(m => ({ ...m, breakfast: true }));
      if (parsedSpeechData.lunch) setMeals(m => ({ ...m, lunch: true }));
      if (parsedSpeechData.dinner) setMeals(m => ({ ...m, dinner: true }));
      if (parsedSpeechData.stressLevel !== undefined) {
        setStress(s => ({ ...s, level: parsedSpeechData.stressLevel as 1 | 2 | 3 | 4 | 5 }));
      }
    }
  }, [parsedSpeechData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ sleep, meals, exercise, water, stress });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sleep Section */}
      <section className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
        <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
          <span>😴</span> Sleep
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Hours slept</label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={sleep.hours}
              onChange={(e) => setSleep({ ...sleep, hours: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500"
            />
            <span className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{sleep.hours}h</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Sleep quality</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSleep({ ...sleep, quality: q as 1 | 2 | 3 | 4 | 5 })}
                  className={`w-10 h-10 rounded-full font-medium transition-all ${
                    sleep.quality === q
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meals Section */}
      <section className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
        <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
          <span>🍎</span> Eating
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
              <button
                key={meal}
                type="button"
                onClick={() => setMeals({ ...meals, [meal]: !meals[meal] })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium capitalize transition-all ${
                  meals[meal]
                    ? 'bg-green-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Healthy choices (0-10)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={meals.healthyChoices}
              onChange={(e) => setMeals({ ...meals, healthyChoices: parseInt(e.target.value) })}
              className="w-full accent-green-500"
            />
            <span className="text-lg font-medium text-green-600 dark:text-green-400">{meals.healthyChoices}/10</span>
          </div>
        </div>
      </section>

      {/* Exercise Section */}
      <section className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
        <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
          <span>🏃</span> Exercise
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Minutes</label>
            <input
              type="number"
              min="0"
              max="300"
              value={exercise.minutes}
              onChange={(e) => setExercise({ ...exercise, minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Type</label>
            <input
              type="text"
              placeholder="e.g., Running, Yoga, Gym"
              value={exercise.type}
              onChange={(e) => setExercise({ ...exercise, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </section>

      {/* Water Section */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
          <span>💧</span> Drinking Water
        </h3>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Glasses (250ml each)</label>
          <div className="flex flex-wrap gap-2">
            {[...Array(12)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setWater({ glasses: i + 1 })}
                className={`w-10 h-10 rounded-full transition-all ${
                  i < water.glasses
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                }`}
              >
                💧
              </button>
            ))}
          </div>
          <span className="block mt-2 text-lg font-medium text-blue-600 dark:text-blue-400">
            {water.glasses} glasses
          </span>
        </div>
      </section>

      {/* Stress Section */}
      <section className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
        <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
          <span>🧘</span> Stress
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Stress level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setStress({ ...stress, level: level as 1 | 2 | 3 | 4 | 5 })}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    stress.level === level
                      ? 'bg-purple-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  }`}
                >
                  {level === 1 ? '😌' : level === 2 ? '🙂' : level === 3 ? '😐' : level === 4 ? '😟' : '😰'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Notes (optional)</label>
            <textarea
              value={stress.notes || ''}
              onChange={(e) => setStress({ ...stress, notes: e.target.value })}
              placeholder="What's on your mind?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors"
      >
        Save Today's Log
      </button>
    </form>
  );
}
