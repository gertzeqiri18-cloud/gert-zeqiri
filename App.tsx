
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppTab, Trade, Account, User, AppTheme, NewsEvent } from './types';
import Dashboard from './components/Dashboard';
import JournalView from './components/JournalView';
import AccountSelector from './components/AccountSelector';
import RiskManager from './components/RiskManager';
import CalendarView from './components/CalendarView';
import NewsView from './components/NewsView';
import TradeLogModal from './components/TradeLogModal';
import AccountManagement from './components/AccountManagement';
import Simulator from './components/Simulator';
import LotSizeCalculator from './components/LotSizeCalculator';
import Login from './components/Login';
import Settings from './components/Settings';
import PhaseCompletionModal from './components/PhaseCompletionModal';
import StrategySummary from './components/StrategySummary';
import PerformanceProjection from './components/PerformanceProjection';
import { fetchForexNews } from './services/newsService';

const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Journal: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>,
  Calculator: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  News: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  Projection: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Accounts: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Dashboard);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [behavioralAlert, setBehavioralAlert] = useState<{message: string, type: 'warning' | 'info' | 'critical'} | null>(null);
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const selectedAccount = useMemo(() => accounts.find(a => a.id === selectedAccountId), [accounts, selectedAccountId]);

  useEffect(() => {
    if (selectedAccount) setSelectedPhase(selectedAccount.isFunded ? 4 : selectedAccount.currentStep);
  }, [selectedAccountId, selectedAccount]);

  useEffect(() => {
    fetchForexNews().then(res => setNews(res.events));
  }, []);

  const hydrateUserData = useCallback((userId: string) => {
    const registryStr = localStorage.getItem('edgeTracker_users');
    const registry: User[] = registryStr ? JSON.parse(registryStr) : [];
    const userData = registry.find(u => u.id === userId);
    if (!userData) return;
    setUser(userData);
    applyTheme(userData.theme, userData.appTheme);
    const workspaceStr = localStorage.getItem(`edgeTracker_data_${userId}`);
    if (workspaceStr) {
      const workspace = JSON.parse(workspaceStr);
      setTrades(workspace.trades || []);
      setAccounts(workspace.accounts || []);
      const lastAccId = workspace.lastActiveAccountId || (workspace.accounts?.[0]?.id || '');
      setSelectedAccountId(lastAccId);
      setActiveTab(workspace.lastActiveTab || AppTab.Dashboard);
    }
  }, []);

  useEffect(() => {
    const sessionUid = localStorage.getItem('edgeTracker_session_uid');
    if (sessionUid) hydrateUserData(sessionUid);
  }, [hydrateUserData]);

  useEffect(() => {
    if (user) {
      const registryStr = localStorage.getItem('edgeTracker_users');
      const registry: User[] = registryStr ? JSON.parse(registryStr) : [];
      localStorage.setItem('edgeTracker_users', JSON.stringify(registry.map(u => u.id === user.id ? user : u)));
      localStorage.setItem(`edgeTracker_data_${user.id}`, JSON.stringify({ trades, accounts, lastActiveAccountId: selectedAccountId, lastActiveTab: activeTab }));
      applyTheme(user.theme, user.appTheme);
    }
  }, [user, trades, accounts, selectedAccountId, activeTab]);

  useEffect(() => {
    if (!selectedAccount || !user) return;
    const todayIso = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(t => t.accountId === selectedAccountId && t.date.startsWith(todayIso));
    const lossesToday = todayTrades.filter(t => t.outcome === 'loss').length;
    const limits = selectedAccount.riskLimits;

    if (todayTrades.length >= limits.maxTradesPerDay) setBehavioralAlert({ message: `Daily Trade Limit (${limits.maxTradesPerDay}) reached. Execution locked.`, type: 'critical' });
    else if (lossesToday >= limits.maxLossesPerDay) setBehavioralAlert({ message: `Daily Loss Limit (${limits.maxLossesPerDay}) reached. Risk Guard active.`, type: 'critical' });
    else {
      let streak = 0;
      for (let i = todayTrades.length - 1; i >= 0; i--) {
        if (todayTrades[i].outcome === 'loss') streak++;
        else break;
      }
      if (streak >= limits.maxConsecutiveLosses) setBehavioralAlert({ message: `Loss Streak: ${streak} in a row. Take a 30-min break.`, type: 'warning' });
      else setBehavioralAlert(null);
    }
  }, [accounts, trades, selectedAccountId, user]);

  const applyTheme = (mode: 'light' | 'dark', appTheme: AppTheme) => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'theme-orange', 'theme-purple');
    if (mode === 'dark') root.classList.add('dark');
    if (appTheme === AppTheme.Orange) root.classList.add('theme-orange');
    else if (appTheme === AppTheme.Purple) root.classList.add('theme-purple');
  };

  const handleAdvanceStep = () => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccountId) {
        const nextStep = (acc.currentStep + 1) as (1 | 2 | 3);
        const hasNext = (nextStep === 2 && acc.stepTargets.step2) || (nextStep === 3 && acc.stepTargets.step3);
        return hasNext 
          ? { ...acc, currentStep: nextStep, balance: acc.startingBalance, dailyStartingBalance: acc.startingBalance }
          : { ...acc, isFunded: true, balance: acc.startingBalance, dailyStartingBalance: acc.startingBalance };
      }
      return acc;
    }));
    setIsPhaseModalOpen(false);
  };

  const handleSaveTrade = (tradeData: Omit<Trade, 'id' | 'phase'>, id?: string) => {
    const targetAccountId = tradeData.accountId || selectedAccountId;
    const targetAccount = accounts.find(a => a.id === targetAccountId) || selectedAccount || accounts[0];
    
    if (!targetAccount) {
      alert("No active account found. Please create a portfolio in the Portfolios tab first.");
      setActiveTab(AppTab.Accounts);
      return;
    }

    if (id) {
      // UPDATE EXISTING TRADE
      const oldTrade = trades.find(t => t.id === id);
      const profitDiff = oldTrade ? tradeData.profitAmount - oldTrade.profitAmount : 0;
      
      setTrades(prev => prev.map(t => t.id === id ? { ...tradeData, id, phase: t.phase } as Trade : t));
      setAccounts(prev => prev.map(acc => 
        acc.id === targetAccount.id ? { ...acc, balance: acc.balance + profitDiff } : acc
      ));
      setEditingTrade(null);
    } else {
      // NEW TRADE
      const currentTradePhase = targetAccount.isFunded ? 4 : targetAccount.currentStep;
      const newTrade = { 
        ...tradeData, 
        id: Math.random().toString(36).substr(2, 9), 
        phase: currentTradePhase,
        accountId: targetAccount.id 
      };
      
      const updatedTrades = [...trades, newTrade];
      setTrades(updatedTrades);
      
      const updatedAccounts = accounts.map(acc => 
        acc.id === targetAccount.id ? { ...acc, balance: acc.balance + tradeData.profitAmount } : acc
      );
      setAccounts(updatedAccounts);
      
      // Auto-check phase passing
      const currentPhaseTrades = updatedTrades.filter(t => t.accountId === targetAccount.id && t.phase === currentTradePhase);
      const phasePnL = currentPhaseTrades.reduce((sum, t) => sum + t.profitAmount, 0);
      const stepConfig = targetAccount.currentStep === 1 ? targetAccount.stepTargets.step1 : targetAccount.currentStep === 2 ? targetAccount.stepTargets.step2 : targetAccount.stepTargets.step3;
      
      if (stepConfig && phasePnL >= (targetAccount.startingBalance * stepConfig.profitTarget / 100) && !targetAccount.isFunded && (targetAccount.lastPassedStep || 0) < targetAccount.currentStep) {
        setIsPhaseModalOpen(true);
        setAccounts(updatedAccounts.map(a => a.id === targetAccount.id ? { ...a, lastPassedStep: targetAccount.currentStep } : a));
      }
    }
  };

  const handleAddAccount = (accData: Omit<Account, 'id' | 'riskLimits'>) => {
    const newAccount: Account = {
      ...accData,
      id: Math.random().toString(36).substr(2, 9),
      riskLimits: { maxLossesPerDay: 3, maxConsecutiveLosses: 2, dailyProfitGoal: 500, maxTradesPerDay: 5 }
    };
    setAccounts(prev => {
      const next = [...prev, newAccount];
      if (prev.length === 0 || !selectedAccountId) {
        setSelectedAccountId(newAccount.id);
      }
      return next;
    });
  };

  const openLogModal = () => {
    setEditingTrade(null);
    setIsLogModalOpen(true);
  };

  const openEditModal = (trade: Trade) => {
    setEditingTrade(trade);
    setIsLogModalOpen(true);
  };

  const navItems = [
    { id: AppTab.Dashboard, label: 'Performance', icon: <Icons.Dashboard /> },
    { id: AppTab.Journal, label: 'Journal', icon: <Icons.Journal /> },
    { id: AppTab.StrategySummary, label: 'Analytics', icon: <Icons.Dashboard /> },
    { id: AppTab.Projection, label: 'Projection', icon: <Icons.Projection /> },
    { id: AppTab.Calendar, label: 'Calendar', icon: <Icons.Calendar /> },
    { id: AppTab.News, label: 'Market News', icon: <Icons.News /> },
    { id: AppTab.Calculator, label: 'Risk Calc', icon: <Icons.Calculator /> },
    { id: AppTab.Accounts, label: 'Portfolios', icon: <Icons.Accounts /> },
  ];

  if (!user) return <Login onLogin={l => { localStorage.setItem('edgeTracker_session_uid', l.id); hydrateUserData(l.id); }} />;

  const filteredTrades = trades.filter(t => t.accountId === selectedAccountId && t.phase === selectedPhase);

  const NavContent = () => (
    <>
      <div className="mb-12 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary-glow"><span className="text-3xl font-black text-white">E</span></div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">EdgeTracker</h1>
      </div>
      <nav className="flex-1 space-y-3">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl font-black transition-all duration-300 ${activeTab === item.id ? 'bg-primary/10 text-primary shadow-sm scale-105' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            {item.icon}{item.label}
          </button>
        ))}
      </nav>
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
        <button onClick={openLogModal} className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary-glow transition-all active:scale-95 uppercase tracking-widest text-xs">LOG PERFORMANCE</button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors relative">
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-8 hidden lg:flex"><NavContent /></aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-12 h-12 flex items-center justify-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg></button>
            <h2 className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex bg-primary/10 text-primary rounded-full px-5 py-2 items-center gap-3 border border-primary/20">
               <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
               <span className="text-xs font-black uppercase tracking-widest">{user.username}</span>
             </div>
             <button onClick={() => setIsSettingsOpen(true)} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-primary transition-all shadow-sm"><Icons.Accounts /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-9 space-y-10">
                {activeTab === AppTab.Dashboard && <Dashboard trades={filteredTrades} account={selectedAccount} selectedPhase={selectedPhase} onPhaseChange={setSelectedPhase} onAdvanceStep={handleAdvanceStep} alerts={behavioralAlert} />}
                {activeTab === AppTab.Journal && <JournalView trades={filteredTrades} onEditTrade={openEditModal} />}
                {activeTab === AppTab.StrategySummary && <StrategySummary trades={filteredTrades} />}
                {activeTab === AppTab.Projection && <PerformanceProjection trades={filteredTrades} account={selectedAccount} />}
                {activeTab === AppTab.Calendar && <CalendarView trades={filteredTrades} />}
                {activeTab === AppTab.News && <NewsView news={news} isCached={false} />}
                {activeTab === AppTab.Calculator && <LotSizeCalculator />}
                {activeTab === AppTab.Accounts && <AccountManagement accounts={accounts} onAddAccount={handleAddAccount} onUpdateAccount={a => setAccounts(accounts.map(acc => acc.id === a.id ? a : acc))} selectedAccountId={selectedAccountId} onSelectAccount={setSelectedAccountId} />}
              </div>
              <div className="lg:col-span-3 space-y-8">
                <AccountSelector accounts={accounts} selectedId={selectedAccountId} onSelect={setSelectedAccountId} />
                <RiskManager trades={filteredTrades} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <TradeLogModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSave={handleSaveTrade} 
        accountId={selectedAccountId} 
        favoriteStrategies={user.favoriteStrategies || []} 
        favoriteModels={user.favoriteEntryModels || []}
        onRegisterStrategy={s => setUser({ ...user, favoriteStrategies: [...(user.favoriteStrategies || []), s] })}
        onRegisterModel={m => setUser({ ...user, favoriteEntryModels: [...(user.favoriteEntryModels || []), m] })}
        initialData={editingTrade}
      />
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} onUpdateUser={setUser} onLogout={() => { localStorage.removeItem('edgeTracker_session_uid'); setUser(null); }} activeAccount={selectedAccount} onUpdateAccount={a => setAccounts(accounts.map(acc => acc.id === a.id ? a : acc))} />
      {selectedAccount && <PhaseCompletionModal isOpen={isPhaseModalOpen} onClose={() => setIsPhaseModalOpen(false)} account={selectedAccount} trades={trades.filter(t => t.accountId === selectedAccountId)} user={user} onAdvanceStep={handleAdvanceStep} />}
    </div>
  );
};

export default App;
