
import React, { useMemo, useState } from 'react';
import { Trade } from '../types';

interface StrategySummaryProps {
  trades: Trade[];
}

const StrategySummary: React.FC<StrategySummaryProps> = ({ trades }) => {
  const [modelFilter, setModelFilter] = useState('all');

  const stats = useMemo(() => {
    const summary: Record<string, { strategy: string, model: string, count: number, wins: number, pl: number, totalRR: number }> = {};
    trades.forEach(t => {
      const key = `${t.strategy}|${t.entryModel}`;
      if (!summary[key]) summary[key] = { strategy: t.strategy, model: t.entryModel, count: 0, wins: 0, pl: 0, totalRR: 0 };
      summary[key].count++;
      if (t.outcome === 'win') summary[key].wins++;
      summary[key].pl += t.profitAmount;
      const r = Math.abs(t.entryPrice - t.stopLoss);
      summary[key].totalRR += r > 0 ? (Math.abs(t.takeProfit - t.entryPrice) / r) : 0;
    });
    return Object.values(summary).sort((a, b) => b.pl - a.pl);
  }, [trades]);

  const filtered = stats.filter(s => modelFilter === 'all' || s.model === modelFilter);
  const models: string[] = ['all', ...(Array.from(new Set(trades.map(t => t.entryModel))) as string[])];

  if (trades.length === 0) return <div className="p-20 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">Execute trades to generate alpha intelligence.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tighter">Execution Matrix</h2>
        <select value={modelFilter} onChange={e => setModelFilter(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">
          {models.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm hover:border-primary/20 transition-all group">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight">{s.strategy} <span className="text-slate-400 font-normal">×</span> {s.model}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.count} Journals</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{(s.totalRR / s.count).toFixed(2)} Avg R:R</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${s.pl >= 0 ? 'text-primary' : 'text-rose-500'}`}>${s.pl.toLocaleString()}</span>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Performance</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 ${s.pl >= 0 ? 'bg-primary' : 'bg-rose-500'}`} style={{ width: `${(s.wins/s.count)*100}%` }} />
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
               <span>Win Rate</span>
               <span className="text-slate-900 dark:text-white">{(s.wins/s.count*100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategySummary;
