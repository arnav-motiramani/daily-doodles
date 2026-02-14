import React, { useState } from 'react';
import { storageService } from '../services/storageService.ts';
import { User } from '../types.ts';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (user: User) => void;
  onSwitch: (mode: 'login' | 'signup') => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthSuccess, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name || !email || !password) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }
        const user = await storageService.signUp(email, password, name);
        onAuthSuccess(user);
      } else {
        if (!email || !password) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }
        const user = await storageService.signIn(email, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6 bg-white rounded-3xl shadow-xl border border-slate-100 animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Join Daily Doodles'}
        </h2>
        <p className="text-slate-500">
          {mode === 'login' ? 'Continue your journey of reflection.' : 'Start your daily reflection ritual today.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              disabled={isLoading}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              placeholder="E.g. Jane Doe"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            disabled={isLoading}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            disabled={isLoading}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition mt-4 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-slate-500">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
        </span>
        <button 
          onClick={() => onSwitch(mode === 'login' ? 'signup' : 'login')}
          className="ml-1 text-indigo-600 font-bold hover:underline"
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </div>
  );
}; export default Auth;