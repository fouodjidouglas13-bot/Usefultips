import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Trash2, Award, Heart, ShieldAlert, Sparkles, Check, Edit2 } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onAddStudent: (student: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onResetAll: () => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onResetAll,
}: StudentListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    class: 'Upper Sixth Science (Bamenda Academic)',
    examName: '',
    stressLevel: 'Moderate' as 'Low' | 'Moderate' | 'High',
    avatarEmoji: '🎒',
    waterTargetCups: 8,
    sleepTargetHours: 8,
  });

  const EMOJI_OPTIONS = ['🎒', '🧠', '⚗️', '🧬', '✍️', '🏀', '💻', '🎨', '🎧', '🔬', '🌍', '📐'];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;

    onAddStudent({
      ...newStudent,
      id: `student-${Date.now()}`,
      waterIntakeCups: 0,
      schedules: [], // Start fresh or they can load AI schedule
    });

    setNewStudent({
      name: '',
      class: 'Upper Sixth Science (Bamenda Academic)',
      examName: '',
      stressLevel: 'Moderate',
      avatarEmoji: '🎒',
      waterTargetCups: 8,
      sleepTargetHours: 8,
    });
    setIsAdding(false);
  };

  const getStressBadgeColor = (level: 'Low' | 'Moderate' | 'High') => {
    switch (level) {
      case 'High':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'Moderate':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      default:
        return 'bg-green-50 border-green-200 text-green-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6" id="student-list-container">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-100">
        <div>
          <h2 className="text-md font-display font-semibold text-neutral-800">
            Exam Students Registry
          </h2>
          <p className="text-xs text-neutral-405 text-neutral-500 mt-0.5">
            Active class candidates profiles ({students.length})
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition"
            id="btn-register-student"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="mb-5 p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 animate-fade-in" id="form-register">
          <h3 className="text-xs font-display font-semibold text-neutral-700">Add New Classroom Candidate</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Full Student Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Jean-Pierre Foé"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full text-xs max-w-full rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                id="input-reg-name"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Classroom / Grade</label>
              <input
                type="text"
                value={newStudent.class}
                onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                id="input-reg-class"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Upcoming Final Exam</label>
              <input
                required
                type="text"
                placeholder="e.g. GCE Advanced Level (Sciences)"
                value={newStudent.examName}
                onChange={(e) => setNewStudent({ ...newStudent, examName: e.target.value })}
                className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                id="input-reg-exam"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Estimated Stress</label>
              <select
                value={newStudent.stressLevel}
                onChange={(e) => setNewStudent({ ...newStudent, stressLevel: e.target.value as 'Low' | 'Moderate' | 'High' })}
                className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2.5 text-neutral-800 focus:outline-none"
                id="select-reg-stress"
              >
                <option value="Low">Low Stress 🟢</option>
                <option value="Moderate">Moderate Stress 🟡</option>
                <option value="High">High Stress 🔴</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Profile Icon</label>
              <select
                value={newStudent.avatarEmoji}
                onChange={(e) => setNewStudent({ ...newStudent, avatarEmoji: e.target.value })}
                className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2.5 text-neutral-800 focus:outline-none"
                id="select-reg-emoji"
              >
                {EMOJI_OPTIONS.map((em, idx) => (
                  <option key={idx} value={em}>{em}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Water Target (cups/day)</label>
              <input
                type="number"
                min="4"
                max="16"
                value={newStudent.waterTargetCups}
                onChange={(e) => setNewStudent({ ...newStudent, waterTargetCups: Number(e.target.value) })}
                className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                id="input-reg-water-target"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Sleep Target (hrs/day)</label>
              <input
                type="number"
                min="5"
                max="12"
                value={newStudent.sleepTargetHours}
                onChange={(e) => setNewStudent({ ...newStudent, sleepTargetHours: Number(e.target.value) })}
                className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2 text-neutral-800 focus:outline-none"
                id="input-reg-sleep-target"
              />
            </div>
          </div>

          <div className="flex justify-end gap-1.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg px-2.5 py-1.5"
              id="btn-reg-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-2.5 py-1.5"
              id="btn-reg-submit"
            >
              Add Student
            </button>
          </div>
        </form>
      )}

      {/* STUDENT TILES */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {students.map((student) => {
          const isSelected = student.id === selectedStudentId;
          const completedRoutines = student.schedules.filter(s => s.completed).length;
          const totalRoutines = student.schedules.length;
          const pctHealthy = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;

          return (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative group ${
                isSelected
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow'
                  : 'bg-neutral-50 hover:bg-neutral-100/70 border-neutral-200 text-neutral-800'
              }`}
              id={`student-tile-${student.id}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${isSelected ? 'bg-neutral-800' : 'bg-white shadow-sm'}`}>
                    {student.avatarEmoji}
                  </div>
                  <div>
                    <h3 className={`text-xs font-semibold leading-normal ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {student.name}
                    </h3>
                    <p className={`text-[10px] leading-snug ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {student.class}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded-full font-medium ${getStressBadgeColor(student.stressLevel)}`}>
                    {student.stressLevel} stress
                  </span>
                  {students.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete database record for ${student.name}?`)) {
                          onDeleteStudent(student.id);
                        }
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 duration-200 transition ${
                        isSelected ? 'hover:bg-neutral-800 text-neutral-400 hover:text-rose-400' : 'hover:bg-neutral-200 text-neutral-500 hover:text-rose-600'
                      }`}
                      title="Remove candidate"
                      id={`btn-del-student-${student.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* STATS STRIP */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-neutral-700/20 grid grid-cols-3 gap-1 text-[10px]" id="stats-strip">
                <div>
                  <span className={`block text-[9px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>MAJOR EXAM</span>
                  <span className="font-medium block truncate max-w-full" title={student.examName}>
                    {student.examName}
                  </span>
                </div>
                <div>
                  <span className={`block text-[9px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>DRINK / TARGET</span>
                  <span className="font-mono font-medium block">
                    💧 {student.waterIntakeCups}/{student.waterTargetCups} cups
                  </span>
                </div>
                <div>
                  <span className={`block text-[9px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>WELLNESS ADHERENCE</span>
                  <span className="font-mono font-medium block">
                    ✅ {completedRoutines}/{totalRoutines} ({pctHealthy}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3.5 border-t border-neutral-100 flex justify-between items-center text-[10px]" id="footer-actions">
        <span className="text-neutral-400">Classroom persistence active</span>
        <button
          onClick={() => {
            if (confirm('Revert all students back to pre-set educational cohorts?')) {
              onResetAll();
            }
          }}
          className="text-neutral-500 hover:text-neutral-800 underline font-medium"
          id="btn-revert-cohort"
        >
          Reset Cohort to Defaults
        </button>
      </div>
    </div>
  );
}
