import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Exam } from '../types';
import { generateAIResponse } from '../services/gemini';
import { saveMessage, getChatHistory } from '../services/storage';
import Galaxy from './ui/Galaxy'; // 1. Changed Import from LightRays to Galaxy

interface ChatInterfaceProps {
  exam: Exam;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ exam }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = getChatHistory();
    if (history.length === 0) {
        const intro: Message = {
            id: 'init',
            role: 'model',
            text: `Hi! I'm ready to help you ace **${exam.name}** 🎓. \n\nWe have ${exam.topics.length} topics and limited time. What should we tackle today?`,
            timestamp: Date.now()
        };
        setMessages([intro]);
        saveMessage(intro);
    } else {
        setMessages(history);
    }
  }, [exam.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessage(userMsg);
    setInput('');
    setIsLoading(true);

    const aiText = await generateAIResponse(messages, exam, userMsg.text);

    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: 'model',
      text: aiText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    saveMessage(botMsg);
    setIsLoading(false);
  };

  const getDaysLeft = () => {
    const today = new Date();
    const examDate = new Date(exam.date);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();
  const urgencyColor = daysLeft < 3 
    ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' 
    : 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-200 overflow-hidden">
      
      {/* 2. Replaced LightRays with Galaxy Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Galaxy
            starSpeed={0}
            density={6.2}
            hueShift={155}
            speed={1.1}
            glowIntensity={0.25}
            saturation={0.4}
            mouseRepulsion={false}
            repulsionStrength={0.5}
            twinkleIntensity={0.05}
            rotationSpeed={0.05}
            transparent={true}
        />
      </div>

      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center shadow-sm z-10 transition-colors duration-200">
        <div>
           <h2 className="font-semibold text-slate-800 dark:text-slate-100">Study Companion</h2>
           <p className="text-xs text-slate-400 dark:text-slate-500">Powered by gemma-3-27b</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${urgencyColor}`}>
           {daysLeft > 0 ? `${daysLeft} Days Left` : (daysLeft === 0 ? 'EXAM TODAY' : 'Exam Finished')}
        </div>
      </div>

      {/* Messages - z-10 ensures they are above the background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed transition-colors duration-200 backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600/90 text-white rounded-br-none' // slightly transparent for effect
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-none'
              }`}
            >
              <div className="markdown-content">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white/80 dark:bg-slate-900/80 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-800 shadow-sm flex gap-2 items-center backdrop-blur-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input - z-20 to be above everything */}
      <div className="p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 z-20 backdrop-blur-md">
        <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask: What should I focus on today?"
                className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors cursor-target"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;