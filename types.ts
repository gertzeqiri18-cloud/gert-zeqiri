
export type TradeOutcome = 'win' | 'loss' | 'pending' | 'be';
export type AccountChallengeType = 'Instant' | '2-Step' | '3-Step' | 'Personal';
export type ImpactLevel = 'low' | 'medium' | 'high';

export enum AppTheme {
  Default = 'default',
  Orange = 'orange',
  Purple = 'purple'
}

export interface User {
  username: string;
  id: string;
  password?: string;
  riskSettings: RiskSettings;
  theme: 'light' | 'dark';
  appTheme: AppTheme;
  favoriteStrategies: string[];
  favoriteEntryModels: string[];
}

export interface RiskSettings {
  maxDailyDrawdownPercent: number;
  maxConsecutiveLosses: number;
  defaultAccountType: AccountChallengeType;
}

export interface Trade {
  id: string;
  date: string;
  symbol: string;
  strategy: string;
  entryModel: string;
  confluences: string[];
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  outcome: TradeOutcome;
  profitAmount: number;
  notes?: string;
  accountId: string;
  phase: number; // 1, 2, 3 for steps, 4 for Funded
  screenshot?: string;
}

export interface StepConfig {
  profitTarget: number;
  dailyDrawdownLimit: number;
}

export interface StepTargets {
  step1: StepConfig;
  step2?: StepConfig;
  step3?: StepConfig;
}

export interface RiskLimits {
  maxLossesPerDay: number;
  maxConsecutiveLosses: number;
  dailyProfitGoal: number;
  maxTradesPerDay: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountChallengeType;
  balance: number;
  startingBalance: number;
  dailyStartingBalance: number; 
  maxDrawdownPercent: number;
  stepTargets: StepTargets;
  currentStep: 1 | 2 | 3;
  lastPassedStep?: number;
  isFunded?: boolean;
  lastResetDate?: string;
  riskLimits: RiskLimits;
}

export interface NewsEvent {
  id: string;
  name: string;
  impact: ImpactLevel;
  time: string;
  currency: string;
  forecast?: string;
  previous?: string;
}

export enum AppTab {
  Dashboard = 'Dashboard',
  Journal = 'Journal',
  StrategySummary = 'Strategy Summary',
  Projection = 'Performance Projection',
  Calendar = 'Calendar',
  Calculator = 'Calculator',
  News = 'News',
  Simulator = 'Simulator',
  Accounts = 'Accounts'
}

export interface AIAdvice {
  recommendation: 'Enter' | 'Avoid' | 'Consider Risk';
  confidence: number;
  reasoning: string;
  riskWarning?: string;
}
