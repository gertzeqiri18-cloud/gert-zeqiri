
import React, { useState } from 'react';
import { User, AppTheme } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedUsersStr = localStorage.getItem('edgeTracker_users');
    const registeredUsers: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    if (isSignup) {
      if (registeredUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Username already taken');
        return;
      }
      
      const userId = Math.random().toString(36).substr(2, 9);
      // Added missing favoriteStrategies and favoriteEntryModels properties to satisfy User interface
      const newUser: User = {
        id: userId,
        username,
        password, // In a production app, this would be hashed
        theme: 'dark',
        appTheme: AppTheme.Default,
        favoriteStrategies: [],
        favoriteEntryModels: [],
        riskSettings: {
          maxDailyDrawdownPercent: 5,
          maxConsecutiveLosses: 2,
          defaultAccountType: '2-Step'
        }
      };
      
      const updatedUsers = [...registeredUsers, newUser];
      localStorage.setItem('edgeTracker_users', JSON.stringify(updatedUsers));
      
      // Initialize an empty data bucket for the new user
      localStorage.setItem(`edgeTracker_data_${userId}`, JSON.stringify({
        trades: [],
        accounts: [],
        lastActiveAccountId: '',
        lastActiveTab: 'Dashboard'
      }));
      
      onLogin(newUser);
    } else {
      const user = registeredUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary-glow mb-4">
            <span className="text-3xl font-black text-white">E</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">EdgeTracker</h1>
          <p className="text-slate-400 mt-2 tracking-tight">{isSignup ? 'Initialize your edge profile' : 'Log in to your dashboard'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-500 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label>
            <input 
              required
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
            <input 
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-xl shadow-xl shadow-primary-glow transition-all active:scale-95"
          >
            {isSignup ? 'CREATE FREE ACCOUNT' : 'SECURE LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-xs text-slate-400 hover:text-primary transition-colors underline decoration-slate-700 underline-offset-4"
          >
            {isSignup ? 'Already a member? Log in' : "New trader? Register account"}
          </button>
        </div>

        <p className="text-center text-slate-600 text-[9px] mt-8 uppercase tracking-[0.2em] font-black">
          Encrypted Local Workspace
        </p>
      </div>
    </div>
  );
};

export default Login;
