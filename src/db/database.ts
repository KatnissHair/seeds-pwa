import Dexie, { type EntityTable } from 'dexie';
import type { DailyLog, Habit } from '../types';

const db = new Dexie('SeedsDatabase') as Dexie & {
  dailyLogs: EntityTable<DailyLog, 'id'>;
  habits: EntityTable<Habit, 'id'>;
};

db.version(1).stores({
  dailyLogs: '++id, date, createdAt',
  habits: '++id, name, category, createdAt',
});

export { db };

export async function addDailyLog(log: Omit<DailyLog, 'id'>): Promise<number> {
  const id = await db.dailyLogs.add(log as DailyLog);
  return id as number;
}

export async function updateDailyLog(id: number, log: Partial<DailyLog>): Promise<number> {
  return await db.dailyLogs.update(id, log);
}

export async function getDailyLogByDate(date: string): Promise<DailyLog | undefined> {
  return await db.dailyLogs.where('date').equals(date).first();
}

export async function getDailyLogs(startDate: string, endDate: string): Promise<DailyLog[]> {
  return await db.dailyLogs
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function getAllDailyLogs(): Promise<DailyLog[]> {
  return await db.dailyLogs.orderBy('date').reverse().toArray();
}

export async function addHabit(habit: Omit<Habit, 'id'>): Promise<number> {
  const id = await db.habits.add(habit as Habit);
  return id as number;
}

export async function updateHabit(id: number, habit: Partial<Habit>): Promise<number> {
  return await db.habits.update(id, habit);
}

export async function deleteHabit(id: number): Promise<void> {
  await db.habits.delete(id);
}

export async function getAllHabits(): Promise<Habit[]> {
  return await db.habits.toArray();
}

export async function toggleHabitCompletion(habitId: number, date: string): Promise<void> {
  const habit = await db.habits.get(habitId);
  if (!habit) return;

  const completedDates = habit.completedDates || [];
  const index = completedDates.indexOf(date);

  if (index > -1) {
    completedDates.splice(index, 1);
  } else {
    completedDates.push(date);
  }

  await db.habits.update(habitId, { completedDates });
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getWeekDates(date: Date = new Date()): string[] {
  const dates: string[] = [];
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(diff + i);
    dates.push(getDateString(d));
  }
  
  return dates;
}
