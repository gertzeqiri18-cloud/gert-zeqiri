
import React, { useState } from 'react';

const SimIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5.172c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

const Simulator: React.FC = () => {
  const [params, setParams] = useState({
    startingBalance: 10000,
    winRate: 50,
    riskReward: 2,
    trades: 50,
    riskPerTrade: 1
  });

  const [simulation, setSimulation] = useState<any>(null);

  const runSimulation = () => {
    let balance = params.startingBalance;
    const history = [{ trade: 0, balance }];
    let wins = 0;
    
    for (let i = 1; i <= params.trades; i++) {
      const isWin = Math.random() * 100 < params.winRate;
      const riskAmount = (balance * params.riskPerTrade) / 100;
      
      if (isWin) {
        balance += riskAmount * params.riskReward;
        wins++;
      } else {
        balance -= riskAmount;
      }
      history.push({ trade: i, balance });
    }

    setSimulation({
      finalBalance: balance,
      totalPnL: balance - params.startingBalance,
      pnlPct: ((balance - params.startingBalance) / params.startingBalance) * 100,
      winRateActual: (wins / params.trades) * 100,
      history
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <SimIcon />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Strategy Simulator</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Starting Balance ($)</label>
              <input type="number" value={params.startingBalance} onChange={e => setParams({...params, startingBalance: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Win Rate (%)</label>
              <input type="range" min="1" max="99" value={params.winRate} onChange={e => setParams({...params, winRate: Number(e.target.value)})} className="w-full accent-primary" />
              <div className="text-right text-xs text-slate-500">{params.winRate}%</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Risk/Reward Ratio (e.g. 2 for 2:1)</label>
              <input type="number" step="0.1" value={params.riskReward} onChange={e => setParams({...params, riskReward: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Number of Trades</label>
              <input type="number" value={params.trades} onChange={e => setParams({...params, trades: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Risk Per Trade (%)</label>
              <input type="number" step="0.1" value={params.riskPerTrade} onChange={e => setParams({...params, riskPerTrade: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
            </div>
            <button 
              onClick={runSimulation}
              className="w-full bg-primary hover:bg-primary-hover py-4 rounded-xl font-black text-white mt-4 shadow-xl shadow-primary-glow transition-all active:scale-95"
            >
              RUN MONTE CARLO SIM
            </button>
          </div>
        </div>
      </div>

      {simulation && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-primary/30 p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 transition-colors">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Simulation Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Final Balance</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">${simulation.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className={`bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 ${simulation.totalPnL >= 0 ? 'text-primary' : 'text-rose-400'}`}>
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total P/L</div>
              <div className="text-2xl font-black">{simulation.totalPnL >= 0 ? '+' : ''}{simulation.pnlPct.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Actual Win Rate</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{simulation.winRateActual.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-1">
            {simulation.history.map((h: any, i: number) => {
              const max = Math.max(...simulation.history.map((x: any) => x.balance));
              const min = Math.min(...simulation.history.map((x: any) => x.balance));
              const height = ((h.balance - min) / (max - min)) * 100;
              return (
                <div key={i} className="bg-primary/40 w-full rounded-t-sm group relative" style={{ height: `${Math.max(5, height)}%` }}>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-1 rounded z-20 whitespace-nowrap">
                    Trade {h.trade}: ${h.balance.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-xs text-slate-500 mt-2 italic">Equity curve visual representation</div>
        </div>
      )}
    </div>
  );
};

export default Simulator;
