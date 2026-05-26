import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { Student, ScheduleItem, SystemLogs } from './src/types.js'; // Note standard ESM / file imports

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'students-db.json');

app.use(express.json());

// In-Memory Fallback if filesystem write fails, but we prefer persistence.
const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Sih Joyceline',
    class: 'Upper Sixth Science (Bamenda Academic)',
    examName: 'Cameroon GCE A-Level (Physics, Chemistry, Pure Maths)',
    stressLevel: 'High',
    avatarEmoji: '⚡',
    waterIntakeCups: 3,
    waterTargetCups: 8,
    sleepTargetHours: 8,
    schedules: [
      {
        id: 's1-1',
        type: 'eating',
        time: '06:45',
        duration: 30,
        title: 'Millet Porridge & Roasted Groundnuts',
        description: 'Warm Cameroonian millet porridge with roasted groundnuts. A superb source of slow-release carbohydrates for persistent morning cognitive focus.',
        automaticReminder: true,
        completed: true,
      },
      {
        id: 's1-2',
        type: 'study',
        time: '07:30',
        duration: 150,
        title: 'A-Level Pure Maths: Calculus & Integration',
        description: 'Reviewing differentiation from first principles, complex trigonometric integrals, and GCE past papers.',
        automaticReminder: false,
        completed: true,
      },
      {
        id: 's1-3',
        type: 'drinking',
        time: '10:15',
        duration: 10,
        title: 'Hydration Refresh (Tangui Spring Water)',
        description: 'Drink a cold cup of local spring water. Critical for beating the humid highland heat and cooling down neuronal synapses.',
        automaticReminder: true,
        completed: true,
      },
      {
        id: 's1-4',
        type: 'eating',
        time: '12:30',
        duration: 45,
        title: 'Balanced Ndolé with Boiled Plantains',
        description: 'Nutritious Cameroonian Ndolé leaves dressed with pureed peanuts and fresh steamed mackerel. High in brain-healthy lipids and iron.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's1-5',
        type: 'sport',
        time: '14:30',
        duration: 35,
        title: 'Stretches under Bamenda Ridge Breezes',
        description: 'Brisk walk and cardio stretches. Increases oxygen-rich blood flow to the visual cortex before afternoon chemistry revision.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's1-6',
        type: 'study',
        time: '15:30',
        duration: 120,
        title: 'A-Level Chemistry: Organic Reaction Mechanisms',
        description: 'Tackling complex nucleophilic additions, electrophilic substitutions, and organic synthesis pathways.',
        automaticReminder: false,
        completed: false,
      },
      {
        id: 's1-7',
        type: 'entertainment',
        time: '18:15',
        duration: 45,
        title: 'Songo\'o Board Game / Makossa Lo-fi',
        description: 'Unwind playing an ancient board game of strategy or listening to calming Cameroonian acoustic jazz to reset dopamine receptors.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's1-8',
        type: 'drinking',
        time: '20:00',
        duration: 5,
        title: 'Evening Mint Infusion',
        description: 'Warm local herbal tea to soothe physical exam anxieties.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's1-9',
        type: 'sleep',
        time: '21:45',
        duration: 510,
        title: 'Circadian Sleep Consolidation',
        description: 'Power off smartphone screens. Deep sleep is mathematically proven to transfer daily revision chemistry concepts to stable long-term memory.',
        automaticReminder: true,
        completed: false,
      }
    ]
  },
  {
    id: 'student-2',
    name: 'Tanyi Collins',
    class: 'Form 5 Science (Limbe Academy)',
    examName: 'Cameroon GCE O-Level (Maths, Physics, Chemistry, Biology)',
    stressLevel: 'Moderate',
    avatarEmoji: '🔬',
    waterIntakeCups: 2,
    waterTargetCups: 8,
    sleepTargetHours: 8,
    schedules: [
      {
        id: 's2-1',
        type: 'eating',
        time: '07:00',
        duration: 30,
        title: 'Abaza Avocado & Sourdough Toast',
        description: 'Healthy fatty acids from ripe Cameroon avocado paired with eggs. Essential for keeping the myelin sheath around neurons well-insulated.',
        automaticReminder: true,
        completed: true,
      },
      {
        id: 's2-2',
        type: 'study',
        time: '08:00',
        duration: 150,
        title: 'O-Level Physics: Electromagnetic Induction',
        description: 'Solving Faraday\'s and Lenz\'s laws equations to master Paper 2 structured theory exams.',
        automaticReminder: false,
        completed: true,
      },
      {
        id: 's2-3',
        type: 'drinking',
        time: '11:00',
        duration: 5,
        title: 'Hydration Break (Supermont Water)',
        description: 'Pure mineral water break. Hydrating decreases exam fatigue-induced mistakes in heavy quantitative physics questions.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's2-4',
        type: 'eating',
        time: '12:45',
        duration: 45,
        title: 'Poulet DG with Steamed Veggies',
        description: 'Traditional Cameroonian Plantain Stew with rich aromatic chicken, carrots, and sweet bell peppers. Excellent balance of complex carbs and lean protein.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's2-5',
        type: 'sport',
        time: '15:30',
        duration: 45,
        title: 'Sand-Pitch Footy Recess',
        description: 'Play a light football (soccer) scrimmage on the local sand pitch. Essential for sweating out built-up adrenaline.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's2-6',
        type: 'study',
        time: '16:30',
        duration: 120,
        title: 'O-Level Chemistry: Salt Testing Reagents',
        description: 'Analyzing organic and inorganic salt testing tables and qualitative analytical procedures for practical papers.',
        automaticReminder: false,
        completed: false,
      },
      {
        id: 's2-7',
        type: 'sleep',
        time: '22:15',
        duration: 480,
        title: 'Limbe Coastline Restorative Sleep',
        description: 'Snoozing under the cool ocean breeze. Recharging chemical energy reserves in the frontal lobe.',
        automaticReminder: true,
        completed: false,
      }
    ]
  },
  {
    id: 'student-3',
    name: 'Aboubacar Bello',
    class: 'Upper Sixth Arts (Buea High School)',
    examName: 'Cameroon GCE A-Level (History, Literature, Geography)',
    stressLevel: 'Low',
    avatarEmoji: '🗺️',
    waterIntakeCups: 5,
    waterTargetCups: 8,
    sleepTargetHours: 8,
    schedules: [
      {
        id: 's3-1',
        type: 'eating',
        time: '06:30',
        duration: 30,
        title: 'Tropical Fruit Salad & Safou Omelette',
        description: 'Local Cameroonian papaya, sweet pineapple, Safou fat spread, and scrambled eggs. Micronutrients for quick-fire analytical logic.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's3-2',
        type: 'study',
        time: '07:30',
        duration: 180,
        title: 'A-Level History: Foumban Conference of 1961',
        description: 'Reviewing key constitutional debates, structural changes, and Federal Republic timelines in Cameroon.',
        automaticReminder: false,
        completed: false,
      },
      {
        id: 's3-3',
        type: 'drinking',
        time: '11:00',
        duration: 10,
        title: 'Mid-Morning Tangui Hydration Refresh',
        description: 'Fills up glucose and oxygen transportation capability inside cerebrospinal fluid.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's3-4',
        type: 'sport',
        time: '16:30',
        duration: 50,
        title: 'Buea Foothills Hilly Jogging Circle',
        description: 'Brisk jogging up Buea hillside trails. Activates cardiovascular system and drives deep lung capacity to purge stress.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's3-5',
        type: 'sleep',
        time: '22:00',
        duration: 510,
        title: 'Cool Mountain Night Rest',
        description: 'Absolute screen blackout. High-efficiency sleep promotes full cognitive restoration for literature essay drafting tomorrow.',
        automaticReminder: true,
        completed: false,
      }
    ]
  },
  {
    id: 'student-4',
    name: 'Amadou Bakari',
    class: 'Form 5 Arts (Kumba High College)',
    examName: 'Cameroon GCE O-Level (English, History, Religious Studies)',
    stressLevel: 'Moderate',
    avatarEmoji: '📚',
    waterIntakeCups: 4,
    waterTargetCups: 8,
    sleepTargetHours: 8,
    schedules: [
      {
        id: 's4-1',
        type: 'eating',
        time: '06:15',
        duration: 30,
        title: 'Koki Beans & Boiled Yam',
        description: 'Traditional Cameroonian koki beans steam-cooked in banana leaves. Nourishing, fiber-rich energy generator for morning exams.',
        automaticReminder: true,
        completed: true,
      },
      {
        id: 's4-2',
        type: 'study',
        time: '07:30',
        duration: 150,
        title: 'O-Level English: Grammar, Prose & Vocabulary',
        description: 'Improving essay structure, spelling rules, and revision of prose texts for GCE English Section A.',
        automaticReminder: false,
        completed: true,
      },
      {
        id: 's4-3',
        type: 'drinking',
        time: '10:30',
        duration: 10,
        title: 'Citrus Water Hydration Refresh',
        description: 'Warm mountain breezes demand fluid replenishment. Keeps concentration levels prime for GCE history facts.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's4-4',
        type: 'eating',
        time: '12:45',
        duration: 45,
        title: 'Waterfufu & Achu Soup Lunch',
        description: 'Rich local Cameroonian delicacy that provides sustained physical and mental stamina without causing sudden lethargy.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's4-5',
        type: 'sport',
        time: '15:45',
        duration: 35,
        title: 'Brisk Walk near Forest Ridge',
        description: 'Fresh jungle line air walk. Active cardio resets mental fatigue and balances blood circulation.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's4-6',
        type: 'study',
        time: '16:30',
        duration: 120,
        title: 'O-Level History: First World War in Cameroon',
        description: 'Solving GCE council past examinations historical essay outlines.',
        automaticReminder: false,
        completed: false,
      },
      {
        id: 's4-7',
        type: 'sleep',
        time: '21:30',
        duration: 540,
        title: 'Restorative Kumba Night Sleep',
        description: 'High-quality 9-hour restorative sleep sequence. Allows overnight neural consolidation of critical historical facts.',
        automaticReminder: true,
        completed: false,
      }
    ]
  },
  {
    id: 'student-5',
    name: 'Audrey-Claire Enow',
    class: 'Form 5 Commercial (Yaoundé GBHS)',
    examName: 'Cameroon GCE O-Level (Economics, Commerce, Principles of Accounts)',
    stressLevel: 'High',
    avatarEmoji: '📈',
    waterIntakeCups: 1,
    waterTargetCups: 8,
    sleepTargetHours: 8,
    schedules: [
      {
        id: 's5-1',
        type: 'eating',
        time: '06:30',
        duration: 30,
        title: 'Tapioca & Puff-Puff Breakfast',
        description: 'Classic quick energy breakfast giving rapid metabolic glucose to fuel the brain for long commerce GCE morning exam sessions.',
        automaticReminder: true,
        completed: true,
      },
      {
        id: 's5-2',
        type: 'study',
        time: '07:30',
        duration: 150,
        title: 'O-Level Accounts: Ledger & Balance Sheet',
        description: 'Reviewing trial balances, bank reconciliations, and manufacturing account layouts.',
        automaticReminder: false,
        completed: true,
      },
      {
        id: 's5-3',
        type: 'drinking',
        time: '10:00',
        duration: 10,
        title: 'Fresh Coconut Water Refresh',
        description: 'Drinking fresh coconut water rich in electrolytes to sustain cognitive endurance under the warm sun.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's5-4',
        type: 'eating',
        time: '12:15',
        duration: 45,
        title: 'Nourishing Eru & Waterfufu',
        description: 'Mineral-rich Cameroonian Eru leaves cooked with pure green oil. Slow digesting, keeps student full, energized and focused.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's5-5',
        type: 'sport',
        time: '14:00',
        duration: 25,
        title: 'Corde à Sauter (Skip Rope Drill)',
        description: 'Brisk physical simulation in the backyard. Releases dopamine and elevates study motivation.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's5-6',
        type: 'study',
        time: '15:00',
        duration: 120,
        title: 'O-Level Economics: Supply, Demand & Markets',
        description: 'Revising price elasticity of demand curves, marginal utility calculations, and market structure summaries.',
        automaticReminder: false,
        completed: false,
      },
      {
        id: 's5-7',
        type: 'entertainment',
        time: '18:00',
        duration: 45,
        title: 'Calm Afrobeats Instrumental Rest',
        description: 'Listening to slow guitar rhythms to reduce state cortisol before a good night\'s rest.',
        automaticReminder: true,
        completed: false,
      },
      {
        id: 's5-8',
        type: 'sleep',
        time: '21:00',
        duration: 570,
        title: 'Early GCE Commercial Sleep Cycle',
        description: 'Guarantees the recommended sleep threshold for middle school candidates. Resets cortisol levels beautifully.',
        automaticReminder: true,
        completed: false,
      }
    ]
  }
];

