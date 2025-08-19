import { createClient } from '@supabase/supabase-js';

// Your project's specific Supabase URL and public anon key.
const supabaseUrl = 'https://wopdpporlylygxyvpene.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGRwcG9ybHlseWd4eXZwZW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTg0MjIsImV4cCI6MjA2ODY3NDQyMn0.ub5LP_93NcC6wkJbkQWkJ6oBLTKrUNJIiZJosgA9c6Q';

// Create and export the Supabase client.
// This single 'supabase' object will be used throughout your app 
// to interact with your database and authentication.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
