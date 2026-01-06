import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, logout } from './services/firebase';
import ExamSetup from './components/ExamSetup';
import TopicTracker from './components/TopicTracker';
import ChatInterface from './components/ChatInterface';
import Login from './components/login';
import { getActiveExam, clearData } from './services/storage';
import { Exam } from './types';
import DotPattern from './components/ui/DotPattern';
import TargetCursor from './components/ui/TargetCursor';
import DotGrid from './components/ui/DotGrid'; // 1. Changed Import
import { cn } from './lib/utils';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- DARK MODE ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
        const storedExam = getActiveExam();
        if (storedExam) setActiveExam(storedExam);
    }
  }, [user]);

  const handleReset = () => {
    clearData();
    setActiveExam(null);
    setIsSidebarOpen(false);
  };

  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
            <DotPattern 
                className={cn(
                    "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
                    "fill-slate-300 dark:fill-slate-800"
                )}
            />
        </div>
        <div className="relative z-10 w-full h-full">
            {children}
        </div>
    </div>
  );

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Loading...</div>;

  // 1. LOGIN SCREEN
  if (!user) {
    return (
        <>
            <TargetCursor targetSelector="button, a, input, .cursor-target" />
            <Login />
        </>
    );
  }

  // 2. EXAM SETUP SCREEN (Replaced Galaxy with DotGrid)
  if (!activeExam) {
    return (
        <div className="relative min-h-screen bg-slate-900 transition-colors duration-200 overflow-hidden flex items-center justify-center">
             <TargetCursor targetSelector="button, a, input, .cursor-target" />
             
             {/* DotGrid Background */}
             <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <DotGrid
                    dotSize={3}
                    gap={78}
                    baseColor="#5227FF"
                    activeColor="#5227FF"
                    proximity={150}
                    speedTrigger={100}
                    shockRadius={250}
                    shockStrength={2}
                    maxSpeed={200}
                    resistance={7500}
                    returnDuration={2.5}
                />
             </div>
             
             {/* Top Controls */}
             <button 
                onClick={toggleDarkMode}
                className="absolute top-4 left-4 z-50 p-2 rounded-full bg-slate-800 text-slate-300 shadow-md border border-slate-700 cursor-target hover:bg-slate-700 transition-colors"
                title="Toggle Theme"
             >
                {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                )}
             </button>

             <button 
                onClick={logout} 
                className="absolute top-4 right-4 text-sm text-slate-400 hover:text-red-400 underline z-50 cursor-target transition-colors"
             >
                Sign Out
             </button>
             
             {/* Setup Form */}
             <div className="relative z-10 w-full max-w-4xl px-4">
                <ExamSetup onSetupComplete={setActiveExam} />
             </div>
        </div>
    );
  }

  // 3. MAIN APP INTERFACE
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <TargetCursor targetSelector="button, a, input, .cursor-target, .topic-item" />

      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-3 right-3 z-50 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-target"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <TopicTracker 
                exam={activeExam} 
                onUpdate={setActiveExam} 
                onReset={handleReset}
                className="flex-1"
            />
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 z-10">
                <div className="flex items-center gap-3 mb-4 px-2">
                    {user.photoURL && <img src={user.photoURL} className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-700" alt="User" />}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={toggleDarkMode}
                        className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-2 transition-all shadow-sm cursor-target"
                    >
                        {darkMode ? 'Light' : 'Dark'}
                    </button>
                    <button 
                        onClick={logout} 
                        className="flex-1 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 rounded px-2 py-2 transition-colors cursor-target"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
      </div>
      
      {isSidebarOpen && (
        <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/50 z-30 md:hidden glass"
        />
      )}

      <main className="flex-1 h-full relative bg-slate-50 dark:bg-slate-950">
        <BackgroundWrapper>
            <ChatInterface exam={activeExam} />
        </BackgroundWrapper>
      </main>
    </div>
  );
};

export default App;