// Load from DB File or create newly
function readDB(): { students: Student[]; logs: SystemLogs[] } {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading DB file, using fallback in-memory data:', err);
  }
  return { students: DEFAULT_STUDENTS, logs: [] };
}

function writeDB(data: { students: Student[]; logs: SystemLogs[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving database to file system:', err);
  }
}

// Ensure database file is initialized
if (!fs.existsSync(DB_FILE)) {
  writeDB({ students: DEFAULT_STUDENTS, logs: [] });
}

// Lazy Initialize Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not set. AI Features will show an absolute helpful warning.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY_FOR_NON_CRASHING',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// --- API ROUTES ---

// Get all students and logs
app.get('/api/students', (req, res) => {
  const data = readDB();
  res.json(data);
});

// Update standard student metrics (stress level, targets, avatar, class, exam)
app.post('/api/students', (req, res) => {
  const { students, logs } = readDB();
  const studentData: Partial<Student> & { id: string } = req.body;

  const idx = students.findIndex(s => s.id === studentData.id);
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...studentData };
  } else {
    // Create new
    const newStudent: Student = {
      id: studentData.id || `student-${Date.now()}`,
      name: studentData.name || 'Anonymous Student',
      class: studentData.class || 'Grade 12',
      examName: studentData.examName || 'Final Examinations',
      stressLevel: studentData.stressLevel || 'Moderate',
      avatarEmoji: studentData.avatarEmoji || '🎒',
      waterIntakeCups: studentData.waterIntakeCups || 0,
      waterTargetCups: studentData.waterTargetCups || 8,
      sleepTargetHours: studentData.sleepTargetHours || 8,
      schedules: studentData.schedules || [],
    };
    students.push(newStudent);
  }

  writeDB({ students, logs });
  res.json({ success: true, students });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const { students, logs } = readDB();
  const filtered = students.filter(s => s.id !== req.params.id);
  writeDB({ students: filtered, logs });
  res.json({ success: true, students: filtered });
});

