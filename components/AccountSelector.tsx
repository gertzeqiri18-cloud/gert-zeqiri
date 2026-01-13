
import React from 'react';
import { Account } from '../types';

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const BankIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const AccountSelector: React.FC<AccountSelectorProps> = ({ accounts, selectedId, onSelect }) => {
  const current = accounts.find(a => a.id === selectedId) || accounts[0];
  if (!current) return null;

  const pnl = current.balance - current.startingBalance;
  const pnlPct = (pnl / current.startingBalance) * 100;
  
  const currentStepConfig = current.currentStep === 1 ? current.stepTargets.step1 : 
                           current.currentStep === 2 ? current.stepTargets.step2 : 
                           current.stepTargets.step3;

  const targetPct = currentStepConfig?.profitTarget || 10;
  const isTargetAccount = !current.isFunded && current.type !== 'Personal' && current.type !== 'Instant';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <select 
            value={selectedId}
            onChange={(e) => onSelect(e.target.value)}
            className="bg-transparent border-none p-0 text-sm font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="dark:bg-slate-800">{acc.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{current.type}</span>
             {current.isFunded && (
               <span className="text-[10px] font-black bg-primary text-white px-1.5 rounded uppercase">Funded</span>
             )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-primary transition-colors">
          <BankIcon />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 font-bold uppercase">Equity</span>
            <span className="text-slate-900 dark:text-white font-black">${current.balance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase">P/L (Total)</span>
            <span className={`font-black ${pnl >= 0 ? 'text-primary' : 'text-rose-500'}`}>
              {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {isTargetAccount && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
              <span>Step {current.currentStep} Target</span>
              <span>{Math.min(100, Math.max(0, (pnlPct / targetPct) * 100)).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, (pnlPct / targetPct) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSelector;
