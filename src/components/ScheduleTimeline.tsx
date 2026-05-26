import React, { useState } from 'react';
import { Student, ScheduleItem, ScheduleType } from '../types';
import {
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  Coffee,
  Droplet,
  Dumbbell,
  Moon,
  PenTool,
  Gamepad2,
  HelpCircle,
} from 'lucide-react';

interface ScheduleTimelineProps {
  selectedStudent: Student;
  onToggleTask: (studentId: string, scheduleId: string) => void;
  onAddTask: (studentId: string, item: Partial<ScheduleItem>) => void;
  onDeleteTask: (studentId: string, scheduleId: string) => void;
  onDrinkWater: (studentId: string) => void;
  onResetWater: (studentId: string) => void;
  currentTime: Date;
}

export default function ScheduleTimeline({
  selectedStudent,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onDrinkWater,
  onResetWater,
  currentTime,
}: ScheduleTimelineProps) {
  const [filterType, setFilterType] = useState<ScheduleType | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    type: 'study' as ScheduleType,
    time: '12:00',
    duration: 30,
    description: '',
    automaticReminder: true,
  });

  const getCategoryConfig = (type: ScheduleType) => {
    switch (type) {
      case 'eating':
        return {
          icon: <Coffee className="w-4 h-4" />,
          bgColor: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-800',
          emojiStr: '🍽️',
        };
      case 'drinking':
        return {
          icon: <Droplet className="w-4 h-4" />,
          bgColor: 'bg-sky-50 border-sky-200',
          textColor: 'text-sky-800',
          emojiStr: '💧',
        };
      case 'sport':
        return {
          icon: <Dumbbell className="w-4 h-4" />,
          bgColor: 'bg-emerald-50 border-emerald-200',
          textColor: 'text-emerald-800',
          emojiStr: '🏃‍♂️',
        };
      case 'sleep':
        return {
          icon: <Moon className="w-4 h-4" />,
          bgColor: 'bg-indigo-50 border-indigo-200',
          textColor: 'text-indigo-800',
          emojiStr: '😴',
        };
      case 'study':
        return {
          icon: <PenTool className="w-4 h-4" />,
          bgColor: 'bg-violet-50 border-violet-200',
          textColor: 'text-violet-800',
          emojiStr: '✍️',
        };
      case 'entertainment':
        return {
          icon: <Gamepad2 className="w-4 h-4" />,
          bgColor: 'bg-fuchsia-50 border-fuchsia-200',
          textColor: 'text-fuchsia-800',
          emojiStr: '🎮',
        };
      default:
        return {
          icon: <HelpCircle className="w-4 h-4" />,
          bgColor: 'bg-teal-50 border-teal-200',
          textColor: 'text-teal-800',
          emojiStr: '🏋️‍♂️',
        };
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    onAddTask(selectedStudent.id, newItem);
    setNewItem({
      title: '',
      type: 'study',
      time: '12:00',
      duration: 30,
      description: '',
      automaticReminder: true,
    });
    setIsAdding(false);
  };

  // Filter students schedules
  const filteredSchedules = selectedStudent.schedules.filter(
    (item) => filterType === 'all' || item.type === filterType
  );

  // Format schedule categories for filters
  const CATEGORIES: { label: string; value: ScheduleType | 'all'; emoji: string }[] = [
    { label: 'All Routines', value: 'all', emoji: '📅' },
    { label: 'Study & Time', value: 'study', emoji: '✍️' },
    { label: 'Hydration', value: 'drinking', emoji: '💧' },
    { label: 'Nutrition', value: 'eating', emoji: '🍽️' },
    { label: 'Sports Stretches', value: 'sport', emoji: '🏃‍♂️' },
    { label: 'Sleep Rest', value: 'sleep', emoji: '😴' },
    { label: 'Decompress', value: 'entertainment', emoji: '🎮' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6" id="schedule-timeline-container">
      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-md font-display font-semibold text-neutral-800 flex items-center gap-2">
            <span>{selectedStudent.avatarEmoji}</span>
            <span>{selectedStudent.name}&apos;s Daily Routine</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Balanced schedule timeline preparing for the <strong className="font-semibold">{selectedStudent.examName}</strong>.
          </p>
        </div>

        {/* WATER TRACKING COMPONENT */}
        <div className="bg-sky-50/50 border border-sky-100 rounded-xl px-4 py-2.5 flex items-center gap-4 self-stretch sm:self-auto" id="water-widget">
          <div>
            <div className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">Hydration Track</div>
            <div className="text-xs font-semibold text-sky-800 font-mono mt-0.5">
              💧 {selectedStudent.waterIntakeCups}/{selectedStudent.waterTargetCups} Cups
            </div>
          </div>
          <div className="flex gap-1.5">
            {selectedStudent.waterIntakeCups > 0 && (
              <button
                onClick={() => onResetWater(selectedStudent.id)}
                className="text-[10px] text-sky-600 hover:text-sky-800 hover:underline font-medium"
                title="Reset daily cup indicator"
                id="btn-reset-water"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => onDrinkWater(selectedStudent.id)}
              disabled={selectedStudent.waterIntakeCups >= selectedStudent.waterTargetCups}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition ${
                selectedStudent.waterIntakeCups >= selectedStudent.waterTargetCups
                  ? 'bg-sky-100/55 text-sky-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
              id="btn-drink-water-add"
            >
              + Drink Cup
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS ROW */}
      <div className="flex flex-wrap gap-1.5 mb-5" id="timeline-filters">
        {CATEGORIES.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setFilterType(cat.value)}
            className={`text-xs font-sans px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              filterType === cat.value
                ? 'bg-neutral-900 border-neutral-900 text-white font-medium'
                : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
            }`}
            id={`filter-btn-${cat.value}`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* TIMELINE RULER */}
      <div className="space-y-4">
        {/* ADD ACTION PANEL */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">
            Hourly Planner
          </span>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 transition"
              id="btn-show-add-task"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Routine</span>
            </button>
          )}
        </div>

        {isAdding && (
          <form onSubmit={handleAddSubmit} className="p-4 border border-neutral-200 bg-neutral-50 rounded-xl space-y-3 animate-fade-in" id="add-task-form">
            <h3 className="text-xs font-display font-semibold text-neutral-700">Add Segment to Student Agenda</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Routine Activity Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Chemistry Homework Review or Protein Shake"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                  id="input-task-title"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Routine Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ScheduleType })}
                  className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                  id="select-task-type"
                >
                  <option value="study">Study Hours ✍️</option>
                  <option value="drinking">Water Break 💧</option>
                  <option value="eating">Healthy Meal 🍽️</option>
                  <option value="sport">Sports/Stretches 🏃‍♂️</option>
                  <option value="sleep">Bedtime Sleep 😴</option>
                  <option value="entertainment">Unwind Hour 🎮</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newItem.time}
                    onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                    id="input-task-time"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={newItem.duration}
                    onChange={(e) => setNewItem({ ...newItem, duration: Number(e.target.value) })}
                    className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                    id="input-task-duration"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Description / Health Tips</label>
                <textarea
                  placeholder="Why is this routine block good for exam performance?"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={2}
                  className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                  id="textarea-task-desc"
                />
              </div>

              <div className="col-span-2 flex items-center gap-1.5 py-1">
                <input
                  type="checkbox"
                  id="automaticReminder"
                  checked={newItem.automaticReminder}
                  onChange={(e) => setNewItem({ ...newItem, automaticReminder: e.target.checked })}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="automaticReminder" className="text-[11px] text-neutral-600 font-medium">
                  Trigger automatic popups when the app clock matches this time
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg px-2.5 py-1.5"
                id="btn-task-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 bg-neutral-900 hover:bg-neutral-800 rounded-lg px-2.5 py-1.5"
                id="btn-task-submit"
              >
                Save Block
              </button>
            </div>
          </form>
        )}

        {/* TIMELINE ITEMS CONTAINER */}
        {filteredSchedules.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-2xl p-8 text-center bg-neutral-50">
            <AlertCircle className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-neutral-700 block">No schedules matching this filter</span>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Generate balanced AI schedules using the optimizer tool or click &quot;Add Custom Routine&quot; above.
            </span>
          </div>
        ) : (
          <div className="relative border-l-2 border-neutral-100 ml-3.5 pl-6 space-y-5 py-2">
            {filteredSchedules.map((item) => {
              const cfg = getCategoryConfig(item.type);
              const isChecked = !!item.completed;

              return (
                <div
                  key={item.id}
                  className={`relative group bg-white border rounded-xl p-4 transition-all duration-200 outline-none hover:shadow-sm ${
                    isChecked
                      ? 'border-neutral-150 bg-neutral-50/70 text-neutral-500'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  id={`schedule-item-${item.id}`}
                >
                  {/* LEFT LINE BULLET */}
                  <div
                    className={`absolute -left-[35px] top-[18px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                      isChecked
                        ? 'bg-neutral-200 border-neutral-300 text-neutral-600'
                        : 'bg-white border-neutral-400 text-neutral-800'
                    }`}
                  >
                    {cfg.emojiStr}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5">
                    <div>
                      {/* TIME & CATEGORY TAG */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-neutral-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {item.time} ({item.duration}m)
                        </span>

                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold border ${cfg.bgColor} ${cfg.textColor}`}>
                          {item.type}
                        </span>

                        {item.automaticReminder && (
                          <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-1 rounded uppercase font-bold font-mono">
                            🔕 Auto Notify
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-semibold mt-1.5 ${isChecked ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className={`text-[11px] mt-1 pr-6 leading-relaxed ${isChecked ? 'text-neutral-400/80' : 'text-neutral-600'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS STRIP */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => onToggleTask(selectedStudent.id, item.id)}
                        className={`text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
                          isChecked
                            ? 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:bg-neutral-200'
                            : 'bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                        id={`btn-toggle-done-${item.id}`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{isChecked ? 'Mark Incomplete' : 'Complete Daily'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteTask(selectedStudent.id, item.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-rose-600 duration-200"
                        title="Delete record block"
                        id={`btn-del-task-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
