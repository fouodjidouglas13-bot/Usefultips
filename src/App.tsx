import React, { useState, useEffect, useRef } from 'react';
import { Student, ScheduleItem, SystemLogs, ReminderNotification } from './types';
import ClockPanel from './components/ClockPanel';
import StudentList from './components/StudentList';
import ScheduleTimeline from './components/ScheduleTimeline';
import AIOptimizer from './components/AIOptimizer';
import ReminderCenter from './components/ReminderCenter';
import LogAuditor from './components/LogAuditor';
import { Heart, ShieldCheck, Sparkles, BellRing, Megaphone, CheckCircle, Volume2 } from 'lucide-react';
import { playAlarmChime } from './utils/audioAlarm';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [logs, setLogs] = useState<SystemLogs[]>([]);
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);

  // Clock variables
  const [currentSimTime, setCurrentSimTime] = useState<Date>(new Date());
  const [simSpeed, setSimSpeed] = useState<number>(1); // default real-time 1x
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    studentId: string;
    studentName: string;
    avatarEmoji: string;
    title: string;
    time: string;
    description: string;
    type: string;
  } | null>(null);

  // Keep track of fired alarm hashes to avoid duplicates within same simulated minute
  const firedAlarmsRef = useRef<Set<string>>(new Set());

  // Fetch student registries on mount
  const fetchStudentsData = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setLogs(data.logs || []);
        if (data.students?.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data.students[0].id);
        }
      }
    } catch (err) {
      console.error('Failed fetching students schedule databases:', err);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  // SIMULATOR TIME TICK CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      if (simSpeed === 0) return;

      setCurrentSimTime((prevTime) => {
        // Increment time
        const nextTime = new Date(prevTime.getTime() + 1000 * simSpeed);

        // Check if the simulated minute changed
        const prevMin = prevTime.getMinutes();
        const nextMin = nextTime.getMinutes();
        
        if (prevMin !== nextMin) {
          // Check triggers in the background
          checkForReminders(nextTime);
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simSpeed, students, ttsEnabled, alarmEnabled]);

  // Routine check to trigger scheduled notifications
  const checkForReminders = (simTime: Date) => {
    if (students.length === 0) return;

    const hourStr = String(simTime.getHours()).padStart(2, '0');
    const minStr = String(simTime.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hourStr}:${minStr}`;

    const newNotifications: ReminderNotification[] = [];

    students.forEach((student) => {
      student.schedules.forEach((item) => {
        // Match scheduled time and automated alert status
        if (item.time === timeFormatted && item.automaticReminder) {
          const alarmHash = `${student.id}-${item.id}-${simTime.toDateString()}-${timeFormatted}`;

          if (!firedAlarmsRef.current.has(alarmHash)) {
            firedAlarmsRef.current.add(alarmHash);

            // Create notification item
            const newNotif: ReminderNotification = {
              id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              studentId: student.id,
              studentName: student.name,
              avatarEmoji: student.avatarEmoji,
              type: item.type,
              title: item.title,
              time: item.time,
              message: item.description || `Student schedule routine: ${item.title} needs execution now.`,
              triggeredAt: Date.now(),
              acknowledged: false,
            };

            newNotifications.push(newNotif);

            // AUTO ALARM SOUND & MODAL TRIGGER
            if (alarmEnabled) {
              playAlarmChime();
              setActiveAlarm({
                id: newNotif.id,
                studentId: student.id,
                studentName: student.name,
                avatarEmoji: student.avatarEmoji,
                title: item.title,
                time: item.time,
                description: item.description || `It is time for ${item.title}!`,
                type: item.type,
              });
            }

            // NATIVE TTS SPEECH TRIGGER
            if (ttsEnabled && window.speechSynthesis) {
              const speakText = `Automated reminders for ${student.name}. At simulated clock time ${item.time}. It is time for ${item.title}. Tip: ${item.description || 'Drink water and breathe deeply'}`;
              const utterance = new SpeechSynthesisUtterance(speakText);
              utterance.rate = 1.0;
              window.speechSynthesis.speak(utterance);
            }
          }
        }
      });
    });

    if (newNotifications.length > 0) {
      setReminders((prev) => [...newNotifications, ...prev]);
    }
  };

  // Profile Action triggers: Drink Water or check completes
  const handleStudentAction = async (studentId: string, actionBody: any) => {
    try {
      const res = await fetch(`/api/students/${studentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionBody),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state smoothly
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed triggering healthy log action:', err);
    }
  };

  // Add individual custom schedule task
  const handleAddTask = async (studentId: string, taskItem: any) => {
    try {
      const res = await fetch(`/api/students/${studentId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskItem),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed appending custom schedule block:', err);
    }
  };

  // Delete individual schedule task
  const handleDeleteTask = async (studentId: string, scheduleId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed deleting schedule block:', err);
    }
  };

  // Register fully new Student
  const handleRegisterStudent = async (studentPayload: Partial<Student>) => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setSelectedStudentId(studentPayload.id || data.students[0].id);
      }
    } catch (err) {
      console.error('Failed registering new candidate:', err);
    }
  };

  // Delete student registry
  const handleDeleteStudent = async (studentId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        if (selectedStudentId === studentId) {
          setSelectedStudentId(data.students[0]?.id || '');
        }
      }
    } catch (err) {
      console.error('Failed deleting student profile:', err);
    }
  };

  // Overwrite schedules with AI Generated plan
  const handleApplyAIPlan = async (studentId: string, generatedItems: ScheduleItem[]) => {
    try {
      const res = await fetch(`/api/students/${studentId}/overwrite-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: generatedItems }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed applying AI custom schedules:', err);
    }
  };

  // Revert whole database to set cohorts defaults
  const handleRevertCohort = async () => {
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setLogs([]);
        setReminders([]);
        firedAlarmsRef.current.clear();
        if (data.students?.length > 0) {
          setSelectedStudentId(data.students[0].id);
        }
      }
    } catch (err) {
      console.error('Failed resetting cohort state:', err);
    }
  };

  // Toast / Reminder Dismiss
  const handleDismissReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, acknowledged: true } : r))
    );
  };

  // Complete routine from toast click
  const handleCompleteFromToast = async (studentId: string, toastId: string, routineTitle: string) => {
    // 1. Locate schedule matching routine title
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const item = student.schedules.find((sc) => sc.title === routineTitle);
      if (item) {
        // Toggle complete in database
        await handleStudentAction(studentId, {
          actionType: 'toggle_schedule_completed',
          scheduleId: item.id,
        });
      }
    }
    // Acknowledge toast
    handleDismissReminder(toastId);
  };

  const handleAcknowledgeAlarm = async () => {
    if (!activeAlarm) return;
    const { studentId, title } = activeAlarm;
    
    // 1. Locate student and schedule
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const item = student.schedules.find((sc) => sc.title === title);
      if (item) {
        // Toggle complete in database
        await handleStudentAction(studentId, {
          actionType: 'toggle_schedule_completed',
          scheduleId: item.id,
        });
      }
    }
    
    // 2. Dismiss corresponding notification if active
    setReminders((prev) =>
      prev.map((r) => (r.studentId === studentId && r.title === title ? { ...r, acknowledged: true } : r))
    );
    
    setActiveAlarm(null);
  };

  const handleSnoozeAlarm = () => {
    if (!activeAlarm) return;
    
    // Post a local log state entry that they snoozed 
    const snoozeLog: SystemLogs = {
      id: `log-${Date.now()}`,
      studentId: activeAlarm.studentId,
      studentName: activeAlarm.studentName,
      time: new Date().toLocaleTimeString().substring(0, 5),
      type: activeAlarm.type as any,
      message: `⏳ Alarm for "${activeAlarm.title}" was snoozed. Giving candidate a 5-minute physical breathing pocket.`,
    };
    
    setLogs((prev) => [snoozeLog, ...prev]);
    setActiveAlarm(null);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col pt-4 pb-12 px-4 md:px-8 max-w-7xl mx-auto" id="app-viewport">
      {/* BRAND HEADER BAR */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5 mb-6" id="brand-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <h1 className="text-xl font-display font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Cameroon GCE Prep Healthy Scheduler
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-bold tracking-widest border border-emerald-200 px-1.5 py-0.5 rounded-full">
              Live Tracker
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            Protect the mental and physical well-being of Cameroonian GCE examination candidates, covering both GCE Advanced Level (A-Level) and Ordinary Level (O-Level) classes. Formulate balanced hours for healthy eating, heavy hydration, active cardio, micro recreation, and REM stage sleep.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 p-2.5 shadow-xs" id="header-counters">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-bold block leading-none">TOTAL CANDIDATES</span>
            <span className="font-mono text-xs font-semibold text-neutral-800 mt-1 block">
              🎓 {students.length} Registered
            </span>
          </div>
        </div>
      </header>

      {/* CLOCK CONTROL ENGINE (ALWAYS ON TOP) */}
      <section className="mb-6 fade-in-up" id="time-engine-section">
        <ClockPanel
          currentTime={currentSimTime}
          setCurrentTime={setCurrentSimTime}
          simulationSpeed={simSpeed}
          setSimulationSpeed={setSimSpeed}
        />
      </section>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="main-dashboard-grid">
        {/* SIDEBAR: STUDENT LIST */}
        <div className="lg:col-span-1 space-y-6 fade-in-up">
          <StudentList
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            onAddStudent={handleRegisterStudent}
            onDeleteStudent={handleDeleteStudent}
            onResetAll={handleRevertCohort}
          />

          <ReminderCenter
            reminders={reminders}
            onDismiss={handleDismissReminder}
            onCompleteTask={handleCompleteFromToast}
            ttsEnabled={ttsEnabled}
            setTtsEnabled={setTtsEnabled}
            alarmEnabled={alarmEnabled}
            setAlarmEnabled={setAlarmEnabled}
          />
        </div>

        {/* MIDDLE / CENTRAL CHRONOLOGY TIMELINE & OPTIMIZERS */}
        <div className="lg:col-span-2 space-y-6 fade-in-up">
          {selectedStudent ? (
            <>
              <ScheduleTimeline
                selectedStudent={selectedStudent}
                onToggleTask={(studentId, scheduleId) =>
                  handleStudentAction(studentId, {
                    actionType: 'toggle_schedule_completed',
                    scheduleId,
                  })
                }
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onDrinkWater={(studentId) =>
                  handleStudentAction(studentId, { actionType: 'drink_water' })
                }
                onResetWater={(studentId) =>
                  handleStudentAction(studentId, { actionType: 'reset_water' })
                }
                currentTime={currentSimTime}
              />

              <AIOptimizer
                selectedStudent={selectedStudent}
                onApplyAIPlan={handleApplyAIPlan}
              />
            </>
          ) : (
            <div className="border border-dashed border-neutral-200 bg-white rounded-2xl p-12 text-center" id="empty-student-state">
              <span className="text-2xl block mb-2">🎓</span>
              <h3 className="text-xs font-display font-semibold text-neutral-800">No Student Profile Selected</h3>
              <p className="text-xs text-neutral-500 mt-1">Select an active student candidate from the left side registry to track or optimize schedules.</p>
            </div>
          )}
        </div>

        {/* AUDITING LOGS PANEL */}
        <div className="lg:col-span-1 fade-in-up">
          <LogAuditor
            logs={logs}
            onClear={async () => {
              // Reset backend log entries
              try {
                const res = await fetch('/api/reset-db', { method: 'POST' });
                if (res.ok) {
                  fetchStudentsData();
                }
              } catch (err) {
                console.error('Failed clearing log files:', err);
              }
            }}
          />
        </div>
      </main>

      {/* GCE ACTIVE ALARM POPUP MODAL */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs select-none" id="active-alarm-overlay">
          <div className="bg-white border border-neutral-200 shadow-2xl rounded-3xl w-full max-w-sm p-6 relative overflow-hidden animate-pulse-subtle" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Top accent bar to signify warning/alarm status */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500"></div>

            <div className="flex flex-col items-center text-center">
              {/* Vibrating Alarm Bell Ring Icon */}
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 text-2xl mb-3 relative">
                <span className="animate-ping absolute inset-0 rounded-2xl bg-orange-400 opacity-20"></span>
                ⏰
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold bg-orange-100/70 text-orange-850 px-2 py-0.5 rounded-md border border-orange-150 uppercase tracking-wider">
                  Automated Candidate Alarm
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Simulated Alarm Clock: {activeAlarm.time}
                </span>
              </div>

              <h3 className="text-base font-display font-semibold text-neutral-800 mt-3 flex items-center gap-1.5 justify-center">
                <span className="text-lg">{activeAlarm.avatarEmoji}</span>
                <span>{activeAlarm.studentName}</span>
              </h3>

              <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-3 w-full mt-3.5 text-left">
                <div className="flex items-center gap-1.5 mb-1 justify-between">
                  <span className="text-[11px] font-bold text-neutral-800 truncate">{activeAlarm.title}</span>
                  <span className="text-[9px] bg-neutral-200/80 text-neutral-700 px-1.5 py-0.5 rounded font-mono font-medium capitalize shrink-0">
                    {activeAlarm.type}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed italic">
                  &quot;{activeAlarm.description}&quot;
                </p>
              </div>

              {/* ACTION BUTTON GRID */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-4.5">
                <button
                  onClick={handleSnoozeAlarm}
                  className="px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-150 text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-200 transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
                  id="btn-alarm-snooze"
                >
                  ⏳ Snooze 5m
                </button>
                <button
                  onClick={handleAcknowledgeAlarm}
                  className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
                  id="btn-alarm-stop"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Start Activity</span>
                </button>
              </div>

              <button
                onClick={() => setActiveAlarm(null)}
                className="mt-3.5 text-[10px] text-neutral-400 hover:text-neutral-600 transition underline font-medium cursor-pointer"
                id="btn-alarm-mute"
              >
                Mute sound & close alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
