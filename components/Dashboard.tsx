import React, { useEffect, useState } from 'react';
import { JournalEntry, User } from '../types';
import { storageService } from '../services/storageService';
import { generateJournalPrompt } from '../services/geminiService';

interface DashboardProps {
  user: User;
  onEdit: (entry?: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onEdit, onDelete }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    fetchEntries();
    fetchPrompt();
  }, []);

  const fetchEntries = async () => {
    setLoadingEntries(true);
    const data = await storageService.getEntries(user.id);
    setEntries(data);
    setLoadingEntries(false);
  };

  const fetchPrompt = async () => {
    setLoadingPrompt(true);
    const p = await generateJournalPrompt(user.name);
    setPrompt(p);
    setLoadingPrompt(false);
  };

  const handleEntryDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this reflection?')) {
      await onDelete(id);
      await fetchEntries();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate some simple "Stats"
  const streak = entries.length > 0 ? entries.length : 0;
  const commonMood = entries.length > 0 
    ? entries.reduce((acc, curr) => {
        if (!curr.mood) return acc;
        acc[curr.mood] = (acc[curr.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : null;
  
  const primaryMood = commonMood 
    ? Object.entries(commonMood).sort((a, b) => b[1] - a[1])[0]?.[0] 
    : "Quiet";

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header & Prompt Section */}
      <section className="bg-gradient-to-br from-indigo-50/50 to-white p-8 md:p-10 rounded-[2.5rem] border border-indigo-100/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-600">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-3">Welcome back, {user.name}</h2>
          <div className="min-h-[3rem]">
            {loadingPrompt ? (
              <div className="h-4 w-48 bg-slate-100 animate-pulse rounded"></div>
            ) : (
              <p className="text-slate-500 text-lg md:text-xl italic font-serif leading-relaxed">"{prompt}"</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              onClick={() => onEdit()}
              className="px-8 py-3.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition transform hover:-translate-y-1"
            >
              + Write Today's Page
            </button>
            <button 
              disabled={loadingPrompt}
              onClick={fetchPrompt}
              className="px-8 py-3.5 bg-white text-slate-500 border border-slate-200 rounded-full font-bold text-sm hover:border-indigo-200 hover:text-indigo-600 transition"
            >
              New Inspiration
            </button>
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Reflections</p>
            <p className="text-2xl font-serif font-bold text-slate-800">{entries.length}</p>
          </div>
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Streak</p>
            <p className="text-2xl font-serif font-bold text-slate-800">{streak} Days</p>
          </div>
          <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-50">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Primary Mood</p>
            <p className="text-2xl font-serif font-bold text-indigo-600 capitalize">{primaryMood}</p>
          </div>
          <div className="hidden md:block bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Written</p>
            <p className="text-2xl font-serif font-bold text-slate-800">{formatDate(entries[0].date)}</p>
          </div>
        </div>
      )}

      {/* Entry List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-bold text-slate-800 font-serif">Your Journey</h3>
          {entries.length > 0 && <span className="text-xs text-slate-400 font-medium">{entries.length} memories saved</span>}
        </div>
        
        {loadingEntries ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse h-52"></div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-400 mb-1">Your journal is waiting.</p>
            <button onClick={() => onEdit()} className="text-indigo-600 font-bold hover:underline">Begin your first doodle</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map(entry => (
              <div 
                key={entry.id} 
                className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group cursor-pointer relative"
                onClick={() => onEdit(entry)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {formatDate(entry.date)}
                    </div>
                    {entry.mood && (
                      <span className="bg-indigo-50 text-indigo-600 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryDelete(entry.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-400 transition-all rounded-full hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <h4 className="font-serif font-bold text-slate-800 text-xl mb-2 line-clamp-1">{entry.title || "Untitled Reflection"}</h4>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4 font-serif">
                  {entry.content}
                </p>
                
                {entry.aiInsight && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[11px] italic text-slate-400 leading-relaxed line-clamp-1">"{entry.aiInsight}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;