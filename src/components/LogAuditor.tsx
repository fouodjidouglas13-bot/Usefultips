import React from 'react';
import { SystemLogs } from '../types';
import { ClipboardList, Trash2, CalendarRange, Clock } from 'lucide-react';

interface LogAuditorProps {
  logs: SystemLogs[];
  onClear: () => void;
}

export default function LogAuditor({ logs, onClear }: LogAuditorProps) {
  // Format relative timestamp helper
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm" id="log-auditor">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-150">
            <ClipboardList className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold text-neutral-800">
              Routines Classroom Audit
            </h2>
            <p className="text-[11px] text-neutral-550 text-neutral-500 mt-0.5">
              Live updates of student actions and status updates
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-neutral-500 hover:text-neutral-800 underline font-medium"
            id="btn-clear-logs"
          >
            Clear Log Feed
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-8 border border-dashed border-neutral-180 bg-neutral-50/50 text-center rounded-xl text-neutral-450 text-xs flex flex-col items-center justify-center gap-1.5" id="no-audit-logs">
          <CalendarRange className="w-5 h-5 text-neutral-300" />
          <span className="font-semibold text-neutral-600">Audit report is empty</span>
          <span className="text-[10px] text-neutral-400 mt-0.5">
            Log counts are triggered automatically when children hydrate, sleep, or study.
          </span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" id="logs-feed-list">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 text-[11px] flex items-start gap-2 text-neutral-600 hover:bg-neutral-100/50 duration-150 transition"
            >
              <div className="text-[12px] pt-0.5 leading-none">📋</div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono py-0.5 px-1 bg-neutral-200 text-neutral-700 font-semibold rounded mr-1.5 inline-block shrink-0">
                  {formatTime(log.time)}
                </span>
                <strong className="text-neutral-800 font-semibold mr-1">{log.studentName}</strong>
                <span className="break-all">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
