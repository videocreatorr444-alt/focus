
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import QuickCapture from './components/QuickCapture';
import TaskItem from './components/TaskItem';
import CalendarView from './components/CalendarView';
import VaultView from './components/VaultView';
import FocusMode from './components/FocusMode';
import AuthScreen from './components/AuthScreen';
import ProfileModal from './components/ProfileModal';
import { Task, Project, Priority, NLPParseResult, User, SubTask } from './types';
import { DEFAULT_PROJECTS, Icons } from './constants';
import * as db from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('focusflow_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [view, setView] = useState<'list' | 'calendar' | 'vault' | 'focus'>('list');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedDateFromCalendar, setSelectedDateFromCalendar] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedUser = localStorage.getItem('focusflow_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserData(parsedUser.email);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('focusflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('focusflow_theme', 'light');
    }
  }, [isDarkMode]);

  const loadUserData = async (email: string) => {
    setIsSyncing(true);
    const backup = await db.restoreFromCloud(email);
    const localTasks = await db.getAllFromStore('tasks');
    
    if (backup && localTasks.length === 0) {
      setTasks(backup.tasks || []);
      backup.tasks?.forEach((t: Task) => db.saveToStore('tasks', t));
    } else {
      setTasks(localTasks);
    }
    setIsSyncing(false);
  };

  const handleLogin = async (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('focusflow_current_user', JSON.stringify(newUser));
    await loadUserData(newUser.email);
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    localStorage.removeItem('focusflow_current_user');
    setIsProfileModalOpen(false);
    setView('list');
  };

  useEffect(() => {
    if (user && tasks.length >= 0) {
      const timer = setTimeout(() => {
        db.syncToCloud(user.email, { tasks });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, user]);

  const projectsWithCounts = useMemo(() => {
    return [{ id: 'all', name: 'All', color: '#6366f1', icon: '⚡' }, ...DEFAULT_PROJECTS].map(p => ({
      ...p,
      count: tasks.filter(t => (p.id === 'all' || t.projectId === p.id) && !t.completed).length
    }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (activeProjectId !== 'all') {
      list = list.filter(t => t.projectId === activeProjectId);
    }
    if (searchQuery) {
      list = list.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? -1 : 1;
    });
  }, [tasks, activeProjectId, searchQuery]);

  const handleAddTask = async (parsed: NLPParseResult) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: parsed.title,
      dueDate: parsed.dueDate,
      priority: parsed.priority || Priority.MEDIUM,
      projectId: activeProjectId === 'all' ? (parsed.projectName?.toLowerCase() || 'inbox') : activeProjectId,
      tags: parsed.tags || [],
      completed: false,
      subTasks: [],
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    await db.saveToStore('tasks', newTask);
    setSelectedDateFromCalendar(undefined);
  };

  const toggleTask = async (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const updated = { ...t, completed: !t.completed };
        db.saveToStore('tasks', updated);
        return updated;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await db.removeFromStore('tasks', id);
  };

  const updateSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const updated = {
          ...t,
          subTasks: t.subTasks.map(s => s.id === subtaskId ? { ...s, completed } : s)
        };
        db.saveToStore('tasks', updated);
        return updated;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const handleAddSubtasks = async (taskId: string, titles: string[]) => {
    const newSubTasks: SubTask[] = titles.map(title => ({
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false
    }));

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, subTasks: [...t.subTasks, ...newSubTasks] };
        db.saveToStore('tasks', updated);
        return updated;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        projects={projectsWithCounts}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        view={view}
        setView={setView}
        isSyncing={isSyncing}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-10 pb-56 md:pb-12">
        <header className="flex items-center justify-between gap-4">
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Icons.Search />
            </div>
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-3.5 outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 shadow-md"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-amber-400 hover:scale-110 active:scale-95 transition-all shadow-md"
            >
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-800 shadow-lg overflow-hidden flex-shrink-0 active:scale-90 transition-transform"
            >
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        <section className="flex-1 space-y-6">
          {(view !== 'vault' && view !== 'focus') && (
            <div className="space-y-6">
              <div className="flex items-end justify-between px-2">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Focus Flow 🚀</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-black mt-1">
                    {view === 'calendar' ? 'CALENDAR OVERVIEW' : `SWIPE TO SELECT PROJECT`}
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 scroll-smooth snap-x snap-mandatory">
                  {projectsWithCounts.map(project => (
                    <button
                      key={project.id}
                      onClick={() => { setActiveProjectId(project.id); setView('list'); }}
                      className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] font-black whitespace-nowrap transition-all border snap-start ${
                        activeProjectId === project.id && view === 'list'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-105 z-10'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
                      }`}
                    >
                      <span className="text-xl">{project.icon}</span>
                      <span className="text-sm tracking-tight">{project.name}</span>
                      {project.count > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeProjectId === project.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {project.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none md:hidden" />
              </div>
            </div>
          )}

          {view === 'list' && (
            <div className="flex flex-col gap-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onUpdateSubtask={updateSubtask}
                    onAddSubtasks={handleAddSubtasks}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3.5rem]">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center text-indigo-300 dark:text-indigo-800 mb-6 text-4xl animate-pulse">
                    ☕
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Everything is Clear</h3>
                  <p className="text-slate-400 text-xs mt-2 px-10 text-center">Capture a new task to stay productive today.</p>
                </div>
              )}
            </div>
          )}

          {view === 'calendar' && (
            <div className="animate-in fade-in duration-500">
              <CalendarView tasks={tasks} onSelectDate={(date) => { setSelectedDateFromCalendar(date); setView('list'); }} />
            </div>
          )}

          {view === 'vault' && (
            <div className="animate-in fade-in duration-500">
              <VaultView userEmail={user.email} />
            </div>
          )}

          {view === 'focus' && (
            <div className="animate-in fade-in duration-500">
              <FocusMode tasks={tasks} />
            </div>
          )}
        </section>

        {(view !== 'vault' && view !== 'focus') && (
          <QuickCapture onAddTask={handleAddTask} initialDate={selectedDateFromCalendar} />
        )}
      </main>

      {isProfileModalOpen && (
        <ProfileModal user={user} onUpdate={handleLogin} onClose={() => setIsProfileModalOpen(false)} onLogout={handleLogout} />
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
