import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mihklosrjxknahyzqudk.supabase.co'; // TODO: Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paGtsb3NyanhrbmFoeXpxdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODMzNDAsImV4cCI6MjA2NTQ1OTM0MH0.2-m8M15h5Fx-wdG-HpyLYMxsr1GS1z4URx8XacGoiMA'; // TODO: Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 