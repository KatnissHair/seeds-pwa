import { useState, useCallback } from 'react';
import { speechService, parseSpokenInput, type SpeechResult } from '../services/speechService';

interface UseSpeechReturn {
  isListening: boolean;
  transcript: string;
  parsedData: Record<string, unknown>;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<Record<string, unknown>>({});

  const isSupported = speechService.isSupported();

  const startListening = useCallback(() => {
    setTranscript('');
    setParsedData({});
    setIsListening(true);

    speechService.start(
      (result: SpeechResult) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          const parsed = parseSpokenInput(result.transcript);
          setParsedData(parsed);
          setIsListening(false);
        }
      },
      (error: string) => {
        console.error('Speech error:', error);
        setIsListening(false);
      }
    );
  }, []);

  const stopListening = useCallback(() => {
    speechService.stop();
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setParsedData({});
  }, []);

  return {
    isListening,
    transcript,
    parsedData,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}
