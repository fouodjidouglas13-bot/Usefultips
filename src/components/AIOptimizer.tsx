import React, { useState } from 'react';
import { Student, ScheduleItem } from '../types';
import { Sparkles, BrainCircuit, RefreshCw, Check, AlertTriangle, Lightbulb } from 'lucide-react';

interface AIOptimizerProps {
  selectedStudent: Student;
  onApplyAIPlan: (studentId: string, plan: ScheduleItem[]) => void;
}

export default function AIOptimizer({ selectedStudent, onApplyAIPlan }: AIOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planState, setPlanState] = useState<ScheduleItem[] | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [userPromptOverride, setUserPromptOverride] = useState('');

  const generateAIPlan = async () => {
    setLoading(true);
    setError(null);
    setPlanState(null);

    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          classGroup: selectedStudent.class,
          examName: selectedStudent.examName,
          stressLevel: selectedStudent.stressLevel,
          customContext: userPromptOverride,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP index: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setPlanState(data.schedules);
        setIsDemo(!!data.isDemoFallback);
      } else {
        throw new Error(data.error || 'Cognitive model run failed.');
      }
    } catch (err: any) {
      console.error('Failed optimizing schedules:', err);
      setError(err.message || 'Connecting to Gemini routine optimizer failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (planState && planState.length > 0) {
      onApplyAIPlan(selectedStudent.id, planState);
      setPlanState(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6" id="ai-optimizer-panel">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
        <div className="bg-violet-100 p-2.5 rounded-xl text-violet-700">
          <BrainCircuit className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-display font-semibold text-neutral-800">
            AI Cognitive Routine Optimizer
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Optimize {selectedStudent.name}&apos;s schedule with Gemini model guidance
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* CONTEXT PILLS SUMMARY */}
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 grid grid-cols-2 gap-2 text-xs text-neutral-600">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase">Prepared Evaluation:</span>
            <span className="font-semibold block truncate text-neutral-800">{selectedStudent.examName}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase">Candidate Stress:</span>
            <span className="font-semibold block text-neutral-800">{selectedStudent.stressLevel} Level</span>
          </div>
        </div>

        {/* CUSTOM PROMPT ADDS */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
            Personal Habits Optimizer Hint (Optional):
          </label>
          <textarea
            value={userPromptOverride}
            onChange={(e) => setUserPromptOverride(e.target.value)}
            placeholder="e.g., Sluggish after 3PM, usually forgets to drink enough water, needs extra focus on calculus formulas."
            rows={2}
            className="w-full text-xs rounded-lg border border-neutral-250 bg-white p-2.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
            id="textarea-ai-prompt"
          />
        </div>

        {/* SUBMIT BUTTON */}
        {!planState && (
          <button
            onClick={generateAIPlan}
            disabled={loading}
            className="w-full bg-indigo-650 hover:bg-neutral-800 bg-neutral-950 text-white rounded-xl py-2.5 text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 border border-neutral-900"
            id="btn-trigger-ai"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing balanced healthy routine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimize Exam Routine with Gemini AI</span>
              </>
            )}
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in" id="ai-error">
            <AlertTriangle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS REVIEW PLAN */}
        {planState && (
          <div className="border border-neutral-100 bg-violet-50/20 rounded-xl p-4 space-y-3.5 animate-fade-in" id="ai-plan-review">
            {isDemo && (
              <div className="flex gap-1.5 p-2 bg-neutral-100 text-[10px] text-neutral-600 rounded-lg border border-neutral-200">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Demo State Active:</strong> The platform is using local scientific routines to construct schedules correctly. Add a real <code>GEMINI_API_KEY</code> on your Secrets panel to execute real dynamic model queries!
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs font-display font-semibold text-neutral-800">
                Optimized Cognitive Slate Suggestion
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {planState.length} items suggested
              </span>
            </div>

            {/* LIST MINI CARDS */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {planState.map((plan, pin) => (
                <div key={pin} className="p-3 bg-white border border-neutral-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-850">{plan.title}</span>
                    <span className="text-[10px] font-mono text-neutral-500 bg-neutral-150 px-1 rounded">
                      {plan.time} ({plan.duration}m)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 pr-2 leading-relaxed">{plan.description}</p>
                </div>
              ))}
            </div>

            {/* BUTTONS TO SAVE/APPLY */}
            <div className="flex gap-2">
              <button
                onClick={() => setPlanState(null)}
                className="flex-1 text-xs font-medium border border-neutral-200 rounded-lg py-1.5 hover:bg-neutral-50 text-neutral-700 transition"
                id="btn-discard-ai-plan"
              >
                Discard Code
              </button>
              <button
                onClick={handleApply}
                className="flex-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition flex items-center justify-center gap-1 bg-neutral-900"
                id="btn-apply-ai-plan"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