// Reset database to defaults
app.post('/api/reset-db', (req, res) => {
  const resetData = { students: DEFAULT_STUDENTS, logs: [] };
  writeDB(resetData);
  res.json({ success: true, ...resetData });
});

// Log Action trigger (e.g. Completed a schedule item, drank water, sleep tracker)
app.post('/api/students/:id/action', (req, res) => {
  const { students, logs } = readDB();
  const { id } = req.params;
  const { actionType, scheduleId, payload } = req.body;

  const stud = students.find(s => s.id === id);
  if (!stud) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  let logMsg = '';
  const nowStr = new Date().toISOString();

  if (actionType === 'drink_water') {
    stud.waterIntakeCups = Math.min(stud.waterTargetCups, stud.waterIntakeCups + 1);
    logMsg = `Hydrated: Drank 1 cup of water (Total: ${stud.waterIntakeCups}/${stud.waterTargetCups} cups)`;
  } else if (actionType === 'reset_water') {
    stud.waterIntakeCups = 0;
    logMsg = `Hydration count reset to 0.`;
  } else if (actionType === 'toggle_schedule_completed') {
    const item = stud.schedules.find(sc => sc.id === scheduleId);
    if (item) {
      item.completed = !item.completed;
      logMsg = `${item.completed ? 'Completed' : 'Reopened'} schedule routine: "${item.title}" (${item.type})`;
    }
  } else if (actionType === 'update_water_total') {
    stud.waterIntakeCups = Number(payload ?? 0);
    logMsg = `Hydration state updated manually to ${stud.waterIntakeCups} cups.`;
  }

  if (logMsg) {
    logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      studentId: stud.id,
      studentName: stud.name,
      time: nowStr,
      type: 'drinking',
      message: logMsg,
    });
    // Cap logs to latest 100 entries
    if (logs.length > 100) {
      logs.splice(100);
    }
  }

  writeDB({ students, logs });
  res.json({ success: true, student: stud, logs });
});

