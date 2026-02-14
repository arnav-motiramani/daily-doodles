
import { supabase } from './supabaseClient';
import { User, JournalEntry } from '../types';

export const storageService = {
  // Auth methods
  async signUp(email: string, password: string, name: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Sign up failed');

    // Create a profile record for the name using insert specifically for first-time setup
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: authData.user.id, name });

    if (profileError) {
      console.error('Error creating profile during signup:', profileError);
      // Fallback to upsert if the record somehow already exists
      await supabase.from('profiles').upsert({ id: authData.user.id, name });
    }

    return {
      id: authData.user.id,
      name,
      email: authData.user.email || email
    };
  },

  async signIn(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', authData.user.id)
      .single();

    return {
      id: authData.user.id,
      name: profileData?.name || 'Journaler',
      email: authData.user.email || email
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      name: profileData?.name || 'Journaler',
      email: user.email || ''
    };
  },

  // Database methods
  async getEntries(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      date: item.created_at,
      title: item.title,
      content: item.content,
      mood: item.mood,
      aiInsight: item.ai_insight,
      tags: []
    }));
  },

  async saveEntry(entry: Partial<JournalEntry> & { userId: string }) {
    const payload = {
      user_id: entry.userId,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      ai_insight: entry.aiInsight,
      created_at: entry.date || new Date().toISOString()
    };

    if (entry.id && !entry.id.includes('temp')) {
      const { data, error } = await supabase
        .from('entries')
        .update(payload)
        .eq('id', entry.id)
        .select();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('entries')
        .insert([payload])
        .select();
      if (error) throw error;
      return data;
    }
  },

  async deleteEntry(entryId: string) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId);
    if (error) throw error;
  }
};
