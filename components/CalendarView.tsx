
import React, { useState } from 'react';
import { Trade } from '../types';

interface CalendarViewProps {
  trades: Trade[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Group days into weeks for weekly P/L calculation
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  // Explicitly type the accumulator for the reduce function
  const tradesByDay = trades.reduce((acc: { [key: number]: Trade[] }, trade) => {
    const tradeDate = new Date(trade.date);
    const day = tradeDate.getDate();
    const tMonth = tradeDate.getUTCMonth();
    const tYear = tradeDate.getUTCFullYear();
    
    // Check if trade belongs to selected month and year
    if (tMonth === month && tYear === year) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(trade);
    }
    return acc;
  }, {} as { [key: number]: Trade[] });

  // Explicitly use generic type parameter in reduce to avoid 'unknown' return type error
  const monthlyPnL: number = Object.values(tradesByDay).reduce<number>((total, dayTrades) => {
    return total + (dayTrades as Trade[]).reduce<number>((dayTotal, t) => dayTotal + t.profitAmount, 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    return (amount >= 0 ? '+' : '-') + '$' + Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 md:p-8 shadow-2xl animate-in zoom-in duration-300 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{monthName} {year}</h2>
          <div className={`px-4 py-1.5 rounded-xl font-black text-sm shadow-sm border transition-colors ${
            monthlyPnL >= 0 
              ? 'bg-primary/10 text-primary border-primary/20' 
              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
          }`}>
            MONTHLY: {formatCurrency(monthlyPnL)}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-primary transition-colors text-slate-600 dark:text-slate-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-primary transition-colors text-slate-600 dark:text-slate-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner transition-colors">
        {/* Header Row */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-50 dark:bg-slate-900 py-4 text-center text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
            {day}
          </div>
        ))}
        <div className="bg-slate-100 dark:bg-slate-950 py-4 text-center text-[10px] md:text-xs font-black text-primary uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 transition-colors">
          Week
        </div>

        {/* Calendar Rows */}
        {weeks.map((week, weekIdx) => {
          let weeklyPnL = 0;
          
          return (
            <React.Fragment key={weekIdx}>
              {week.map((day, dayIdx) => {
                const dayTrades = day ? tradesByDay[day] || [] : [];
                const dailyPnL = dayTrades.reduce((a: number, b: Trade) => a + b.profitAmount, 0);
                weeklyPnL += dailyPnL;

                return (
                  <div key={dayIdx} className={`bg-white dark:bg-slate-800 min-h-[80px] md:min-h-[120px] p-2 relative group transition-colors ${day ? 'hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer' : ''}`}>
                    {day && (
                      <>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs font-black">{day}</span>
                        <div className="mt-1 space-y-1">
                          {dayTrades.length > 0 && (
                            <div className={`text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm inline-block ${dailyPnL >= 0 ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                              {dailyPnL >= 0 ? '+' : ''}${Math.abs(dailyPnL).toLocaleString()}
                            </div>
                          )}
                          <div className="hidden md:block space-y-0.5">
                            {dayTrades.map((t) => (
                              <div key={t.id} className="text-[8px] md:text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-1 rounded truncate flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${t.outcome === 'win' ? 'bg-primary' : t.outcome === 'loss' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                                {t.symbol}
                              </div>
                            ))}
                          </div>
                          {/* Mobile view indicator */}
                          <div className="md:hidden flex gap-0.5">
                            {dayTrades.map(t => (
                              <span key={t.id} className={`w-1 h-1 rounded-full ${t.outcome === 'win' ? 'bg-primary' : t.outcome === 'loss' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {/* 8th Column: Weekly Total */}
              <div className="bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-2 border-l border-slate-200 dark:border-slate-800 transition-colors">
                <div className={`text-[10px] md:text-xs font-black text-center ${weeklyPnL >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                  {weeklyPnL !== 0 ? formatCurrency(weeklyPnL) : '—'}
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Total</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-6 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary"></span> Win
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span> Loss
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span> Break Even / Pending
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
