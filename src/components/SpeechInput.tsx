import { useSpeech } from '../hooks/useSpeech';

interface SpeechInputProps {
  onParsedData: (data: Record<string, unknown>) => void;
}

export function SpeechInput({ onParsedData }: SpeechInputProps) {
  const { isListening, transcript, parsedData, isSupported, startListening, stopListening } = useSpeech();

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleApply = () => {
    if (Object.keys(parsedData).length > 0) {
      onParsedData(parsedData);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
          Speech recognition is not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">Voice Input</h3>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {isListening ? '🎤 Stop' : '🎤 Speak'}
        </button>
      </div>

      {transcript && (
        <div className="mb-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You said:</p>
          <p className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 p-3 rounded-lg">
            "{transcript}"
          </p>
        </div>
      )}

      {Object.keys(parsedData).length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Detected:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(parsedData).map(([key, value]) => (
              <span
                key={key}
                className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
          <button
            onClick={handleApply}
            className="mt-3 w-full py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Apply to Form
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Try: "I slept 7 hours, drank 6 glasses of water, exercised for 30 minutes"
      </p>
    </div>
  );
}
