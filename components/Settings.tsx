
import React, { useState } from 'react';
import { User, Account, AppTheme, RiskLimits } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  activeAccount?: Account;
  onUpdateAccount: (acc: Account) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, user, onUpdateUser, onLogout, activeAccount, onUpdateAccount }) => {
  const [newFav, setNewFav] = useState({ strategy: '', model: '' });
  if (!isOpen) return null;

  const removeFav = (type: 'strategy' | 'model', val: string) => {
    if (type === 'strategy') onUpdateUser({ ...user, favoriteStrategies: user.favoriteStrategies.filter(s => s !== val) });
    else onUpdateUser({ ...user, favoriteEntryModels: user.favoriteEntryModels.filter(m => m !== val) });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden transition-all">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-2xl font-black tracking-tighter">System Configuration</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="p-10 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <section className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-black tracking-tight">Display Mode</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Light / Dark Appearance</p>
            </div>
            <button onClick={() => onUpdateUser({ ...user, theme: user.theme === 'light' ? 'dark' : 'light' })} className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-primary transition-all active:scale-90 border border-slate-100 dark:border-slate-700">
              {user.theme === 'light' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategy & Model Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">My Strategies</p>
                <div className="flex flex-wrap gap-2">
                  {(user.favoriteStrategies || []).map(s => <span key={s} onClick={() => removeFav('strategy', s)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-bold border border-primary/20 cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all">{s} ×</span>)}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">My Entry Models</p>
                <div className="flex flex-wrap gap-2">
                  {(user.favoriteEntryModels || []).map(m => <span key={m} onClick={() => removeFav('model', m)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all">{m} ×</span>)}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600">Secure Logout</button>
            <button onClick={onClose} className="bg-primary hover:bg-primary-hover text-white px-12 py-4 rounded-[2rem] font-black text-sm transition-all shadow-xl shadow-primary-glow">CLOSE SETTINGS</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
