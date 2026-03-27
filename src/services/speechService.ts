interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

export type SpeechCallback = (result: SpeechResult) => void;
export type ErrorCallback = (error: string) => void;
export type EndCallback = () => void;

class SpeechService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      console.warn('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(onResult: SpeechCallback, onError?: ErrorCallback, onEnd?: EndCallback): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      onResult({
        transcript: result[0].transcript,
        isFinal: result.isFinal,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    this.recognition.start();
    this.isListening = true;
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();

export function parseSpokenInput(transcript: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lower = transcript.toLowerCase();

  const sleepMatch = lower.match(/(\d+(?:\.\d+)?)\s*hours?\s*(?:of\s*)?sleep/);
  if (sleepMatch) {
    result.sleepHours = parseFloat(sleepMatch[1]);
  }

  const waterMatch = lower.match(/(\d+)\s*(?:glasses?|cups?)\s*(?:of\s*)?water/);
  if (waterMatch) {
    result.waterGlasses = parseInt(waterMatch[1]);
  }

  const exerciseMatch = lower.match(/(\d+)\s*minutes?\s*(?:of\s*)?(?:exercise|workout|running|walking|gym)/);
  if (exerciseMatch) {
    result.exerciseMinutes = parseInt(exerciseMatch[1]);
  }

  const exerciseTypeMatch = lower.match(/(?:did|went)\s+(?:for\s+)?(?:a\s+)?(\w+)/);
  if (exerciseTypeMatch) {
    const type = exerciseTypeMatch[1];
    if (['run', 'walk', 'gym', 'yoga', 'swim', 'cycling', 'bike'].includes(type)) {
      result.exerciseType = type;
    }
  }

  if (lower.includes('breakfast')) result.breakfast = true;
  if (lower.includes('lunch')) result.lunch = true;
  if (lower.includes('dinner')) result.dinner = true;

  const stressMatch = lower.match(/stress(?:ed)?\s*(?:level)?\s*(?:is\s*)?(\d|very high|high|medium|low|very low)/);
  if (stressMatch) {
    const level = stressMatch[1];
    if (level === 'very low' || level === '1') result.stressLevel = 1;
    else if (level === 'low' || level === '2') result.stressLevel = 2;
    else if (level === 'medium' || level === '3') result.stressLevel = 3;
    else if (level === 'high' || level === '4') result.stressLevel = 4;
    else if (level === 'very high' || level === '5') result.stressLevel = 5;
  }

  return result;
}
