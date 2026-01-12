
import React from 'react';
import { Icons as AppIcons } from '../constants';

interface SidebarProps {
  projects: any[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  view: 'list' | 'calendar' | 'vault' | 'focus';
  setView: (view: 'list' | 'calendar' | 'vault' | 'focus');
  isSyncing?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  setActiveProjectId, 
  view, 
  setView,
  isSyncing
}) => {
  return (
    <>
      <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen p-8 flex-col gap-10 sticky top-0">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/20">
              F
            </div>
            <h1 className="text-2xl font-black tracking-tight dark:text-white">Focus</h1>
          </div>
          {isSyncing && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Secure Sync Active" />
          )}
        </div>

        <nav className="flex flex-col gap-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Main Navigation</h2>
          <button
            onClick={() => { setView('list'); setActiveProjectId('all'); }}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              view === 'list' && activeProjectId === 'all' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AppIcons.List />
            Tasks
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              view === 'calendar' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AppIcons.Calendar />
            Calendar
          </button>
          <button
            onClick={() => setView('focus')}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              view === 'focus' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">⌛</span>
            Focus Mode
          </button>
          <button
            onClick={() => setView('vault')}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              view === 'vault' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AppIcons.Lock />
            Secure Vault
          </button>
        </nav>

        <div className="mt-auto p-6 bg-slate-100 dark:bg-slate-800/50 rounded-3xl">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-black uppercase tracking-widest leading-relaxed">
            Personal AI<br/>Productivity Suite
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around p-4 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => { setView('list'); setActiveProjectId('all'); }}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <AppIcons.List />
          <span className="text-[9px] font-black uppercase tracking-widest">Tasks</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'calendar' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <AppIcons.Calendar />
          <span className="text-[9px] font-black uppercase tracking-widest">Calendar</span>
        </button>
        <button 
          onClick={() => setView('focus')}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'focus' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <span className="text-xl">⌛</span>
          <span className="text-[9px] font-black uppercase tracking-widest">Focus</span>
        </button>
        <button 
          onClick={() => setView('vault')}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'vault' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <AppIcons.Lock />
          <span className="text-[9px] font-black uppercase tracking-widest">Vault</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
