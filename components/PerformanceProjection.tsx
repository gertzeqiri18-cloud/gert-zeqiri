
import React, { useMemo, useState } from 'react';
import { Trade, Account } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceProjectionProps {
  trades: Trade[];
  account?: Account;
}

const PerformanceProjection: React.FC<PerformanceProjectionProps> = ({ trades, account }) => {
  const [projectionYears, setProjectionYears] = useState(1);
  const [isCompound, setIsCompound] = useState(true);

  const historicalStats = useMemo(() => {
    if (trades.length === 0) return null;
    const winCount = trades.filter(t => t.outcome === 'win').length;
    const lossCount = trades.filter(t => t.outcome === 'loss').length;
    const avgWin = trades.filter(t => t.outcome === 'win').reduce((a, b) => a + b.profitAmount, 0) / (winCount || 1);
    const avgLoss = Math.abs(trades.filter(t => t.outcome === 'loss').reduce((a, b) => a + b.profitAmount, 0) / (lossCount || 1));
    const winRate = winCount / trades.length;
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    const tradesPerMonth = trades.length / Math.max(1, (new Date().getTime() - new Date(trades[0].date).getTime()) / (1000 * 60 * 60 * 24 * 30));

    return { winRate, avgWin, avgLoss, expectancy, tradesPerMonth };
  }, [trades]);

  const projectionData = useMemo(() => {
    if (!historicalStats || !account) return [];
    
    const data = [];
    let currentBalance = account.balance;
    const months = projectionYears * 12;
    const tradesPerMonth = Math.ceil(historicalStats.tradesPerMonth) || 10;
    
    data.push({ month: 0, balance: Math.round(currentBalance) });

    for (let i = 1; i <= months; i++) {
      if (isCompound) {
        // Compound growth calculation
        const growthRate = (historicalStats.expectancy * tradesPerMonth) / account.startingBalance;
        currentBalance = currentBalance * (1 + growthRate);
      } else {
        // Linear growth
        currentBalance += (historicalStats.expectancy * tradesPerMonth);
      }
      data.push({ month: i, balance: Math.round(currentBalance) });
    }
    return data;
  }, [historicalStats, account, projectionYears, isCompound]);

  if (trades.length < 5) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Insufficient Data</h3>
        <p className="text-slate-500 mt-2">Projection requires at least 5 logged trades for statistical relevance.</p>
      </div>
    );
  }

  const finalBalance = projectionData.length > 0 ? projectionData[projectionData.length - 1].balance : 0;
  const totalGain = finalBalance - (account?.balance || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Growth Projection</h2>
          <p className="text-slate-500 text-sm">Forecasting your path to financial freedom.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setIsCompound(!isCompound)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isCompound ? 'bg-primary text-white' : 'text-slate-400'}`}
          >
            Compounding
          </button>
          <div className="flex items-center gap-2 px-4 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-black text-slate-400 uppercase">Years</span>
            <input 
              type="number" 
              min="1" max="10" 
              value={projectionYears} 
              onChange={e => setProjectionYears(Number(e.target.value))}
              className="w-12 bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectionCard label="Est. Future Balance" value={`$${finalBalance.toLocaleString()}`} color="text-primary" />
        <ProjectionCard label="Projected Gain" value={`$${totalGain.toLocaleString()}`} sub={`${((totalGain/(account?.balance||1))*100).toFixed(1)}% Increase`} />
        <ProjectionCard label="Expectancy" value={`$${historicalStats?.expectancy.toFixed(2)}`} sub="Per Trade (Avg)" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm h-[450px]">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Growth Trajectory</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
            <XAxis dataKey="month" hide />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              fontWeight="bold" 
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(v: any) => `$${v.toLocaleString()}`}
              labelFormatter={(l) => `Month ${l}`}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="var(--color-primary)" 
              strokeWidth={4} 
              dot={false}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Statistical Risk Profile</h4>
            <p className="text-[11px] text-slate-500 leading-tight">
              Projections are based on your historical win rate of {(historicalStats?.winRate || 0 * 100).toFixed(1)}% and avg. risk of ${historicalStats?.avgLoss.toLocaleString()}. 
              Maintain discipline to avoid sequence-of-return risk during drawdown periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectionCard: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/30 transition-all">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
    {sub && <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase">{sub}</p>}
  </div>
);

export default PerformanceProjection;
