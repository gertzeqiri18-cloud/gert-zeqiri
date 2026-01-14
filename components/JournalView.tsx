
import React, { useState } from 'react';
import { Trade } from '../types';

interface JournalViewProps {
  trades: Trade[];
  onEditTrade: (trade: Trade) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ trades, onEditTrade }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px] md:min-w-0">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Symbol</th>
              <th className="px-6 py-4">Strategy</th>
              <th className="px-6 py-4">Entry</th>
              <th className="px-6 py-4">Outcome</th>
              <th className="px-6 py-4">Img</th>
              <th className="px-6 py-4 text-right">Profit/Loss</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">No trades logged yet. Start your journey today!</td>
              </tr>
            ) : (
              [...trades].reverse().map(trade => (
                <tr key={trade.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{trade.date}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">{trade.symbol}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{trade.strategy}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">${trade.entryPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                      trade.outcome === 'win' ? 'bg-primary/10 text-primary' :
                      trade.outcome === 'loss' ? 'bg-rose-500/10 text-rose-500' :
                      trade.outcome === 'be' ? 'bg-slate-500/10 text-slate-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {trade.outcome === 'be' ? 'B.Even' : trade.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {trade.screenshot ? (
                      <button 
                        onClick={() => setSelectedImage(trade.screenshot!)}
                        className="w-10 h-8 rounded border border-slate-700 overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img src={trade.screenshot} alt="Trade" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${
                    trade.profitAmount > 0 ? 'text-primary' : trade.profitAmount < 0 ? 'text-rose-500' : 'text-slate-500'
                  }`}>
                    {trade.profitAmount > 0 ? '+' : ''}${trade.profitAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEditTrade(trade)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Trade Details" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button className="absolute top-8 right-8 text-white text-4xl hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default JournalView;
