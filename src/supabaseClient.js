import { createClient } from "@supabase/supabase-js";

// Auf https://supabase.com kostenloses Projekt anlegen, dann unter
// Project Settings -> API diese beiden Werte kopieren:
const supabaseUrl = "https://opsbjglkegoyoeqmpxxa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc2JqZ2xrZWdveW9lcW1weHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzE5OTQsImV4cCI6MjEwMDg0Nzk5NH0.Qze_mU2HrdZODkriokRx2g5T03qo-8eccsVs-5Vvl_s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
