import React, { useState, useEffect } from 'react';
import { View, User, JournalEntry } from './types.ts';
import { storageService } from './services/storageService.ts';
import { supabase } from './services/supabaseClient.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Auth from './components/Auth.tsx';
import Editor from './components/Editor.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await storageService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setView('dashboard');
        }
      } catch (err) {
        console.error("User check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await storageService.getCurrentUser();
        setCurrentUser(user);
        setView('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setView('home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await storageService.signOut();
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleEditEntry = (entry?: JournalEntry) => {
    setActiveEntry(entry);
    setView('editor');
  };

  const handleDeleteEntry = async (id: string) => {
    await storageService.deleteEntry(id);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (view) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-800 mb-6 leading-tight">
              A gentle space <br /> for your thoughts.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Daily Doodles combines a mindful writing experience with AI-powered insights to help you track your mood and find clarity every day.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => setView('signup')}
                className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition transform hover:-translate-y-1"
              >
                Start Journaling
              </button>
              <button 
                onClick={() => setView('login')}
                className="px-10 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition"
              >
                Log In
              </button>
            </div>
            
            <div className="mt-20 w-full max-w-4xl bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200" 
                 alt="Journal preview" 
                 className="w-full h-[400px] rounded-xl object-cover grayscale opacity-80"
               />
            </div>
          </div>
        );
      case 'login':
        return <Auth mode="login" onAuthSuccess={handleAuthSuccess} onSwitch={setView} />;
      case 'signup':
        return <Auth mode="signup" onAuthSuccess={handleAuthSuccess} onSwitch={setView} />;
      case 'dashboard':
        return currentUser ? (
          <Dashboard 
            user={currentUser} 
            onEdit={handleEditEntry} 
            onDelete={handleDeleteEntry}
          />
        ) : null;
      case 'editor':
        return currentUser ? (
          <Editor 
            user={currentUser} 
            entry={activeEntry} 
            onSave={() => setView('dashboard')} 
            onCancel={() => setView('dashboard')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      onNavigate={setView}
    >
      <div className="transition-all duration-300">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;