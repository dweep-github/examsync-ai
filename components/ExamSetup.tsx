import React, { useState } from 'react';
import { Exam, Topic } from '../types';
import { saveExam } from '../services/storage';

interface ExamSetupProps {
  onSetupComplete: (exam: Exam) => void;
}

const ExamSetup: React.FC<ExamSetupProps> = ({ onSetupComplete }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [rawTopics, setRawTopics] = useState('');
  const [step, setStep] = useState(1);
  const [parsedTopics, setParsedTopics] = useState<Topic[]>([]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topicsList = rawTopics.split(/[\n,]+/).map(t => t.trim()).filter(t => t.length > 0);
    const topicsObj: Topic[] = topicsList.map(t => ({
      id: crypto.randomUUID(),
      name: t,
      isWeak: false,
      status: 'pending'
    }));
    setParsedTopics(topicsObj);
    setStep(2);
  };

  const toggleWeakness = (id: string) => {
    setParsedTopics(prev => prev.map(t => t.id === id ? { ...t, isWeak: !t.isWeak } : t));
  };

  const finalizeExam = () => {
    const newExam: Exam = {
      id: crypto.randomUUID(),
      name,
      date,
      subjects: ['General'],
      topics: parsedTopics,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    saveExam(newExam);
    onSetupComplete(newExam);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">ExamSync AI</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">Let's synchronize your study schedule.</p>

        {step === 1 ? (
          <form onSubmit={handleInitialSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Exam Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Calculus Final, Bar Exam"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-0 focus:outline-none transition-colors placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Exam Date</label>
              <div className="relative">
                <input
                  required
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  // Added dark:[color-scheme:dark] to fix the native icon visibility
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-0 focus:outline-none transition-colors relative z-10 dark:[color-scheme:dark]"
                />
                {/* Updated icon color for dark mode (dark:text-slate-200) */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-0 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Syllabus Topics</label>
              <textarea
                required
                value={rawTopics}
                onChange={e => setRawTopics(e.target.value)}
                placeholder="Paste your syllabus here, separated by commas or new lines..."
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-0 focus:outline-none h-32 resize-none placeholder-slate-400"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Don't worry, you can edit this later.</p>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg mt-2 cursor-pointer"
            >
              Next: Identify Weak Areas
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tap topics you find difficult:</h2>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950">
              {parsedTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => toggleWeakness(topic.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                    topic.isWeak 
                      ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              Selected weak areas will be prioritized by the AI.
            </p>
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={finalizeExam}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer"
              >
                Create Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSetup;