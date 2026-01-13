
import React, { useState } from 'react';
import { analyzeTradeSetup } from '../services/geminiService';
import { AIAdvice } from '../types';

const AIAdvisor: React.FC = () => {
  const [setup, setSetup] = useState({
    symbol: '',
    strategy: '',
    confluences: '',
    entry: '',
    sl: '',
    tp: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAdvice | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const advice = await analyzeTradeSetup(
      setup.symbol,
      setup.strategy,
      setup.confluences.split(','),
      Number(setup.entry),
      Number(setup.sl),
      Number(setup.tp)
    );
    setResult(advice);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-2">Should I Enter?</h2>
          <p className="text-slate-400 mb-8 max-w-xl">Harness the power of AI to validate your edge. Our models analyze your setup against professional risk management frameworks.</p>

          <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
                <input 
                  type="text" required
                  placeholder="e.g. NASDAQ / GOLD / SOL"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={setup.symbol}
                  onChange={e => setSetup({...setup, symbol: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Strategy</label>
                <input 
                  type="text" required
                  placeholder="e.g. Supply & Demand"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={setup.strategy}
                  onChange={e => setSetup({...setup, strategy: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Confluences</label>
                <textarea 
                  rows={3}
                  placeholder="Higher timeframe bias, 0.5 Fib level, 1H EMA rejection..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={setup.confluences}
                  onChange={e => setSetup({...setup, confluences: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Entry Price</label>
                  <input 
                    type="number" step="any" required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={setup.entry}
                    onChange={e => setSetup({...setup, entry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Stop Loss</label>
                  <input 
                    type="number" step="any" required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={setup.sl}
                    onChange={e => setSetup({...setup, sl: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Take Profit</label>
                  <input 
                    type="number" step="any" required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={setup.tp}
                    onChange={e => setSetup({...setup, tp: e.target.value})}
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : 'GET AI RECOMMENDATION'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`p-8 rounded-2xl border-2 shadow-2xl ${
            result.recommendation === 'Enter' ? 'bg-emerald-500/10 border-emerald-500/30' :
            result.recommendation === 'Avoid' ? 'bg-rose-500/10 border-rose-500/30' :
            'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  result.recommendation === 'Enter' ? 'bg-emerald-500 text-white' :
                  result.recommendation === 'Avoid' ? 'bg-rose-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  <span className="text-2xl font-black">{result.recommendation.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{result.recommendation.toUpperCase()}</h3>
                  <p className="text-slate-400">AI Confidence: {result.confidence}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Analysis Reasoning</h4>
                <p className="text-slate-200 leading-relaxed">{result.reasoning}</p>
              </div>

              {result.riskWarning && (
                <div className="bg-rose-500/20 rounded-xl p-4 border border-rose-500/30">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Risk Warning</h4>
                  <p className="text-rose-200 text-sm">{result.riskWarning}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
