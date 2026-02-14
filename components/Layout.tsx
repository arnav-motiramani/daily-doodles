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
      <header className="sticky top-0 z-50 px-4 py-4 md:px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate(user ? 'dashboard' : 'home')}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Daily Doodles</span>
        </div>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm text-slate-600">
                Hi, <span className="font-semibold">{user.name}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button onClick={() => onNavigate('login')} className="text-sm font-semibold">Log in</button>
              <button 
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign up
              </button>
            </div>
          )}
        </nav>
      </header>
      
      <main className="flex-grow max-w-5xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="py-8 text-center border-t border-slate-100 text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Daily Doodles. All rights reserved.</p>
      </footer>
    </div>
  );

  function handleLogout() {
    onLogout();
  }
};

export default Layout;