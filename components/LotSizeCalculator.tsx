
import React, { useState, useEffect } from 'react';

const LotSizeCalculator: React.FC = () => {
  const [balance, setBalance] = useState('100000');
  const [riskPct, setRiskPct] = useState('1');
  const [entryPrice, setEntryPrice] = useState('1.05000');
  const [stopLoss, setStopLoss] = useState('1.04800');
  const [takeProfit, setTakeProfit] = useState('1.05600');
  const [pairType, setPairType] = useState('Standard'); // Standard, JPY, Gold, Crypto

  const [results, setResults] = useState({
    lotSize: 0,
    riskAmount: 0,
    rewardAmount: 0,
    rr: 0,
    pips: 0
  });

  useEffect(() => {
    const bal = parseFloat(balance) || 0;
    const rp = parseFloat(riskPct) || 0;
    const ep = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;

    const riskAmt = bal * (rp / 100);
    const rewardAmt = bal * (((tp - ep) / (ep - sl)) * (rp / 100));
    const pipsDiff = Math.abs(ep - sl);
    
    let multiplier = 100000; // Standard Lot unit size
    let pipSize = 0.0001;
    
    if (pairType === 'JPY') pipSize = 0.01;
    if (pairType === 'Gold') { multiplier = 100; pipSize = 0.1; }
    if (pairType === 'Crypto') { multiplier = 1; pipSize = 1; }

    const pips = pipsDiff / pipSize;
    const rr = Math.abs((tp - ep) / (ep - sl)) || 0;

    // Standard Forex calculation: Lot Size = Risk Amount / (Stop Loss Pips * Pip Value)
    // Simplified: Lot Size = Risk Amount / (Math.abs(entry - stop) * multiplier)
    const lotSize = riskAmt / (pipsDiff * multiplier);

    setResults({
      lotSize: isFinite(lotSize) ? lotSize : 0,
      riskAmount: riskAmt,
      rewardAmount: Math.abs(rewardAmt),
      rr: rr,
      pips: pips
    });
  }, [balance, riskPct, entryPrice, stopLoss, takeProfit, pairType]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-2xl transition-colors">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Lot Size Calculator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Asset Class</label>
              <select 
                value={pairType}
                onChange={e => setPairType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="Standard">Forex Standard (EURUSD, GBPUSD...)</option>
                <option value="JPY">Forex JPY (USDJPY, EURJPY...)</option>
                <option value="Gold">Commodities (XAUUSD, OIL...)</option>
                <option value="Crypto">Crypto (BTC, ETH...)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Account Balance ($)</label>
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Risk per Trade (%)</label>
              <input type="number" step="0.1" value={riskPct} onChange={e => setRiskPct(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Entry Price</label>
                <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Stop Loss</label>
                <input type="number" step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Take Profit</label>
                <input type="number" step="any" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <ResultCard label="Lot Size" value={results.lotSize.toFixed(2)} sub="Units/Contracts" color="text-emerald-500" />
          <ResultCard label="Risk Amount" value={`$${results.riskAmount.toLocaleString()}`} sub={`${riskPct}% Risked`} />
          <ResultCard label="Pips at Risk" value={results.pips.toFixed(1)} sub="Stop Loss Depth" />
          <ResultCard label="Reward Ratio" value={`${results.rr.toFixed(2)}:1`} sub="Win Projection" />
        </div>
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ label: string; value: string; sub: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-colors">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
    <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
  </div>
);

export default LotSizeCalculator;
