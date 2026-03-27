import { useState, useEffect, useCallback } from 'react';
import {
  db,
  getDailyLogByDate,
  addDailyLog,
  updateDailyLog,
  getDailyLogs,
  getAllHabits,
  addHabit,
  deleteHabit,
  toggleHabitCompletion,
  getDateString,
  getWeekDates,
} from '../db/database';
import type { DailyLog, Habit } from '../types';

export function useDailyLog(date: string) {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      const existingLog = await getDailyLogByDate(date);
      setLog(existingLog || null);
      setLoading(false);
    };
    fetchLog();
  }, [date]);

  const saveLog = useCallback(async (logData: Omit<DailyLog, 'id' | 'date' | 'createdAt'>) => {
    const fullLog: Omit<DailyLog, 'id'> = {
      ...logData,
      date,
      createdAt: new Date(),
    };

    if (log?.id) {
      await updateDailyLog(log.id, fullLog);
      setLog({ ...fullLog, id: log.id });
    } else {
      const id = await addDailyLog(fullLog);
      setLog({ ...fullLog, id });
    }
  }, [date, log]);

  return { log, loading, saveLog };
}

export function useWeeklyLogs(referenceDate: Date = new Date()) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekDates, setWeekDates] = useState<string[]>([]);

  const dateKey = getDateString(referenceDate);

  useEffect(() => {
    const dates = getWeekDates(referenceDate);
    setWeekDates(dates);

    const fetchLogs = async () => {
      setLoading(true);
      const weekLogs = await getDailyLogs(dates[0], dates[6]);
      setLogs(weekLogs);
      setLoading(false);
    };
    fetchLogs();
  }, [dateKey]);

  return { logs, loading, weekDates };
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    const allHabits = await getAllHabits();
    setHabits(allHabits);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = useCallback(async (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Omit<Habit, 'id'> = {
      ...habit,
      completedDates: [],
      createdAt: new Date(),
    };
    await addHabit(newHabit);
    await fetchHabits();
  }, [fetchHabits]);

  const removeHabit = useCallback(async (id: number) => {
    await deleteHabit(id);
    await fetchHabits();
  }, [fetchHabits]);

  const toggleCompletion = useCallback(async (habitId: number, date: string = getDateString()) => {
    await toggleHabitCompletion(habitId, date);
    await fetchHabits();
  }, [fetchHabits]);

  const getStreak = useCallback((habit: Habit): number => {
    if (!habit.completedDates.length) return 0;

    const sortedDates = [...habit.completedDates].sort().reverse();
    const today = getDateString();
    
    let streak = 0;
    let currentDate = new Date(today);

    for (const dateStr of sortedDates) {
      const expectedDate = getDateString(currentDate);
      if (dateStr === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateStr < expectedDate) {
        break;
      }
    }

    return streak;
  }, []);

  return { habits, loading, createHabit, removeHabit, toggleCompletion, getStreak, refetch: fetchHabits };
}

export { getDateString, getWeekDates, db };
