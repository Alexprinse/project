import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables = Database['public']['Tables'];
export type Events = Tables['events']['Row'];
export type Profiles = Tables['profiles']['Row'];
export type Registrations = Tables['registrations']['Row'];
export type Notifications = Tables['notifications']['Row'];