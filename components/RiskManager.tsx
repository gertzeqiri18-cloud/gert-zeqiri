
import React from 'react';
import { Trade } from '../types';

interface RiskManagerProps {
  trades: Trade[];
}

const RiskManager: React.FC<RiskManagerProps> = ({ trades }) => {
  const recentTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const consecutiveLosses = (() => {
    let count = 0;
    for (const trade of recentTrades) {
      if (trade.outcome === 'loss') count++;
      else if (trade.outcome === 'win') break;
    }
    return count;
  })();

  const isStopTrading = consecutiveLosses >= 2;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isStopTrading ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800 border-slate-700'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isStopTrading ? 'bg-rose-500 text-white' : 'bg-primary text-white transition-colors'}`}>
          {isStopTrading ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white">Risk Status</h3>
          <p className="text-xs text-slate-400">Daily limit: 2 consecutive losses</p>
        </div>
      </div>

      {isStopTrading ? (
        <div className="animate-pulse">
          <p className="text-rose-400 text-sm font-bold">STOP TRADING: {consecutiveLosses} consecutive losses detected.</p>
          <p className="text-xs text-rose-300/70 mt-1">Mental capital is low. Step away and reset.</p>
        </div>
      ) : (
        <div>
          <p className="text-primary text-sm font-medium transition-colors">Safe to Trade. Maintain discipline.</p>
          <p className="text-xs text-slate-500 mt-1">Recent: {consecutiveLosses} loss streak.</p>
        </div>
      )}
    </div>
  );
};

export default RiskManager;
