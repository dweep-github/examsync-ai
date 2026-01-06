import React from 'react';
import { signInWithGoogle } from '../services/firebase';
import DotGrid from './ui/DotGrid'; // Changed Import

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden transition-colors duration-200">
      
      {/* 1. Add The DotGrid Background */}
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-900/50 transform rotate-3">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">ExamSync AI</h1>
          <p className="text-slate-400 font-medium">Your intelligent study companion</p>
        </div>

        <button 
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-slate-800 border border-slate-700 text-slate-200 font-bold py-4 px-4 rounded-xl hover:bg-slate-700 transition-all shadow-sm active:scale-[0.98] group cursor-target"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Sign in with Google</span>
        </button>
        
        <p className="mt-8 text-[10px] uppercase tracking-widest text-center text-slate-500 font-semibold">
          Secure Login • Powered by Gemini
        </p>
      </div>
    </div>
  );
};

export default Login;