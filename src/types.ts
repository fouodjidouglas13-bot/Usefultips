export type ScheduleType = 'eating' | 'drinking' | 'sport' | 'sleep' | 'study' | 'entertainment' | 'exercise';

export interface ScheduleItem {
  id: string;
  type: ScheduleType;
  time: string; // "HH:MM" format
  duration: number; // in minutes
  title: string;
  description: string;
  automaticReminder: boolean;
  completed?: boolean; // Track if completed for the current day
}

export interface Student {
  id: string;
  name: string;
  class: string; // e.g. "Grade 12, Class A"
  examName: string; // e.g. "National Baccalaureate AP Calculus"
  stressLevel: 'Low' | 'Moderate' | 'High';
  avatarEmoji: string;
  waterIntakeCups: number; // out of target (e.g., cups of water drank)
  waterTargetCups: number; // usually 8
  sleepTargetHours: number; // usually 8
  schedules: ScheduleItem[];
}

export interface SystemLogs {
  id: string;
  studentId: string;
  studentName: string;
  time: string; // timestamp
  type: ScheduleType;
  message: string;
}

export interface ReminderNotification {
  id: string;
  studentId: string;
  studentName: string;
  avatarEmoji: string;
  type: ScheduleType;
  title: string;
  time: string; // "HH:MM"
  message: string;
  triggeredAt: number; // Timestamp
  acknowledged: boolean;
}
