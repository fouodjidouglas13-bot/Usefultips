import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ClockPanelProps {
  currentTime: Date;
  setCurrentTime: React.Dispatch<React.SetStateAction<Date>>;
  simulationSpeed: number; // multiplier of real-time: 0 (paused), 1 (real-time), 60 (1 min/sec), 300 (5 min/sec)
  setSimulationSpeed: (speed: number) => void;
}

export default function ClockPanel({
  currentTime,
  setCurrentTime,
  simulationSpeed,
  setSimulationSpeed,
}: ClockPanelProps) {
  const [manualHour, setManualHour] = useState(currentTime.getHours());
  const [manualMinute, setManualMinute] = useState(currentTime.getMinutes());

  // Format digital clock
  const hoursStr = String(currentTime.getHours()).padStart(2, '0');
  const minutesStr = String(currentTime.getMinutes()).padStart(2, '0');
  const secondsStr = String(currentTime.getSeconds()).padStart(2, '0');

  // Sync manual input if speed is 0 or low
  useEffect(() => {
    if (simulationSpeed === 0) {
      setManualHour(currentTime.getHours());
      setManualMinute(currentTime.getMinutes());
    }
  }, [currentTime, simulationSpeed]);

  const handleManualTimeSet = (h: number, m: number) => {
    const newDate = new Date(currentTime);
    newDate.setHours(h);
    newDate.setMinutes(m);
    newDate.setSeconds(0);
    setCurrentTime(newDate);
    setManualHour(h);
    setManualMinute(m);
  };

  const PRESETS = [
    { label: '🌅 Wake/Breakfast', time: '07:10', h: 7, m: 10 },
    { label: '💧 Hydration Check', time: '10:00', h: 10, m: 0 },
    { label: '🍽️ Lunch Breather', time: '12:15', h: 12, m: 15 },
    { label: '🏃‍♂️ Sports Recess', time: '14:00', h: 14, m: 0 },
    { label: '✍️ Exam Study Block', time: '15:00', h: 15, m: 0 },
    { label: '😴 Recovery Sleep', time: '22:25', h: 22, m: 25 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6" id="clock-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Simulated Exam-Day Clock
          </span>
          <h2 className="text-sm font-display font-semibold text-neutral-800 mt-1">
            Reminders Trigger Mechanics
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* BIG DIGITAL CLOCK */}
        <div className="lg:col-span-3 bg-neutral-950 rounded-xl p-5 text-center shadow-inner border border-neutral-800 flex flex-col justify-center" id="digital-clock-display">
          <div className="text-neutral-500 text-[10px] font-mono tracking-wider uppercase mb-1">
            Current Simulated Time
          </div>
          <div className="font-mono text-3xl lg:text-3xl xl:text-4xl font-bold text-emerald-400 tracking-widest">
            {hoursStr}:{minutesStr}
            <span className="text-xl text-emerald-600 font-medium">:{secondsStr}</span>
          </div>
          <div className="text-neutral-400 text-xs mt-1.5 font-sans">
            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* DYNAMIC EXAMINATION COUNTDOWN */}
        <div className="lg:col-span-4 bg-orange-50/50 border border-orange-200/80 rounded-xl p-5 flex flex-col justify-between shadow-xs" id="gce-exam-countdown">
          <div>
            <div className="flex items-center gap-1.5 justify-center lg:justify-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-orange-400"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-orange-800 text-[10px] font-sans font-bold uppercase tracking-wider">
                GCE Countdown Clock
              </span>
            </div>
            <h3 className="text-xs font-semibold text-neutral-800 mt-1 text-center lg:text-left">
              Remaining Days to Cameroon GCE
            </h3>
          </div>

          <div className="my-3 flex justify-center lg:justify-start items-center gap-4">
            {(() => {
              const EXAM_DATE = new Date('2026-06-02T08:00:00');
              const timeDiff = EXAM_DATE.getTime() - currentTime.getTime();
              
              if (timeDiff <= 0) {
                return (
                  <div className="text-center w-full py-1">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                      🎓 Exams are Live & in Progress!
                    </span>
                  </div>
                );
              }

              const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <div className="flex gap-2 text-center">
                  <div className="bg-white border border-orange-150 px-2.5 py-1.5 rounded-lg shadow-2xs min-w-[52px]">
                    <span className="font-mono text-lg font-bold text-orange-700 block leading-none">{days}</span>
                    <span className="text-[9px] text-neutral-400 uppercase font-medium">Days</span>
                  </div>
                  <div className="bg-white border border-orange-150 px-2.5 py-1.5 rounded-lg shadow-2xs min-w-[52px]">
                    <span className="font-mono text-lg font-bold text-orange-700 block leading-none">{hours}</span>
                    <span className="text-[9px] text-neutral-400 uppercase font-medium">Hours</span>
                  </div>
                  <div className="bg-white border border-orange-150 px-2.5 py-1.5 rounded-lg shadow-2xs min-w-[52px]">
                    <span className="font-mono text-lg font-bold text-orange-700 block leading-none">{mins}</span>
                    <span className="text-[9px] text-neutral-400 uppercase font-medium">Mins</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="text-center lg:text-left text-[10px] text-neutral-500 font-medium">
            Commencing Tuesday, June 2, 2026 (08:00 AM)
          </div>
        </div>

        {/* PRESETS ENGINE */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-center" id="presets-milestones-container">
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider block">
              ⏰ Teleport Clock Milestones
            </span>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Instantly fast-forward simulated time to trigger student reminders & observe health score updates.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleManualTimeSet(p.h, p.m)}
                className="text-xs font-sans hover:bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-neutral-700 hover:text-neutral-900 transition flex flex-col justify-between bg-white font-medium text-left shadow-xs cursor-pointer select-none gap-1"
                id={`preset-teleport-${idx}`}
                title={`Set clock to ${p.time}`}
              >
                <div className="truncate text-neutral-700 font-semibold text-[11px]">
                  {p.label}
                </div>
                <div className="bg-neutral-100 text-neutral-500 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono w-fit">
                  {p.time}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
