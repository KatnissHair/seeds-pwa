import { useState } from 'react';
import { useDailyLog, getDateString } from '../hooks/useDatabase';
import { DailyLogForm } from '../components/DailyLogForm';
import { SpeechInput } from '../components/SpeechInput';

export function Log() {
  const today = getDateString();
  const { log, loading, saveLog } = useDailyLog(today);
  const [parsedSpeechData, setParsedSpeechData] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = async (data: Parameters<typeof saveLog>[0]) => {
    await saveLog(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          📝 Daily Log
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </header>

      {saved && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          ✓ Saved successfully!
        </div>
      )}

      <SpeechInput onParsedData={setParsedSpeechData} />

      <DailyLogForm
        initialData={log}
        onSave={handleSave}
        parsedSpeechData={parsedSpeechData}
      />
    </div>
  );
}
