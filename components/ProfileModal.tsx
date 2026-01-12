
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onUpdate: (user: User) => void;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdate, onClose, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleSave = () => {
    onUpdate({
      ...user,
      name,
      avatar: avatar
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-indigo-500 overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800">
                <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              
              <div className="absolute -bottom-1 -right-1 flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title="Upload Photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </button>
                <button 
                  onClick={handleRandomAvatar}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title="Random Avatar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold dark:text-white">{name}</h2>
            </div>
            <p className="text-slate-500 text-sm font-medium">{user.email}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold transition-all"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Save Profile
              </button>
              <button
                onClick={onLogout}
                className="w-full py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
