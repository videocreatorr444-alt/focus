
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Icons } from '../constants';

interface CalendarViewProps {
  tasks: Task[];
  onSelectDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Fill previous month gaps
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }
    
    // Next month gaps
    const totalSlots = 42; // 6 rows
    const nextMonthGaps = totalSlots - days.length;
    for (let i = 1; i <= nextMonthGaps; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }
    
    return days;
  }, [year, month]);

  const navigateMonth = (step: number) => {
    setCurrentDate(new Date(year, month + step, 1));
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const todayStr = new Date().toDateString();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800 transition-all">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{monthName}</h3>
          <span className="text-sm font-bold text-indigo-500 tracking-widest uppercase">{year}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:scale-105 active:scale-95 transition-all">
            Today
          </button>
          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarData.map((item, i) => {
          const dateTasks = getTasksForDate(item.date);
          const isToday = item.date.toDateString() === todayStr;
          
          return (
            <button
              key={i}
              onClick={() => onSelectDate(item.date.toISOString().split('T')[0])}
              className={`relative flex flex-col h-20 md:h-24 rounded-2xl p-2 transition-all border group text-left ${
                !item.currentMonth 
                  ? 'opacity-30 border-transparent' 
                  : isToday 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-[1.02] z-10' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <span className={`text-xs font-bold mb-1 ${isToday ? 'text-white' : item.currentMonth ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                {item.day}
              </span>
              
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dateTasks.slice(0, 2).map(task => (
                  <div 
                    key={task.id} 
                    className={`h-1 rounded-full ${isToday ? 'bg-white/40' : 'bg-indigo-500'}`}
                  />
                ))}
                {dateTasks.length > 2 && (
                  <span className={`text-[8px] font-bold ${isToday ? 'text-white/80' : 'text-slate-400'}`}>
                    +{dateTasks.length - 2} more
                  </span>
                )}
              </div>
              
              {item.currentMonth && dateTasks.length > 0 && !isToday && (
                <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-6">
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 shadow-sm" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Future</span>
         </div>
      </div>
    </div>
  );
};

export default CalendarView;
