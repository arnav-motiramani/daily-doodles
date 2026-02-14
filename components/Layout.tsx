import React from 'react';
import { User } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="nav-header sticky top-0 z-50 px-4 py-4 md:px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate(user ? 'dashboard' : 'home')}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
            D
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-slate-800">Daily Doodles</span>
        </div>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm text-slate-500 font-medium">
                Hi, <span className="text-slate-800">{user.name}</span>
              </span>
              <button 
                onClick={onLogout}
                className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest text-[10px]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button onClick={() => onNavigate('login')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Log in</button>
              <button 
                onClick={() => onNavigate('signup')}
                className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
              >
                Join
              </button>
            </div>
          )}
        </nav>
      </header>
      
      <main className="flex-grow max-w-5xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="py-12 text-center border-t border-slate-50 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
        <p>© {new Date().getFullYear()} Daily Doodles • Crafted for Clarity</p>
      </footer>
    </div>
  );
};

export default Layout;