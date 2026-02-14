import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry, User } from '../types';
import { storageService } from '../services/storageService';
import { analyzeEntry, connectTranscriptionSession, createAudioBlob } from '../services/geminiService';

interface EditorProps {
  user: User;
  entry?: JournalEntry;
  onSave: () => void;
  onCancel: () => void;
}

const Editor: React.FC<EditorProps> = ({ user, entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState(entry?.mood || "");
  const [insight, setInsight] = useState(entry?.aiInsight || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeEntry(content);
    setMood(result.mood);
    setInsight(result.insight);
    setIsAnalyzing(false);
  };

  const toggleVoiceInput = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const sessionPromise = connectTranscriptionSession({
        onTranscription: (text) => {
          setContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + text);
        },
        onClose: () => setIsRecording(false),
        onError: (err) => {
          console.error("Transcription Error:", err);
          stopRecording();
        }
      });

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createAudioBlob(inputData);
        sessionPromise.then(session => {
          sessionRef.current = session;
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContextRef.current.destination);
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Access Error:", err);
      alert("Please allow microphone access to use voice journaling.");
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsRecording(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    
    try {
      let currentMood = mood;
      let currentInsight = insight;
      
      // Auto-analyze if user hasn't manually clicked analysis
      if (!currentMood || !currentInsight) {
        const result = await analyzeEntry(content);
        currentMood = result.mood;
        currentInsight = result.insight;
      }

      await storageService.saveEntry({
        id: entry?.id,
        userId: user.id,
        date: entry?.date || new Date().toISOString(),
        title: title || "Morning Reflection",
        content,
        mood: currentMood,
        aiInsight: currentInsight
      });
      onSave();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => stopRecording();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn pb-32">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onCancel} className="text-slate-400 hover:text-indigo-600 flex items-center space-x-2 transition-all group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-indigo-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Back to Library</span>
        </button>
        <div className="flex items-center space-x-2">
           <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            {isRecording ? "Listening..." : "Autosave Ready"}
          </span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="space-y-8">
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Page"
          className="w-full text-5xl font-serif font-bold text-slate-800 placeholder-slate-100 focus:outline-none bg-transparent border-none p-0"
        />
        
        <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
          <span className="bg-slate-50 px-3 py-1 rounded-md">
            {entry ? new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {mood && (
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-[9px] border-b-2 border-indigo-100 pb-0.5">
              {mood}
            </span>
          )}
        </div>

        <div className="relative group min-h-[400px]">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your heart saying today? Speak or write..."
            className="w-full h-full min-h-[400px] text-2xl text-slate-700 leading-relaxed placeholder-slate-100 focus:outline-none resize-none bg-transparent selection:bg-indigo-50 font-serif"
          />
          
          {/* Floating Voice Toggle */}
          <button 
            onClick={toggleVoiceInput}
            className={`absolute bottom-0 right-0 p-5 rounded-[2rem] shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-3 ${isRecording ? 'bg-red-500 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:text-indigo-600'}`}
          >
            {isRecording && <span className="text-xs font-bold uppercase tracking-widest">Recording</span>}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>

        {/* Insight Section */}
        {insight && (
          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 animate-fadeIn transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">AI Observation</h5>
            </div>
            <p className="text-slate-600 italic leading-relaxed text-xl font-serif">"{insight}"</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md py-6 border-t border-slate-100 flex justify-center z-40">
        <div className="flex space-x-4 max-w-lg w-full px-4">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content || isSaving}
            className="flex-1 py-4 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition shadow-sm disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Refresh Insights"}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !content}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition disabled:opacity-50"
          >
            {isSaving ? "Preserving Moment..." : "Save Reflection"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;