// Add an individual custom schedule item
app.post('/api/students/:id/schedule', (req, res) => {
  const { students, logs } = readDB();
  const stud = students.find(s => s.id === req.params.id);
  if (!stud) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const newItem: ScheduleItem = {
    id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    type: req.body.type || 'study',
    time: req.body.time || '12:00',
    duration: Number(req.body.duration || 30),
    title: req.body.title || 'Routine Activity',
    description: req.body.description || '',
    automaticReminder: req.body.automaticReminder ?? true,
    completed: false,
  };

  stud.schedules.push(newItem);
  // Sort schedules by time chronologically
  stud.schedules.sort((a, b) => a.time.localeCompare(b.time));

  logs.unshift({
    id: `log-${Date.now()}`,
    studentId: stud.id,
    studentName: stud.name,
    time: new Date().toISOString(),
    type: newItem.type,
    message: `Added new scheduled routine at ${newItem.time}: "${newItem.title}"`,
  });

  writeDB({ students, logs });
  res.json({ success: true, student: stud, logs });
});

// Edit/Overwrite an individual schedule item
app.put('/api/students/:id/schedule/:scheduleId', (req, res) => {
  const { students, logs } = readDB();
  const stud = students.find(s => s.id === req.params.id);
  if (!stud) {
    res.status(444).json({ error: 'Student not found.' });
    return;
  }

  const itemIdx = stud.schedules.findIndex(sc => sc.id === req.params.scheduleId);
  if (itemIdx === -1) {
    res.status(404).json({ error: 'Schedule item not found.' });
    return;
  }

  const updatedItem: ScheduleItem = {
    ...stud.schedules[itemIdx],
    type: req.body.type ?? stud.schedules[itemIdx].type,
    time: req.body.time ?? stud.schedules[itemIdx].time,
    duration: Number(req.body.duration ?? stud.schedules[itemIdx].duration),
    title: req.body.title ?? stud.schedules[itemIdx].title,
    description: req.body.description ?? stud.schedules[itemIdx].description,
    automaticReminder: req.body.automaticReminder ?? stud.schedules[itemIdx].automaticReminder,
    completed: req.body.completed ?? stud.schedules[itemIdx].completed,
  };

  stud.schedules[itemIdx] = updatedItem;
  stud.schedules.sort((a, b) => a.time.localeCompare(b.time));

  logs.unshift({
    id: `log-${Date.now()}`,
    studentId: stud.id,
    studentName: stud.name,
    time: new Date().toISOString(),
    type: updatedItem.type,
    message: `Updated schedule item at ${updatedItem.time}: "${updatedItem.title}"`,
  });

  writeDB({ students, logs });
  res.json({ success: true, student: stud, logs });
});

