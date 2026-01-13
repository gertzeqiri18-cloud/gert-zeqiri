
import React, { useState } from 'react';
import { Account, AccountChallengeType } from '../types';

interface AccountManagementProps {
  accounts: Account[];
  // Fix: updated onAddAccount to omit 'riskLimits' as it's handled by the parent App component
  onAddAccount: (acc: Omit<Account, 'id' | 'riskLimits'>) => void;
  onUpdateAccount: (acc: Account) => void;
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
  hideList?: boolean;
  forceOpen?: boolean;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ 
  accounts, 
  onAddAccount, 
  onUpdateAccount, 
  selectedAccountId,
  onSelectAccount,
  hideList = false,
  forceOpen = false
}) => {
  const [isAdding, setIsAdding] = useState(forceOpen);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    startingBalance: '100000',
    maxDrawdownPercent: '10',
    type: '2-Step' as AccountChallengeType,
    step1Target: '8',
    step1DD: '5',
    step2Target: '5',
    step2DD: '5',
    step3Target: '5',
    step3DD: '5',
  });

  const validate = () => {
    if (!formData.name.trim()) return "Account name is required";
    if (!formData.startingBalance || Number(formData.startingBalance) <= 0) return "Valid starting balance is required";
    
    if (formData.type === 'Instant' || formData.type === 'Personal') {
      if (!formData.step1DD) return "Max Daily Loss/Drawdown is required";
    }

    if (formData.type === '2-Step' || formData.type === '3-Step') {
       if (!formData.step1Target || !formData.step1DD) return "Step 1 Profit Target and Daily Drawdown are required";
    }

    if (formData.type === '2-Step') {
      if (!formData.step2Target || !formData.step2DD) return "Step 2 Profit Target and Daily Drawdown are required";
    }

    if (formData.type === '3-Step') {
      if (!formData.step2Target || !formData.step2DD || !formData.step3Target || !formData.step3DD) {
        return "All 3 Steps' Profit Targets and Daily Drawdowns are required";
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const stepTargets: any = {
      step1: { profitTarget: Number(formData.step1Target), dailyDrawdownLimit: Number(formData.step1DD) }
    };

    if (formData.type === '2-Step' || formData.type === '3-Step') {
      stepTargets.step2 = { profitTarget: Number(formData.step2Target), dailyDrawdownLimit: Number(formData.step2DD) };
    }
    if (formData.type === '3-Step') {
      stepTargets.step3 = { profitTarget: Number(formData.step3Target), dailyDrawdownLimit: Number(formData.step3DD) };
    }

    onAddAccount({
      name: formData.name,
      startingBalance: Number(formData.startingBalance),
      balance: Number(formData.startingBalance),
      dailyStartingBalance: Number(formData.startingBalance),
      maxDrawdownPercent: Number(formData.maxDrawdownPercent),
      type: formData.type,
      stepTargets,
      currentStep: 1,
      isFunded: false
    });

    if (!forceOpen) setIsAdding(false);
    setFormData({ 
      name: '', 
      startingBalance: '100000', 
      maxDrawdownPercent: '10', 
      type: '2-Step',
      step1Target: '8', step1DD: '5',
      step2Target: '5', step2DD: '5',
      step3Target: '5', step3DD: '5',
    });
  };

  const isPersonal = formData.type === 'Personal';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!hideList && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Account Management</h2>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setError(null);
            }}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-black transition-all shadow-lg shadow-primary-glow"
          >
            {isAdding ? 'CANCEL' : '+ ADD NEW ACCOUNT'}
          </button>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl animate-in slide-in-from-top-8 duration-300 transition-colors">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-500 text-sm font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Account Name</label>
              <input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder={isPersonal ? "My Main Portfolio" : "Live Apex 50k"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Starting Balance ($)</label>
              <input 
                type="number" required 
                value={formData.startingBalance} 
                onChange={e => setFormData({...formData, startingBalance: e.target.value})} 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Account Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as AccountChallengeType})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <option value="Personal">Personal (Self-Managed)</option>
                <option value="Instant">Instant (Funded Immediately)</option>
                <option value="2-Step">2-Step Evaluation</option>
                <option value="3-Step">3-Step Evaluation</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all">
              <div className="md:col-span-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest">
                  {isPersonal ? 'Daily Goals & Risk' : formData.type === 'Instant' ? 'Live Risk Config' : 'Step 1 Configuration'}
                </h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Required</span>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">
                  {isPersonal ? 'Daily Profit Target (%)' : 'Phase Profit Target (%)'}
                </label>
                <input type="number" step="0.1" value={formData.step1Target} onChange={e => setFormData({...formData, step1Target: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">
                  {isPersonal ? 'Daily Max Loss (%)' : 'Max Daily Drawdown (%)'}
                </label>
                <input type="number" step="0.1" value={formData.step1DD} onChange={e => setFormData({...formData, step1DD: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white" />
              </div>
            </div>

            {(formData.type === '2-Step' || formData.type === '3-Step') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-left-4 duration-300 transition-all">
                <div className="md:col-span-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest">Step 2 Configuration</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Required</span>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Step 2 Profit Target (%)</label>
                  <input type="number" step="0.1" value={formData.step2Target} onChange={e => setFormData({...formData, step2Target: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Step 2 Max Daily Drawdown (%)</label>
                  <input type="number" step="0.1" value={formData.step2DD} onChange={e => setFormData({...formData, step2DD: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white" />
                </div>
              </div>
            )}

            {formData.type === '3-Step' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-left-4 duration-300 transition-all">
                <div className="md:col-span-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest">Step 3 Configuration</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Required</span>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Step 3 Profit Target (%)</label>
                  <input type="number" step="0.1" value={formData.step3Target} onChange={e => setFormData({...formData, step3Target: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Step 3 Max Daily Drawdown (%)</label>
                  <input type="number" step="0.1" value={formData.step3DD} onChange={e => setFormData({...formData, step3DD: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white" />
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Total Max Account Drawdown (%)</label>
              <input type="number" step="0.1" value={formData.maxDrawdownPercent} onChange={e => setFormData({...formData, maxDrawdownPercent: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
            </div>
          </div>

          <button type="submit" className="w-full mt-8 bg-primary py-4 rounded-xl font-black text-white hover:bg-primary-hover transition-all active:scale-95 shadow-xl shadow-primary-glow">
            {hideList ? 'ACTIVATE EDGE' : 'INITIALIZE ACCOUNT'}
          </button>
        </form>
      )}

      {!hideList && (
        <div className="grid grid-cols-1 gap-6">
          {accounts.map(acc => {
            const pnl = acc.balance - acc.startingBalance;
            const pnlPct = (pnl / acc.startingBalance) * 100;
            const isActive = selectedAccountId === acc.id;
            
            const currentStepConfig = acc.currentStep === 1 ? acc.stepTargets.step1 : 
                                     acc.currentStep === 2 ? acc.stepTargets.step2 : 
                                     acc.stepTargets.step3;
            
            const targetPct = currentStepConfig?.profitTarget || 10;
            const showsTarget = !acc.isFunded;

            return (
              <div 
                key={acc.id} 
                className={`bg-white dark:bg-slate-800 p-8 rounded-3xl border transition-all duration-300 shadow-xl ${
                  isActive ? 'border-primary ring-2 ring-primary-glow' : 'border-slate-200 dark:border-slate-700 grayscale-[0.2] opacity-90 hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        acc.isFunded ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                      }`}>
                        {acc.isFunded ? 'Funded' : acc.type}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{acc.name}</h3>
                      {isActive && <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 animate-pulse uppercase tracking-widest">ACTIVE</span>}
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                      Starting Balance: ${acc.startingBalance.toLocaleString()} | {acc.isFunded ? 'Funded Mode' : acc.type === 'Personal' ? 'Personal Portfolio' : `Phase: Step ${acc.currentStep}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Equity</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">${acc.balance.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Performance</div>
                      <div className={`text-2xl font-black ${pnl >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                    </div>
                    {!isActive && onSelectAccount && (
                      <button 
                        onClick={() => onSelectAccount(acc.id)}
                        className="bg-slate-900 dark:bg-slate-700 hover:bg-primary text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        SWITCH
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {showsTarget && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>{acc.type === 'Personal' ? 'Daily Target' : 'Phase Target'} Progress ({targetPct}%)</span>
                        <span className="text-primary font-black">{Math.min(100, Math.max(0, (pnlPct / targetPct) * 100)).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, (pnlPct / targetPct) * 100))}%` }}></div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Total Max Drawdown ({acc.maxDrawdownPercent}%)</span>
                      <span className="text-rose-500 font-black">
                        {Math.abs(Math.min(0, pnlPct)).toFixed(1)}% / {acc.maxDrawdownPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (Math.abs(Math.min(0, pnlPct)) / acc.maxDrawdownPercent) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
