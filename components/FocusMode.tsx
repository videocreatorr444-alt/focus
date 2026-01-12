
import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';

interface FocusModeProps {
  tasks: Task[];
}

const QUOTES = [
  "Focus on being productive instead of busy.",
  "Your mind is for having ideas, not holding them.",
  "Deep work is the superpower of the 21st century.",
  "Energy is the essence of life. Every day you decide how you’re going to spend it.",
  "The secret of getting ahead is getting started.",
  "Do the hard jobs first. The easy jobs will take care of themselves."
];

const FocusMode: React.FC<FocusModeProps> = ({ tasks }) => {
  const [sessionType, setSessionType] = useState<'focus' | 'short' | 'long'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const activeTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

  useEffect(() => {
    let duration = 25 * 60;
    if (sessionType === 'short') duration = 5 * 60;
    if (sessionType === 'long') duration = 15 * 60;
    
    setTimeLeft(duration);
    setIsActive(false);
  }, [sessionType]);

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        // Change quote every 5 minutes
        if (timeLeft % 300 === 0) setQuoteIndex(prev => (prev + 1) % QUOTES.length);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
      alert(`${sessionType.toUpperCase()} session completed!`);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, sessionType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = sessionType === 'focus' ? 25 * 60 : sessionType === 'short' ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center py-6 md:py-12 animate-in fade-in zoom-in duration-700">
      {/* Session Type Toggles */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] mb-12 shadow-inner">
        {[
          { id: 'focus', label: 'Focus', icon: '🎯' },
          { id: 'short', label: 'Short Break', icon: '☕' },
          { id: 'long', label: 'Long Break', icon: '🔋' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setSessionType(type.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${
              sessionType === type.id 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-md scale-105' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>{type.icon}</span>
            <span className="hidden sm:inline">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
        {/* Animated Background Pulse */}
        {isActive && (
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-[3000ms]" />
        )}
        
        {/* Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%" cy="50%" r="46%"
            className="stroke-slate-200 dark:stroke-slate-800 fill-none"
            strokeWidth="12"
          />
          <circle
            cx="50%" cy="50%" r="46%"
            className="stroke-indigo-600 fill-none transition-all duration-1000 ease-linear"
            strokeWidth="12"
            strokeDasharray="289%"
            strokeDashoffset={`${289 - (289 * progress) / 100}%`}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center text-center">
          <span className={`text-[11px] font-black uppercase tracking-[0.4em] mb-3 ${isActive ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`}>
            {isActive ? 'Deep Work in Progress' : 'Ready to start?'}
          </span>
          <h2 className="text-8xl md:text-9xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
            {formatTime(timeLeft)}
          </h2>
          
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`px-10 py-4 rounded-[2rem] font-black text-lg transition-all shadow-2xl active:scale-95 ${
                isActive 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200' 
                  : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700'
              }`}
            >
              {isActive ? 'PAUSE' : 'START FOCUS'}
            </button>
            <button 
              onClick={() => { setIsActive(false); setTimeLeft(totalTime); }}
              className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full hover:text-indigo-600 transition-all active:rotate-180 duration-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Task Selection */}
      <div className="mt-16 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">What are you working on?</label>
        <select 
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-indigo-500/20 transition-all appearance-none cursor-pointer"
        >
          <option value="">Choose a task from your list...</option>
          {tasks.filter(t => !t.completed).map(task => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </select>
        
        {activeTask && (
          <div className="mt-6 flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-top-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">🚀</div>
            <div>
              <h4 className="font-black text-indigo-900 dark:text-indigo-200 text-sm">Focusing on</h4>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-bold truncate">{activeTask.title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="mt-12 text-center max-w-sm px-6">
        <p className="text-lg font-medium text-slate-400 italic leading-relaxed animate-in fade-in duration-1000 key={quoteIndex}">
          "{QUOTES[quoteIndex]}"
        </p>
      </div>
    </div>
  );
};

export default FocusMode;