// Delete an individual schedule item
app.delete('/api/students/:id/schedule/:scheduleId', (req, res) => {
  const { students, logs } = readDB();
  const stud = students.find(s => s.id === req.params.id);
  if (!stud) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const deletedItem = stud.schedules.find(sc => sc.id === req.params.scheduleId);
  stud.schedules = stud.schedules.filter(sc => sc.id !== req.params.scheduleId);

  logs.unshift({
    id: `log-${Date.now()}`,
    studentId: stud.id,
    studentName: stud.name,
    time: new Date().toISOString(),
    type: deletedItem ? deletedItem.type : 'study',
    message: `Deleted schedule item: "${deletedItem ? deletedItem.title : req.params.scheduleId}"`,
  });

  writeDB({ students, logs });
  res.json({ success: true, student: stud, logs });
});

// Overwrite all schedules with custom list (for resetting / applying optimized lists)
app.post('/api/students/:id/overwrite-schedule', (req, res) => {
  const { students, logs } = readDB();
  const stud = students.find(s => s.id === req.params.id);
  if (!stud) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const newSchedules: ScheduleItem[] = req.body.schedules || [];
  stud.schedules = newSchedules.sort((a, b) => a.time.localeCompare(b.time));

  logs.unshift({
    id: `log-${Date.now()}`,
    studentId: stud.id,
    studentName: stud.name,
    time: new Date().toISOString(),
    type: 'study',
    message: `Applied a fully customized Exam Routine Schedule (Overwriting previous)`,
  });

  writeDB({ students, logs });
  res.json({ success: true, student: stud, logs });
});

