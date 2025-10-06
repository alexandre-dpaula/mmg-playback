import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adhvnckxvvkmpemnteep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaHZuY2t4dnZrbXBlbW50ZWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Njk1MjQsImV4cCI6MjA3NTM0NTUyNH0.FbwUJZkNdzLpOnKI9eUV5AfKHrqmI7ESn0CcODmHQYM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);