// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zspxjerjghnruhvelnpk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcHhqZXJqZ2hucnVodmVsbnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDQ1NDMsImV4cCI6MjA2MzI4MDU0M30.miTik4dI2vjgQvmoo2jUmzWDznFFrOeTbmCV-ehNzrw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);