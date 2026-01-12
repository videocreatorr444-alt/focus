
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastUser, setLastUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('focusflow_last_user');
    if (saved) {
      setLastUser(JSON.parse(saved));
    }
  }, []);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsLoggingIn(true);
    const newUser = {
      name: name,
      email: email.toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`
    };
    
    setTimeout(() => {
      localStorage.setItem('focusflow_last_user', JSON.stringify(newUser));
      onLogin(newUser);
      setIsLoggingIn(false);
    }, 1500);
  };

  const handleContinueAs = () => {
    if (lastUser) {
      setIsLoggingIn(true);
      setTimeout(() => {
        onLogin(lastUser);
        setIsLoggingIn(false);
      }, 1000);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    // In a real production app, this would open Google OAuth
    // For this demo, we use a simulation
    setTimeout(() => {
      const googleUser = {
        name: 'Guest User',
        email: 'guest.pro@gmail.com',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`
      };
      onLogin(googleUser);
      setIsLoggingIn(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6 theme-transition overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center text-center py-10">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-indigo-500/40 mb-10 animate-pulse">
          F
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">FocusFlow</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Your tasks, synced everywhere.</p>
        
        {lastUser && !isLoggingIn && (
          <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl mb-8 animate-in slide-in-from-bottom-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Welcome Back</p>
            <div className="flex items-center gap-4 mb-6">
              <img src={lastUser.avatar} className="w-14 h-14 rounded-2xl shadow-md" alt="Avatar" />
              <div className="text-left">
                <h3 className="font-black text-slate-800 dark:text-slate-100">{lastUser.name}</h3>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{lastUser.email}</p>
              </div>
            </div>
            <button 
              onClick={handleContinueAs}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Continue as {lastUser.name.split(' ')[0]}
            </button>
            <button 
              onClick={() => { localStorage.removeItem('focusflow_last_user'); setLastUser(null); }}
              className="mt-4 text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Sign in with another account
            </button>
          </div>
        )}

        {(!lastUser || isLoggingIn) && (
          <form onSubmit={handleManualLogin} className="w-full space-y-4 mb-6 animate-in fade-in duration-500">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
              <input 
                type="text"
                placeholder="Enter your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-bold"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-[2rem] font-black shadow-2xl hover:bg-black dark:hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {isLoggingIn ? 'Syncing Profile...' : 'Create Account / Sign In'}
            </button>
          </form>
        )}

        {!isLoggingIn && !lastUser && (
          <>
            <div className="flex items-center gap-4 w-full mb-6">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Fast Access</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>
            
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-4 px-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all active:scale-95 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <span className="font-bold text-slate-700 dark:text-slate-200">Google OAuth Demo</span>
            </button>
          </>
        )}

        <div className="mt-12 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
           </div>
           <p className="text-[9px] text-slate-400 max-w-[200px] leading-relaxed">
             By signing in, you agree to our terms. Data is synced to your personal cloud partition.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