// AI OPTIMIZATION ENDPOINT with Gemini API
app.post('/api/generate-schedule', async (req, res) => {
  try {
    const { studentName, classGroup, examName, stressLevel, customContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Return beautiful simulated schedules if the key is missing to guarantee offline/pre-setup preview functionality!
      console.log('Gemini API key is not configured, running robust AI fallback routine.');
      const mockAISchedules: ScheduleItem[] = [
        {
          id: `ai-1-${Date.now()}`,
          type: 'sleep',
          time: '07:00',
          duration: 30,
          title: 'Gentle Wakeup & Fresh Air stretch',
          description: 'A slow awakening. Step outside for 5 minutes. Vital for resetting cortisol levels.',
          automaticReminder: true,
          completed: false,
        },
        {
          id: `ai-2-${Date.now()}`,
          type: 'eating',
          time: '07:30',
          duration: 30,
          title: 'Slow Carbs Brain Power Breakfast',
          description: 'Greek yogurt with walnuts, organic honey, and banana. Gives stable glucose levels to the hippocampus.',
          automaticReminder: true,
          completed: false,
        },
        {
          id: `ai-3-${Date.now()}`,
          type: 'study',
          time: '08:30',
          duration: 150,
          title: `Intensive ${examName || 'Exam'} Practice`,
          description: 'Tackle the absolute hardest concept first when cognitive energy reserves are completely full.',
          automaticReminder: false,
          completed: false,
        },
        {
          id: `ai-4-${Date.now()}`,
          type: 'drinking',
          time: '11:00',
          duration: 10,
          title: 'Active Hydration Cycle',
          description: 'Drink a glass of water. Walk around for 5 minutes, focusing your vision on far away objects.',
          automaticReminder: true,
          completed: false,
        },
        {
          id: `ai-5-${Date.now()}`,
          type: 'eating',
          time: '12:30',
          duration: 45,
          title: 'Tyrosine & Mineral Booster Lunch',
          description: 'Roast chicken, lettuce wrap, and sliced carrots. Tyrosine supports high level memory storage.',
          automaticReminder: true,
          completed: false,
        },
        {
          id: `ai-6-${Date.now()}`,
          type: 'sport',
          time: '15:15',
          duration: 30,
          title: 'Oxygenation Cardio Stretch',
          description: 'Brisk push-ups, jumping jacks, or jogging. Re-mobilize core breathing to lift exam study fog.',
          automaticReminder: true,
          completed: false,
        },
        {
          id: `ai-7-${Date.now()}`,
          type: 'study',
          time: '16:00',
          duration: 120,
          title: 'Active Recall & Topic Mapping',
          description: 'Draw conceptual diagrams or explain topics out loud to solidify cognitive neural pathways.',
          automaticReminder: false,
          completed: false,
        },
        {
          id: `ai-8-${Date.now()}`,
          type: 'entertainment',
          time: '18:30',
          duration: 60,
          title: 'Dopamine-Reset Entertainment',
          description: 'Interact with parents or friends, or sketch. Steer clear of endless digital screen content scrolling.',
          automaticReminder: true,
          completed: false,
        },
        {
          id: `ai-9-${Date.now()}`,
          type: 'sleep',
          time: '22:15',
          duration: 480,
          title: 'Deep Memory Stabilization Sleep',
          description: 'Zero screen lights. Essential sleep cycle for transferring short-term exam knowledge into permanent memory.',
          automaticReminder: true,
          completed: false,
        }
      ];

      res.json({
        success: true,
        schedules: mockAISchedules,
        isDemoFallback: true,
        message: 'Loaded custom-tailored healthy examination schedule using local database optimizer (Set your GEMINI_API_KEY in Settings > Secrets for real-time model synthesis!).',
      });
      return;
    }

    const ai = getAIClient();

    const systemPrompt = `You are a world-class cognitive health coach specializing in high-performance examination schedules for students.
Create a highly optimized, completely healthy, stress-aware schedule of 5 to 9 routine events.
The student details:
- Name: ${studentName}
- Class: ${classGroup}
- Preparing for Exam: ${examName}
- Current Stress Level: ${stressLevel} (High stres require more frequent, shorter breaks, mental recess, and strict hydration blocks to calm nerves)
- Additional student context: ${customContext || 'None provided'}

Guidelines to construct a healthy routine:
1. Always balance grueling study sessions with essential health checks.
2. Ensure there is sleep (bedtime) set at a reasonable time (e.g., between 21:30 and 23:00) with a description telling them why high quality rest keeps neurons crisp.
3. Schedule hydration/drinking reminders (type: 'drinking') of exactly 5-10 minutes.
4. Schedule sports/stretch routines (type: 'sport') of 20-45 minutes.
5. Include healthy eating sessions (type: 'eating') specifying slow carb / avocado / protein brain-friendly foods.
6. Include an entertainment session (type: 'entertainment') to unwind.
7. Focus blocks (type: 'study') must not exceed 180 continuous minutes without a physical break.

Return the schedule strictly using the specified JSON schema structure. Make every title and description extremely specific, inspiring, and health-conscious.`;

    const generateResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a custom structured exam schedule for student ${studentName}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedules: {
              type: Type.ARRAY,
              description: 'Array of organized, scheduled routine activities for the day.',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'Type of scheduled activity. Allowed values: eating, drinking, sport, sleep, study, entertainment, exercise'
                  },
                  time: {
                    type: Type.STRING,
                    description: 'Start time in 24h format, e.g. "08:15", "13:00", "22:30"'
                  },
                  duration: {
                    type: Type.INTEGER,
                    description: 'Activity duration in minutes'
                  },
                  title: {
                    type: Type.STRING,
                    description: 'Engaging, custom action title, e.g. "Protein-Enriched Brain Lunch", "Calculus Deep Work Block"'
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Brief, scientific health reason explaining why this block keeps the student primed and relaxed for their evaluation'
                  },
                  automaticReminder: {
                    type: Type.BOOLEAN,
                    description: 'True if a push reminder banner is highly beneficial (typically true for health, food, drink, sport, sleep)'
                  }
                },
                required: ['type', 'time', 'duration', 'title', 'description', 'automaticReminder']
              }
            }
          },
          required: ['schedules']
        }
      }
    });

    const parsedData = JSON.parse(generateResponse.text || '{"schedules": []}');
    const items = (parsedData.schedules || []).map((it: any, index: number) => ({
      id: `ai-gen-${Date.now()}-${index}`,
      type: it.type || 'study',
      time: it.time || '12:00',
      duration: Number(it.duration || 30),
      title: it.title || 'Optimized Block',
      description: it.description || '',
      automaticReminder: it.automaticReminder ?? true,
      completed: false
    }));

    res.json({
      success: true,
      schedules: items,
      isDemoFallback: false
    });
  } catch (err: any) {
    console.error('Error in AI Generate Schedule:', err);
    res.status(500).json({ error: 'AI Optimizer failed: ' + err.message });
  }
});


// --- INTEGRATE VITE AS MIDDLEWARE (DEVELOPMENT) OR STATIC FILES (PRODUCTION) ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware activated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static files server activated.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();
