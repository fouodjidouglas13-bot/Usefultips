import React, { useState } from 'react';
import { ReminderNotification } from '../types';
import { Bell, Check, Volume2, VolumeX, X, HelpCircle, Sparkles, BellRing } from 'lucide-react';
import { playAlarmChime } from '../utils/audioAlarm';

interface ReminderCenterProps {
  reminders: ReminderNotification[];
  onDismiss: (id: string) => void;
  onCompleteTask: (studentId: string, titleId: string, messageId: string) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  alarmEnabled: boolean;
  setAlarmEnabled: (enabled: boolean) => void;
}

export default function ReminderCenter({
  reminders,
  onDismiss,
  onCompleteTask,
  ttsEnabled,
  setTtsEnabled,
  alarmEnabled,
  setAlarmEnabled,
}: ReminderCenterProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Active unacknowledged popups
  const activePopups = reminders.filter((r) => !r.acknowledged);

  return (
    <div className="relative" id="reminder-center-container">
      {/* GLOBAL TOAST NOTIFICATIONS DRAWER - TOP RIGHT */}
      {activePopups.length > 0 && (
        <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-3 pointer-events-none" id="reminders-toasts">
          {activePopups.slice(-3).map((rem) => (
            <div
              key={rem.id}
              className="pointer-events-auto bg-white border border-neutral-200 shadow-xl rounded-2xl p-4.5 text-xs text-neutral-800 flex items-start gap-3.5 fade-in-up md:max-w-md w-full"
              style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
              id={`toast-item-${rem.id}`}
            >
              {/* CATEGORY BULLET */}
              <div className="bg-amber-100/50 text-base w-9 h-9 rounded-xl flex items-center justify-center border border-amber-200 shrink-0">
                {rem.avatarEmoji}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-neutral-900 leading-snug flex items-center gap-1.5">
                      <span>{rem.studentName} Reminders Alert</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono font-medium block">
                      Routine Scheduled: {rem.time}
                    </span>
                  </div>
                  <button
                    onClick={() => onDismiss(rem.id)}
                    className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded"
                    title="Close block alert"
                    id={`toast-close-${rem.id}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-neutral-700 font-semibold leading-normal mt-1 flex items-center gap-1">
                  <span>🔔</span> {rem.title}
                </p>
                <p className="text-[10px] text-neutral-500 leading-relaxed italic mt-0.5">
                  &quot;{rem.message}&quot;
                </p>

                {/* TOAST ACTION INTERACTION */}
                <div className="flex gap-2 pt-3 mt-1.5 border-t border-neutral-150">
                  <button
                    onClick={() => onDismiss(rem.id)}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-md px-2.5 py-1.5 transition font-medium"
                    id={`toast-dismiss-${rem.id}`}
                  >
                    Got It
                  </button>
                  <button
                    onClick={() => onCompleteTask(rem.studentId, rem.id, rem.title)}
                    className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-white rounded-md px-2.5 py-1.5 transition font-semibold"
                    id={`toast-complete-${rem.id}`}
                  >
                    Mark as Done
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPACT DASHBOARD AUDIO TOGGLE / RECENT LIST REMINDERS BAR */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm" id="reminder-status-controls">
        <div className="flex flex-col gap-4 pb-4 border-b border-neutral-100 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-display font-semibold text-neutral-800 flex items-center gap-1.5">
                <span>⏰ Automated Wakeup & Activity Alarms</span>
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Sound electronic chimes & reminders to wake up candidates.
              </p>
            </div>
            
            <button
              onClick={playAlarmChime}
              className="px-2.5 py-1 bg-neutral-950 text-white rounded-lg text-[10px] hover:bg-neutral-800 transition font-bold"
              title="Test physical bell chime"
              id="btn-test-chime"
            >
              🔊 Test Sound
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2" id="audio-settings-buttons">
            <button
              onClick={() => setAlarmEnabled(!alarmEnabled)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold select-none cursor-pointer transition ${
                alarmEnabled
                  ? 'bg-orange-50 border border-orange-300 text-orange-800'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-500 hover:bg-neutral-100'
              }`}
              title="Toggle automatic ringing alarm on schedule milestones"
              id="btn-toggle-alarm"
            >
              {alarmEnabled ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-orange-600 animate-bounce" />
                  <span>Alarm On  🔔</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Alarm Off 🔇</span>
                </>
              )}
            </button>

            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold select-none cursor-pointer transition ${
                ttsEnabled
                  ? 'bg-emerald-55 border border-emerald-300 text-emerald-800 bg-emerald-50'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-500 hover:bg-neutral-100'
              }`}
              title="Read out reminders using browser voices"
              id="btn-toggle-tts"
            >
              {ttsEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                  <span>Speech On 🎙️</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Speech Off 🔇</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ALERTS QUEUE HISTORY */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-medium">Notification Feed Queue:</span>
            {reminders.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] text-neutral-600 hover:underline hover:text-neutral-900 font-medium"
                id="btn-toggle-notif-history"
              >
                {showHistory ? 'Collapse History' : `View Logs (${reminders.length})`}
              </button>
            )}
          </div>

          {reminders.length === 0 ? (
            <div className="p-3 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-center text-neutral-500 text-[11px]" id="no-reminders-panel">
              <Bell className="w-4 h-4 text-neutral-300 mx-auto mb-1.5" />
              No notifications triggered yet today.
              <span className="block text-[10px] text-neutral-400 mt-0.5">
                Fast forward simulated time to hit drinking, eating, or bedtime goals!
              </span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {(showHistory ? reminders : reminders.slice(0, 3)).map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border text-left text-xs ${
                    rem.acknowledged
                      ? 'bg-neutral-50/70 border-neutral-150 text-neutral-500'
                      : 'bg-indigo-50/40 border-indigo-120 text-neutral-850'
                  }`}
                  id={`reminder-feed-${rem.id}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-800 block truncate leading-snug">
                      {rem.avatarEmoji} {rem.studentName} — {rem.title}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 font-medium">
                      {rem.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-normal mt-1 italic">
                    &quot;{rem.message}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
