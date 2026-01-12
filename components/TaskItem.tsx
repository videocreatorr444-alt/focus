
import React, { useState } from 'react';
import { Task, Priority, SubTask } from '../types';
import { Icons as AppIcons } from '../constants';
import { generateSubtasks } from '../services/geminiService';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtasks?: (taskId: string, titles: string[]) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdateSubtask, onAddSubtasks }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'HIGH': return 'bg-red-500 shadow-sm shadow-red-500/50';
      case 'MEDIUM': return 'bg-amber-500 shadow-sm shadow-amber-500/50';
      case 'LOW': return 'bg-emerald-500 shadow-sm shadow-emerald-500/50';
      default: return 'bg-slate-400';
    }
  };

  const handleMagicSubtasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;
    setIsGenerating(true);
    const suggested = await generateSubtasks(task.title);
    if (onAddSubtasks && suggested.length > 0) {
      onAddSubtasks(task.id, suggested);
      setIsExpanded(true);
    }
    setIsGenerating(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all shadow-sm active:scale-[0.98] ${task.completed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
      <div className="flex items-center p-4 gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
            task.completed 
            ? 'bg-indigo-600 border-indigo-600 text-white scale-110' 
            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800'
          }`}
        >
          {task.completed && <AppIcons.Check />}
        </button>

        <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`} />
            <h3 className={`font-semibold truncate transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100 text-[1.05rem]'}`}>
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {task.dueDate && (
              <span className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 font-bold">
                <AppIcons.Calendar />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.tags?.length > 0 && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg truncate max-w-[100px]">
                #{task.tags[0]}
              </span>
            )}
            {task.subTasks?.length > 0 && (
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                {task.subTasks.filter((s: any) => s.completed).length}/{task.subTasks.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleMagicSubtasks}
            disabled={isGenerating}
            className={`p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-full transition-all ${isGenerating ? 'animate-spin' : ''}`}
            title="Generate AI Subtasks"
          >
            <span className="text-sm">✨</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-2 text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full"
          >
            <AppIcons.Trash />
          </button>
        </div>
      </div>

      {isExpanded && task.subTasks?.length > 0 && (
        <div className="px-14 pb-5 space-y-2.5 border-t border-slate-50 dark:border-slate-800/50 pt-4 animate-in slide-in-from-top-2">
          {task.subTasks.map((sub: any) => (
            <div key={sub.id} className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSubtask(task.id, sub.id, !sub.completed);
                }}
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  sub.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                {sub.completed && <AppIcons.Check />}
              </button>
              <span className={`text-sm font-medium ${sub.completed ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
