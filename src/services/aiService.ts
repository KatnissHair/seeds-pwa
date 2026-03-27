import type { DailyLog, Suggestion, Category } from '../types';

interface WindowAI {
  languageModel?: {
    capabilities(): Promise<{ available: string }>;
    create(options?: { systemPrompt?: string }): Promise<AISession>;
  };
}

interface AISession {
  prompt(text: string): Promise<string>;
  destroy(): void;
}

declare global {
  interface Window {
    ai?: WindowAI;
  }
}

class AIService {
  private session: AISession | null = null;
  private isAvailable: boolean | null = null;

  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;

    try {
      if (window.ai?.languageModel) {
        const capabilities = await window.ai.languageModel.capabilities();
        this.isAvailable = capabilities.available === 'readily';
      } else {
        this.isAvailable = false;
      }
    } catch {
      this.isAvailable = false;
    }

    return this.isAvailable;
  }

  async initSession(): Promise<boolean> {
    if (this.session) return true;

    const available = await this.checkAvailability();
    if (!available) return false;

    try {
      this.session = await window.ai!.languageModel!.create({
        systemPrompt: `You are a health and wellness assistant for the SEEDS app. 
SEEDS tracks: Sleep, Eating, Exercise, Drinking water, and Stress.
Provide brief, actionable health suggestions based on user data.
Keep responses under 100 words. Be encouraging but realistic.`
      });
      return true;
    } catch {
      return false;
    }
  }

  async getSuggestions(logs: DailyLog[]): Promise<Suggestion[]> {
    const hasAI = await this.initSession();

    if (hasAI && this.session) {
      try {
        const prompt = this.buildPrompt(logs);
        const response = await this.session.prompt(prompt);
        return this.parseAIResponse(response);
      } catch {
        return this.getRuleBasedSuggestions(logs);
      }
    }

    return this.getRuleBasedSuggestions(logs);
  }

  private buildPrompt(logs: DailyLog[]): string {
    if (logs.length === 0) {
      return 'User just started tracking. Give 3 general wellness tips for sleep, exercise, and hydration.';
    }

    const avgSleep = logs.reduce((sum, l) => sum + l.sleep.hours, 0) / logs.length;
    const avgWater = logs.reduce((sum, l) => sum + l.water.glasses, 0) / logs.length;
    const avgExercise = logs.reduce((sum, l) => sum + l.exercise.minutes, 0) / logs.length;
    const avgStress = logs.reduce((sum, l) => sum + l.stress.level, 0) / logs.length;

    return `Based on this week's data:
- Average sleep: ${avgSleep.toFixed(1)} hours/night
- Average water: ${avgWater.toFixed(1)} glasses/day
- Average exercise: ${avgExercise.toFixed(0)} minutes/day
- Average stress level: ${avgStress.toFixed(1)}/5

Provide 3 specific, actionable suggestions to improve their weakest areas. Format each as: [CATEGORY]: suggestion text`;
  }

  private parseAIResponse(response: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const lines = response.split('\n').filter(l => l.trim());

    const categoryMap: Record<string, Category> = {
      'sleep': 'sleep',
      'eat': 'eat',
      'eating': 'eat',
      'food': 'eat',
      'nutrition': 'eat',
      'exercise': 'exercise',
      'workout': 'exercise',
      'water': 'water',
      'hydration': 'water',
      'stress': 'stress',
      'mental': 'stress',
    };

    lines.forEach((line, index) => {
      const match = line.match(/\[?(\w+)\]?:?\s*(.+)/i);
      if (match) {
        const categoryKey = match[1].toLowerCase();
        const category = categoryMap[categoryKey] || 'sleep';
        suggestions.push({
          id: `ai-${index}`,
          category,
          text: match[2].trim(),
        });
      }
    });

    return suggestions.slice(0, 5);
  }

  getRuleBasedSuggestions(logs: DailyLog[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (logs.length === 0) {
      return [
        { id: 'rule-1', category: 'sleep', text: 'Aim for 7-9 hours of sleep each night for optimal health.', habitName: 'Sleep 7+ hours' },
        { id: 'rule-2', category: 'water', text: 'Drink at least 8 glasses of water daily to stay hydrated.', habitName: 'Drink 8 glasses of water' },
        { id: 'rule-3', category: 'exercise', text: 'Try to get at least 30 minutes of exercise each day.', habitName: '30 min daily exercise' },
      ];
    }

    const avgSleep = logs.reduce((sum, l) => sum + l.sleep.hours, 0) / logs.length;
    const avgWater = logs.reduce((sum, l) => sum + l.water.glasses, 0) / logs.length;
    const avgExercise = logs.reduce((sum, l) => sum + l.exercise.minutes, 0) / logs.length;
    const avgStress = logs.reduce((sum, l) => sum + l.stress.level, 0) / logs.length;
    const avgSleepQuality = logs.reduce((sum, l) => sum + l.sleep.quality, 0) / logs.length;

    if (avgSleep < 7) {
      suggestions.push({
        id: 'rule-sleep-1',
        category: 'sleep',
        text: `You're averaging ${avgSleep.toFixed(1)} hours of sleep. Try to get to bed 30 minutes earlier.`,
        habitName: 'Go to bed 30 min earlier',
      });
    }

    if (avgSleepQuality < 3) {
      suggestions.push({
        id: 'rule-sleep-2',
        category: 'sleep',
        text: 'Your sleep quality is low. Avoid screens 1 hour before bed.',
        habitName: 'No screens before bed',
      });
    }

    if (avgWater < 8) {
      suggestions.push({
        id: 'rule-water-1',
        category: 'water',
        text: `You're drinking ${avgWater.toFixed(1)} glasses/day. Set reminders to drink water every 2 hours.`,
        habitName: 'Water reminder every 2 hours',
      });
    }

    if (avgExercise < 30) {
      suggestions.push({
        id: 'rule-exercise-1',
        category: 'exercise',
        text: `You're averaging ${avgExercise.toFixed(0)} minutes of exercise. Try a 15-minute walk after lunch.`,
        habitName: '15 min walk after lunch',
      });
    }

    if (avgStress > 3) {
      suggestions.push({
        id: 'rule-stress-1',
        category: 'stress',
        text: 'Your stress levels are elevated. Try 5 minutes of deep breathing daily.',
        habitName: '5 min breathing exercise',
      });
    }

    const mealsSkipped = logs.filter(l => !l.meals.breakfast || !l.meals.lunch || !l.meals.dinner).length;
    if (mealsSkipped > logs.length / 2) {
      suggestions.push({
        id: 'rule-eat-1',
        category: 'eat',
        text: 'You\'re skipping meals often. Regular meals help maintain energy levels.',
        habitName: 'Eat 3 meals daily',
      });
    }

    return suggestions.slice(0, 5);
  }

  destroy(): void {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }
}

export const aiService = new AIService();
