
import React from "react";
import { AutomationLogEntry } from "../hooks/useVoiceAutomation";
import { Card } from "@/components/ui/card";

export const AutomationLog: React.FC<{
  log: AutomationLogEntry[];
}> = ({ log }) => {
  if (!log.length) return null;
  return (
    <Card className="mt-6 w-full max-w-xl mx-auto p-4 bg-slate-50 border">
      <h3 className="font-semibold mb-2 text-lg">Automation Log</h3>
      <ul className="space-y-1 text-xs max-h-64 overflow-y-auto">
        {log.map((entry, idx) => (
          <li key={idx} className="text-slate-700">
            <span className="font-mono text-slate-500 mr-2">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <b>{entry.deviceId}</b> — <span className="capitalize">{entry.action}</span> — <i>"{entry.word}"</i>
            <span className="ml-2">{entry.message}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AutomationLog;
