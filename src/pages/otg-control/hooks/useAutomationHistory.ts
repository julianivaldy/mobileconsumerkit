
import { useState, useEffect } from 'react';

export interface AutomationHistoryEntry {
  id: string;
  timestamp: Date;
  deviceIds: string[];
  rulesCount: number;
  status: 'started' | 'stopped' | 'error';
  duration?: number;
  stats?: {
    videosProcessed: number;
    actionsPerformed: number;
    errors: number;
  };
}

export const useAutomationHistory = () => {
  const [automationHistory, setAutomationHistory] = useState<AutomationHistoryEntry[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('automation_history');
    if (savedHistory) {
      setAutomationHistory(JSON.parse(savedHistory).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
    }
  }, []);

  const saveHistoryEntry = (entry: AutomationHistoryEntry) => {
    const updatedHistory = [entry, ...automationHistory.slice(0, 49)];
    setAutomationHistory(updatedHistory);
    localStorage.setItem('automation_history', JSON.stringify(updatedHistory));
  };

  return {
    automationHistory,
    saveHistoryEntry
  };
};
