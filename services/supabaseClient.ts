
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pdncacaonsovcqcgxcrs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmNhY2FvbnNvdmNxY2d4Y3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODgxNTAsImV4cCI6MjA4NjY2NDE1MH0.INIPRcxyT23kZ6eooDQg8xOcefrt5Jml4sFZsPF0Qbk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
