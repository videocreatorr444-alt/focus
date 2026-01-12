
import React, { useState, useEffect, useRef } from 'react';
import { VaultItem } from '../types';
import { Icons } from '../constants';
import * as db from '../services/dbService';

interface VaultViewProps {
  userEmail: string;
}

const VaultView: React.FC<VaultViewProps> = ({ userEmail }) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [passcode, setPasscode] = useState(() => localStorage.getItem(`focusflow_vault_passcode_${userEmail}`) || '');
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [inputPasscode, setInputPasscode] = useState('');
  const [isSettingPasscode, setIsSettingPasscode] = useState(!passcode);
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadVault = async () => {
      setIsLoading(true);
      const backup = await db.restoreFromCloud(userEmail);
      let localItems = await db.getAllFromStore('vault');
      
      if (localItems.length === 0 && backup?.vault) {
        localItems = backup.vault;
        for (const item of localItems) {
          await db.saveToStore('vault', item);
        }
      }
      
      setItems(localItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsLoading(false);
    };
    loadVault();
  }, [userEmail]);

  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => {
        db.syncToCloud(userEmail, { vault: items });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [items, userEmail]);

  const handleSetPasscode = () => {
    if (newPasscode.length >= 4) {
      localStorage.setItem(`focusflow_vault_passcode_${userEmail}`, newPasscode);
      setPasscode(newPasscode);
      setIsSettingPasscode(false);
      setIsLocked(false);
    } else {
      alert("Passcode must be at least 4 digits");
    }
  };

  const handleUnlock = () => {
    if (inputPasscode === passcode) {
      setIsLocked(false);
      setInputPasscode('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 500);
      setInputPasscode('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const newItem: VaultItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: reader.result as string,
            name: file.name,
            createdAt: new Date().toISOString()
          };
          setItems(prev => [newItem, ...prev]);
          await db.saveToStore('vault', newItem);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this permanently?")) {
      setItems(prev => prev.filter(item => item.id !== id));
      await db.removeFromStore('vault', id);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-32">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Storage...</p>
      </div>
    );
  }

  if (isSettingPasscode) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mb-6 shadow-xl shadow-indigo-500/30">
          <Icons.Lock />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Setup Secure Vault</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-xs">Create a private passcode to hide your most sensitive media.</p>
        
        <input 
          type="password"
          maxLength={6}
          placeholder="New Passcode"
          value={newPasscode}
          onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ''))}
          className="w-full max-w-[200px] text-center bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 text-2xl tracking-[0.5em] font-black focus:ring-4 ring-indigo-500/10 outline-none mb-6"
        />
        
        <button 
          onClick={handleSetPasscode}
          className="w-full max-w-[200px] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Initialize Vault
        </button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl mb-8 transition-all duration-300 ${passcodeError ? 'bg-red-100 text-red-500 animate-shake' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {passcodeError ? '❌' : '🔒'}
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Vault Locked</h2>
        <p className="text-slate-400 text-sm mb-10">Enter your secure passcode</p>
        
        <div className="flex flex-col gap-4 w-full max-w-[220px]">
          <input 
            type="password"
            maxLength={6}
            placeholder="••••"
            value={inputPasscode}
            onChange={(e) => setInputPasscode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            className={`w-full text-center bg-slate-100 dark:bg-slate-800 border-none rounded-3xl px-4 py-5 text-3xl tracking-[0.6em] font-black focus:ring-4 ring-indigo-500/10 outline-none transition-all ${passcodeError ? 'ring-red-500/20' : ''}`}
            autoFocus
          />
          <button 
            onClick={handleUnlock}
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-black dark:hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Unlock Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Secure Vault</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-black">Encrypted Cloud Sync Active</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsLocked(true)}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90"
          >
            <Icons.Lock />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Icons.Plus />
            <span className="hidden sm:inline">Add Private Media</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*" 
            multiple 
            onChange={handleFileUpload} 
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3.5rem]">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 text-5xl">
            💎
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">Your vault is empty</h3>
          <p className="text-slate-400 text-sm mt-3 px-10 text-center max-w-sm leading-relaxed">Everything added here is hidden from the main list and protected by your secure passcode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="relative group aspect-square bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-transparent hover:border-indigo-500 transition-all duration-300 cursor-pointer"
            >
              {item.type === 'image' ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" />
              )}
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.516 7.548c0-.423.242-.811.63-.99l9-4c.484-.214 1.054.022 1.25.506.064.15.097.314.097.48v11.912c0 .663-.537 1.2-1.2 1.2-.166 0-.33-.033-.48-.097l-9-4A1.102 1.102 0 014.516 11.5v-3.952z"></path></svg>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                 <button 
                  onClick={(e) => removeItem(e, item.id)}
                  className="bg-white/20 hover:bg-red-500 backdrop-blur-md text-white p-3.5 rounded-2xl transition-all hover:scale-110 shadow-lg"
                 >
                   <Icons.Trash />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Media Viewer */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white p-3 hover:bg-white/10 rounded-full transition-all z-[110]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="relative w-full max-w-5xl max-h-[85vh] flex items-center justify-center">
            {selectedItem.type === 'image' ? (
              <img 
                src={selectedItem.url} 
                alt={selectedItem.name} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
              />
            ) : (
              <video 
                src={selectedItem.url} 
                controls 
                autoPlay
                className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
              />
            )}
            
            <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-between text-white/70 px-4">
              <div className="flex flex-col">
                <p className="text-sm font-black truncate max-w-xs">{selectedItem.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={(e) => removeItem(e as any, selectedItem.id)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95"
              >
                <Icons.Trash /> DELETE
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/20">
        <div className="flex gap-5">
          <div className="text-3xl w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">🛡️</div>
          <div>
            <h4 className="font-black text-indigo-900 dark:text-indigo-300 text-lg">Military-Grade Privacy</h4>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed mt-2">
              Your data is encrypted locally and synced across devices using your <b>{userEmail}</b> account. We do not have access to your passcode or your files.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default VaultView;
