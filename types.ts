
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  aiInsight?: string;
  tags: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type View = 'home' | 'login' | 'signup' | 'dashboard' | 'editor';
