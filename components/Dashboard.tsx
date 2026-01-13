
import React, { useMemo, useState, useEffect } from 'react';
import { Trade, Account } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

interface DashboardProps {
  trades: Trade[];
  account?: Account;
  selectedPhase: number;
  onPhaseChange: (phase: number) => void;
  onAdvanceStep: () => void;
  alerts: { message: string, type: 'warning' | 'info' | 'critical' } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, account, selectedPhase, onPhaseChange, onAdvanceStep, alerts }) => {
  const currentPnL = trades.reduce((acc, t) => acc + t.profitAmount, 0);
  const winCount = trades.filter(t => t.outcome === 'win').length;
  const lossCount = trades.filter(t => t.outcome === 'loss').length;
  const beCount = trades.filter(t => t.outcome === 'be').length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  const currentStepConfig = account ? (
    selectedPhase === 1 ? account.stepTargets.step1 :
    selectedPhase === 2 ? account.stepTargets.step2 :
    account.stepTargets.step3
  ) : null;

  const profitTargetAmt = account ? (account.startingBalance * (currentStepConfig?.profitTarget || 10) / 100) : 1000;
  const maxDailyLossAmt = account ? (account.dailyStartingBalance * (currentStepConfig?.dailyDrawdownLimit || 5) / 100) : 500;
  const maxDrawdownAmt = account ? (account.startingBalance * (account.maxDrawdownPercent || 10) / 100) : 1000;

  const todayIso = new Date().toISOString().split('T')[0];
  const dailyPnL = trades.filter(t => t.date.startsWith(todayIso)).reduce((sum, t) => sum + t.profitAmount, 0);
  const currentDrawdown = Math.abs(Math.min(0, currentPnL));

  const isCurrentPhase = account && (account.isFunded ? selectedPhase === 4 : selectedPhase === account.currentStep);
  const canAdvance = account && isCurrentPhase && currentPnL >= profitTargetAmt && !account.isFunded;

  const equityData = trades.reduce((acc: any[], trade, idx) => {
    const prevBal = idx === 0 ? (account?.startingBalance || 0) : acc[idx-1].balance;
    acc.push({ date: trade.date, balance: prevBal + trade.profitAmount });
    return acc;
  }, [{ date: 'Start', balance: account?.startingBalance || 0 }]);

  const phaseOptions = useMemo(() => {
    if (!account) return [{ id: 1, label: 'Phase 1' }];
    const opts = [{ id: 1, label: 'Phase 1' }];
    if (account.stepTargets.step2 || account.currentStep >= 2) opts.push({ id: 2, label: 'Phase 2' });
    if (account.stepTargets.step3 || account.currentStep >= 3) opts.push({ id: 3, label: 'Phase 3' });
    if (account.isFunded) opts.push({ id: 4, label: 'Funded' });
    return opts;
  }, [account]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {phaseOptions.map(opt => (
            <button key={opt.id} onClick={() => onPhaseChange(opt.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedPhase === opt.id ? 'bg-primary text-white shadow-lg shadow-primary-glow/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {canAdvance && (
          <button onClick={onAdvanceStep} className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest animate-bounce shadow-xl shadow-primary-glow">
            Start Next Phase
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard label="Profit Goal" current={currentPnL} limit={profitTargetAmt} color="bg-primary" />
        <MetricCard label="Daily Stop" current={Math.abs(Math.min(0, dailyPnL))} limit={maxDailyLossAmt} color="bg-rose-500" />
        <MetricCard label="Max Drawdown" current={currentDrawdown} limit={maxDrawdownAmt} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm h-[480px] transition-all">
          <div className="flex justify-between items-start mb-8">
             <h3 className="text-xl font-black tracking-tighter">Live Equity Projection</h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">Performance Curve</span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={equityData}>
              <defs><linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
              <XAxis dataKey="date" hide />
              <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
              <ReferenceLine y={(account?.startingBalance || 0) + profitTargetAmt} stroke="#10b981" strokeDasharray="5 5" label={<Label value="Goal" position="right" fill="#10b981" fontSize={10} fontWeight="black" />} />
              <ReferenceLine y={(account?.dailyStartingBalance || 0) - maxDailyLossAmt} stroke="#f43f5e" strokeDasharray="3 3" label={<Label value="Daily Limit" position="right" fill="#f43f5e" fontSize={10} fontWeight="black" />} />
              <Area type="monotone" dataKey="balance" stroke="var(--color-primary)" strokeWidth={4} fill="url(#colorPnL)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center shadow-sm relative overflow-hidden group min-h-[480px]">
            <div className="relative w-56 h-56 flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-500">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502.65} strokeDashoffset={502.65 - (502.65 * winRate / 100)} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              {/* Perfectly centered win rate text inside the donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-5xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">{winRate.toFixed(0)}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Win Rate</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full mt-10 px-4">
               <DonutStat label="Wins" val={winCount} color="text-primary" />
               <DonutStat label="Loss" val={lossCount} color="text-rose-500" />
               <DonutStat label="B.E" val={beCount} color="text-slate-400" />
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] border transition-all ${alerts ? (alerts.type === 'critical' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30') : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Guard Status
            </h4>
            {alerts ? (
              <p className={`text-xs font-bold leading-relaxed ${alerts.type === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}>{alerts.message}</p>
            ) : (
              <p className="text-xs text-slate-500 font-bold">Risk parameters optimal. Edge maintained.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, current: number, limit: number, color: string }> = ({ label, current, limit, color }) => {
  const progress = Math.min(100, Math.max(0, (current / limit) * 100));
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">{label}</h4>
      <div className="text-3xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">${current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
        <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
        <span>Target: ${limit.toLocaleString()}</span>
        <span>{progress.toFixed(0)}%</span>
      </div>
    </div>
  );
};

const DonutStat: React.FC<{ label: string, val: number, color: string }> = ({ label, val, color }) => (
  <div className="text-center">
    <div className={`text-xl font-black ${color}`}>{val}</div>
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mt-1">{label}</div>
  </div>
);

export default Dashboard;
