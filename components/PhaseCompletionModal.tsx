
import React from 'react';
import { Account, Trade, User } from '../types';

interface PhaseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  trades: Trade[];
  user: User;
  onAdvanceStep: () => void;
}

const TrophyIcon = () => <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

const PhaseCompletionModal: React.FC<PhaseCompletionModalProps> = ({ 
  isOpen, 
  onClose, 
  account, 
  trades, 
  user,
  onAdvanceStep 
}) => {
  if (!isOpen) return null;

  // Filter trades for the phase just passed
  const phaseTrades = trades.filter(t => t.phase === account.currentStep);
  const winCount = phaseTrades.filter(t => t.outcome === 'win').length;
  const totalTrades = phaseTrades.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const phasePnL = phaseTrades.reduce((sum, t) => sum + t.profitAmount, 0);
  
  const getStepName = () => {
    if (account.type === 'Instant') return 'your Challenge';
    return `Step ${account.currentStep}`;
  };

  const isFinalStep = () => {
    if (account.type === 'Instant') return true;
    if (account.type === '2-Step' && account.currentStep === 2) return true;
    if (account.type === '3-Step' && account.currentStep === 3) return true;
    return false;
  };

  const nextActionLabel = isFinalStep() ? 'CLAIM FUNDED ACCOUNT' : `CONTINUE TO PHASE ${account.currentStep + 1}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-primary/30 w-full max-w-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="p-10 text-center">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-primary rounded-3xl rotate-12 shadow-2xl shadow-primary-glow animate-bounce">
            <TrophyIcon />
          </div>

          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Goal Reached, {user.username}!
          </h2>
          <p className="text-xl text-primary font-bold uppercase tracking-widest mb-8">
            {isFinalStep() ? 'FUNDED STATUS ACHIEVED' : `${getStepName()} COMPLETE`}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatBox label="Trades" value={totalTrades.toString()} />
            <StatBox label="Win Rate" value={`${winRate.toFixed(1)}%`} />
            <StatBox label="Phase P/L" value={`$${phasePnL.toLocaleString()}`} color="text-primary" />
            <StatBox label="Status" value="PASS" color="text-primary" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-10 border border-slate-100 dark:border-slate-800 transition-colors">
            <p className="text-slate-600 dark:text-slate-300 italic text-lg leading-relaxed">
              {isFinalStep() 
                ? "Excellent discipline. You've cleared the evaluation hurdles. Your capital is now activated for live market execution." 
                : "Phase objectives secured. You've demonstrated the mathematical edge required for the next level."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onAdvanceStep}
              className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-glow active:scale-95"
            >
              {nextActionLabel}
            </button>
            <button 
              onClick={onClose}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95"
            >
              VIEW SUMMARY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-slate-900 dark:text-white" }) => (
  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-black ${color}`}>{value}</div>
  </div>
);

export default PhaseCompletionModal;
