
import React, { useState } from 'react';
import { NewsEvent, ImpactLevel } from '../types';

interface NewsViewProps { news: NewsEvent[]; isCached: boolean; }

const NewsView: React.FC<NewsViewProps> = ({ news, isCached }) => {
  const [impactFilter, setImpactFilter] = useState<ImpactLevel | 'all'>('all');
  const filtered = news.filter(e => impactFilter === 'all' || e.impact === impactFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Market Catalyst</h2>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">Global Volatility Feed</p>
        </div>
        <select value={impactFilter} onChange={e => setImpactFilter(e.target.value as any)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest">
          <option value="all">All Volatility</option>
          <option value="high">High Impact</option>
          <option value="medium">Medium Impact</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(event => {
          const d = new Date(event.time);
          const isPast = d.getTime() < Date.now();
          return (
            <div key={event.id} className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all ${isPast ? 'opacity-30' : 'hover:border-primary/50'} bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}>
              <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-slate-100 dark:border-slate-800 pr-6">
                <span className="text-sm font-black">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{d.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-black text-sm text-primary border border-slate-100 dark:border-slate-800 shadow-inner">{event.currency}</div>
              <div className="flex-1">
                <h4 className="text-sm font-black leading-tight">{event.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                   <div className={`w-2 h-2 rounded-full ${event.impact === 'high' ? 'bg-rose-500 animate-pulse' : event.impact === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{event.impact} Risk</span>
                </div>
              </div>
              <div className="hidden md:flex gap-8 text-right">
                 <div><span className="block text-[8px] text-slate-400 font-black uppercase mb-1">Forecast</span><span className="text-xs font-bold">{event.forecast || '--'}</span></div>
                 <div><span className="block text-[8px] text-slate-400 font-black uppercase mb-1">Previous</span><span className="text-xs font-bold">{event.previous || '--'}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsView;
