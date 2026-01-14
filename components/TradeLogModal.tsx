
import React, { useState, useEffect, useRef } from 'react';
import { Trade, TradeOutcome } from '../types';

interface TradeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<Trade, 'id' | 'phase'>, id?: string) => void;
  accountId: string;
  favoriteStrategies: string[];
  favoriteModels: string[];
  onRegisterStrategy: (s: string) => void;
  onRegisterModel: (m: string) => void;
  initialData?: Trade | null;
}

const COMMON_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
  'EURJPY', 'GBPJPY', 'AUDJPY', 'EURGBP', 'EURAUD', 'EURNZD', 'EURCAD',
  'XAUUSD', 'XAGUSD', 'WTI', 'BRENT', 'BTCUSD', 'ETHUSD', 'SOLUSD'
];

const TradeLogModal: React.FC<TradeLogModalProps> = ({ 
  isOpen, onClose, onSave, accountId, 
  favoriteStrategies, favoriteModels,
  onRegisterStrategy, onRegisterModel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    symbol: '',
    strategy: '',
    entryModel: '',
    confluences: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    rrValue: '',
    outcome: 'pending' as TradeOutcome,
    profitAmount: '',
    date: new Date().toISOString(),
    screenshot: '' as string
  });

  const [inputMode, setInputMode] = useState<'tp' | 'rr'>('tp');
  const [symbolSuggestions, setSymbolSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddingStrategy, setIsAddingStrategy] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Sync form with initialData when editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          symbol: initialData.symbol,
          strategy: initialData.strategy,
          entryModel: initialData.entryModel,
          confluences: initialData.confluences.join(', '),
          entryPrice: initialData.entryPrice.toString(),
          stopLoss: initialData.stopLoss.toString(),
          takeProfit: initialData.takeProfit.toString(),
          rrValue: '', // Will be calculated by the other effect
          outcome: initialData.outcome,
          profitAmount: Math.abs(initialData.profitAmount).toString(),
          date: initialData.date,
          screenshot: initialData.screenshot || ''
        });
      } else {
        setFormData({
          symbol: '',
          strategy: '',
          entryModel: '',
          confluences: '',
          entryPrice: '',
          stopLoss: '',
          takeProfit: '',
          rrValue: '',
          outcome: 'pending',
          profitAmount: '',
          date: new Date().toISOString(),
          screenshot: ''
        });
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    if (!isNaN(entry) && !isNaN(sl) && entry !== sl) {
      const risk = Math.abs(entry - sl);
      if (inputMode === 'tp') {
        const tp = parseFloat(formData.takeProfit);
        if (!isNaN(tp)) {
          const reward = Math.abs(tp - entry);
          setFormData(prev => ({ ...prev, rrValue: (reward / risk).toFixed(2) }));
        }
      } else {
        const rr = parseFloat(formData.rrValue);
        if (!isNaN(rr)) {
          const reward = rr * risk;
          const isShort = sl > entry;
          setFormData(prev => ({ ...prev, takeProfit: (isShort ? entry - reward : entry + reward).toFixed(5) }));
        }
      }
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.rrValue, inputMode]);

  useEffect(() => {
    if (formData.symbol.length > 0) {
      const filtered = COMMON_SYMBOLS.filter(s => s.toLowerCase().includes(formData.symbol.toLowerCase()));
      setSymbolSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else setShowSuggestions(false);
  }, [formData.symbol]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = Number(formData.entryPrice);
    const sl = Number(formData.stopLoss);
    const tp = Number(formData.takeProfit);
    let pl = Number(formData.profitAmount) || 0;

    if (formData.outcome === 'loss') pl = -Math.abs(pl);
    if (formData.outcome === 'win') pl = Math.abs(pl);
    if (formData.outcome === 'be') pl = 0;

    onSave({
      symbol: formData.symbol || 'UNKNOWN',
      strategy: formData.strategy || 'No Strategy',
      entryModel: formData.entryModel || 'No Model',
      entryPrice: entry,
      stopLoss: sl,
      takeProfit: tp,
      profitAmount: pl,
      outcome: formData.outcome,
      date: formData.date,
      screenshot: formData.screenshot,
      confluences: formData.confluences.split(',').map(c => c.trim()).filter(c => c !== ''),
      accountId: initialData ? initialData.accountId : accountId
    }, initialData?.id);
    onClose();
  };

  const handleRegister = (type: 'strategy' | 'model') => {
    if (!newEntry.trim()) return;
    if (type === 'strategy') {
      onRegisterStrategy(newEntry);
      setFormData({ ...formData, strategy: newEntry });
      setIsAddingStrategy(false);
    } else {
      onRegisterModel(newEntry);
      setFormData({ ...formData, entryModel: newEntry });
      setIsAddingModel(false);
    }
    setNewEntry('');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden animate-in zoom-in duration-300 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {initialData ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Commitment to discipline</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-slate-100 dark:border-slate-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="relative">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asset Pair</label>
              <input 
                type="text" required value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                onFocus={() => formData.symbol && setShowSuggestions(true)}
                placeholder="e.g. XAUUSD"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar p-2" ref={suggestionRef}>
                  {symbolSuggestions.map(s => (
                    <button key={s} type="button" onClick={() => { setFormData({...formData, symbol: s}); setShowSuggestions(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors">{s}</button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Entry Price</label>
              <input type="number" step="any" required value={formData.entryPrice} onChange={e => setFormData({...formData, entryPrice: e.target.value})} placeholder="0.00000" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 items-start">
            <div className="flex flex-col">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stop Loss</label>
              <input type="number" step="any" required value={formData.stopLoss} onChange={e => setFormData({...formData, stopLoss: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary/20 outline-none shadow-sm" />
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Exit Target</label>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setInputMode('tp')} className={`px-2 py-0.5 text-[8px] font-black rounded transition-all ${inputMode === 'tp' ? 'bg-primary text-white shadow-sm' : 'text-slate-400'}`}>TP</button>
                  <button type="button" onClick={() => setInputMode('rr')} className={`px-2 py-0.5 text-[8px] font-black rounded transition-all ${inputMode === 'rr' ? 'bg-primary text-white shadow-sm' : 'text-slate-400'}`}>R:R</button>
                </div>
              </div>
              <input type="number" step="any" required value={inputMode === 'tp' ? formData.takeProfit : formData.rrValue} onChange={e => setFormData({...formData, [inputMode === 'tp' ? 'takeProfit' : 'rrValue']: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary/20 outline-none shadow-sm" />
            </div>
            <div className="md:col-span-2 flex justify-center pt-2">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
                  {inputMode === 'tp' ? `PROJECTED R:R: ${formData.rrValue || '0.00'}` : `PROJECTED TP: ${formData.takeProfit || '0.00000'}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Final Outcome</label>
              <div className="grid grid-cols-3 gap-2">
                {['win', 'loss', 'be'].map((o) => (
                  <button key={o} type="button" onClick={() => setFormData({...formData, outcome: o as TradeOutcome})} className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${formData.outcome === o ? (o === 'win' ? 'bg-primary border-primary text-white shadow-lg shadow-primary-glow/20' : o === 'loss' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-500 border-slate-500 text-white') : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/40'}`}>
                    {o === 'be' ? 'B.Even' : o}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">P/L Amount ($)</label>
              <input type="number" step="any" required disabled={formData.outcome === 'be'} value={formData.outcome === 'be' ? '0' : formData.profitAmount} onChange={e => setFormData({...formData, profitAmount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-40 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategy Used</label>
              <div className="flex gap-2">
                <select value={formData.strategy} onChange={e => setFormData({...formData, strategy: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-bold outline-none appearance-none">
                  <option value="">Select Strategy</option>
                  {favoriteStrategies.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" onClick={() => setIsAddingStrategy(true)} className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary-glow active:scale-95 shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entry Model</label>
              <div className="flex gap-2">
                <select value={formData.entryModel} onChange={e => setFormData({...formData, entryModel: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-slate-900 dark:text-white font-bold outline-none appearance-none">
                  <option value="">Select Model</option>
                  {favoriteModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button type="button" onClick={() => setIsAddingModel(true)} className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary-glow active:scale-95 shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Chart Evidence</label>
            <div className="relative h-[48px] w-full max-w-sm">
              <input 
                type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, screenshot: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                {formData.screenshot ? "Evidence Attached" : "Upload Screenshot"}
              </div>
            </div>
          </div>

          <div className="shrink-0 pb-4 pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-[2rem] shadow-xl shadow-primary-glow transition-all active:scale-95 text-xs uppercase tracking-[0.3em]">
              {initialData ? 'Update Entry' : 'Commit to Journal'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Popups */}
      {(isAddingStrategy || isAddingModel) && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm">
            <h3 className="text-xl font-black mb-4">Register New {isAddingStrategy ? 'Strategy' : 'Model'}</h3>
            <input autoFocus value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="Enter unique name..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-primary" />
            <div className="flex gap-3">
              <button onClick={() => { setIsAddingStrategy(false); setIsAddingModel(false); }} className="flex-1 py-3 text-xs font-black uppercase text-slate-400">Cancel</button>
              <button onClick={() => handleRegister(isAddingStrategy ? 'strategy' : 'model')} className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase">Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeLogModal;
