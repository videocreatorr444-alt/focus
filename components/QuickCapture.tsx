
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { parseTaskNLP } from '../services/geminiService';
import { NLPParseResult } from '../types';

interface QuickCaptureProps {
  onAddTask: (parsed: NLPParseResult) => void;
  initialDate?: string;
}

const QuickCapture: React.FC<QuickCaptureProps> = ({ onAddTask, initialDate }) => {
  const [input, setInput] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialDate) {
      setManualDate(initialDate);
      setShowDatePicker(true);
      inputRef.current?.focus();
    }
  }, [initialDate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isParsing) return;

    setIsParsing(true);
    let result = await parseTaskNLP(input);
    
    if (result) {
      if (manualDate) {
        result.dueDate = new Date(manualDate).toISOString();
      }
      onAddTask(result);
    } else {
      onAddTask({ 
        title: input, 
        dueDate: manualDate ? new Date(manualDate).toISOString() : undefined 
      });
    }

    setInput('');
    setManualDate('');
    setShowDatePicker(false);
    setIsParsing(false);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <div className="fixed bottom-24 md:sticky md:top-10 md:bottom-auto z-40 left-0 right-0 md:left-auto md:right-auto mx-auto w-full max-w-2xl px-4 pb-safe">
      <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
        {showDatePicker && (
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 animate-in slide-in-from-bottom-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Schedule for</span>
            <input 
              type="date" 
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
            />
          </div>
        )}
        <form 
          onSubmit={handleSubmit}
          className={`flex items-center p-3 gap-2 ${isParsing ? 'animate-pulse' : ''}`}
        >
          <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-[2rem] px-5 transition-all focus-within:ring-4 ring-indigo-500/10 focus-within:bg-white dark:focus-within:bg-slate-950">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Start typing or use voice..."
              className="flex-1 bg-transparent border-none outline-none py-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-base font-medium"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`p-2.5 rounded-xl transition-all ${manualDate || showDatePicker ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
              >
                <Icons.Calendar />
              </button>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                  : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icons.Mic />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isParsing}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-14 h-14 flex items-center justify-center rounded-full font-bold transition-all shadow-xl shadow-indigo-600/30 active:scale-90 flex-shrink-0"
          >
            {isParsing ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icons.Plus />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickCapture;
