import React, { useState } from 'react';
import { Topic, Exam } from '../types';
import { updateTopicStatus, addTopic, editTopic, deleteTopic } from '../services/storage';

interface TopicTrackerProps {
  exam: Exam;
  onUpdate: (updatedExam: Exam) => void;
  onReset: () => void;
  className?: string;
}

const TopicTracker: React.FC<TopicTrackerProps> = ({ exam, onUpdate, onReset, className }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [newTopicName, setNewTopicName] = useState('');

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name: newTopicName,
      isWeak: false,
      status: 'pending'
    };

    const updated = addTopic(newTopic);
    if (updated) onUpdate(updated);
    setNewTopicName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    const updated = editTopic(editingTopic);
    if (updated) onUpdate(updated);
    setEditingTopic(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this topic?")) {
        const updated = deleteTopic(id);
        if (updated) onUpdate(updated);
        setEditingTopic(null);
    }
  };

  const initiateCompletion = (topicId: string) => {
    setShowCompleteConfirm(topicId);
  };

  const confirmCompletion = () => {
    if (showCompleteConfirm) {
      const updated = updateTopicStatus(showCompleteConfirm, 'completed');
      if (updated) onUpdate(updated);
      setShowCompleteConfirm(null);
    }
  };

  const undoCompletion = (topicId: string) => {
      const updated = updateTopicStatus(topicId, 'pending');
      if (updated) onUpdate(updated);
  };

  const handleResetClick = () => {
    if (confirmReset) {
      onReset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const sortedTopics = [...exam.topics].sort((a, b) => {
    const score = (t: Topic) => {
      if (t.status === 'completed') return 10;
      if (t.status === 'skipped') return 20;
      if (t.isWeak) return 0;
      return 5;
    };
    return score(a) - score(b);
  });

  const completedCount = exam.topics.filter(t => t.status === 'completed').length;
  const progress = Math.round((completedCount / exam.topics.length) * 100) || 0;

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-200 ${className}`}>
      {/* Header & Progress */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100 truncate">{exam.name}</h2>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex justify-between">
          <span>{completedCount} / {exam.topics.length} Done</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-700 ease-in-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Topic List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedTopics.map(topic => {
           return (
            <div 
              key={topic.id}
              className={`p-3 rounded-lg border flex flex-col gap-2 group transition-all relative ${
                topic.status === 'completed' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                  : topic.isWeak 
                    ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${topic.status === 'completed' ? 'line-through opacity-75' : 'text-slate-800 dark:text-slate-200'}`}>
                            {topic.name}
                        </span>
                        {topic.isWeak && topic.status !== 'completed' && (
                            <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded font-bold uppercase">Weak</span>
                        )}
                    </div>
                    {topic.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{topic.description}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-2">
                    {topic.status !== 'completed' ? (
                        <button
                            onClick={() => initiateCompletion(topic.id)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 transition-colors shadow-sm"
                            title="Mark Complete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => undoCompletion(topic.id)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shadow-sm"
                            title="Undo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /></svg>
                        </button>
                    )}
                    <button
                        onClick={() => setEditingTopic(topic)}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 transition-colors shadow-sm"
                        title="Edit Topic"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Topic Input */}
      <form onSubmit={handleAddTopic} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-2 shadow-inner transition-colors duration-200">
        <input 
            type="text" 
            value={newTopicName}
            onChange={e => setNewTopicName(e.target.value)}
            placeholder="Add new topic..."
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm transition-all text-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
        />
        <button 
            type="submit"
            disabled={!newTopicName.trim()}
            className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all active:scale-95"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </form>

      {/* Reset Button */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
         <button 
            type="button"
            onClick={handleResetClick}
            className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-3 rounded-lg transition-allHP border ${
              confirmReset 
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-transparent hover:border-red-200 dark:hover:border-red-900'
            }`}
         >
            {confirmReset ? (
              <>Confirm Delete</>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                Reset / New Exam
              </>
            )}
         </button>
      </div>

      {/* --- MODALS --- */}

      {/* Completion Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-20 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4">
                    <svg className="text-emerald-600 dark:text-emerald-400 w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Topic Completed?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to mark this topic as done? Good job!</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowCompleteConfirm(null)} className="flex-1 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button onClick={confirmCompletion} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-200 dark:shadow-none">Yes, Complete!</button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/50 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
            <form onSubmit={handleSaveEdit} className="bg-indigo-50 dark:bg-slate-900 rounded-xl shadow-2xl border border-indigo-100 dark:border-slate-800 p-6 w-full max-w-sm flex flex-col gap-4 ring-1 ring-black/5">
                <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-200">Edit Topic</h3>
                
                <div>
                    <label className="block text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase mb-1">Topic Name</label>
                    <input 
                        required
                        className="w-full p-2.5 border border-indigo-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white" 
                        value={editingTopic.name} 
                        onChange={e => setEditingTopic({...editingTopic, name: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase mb-1">Description (Optional)</label>
                    <textarea 
                        className="w-full p-2.5 border border-indigo-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-24 resize-none text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white" 
                        value={editingTopic.description || ''} 
                        onChange={e => setEditingTopic({...editingTopic, description: e.target.value})}
                        placeholder="Notes about this topic..."
                    />
                </div>

                <label className="flex items-center gap-2 p-3 border border-indigo-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={editingTopic.isWeak} 
                        onChange={e => setEditingTopic({...editingTopic, isWeak: e.target.checked})}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Weak Topic</span>
                </label>

                <div className="flex gap-3 pt-2">
                    <button 
                        type="button" 
                        onClick={() => handleDelete(editingTopic.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <div className="flex-1 flex gap-2 justify-end">
                        <button type="button" onClick={() => setEditingTopic(null)} className="px-4 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md font-medium">Save Changes</button>
                    </div>
                </div>
            </form>
        </div>
      )}

    </div>
  );
};

export default TopicTracker;